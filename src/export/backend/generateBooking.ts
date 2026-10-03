/**
 * Hospitality booking for exported Laravel + Filament sites.
 *
 * Inventory (hotel, room types, units, rates, occupancy) lives in BuildAura CRS.
 * Guest details and fake payment records stay in this exported database only.
 */
import type { SiteContent } from '../../types'
import {
  parseAmenities,
  parseRoomInt,
  parseRoomPrice,
} from '../../data/hospitality'
import type { SiteExportPayload } from './exportPayload'
import { resolveAssetPath } from './exportPayload'

export function hasBookingFeature(content: SiteContent): boolean {
  return Boolean(content.pageVisibility?.rooms && content.roomTypes?.some((r) => r.name))
}

function jsonForPhp(obj: unknown): string {
  return JSON.stringify(obj, null, 2).replace(/'/g, "\\'")
}

function seedRoomPayload(content: SiteContent, assetMap: Record<string, string>) {
  const types = content.roomTypes.filter((r) => r.name)
  return types.map((rt, i) => ({
    name: rt.name,
    slug: rt.slug || rt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    parent_slug: rt.parentSlug || null,
    description: rt.description,
    short_description: rt.shortDescription,
    base_price: parseRoomPrice(rt.basePrice),
    currency: rt.currency || 'USD',
    max_adults: parseRoomInt(rt.maxAdults, 2),
    max_children: parseRoomInt(rt.maxChildren, 0),
    max_occupancy: parseRoomInt(rt.maxOccupancy, 2),
    bed_configuration: rt.bedConfiguration,
    size_sqm: rt.sizeSqm,
    amenities: parseAmenities(rt.amenities),
    image: resolveAssetPath(rt.image, `room-${i + 1}`, assetMap),
    unit_count: Math.max(1, parseRoomInt(rt.unitCount, 1)),
    unit_prefix: rt.unitPrefix || 'RM-',
    is_active: rt.isActive !== false,
    sort_order: i,
  }))
}

export function generateBookingFiles(payload: SiteExportPayload): Record<string, string> {
  if (!hasBookingFeature(payload.content)) return {}

  const seed = seedRoomPayload(payload.content, payload.assetMap)
  const accent = payload.accent
  const files: Record<string, string> = {}

  files['config/crs.php'] = `<?php

return [
    'url' => rtrim((string) env('CRS_API_URL', 'http://localhost:8080'), '/'),
    'key' => (string) env('CRS_API_KEY', ''),
    'hotel_id' => (string) env('CRS_HOTEL_ID', ''),
];
`

  files['app/Services/CrsClient.php'] = `<?php

namespace App\\Services;

use Illuminate\\Http\\Client\\RequestException;
use Illuminate\\Support\\Facades\\Http;
use RuntimeException;

class CrsClient
{
    public function configured(): bool
    {
        return filled(config('crs.url')) && filled(config('crs.key')) && filled(config('crs.hotel_id'));
    }

    public function inventory(): array
    {
        return $this->get('/inventory');
    }

    public function availability(string $checkIn, string $checkOut, ?string $roomTypeId = null): array
    {
        $query = ['checkIn' => $checkIn, 'checkOut' => $checkOut];
        if ($roomTypeId) {
            $query['roomTypeId'] = $roomTypeId;
        }
        return $this->get('/availability', $query);
    }

    public function createRoomType(array $payload): array
    {
        return $this->post('/room-types', $payload);
    }

    public function createUnit(array $payload): array
    {
        return $this->post('/units', $payload);
    }

    public function updateUnitStatus(string $unitId, string $status): array
    {
        return $this->request('patch', '/units/' . $unitId . '/status', ['status' => $status]);
    }

    public function occupy(array $payload): array
    {
        return $this->post('/occupancy', $payload);
    }

    public function updateOccupancy(string $blockId, array $payload): array
    {
        return $this->request('patch', '/occupancy/' . $blockId, $payload);
    }

    public function release(string $blockId): void
    {
        $this->request('delete', '/occupancy/' . $blockId);
    }

    private function hotelPath(string $suffix = ''): string
    {
        $hotelId = config('crs.hotel_id');
        if (! $hotelId) {
            throw new RuntimeException('CRS_HOTEL_ID is missing. Create the hotel in BuildAura admin and paste the id into .env.');
        }
        return '/api/v1/crs/hotels/' . $hotelId . $suffix;
    }

    private function get(string $suffix, array $query = []): array
    {
        return $this->request('get', $suffix, [], $query);
    }

    private function post(string $suffix, array $payload): array
    {
        return $this->request('post', $suffix, $payload);
    }

    private function request(string $method, string $suffix, array $payload = [], array $query = []): array
    {
        if (! $this->configured()) {
            throw new RuntimeException('CRS is not configured. Set CRS_API_URL, CRS_API_KEY, and CRS_HOTEL_ID in .env.');
        }
        try {
            $pending = Http::timeout(20)
                ->acceptJson()
                ->withHeaders(['X-Api-Key' => config('crs.key')]);
            $url = config('crs.url') . $this->hotelPath($suffix);
            $response = match ($method) {
                'get' => $pending->get($url, $query),
                'post' => $pending->post($url, $payload),
                'patch' => $pending->patch($url, $payload),
                'delete' => $pending->delete($url),
                default => throw new RuntimeException('Unsupported CRS method'),
            };
            if ($response->status() === 204) {
                return [];
            }
            if ($response->failed()) {
                $message = $response->json('message') ?? $response->body();
                throw new RuntimeException(is_string($message) && $message !== '' ? $message : 'CRS request failed');
            }
            return $response->json() ?? [];
        } catch (RequestException $e) {
            throw new RuntimeException('Could not reach BuildAura CRS: ' . $e->getMessage(), 0, $e);
        }
    }
}
`

  files['app/Support/CrsInventory.php'] = `<?php

namespace App\\Support;

class CrsInventory
{
    public static function types(array $inventory): array
    {
        $raw = $inventory['roomTypes'] ?? [];
        $mapped = array_map([self::class, 'type'], $raw);
        $byId = [];
        foreach ($mapped as $type) {
            $byId[$type->id] = $type;
        }
        foreach ($mapped as $type) {
            if ($type->parent_id && isset($byId[$type->parent_id])) {
                $byId[$type->parent_id]->children->push($type);
                $type->parent = $byId[$type->parent_id];
            }
        }
        return array_values(array_filter($mapped, fn ($type) => empty($type->parent_id)));
    }

    public static function allTypes(array $inventory): array
    {
        return array_map([self::class, 'type'], $inventory['roomTypes'] ?? []);
    }

    public static function type(array $row): object
    {
        return (object) [
            'id' => $row['id'],
            'parent_id' => $row['parentId'] ?? null,
            'name' => $row['name'],
            'slug' => $row['slug'],
            'description' => $row['description'] ?? '',
            'short_description' => $row['shortDescription'] ?? '',
            'base_price' => (float) ($row['basePrice'] ?? 0),
            'currency' => $row['currency'] ?? 'USD',
            'max_adults' => (int) ($row['maxAdults'] ?? 2),
            'max_children' => (int) ($row['maxChildren'] ?? 0),
            'max_occupancy' => (int) ($row['maxOccupancy'] ?? 2),
            'bed_configuration' => $row['bedConfiguration'] ?? '',
            'size_sqm' => $row['sizeSqm'] ?? '',
            'amenities' => $row['amenities'] ?? [],
            'image' => $row['image'] ?? null,
            'is_active' => (bool) ($row['isActive'] ?? true),
            'children' => collect(),
            'parent' => null,
        ];
    }

    public static function findType(array $inventory, string $idOrSlug): ?object
    {
        foreach (self::allTypes($inventory) as $type) {
            if ($type->id === $idOrSlug || $type->slug === $idOrSlug) {
                $parents = self::types($inventory);
                foreach ($parents as $parent) {
                    if ($parent->id === $type->id) {
                        return $parent;
                    }
                    foreach ($parent->children as $child) {
                        if ($child->id === $type->id) {
                            $child->parent = $parent;
                            return $child;
                        }
                    }
                }
                return $type;
            }
        }
        return null;
    }

    public static function acceptsGuests(object $type, int $adults, int $children): bool
    {
        return $adults <= $type->max_adults
            && $children <= $type->max_children
            && ($adults + $children) <= $type->max_occupancy;
    }
}
`

  files['database/migrations/0001_01_01_2000_create_reservations_table.php'] = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('confirmation_code')->unique();
            $table->uuid('crs_room_type_id');
            $table->uuid('crs_room_unit_id')->nullable();
            $table->uuid('crs_occupancy_id')->nullable();
            $table->string('room_type_name');
            $table->string('room_unit_code')->nullable();
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedTinyInteger('adults')->default(1);
            $table->unsignedTinyInteger('children')->default(0);
            $table->string('guest_name');
            $table->string('guest_email');
            $table->string('guest_phone')->nullable();
            $table->string('status')->default('confirmed');
            $table->decimal('nightly_rate', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->text('special_requests')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('source')->default('website');
            $table->string('payment_status')->default('paid');
            $table->string('payment_method')->default('fake_card');
            $table->string('payment_holder')->nullable();
            $table->string('payment_last4', 4)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['check_in', 'check_out']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
`

  files['app/Models/Reservation.php'] = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Support\\Str;

class Reservation extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CHECKED_IN = 'checked_in';
    public const STATUS_CHECKED_OUT = 'checked_out';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_NO_SHOW = 'no_show';

    protected $fillable = [
        'confirmation_code', 'crs_room_type_id', 'crs_room_unit_id', 'crs_occupancy_id',
        'room_type_name', 'room_unit_code', 'check_in', 'check_out', 'adults', 'children',
        'guest_name', 'guest_email', 'guest_phone', 'status', 'nightly_rate', 'total_price',
        'currency', 'special_requests', 'admin_notes', 'source', 'payment_status',
        'payment_method', 'payment_holder', 'payment_last4', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'paid_at' => 'datetime',
            'nightly_rate' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    public static function generateConfirmationCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (static::where('confirmation_code', $code)->exists());
        return $code;
    }
}
`

  files['app/Services/AvailabilityService.php'] = `<?php

namespace App\\Services;

use App\\Models\\Reservation;
use App\\Support\\CrsInventory;
use Carbon\\Carbon;
use RuntimeException;

class AvailabilityService
{
    public function __construct(private CrsClient $crs) {}

    public function book(array $data): Reservation
    {
        $checkIn = $data['check_in'];
        $checkOut = $data['check_out'];
        $availability = $this->crs->availability($checkIn, $checkOut, $data['room_type_id']);
        $match = collect($availability['types'] ?? [])->first(function ($row) use ($data) {
            return ($row['roomType']['id'] ?? null) === $data['room_type_id']
                && (int) ($row['availableCount'] ?? 0) > 0;
        });
        if (! $match) {
            throw new RuntimeException('No rooms available for the selected dates.');
        }
        $type = CrsInventory::type($match['roomType']);
        if (! CrsInventory::acceptsGuests($type, (int) $data['adults'], (int) ($data['children'] ?? 0))) {
            throw new RuntimeException('Guest count exceeds the maximum occupancy for this room type.');
        }
        $unit = ($match['units'][0] ?? null);
        if (! $unit) {
            throw new RuntimeException('No rooms available for the selected dates.');
        }
        $code = Reservation::generateConfirmationCode();
        $occupancy = $this->crs->occupy([
            'roomUnitId' => $unit['id'],
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
            'kind' => 'STAY',
            'externalRef' => $code,
        ]);
        $nights = max(1, Carbon::parse($checkIn)->diffInDays(Carbon::parse($checkOut)));
        $nightly = (float) ($match['nightlyRate'] ?? $type->base_price);
        $digits = preg_replace('/\\D/', '', (string) ($data['card_number'] ?? '4242424242424242')) ?: '4242';
        return Reservation::create([
            'confirmation_code' => $code,
            'crs_room_type_id' => $type->id,
            'crs_room_unit_id' => $unit['id'],
            'crs_occupancy_id' => $occupancy['id'] ?? null,
            'room_type_name' => $type->name,
            'room_unit_code' => $unit['code'] ?? null,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'adults' => (int) $data['adults'],
            'children' => (int) ($data['children'] ?? 0),
            'guest_name' => $data['guest_name'],
            'guest_email' => $data['guest_email'],
            'guest_phone' => $data['guest_phone'] ?? null,
            'status' => Reservation::STATUS_CONFIRMED,
            'nightly_rate' => $nightly,
            'total_price' => round($nightly * $nights, 2),
            'currency' => $type->currency,
            'special_requests' => $data['special_requests'] ?? null,
            'source' => $data['source'] ?? 'website',
            'payment_status' => 'paid',
            'payment_method' => 'fake_card',
            'payment_holder' => $data['card_holder'] ?? $data['guest_name'],
            'payment_last4' => substr($digits, -4),
            'paid_at' => now(),
        ]);
    }
}
`

  files['app/Http/Controllers/BookingController.php'] = `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Reservation;
use App\\Models\\SiteSetting;
use App\\Services\\AvailabilityService;
use App\\Services\\CrsClient;
use App\\Support\\CrsInventory;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Http\\Request;
use Illuminate\\View\\View;

class BookingController extends Controller
{
    public function __construct(private CrsClient $crs, private AvailabilityService $availability) {}

    public function rooms(): View
    {
        $inventory = $this->crs->inventory();
        return view('site.rooms', [
            'settings' => SiteSetting::current(),
            'roomTypes' => CrsInventory::types($inventory),
        ]);
    }

    public function showRoom(string $slug): View
    {
        $inventory = $this->crs->inventory();
        $type = CrsInventory::findType($inventory, $slug);
        abort_unless($type, 404);
        return view('site.room-detail', [
            'settings' => SiteSetting::current(),
            'roomType' => $type,
        ]);
    }

    public function bookForm(Request $request): View
    {
        $checkIn = $request->query('check_in', now()->addDay()->toDateString());
        $checkOut = $request->query('check_out', now()->addDays(3)->toDateString());
        $adults = max(1, (int) $request->query('adults', 2));
        $children = max(0, (int) $request->query('children', 0));
        $roomTypeId = $request->query('room_type_id');
        $inventory = $this->crs->inventory();
        $types = CrsInventory::allTypes($inventory);
        $results = [];
        if ($request->has('check_in') && $checkIn < $checkOut) {
            $availability = $this->crs->availability($checkIn, $checkOut, $roomTypeId ?: null);
            foreach ($availability['types'] ?? [] as $row) {
                $type = CrsInventory::type($row['roomType']);
                if (! CrsInventory::acceptsGuests($type, $adults, $children)) {
                    continue;
                }
                $count = (int) ($row['availableCount'] ?? 0);
                if ($count < 1) {
                    continue;
                }
                $nights = max(1, \\Carbon\\Carbon::parse($checkIn)->diffInDays(\\Carbon\\Carbon::parse($checkOut)));
                $nightly = (float) ($row['nightlyRate'] ?? $type->base_price);
                $results[] = [
                    'type' => $type,
                    'available' => $count,
                    'nightly' => $nightly,
                    'total' => $nightly * $nights,
                    'nights' => $nights,
                ];
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
            'searched' => $request->has('check_in'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'room_type_id' => 'required|string',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'adults' => 'required|integer|min:1|max:20',
            'children' => 'nullable|integer|min:0|max:20',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'special_requests' => 'nullable|string|max:2000',
            'card_holder' => 'required|string|max:255',
            'card_number' => 'required|string|min:12|max:24',
            'card_expiry' => 'required|string|max:7',
            'card_cvc' => 'required|string|min:3|max:4',
        ]);
        try {
            $reservation = $this->availability->book([
                ...$validated,
                'children' => (int) ($validated['children'] ?? 0),
                'source' => 'website',
            ]);
        } catch (\\RuntimeException $e) {
            return back()->withInput()->withErrors(['booking' => $e->getMessage()]);
        }
        return redirect()->route('booking.confirm', $reservation->confirmation_code);
    }

    public function confirm(string $code): View
    {
        $reservation = Reservation::query()->where('confirmation_code', $code)->firstOrFail();
        return view('site.booking-confirm', [
            'settings' => SiteSetting::current(),
            'reservation' => $reservation,
        ]);
    }
}
`

  files['resources/views/site/rooms.blade.php'] = `@extends('layouts.site')
@section('title', ($settings->rooms_section_title ?? 'Rooms') . ' — ' . $settings->business_name)
@section('content')
<section class="py-16 bg-slate-50">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-3">{{ $settings->rooms_section_title ?? 'Rooms & Suites' }}</h1>
      <p class="text-slate-600 max-w-2xl mx-auto">{{ $settings->rooms_section_subtitle ?? 'Explore our accommodations' }}</p>
      <a href="{{ route('book') }}" class="inline-block mt-6 text-white px-6 py-3 rounded-lg font-semibold" style="background-color:${accent}">Check availability</a>
    </div>
    <div class="grid md:grid-cols-2 gap-8">
      @foreach($roomTypes as $type)
      <article class="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
        @if($type->image)
        <a href="{{ route('rooms.show', $type->slug) }}"><img src="{{ \\App\\Support\\PublicAsset::url($type->image) }}" alt="{{ $type->name }}" class="w-full aspect-[16/10] object-cover" /></a>
        @endif
        <div class="p-6">
          <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h2 class="text-2xl font-semibold"><a href="{{ route('rooms.show', $type->slug) }}" class="hover:underline">{{ $type->name }}</a></h2>
              @if($type->short_description)<p class="text-sm text-slate-500 mt-1">{{ $type->short_description }}</p>@endif
            </div>
            <p class="text-lg font-bold" style="color:${accent}">{{ number_format($type->base_price, 0) }} {{ $type->currency }} <span class="text-sm font-normal text-slate-500">/ night</span></p>
          </div>
          <p class="text-slate-600 line-clamp-3 mb-4">{{ $type->description }}</p>
          @if($type->children->isNotEmpty())
          <ul class="mb-4 space-y-2 text-sm">
            @foreach($type->children as $child)
            <li class="flex justify-between gap-3"><a href="{{ route('rooms.show', $child->slug) }}" class="font-medium hover:underline">{{ $child->name }}</a><span class="text-slate-500">from {{ number_format($child->base_price, 0) }} {{ $child->currency }}</span></li>
            @endforeach
          </ul>
          @endif
          <a href="{{ route('book', ['room_type_id' => $type->id]) }}" class="text-sm font-semibold" style="color:${accent}">Book this room →</a>
        </div>
      </article>
      @endforeach
    </div>
    @if(count($roomTypes) === 0)
    <p class="text-center text-slate-500">Rooms appear here once inventory is loaded from BuildAura CRS.</p>
    @endif
  </div>
</section>
@endsection
`

  files['resources/views/site/room-detail.blade.php'] = `@extends('layouts.site')
@section('title', $roomType->name . ' — ' . $settings->business_name)
@section('content')
<section class="py-12">
  <div class="max-w-6xl mx-auto px-6">
    <a href="{{ route('rooms.index') }}" class="text-sm text-slate-500 hover:underline">← All rooms</a>
    <div class="grid lg:grid-cols-2 gap-10 mt-6 items-start">
      <div>
        @if($roomType->image)
        <img src="{{ \\App\\Support\\PublicAsset::url($roomType->image) }}" alt="{{ $roomType->name }}" class="w-full rounded-2xl aspect-[4/3] object-cover shadow-lg" />
        @endif
      </div>
      <div>
        <h1 class="text-4xl font-bold mb-2">{{ $roomType->name }}</h1>
        @if($roomType->short_description)<p class="text-slate-500 mb-4">{{ $roomType->short_description }}</p>@endif
        <p class="text-2xl font-bold mb-6" style="color:${accent}">{{ number_format($roomType->base_price, 0) }} {{ $roomType->currency }} <span class="text-base font-normal text-slate-500">/ night</span></p>
        <p class="text-slate-700 leading-relaxed mb-6">{{ $roomType->description }}</p>
        <a href="{{ route('book', ['room_type_id' => $roomType->id]) }}" class="inline-block text-white px-6 py-3 rounded-lg font-semibold" style="background-color:${accent}">Check availability</a>
      </div>
    </div>
  </div>
</section>
@endsection
`

  files['resources/views/site/book.blade.php'] = `@extends('layouts.site')
@section('title', ($settings->booking_section_title ?? 'Book') . ' — ' . $settings->business_name)
@section('content')
<section class="py-16 bg-slate-50">
  <div class="max-w-5xl mx-auto px-6">
    <h1 class="text-4xl font-bold mb-2">{{ $settings->booking_section_title ?? 'Book Your Stay' }}</h1>
    <p class="text-slate-600 mb-8">{{ $settings->booking_section_subtitle ?? 'Search live inventory in BuildAura CRS. Guest and card details stay on this site.' }}</p>
    <form method="GET" class="grid md:grid-cols-5 gap-4 bg-white border rounded-2xl p-6 mb-8">
      <div><label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Check-in</label><input type="date" name="check_in" value="{{ $checkIn }}" required class="w-full rounded-lg border px-3 py-2" /></div>
      <div><label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Check-out</label><input type="date" name="check_out" value="{{ $checkOut }}" required class="w-full rounded-lg border px-3 py-2" /></div>
      <div><label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Adults</label><input type="number" name="adults" min="1" max="20" value="{{ $adults }}" class="w-full rounded-lg border px-3 py-2" /></div>
      <div><label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Children</label><input type="number" name="children" min="0" max="20" value="{{ $children }}" class="w-full rounded-lg border px-3 py-2" /></div>
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Room type</label>
        <select name="room_type_id" class="w-full rounded-lg border px-3 py-2">
          <option value="">Any</option>
          @foreach($roomTypes as $t)
          <option value="{{ $t->id }}" @selected((string)$roomTypeId === (string)$t->id)>{{ $t->name }}</option>
          @endforeach
        </select>
      </div>
      <div class="md:col-span-5"><button type="submit" class="text-white px-6 py-3 rounded-lg font-semibold" style="background-color:${accent}">Search availability</button></div>
    </form>
    @if($errors->any())
    <div class="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>
    @endif
    @if($searched)
      @forelse($results as $row)
      @php $type = $row['type']; @endphp
      <div class="bg-white rounded-2xl border p-6 mb-6 flex flex-col md:flex-row gap-6">
        <div class="flex-1">
          <h2 class="text-xl font-semibold">{{ $type->name }}</h2>
          <p class="text-sm text-emerald-700 mt-2 font-medium">{{ $row['available'] }} room{{ $row['available'] === 1 ? '' : 's' }} available</p>
          <p class="mt-2 font-bold" style="color:${accent}">{{ number_format($row['total'], 0) }} {{ $type->currency }} <span class="text-sm font-normal text-slate-500">total · {{ $row['nights'] }} night{{ $row['nights'] === 1 ? '' : 's' }}</span></p>
        </div>
        <form method="POST" action="{{ route('book.store') }}" class="md:w-80 space-y-3">
          @csrf
          <input type="hidden" name="room_type_id" value="{{ $type->id }}" />
          <input type="hidden" name="check_in" value="{{ $checkIn }}" />
          <input type="hidden" name="check_out" value="{{ $checkOut }}" />
          <input type="hidden" name="adults" value="{{ $adults }}" />
          <input type="hidden" name="children" value="{{ $children }}" />
          <input name="guest_name" required placeholder="Full name" value="{{ old('guest_name') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
          <input type="email" name="guest_email" required placeholder="Email" value="{{ old('guest_email') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
          <input name="guest_phone" placeholder="Phone" value="{{ old('guest_phone') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2">Fake payment (not sent to BuildAura)</p>
          <input name="card_holder" required placeholder="Name on card" value="{{ old('card_holder') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
          <input name="card_number" required placeholder="4242 4242 4242 4242" value="{{ old('card_number', '4242424242424242') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
          <div class="grid grid-cols-2 gap-2">
            <input name="card_expiry" required placeholder="12/28" value="{{ old('card_expiry', '12/28') }}" class="rounded-lg border px-3 py-2 text-sm" />
            <input name="card_cvc" required placeholder="123" value="{{ old('card_cvc', '123') }}" class="rounded-lg border px-3 py-2 text-sm" />
          </div>
          <button type="submit" class="w-full text-white px-4 py-2.5 rounded-lg font-semibold text-sm" style="background-color:${accent}">Pay and reserve</button>
        </form>
      </div>
      @empty
      <p class="text-center text-slate-600 bg-white border rounded-2xl p-10">No rooms available for those dates.</p>
      @endforelse
    @endif
  </div>
</section>
@endsection
`

  files['resources/views/site/booking-confirm.blade.php'] = `@extends('layouts.site')
@section('title', 'Booking confirmed — ' . $settings->business_name)
@section('content')
<section class="py-20">
  <div class="max-w-xl mx-auto px-6 text-center">
    <h1 class="text-3xl font-bold mb-2">You're booked</h1>
    <p class="text-slate-600 mb-8">Your stay is confirmed. Guest and payment details were saved on this website only.</p>
    <div class="bg-slate-50 border rounded-2xl p-6 text-left space-y-3">
      <div class="flex justify-between gap-4"><span class="text-slate-500">Confirmation</span><span class="font-mono font-bold">{{ $reservation->confirmation_code }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Room</span><span class="font-medium">{{ $reservation->room_type_name }}</span></div>
      @if($reservation->room_unit_code)<div class="flex justify-between gap-4"><span class="text-slate-500">Unit</span><span>{{ $reservation->room_unit_code }}</span></div>@endif
      <div class="flex justify-between gap-4"><span class="text-slate-500">Stay</span><span>{{ $reservation->check_in->format('M j, Y') }} – {{ $reservation->check_out->format('M j, Y') }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Guest</span><span>{{ $reservation->guest_name }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Card</span><span>{{ $reservation->payment_method }} · {{ $reservation->payment_last4 }}</span></div>
      <div class="flex justify-between gap-4 border-t pt-3"><span class="text-slate-500">Total</span><span class="font-bold" style="color:${accent}">{{ number_format($reservation->total_price, 0) }} {{ $reservation->currency }}</span></div>
    </div>
  </div>
</section>
@endsection
`

  files['app/Filament/Resources/ReservationResource.php'] = `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\ReservationResource\\Pages;
use App\\Models\\Reservation;
use Filament\\Forms;
use Filament\\Resources\\Resource;
use Filament\\Tables;

class ReservationResource extends Resource
{
    protected static ?string $model = Reservation::class;
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    public static function form(Forms\\Form $form): Forms\\Form
    {
        return $form->schema([
            Forms\\Components\\TextInput::make('guest_name')->required(),
            Forms\\Components\\TextInput::make('guest_email')->email()->required(),
            Forms\\Components\\TextInput::make('guest_phone'),
            Forms\\Components\\DatePicker::make('check_in')->required(),
            Forms\\Components\\DatePicker::make('check_out')->required(),
            Forms\\Components\\Select::make('status')->options([
                'pending' => 'Pending',
                'confirmed' => 'Confirmed',
                'checked_in' => 'Checked in',
                'checked_out' => 'Checked out',
                'cancelled' => 'Cancelled',
                'no_show' => 'No show',
            ])->required(),
            Forms\\Components\\TextInput::make('room_type_name')->disabled(),
            Forms\\Components\\TextInput::make('room_unit_code')->disabled(),
            Forms\\Components\\TextInput::make('payment_last4')->label('Card last 4')->disabled(),
            Forms\\Components\\Textarea::make('admin_notes'),
        ]);
    }

    public static function table(Tables\\Table $table): Tables\\Table
    {
        return $table->columns([
            Tables\\Columns\\TextColumn::make('confirmation_code')->searchable(),
            Tables\\Columns\\TextColumn::make('guest_name')->searchable(),
            Tables\\Columns\\TextColumn::make('guest_email'),
            Tables\\Columns\\TextColumn::make('room_type_name'),
            Tables\\Columns\\TextColumn::make('check_in')->date(),
            Tables\\Columns\\TextColumn::make('status')->badge(),
            Tables\\Columns\\TextColumn::make('total_price')->money(fn ($record) => $record->currency),
        ])->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\\ListReservations::route('/'),
            'edit' => Pages\\EditReservation::route('/{record}/edit'),
        ];
    }
}
`

  Object.assign(files, generateSimpleResourcePages('Reservation', 'Reservations'))

  files['app/Filament/Pages/ManageInventory.php'] = `<?php

namespace App\\Filament\\Pages;

use App\\Services\\CrsClient;
use Filament\\Actions\\Action;
use Filament\\Forms\\Components\\Select;
use Filament\\Forms\\Components\\TextInput;
use Filament\\Notifications\\Notification;
use Filament\\Pages\\Page;

class ManageInventory extends Page
{
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $title = 'CRS inventory';
    protected static string $view = 'filament.pages.manage-inventory';

    public array $inventory = [];

    public function mount(CrsClient $crs): void
    {
        $this->inventory = $crs->inventory();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('addType')
                ->label('Add room type')
                ->form([
                    TextInput::make('name')->required(),
                    TextInput::make('basePrice')->numeric()->default(200),
                    TextInput::make('unitCount')->numeric()->default(2),
                    TextInput::make('unitPrefix')->default('RM-'),
                ])
                ->action(function (array $data, CrsClient $crs) {
                    $crs->createRoomType([
                        'name' => $data['name'],
                        'basePrice' => (float) $data['basePrice'],
                        'unitCount' => (int) $data['unitCount'],
                        'unitPrefix' => $data['unitPrefix'],
                        'isActive' => true,
                    ]);
                    $this->inventory = $crs->inventory();
                    Notification::make()->title('Room type created in BuildAura CRS')->success()->send();
                }),
            Action::make('flipStatus')
                ->label('Flip unit status')
                ->form([
                    Select::make('unitId')->label('Unit')->options(fn () => collect($this->inventory['units'] ?? [])->mapWithKeys(fn ($u) => [$u['id'] => $u['code']]))->required(),
                    Select::make('status')->options([
                        'AVAILABLE' => 'Available',
                        'RESERVED' => 'Reserved',
                        'OCCUPIED' => 'Occupied',
                        'MAINTENANCE' => 'Maintenance',
                        'OUT_OF_SERVICE' => 'Out of service',
                    ])->required(),
                ])
                ->action(function (array $data, CrsClient $crs) {
                    $crs->updateUnitStatus($data['unitId'], $data['status']);
                    $this->inventory = $crs->inventory();
                    Notification::make()->title('Unit status updated')->success()->send();
                }),
        ];
    }
}
`

  files['resources/views/filament/pages/manage-inventory.blade.php'] = `@php
    $types = $this->inventory['roomTypes'] ?? [];
    $units = $this->inventory['units'] ?? [];
    $occupancy = $this->inventory['occupancy'] ?? [];
@endphp
<x-filament-panels::page>
    <div class="grid gap-6 md:grid-cols-2">
        <x-filament::section heading="Room types">
            <ul class="space-y-2 text-sm">
                @forelse($types as $type)
                    <li><strong>{{ $type['name'] }}</strong> — {{ $type['basePrice'] }} {{ $type['currency'] }}</li>
                @empty
                    <li>No types yet. Add one above or seed from BuildAura admin.</li>
                @endforelse
            </ul>
        </x-filament::section>
        <x-filament::section heading="Units">
            <ul class="space-y-2 text-sm">
                @forelse($units as $unit)
                    <li>{{ $unit['code'] }} — {{ $unit['status'] }}</li>
                @empty
                    <li>No physical rooms yet.</li>
                @endforelse
            </ul>
        </x-filament::section>
    </div>
    <x-filament::section heading="Occupancy windows" class="mt-6">
        <p class="text-sm text-gray-500 mb-3">Date ranges only. Guest names live under Reservations.</p>
        <ul class="space-y-2 text-sm">
            @forelse($occupancy as $block)
                <li>{{ $block['checkIn'] }} → {{ $block['checkOut'] }} ({{ $block['kind'] }} {{ $block['externalRef'] ?? '' }})</li>
            @empty
                <li>No occupancy windows.</li>
            @endforelse
        </ul>
    </x-filament::section>
</x-filament-panels::page>
`

  files['app/Filament/Widgets/BookingStatsOverview.php'] = `<?php

namespace App\\Filament\\Widgets;

use App\\Models\\Reservation;
use App\\Services\\CrsClient;
use Filament\\Widgets\\StatsOverviewWidget as BaseWidget;
use Filament\\Widgets\\StatsOverviewWidget\\Stat;

class BookingStatsOverview extends BaseWidget
{
    protected static ?int $sort = 0;

    protected function getStats(): array
    {
        $types = 0;
        $units = 0;
        try {
            $inventory = app(CrsClient::class)->inventory();
            $types = count($inventory['roomTypes'] ?? []);
            $units = count($inventory['units'] ?? []);
        } catch (\\Throwable) {
        }
        return [
            Stat::make('CRS room types', $types),
            Stat::make('CRS units', $units),
            Stat::make('Local reservations', Reservation::count()),
        ];
    }
}
`

  files['database/seeders/HospitalitySeeder.php'] = `<?php

namespace Database\\Seeders;

use App\\Services\\CrsClient;
use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Facades\\Log;

class HospitalitySeeder extends Seeder
{
    public function run(): void
    {
        $crs = app(CrsClient::class);
        if (! $crs->configured()) {
            Log::warning('HospitalitySeeder skipped: set CRS_API_URL, CRS_API_KEY, CRS_HOTEL_ID');
            return;
        }
        $inventory = $crs->inventory();
        if (count($inventory['roomTypes'] ?? []) > 0) {
            return;
        }
        $seed = json_decode('${jsonForPhp(seed)}', true);
        $ids = [];
        foreach ($seed as $row) {
            $created = $crs->createRoomType([
                'name' => $row['name'],
                'slug' => $row['slug'],
                'description' => $row['description'],
                'shortDescription' => $row['short_description'],
                'basePrice' => $row['base_price'],
                'currency' => $row['currency'],
                'maxAdults' => $row['max_adults'],
                'maxChildren' => $row['max_children'],
                'maxOccupancy' => $row['max_occupancy'],
                'bedConfiguration' => $row['bed_configuration'],
                'sizeSqm' => $row['size_sqm'],
                'amenities' => $row['amenities'],
                'image' => $row['image'],
                'unitPrefix' => $row['unit_prefix'],
                'unitCount' => $row['unit_count'],
                'isActive' => $row['is_active'],
                'sortOrder' => $row['sort_order'],
            ]);
            $ids[$row['slug']] = $created['id'] ?? null;
        }
    }
}
`

  return files
}

function generateSimpleResourcePages(name: string, listName: string): Record<string, string> {
  return {
    [`app/Filament/Resources/${name}Resource/Pages/List${listName}.php`]: `<?php

namespace App\\Filament\\Resources\\${name}Resource\\Pages;

use App\\Filament\\Resources\\${name}Resource;
use Filament\\Resources\\Pages\\ListRecords;

class List${listName} extends ListRecords
{
    protected static string $resource = ${name}Resource::class;
}
`,
    [`app/Filament/Resources/${name}Resource/Pages/Edit${name}.php`]: `<?php

namespace App\\Filament\\Resources\\${name}Resource\\Pages;

use App\\Filament\\Resources\\${name}Resource;
use Filament\\Resources\\Pages\\EditRecord;

class Edit${name} extends EditRecord
{
    protected static string $resource = ${name}Resource::class;
}
`,
  }
}

export function bookingRouteLines(): string {
  return `
use App\\Http\\Controllers\\BookingController;
Route::get('/rooms', [BookingController::class, 'rooms'])->name('rooms.index');
Route::get('/rooms/{slug}', [BookingController::class, 'showRoom'])->name('rooms.show');
Route::get('/book', [BookingController::class, 'bookForm'])->name('book');
Route::post('/book', [BookingController::class, 'store'])->name('book.store');
Route::get('/book/confirm/{code}', [BookingController::class, 'confirm'])->name('booking.confirm');
`
}

export function bookingNavLinksBlade(): string {
  return `@if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('rooms.index') }}" class="hover:underline opacity-80">Rooms</a><a href="{{ route('book') }}" class="hover:underline opacity-80">Book</a>@endif`
}

export function bookingFooterLinksBlade(): string {
  return `@if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('rooms.index') }}" class="hover:underline opacity-70">Rooms</a><a href="{{ route('book') }}" class="hover:underline opacity-70">Book</a>@endif`
}

export function bookingSettingsFields(content: SiteContent): Record<string, unknown> {
  return {
    rooms_section_title: content.roomsSectionTitle || 'Rooms & Suites',
    rooms_section_subtitle: content.roomsSectionSubtitle || '',
    booking_section_title: content.bookingSectionTitle || 'Book Your Stay',
    booking_section_subtitle: content.bookingSectionSubtitle || '',
  }
}
