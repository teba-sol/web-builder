export function generateSetupFiles(): Record<string, string> {
  return {
    'app/Support/PublicAsset.php': `<?php

namespace App\\Support;

class PublicAsset
{
    public static function url(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'data:')) {
            return $path;
        }

        if (preg_match('#^https?://#i', $path)) {
            return $path;
        }

        $path = ltrim(str_replace('\\\\', '/', $path), '/');

        if (str_starts_with($path, 'storage/')) {
            return asset($path);
        }

        return asset('storage/' . $path);
    }
}
`,

    'app/Services/DoctorService.php': `<?php

namespace App\\Services;

use Illuminate\\Support\\Facades\\Artisan;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\File;
use Illuminate\\Support\\Facades\\Schema;
use Throwable;

class DoctorService
{
    /**
     * Run Artisan commands in-process via Artisan::call() — no shell/terminal required.
     */
    public function verifyToken(?string $token): bool
    {
        $expected = env('DOCTOR_TOKEN') ?: env('SETUP_TOKEN');
        return $expected && hash_equals($expected, (string) $token);
    }

    public function status(): array
    {
        return [
            'app_key' => $this->checkAppKey(),
            'env_file' => $this->checkEnvFile(),
            'database' => $this->checkDatabase(),
            'migrations' => $this->checkMigrations(),
            'filament_assets' => $this->checkFilamentAssets(),
            'storage_link' => $this->checkStorageLink(),
            'writable_dirs' => $this->checkWritableDirs(),
            'storage_images' => $this->checkStorageImages(),
        ];
    }

    public function run(string $action): array
    {
        return match ($action) {
            'key' => $this->runKey(),
            'migrate' => $this->runMigrate(false),
            'migrate_seed' => $this->runMigrate(true),
            'filament_assets' => $this->runFilamentAssets(),
            'storage_link' => $this->runStorageLink(),
            'cache_clear' => $this->runCacheClear(),
            'all' => $this->runAll(),
            default => ['ok' => false, 'message' => 'Unknown action.'],
        };
    }

    private function checkAppKey(): array
    {
        $ok = ! empty(config('app.key'));
        return ['ok' => $ok, 'label' => 'Application key', 'detail' => $ok ? 'Set' : 'Missing — run Generate Key'];
    }

    private function checkEnvFile(): array
    {
        $ok = file_exists(base_path('.env'));
        return ['ok' => $ok, 'label' => 'Environment file', 'detail' => $ok ? '.env exists' : 'Missing — copy .env.example to .env'];
    }

    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            return ['ok' => true, 'label' => 'Database connection', 'detail' => 'Connected'];
        } catch (Throwable $e) {
            return ['ok' => false, 'label' => 'Database connection', 'detail' => $e->getMessage()];
        }
    }

    private function checkMigrations(): array
    {
        try {
            if (! Schema::hasTable('migrations')) {
                return ['ok' => false, 'label' => 'Database tables', 'detail' => 'Not migrated yet'];
            }
            $pending = Artisan::call('migrate:status', ['--no-ansi' => true]);
            $output = Artisan::output();
            $hasPending = str_contains($output, 'Pending');
            return [
                'ok' => ! $hasPending,
                'label' => 'Database tables',
                'detail' => $hasPending ? 'Pending migrations found' : 'All migrations ran',
            ];
        } catch (Throwable $e) {
            return ['ok' => false, 'label' => 'Database tables', 'detail' => $e->getMessage()];
        }
    }

    private function checkFilamentAssets(): array
    {
        $css = public_path('css/filament/filament/app.css');
        $ok = file_exists($css);
        return [
            'ok' => $ok,
            'label' => 'Filament admin styles',
            'detail' => $ok ? 'Published' : 'Missing — run Publish Filament Assets',
        ];
    }

    private function checkStorageLink(): array
    {
        $link = public_path('storage');
        $ok = file_exists($link);
        return [
            'ok' => $ok,
            'label' => 'Storage symlink',
            'detail' => $ok ? 'Linked — website images will load' : 'Not linked — run Storage Link',
        ];
    }

    private function checkStorageImages(): array
    {
        $dir = storage_path('app/public/assets');
        $count = is_dir($dir) ? count(File::files($dir)) : 0;
        return [
            'ok' => $count > 0,
            'label' => 'Website images',
            'detail' => $count > 0 ? "{$count} images in storage/app/public/assets/" : 'No seeded images found',
        ];
    }

    private function checkWritableDirs(): array
    {
        $dirs = [
            base_path('bootstrap/cache'),
            storage_path('framework/cache'),
            storage_path('framework/sessions'),
            storage_path('framework/views'),
            storage_path('logs'),
            database_path(),
        ];
        $bad = [];
        foreach ($dirs as $dir) {
            if (! is_dir($dir)) {
                File::makeDirectory($dir, 0755, true);
            }
            if (! is_writable($dir)) {
                $bad[] = $dir;
            }
        }
        return [
            'ok' => empty($bad),
            'label' => 'Writable directories',
            'detail' => empty($bad) ? 'All writable' : 'Not writable: ' . implode(', ', $bad),
        ];
    }

    private function runKey(): array
    {
        try {
            Artisan::call('key:generate', ['--force' => true]);
            return ['ok' => true, 'message' => Artisan::output() ?: 'Application key generated.'];
        } catch (Throwable $e) {
            return ['ok' => false, 'message' => $e->getMessage()];
        }
    }

    private function runMigrate(bool $seed): array
    {
        try {
            $params = ['--force' => true];
            if ($seed) {
                $params['--seed'] = true;
            }
            Artisan::call('migrate', $params);
            return ['ok' => true, 'message' => trim(Artisan::output()) ?: 'Migrations complete.'];
        } catch (Throwable $e) {
            return ['ok' => false, 'message' => $e->getMessage()];
        }
    }

    private function runFilamentAssets(): array
    {
        try {
            Artisan::call('filament:assets');
            return ['ok' => true, 'message' => trim(Artisan::output()) ?: 'Filament assets published.'];
        } catch (Throwable $e) {
            return ['ok' => false, 'message' => $e->getMessage()];
        }
    }

    private function runStorageLink(): array
    {
        try {
            Artisan::call('storage:link', ['--force' => true]);
            return ['ok' => true, 'message' => trim(Artisan::output()) ?: 'Storage link created.'];
        } catch (Throwable $e) {
            return ['ok' => false, 'message' => $e->getMessage()];
        }
    }

    private function runCacheClear(): array
    {
        try {
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
            Artisan::call('view:clear');
            return ['ok' => true, 'message' => 'Configuration, cache, and views cleared.'];
        } catch (Throwable $e) {
            return ['ok' => false, 'message' => $e->getMessage()];
        }
    }

    private function runAll(): array
    {
        $steps = [];
        foreach (['key', 'migrate_seed', 'storage_link', 'filament_assets', 'cache_clear'] as $action) {
            $result = $this->run($action);
            $steps[] = strtoupper($action) . ': ' . ($result['ok'] ? 'OK' : 'FAILED — ' . $result['message']);
            if (! $result['ok']) {
                return ['ok' => false, 'message' => implode("\\n", $steps)];
            }
        }
        return ['ok' => true, 'message' => implode("\\n", $steps) . "\\n\\nAll done! Visit / and /admin"];
    }
}
`,

    'app/Http/Controllers/DoctorController.php': `<?php

namespace App\\Http\\Controllers;

use App\\Services\\DoctorService;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Http\\Request;
use Illuminate\\View\\View;

class DoctorController extends Controller
{
    public function __construct(private DoctorService $doctor) {}

    public function index(Request $request): View|JsonResponse
    {
        $token = $request->query('token', '');
        if (! $this->doctor->verifyToken($token)) {
            abort(403, 'Invalid or missing doctor token. Check DOCTOR_TOKEN in your .env file.');
        }

        if ($request->wantsJson()) {
            return response()->json($this->doctor->status());
        }

        $doctorToken = env('DOCTOR_TOKEN') ?: env('SETUP_TOKEN');

        return view('doctor.index', [
            'token' => $token,
            'status' => $this->doctor->status(),
            'doctorToken' => $doctorToken,
            'setupToken' => $doctorToken,
            'lastMessage' => session('doctor_message'),
            'lastOk' => session('doctor_ok'),
        ]);
    }

    public function run(Request $request): JsonResponse|RedirectResponse
    {
        $token = $request->input('token', $request->query('token', ''));
        if (! $this->doctor->verifyToken($token)) {
            if ($request->wantsJson()) {
                return response()->json(['ok' => false, 'message' => 'Invalid doctor token.'], 403);
            }
            abort(403, 'Invalid doctor token.');
        }

        $action = $request->input('action', '');
        $result = $this->doctor->run($action);

        if ($request->wantsJson()) {
            return response()->json([...$result, 'status' => $this->doctor->status()]);
        }

        return redirect()
            ->route('doctor.index', ['token' => $token])
            ->with('doctor_message', $result['message'] ?? 'Done.')
            ->with('doctor_ok', $result['ok'] ?? false);
    }
}
`,

    'resources/views/doctor/index.blade.php': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Site Doctor — WebBuilder</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
  <div class="max-w-3xl mx-auto px-6 py-12">
    <div class="text-center mb-10">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 mb-4">
        <svg class="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      </div>
      <h1 class="text-3xl font-bold">Site Doctor</h1>
      <p class="text-slate-400 mt-2">Diagnose and fix your install from the browser — runs Artisan in PHP, no terminal needed.</p>
    </div>

    <div id="status-cards" class="space-y-3 mb-8">
      @foreach($status as $key => $item)
      <div class="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4" data-status="{{ $key }}">
        <div class="status-icon w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold {{ $item['ok'] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400' }}">
          {{ $item['ok'] ? '✓' : '!' }}
        </div>
        <div class="flex-1">
          <p class="font-medium">{{ $item['label'] }}</p>
          <p class="text-sm text-slate-400 status-detail">{{ $item['detail'] }}</p>
        </div>
      </div>
      @endforeach
    </div>

    @if($lastMessage)
    <div class="rounded-xl border px-5 py-4 mb-6 text-sm font-mono whitespace-pre-wrap {{ $lastOk ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-red-500/30 bg-red-500/10 text-red-200' }}">
      {{ $lastMessage }}
    </div>
    @endif

    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
      <h2 class="font-semibold text-lg mb-4">Prescriptions</h2>
      <div class="grid sm:grid-cols-2 gap-3">
        @foreach([
          ['key', 'Generate App Key'],
          ['migrate_seed', 'Migrate & Seed Database'],
          ['filament_assets', 'Publish Filament Assets (fixes admin styling)'],
          ['storage_link', 'Storage Link (required for images)'],
          ['cache_clear', 'Clear Cache'],
        ] as [$action, $label])
        <form method="POST" action="{{ route('doctor.run', ['token' => $token]) }}">
          <input type="hidden" name="token" value="{{ $token }}" />
          <input type="hidden" name="action" value="{{ $action }}" />
          <button type="submit" class="w-full rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-3 text-sm font-medium transition text-left">{{ $label }}</button>
        </form>
        @endforeach
        <form method="POST" action="{{ route('doctor.run', ['token' => $token]) }}" class="sm:col-span-2">
          <input type="hidden" name="token" value="{{ $token }}" />
          <input type="hidden" name="action" value="all" />
          <button type="submit" class="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-sm font-semibold transition text-left">Run All Recommended Steps</button>
        </form>
      </div>
    </div>

    <div class="mt-8 flex flex-wrap gap-4 justify-center text-sm">
      <a href="/" class="text-indigo-300 hover:text-indigo-200 underline">View Website →</a>
      <a href="/admin" class="text-indigo-300 hover:text-indigo-200 underline">Open Admin →</a>
    </div>

    <p class="text-center text-xs text-slate-500 mt-8">Doctor token: <code class="bg-white/10 px-2 py-0.5 rounded">{{ $doctorToken }}</code></p>
  </div>


</body>
</html>
`,
  }
}

export function generateSetupToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}