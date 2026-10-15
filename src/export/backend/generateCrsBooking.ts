/**
 * Hotel and guest house exports talk to the Buildaura room API.
 * Guest name, email, and phone stay in this site's database.
 * Buildaura only receives the room, the dates, and the confirmation code.
 */
import type { SiteExportPayload } from './exportPayload'
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
        $checkIn = (string) $request->query('check_in', now()->addDay()->toDateString());
        $checkOut = (string) $request->query('check_out', now()->addDays(3)->toDateString());
        $adults = max(1, (int) $request->query('adults', 2));
        $children = max(0, (int) $request->query('children', 0));
        $roomTypeId = (string) $request->query('room_type_id', '');
        [$types, $error] = $this->activeTypes();
        $results = [];
        $searched = $request->has('check_in');

        if ($searched && $checkIn !== '' && $checkOut !== '' && $checkIn < $checkOut && $error === null) {
            try {
                $availability = $this->crs->availability($checkIn, $checkOut, $roomTypeId !== '' ? $roomTypeId : null);
                $nights = max(1, (int) Carbon::parse($checkIn)->diffInDays(Carbon::parse($checkOut)));
                foreach ($availability['types'] ?? [] as $row) {
                    $type = $row['roomType'] ?? [];
                    if ($roomTypeId !== '' && ($type['id'] ?? '') !== $roomTypeId) {
                        continue;
                    }
                    if (! $this->fits($type, $adults, $children)) {
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

        return view('site.book', [
            'settings' => SiteSetting::current(),
            'roomTypes' => $types,
            'results' => $results,
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
            'adults' => $adults,
            'children' => $children,
            'roomTypeId' => $roomTypeId,
            'searched' => $searched,
            'apiError' => $error,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'room_type_id' => 'required|uuid',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'adults' => 'required|integer|min:1|max:20',
            'children' => 'nullable|integer|min:0|max:20',
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
            $block = $this->crs->occupy($unit['id'], $validated['check_in'], $validated['check_out'], $code);
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
                'check_in' => $validated['check_in'],
                'check_out' => $validated['check_out'],
                'adults' => (int) $validated['adults'],
                'children' => (int) ($validated['children'] ?? 0),
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
    </div>
    @if($apiError)
    <p class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">{{ $apiError }}</p>
    @endif
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      @foreach($roomTypes as $type)
      <article class="rounded-2xl border bg-white overflow-hidden shadow-sm">
        <div class="p-6">
          <h2 class="text-xl font-semibold">{{ $type['name'] }}</h2>
          @if(!empty($type['shortDescription']))<p class="text-sm text-slate-500 mt-1">{{ $type['shortDescription'] }}</p>@endif
          <p class="mt-4 text-lg font-bold" style="color:${accent}">{{ number_format((float) ($type['basePrice'] ?? 0), 0) }} {{ $type['currency'] ?? '' }} <span class="text-sm font-normal text-slate-500">/ night</span></p>
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
    <h1 class="text-4xl font-bold mt-4 mb-2">{{ $roomType['name'] }}</h1>
    @if(!empty($roomType['shortDescription']))<p class="text-slate-500 mb-4">{{ $roomType['shortDescription'] }}</p>@endif
    <p class="text-2xl font-bold mb-6" style="color:${accent}">{{ number_format((float) ($roomType['basePrice'] ?? 0), 0) }} {{ $roomType['currency'] ?? '' }} <span class="text-base font-normal text-slate-500">/ night</span></p>
    @if(!empty($roomType['description']))<p class="text-slate-700 leading-relaxed mb-6">{{ $roomType['description'] }}</p>@endif
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
    </div>
    @if($apiError)
    <p class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">{{ $apiError }}</p>
    @endif
    <form method="GET" action="{{ route('book') }}" class="bg-white rounded-2xl border p-6 shadow-sm mb-10 grid md:grid-cols-5 gap-4 items-end">
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Check-in</label>
        <input type="date" name="check_in" value="{{ $checkIn }}" required class="w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Check-out</label>
        <input type="date" name="check_out" value="{{ $checkOut }}" required class="w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Adults</label>
        <input type="number" name="adults" min="1" max="20" value="{{ $adults }}" class="w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Children</label>
        <input type="number" name="children" min="0" max="20" value="{{ $children }}" class="w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Room type</label>
        <select name="room_type_id" class="w-full rounded-lg border px-3 py-2">
          <option value="">Any</option>
          @foreach($roomTypes as $type)
          <option value="{{ $type['id'] }}" @selected($roomTypeId === ($type['id'] ?? ''))>{{ $type['name'] }}</option>
          @endforeach
        </select>
      </div>
      <div class="md:col-span-5">
        <button type="submit" class="text-white px-6 py-3 rounded-lg font-semibold" style="background-color:${accent}">Search availability</button>
      </div>
    </form>
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
      <div class="flex justify-between gap-4"><span class="text-slate-500">Guest</span><span>{{ $reservation->guest_name }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Phone</span><span>{{ $reservation->guest_phone }}</span></div>
      @if($reservation->guest_email)<div class="flex justify-between gap-4"><span class="text-slate-500">Email</span><span>{{ $reservation->guest_email }}</span></div>@endif
      <div class="flex justify-between gap-4 border-t pt-3"><span class="text-slate-500">Total</span><span class="font-bold" style="color:${accent}">{{ number_format($reservation->total_price, 0) }} {{ $reservation->currency }}</span></div>
    </div>
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
use Filament\\Pages\\Page;
use RuntimeException;

class RoomTypes extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Property';
    protected static ?string $navigationLabel = 'Room types';
    protected static ?string $title = 'Room types';
    protected static string $view = 'filament.pages.room-types';

    public ?array $filters = [
        'search' => '',
        'parent' => '',
        'active' => '',
        'sort' => 'sortOrder',
    ];

    protected array $inventoryCache = [];

    protected ?string $inventoryError = null;

    protected function getForms(): array
    {
        return [];
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
            $this->inventoryCache = is_array($loaded) && $loaded !== [] ? $loaded : ['roomTypes' => []];
            $this->inventoryError = null;
        } catch (RuntimeException $e) {
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
}
`

  files['resources/views/filament/pages/room-types.blade.php'] = `<x-filament-panels::page>
${flash}
@if($error)<p style="margin-bottom:12px;color:#92400e">{{ $error }}</p>@endif
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
<form method="POST" action="{{ route('property.types.store') }}" wire:ignore style="display:grid;gap:8px;margin-bottom:24px;padding:16px;border:1px solid #e5e7eb;border-radius:12px">
  @csrf
  <strong>New room type</strong>
  <input name="name" required placeholder="Name" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <input name="description" placeholder="Description" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <input name="base_price" type="number" min="0" step="0.01" placeholder="Price per night" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <input name="unit_prefix" placeholder="Room code prefix, for example DLX-" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <input name="unit_count" type="number" min="0" max="50" value="1" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <button type="button" onclick="this.form.submit()" style="padding:8px 12px;border-radius:8px;background:#111827;color:#fff">Create room type</button>
</form>
@foreach($types as $type)
<form method="POST" action="{{ route('property.types.update', $type['id']) }}" wire:ignore style="display:grid;gap:8px;margin-bottom:16px;padding:16px;border:1px solid #e5e7eb;border-radius:12px">
  @csrf
  <input type="hidden" name="slug" value="{{ $type['slug'] ?? '' }}" />
  <input type="hidden" name="short_description" value="{{ $type['shortDescription'] ?? '' }}" />
  <input type="hidden" name="currency" value="{{ $type['currency'] ?? '' }}" />
  <input type="hidden" name="max_adults" value="{{ $type['maxAdults'] ?? 2 }}" />
  <input type="hidden" name="max_children" value="{{ $type['maxChildren'] ?? 0 }}" />
  <input type="hidden" name="max_occupancy" value="{{ $type['maxOccupancy'] ?? 2 }}" />
  <input type="hidden" name="bed_configuration" value="{{ $type['bedConfiguration'] ?? '' }}" />
  <input type="hidden" name="size_sqm" value="{{ $type['sizeSqm'] ?? '' }}" />
  <input type="hidden" name="unit_prefix" value="{{ $type['unitPrefix'] ?? '' }}" />
  <input name="name" required value="{{ $type['name'] }}" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <input name="description" value="{{ $type['description'] ?? '' }}" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <input name="base_price" type="number" min="0" step="0.01" value="{{ $type['basePrice'] ?? 0 }}" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <label><input type="hidden" name="is_active" value="0" /><input type="checkbox" name="is_active" value="1" @checked($type['isActive'] ?? true) /> Active</label>
  <button type="button" onclick="this.form.submit()" style="padding:8px 12px;border-radius:8px;background:#111827;color:#fff">Save</button>
</form>
<form method="POST" action="{{ route('property.types.delete', $type['id']) }}" wire:ignore style="margin:-8px 0 20px">
  @csrf
  <button type="button" onclick="if (confirm('Remove this room type from Buildaura?')) this.form.submit()" style="color:#b91c1c">Delete {{ $type['name'] }}</button>
</form>
@endforeach
@if(count($types) === 0)
<p style="color:#6b7280;">@if($this->typeFiltersActive())No room types match these filters.@else No room types yet.@endif</p>
@endif
</x-filament-panels::page>
`

  files['app/Filament/Pages/Rooms.php'] = `<?php

namespace App\\Filament\\Pages;

use App\\Services\\BuildauraClient;
use Filament\\Pages\\Page;
use RuntimeException;

class Rooms extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-key';
    protected static ?string $navigationGroup = 'Property';
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
}
`

  files['resources/views/filament/pages/rooms.blade.php'] = `<x-filament-panels::page>
${flash}
@if($error)<p style="margin-bottom:12px;color:#92400e">{{ $error }}</p>@endif
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
<form method="POST" action="{{ route('property.units.store') }}" wire:ignore style="display:grid;gap:8px;margin-bottom:24px;padding:16px;border:1px solid #e5e7eb;border-radius:12px">
  @csrf
  <strong>New room</strong>
  <select name="room_type_id" required style="padding:8px;border:1px solid #d1d5db;border-radius:8px">
    @foreach($types as $type)
    <option value="{{ $type['id'] }}">{{ $type['name'] }}</option>
    @endforeach
  </select>
  <input name="code" required placeholder="Room code, for example 204" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <input name="floor" placeholder="Floor" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <button type="button" onclick="this.form.submit()" style="padding:8px 12px;border-radius:8px;background:#111827;color:#fff">Create room</button>
</form>
@foreach($units as $unit)
<form method="POST" action="{{ route('property.units.update', $unit['id']) }}" wire:ignore style="display:grid;gap:8px;margin-bottom:12px;padding:16px;border:1px solid #e5e7eb;border-radius:12px">
  @csrf
  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
    <strong>{{ $unit['code'] }}</strong>
    <x-filament::button tag="a" size="sm" color="gray" outlined :href="\\App\\Filament\\Pages\\RoomCalendar::getUrl(['unitId' => $unit['id']])">Calendar</x-filament::button>
  </div>
  <select name="room_type_id" required style="padding:8px;border:1px solid #d1d5db;border-radius:8px">
    @foreach($types as $type)
    <option value="{{ $type['id'] }}" @selected(($unit['roomTypeId'] ?? '') === $type['id'])>{{ $type['name'] }}</option>
    @endforeach
  </select>
  <input name="code" required value="{{ $unit['code'] ?? '' }}" placeholder="Room code" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <input name="name" value="{{ $unit['name'] ?? '' }}" placeholder="Name" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <input name="floor" value="{{ $unit['floor'] ?? '' }}" placeholder="Floor" style="padding:8px;border:1px solid #d1d5db;border-radius:8px" />
  <select name="status" required style="padding:8px;border:1px solid #d1d5db;border-radius:8px">
    @foreach(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_SERVICE'] as $status)
    <option value="{{ $status }}" @selected(($unit['status'] ?? 'AVAILABLE') === $status)>{{ $status }}</option>
    @endforeach
  </select>
  <label><input type="hidden" name="is_active" value="0" /><input type="checkbox" name="is_active" value="1" @checked($unit['isActive'] ?? true) /> Active</label>
  <button type="button" onclick="this.form.submit()" style="padding:8px 12px;border-radius:8px;background:#111827;color:#fff">Save</button>
</form>
<form method="POST" action="{{ route('property.units.delete', $unit['id']) }}" wire:ignore style="margin:-4px 0 20px">
  @csrf
  <button type="button" onclick="if (confirm('Remove this room from Buildaura?')) this.form.submit()" style="color:#b91c1c">Delete {{ $unit['code'] }}</button>
</form>
@endforeach
@if(count($units) === 0)
<p style="color:#6b7280;">@if($this->unitFiltersActive())No rooms match these filters.@else No rooms yet.@endif</p>
@endif
</x-filament-panels::page>
`

  files['app/Filament/Pages/GuestReservations.php'] = `<?php

namespace App\\Filament\\Pages;

use App\\Models\\GuestReservation;
use Filament\\Pages\\Page;

class GuestReservations extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-calendar';
    protected static ?string $navigationGroup = 'Property';
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
    <td>{{ $row->guest_name }}</td>
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
    protected static ?string $navigationGroup = 'Property';
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
