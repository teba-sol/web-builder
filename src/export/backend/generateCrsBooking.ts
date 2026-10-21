/**
 * Hotel and guest house exports talk to the Buildaura room API.
 * Guest name, email, and phone stay in this site's database.
 * Buildaura only receives the room, the dates, and the confirmation code.
 */
import type { SiteExportPayload } from './exportPayload'
import { stayPoliciesPartial, stayRequestPhp, staySearchPartial } from './generateBooking'
import { stayPoliciesAdminFiles } from './generateFilament'
import { roomCalendarFiles } from './generateRoomCalendar'

export interface CrsExportCredentials {
  apiBaseUrl: string
  hotelId: string
  apiKey: string
}

export function usesBuildauraCrs(templateId: string): boolean {
  return templateId === 'hotel' || templateId === 'guesthouse'
}

export function crsEnvExample(credentials?: CrsExportCredentials): string {
  const url = (credentials?.apiBaseUrl || 'http://localhost:8080').replace(/\/+$/, '')
  const hotelId = credentials?.hotelId || ''
  const apiKey = credentials?.apiKey || ''
  const note = apiKey
    ? '# Working Buildaura site key. Downloading this website again replaces the previous key.'
    : '# Open this website from Buildaura and download again to receive a working key.'
  return `
${note}
BUILDAURA_API_URL="${url}"
BUILDAURA_HOTEL_ID="${hotelId}"
BUILDAURA_API_KEY="${apiKey}"
`
}

export function crsRouteLines(): string {
  return `
use App\\Http\\Controllers\\BookingController;
use App\\Http\\Controllers\\PropertyController;
Route::get('/rooms', [BookingController::class, 'rooms'])->name('rooms.index');
Route::get('/rooms/{slug}', [BookingController::class, 'showRoom'])->name('rooms.show');
Route::get('/book', [BookingController::class, 'bookForm'])->name('book');
Route::post('/book', [BookingController::class, 'store'])->name('book.store');
Route::get('/book/confirm/{code}', [BookingController::class, 'confirm'])->name('booking.confirm');
Route::redirect('/login', '/admin/login')->name('login');
Route::middleware('auth')->prefix('property')->name('property.')->group(function () {
    Route::post('/room-types', [PropertyController::class, 'storeType'])->name('types.store');
    Route::post('/room-types/{typeId}', [PropertyController::class, 'updateType'])->name('types.update');
    Route::post('/room-types/{typeId}/delete', [PropertyController::class, 'deleteType'])->name('types.delete');
    Route::post('/rooms', [PropertyController::class, 'storeUnit'])->name('units.store');
    Route::post('/rooms/{unitId}', [PropertyController::class, 'updateUnit'])->name('units.update');
    Route::post('/rooms/{unitId}/delete', [PropertyController::class, 'deleteUnit'])->name('units.delete');
    Route::post('/reservations/cancel', [PropertyController::class, 'cancelReservation'])->name('reservations.cancel');
    Route::post('/api-key', [PropertyController::class, 'rotateKey'])->name('api-key.rotate');
});
`
}

