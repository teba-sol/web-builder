<?php

// Usage: php scripts/verify-gallery-migration.php <Laravel autoload.php> <create migration> <upgrade migration>
// Runs only against in-memory SQLite databases, never an application's database.
if ($argc !== 4) {
    fwrite(STDERR, "Expected a Laravel autoloader, gallery create migration, and gallery upgrade migration.\n");
    exit(1);
}
require $argv[1];

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\SQLiteConnection;
use Illuminate\Support\Facades\Schema;

function check(bool $condition, string $message): void
{
    if (! $condition) {
        throw new RuntimeException($message);
    }
}

function database(string $create): PDO
{
    $pdo = new PDO('sqlite::memory:', options: [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $connection = new SQLiteConnection($pdo, ':memory:', '', ['driver' => 'sqlite', 'database' => ':memory:']);
    Schema::swap($connection->getSchemaBuilder());
    (require $create)->up();
    return $pdo;
}

// A fresh export must apply both migrations before accepting gallery metadata.
$fresh = database($argv[2]);
(require $argv[3])->up();
$fresh->exec("INSERT INTO gallery_images (title, category, path, sort_order) VALUES ('New room', 'Rooms', 'room.jpg', 0)");
check((int) $fresh->query('SELECT COUNT(*) FROM gallery_images')->fetchColumn() === 1, 'Fresh installation cannot save metadata.');

// Upgrade older databases, including databases from the previous branch version
// that may already contain one or both columns, without deleting existing rows.
foreach ([[], ['title'], ['category'], ['title', 'category']] as $existing) {
    $pdo = database($argv[2]);
    foreach ($existing as $column) {
        Schema::table('gallery_images', function (Blueprint $table) use ($column): void {
            $table->string($column)->nullable();
        });
    }
    $row = ['path' => 'legacy/keep.jpg', 'sort_order' => 7];
    foreach ($existing as $column) {
        $row[$column] = 'Keep '.$column;
    }
    $statement = $pdo->prepare('INSERT INTO gallery_images ('.implode(',', array_keys($row)).') VALUES ('.implode(',', array_fill(0, count($row), '?')).')');
    $statement->execute(array_values($row));

    $upgrade = require $argv[3];
    $upgrade->up();
    $upgrade->up();
    $saved = $pdo->query('SELECT * FROM gallery_images')->fetch(PDO::FETCH_ASSOC);
    check($saved['path'] === 'legacy/keep.jpg' && (int) $saved['sort_order'] === 7, 'Upgrade changed an existing photo.');
    foreach (['title', 'category'] as $column) {
        check(Schema::hasColumn('gallery_images', $column), 'Upgrade did not add '.$column.'.');
        check($saved[$column] === (in_array($column, $existing, true) ? 'Keep '.$column : null), 'Upgrade overwrote '.$column.'.');
    }
    $pdo->exec("INSERT INTO gallery_images (title, category, path, sort_order) VALUES ('New photo', 'Rooms', 'new.jpg', 8)");
    $upgrade->down();
    check(! Schema::hasColumn('gallery_images', 'title') && ! Schema::hasColumn('gallery_images', 'category'), 'Rollback did not remove metadata columns.');
    check((int) $pdo->query('SELECT COUNT(*) FROM gallery_images')->fetchColumn() === 2, 'Rollback deleted gallery rows.');
    $upgrade->up();
    check((int) $pdo->query('SELECT COUNT(*) FROM gallery_images')->fetchColumn() === 2, 'Reapplying the upgrade deleted gallery rows.');
}

echo "ok: gallery migration; fresh install, four legacy/partial schemas, repeat upgrades, rollback, and photo preservation\n";