export function generateCrsBookingFiles(payload: SiteExportPayload): Record<string, string> {
  if (!usesBuildauraCrs(payload.templateId)) return {}
  const accent = payload.accent
  const files: Record<string, string> = {}
  files['resources/views/partials/stay-policies.blade.php'] = stayPoliciesPartial()
  files['resources/views/partials/stay-search.blade.php'] = staySearchPartial(accent)
  files['app/Support/StayRequest.php'] = stayRequestPhp()
  Object.assign(files, stayPoliciesAdminFiles(false))

  files['config/services.php'] = `<?php

return [
    'buildaura' => [
        'url' => rtrim((string) env('BUILDAURA_API_URL', env('CRS_API_URL', 'http://localhost:8080')), '/'),
        'hotel_id' => env('BUILDAURA_HOTEL_ID', env('CRS_HOTEL_ID')),
        'key' => env('BUILDAURA_API_KEY', env('CRS_API_KEY')),
    ],
];
`

  files['app/Services/BuildauraClient.php'] = `<?php

namespace App\\Services;

use Illuminate\\Support\\Facades\\Http;
use RuntimeException;

class BuildauraClient
{
    public function inventory(): array
    {
        return $this->send('GET', $this->path('/inventory'));
    }

    public function availability(string $checkIn, string $checkOut, ?string $roomTypeId = null): array
    {
        $query = ['checkIn' => $checkIn, 'checkOut' => $checkOut];
        if ($roomTypeId) {
            $query['roomTypeId'] = $roomTypeId;
        }

        return $this->send('GET', $this->path('/availability'), null, $query);
    }

    public function createType(array $payload): array
    {
        return $this->send('POST', $this->path('/room-types'), $payload);
    }

    public function updateType(string $typeId, array $payload): array
    {
        return $this->send('PATCH', $this->path('/room-types/'.$typeId), $payload);
    }

    public function deleteType(string $typeId): array
    {
        return $this->send('DELETE', $this->path('/room-types/'.$typeId));
    }

    public function createUnit(array $payload): array
    {
        return $this->send('POST', $this->path('/units'), $payload);
    }

    public function updateUnit(string $unitId, array $payload): array
    {
        return $this->send('PATCH', $this->path('/units/'.$unitId), $payload);
    }

    public function deleteUnit(string $unitId): array
    {
        return $this->send('DELETE', $this->path('/units/'.$unitId));
    }

    /** Hold a room. The confirmation code is the only reference sent to Buildaura. */
    public function occupy(string $unitId, string $checkIn, string $checkOut, string $confirmationCode): array
    {
        return $this->send('POST', $this->path('/occupancy'), [
            'roomUnitId' => $unitId,
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
            'kind' => 'STAY',
            'externalRef' => $confirmationCode,
        ]);
    }

    public function release(string $blockId): array
    {
        return $this->send('DELETE', $this->path('/occupancy/'.$blockId));
    }

    public function rotateKey(): array
    {
        return $this->send('POST', $this->path('/api-keys'));
    }

    public function uploadImage(string $bytes, string $filename, string $mime): string
    {
        $key = (string) config('services.buildaura.key');
        if ($key === '') {
            throw new RuntimeException('BUILDAURA_API_KEY is missing. Open the site from Buildaura and download it again, or request a new key in admin.');
        }
        $response = Http::timeout(60)
            ->acceptJson()
            ->withHeaders(['X-Api-Key' => $key])
            ->attach('file', $bytes, $filename, ['Content-Type' => $mime])
            ->post(rtrim((string) config('services.buildaura.url'), '/').$this->path('/images'));
        if ($response->failed()) {
            $message = $response->json('message') ?? $response->body();
            throw new RuntimeException(is_string($message) && $message !== '' ? $message : 'Could not store the room photo.');
        }
        $url = $response->json('url');
        if (! is_string($url) || $url === '') {
            throw new RuntimeException('Buildaura did not return a photo URL.');
        }

        return $url;
    }

    private function path(string $suffix): string
    {
        $hotelId = (string) config('services.buildaura.hotel_id');
        if ($hotelId === '') {
            throw new RuntimeException('BUILDAURA_HOTEL_ID is missing. Copy .env.example to .env.');
        }

        return '/api/v1/crs/hotels/'.$hotelId.$suffix;
    }

    private function send(string $method, string $path, ?array $body = null, array $query = []): array
    {
        $key = (string) config('services.buildaura.key');
        if ($key === '') {
            throw new RuntimeException('BUILDAURA_API_KEY is missing. Open the site from Buildaura and download it again, or request a new key in admin.');
        }

        $pending = Http::withHeaders([
            'X-Api-Key' => $key,
            'Accept' => 'application/json',
        ])->baseUrl((string) config('services.buildaura.url'));

        if ($query !== []) {
            $pending = $pending->withQueryParameters($query);
        }

        $response = $body === null
            ? $pending->send($method, $path)
            : $pending->withBody(json_encode($body), 'application/json')->send($method, $path);

        if ($response->status() === 204) {
            return [];
        }
        if ($response->failed()) {
            $message = $response->json('message');
            throw new RuntimeException(is_string($message) && $message !== '' ? $message : 'Buildaura request failed');
        }
        $json = $response->json();

        return is_array($json) ? $json : [];
    }
}
`

  files['database/migrations/0001_01_01_2100_create_guest_reservations_table.php'] = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guest_reservations', function (Blueprint $table) {
            $table->id();
            $table->string('confirmation_code')->unique();
            $table->uuid('crs_block_id')->nullable();
            $table->uuid('room_type_id');
            $table->uuid('room_unit_id');
            $table->string('room_type_name');
            $table->string('room_code');
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedTinyInteger('adults')->default(1);
            $table->unsignedTinyInteger('children')->default(0);
            $table->json('child_ages')->nullable();
            $table->string('guest_name');
            $table->string('guest_email')->nullable();
            $table->string('guest_phone');
            $table->string('status')->default('confirmed');
            $table->decimal('nightly_rate', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->string('currency', 8)->default('USD');
            $table->text('special_requests')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guest_reservations');
    }
};
`

  files['app/Models/GuestReservation.php'] = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class GuestReservation extends Model
{
    protected $fillable = [
        'confirmation_code',
        'crs_block_id',
        'room_type_id',
        'room_unit_id',
        'room_type_name',
        'room_code',
        'check_in',
        'check_out',
        'adults',
        'children',
        'child_ages',
        'guest_name',
        'guest_email',
        'guest_phone',
        'status',
        'nightly_rate',
        'total_price',
        'currency',
        'special_requests',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'child_ages' => 'array',
        'nightly_rate' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];
}
`

  files['app/Http/Controllers/BookingController.php'] = `<?php

namespace App\\Http\\Controllers;

use App\\Models\\GuestReservation;
use App\\Models\\SiteSetting;
use App\\Services\\BuildauraClient;
use App\\Support\\StayRequest;
use Carbon\\Carbon;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Str;
use Illuminate\\View\\View;
use RuntimeException;

class BookingController extends Controller
{
    public function __construct(private BuildauraClient $crs) {}

    public function rooms(): View
    {
        [$types, $error] = $this->activeTypes();

        return view('site.rooms', [
            'settings' => SiteSetting::current(),
            'roomTypes' => $types,
            'apiError' => $error,
        ]);
    }

    public function showRoom(string $slug): View
    {
        [$types] = $this->activeTypes();
        $type = null;
        foreach ($types as $candidate) {
            if (($candidate['slug'] ?? '') === $slug) {
                $type = $candidate;
                break;
            }
        }
        abort_if($type === null, 404);

        return view('site.room-detail', [
            'settings' => SiteSetting::current(),
            'roomType' => $type,
        ]);
    }

    public function bookForm(Request $request): View
    {
        $stay = StayRequest::from($request);
        $roomTypeId = (string) $request->query('room_type_id', '');
        [$types, $error] = $this->activeTypes();
        $results = [];

        if ($stay['searched'] && $error === null) {
            try {
                $availability = $this->crs->availability($stay['checkIn'], $stay['checkOut'], $roomTypeId !== '' ? $roomTypeId : null);
                $nights = max(1, (int) Carbon::parse($stay['checkIn'])->diffInDays(Carbon::parse($stay['checkOut'])));
                foreach ($availability['types'] ?? [] as $row) {
                    $type = $row['roomType'] ?? [];
                    if ($roomTypeId !== '' && ($type['id'] ?? '') !== $roomTypeId) {
                        continue;
                    }
                    if (! $this->fits($type, $stay['adults'], $stay['children'])) {
                        continue;
                    }
                    if ((int) ($row['availableCount'] ?? 0) < 1 || empty($row['units'])) {
                        continue;
                    }
                    $nightly = (float) ($row['nightlyRate'] ?? 0);
                    $results[] = [
                        'type' => $type,
                        'unit' => $row['units'][0],
                        'available' => (int) $row['availableCount'],
                        'nightly' => $nightly,
                        'total' => $nightly * $nights,
                        'nights' => $nights,
                    ];
                }
            } catch (RuntimeException $e) {
                $error = $e->getMessage();
            }
        }

        $messages = $stay['errors'];
        unset($stay['errors']);
        $view = view('site.book', array_merge($stay, [
            'settings' => SiteSetting::current(),
            'roomTypes' => $types,
            'results' => $results,
            'roomTypeId' => $roomTypeId,
            'apiError' => $error,
        ]));
        if ($messages !== []) {
            $view->withErrors($messages);
        }

        return $view;
    }

    public function store(Request $request): RedirectResponse
    {
        $stay = StayRequest::from($request);
        if ($stay['errors'] !== []) {
            return back()->withInput()->withErrors($stay['errors']);
        }
        $validated = $request->validate([
            'room_type_id' => 'required|uuid',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'adults' => 'required|integer|min:1|max:20',
            'children' => 'nullable|integer|min:0|max:10',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'required|string|max:50',
            'special_requests' => 'nullable|string|max:2000',
        ]);

        try {
            $availability = $this->crs->availability(
                $validated['check_in'],
                $validated['check_out'],
                $validated['room_type_id']
            );
        } catch (RuntimeException $e) {
            return back()->withInput()->withErrors(['booking' => $e->getMessage()]);
        }

        $match = null;
        foreach ($availability['types'] ?? [] as $row) {
            if (($row['roomType']['id'] ?? null) === $validated['room_type_id'] && ! empty($row['units'])) {
                $match = $row;
                break;
            }
        }
        if ($match === null) {
            return back()->withInput()->withErrors(['booking' => 'That room is not available for those dates']);
        }

        $unit = $match['units'][0];
        $type = $match['roomType'];
        $code = strtoupper(Str::random(8));

        try {
            $block = $this->crs->occupy($unit['id'], $stay['checkIn'], $stay['checkOut'], $code);
        } catch (RuntimeException $e) {
            return back()->withInput()->withErrors(['booking' => $e->getMessage()]);
        }

        $nights = max(1, (int) Carbon::parse($validated['check_in'])->diffInDays(Carbon::parse($validated['check_out'])));
        $nightly = (float) ($match['nightlyRate'] ?? 0);

        try {
            GuestReservation::create([
                'confirmation_code' => $code,
                'crs_block_id' => $block['id'] ?? null,
                'room_type_id' => $type['id'],
                'room_unit_id' => $unit['id'],
                'room_type_name' => $type['name'] ?? 'Room',
                'room_code' => $unit['code'] ?? '',
                'check_in' => $stay['checkIn'],
                'check_out' => $stay['checkOut'],
                'adults' => $stay['adults'],
                'children' => $stay['children'],
                'child_ages' => array_map('intval', $stay['childAges']),
                'guest_name' => $validated['guest_name'],
                'guest_email' => $validated['guest_email'] ?? null,
                'guest_phone' => $validated['guest_phone'],
                'status' => 'confirmed',
                'nightly_rate' => $nightly,
                'total_price' => $nightly * $nights,
                'currency' => $type['currency'] ?? 'USD',
                'special_requests' => $validated['special_requests'] ?? null,
            ]);
        } catch (\\Throwable $e) {
            if (! empty($block['id'])) {
                try {
                    $this->crs->release($block['id']);
                } catch (\\Throwable $ignored) {
                }
            }

            return back()->withInput()->withErrors(['booking' => 'Could not save the reservation on this website. The room was released.']);
        }

        return redirect()->route('booking.confirm', $code);
    }

    public function confirm(string $code): View
    {
        $reservation = GuestReservation::query()->where('confirmation_code', $code)->firstOrFail();

        return view('site.booking-confirm', [
            'settings' => SiteSetting::current(),
            'reservation' => $reservation,
        ]);
    }

    /** @return array{0: array<int, array<string, mixed>>, 1: ?string} */
    private function activeTypes(): array
    {
        try {
            $inventory = $this->crs->inventory();
            $types = [];
            foreach ($inventory['roomTypes'] ?? [] as $type) {
                if (($type['isActive'] ?? true) === false) {
                    continue;
                }
                $types[] = $type;
            }

            return [$types, null];
        } catch (RuntimeException $e) {
            return [[], $e->getMessage()];
        }
    }

    private function fits(array $type, int $adults, int $children): bool
    {
        $maxAdults = (int) ($type['maxAdults'] ?? 2);
        $maxChildren = (int) ($type['maxChildren'] ?? 0);
        $maxOccupancy = (int) ($type['maxOccupancy'] ?? ($maxAdults + $maxChildren));

        return $adults <= $maxAdults && $children <= $maxChildren && ($adults + $children) <= max(1, $maxOccupancy);
    }
}
`

  files['app/Http/Controllers/PropertyController.php'] = `<?php

namespace App\\Http\\Controllers;

use App\\Models\\GuestReservation;
use App\\Services\\BuildauraClient;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Http\\Request;
use RuntimeException;

class PropertyController extends Controller
{
    public function __construct(private BuildauraClient $crs) {}

    public function storeType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:8',
            'max_adults' => 'nullable|integer|min:1|max:20',
            'max_children' => 'nullable|integer|min:0|max:20',
            'unit_prefix' => 'nullable|string|max:20',
            'unit_count' => 'nullable|integer|min:0|max:50',
        ]);

        return $this->attempt(function () use ($data) {
            $this->crs->createType([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'basePrice' => (float) ($data['base_price'] ?? 0),
                'currency' => $data['currency'] ?? null,
                'maxAdults' => (int) ($data['max_adults'] ?? 2),
                'maxChildren' => (int) ($data['max_children'] ?? 0),
                'maxOccupancy' => (int) ($data['max_adults'] ?? 2) + (int) ($data['max_children'] ?? 0),
                'unitPrefix' => $data['unit_prefix'] ?? null,
                'unitCount' => (int) ($data['unit_count'] ?? 1),
                'isActive' => true,
            ]);
        }, 'Room type saved in Buildaura.');
    }

    public function updateType(Request $request, string $typeId): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:255',
            'base_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:8',
            'max_adults' => 'nullable|integer|min:1|max:20',
            'max_children' => 'nullable|integer|min:0|max:20',
            'max_occupancy' => 'nullable|integer|min:1|max:40',
            'bed_configuration' => 'nullable|string|max:255',
            'size_sqm' => 'nullable|string|max:40',
            'unit_prefix' => 'nullable|string|max:20',
        ]);

        return $this->attempt(function () use ($data, $request, $typeId) {
            $this->crs->updateType($typeId, [
                'name' => $data['name'],
                'slug' => $data['slug'] ?? null,
                'description' => $data['description'] ?? null,
                'shortDescription' => $data['short_description'] ?? null,
                'basePrice' => (float) ($data['base_price'] ?? 0),
                'currency' => $data['currency'] ?? null,
                'maxAdults' => (int) ($data['max_adults'] ?? 2),
                'maxChildren' => (int) ($data['max_children'] ?? 0),
                'maxOccupancy' => (int) ($data['max_occupancy'] ?? 2),
                'bedConfiguration' => $data['bed_configuration'] ?? null,
                'sizeSqm' => $data['size_sqm'] ?? null,
                'unitPrefix' => $data['unit_prefix'] ?? null,
                'isActive' => $request->boolean('is_active'),
            ]);
        }, 'Room type updated in Buildaura.');
    }

    public function deleteType(string $typeId): RedirectResponse
    {
        return $this->attempt(fn () => $this->crs->deleteType($typeId), 'Room type removed from Buildaura.');
    }

    public function storeUnit(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'room_type_id' => 'required|uuid',
            'code' => 'required|string|max:40',
            'floor' => 'nullable|string|max:40',
            'name' => 'nullable|string|max:255',
        ]);

        return $this->attempt(function () use ($data) {
            $payload = [
                'roomTypeId' => $data['room_type_id'],
                'code' => $data['code'],
            ];
            if (! empty($data['floor'])) {
                $payload['floor'] = $data['floor'];
            }
            if (! empty($data['name'])) {
                $payload['name'] = $data['name'];
            }
            $this->crs->createUnit($payload);
        }, 'Room saved in Buildaura.');
    }

    public function updateUnit(Request $request, string $unitId): RedirectResponse
    {
        $data = $request->validate([
            'room_type_id' => 'required|uuid',
            'code' => 'required|string|max:40',
            'floor' => 'nullable|string|max:40',
            'name' => 'nullable|string|max:255',
            'status' => 'required|string|in:AVAILABLE,RESERVED,OCCUPIED,MAINTENANCE,OUT_OF_SERVICE',
        ]);

        return $this->attempt(function () use ($data, $request, $unitId) {
            $this->crs->updateUnit($unitId, [
                'roomTypeId' => $data['room_type_id'],
                'code' => $data['code'],
                'floor' => $data['floor'] ?? '',
                'name' => $data['name'] ?? '',
                'status' => $data['status'],
                'isActive' => $request->boolean('is_active'),
            ]);
        }, 'Room updated in Buildaura.');
    }

    public function deleteUnit(string $unitId): RedirectResponse
    {
        return $this->attempt(fn () => $this->crs->deleteUnit($unitId), 'Room removed from Buildaura.');
    }

    public function cancelReservation(Request $request): RedirectResponse
    {
        $code = $request->validate(['confirmation_code' => 'required|string|max:40'])['confirmation_code'];
        $row = GuestReservation::query()->where('confirmation_code', $code)->firstOrFail();
        if ($row->status !== 'cancelled' && $row->crs_block_id) {
            try {
                $this->crs->release($row->crs_block_id);
            } catch (RuntimeException $e) {
                return back()->with('property_error', $e->getMessage());
            }
        }
        $row->status = 'cancelled';
        $row->save();

        return back()->with('property_message', 'Reservation cancelled. The room status was updated in Buildaura.');
    }

    public function rotateKey(): RedirectResponse
    {
        try {
            $issued = $this->crs->rotateKey();
        } catch (RuntimeException $e) {
            return back()->with('property_error', $e->getMessage());
        }
        $apiKey = (string) ($issued['apiKey'] ?? '');
        if ($apiKey === '') {
            return back()->with('property_error', 'Buildaura did not return a new key.');
        }
        config(['services.buildaura.key' => $apiKey]);
        $skipped = $this->writeKey($apiKey);
        $message = 'A new API key was issued. The previous key no longer works.';
        if ($skipped !== []) {
            $message .= ' Copy it into '.implode(' and ', $skipped).' if those files could not be updated.';
        }

        return back()->with('new_api_key', $apiKey)->with('property_message', $message);
    }

    private function attempt(callable $action, string $success): RedirectResponse
    {
        try {
            $action();
        } catch (RuntimeException $e) {
            return back()->withInput()->with('property_error', $e->getMessage());
        }

        return back()->with('property_message', $success);
    }

    /** @return list<string> */
    private function writeKey(string $apiKey): array
    {
        $skipped = [];
        $line = 'BUILDAURA_API_KEY="'.$apiKey.'"';
        foreach ([base_path('.env'), base_path('.env.example')] as $path) {
            if (! is_file($path) || ! is_writable($path)) {
                $skipped[] = basename($path);
                continue;
            }
            $contents = (string) file_get_contents($path);
            if (preg_match('/^BUILDAURA_API_KEY=.*$/m', $contents)) {
                $contents = (string) preg_replace('/^BUILDAURA_API_KEY=.*$/m', $line, $contents);
            } else {
                $contents = rtrim($contents).PHP_EOL.$line.PHP_EOL;
            }
            file_put_contents($path, $contents);
        }

        return $skipped;
    }
}
`

  files['resources/views/site/rooms.blade.php'] = `@extends('layouts.site')
@section('title', ($settings->rooms_section_title ?? 'Rooms') . ' — ' . $settings->business_name)
@section('content')
<section class="py-16">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold mb-2">{{ $settings->rooms_section_title ?? 'Rooms' }}</h1>
      <p class="text-slate-600">{{ $settings->rooms_section_subtitle }}</p>
      @include('partials.stay-policies')
    </div>
    @if($apiError)
    <p class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">{{ $apiError }}</p>
    @endif
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      @foreach($roomTypes as $type)
      <article class="rounded-2xl border bg-white overflow-hidden shadow-sm">
        @if(!empty($type['image']))
        <a href="{{ route('rooms.show', $type['slug']) }}" class="block"><img src="{{ \\App\\Support\\PublicAsset::url($type['image']) }}" alt="{{ $type['name'] }}" class="aspect-[4/3] w-full object-cover" /></a>
        @else
        <div class="aspect-[4/3] w-full bg-slate-100"></div>
        @endif
        <div class="p-6">
          <h2 class="text-xl font-semibold">{{ $type['name'] }}</h2>
          @if(!empty($type['shortDescription']))<p class="text-sm text-slate-500 mt-1">{{ $type['shortDescription'] }}</p>@endif
          <p class="mt-4 text-lg font-bold" style="color:${accent}">{{ number_format((float) ($type['basePrice'] ?? 0), 0) }} {{ $type['currency'] ?? '' }} <span class="text-sm font-normal text-slate-500">/ night</span></p>
          <div class="mt-4">@include('partials.stay-policies', ['compact' => true])</div>
          <div class="mt-4 flex gap-4 text-sm font-semibold">
            <a href="{{ route('rooms.show', $type['slug']) }}" style="color:${accent}">View details</a>
            <a href="{{ route('book', ['room_type_id' => $type['id']]) }}" class="text-slate-700">Reserve</a>
          </div>
        </div>
      </article>
      @endforeach
    </div>
    @if(empty($roomTypes) && !$apiError)
    <p class="text-center text-slate-500">Rooms will appear here once they are added in the site admin.</p>
    @endif
  </div>
</section>
@endsection
`

  files['resources/views/site/room-detail.blade.php'] = `@extends('layouts.site')
@section('title', ($roomType['name'] ?? 'Room') . ' — ' . $settings->business_name)
@section('content')
<section class="py-16">
  <div class="max-w-3xl mx-auto px-6">
    <a href="{{ route('rooms.index') }}" class="text-sm text-slate-500 hover:underline">All rooms</a>
    @if(!empty($roomType['image']))
    <img src="{{ \\App\\Support\\PublicAsset::url($roomType['image']) }}" alt="{{ $roomType['name'] }}" class="mt-6 aspect-[4/3] w-full rounded-2xl object-cover shadow-lg" />
    @else
    <div class="mt-6 aspect-[4/3] w-full rounded-2xl bg-slate-100"></div>
    @endif
    <h1 class="text-4xl font-bold mt-4 mb-2">{{ $roomType['name'] }}</h1>
    @if(!empty($roomType['shortDescription']))<p class="text-slate-500 mb-4">{{ $roomType['shortDescription'] }}</p>@endif
    <p class="text-2xl font-bold mb-6" style="color:${accent}">{{ number_format((float) ($roomType['basePrice'] ?? 0), 0) }} {{ $roomType['currency'] ?? '' }} <span class="text-base font-normal text-slate-500">/ night</span></p>
    @if(!empty($roomType['description']))<p class="text-slate-700 leading-relaxed mb-6">{{ $roomType['description'] }}</p>@endif
    @include('partials.stay-policies')
    <dl class="grid grid-cols-2 gap-4 text-sm mb-8">
      <div><dt class="text-slate-400">Guests</dt><dd>{{ $roomType['maxAdults'] ?? 2 }} adults · {{ $roomType['maxChildren'] ?? 0 }} children</dd></div>
      @if(!empty($roomType['bedConfiguration']))<div><dt class="text-slate-400">Beds</dt><dd>{{ $roomType['bedConfiguration'] }}</dd></div>@endif
    </dl>
    <a href="{{ route('book', ['room_type_id' => $roomType['id']]) }}" class="inline-block text-white px-8 py-3 rounded-lg font-semibold" style="background-color:${accent}">Check availability and reserve</a>
  </div>
</section>
@endsection
`

  files['resources/views/site/book.blade.php'] = `@extends('layouts.site')
@section('title', ($settings->booking_section_title ?? 'Reserve') . ' — ' . $settings->business_name)
@section('content')
<section class="py-16 bg-slate-50">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold mb-2">{{ $settings->booking_section_title ?? 'Reserve a room' }}</h1>
      <p class="text-slate-600">{{ $settings->booking_section_subtitle ?? 'Choose dates, then leave your name and phone.' }}</p>
      @include('partials.stay-policies')
    </div>
    @if($apiError)
    <p class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">{{ $apiError }}</p>
    @endif
    <div class="mb-10">
      @include('partials.stay-search', ['searchAction' => route('book'), 'checkIn' => $checkIn, 'checkOut' => $checkOut, 'adults' => $adults, 'children' => $children, 'childAges' => $childAges, 'minDate' => $minDate, 'roomTypes' => $roomTypes, 'roomTypeId' => $roomTypeId, 'submitLabel' => 'Search availability'])
    </div>
    @if($errors->any())
    <div class="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3">
      @foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach
    </div>
    @endif
    @if($searched)
      @if(count($results))
      <div class="space-y-6">
        @foreach($results as $row)
        <div class="bg-white rounded-2xl border p-6 flex flex-col md:flex-row gap-6">
          @if(!empty($row['type']['image']))
          <img src="{{ \\App\\Support\\PublicAsset::url($row['type']['image']) }}" alt="" class="aspect-[4/3] w-full rounded-xl object-cover md:w-64" />
          @else
          <div class="aspect-[4/3] w-full rounded-xl bg-slate-100 md:w-64"></div>
          @endif
          <div class="flex-1">
            <h2 class="text-xl font-semibold">{{ $row['type']['name'] }}</h2>
            <p class="text-sm text-emerald-700 mt-2 font-medium">{{ $row['available'] }} available</p>
            <p class="mt-2 font-bold" style="color:${accent}">{{ number_format($row['total'], 0) }} {{ $row['type']['currency'] ?? '' }} <span class="text-sm font-normal text-slate-500">total · {{ $row['nights'] }} nights</span></p>
          </div>
          <form method="POST" action="{{ route('book.store') }}" class="md:w-80 space-y-3">
            @csrf
            <input type="hidden" name="room_type_id" value="{{ $row['type']['id'] }}" />
            <input type="hidden" name="check_in" value="{{ $checkIn }}" />
            <input type="hidden" name="check_out" value="{{ $checkOut }}" />
            <input type="hidden" name="adults" value="{{ $adults }}" />
            <input type="hidden" name="children" value="{{ $children }}" />
            @foreach($childAges as $age)
            <input type="hidden" name="child_ages[]" value="{{ $age }}" />
            @endforeach
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Full name</label>
              <input name="guest_name" required value="{{ old('guest_name') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Email (optional)</label>
              <input type="email" name="guest_email" value="{{ old('guest_email') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
              <input name="guest_phone" required value="{{ old('guest_phone') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Special requests</label>
              <textarea name="special_requests" rows="2" class="w-full rounded-lg border px-3 py-2 text-sm">{{ old('special_requests') }}</textarea>
            </div>
            @include('partials.stay-policies', ['compact' => true])
            <button type="submit" class="w-full text-white px-4 py-2.5 rounded-lg font-semibold text-sm" style="background-color:${accent}">Reserve</button>
          </form>
        </div>
        @endforeach
      </div>
      @else
      <p class="text-center text-slate-600 bg-white border rounded-2xl p-10">No rooms are free for those dates. Try different dates.</p>
      @endif
    @endif
  </div>
</section>
@endsection
`

  files['resources/views/site/booking-confirm.blade.php'] = `@extends('layouts.site')
@section('title', 'Reservation confirmed — ' . $settings->business_name)
@section('content')
<section class="py-20">
  <div class="max-w-xl mx-auto px-6 text-center">
    <h1 class="text-3xl font-bold mb-2">You're reserved</h1>
    <p class="text-slate-600 mb-8">Your contact details stay on this website. The room is now marked reserved in Buildaura.</p>
    <div class="bg-slate-50 border rounded-2xl p-6 text-left space-y-3">
      <div class="flex justify-between gap-4"><span class="text-slate-500">Confirmation</span><span class="font-mono font-bold tracking-wider">{{ $reservation->confirmation_code }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Room</span><span>{{ $reservation->room_type_name }} · {{ $reservation->room_code }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Check-in</span><span>{{ $reservation->check_in->format('M j, Y') }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Check-out</span><span>{{ $reservation->check_out->format('M j, Y') }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Guests</span><span>{{ $reservation->adults }} adults{{ $reservation->children ? ' · '.$reservation->children.' children'.((is_array($reservation->child_ages) && count($reservation->child_ages)) ? ' ('.collect($reservation->child_ages)->map(fn ($age) => $age.'y')->implode(', ').')' : '') : '' }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Guest</span><span>{{ $reservation->guest_name }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Phone</span><span>{{ $reservation->guest_phone }}</span></div>
      @if($reservation->guest_email)<div class="flex justify-between gap-4"><span class="text-slate-500">Email</span><span>{{ $reservation->guest_email }}</span></div>@endif
      <div class="flex justify-between gap-4 border-t pt-3"><span class="text-slate-500">Total</span><span class="font-bold" style="color:${accent}">{{ number_format($reservation->total_price, 0) }} {{ $reservation->currency }}</span></div>
    </div>
    @include('partials.stay-policies')
    <a href="{{ route('home') }}" class="inline-block mt-8 text-sm font-semibold" style="color:${accent}">Back to home</a>
  </div>
</section>
@endsection
`

  const flash = `@if($errors->any())<div style="margin-bottom:12px;padding:12px;border:1px solid #fecaca;background:#fef2f2;color:#991b1b">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
@if(session('property_error'))<p style="margin-bottom:12px;padding:12px;border:1px solid #fecaca;background:#fef2f2;color:#991b1b">{{ session('property_error') }}</p>@endif
@if(session('property_message'))<p style="margin-bottom:12px;padding:12px;border:1px solid #bbf7d0;background:#f0fdf4;color:#166534">{{ session('property_message') }}</p>@endif`

  files['app/Filament/Pages/RoomTypes.php'] = `<?php

namespace App\\Filament\\Pages;

use App\\Services\\BuildauraClient;
use Filament\\Actions\\Action;
use Filament\\Forms\\Components\\FileUpload;
use Filament\\Forms\\Components\\Select;
use Filament\\Forms\\Components\\Textarea;
use Filament\\Forms\\Components\\TextInput;
use Filament\\Forms\\Components\\Toggle;
use Filament\\Notifications\\Notification;
use Filament\\Pages\\Page;
use Illuminate\\Support\\Facades\\Storage;
use RuntimeException;

class RoomTypes extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationLabel = 'Room types';
    protected static ?string $title = 'Room types';
    protected static string $view = 'filament.pages.room-types';

    public ?array $filters = [
        'search' => '',
        'parent' => '',
        'active' => '',
        'sort' => 'sortOrder',
    ];

    public ?string $editingTypeId = null;

    protected array $inventoryCache = [];

    /** @var array<string, string> */
    protected array $images = [];

    protected ?string $inventoryError = null;

    protected function getForms(): array
    {
        return [];
    }

    public function getSubheading(): ?string
    {
        return 'Room types and photos are saved in Buildaura. This website does not store them.';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('addType')
                ->label('Add room type')
                ->slideOver()
                ->modalSubmitActionLabel('Save to Buildaura')
                ->mountUsing(function (): void {
                    $this->editingTypeId = null;
                })
                ->form($this->typeForm(true))
                ->action(function (array $data): void {
                    $this->guard(fn () => $this->saveType($data, null));
                }),
        ];
    }

    public function editTypeAction(): Action
    {
        return Action::make('editType')
            ->label('Edit')
            ->button()
            ->outlined()
            ->size('sm')
            ->color('gray')
            ->slideOver()
            ->modalHeading('Edit room type')
            ->modalSubmitActionLabel('Save to Buildaura')
            ->mountUsing(function (array $arguments): void {
                $this->editingTypeId = (string) ($arguments['typeId'] ?? '');
            })
            ->fillForm(function (array $arguments): array {
                $type = $this->findType((string) ($arguments['typeId'] ?? ''));

                return $type ? $this->typeState($type) : [];
            })
            ->form($this->typeForm(false))
            ->action(function (array $arguments, array $data): void {
                $this->guard(function () use ($arguments, $data) {
                    $type = $this->findType((string) ($arguments['typeId'] ?? ''));
                    if (! $type) {
                        throw new RuntimeException('That room type is no longer in Buildaura.');
                    }
                    $this->saveType($data, $type);
                });
            });
    }

    public function deleteTypeAction(): Action
    {
        return Action::make('deleteType')
            ->label('Delete')
            ->button()
            ->outlined()
            ->size('sm')
            ->color('danger')
            ->requiresConfirmation()
            ->modalHeading('Delete room type')
            ->modalDescription('This removes the room type and its rooms from Buildaura.')
            ->action(function (array $arguments): void {
                $this->guard(function () use ($arguments) {
                    app(BuildauraClient::class)->deleteType((string) ($arguments['typeId'] ?? ''));
                    $this->inventoryCache = [];
                    $this->inventory();
                    Notification::make()->title('Room type deleted from Buildaura')->success()->send();
                });
            });
    }

    public function imageFor(string $typeId): ?string
    {
        return $this->images[$typeId] ?? null;
    }

    public function clearTypeFilters(): void
    {
        $this->filters = [
            'search' => '',
            'parent' => '',
            'active' => '',
            'sort' => 'sortOrder',
        ];
    }

    public function typeFiltersActive(): bool
    {
        return $this->filterText('search') !== ''
            || $this->filterText('parent') !== ''
            || $this->filterText('active') !== '';
    }

    public function getViewData(): array
    {
        $inventory = $this->inventory();

        return [
            'types' => $this->visibleTypes($inventory['roomTypes'] ?? []),
            'units' => $inventory['units'] ?? [],
            'error' => $this->inventoryError,
        ];
    }

    public function filterParentOptions(): array
    {
        $options = [];
        foreach ($this->inventory()['roomTypes'] ?? [] as $type) {
            if (! is_array($type) || empty($type['id'])) {
                continue;
            }
            $options[(string) $type['id']] = (string) ($type['name'] ?? $type['id']);
        }

        return $options;
    }

    private function inventory(): array
    {
        if ($this->inventoryCache !== []) {
            return $this->inventoryCache;
        }
        try {
            $loaded = app(BuildauraClient::class)->inventory();
            $this->images = [];
            $types = [];
            foreach (($loaded['roomTypes'] ?? []) as $type) {
                if (! is_array($type)) {
                    continue;
                }
                $image = $type['image'] ?? null;
                if (is_string($image) && str_starts_with($image, 'data:')) {
                    $this->images[(string) ($type['id'] ?? '')] = $image;
                    $type['image'] = null;
                    $type['hasInlineImage'] = true;
                } else {
                    $type['hasInlineImage'] = false;
                }
                $types[] = $type;
            }
            if (! is_array($loaded)) {
                $loaded = [];
            }
            $loaded['roomTypes'] = $types;
            $this->inventoryCache = $loaded;
            $this->inventoryError = null;
        } catch (RuntimeException $e) {
            $this->images = [];
            $this->inventoryCache = ['roomTypes' => []];
            $this->inventoryError = $e->getMessage();
        }

        return $this->inventoryCache;
    }

    private function filterText(string $key): string
    {
        $value = $this->filters[$key] ?? null;

        return is_scalar($value) ? trim((string) $value) : '';
    }

    private function visibleTypes(array $all): array
    {
        $needle = mb_strtolower($this->filterText('search'));
        $parentFilter = $this->filterText('parent');
        $activeFilter = $this->filterText('active');
        $types = [];
        foreach ($all as $type) {
            if (! is_array($type)) {
                continue;
            }
            if ($parentFilter !== '') {
                $id = (string) ($type['id'] ?? '');
                $parent = (string) ($type['parentId'] ?? '');
                if ($id !== $parentFilter && $parent !== $parentFilter) {
                    continue;
                }
            }
            $active = (bool) ($type['isActive'] ?? true);
            if ($activeFilter === '1' && ! $active) {
                continue;
            }
            if ($activeFilter === '0' && $active) {
                continue;
            }
            if ($needle !== '') {
                $haystack = mb_strtolower(trim(implode(' ', [
                    (string) ($type['name'] ?? ''),
                    (string) ($type['slug'] ?? ''),
                    (string) ($type['shortDescription'] ?? ''),
                    (string) ($type['description'] ?? ''),
                ])));
                if (! str_contains($haystack, $needle)) {
                    continue;
                }
            }
            $types[] = $type;
        }
        $sort = $this->filterText('sort');
        if ($sort === '') {
            $sort = 'sortOrder';
        }
        usort($types, function (array $a, array $b) use ($sort): int {
            $name = strcasecmp((string) ($a['name'] ?? ''), (string) ($b['name'] ?? ''));
            $price = ((float) ($a['basePrice'] ?? 0)) <=> ((float) ($b['basePrice'] ?? 0));
            $order = ((int) ($a['sortOrder'] ?? 0)) <=> ((int) ($b['sortOrder'] ?? 0));

            return match ($sort) {
                'name' => $name,
                'name_desc' => -$name,
                'price' => $price !== 0 ? $price : $name,
                'price_desc' => ($price !== 0 ? -$price : $name),
                default => $order !== 0 ? $order : $name,
            };
        });

        return $types;
    }

    private function findType(string $id): ?array
    {
        foreach ($this->inventory()['roomTypes'] ?? [] as $type) {
            if ((string) ($type['id'] ?? '') === $id) {
                return $type;
            }
        }

        return null;
    }

    private function saveType(array $data, ?array $existing): void
    {
        $payload = [
            'name' => trim((string) ($data['name'] ?? '')),
            'slug' => filled($data['slug'] ?? null) ? trim((string) $data['slug']) : null,
            'description' => (string) ($data['description'] ?? ''),
            'shortDescription' => (string) ($data['shortDescription'] ?? ''),
            'basePrice' => is_numeric($data['basePrice'] ?? null) ? (float) $data['basePrice'] : 0,
            'currency' => filled($data['currency'] ?? null) ? strtoupper(trim((string) $data['currency'])) : 'ETB',
            'maxAdults' => (int) ($data['maxAdults'] ?? 2),
            'maxChildren' => (int) ($data['maxChildren'] ?? 0),
            'maxOccupancy' => (int) ($data['maxOccupancy'] ?? 2),
            'bedConfiguration' => (string) ($data['bedConfiguration'] ?? ''),
            'sizeSqm' => (string) ($data['sizeSqm'] ?? ''),
            'amenities' => $this->amenities($data['amenities'] ?? ''),
            'image' => $this->storedImage($data, $existing),
            'unitPrefix' => filled($data['unitPrefix'] ?? null) ? trim((string) $data['unitPrefix']) : 'RM-',
            'isActive' => (bool) ($data['isActive'] ?? true),
            'sortOrder' => $existing === null
                ? ((int) collect($this->inventory()['roomTypes'] ?? [])->max('sortOrder')) + 1
                : (int) ($existing['sortOrder'] ?? 0),
        ];
        $parentId = trim((string) ($data['parentId'] ?? ''));
        if ($parentId !== '' && ($existing === null || $parentId !== (string) ($existing['id'] ?? ''))) {
            $payload['parentId'] = $parentId;
        }
        $crs = app(BuildauraClient::class);
        if ($existing === null) {
            $payload['unitCount'] = max(0, (int) ($data['unitCount'] ?? 1));
            $crs->createType($payload);
            $title = 'Room type created in Buildaura';
        } else {
            $crs->updateType((string) $existing['id'], $payload);
            $title = 'Room type updated in Buildaura';
        }
        $this->inventoryCache = [];
        $this->inventory();
        Notification::make()->title($title)->success()->send();
    }

    private function typeForm(bool $creating): array
    {
        $fields = [
            TextInput::make('name')->required()->maxLength(120),
            TextInput::make('slug')->maxLength(160)->helperText('Leave blank to build it from the name.'),
            Select::make('parentId')
                ->label('Parent type')
                ->options(fn () => $this->parentOptions())
                ->searchable()
                ->placeholder($creating ? 'None (top-level)' : 'Keep current parent'),
            TextInput::make('shortDescription')->label('Short description')->maxLength(240),
            Textarea::make('description')->rows(3),
            TextInput::make('basePrice')->label('Nightly price')->numeric()->default(0)->required(),
            TextInput::make('currency')->default('ETB')->maxLength(3)->required(),
            TextInput::make('maxAdults')->numeric()->default(2)->required()->minValue(1),
            TextInput::make('maxChildren')->numeric()->default(0)->required()->minValue(0),
            TextInput::make('maxOccupancy')->numeric()->default(2)->required()->minValue(1),
            TextInput::make('bedConfiguration')->label('Beds'),
            TextInput::make('sizeSqm')->label('Size (m²)'),
            Textarea::make('amenities')->helperText('Comma-separated. Example: Wi-Fi, Breakfast, City view'),
            TextInput::make('unitPrefix')->label('Room number prefix')->default('RM-'),
            Toggle::make('isActive')->label('Active')->default(true),
            FileUpload::make('photo')
                ->label('Room photo')
                ->disk('local')
                ->directory('crs-uploads')
                ->visibility('private')
                ->image()
                ->imageEditor()
                ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
                ->maxSize(5120)
                ->helperText('JPEG, PNG, WebP, or GIF up to 5 MB.'),
            Toggle::make('clearImage')->label('Remove current photo')->default(false),
        ];
        if ($creating) {
            $fields[] = TextInput::make('unitCount')->label('Rooms to create')->numeric()->default(1)->minValue(0);
        }

        return $fields;
    }

    private function typeState(array $type): array
    {
        $amenities = $type['amenities'] ?? [];

        return [
            'name' => $type['name'] ?? '',
            'slug' => $type['slug'] ?? '',
            'parentId' => $type['parentId'] ?? null,
            'shortDescription' => $type['shortDescription'] ?? '',
            'description' => $type['description'] ?? '',
            'basePrice' => $type['basePrice'] ?? 0,
            'currency' => $type['currency'] ?? 'ETB',
            'maxAdults' => $type['maxAdults'] ?? 2,
            'maxChildren' => $type['maxChildren'] ?? 0,
            'maxOccupancy' => $type['maxOccupancy'] ?? 2,
            'bedConfiguration' => $type['bedConfiguration'] ?? '',
            'sizeSqm' => $type['sizeSqm'] ?? '',
            'amenities' => is_array($amenities) ? implode(', ', $amenities) : (string) $amenities,
            'unitPrefix' => $type['unitPrefix'] ?? 'RM-',
            'isActive' => (bool) ($type['isActive'] ?? true),
        ];
    }

    private function parentOptions(): array
    {
        $options = [];
        foreach ($this->inventory()['roomTypes'] ?? [] as $type) {
            $id = (string) ($type['id'] ?? '');
            if ($id === '' || $id === (string) $this->editingTypeId) {
                continue;
            }
            $options[$id] = $type['name'] ?? $id;
        }

        return $options;
    }

    private function amenities(mixed $value): array
    {
        $parts = array_map('trim', explode(',', (string) $value));

        return array_values(array_filter($parts, fn ($part) => $part !== ''));
    }

    private function storedImage(array $data, ?array $existing): string
    {
        $uploaded = $this->readUpload($data['photo'] ?? null);
        if ($uploaded !== null) {
            return $uploaded;
        }
        if (! empty($data['clearImage'])) {
            return '';
        }
        if ($existing === null) {
            return '';
        }
        if (! empty($existing['hasInlineImage'])) {
            $kept = $this->images[(string) ($existing['id'] ?? '')] ?? null;
            if (! is_string($kept) || $kept === '') {
                throw new RuntimeException('The current photo could not be loaded. Try again before saving.');
            }

            return $kept;
        }
        $image = $existing['image'] ?? '';

        return is_string($image) ? $image : '';
    }

    private function readUpload(mixed $upload): ?string
    {
        if (is_array($upload)) {
            $upload = $upload[0] ?? null;
        }
        if (! is_string($upload) || $upload === '' || str_contains($upload, '..')) {
            return null;
        }
        if (! str_starts_with($upload, 'crs-uploads/') && ! str_starts_with($upload, 'livewire-tmp/')) {
            return null;
        }
        $disk = Storage::disk('local');
        if (! $disk->exists($upload)) {
            return null;
        }
        $bytes = $disk->get($upload);
        $mime = $disk->mimeType($upload) ?: '';
        if ($mime === 'image/jpg') {
            $mime = 'image/jpeg';
        }
        if (! is_string($bytes) || $bytes === '') {
            return null;
        }
        if (strlen($bytes) > 5 * 1024 * 1024) {
            throw new RuntimeException('Room photo must be 5 MB or smaller.');
        }
        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (! in_array($mime, $allowed, true)) {
            throw new RuntimeException('Upload a JPEG, PNG, WebP, or GIF photo.');
        }
        $ext = match ($mime) {
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            default => 'jpg',
        };
        $url = app(BuildauraClient::class)->uploadImage($bytes, 'room-photo.'.$ext, $mime);
        $disk->delete($upload);

        return $url;
    }

    private function guard(callable $callback): void
    {
        try {
            $callback();
        } catch (\\Filament\\Support\\Exceptions\\Halt $halt) {
            throw $halt;
        } catch (\\Throwable $e) {
            Notification::make()->title('Buildaura could not save that change')->body($e->getMessage())->danger()->send();
            throw new \\Filament\\Support\\Exceptions\\Halt();
        }
    }
}
`

  files['resources/views/filament/pages/room-types.blade.php'] = `<x-filament-panels::page>
@if($error)
  <div style="margin-bottom:16px;padding:12px 14px;border:1px solid #fecaca;border-radius:8px;color:#991b1b;font-size:14px;">
    {{ $error }}
    <div style="margin-top:6px;color:#6b7280;">Room types are stored in Buildaura. This page calls that API with this site's key.</div>
  </div>
@endif
<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;align-items:end;margin-bottom:24px;">
  <x-filament-forms::field-wrapper label="Search">
    <x-filament::input.wrapper>
      <x-filament::input type="search" placeholder="Name, slug, description" wire:model.live.debounce.300ms="filters.search" />
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <x-filament-forms::field-wrapper label="Parent type">
    <x-filament::input.wrapper>
      <x-filament::input.select wire:model.live="filters.parent">
        <option value="">All types</option>
        @foreach($this->filterParentOptions() as $id => $name)
          <option value="{{ $id }}">{{ $name }}</option>
        @endforeach
      </x-filament::input.select>
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <x-filament-forms::field-wrapper label="Active">
    <x-filament::input.wrapper>
      <x-filament::input.select wire:model.live="filters.active">
        <option value="">Any</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </x-filament::input.select>
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <x-filament-forms::field-wrapper label="Sort">
    <x-filament::input.wrapper>
      <x-filament::input.select wire:model.live="filters.sort">
        <option value="sortOrder">Sort order</option>
        <option value="name">Name</option>
        <option value="name_desc">Name (Z–A)</option>
        <option value="price">Price</option>
        <option value="price_desc">Price (high)</option>
      </x-filament::input.select>
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <div>
    <x-filament::button color="gray" size="sm" type="button" style="width:100%" wire:click="clearTypeFilters">Clear</x-filament::button>
  </div>
</div>
<x-filament::section>
  <div style="overflow-x:auto;">
    <table style="width:100%;min-width:720px;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Photo</th>
          <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Room type</th>
          <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;white-space:nowrap;">Price</th>
          <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Occupancy</th>
          <th style="text-align:right;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Actions</th>
        </tr>
      </thead>
      <tbody>
        @forelse($types as $type)
          @php
            $preview = $type['image'] ?? null;
            if (empty($preview) && ! empty($type['hasInlineImage'])) {
                $preview = $this->imageFor((string) ($type['id'] ?? ''));
            }
            $roomCount = 0;
            foreach ($units as $candidate) {
                if (($candidate['roomTypeId'] ?? null) === ($type['id'] ?? null)) {
                    $roomCount++;
                }
            }
            $summary = (string) ($type['shortDescription'] ?? '');
            if ($summary === '' && ! empty($type['description'])) {
                $summary = \\Illuminate\\Support\\Str::limit((string) $type['description'], 140);
            }
          @endphp
          <tr wire:key="type-{{ $type['id'] }}" style="border-top:1px solid #e5e7eb;">
            <td style="padding:10px;vertical-align:middle;width:88px;">
              @if($preview)
                <img src="{{ \\App\\Support\\PublicAsset::url($preview) }}" alt="" style="width:72px;height:52px;object-fit:cover;border-radius:6px;display:block;" />
              @else
                <div style="width:72px;height:52px;border-radius:6px;background:#f3f4f6;"></div>
              @endif
            </td>
            <td style="padding:10px;vertical-align:middle;white-space:normal;word-break:normal;overflow-wrap:break-word;">
              <div style="font-weight:600;">{{ $type['name'] ?? '' }}</div>
              @if($summary !== '')
                <div style="margin-top:2px;font-size:13px;color:#4b5563;white-space:normal;word-break:normal;overflow-wrap:break-word;">{{ $summary }}</div>
              @endif
            </td>
            <td style="padding:10px;vertical-align:middle;white-space:nowrap;">{{ number_format((float) ($type['basePrice'] ?? 0), 0) }} {{ $type['currency'] ?? 'ETB' }}</td>
            <td style="padding:10px;vertical-align:middle;white-space:normal;word-break:normal;">
              {{ (int) ($type['maxAdults'] ?? 2) }} adults · {{ (int) ($type['maxChildren'] ?? 0) }} children
              · {{ $roomCount }} {{ $roomCount === 1 ? 'room' : 'rooms' }}
              @if(! empty($type['sizeSqm']))
                · {{ $type['sizeSqm'] }} m²
              @endif
            </td>
            <td style="padding:10px;vertical-align:middle;white-space:nowrap;text-align:right;">
              <div style="display:flex;gap:8px;justify-content:flex-end;">
                {{ ($this->editTypeAction)(['typeId' => $type['id']]) }}
                {{ ($this->deleteTypeAction)(['typeId' => $type['id']]) }}
              </div>
            </td>
          </tr>
        @empty
          <tr>
            <td colspan="5" style="padding:16px 10px;color:#6b7280;font-size:14px;">@if($this->typeFiltersActive())No room types match these filters.@else No room types yet. Add one to create it in Buildaura.@endif</td>
          </tr>
        @endforelse
      </tbody>
    </table>
  </div>
</x-filament::section>
</x-filament-panels::page>
`

  files['app/Filament/Pages/Rooms.php'] = `<?php

namespace App\\Filament\\Pages;

use App\\Services\\BuildauraClient;
use Filament\\Actions\\Action;
use Filament\\Forms\\Components\\Select;
use Filament\\Forms\\Components\\Textarea;
use Filament\\Forms\\Components\\TextInput;
use Filament\\Forms\\Components\\Toggle;
use Filament\\Notifications\\Notification;
use Filament\\Pages\\Page;
use RuntimeException;

class Rooms extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-key';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationLabel = 'Rooms';
    protected static ?string $title = 'Rooms';
    protected static string $view = 'filament.pages.rooms';

    public ?array $filters = [
        'search' => '',
        'roomType' => '',
        'status' => '',
        'sort' => 'code',
    ];

    protected array $inventoryCache = [];

    protected ?string $inventoryError = null;

    protected function getForms(): array
    {
        return [];
    }

    public function clearUnitFilters(): void
    {
        $this->filters = [
            'search' => '',
            'roomType' => '',
            'status' => '',
            'sort' => 'code',
        ];
    }

    public function unitFiltersActive(): bool
    {
        return $this->filterText('search') !== ''
            || $this->filterText('roomType') !== ''
            || $this->filterText('status') !== '';
    }

    public function getViewData(): array
    {
        $inventory = $this->inventory();
        $types = $inventory['roomTypes'] ?? [];

        return [
            'types' => $types,
            'units' => $this->visibleUnits($inventory['units'] ?? [], $types),
            'error' => $this->inventoryError,
        ];
    }

    public function roomTypeOptions(): array
    {
        $options = [];
        foreach ($this->inventory()['roomTypes'] ?? [] as $type) {
            if (! is_array($type) || empty($type['id'])) {
                continue;
            }
            $options[(string) $type['id']] = (string) ($type['name'] ?? $type['id']);
        }

        return $options;
    }

    private function inventory(): array
    {
        if ($this->inventoryCache !== []) {
            return $this->inventoryCache;
        }
        try {
            $loaded = app(BuildauraClient::class)->inventory();
            $this->inventoryCache = is_array($loaded) && $loaded !== [] ? $loaded : ['roomTypes' => [], 'units' => []];
            $this->inventoryError = null;
        } catch (RuntimeException $e) {
            $this->inventoryCache = ['roomTypes' => [], 'units' => []];
            $this->inventoryError = $e->getMessage();
        }

        return $this->inventoryCache;
    }

    private function filterText(string $key): string
    {
        $value = $this->filters[$key] ?? null;

        return is_scalar($value) ? trim((string) $value) : '';
    }

    private function visibleUnits(array $units, array $types): array
    {
        $names = [];
        foreach ($types as $type) {
            if (is_array($type) && ! empty($type['id'])) {
                $names[(string) $type['id']] = (string) ($type['name'] ?? '');
            }
        }
        $needle = mb_strtolower($this->filterText('search'));
        $typeFilter = $this->filterText('roomType');
        $statusFilter = $this->filterText('status');
        $visible = [];
        foreach ($units as $unit) {
            if (! is_array($unit)) {
                continue;
            }
            if ($typeFilter !== '' && (string) ($unit['roomTypeId'] ?? '') !== $typeFilter) {
                continue;
            }
            if ($statusFilter !== '' && (string) ($unit['status'] ?? '') !== $statusFilter) {
                continue;
            }
            if ($needle !== '') {
                $haystack = mb_strtolower(trim(implode(' ', [
                    (string) ($unit['code'] ?? ''),
                    (string) ($unit['name'] ?? ''),
                    (string) ($unit['floor'] ?? ''),
                    (string) ($unit['notes'] ?? ''),
                ])));
                if (! str_contains($haystack, $needle)) {
                    continue;
                }
            }
            $visible[] = $unit;
        }
        $sort = $this->filterText('sort');
        if ($sort === '') {
            $sort = 'code';
        }
        usort($visible, function (array $a, array $b) use ($sort, $names): int {
            $code = strcasecmp((string) ($a['code'] ?? ''), (string) ($b['code'] ?? ''));
            $name = strcasecmp((string) ($a['name'] ?? ''), (string) ($b['name'] ?? ''));
            $floor = strcasecmp((string) ($a['floor'] ?? ''), (string) ($b['floor'] ?? ''));
            $status = strcasecmp((string) ($a['status'] ?? ''), (string) ($b['status'] ?? ''));
            $type = strcasecmp($names[(string) ($a['roomTypeId'] ?? '')] ?? '', $names[(string) ($b['roomTypeId'] ?? '')] ?? '');

            return match ($sort) {
                'code_desc' => -$code,
                'name' => $name !== 0 ? $name : $code,
                'floor' => $floor !== 0 ? $floor : $code,
                'status' => $status !== 0 ? $status : $code,
                'type' => $type !== 0 ? $type : $code,
                default => $code,
            };
        });

        return $visible;
    }

    public function getSubheading(): ?string
    {
        return 'Rooms are saved in Buildaura. This website does not store them.';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('addUnit')
                ->label('Add room')
                ->slideOver()
                ->modalSubmitActionLabel('Save to Buildaura')
                ->form($this->unitForm())
                ->action(function (array $data): void {
                    $this->guard(fn () => $this->saveUnit($data, null));
                }),
        ];
    }

    public function editUnitAction(): Action
    {
        return Action::make('editUnit')
            ->label('Edit')
            ->button()
            ->outlined()
            ->size('sm')
            ->color('gray')
            ->slideOver()
            ->modalHeading('Edit room')
            ->modalSubmitActionLabel('Save to Buildaura')
            ->fillForm(function (array $arguments): array {
                $unit = $this->findUnit((string) ($arguments['unitId'] ?? ''));

                return $unit ? $this->unitState($unit) : [];
            })
            ->form($this->unitForm())
            ->action(function (array $arguments, array $data): void {
                $this->guard(function () use ($arguments, $data) {
                    $unit = $this->findUnit((string) ($arguments['unitId'] ?? ''));
                    if (! $unit) {
                        throw new RuntimeException('That room is no longer in Buildaura.');
                    }
                    $this->saveUnit($data, $unit);
                });
            });
    }

    public function deleteUnitAction(): Action
    {
        return Action::make('deleteUnit')
            ->label('Delete')
            ->button()
            ->outlined()
            ->size('sm')
            ->color('danger')
            ->requiresConfirmation()
            ->modalHeading('Delete room')
            ->modalDescription('This removes the room and its date holds from Buildaura. Reservations on this website stay here.')
            ->action(function (array $arguments): void {
                $this->guard(function () use ($arguments) {
                    app(BuildauraClient::class)->deleteUnit((string) ($arguments['unitId'] ?? ''));
                    $this->inventoryCache = [];
                    $this->inventory();
                    Notification::make()->title('Room deleted from Buildaura')->success()->send();
                });
            });
    }

    private function findUnit(string $id): ?array
    {
        foreach ($this->inventory()['units'] ?? [] as $unit) {
            if ((string) ($unit['id'] ?? '') === $id) {
                return $unit;
            }
        }

        return null;
    }

    private function saveUnit(array $data, ?array $existing): void
    {
        $payload = [
            'roomTypeId' => $data['roomTypeId'] ?? null,
            'code' => trim((string) ($data['code'] ?? '')),
            'floor' => (string) ($data['floor'] ?? ''),
            'name' => (string) ($data['name'] ?? ''),
            'status' => $data['status'] ?? 'AVAILABLE',
            'isActive' => (bool) ($data['isActive'] ?? true),
            'notes' => (string) ($data['notes'] ?? ''),
            'sortOrder' => $existing === null
                ? ((int) collect($this->inventory()['units'] ?? [])->max('sortOrder')) + 1
                : (int) ($existing['sortOrder'] ?? 0),
        ];
        $crs = app(BuildauraClient::class);
        if ($existing === null) {
            $crs->createUnit($payload);
            $title = 'Room created in Buildaura';
        } else {
            $crs->updateUnit((string) $existing['id'], $payload);
            $title = 'Room updated in Buildaura';
        }
        $this->inventoryCache = [];
        $this->inventory();
        Notification::make()->title($title)->success()->send();
    }

    private function unitForm(): array
    {
        return [
            Select::make('roomTypeId')->label('Room type')->options(fn () => $this->roomTypeOptions())->searchable()->required(),
            TextInput::make('code')->label('Room number')->required()->maxLength(40),
            TextInput::make('name'),
            TextInput::make('floor'),
            Select::make('status')->options($this->statusOptions())->default('AVAILABLE')->required(),
            Toggle::make('isActive')->label('Active')->default(true),
            Textarea::make('notes'),
        ];
    }

    private function unitState(array $unit): array
    {
        return [
            'roomTypeId' => $unit['roomTypeId'] ?? null,
            'code' => $unit['code'] ?? '',
            'name' => $unit['name'] ?? '',
            'floor' => $unit['floor'] ?? '',
            'status' => $unit['status'] ?? 'AVAILABLE',
            'isActive' => (bool) ($unit['isActive'] ?? true),
            'notes' => $unit['notes'] ?? '',
        ];
    }

    private function statusOptions(): array
    {
        return [
            'AVAILABLE' => 'Available',
            'RESERVED' => 'Reserved',
            'OCCUPIED' => 'Occupied',
            'MAINTENANCE' => 'Maintenance',
            'OUT_OF_SERVICE' => 'Out of service',
        ];
    }

    private function guard(callable $callback): void
    {
        try {
            $callback();
        } catch (\\Filament\\Support\\Exceptions\\Halt $halt) {
            throw $halt;
        } catch (\\Throwable $e) {
            Notification::make()->title('Buildaura could not save that change')->body($e->getMessage())->danger()->send();
            throw new \\Filament\\Support\\Exceptions\\Halt();
        }
    }
}
`

  files['resources/views/filament/pages/rooms.blade.php'] = `<x-filament-panels::page>
@if($error)
  <div style="margin-bottom:16px;padding:12px 14px;border:1px solid #fecaca;border-radius:8px;color:#991b1b;font-size:14px;">
    {{ $error }}
    <div style="margin-top:6px;color:#6b7280;">Rooms are stored in Buildaura. This page calls that API with this site's key.</div>
  </div>
@endif
<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;align-items:end;margin-bottom:24px;">
  <x-filament-forms::field-wrapper label="Search">
    <x-filament::input.wrapper>
      <x-filament::input type="search" placeholder="Code, name, floor, notes" wire:model.live.debounce.300ms="filters.search" />
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <x-filament-forms::field-wrapper label="Room type">
    <x-filament::input.wrapper>
      <x-filament::input.select wire:model.live="filters.roomType">
        <option value="">All room types</option>
        @foreach($types as $type)
          @if(! empty($type['id']))
            <option value="{{ $type['id'] }}">{{ $type['name'] ?? '' }}</option>
          @endif
        @endforeach
      </x-filament::input.select>
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <x-filament-forms::field-wrapper label="Status">
    <x-filament::input.wrapper>
      <x-filament::input.select wire:model.live="filters.status">
        <option value="">Any status</option>
        @foreach(['AVAILABLE' => 'Available', 'RESERVED' => 'Reserved', 'OCCUPIED' => 'Occupied', 'MAINTENANCE' => 'Maintenance', 'OUT_OF_SERVICE' => 'Out of service'] as $value => $label)
          <option value="{{ $value }}">{{ $label }}</option>
        @endforeach
      </x-filament::input.select>
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <x-filament-forms::field-wrapper label="Sort">
    <x-filament::input.wrapper>
      <x-filament::input.select wire:model.live="filters.sort">
        <option value="code">Room number</option>
        <option value="code_desc">Room number (Z–A)</option>
        <option value="name">Name</option>
        <option value="floor">Floor</option>
        <option value="status">Status</option>
        <option value="type">Room type</option>
      </x-filament::input.select>
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <div>
    <x-filament::button color="gray" size="sm" type="button" style="width:100%" wire:click="clearUnitFilters">Clear</x-filament::button>
  </div>
</div>
@php
  $typeNames = [];
  foreach ($types as $type) {
      if (! empty($type['id'])) {
          $typeNames[$type['id']] = $type['name'] ?? '';
      }
  }
@endphp
<x-filament::section>
  <div style="overflow-x:auto;">
    <table style="width:100%;min-width:720px;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Room number</th>
          <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Name</th>
          <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Room type</th>
          <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Floor</th>
          <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Status</th>
          <th style="text-align:right;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Actions</th>
        </tr>
      </thead>
      <tbody>
        @forelse($units as $unit)
          <tr wire:key="unit-{{ $unit['id'] }}" style="border-top:1px solid #e5e7eb;">
            <td style="padding:10px;vertical-align:middle;white-space:nowrap;font-weight:600;">{{ $unit['code'] ?? '' }}</td>
            <td style="padding:10px;vertical-align:middle;white-space:normal;word-break:normal;overflow-wrap:break-word;">
              {{ $unit['name'] ?? '' }}
              @if(isset($unit['isActive']) && ! $unit['isActive'])
                <span style="color:#6b7280;font-size:12px;">Inactive</span>
              @endif
            </td>
            <td style="padding:10px;vertical-align:middle;white-space:normal;word-break:normal;">{{ $typeNames[$unit['roomTypeId'] ?? ''] ?? '' }}</td>
            <td style="padding:10px;vertical-align:middle;white-space:nowrap;">{{ $unit['floor'] ?? '' }}</td>
            <td style="padding:10px;vertical-align:middle;white-space:nowrap;">{{ str_replace('_', ' ', (string) ($unit['status'] ?? '')) }}</td>
            <td style="padding:10px;vertical-align:middle;white-space:nowrap;text-align:right;">
              <div style="display:flex;gap:8px;justify-content:flex-end;align-items:center;">
                <x-filament::button tag="a" size="sm" color="gray" outlined :href="\\App\\Filament\\Pages\\RoomCalendar::getUrl(['unitId' => $unit['id']])">Calendar</x-filament::button>
                {{ ($this->editUnitAction)(['unitId' => $unit['id']]) }}
                {{ ($this->deleteUnitAction)(['unitId' => $unit['id']]) }}
              </div>
            </td>
          </tr>
        @empty
          <tr>
            <td colspan="6" style="padding:16px 10px;color:#6b7280;">@if($this->unitFiltersActive())No rooms match these filters.@else No rooms yet.@endif</td>
          </tr>
        @endforelse
      </tbody>
    </table>
  </div>
</x-filament::section>
</x-filament-panels::page>
`

  files['app/Filament/Pages/GuestReservations.php'] = `<?php

namespace App\\Filament\\Pages;

use App\\Models\\GuestReservation;
use Filament\\Pages\\Page;

class GuestReservations extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-calendar';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationLabel = 'Guest reservations';
    protected static ?string $title = 'Guest reservations';
    protected static string $view = 'filament.pages.guest-reservations';

    public ?array $filters = [
        'search' => '',
        'status' => '',
        'roomType' => '',
        'sort' => 'newest',
    ];

    protected function getForms(): array
    {
        return [];
    }

    public function clearGuestFilters(): void
    {
        $this->filters = [
            'search' => '',
            'status' => '',
            'roomType' => '',
            'sort' => 'newest',
        ];
    }

    public function guestStatusOptions(): array
    {
        return GuestReservation::query()
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->orderBy('status')
            ->pluck('status', 'status')
            ->all();
    }

    public function guestRoomTypeOptions(): array
    {
        return GuestReservation::query()
            ->whereNotNull('room_type_name')
            ->where('room_type_name', '!=', '')
            ->distinct()
            ->orderBy('room_type_name')
            ->pluck('room_type_name', 'room_type_name')
            ->all();
    }

    public function guestFiltersActive(): bool
    {
        return $this->filterText('search') !== ''
            || $this->filterText('status') !== ''
            || $this->filterText('roomType') !== '';
    }

    public function getViewData(): array
    {
        $query = GuestReservation::query();
        $search = $this->filterText('search');
        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\\\').'%';
            $query->where(function ($inner) use ($like) {
                $inner->where('confirmation_code', 'like', $like)
                    ->orWhere('guest_name', 'like', $like)
                    ->orWhere('guest_phone', 'like', $like)
                    ->orWhere('room_code', 'like', $like);
            });
        }
        $status = $this->filterText('status');
        if ($status !== '') {
            $query->where('status', $status);
        }
        $roomType = $this->filterText('roomType');
        if ($roomType !== '') {
            $query->where('room_type_name', $roomType);
        }
        match ($this->filterText('sort') ?: 'newest') {
            'oldest' => $query->orderBy('id'),
            'guest' => $query->orderBy('guest_name')->orderByDesc('id'),
            'check_in' => $query->orderBy('check_in')->orderByDesc('id'),
            'status' => $query->orderBy('status')->orderByDesc('id'),
            default => $query->orderByDesc('id'),
        };

        return [
            'reservations' => $query->limit(200)->get(),
        ];
    }

    private function filterText(string $key): string
    {
        $value = $this->filters[$key] ?? null;

        return is_scalar($value) ? trim((string) $value) : '';
    }
}
`

  files['resources/views/filament/pages/guest-reservations.blade.php'] = `<x-filament-panels::page>
${flash}
<p style="margin-bottom:12px">Guest name, email, and phone are stored on this website only.</p>
<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;align-items:end;margin-bottom:24px;">
  <x-filament-forms::field-wrapper label="Search">
    <x-filament::input.wrapper>
      <x-filament::input type="search" placeholder="Code, guest, phone, room" wire:model.live.debounce.300ms="filters.search" />
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <x-filament-forms::field-wrapper label="Status">
    <x-filament::input.wrapper>
      <x-filament::input.select wire:model.live="filters.status">
        <option value="">Any status</option>
        @foreach($this->guestStatusOptions() as $value => $label)
          <option value="{{ $value }}">{{ $label }}</option>
        @endforeach
      </x-filament::input.select>
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <x-filament-forms::field-wrapper label="Room type">
    <x-filament::input.wrapper>
      <x-filament::input.select wire:model.live="filters.roomType">
        <option value="">All room types</option>
        @foreach($this->guestRoomTypeOptions() as $value => $label)
          <option value="{{ $value }}">{{ $label }}</option>
        @endforeach
      </x-filament::input.select>
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <x-filament-forms::field-wrapper label="Sort">
    <x-filament::input.wrapper>
      <x-filament::input.select wire:model.live="filters.sort">
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="guest">Guest name</option>
        <option value="check_in">Check-in</option>
        <option value="status">Status</option>
      </x-filament::input.select>
    </x-filament::input.wrapper>
  </x-filament-forms::field-wrapper>
  <div>
    <x-filament::button color="gray" size="sm" type="button" style="width:100%" wire:click="clearGuestFilters">Clear</x-filament::button>
  </div>
</div>
@if($reservations->isEmpty())
<p style="color:#6b7280;margin-bottom:12px;">@if($this->guestFiltersActive())No reservations match these filters.@else No reservations yet.@endif</p>
@endif
<table style="width:100%;border-collapse:collapse">
  <thead><tr><th align="left">Code</th><th align="left">Guest</th><th align="left">Phone</th><th align="left">Room</th><th align="left">Dates</th><th align="left">Status</th><th></th></tr></thead>
  <tbody>
  @foreach($reservations as $row)
  <tr>
    <td style="padding:8px 8px 8px 0">{{ $row->confirmation_code }}</td>
    <td>{{ $row->guest_name }}@if($row->children)<div style="color:#6b7280;font-size:12px">{{ $row->children }} children{{ (is_array($row->child_ages) && count($row->child_ages)) ? ' · '.collect($row->child_ages)->map(fn ($age) => $age.'y')->implode(', ') : '' }}</div>@endif</td>
    <td>{{ $row->guest_phone }}</td>
    <td>{{ $row->room_code }}</td>
    <td>{{ $row->check_in->format('M j') }} – {{ $row->check_out->format('M j, Y') }}</td>
    <td>{{ $row->status }}</td>
    <td>
      @if($row->status !== 'cancelled')
      <form method="POST" action="{{ route('property.reservations.cancel') }}" wire:ignore>
        @csrf
        <input type="hidden" name="confirmation_code" value="{{ $row->confirmation_code }}" />
        <button type="button" onclick="if (confirm('Cancel this reservation?')) this.form.submit()">Cancel</button>
      </form>
      @endif
    </td>
  </tr>
  @endforeach
  </tbody>
</table>
</x-filament-panels::page>
`

  files['app/Filament/Pages/ApiKey.php'] = `<?php

namespace App\\Filament\\Pages;

use Filament\\Pages\\Page;

class ApiKey extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-lock-closed';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationLabel = 'API key';
    protected static ?string $title = 'API key';
    protected static string $view = 'filament.pages.api-key';

    public function getViewData(): array
    {
        $key = (string) config('services.buildaura.key');

        return [
            'prefix' => $key === '' ? '' : substr($key, 0, 12),
            'hotelId' => (string) config('services.buildaura.hotel_id'),
            'url' => (string) config('services.buildaura.url'),
        ];
    }
}
`

  files['resources/views/filament/pages/api-key.blade.php'] = `<x-filament-panels::page>
${flash}
@if(session('new_api_key'))
<p style="margin-bottom:8px">Copy this key now. It replaces the previous site key, including the one in .env.example.</p>
<code style="display:block;padding:12px;background:#f8fafc;border-radius:8px;word-break:break-all">{{ session('new_api_key') }}</code>
@endif
<p style="margin:16px 0">Hotel {{ $hotelId }} · {{ $url }}</p>
<p style="margin-bottom:16px">Current key prefix: {{ $prefix !== '' ? $prefix : 'not set' }}</p>
<form method="POST" action="{{ route('property.api-key.rotate') }}" wire:ignore>
  @csrf
  <button type="submit" style="padding:8px 12px;border-radius:8px;background:#111827;color:#fff">Request a new API key</button>
</form>
</x-filament-panels::page>
`

  Object.assign(files, roomCalendarFiles('BuildauraClient', 'Rooms'))

  return files
}
