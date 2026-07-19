/**
 * Hospitality booking stack for exported Laravel + Filament sites.
 *
 * Data model (works for hotels, resorts, guest houses, villas):
 *   RoomType  — sellable product (optional parent for subtypes)
 *   RoomUnit  — physical inventory assigned to a leaf type
 *   RatePeriod — optional seasonal / date-range price overrides
 *   Reservation — guest stay with status workflow + room assignment
 *
 * Availability: a unit is free when no overlapping reservation is in a
 * blocking status (pending, confirmed, checked_in).
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

  // ── Migrations ──────────────────────────────────────────────────────────
  files['database/migrations/0001_01_01_2000_create_hospitality_tables.php'] = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('room_types')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('short_description')->nullable();
            $table->decimal('base_price', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->unsignedTinyInteger('max_adults')->default(2);
            $table->unsignedTinyInteger('max_children')->default(0);
            $table->unsignedTinyInteger('max_occupancy')->default(2);
            $table->string('bed_configuration')->nullable();
            $table->string('size_sqm')->nullable();
            $table->json('amenities')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('room_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_type_id')->constrained('room_types')->cascadeOnDelete();
            $table->string('code');
            $table->string('floor')->nullable();
            $table->string('name')->nullable();
            $table->string('status')->default('available'); // available | maintenance | out_of_service
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['room_type_id', 'code']);
        });

        Schema::create('rate_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_type_id')->constrained('room_types')->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('price_per_night', 12, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('confirmation_code')->unique();
            $table->foreignId('room_type_id')->constrained('room_types')->restrictOnDelete();
            $table->foreignId('room_unit_id')->nullable()->constrained('room_units')->nullOnDelete();
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedTinyInteger('adults')->default(1);
            $table->unsignedTinyInteger('children')->default(0);
            $table->string('guest_name');
            $table->string('guest_email');
            $table->string('guest_phone')->nullable();
            $table->string('status')->default('pending');
            // pending | confirmed | checked_in | checked_out | cancelled | no_show
            $table->decimal('nightly_rate', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->text('special_requests')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('source')->default('website'); // website | phone | walk_in | admin
            $table->timestamps();
            $table->index(['check_in', 'check_out']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('rate_periods');
        Schema::dropIfExists('room_units');
        Schema::dropIfExists('room_types');
    }
};
`

  // ── Models ──────────────────────────────────────────────────────────────
  files['app/Models/RoomType.php'] = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class RoomType extends Model
{
    protected $fillable = [
        'parent_id', 'name', 'slug', 'description', 'short_description',
        'base_price', 'currency', 'max_adults', 'max_children', 'max_occupancy',
        'bed_configuration', 'size_sqm', 'amenities', 'image',
        'is_active', 'sort_order',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'amenities' => 'array',
        'is_active' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }

    public function units(): HasMany
    {
        return $this->hasMany(RoomUnit::class)->orderBy('sort_order');
    }

    public function ratePeriods(): HasMany
    {
        return $this->hasMany(RatePeriod::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /** This type + active subtypes (for inventory search on parent categories). */
    public function bookableTypeIds(): array
    {
        $ids = [$this->id];
        foreach ($this->children()->where('is_active', true)->pluck('id') as $id) {
            $ids[] = $id;
        }
        return $ids;
    }

    public function priceForDate(\\Carbon\\CarbonInterface $date): float
    {
        $override = $this->ratePeriods()
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->orderByDesc('price_per_night')
            ->first();

        return (float) ($override?->price_per_night ?? $this->base_price);
    }

    public function averageNightlyRate(string $checkIn, string $checkOut): float
    {
        $start = \\Carbon\\Carbon::parse($checkIn)->startOfDay();
        $end = \\Carbon\\Carbon::parse($checkOut)->startOfDay();
        $nights = max(0, $start->diffInDays($end));
        if ($nights === 0) {
            return (float) $this->base_price;
        }
        $total = 0.0;
        $cursor = $start->copy();
        for ($i = 0; $i < $nights; $i++) {
            $total += $this->priceForDate($cursor);
            $cursor->addDay();
        }
        return round($total / $nights, 2);
    }

    public function totalForStay(string $checkIn, string $checkOut): float
    {
        $start = \\Carbon\\Carbon::parse($checkIn)->startOfDay();
        $end = \\Carbon\\Carbon::parse($checkOut)->startOfDay();
        $nights = max(0, $start->diffInDays($end));
        $total = 0.0;
        $cursor = $start->copy();
        for ($i = 0; $i < $nights; $i++) {
            $total += $this->priceForDate($cursor);
            $cursor->addDay();
        }
        return round($total, 2);
    }

    public function acceptsGuests(int $adults, int $children): bool
    {
        if ($adults < 1) return false;
        if ($adults > $this->max_adults) return false;
        if ($children > $this->max_children) return false;
        return ($adults + $children) <= $this->max_occupancy;
    }
}
`

  files['app/Models/RoomUnit.php'] = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class RoomUnit extends Model
{
    protected $fillable = [
        'room_type_id', 'code', 'floor', 'name', 'status', 'is_active', 'notes', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function isBookable(): bool
    {
        return $this->is_active && $this->status === 'available';
    }
}
`

  files['app/Models/RatePeriod.php'] = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class RatePeriod extends Model
{
    protected $fillable = [
        'room_type_id', 'name', 'start_date', 'end_date', 'price_per_night', 'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'price_per_night' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }
}
`

  files['app/Models/Reservation.php'] = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Support\\Str;

class Reservation extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CHECKED_IN = 'checked_in';
    public const STATUS_CHECKED_OUT = 'checked_out';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_NO_SHOW = 'no_show';

    /** Statuses that block inventory for overlapping dates. */
    public const BLOCKING_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
        self::STATUS_CHECKED_IN,
    ];

    public const ALL_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
        self::STATUS_CHECKED_IN,
        self::STATUS_CHECKED_OUT,
        self::STATUS_CANCELLED,
        self::STATUS_NO_SHOW,
    ];

    protected $fillable = [
        'confirmation_code', 'room_type_id', 'room_unit_id',
        'check_in', 'check_out', 'adults', 'children',
        'guest_name', 'guest_email', 'guest_phone',
        'status', 'nightly_rate', 'total_price', 'currency',
        'special_requests', 'admin_notes', 'source',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'nightly_rate' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function roomUnit(): BelongsTo
    {
        return $this->belongsTo(RoomUnit::class);
    }

    public function isBlocking(): bool
    {
        return in_array($this->status, self::BLOCKING_STATUSES, true);
    }

    public function nights(): int
    {
        return max(0, $this->check_in->diffInDays($this->check_out));
    }

    public static function generateConfirmationCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (static::where('confirmation_code', $code)->exists());

        return $code;
    }

    protected static function booted(): void
    {
        static::creating(function (self $reservation) {
            if (empty($reservation->confirmation_code)) {
                $reservation->confirmation_code = static::generateConfirmationCode();
            }
            if (empty($reservation->status)) {
                $reservation->status = self::STATUS_CONFIRMED;
            }
            if (empty($reservation->source)) {
                $reservation->source = 'admin';
            }
        });
    }
}
`

  files['app/Services/AvailabilityService.php'] = `<?php

namespace App\\Services;

use App\\Models\\Reservation;
use App\\Models\\RoomType;
use App\\Models\\RoomUnit;
use Illuminate\\Support\\Collection;
use Illuminate\\Support\\Facades\\DB;

class AvailabilityService
{
    /**
     * Units of the given type (and subtypes) free for [checkIn, checkOut).
     */
    public function availableUnits(RoomType $type, string $checkIn, string $checkOut): Collection
    {
        $typeIds = $type->bookableTypeIds();

        $busyUnitIds = Reservation::query()
            ->whereIn('status', Reservation::BLOCKING_STATUSES)
            ->whereNotNull('room_unit_id')
            ->where('check_in', '<', $checkOut)
            ->where('check_out', '>', $checkIn)
            ->pluck('room_unit_id')
            ->all();

        return RoomUnit::query()
            ->whereIn('room_type_id', $typeIds)
            ->where('is_active', true)
            ->where('status', 'available')
            ->when(count($busyUnitIds), fn ($q) => $q->whereNotIn('id', $busyUnitIds))
            ->orderBy('sort_order')
            ->get();
    }

    public function availableCount(RoomType $type, string $checkIn, string $checkOut): int
    {
        return $this->availableUnits($type, $checkIn, $checkOut)->count();
    }

    /**
     * Atomically assign a free unit and create a confirmed reservation.
     *
     * @throws \\RuntimeException when sold out or capacity exceeded
     */
    public function book(array $data): Reservation
    {
        return DB::transaction(function () use ($data) {
            /** @var RoomType $type */
            $type = RoomType::query()
                ->where('is_active', true)
                ->lockForUpdate()
                ->findOrFail($data['room_type_id']);

            if (! $type->acceptsGuests((int) $data['adults'], (int) ($data['children'] ?? 0))) {
                throw new \\RuntimeException('Guest count exceeds the maximum occupancy for this room type.');
            }

            $checkIn = $data['check_in'];
            $checkOut = $data['check_out'];

            if ($checkIn >= $checkOut) {
                throw new \\RuntimeException('Check-out must be after check-in.');
            }

            $unit = $this->availableUnits($type, $checkIn, $checkOut)->first();
            if (! $unit) {
                throw new \\RuntimeException('No rooms available for the selected dates.');
            }

            // Lock the unit row to reduce race conditions under concurrency
            RoomUnit::query()->whereKey($unit->id)->lockForUpdate()->first();

            $stillFree = $this->availableUnits($type, $checkIn, $checkOut)
                ->contains('id', $unit->id);
            if (! $stillFree) {
                throw new \\RuntimeException('That room was just reserved. Please try again.');
            }

            $total = $type->totalForStay($checkIn, $checkOut);
            $nights = max(1, \\Carbon\\Carbon::parse($checkIn)->diffInDays(\\Carbon\\Carbon::parse($checkOut)));
            $nightly = round($total / $nights, 2);

            return Reservation::create([
                'confirmation_code' => Reservation::generateConfirmationCode(),
                'room_type_id' => $type->id,
                'room_unit_id' => $unit->id,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'adults' => (int) $data['adults'],
                'children' => (int) ($data['children'] ?? 0),
                'guest_name' => $data['guest_name'],
                'guest_email' => $data['guest_email'],
                'guest_phone' => $data['guest_phone'] ?? null,
                'status' => Reservation::STATUS_CONFIRMED,
                'nightly_rate' => $nightly,
                'total_price' => $total,
                'currency' => $type->currency,
                'special_requests' => $data['special_requests'] ?? null,
                'source' => $data['source'] ?? 'website',
            ]);
        });
    }
}
`

  // ── Controllers ─────────────────────────────────────────────────────────
  files['app/Http/Controllers/BookingController.php'] = `<?php

namespace App\\Http\\Controllers;

use App\\Models\\RoomType;
use App\\Models\\SiteSetting;
use App\\Services\\AvailabilityService;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Http\\Request;
use Illuminate\\View\\View;

class BookingController extends Controller
{
    public function __construct(private AvailabilityService $availability) {}

    public function rooms(): View
    {
        $types = RoomType::query()
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return view('site.rooms', [
            'settings' => SiteSetting::current(),
            'roomTypes' => $types,
        ]);
    }

    public function showRoom(string $slug): View
    {
        $type = RoomType::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with(['children' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order'), 'parent'])
            ->firstOrFail();

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

        $types = RoomType::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $results = [];
        if ($checkIn && $checkOut && $checkIn < $checkOut) {
            foreach ($types as $type) {
                if (! $type->acceptsGuests($adults, $children)) {
                    continue;
                }
                // Only list leaf types (or parents that have their own units)
                $count = $this->availability->availableCount($type, $checkIn, $checkOut);
                if ($count < 1) {
                    continue;
                }
                if ($roomTypeId && (int) $roomTypeId !== $type->id && (int) $roomTypeId !== $type->parent_id) {
                    // allow filter by selected type or its parent
                    if ((int) $roomTypeId !== $type->id) {
                        continue;
                    }
                }
                $results[] = [
                    'type' => $type,
                    'available' => $count,
                    'nightly' => $type->averageNightlyRate($checkIn, $checkOut),
                    'total' => $type->totalForStay($checkIn, $checkOut),
                    'nights' => max(1, \\Carbon\\Carbon::parse($checkIn)->diffInDays(\\Carbon\\Carbon::parse($checkOut))),
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
            'room_type_id' => 'required|exists:room_types,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'adults' => 'required|integer|min:1|max:20',
            'children' => 'nullable|integer|min:0|max:20',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'special_requests' => 'nullable|string|max:2000',
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

        return redirect()
            ->route('booking.confirm', $reservation->confirmation_code)
            ->with('booking_success', true);
    }

    public function confirm(string $code): View
    {
        $reservation = \\App\\Models\\Reservation::query()
            ->where('confirmation_code', $code)
            ->with(['roomType', 'roomUnit'])
            ->firstOrFail();

        return view('site.booking-confirm', [
            'settings' => SiteSetting::current(),
            'reservation' => $reservation,
        ]);
    }
}
`

  // ── Blade views ─────────────────────────────────────────────────────────
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
          <div class="flex flex-wrap gap-2 text-xs text-slate-600 mb-4">
            <span class="rounded-full bg-slate-100 px-3 py-1">Up to {{ $type->max_occupancy }} guests</span>
            @if($type->bed_configuration)<span class="rounded-full bg-slate-100 px-3 py-1">{{ $type->bed_configuration }}</span>@endif
            @if($type->size_sqm)<span class="rounded-full bg-slate-100 px-3 py-1">{{ $type->size_sqm }} m²</span>@endif
          </div>
          @if($type->children->isNotEmpty())
          <div class="mb-4 border-t pt-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Options</p>
            <ul class="space-y-2">
              @foreach($type->children as $child)
              <li class="flex justify-between gap-3 text-sm">
                <a href="{{ route('rooms.show', $child->slug) }}" class="font-medium hover:underline">{{ $child->name }}</a>
                <span class="text-slate-500 shrink-0">from {{ number_format($child->base_price, 0) }} {{ $child->currency }}</span>
              </li>
              @endforeach
            </ul>
          </div>
          @endif
          <div class="flex flex-wrap gap-3">
            <a href="{{ route('rooms.show', $type->slug) }}" class="text-sm font-semibold" style="color:${accent}">View details →</a>
            <a href="{{ route('book', ['room_type_id' => $type->id]) }}" class="text-sm font-semibold text-slate-700">Book this room →</a>
          </div>
        </div>
      </article>
      @endforeach
    </div>
    @if($roomTypes->isEmpty())
    <p class="text-center text-slate-500">Room types will appear here once configured in the admin dashboard.</p>
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
        @if($roomType->parent)
        <p class="text-xs uppercase tracking-widest text-slate-400 mb-2">{{ $roomType->parent->name }}</p>
        @endif
        <h1 class="text-4xl font-bold mb-2">{{ $roomType->name }}</h1>
        @if($roomType->short_description)<p class="text-slate-500 mb-4">{{ $roomType->short_description }}</p>@endif
        <p class="text-2xl font-bold mb-6" style="color:${accent}">{{ number_format($roomType->base_price, 0) }} {{ $roomType->currency }} <span class="text-base font-normal text-slate-500">/ night</span></p>
        <p class="text-slate-700 leading-relaxed mb-6">{{ $roomType->description }}</p>
        <dl class="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><dt class="text-slate-400">Occupancy</dt><dd class="font-medium">{{ $roomType->max_adults }} adults · {{ $roomType->max_children }} children (max {{ $roomType->max_occupancy }})</dd></div>
          @if($roomType->bed_configuration)<div><dt class="text-slate-400">Beds</dt><dd class="font-medium">{{ $roomType->bed_configuration }}</dd></div>@endif
          @if($roomType->size_sqm)<div><dt class="text-slate-400">Size</dt><dd class="font-medium">{{ $roomType->size_sqm }} m²</dd></div>@endif
        </dl>
        @if(is_array($roomType->amenities) && count($roomType->amenities))
        <div class="mb-8">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Amenities</h2>
          <ul class="flex flex-wrap gap-2">
            @foreach($roomType->amenities as $amenity)
            <li class="rounded-full border px-3 py-1 text-sm">{{ $amenity }}</li>
            @endforeach
          </ul>
        </div>
        @endif
        @if($roomType->children->isNotEmpty())
        <div class="mb-8 border rounded-xl p-4">
          <h2 class="font-semibold mb-3">Available options</h2>
          <ul class="space-y-3">
            @foreach($roomType->children as $child)
            <li class="flex justify-between gap-3 text-sm">
              <a href="{{ route('rooms.show', $child->slug) }}" class="font-medium hover:underline">{{ $child->name }}</a>
              <span>{{ number_format($child->base_price, 0) }} {{ $child->currency }}/night</span>
            </li>
            @endforeach
          </ul>
        </div>
        @endif
        <a href="{{ route('book', ['room_type_id' => $roomType->id]) }}" class="inline-block text-white px-8 py-3 rounded-lg font-semibold" style="background-color:${accent}">Check availability & book</a>
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
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold mb-2">{{ $settings->booking_section_title ?? 'Book Your Stay' }}</h1>
      <p class="text-slate-600">{{ $settings->booking_section_subtitle ?? 'Select dates and guests to see available rooms' }}</p>
    </div>

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
          @foreach($roomTypes as $t)
          <option value="{{ $t->id }}" @selected((string)$roomTypeId === (string)$t->id)>{{ $t->name }}</option>
          @endforeach
        </select>
      </div>
      <div class="md:col-span-5">
        <button type="submit" class="text-white px-6 py-3 rounded-lg font-semibold w-full md:w-auto" style="background-color:${accent}">Search availability</button>
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
        @php $type = $row['type']; @endphp
        <div class="bg-white rounded-2xl border p-6 flex flex-col md:flex-row gap-6">
          @if($type->image)
          <img src="{{ \\App\\Support\\PublicAsset::url($type->image) }}" class="w-full md:w-48 h-36 object-cover rounded-xl shrink-0" alt="" />
          @endif
          <div class="flex-1">
            <h2 class="text-xl font-semibold">{{ $type->name }}</h2>
            <p class="text-sm text-slate-500 mt-1">{{ $type->short_description }}</p>
            <p class="text-sm text-emerald-700 mt-2 font-medium">{{ $row['available'] }} room{{ $row['available'] === 1 ? '' : 's' }} available</p>
            <p class="mt-2 font-bold" style="color:${accent}">{{ number_format($row['total'], 0) }} {{ $type->currency }} <span class="text-sm font-normal text-slate-500">total · {{ $row['nights'] }} night{{ $row['nights'] === 1 ? '' : 's' }} · avg {{ number_format($row['nightly'], 0) }}/night</span></p>
          </div>
          <div class="md:w-80 shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
            <form method="POST" action="{{ route('book.store') }}" class="space-y-3">
              @csrf
              <input type="hidden" name="room_type_id" value="{{ $type->id }}" />
              <input type="hidden" name="check_in" value="{{ $checkIn }}" />
              <input type="hidden" name="check_out" value="{{ $checkOut }}" />
              <input type="hidden" name="adults" value="{{ $adults }}" />
              <input type="hidden" name="children" value="{{ $children }}" />
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Full name</label>
                <input name="guest_name" required value="{{ old('guest_name') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                <input type="email" name="guest_email" required value="{{ old('guest_email') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                <input name="guest_phone" value="{{ old('guest_phone') }}" class="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Special requests</label>
                <textarea name="special_requests" rows="2" class="w-full rounded-lg border px-3 py-2 text-sm">{{ old('special_requests') }}</textarea>
              </div>
              <button type="submit" class="w-full text-white px-4 py-2.5 rounded-lg font-semibold text-sm" style="background-color:${accent}">Reserve now</button>
            </form>
          </div>
        </div>
        @endforeach
      </div>
      @else
      <p class="text-center text-slate-600 bg-white border rounded-2xl p-10">No rooms available for those dates and guest counts. Try different dates or fewer guests.</p>
      @endif
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
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 text-2xl mb-6">✓</div>
    <h1 class="text-3xl font-bold mb-2">You're booked</h1>
    <p class="text-slate-600 mb-8">Your reservation is confirmed. A confirmation has been recorded for our team.</p>
    <div class="bg-slate-50 border rounded-2xl p-6 text-left space-y-3">
      <div class="flex justify-between gap-4"><span class="text-slate-500">Confirmation</span><span class="font-mono font-bold tracking-wider">{{ $reservation->confirmation_code }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Room</span><span class="font-medium">{{ $reservation->roomType->name }}</span></div>
      @if($reservation->roomUnit)<div class="flex justify-between gap-4"><span class="text-slate-500">Assigned unit</span><span>{{ $reservation->roomUnit->code }}</span></div>@endif
      <div class="flex justify-between gap-4"><span class="text-slate-500">Check-in</span><span>{{ $reservation->check_in->format('M j, Y') }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Check-out</span><span>{{ $reservation->check_out->format('M j, Y') }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Guests</span><span>{{ $reservation->adults }} adult{{ $reservation->adults === 1 ? '' : 's' }}@if($reservation->children), {{ $reservation->children }} child{{ $reservation->children === 1 ? '' : 'ren' }}@endif</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Guest</span><span>{{ $reservation->guest_name }}</span></div>
      <div class="flex justify-between gap-4 border-t pt-3"><span class="text-slate-500">Total</span><span class="font-bold" style="color:${accent}">{{ number_format($reservation->total_price, 0) }} {{ $reservation->currency }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Status</span><span class="capitalize">{{ str_replace('_', ' ', $reservation->status) }}</span></div>
    </div>
    <a href="{{ route('home') }}" class="inline-block mt-8 text-sm font-semibold" style="color:${accent}">Back to home →</a>
  </div>
</section>
@endsection
`

  // ── Filament resources ──────────────────────────────────────────────────
  files['app/Filament/Resources/RoomTypeResource.php'] = generateRoomTypeResource()
  Object.assign(files, generateSimpleResourcePages('RoomType', 'RoomTypes'))

  files['app/Filament/Resources/RoomUnitResource.php'] = generateRoomUnitResource()
  Object.assign(files, generateSimpleResourcePages('RoomUnit', 'RoomUnits'))

  files['app/Filament/Resources/RatePeriodResource.php'] = generateRatePeriodResource()
  Object.assign(files, generateSimpleResourcePages('RatePeriod', 'RatePeriods'))

  files['app/Filament/Resources/ReservationResource.php'] = generateReservationResource()
  Object.assign(files, generateSimpleResourcePages('Reservation', 'Reservations'))

  files['app/Filament/Widgets/BookingStatsOverview.php'] = `<?php

namespace App\\Filament\\Widgets;

use App\\Models\\Reservation;
use App\\Models\\RoomType;
use App\\Models\\RoomUnit;
use Filament\\Widgets\\StatsOverviewWidget as BaseWidget;
use Filament\\Widgets\\StatsOverviewWidget\\Stat;

class BookingStatsOverview extends BaseWidget
{
    protected static ?int $sort = 0;

    protected function getStats(): array
    {
        return [
            Stat::make('Active room types', RoomType::where('is_active', true)->count())
                ->description('Sellable categories')
                ->descriptionIcon('heroicon-m-building-office-2')
                ->color('primary'),
            Stat::make('Room units', RoomUnit::where('is_active', true)->count())
                ->description('Physical inventory')
                ->descriptionIcon('heroicon-m-key')
                ->color('info'),
            Stat::make('Upcoming stays', Reservation::whereIn('status', ['pending', 'confirmed'])
                    ->whereDate('check_out', '>=', now())
                    ->count())
                ->description('Pending + confirmed')
                ->descriptionIcon('heroicon-m-calendar-days')
                ->color('success'),
            Stat::make('Checked in now', Reservation::where('status', 'checked_in')->count())
                ->description('On property')
                ->descriptionIcon('heroicon-m-home')
                ->color('warning'),
        ];
    }
}
`

  // ── Seeder fragment helper stored as PHP include used by DatabaseSeeder ─
  files['database/seeders/HospitalitySeeder.php'] = `<?php

namespace Database\\Seeders;

use App\\Models\\RoomType;
use App\\Models\\RoomUnit;
use Illuminate\\Database\\Seeder;

class HospitalitySeeder extends Seeder
{
    public function run(): void
    {
        $types = json_decode('${jsonForPhp(seed)}', true) ?: [];

        RoomUnit::query()->delete();
        RoomType::query()->delete();

        $slugToId = [];

        // First pass: create types without parents
        foreach ($types as $item) {
            if (! empty($item['parent_slug'])) {
                continue;
            }
            $slugToId[$item['slug']] = $this->createType($item, null);
        }

        // Second pass: subtypes
        foreach ($types as $item) {
            if (empty($item['parent_slug'])) {
                continue;
            }
            $parentId = $slugToId[$item['parent_slug']] ?? null;
            $slugToId[$item['slug']] = $this->createType($item, $parentId);
        }

        // Units
        foreach ($types as $item) {
            $typeId = $slugToId[$item['slug']] ?? null;
            if (! $typeId) {
                continue;
            }
            $count = max(1, (int) ($item['unit_count'] ?? 1));
            $prefix = $item['unit_prefix'] ?? 'RM-';
            for ($i = 1; $i <= $count; $i++) {
                RoomUnit::create([
                    'room_type_id' => $typeId,
                    'code' => $prefix . (100 + $i),
                    'status' => 'available',
                    'is_active' => true,
                    'sort_order' => $i,
                ]);
            }
        }
    }

    private function createType(array $item, ?int $parentId): int
    {
        $type = RoomType::create([
            'parent_id' => $parentId,
            'name' => $item['name'],
            'slug' => $item['slug'],
            'description' => $item['description'] ?? null,
            'short_description' => $item['short_description'] ?? null,
            'base_price' => $item['base_price'] ?? 0,
            'currency' => $item['currency'] ?? 'USD',
            'max_adults' => $item['max_adults'] ?? 2,
            'max_children' => $item['max_children'] ?? 0,
            'max_occupancy' => $item['max_occupancy'] ?? 2,
            'bed_configuration' => $item['bed_configuration'] ?? null,
            'size_sqm' => $item['size_sqm'] ?? null,
            'amenities' => $item['amenities'] ?? [],
            'image' => $item['image'] ?? null,
            'is_active' => $item['is_active'] ?? true,
            'sort_order' => $item['sort_order'] ?? 0,
        ]);

        return $type->id;
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
use Filament\\Actions;
use Filament\\Resources\\Pages\\ListRecords;

class List${listName} extends ListRecords
{
    protected static string $resource = ${name}Resource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\\CreateAction::make()];
    }
}
`,
    [`app/Filament/Resources/${name}Resource/Pages/Create${name}.php`]: `<?php

namespace App\\Filament\\Resources\\${name}Resource\\Pages;

use App\\Filament\\Resources\\${name}Resource;
use Filament\\Resources\\Pages\\CreateRecord;

class Create${name} extends CreateRecord
{
    protected static string $resource = ${name}Resource::class;
}
`,
    [`app/Filament/Resources/${name}Resource/Pages/Edit${name}.php`]: `<?php

namespace App\\Filament\\Resources\\${name}Resource\\Pages;

use App\\Filament\\Resources\\${name}Resource;
use Filament\\Actions;
use Filament\\Resources\\Pages\\EditRecord;

class Edit${name} extends EditRecord
{
    protected static string $resource = ${name}Resource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\\DeleteAction::make()];
    }
}
`,
  }
}

function generateRoomTypeResource(): string {
  return `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\RoomTypeResource\\Pages;
use App\\Models\\RoomType;
use Filament\\Forms;
use Filament\\Forms\\Form;
use Filament\\Resources\\Resource;
use Filament\\Tables;
use Filament\\Tables\\Table;
use Illuminate\\Support\\Str;

class RoomTypeResource extends Resource
{
    protected static ?string $model = RoomType::class;
    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $navigationLabel = 'Room Types';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\\Components\\Section::make('Identity')->schema([
                Forms\\Components\\Select::make('parent_id')
                    ->label('Parent type (for subtypes)')
                    ->relationship('parent', 'name')
                    ->searchable()
                    ->preload()
                    ->nullable(),
                Forms\\Components\\TextInput::make('name')->required()->live(onBlur: true)
                    ->afterStateUpdated(fn ($state, Forms\\Set $set) => $set('slug', Str::slug($state))),
                Forms\\Components\\TextInput::make('slug')->required()->unique(ignoreRecord: true),
                Forms\\Components\\TextInput::make('short_description')->maxLength(255),
                Forms\\Components\\Textarea::make('description')->rows(4)->columnSpanFull(),
                Forms\\Components\\FileUpload::make('image')->image()->disk('public')->directory('uploads'),
            ])->columns(2),
            Forms\\Components\\Section::make('Pricing & capacity')->schema([
                Forms\\Components\\TextInput::make('base_price')->numeric()->required()->prefix('Amount'),
                Forms\\Components\\TextInput::make('currency')->default('USD')->maxLength(3)->required(),
                Forms\\Components\\TextInput::make('max_adults')->numeric()->required()->default(2),
                Forms\\Components\\TextInput::make('max_children')->numeric()->required()->default(0),
                Forms\\Components\\TextInput::make('max_occupancy')->numeric()->required()->default(2),
                Forms\\Components\\TextInput::make('bed_configuration'),
                Forms\\Components\\TextInput::make('size_sqm')->label('Size (m²)'),
                Forms\\Components\\TagsInput::make('amenities')->placeholder('Add amenity'),
                Forms\\Components\\Toggle::make('is_active')->default(true),
                Forms\\Components\\TextInput::make('sort_order')->numeric()->default(0),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\\Columns\\ImageColumn::make('image')->disk('public'),
                Tables\\Columns\\TextColumn::make('name')->searchable()->sortable(),
                Tables\\Columns\\TextColumn::make('parent.name')->label('Parent')->toggleable(),
                Tables\\Columns\\TextColumn::make('base_price')->money(fn ($record) => $record->currency)->sortable(),
                Tables\\Columns\\TextColumn::make('max_occupancy')->label('Max guests'),
                Tables\\Columns\\TextColumn::make('units_count')->counts('units')->label('Units'),
                Tables\\Columns\\IconColumn::make('is_active')->boolean(),
                Tables\\Columns\\TextColumn::make('sort_order')->sortable(),
            ])
            ->defaultSort('sort_order')
            ->actions([
                Tables\\Actions\\EditAction::make(),
                Tables\\Actions\\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\\Actions\\BulkActionGroup::make([
                    Tables\\Actions\\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\\ListRoomTypes::route('/'),
            'create' => Pages\\CreateRoomType::route('/create'),
            'edit' => Pages\\EditRoomType::route('/{record}/edit'),
        ];
    }
}
`
}

function generateRoomUnitResource(): string {
  return `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\RoomUnitResource\\Pages;
use App\\Models\\RoomUnit;
use Filament\\Forms;
use Filament\\Forms\\Form;
use Filament\\Resources\\Resource;
use Filament\\Tables;
use Filament\\Tables\\Table;

class RoomUnitResource extends Resource
{
    protected static ?string $model = RoomUnit::class;
    protected static ?string $navigationIcon = 'heroicon-o-key';
    protected static ?string $navigationLabel = 'Room Units';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\\Components\\Select::make('room_type_id')
                ->relationship('roomType', 'name')
                ->required()
                ->searchable()
                ->preload(),
            Forms\\Components\\TextInput::make('code')->required()->maxLength(50),
            Forms\\Components\\TextInput::make('name')->maxLength(100),
            Forms\\Components\\TextInput::make('floor')->maxLength(20),
            Forms\\Components\\Select::make('status')
                ->options([
                    'available' => 'Available',
                    'maintenance' => 'Maintenance',
                    'out_of_service' => 'Out of service',
                ])
                ->required()
                ->default('available'),
            Forms\\Components\\Toggle::make('is_active')->default(true),
            Forms\\Components\\Textarea::make('notes')->rows(3)->columnSpanFull(),
            Forms\\Components\\TextInput::make('sort_order')->numeric()->default(0),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\\Columns\\TextColumn::make('code')->searchable()->sortable(),
                Tables\\Columns\\TextColumn::make('roomType.name')->label('Type')->sortable(),
                Tables\\Columns\\TextColumn::make('floor'),
                Tables\\Columns\\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'available',
                        'warning' => 'maintenance',
                        'danger' => 'out_of_service',
                    ]),
                Tables\\Columns\\IconColumn::make('is_active')->boolean(),
            ])
            ->defaultSort('sort_order')
            ->actions([
                Tables\\Actions\\EditAction::make(),
                Tables\\Actions\\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\\Actions\\BulkActionGroup::make([
                    Tables\\Actions\\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\\ListRoomUnits::route('/'),
            'create' => Pages\\CreateRoomUnit::route('/create'),
            'edit' => Pages\\EditRoomUnit::route('/{record}/edit'),
        ];
    }
}
`
}

function generateRatePeriodResource(): string {
  return `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\RatePeriodResource\\Pages;
use App\\Models\\RatePeriod;
use Filament\\Forms;
use Filament\\Forms\\Form;
use Filament\\Resources\\Resource;
use Filament\\Tables;
use Filament\\Tables\\Table;

class RatePeriodResource extends Resource
{
    protected static ?string $model = RatePeriod::class;
    protected static ?string $navigationIcon = 'heroicon-o-currency-dollar';
    protected static ?string $navigationLabel = 'Seasonal Rates';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\\Components\\Select::make('room_type_id')
                ->relationship('roomType', 'name')
                ->required()
                ->searchable()
                ->preload(),
            Forms\\Components\\TextInput::make('name')->placeholder('High season, Holiday, etc.'),
            Forms\\Components\\DatePicker::make('start_date')->required(),
            Forms\\Components\\DatePicker::make('end_date')->required(),
            Forms\\Components\\TextInput::make('price_per_night')->numeric()->required(),
            Forms\\Components\\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\\Columns\\TextColumn::make('name')->searchable(),
                Tables\\Columns\\TextColumn::make('roomType.name')->label('Type'),
                Tables\\Columns\\TextColumn::make('start_date')->date(),
                Tables\\Columns\\TextColumn::make('end_date')->date(),
                Tables\\Columns\\TextColumn::make('price_per_night')->money('USD'),
                Tables\\Columns\\IconColumn::make('is_active')->boolean(),
            ])
            ->actions([
                Tables\\Actions\\EditAction::make(),
                Tables\\Actions\\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\\ListRatePeriods::route('/'),
            'create' => Pages\\CreateRatePeriod::route('/create'),
            'edit' => Pages\\EditRatePeriod::route('/{record}/edit'),
        ];
    }
}
`
}

function generateReservationResource(): string {
  return `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\ReservationResource\\Pages;
use App\\Models\\Reservation;
use App\\Models\\RoomType;
use App\\Models\\RoomUnit;
use Filament\\Forms;
use Filament\\Forms\\Form;
use Filament\\Resources\\Resource;
use Filament\\Tables;
use Filament\\Tables\\Table;

class ReservationResource extends Resource
{
    protected static ?string $model = Reservation::class;
    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?string $navigationLabel = 'Reservations';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?int $navigationSort = 0;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\\Components\\Section::make('Stay')->schema([
                Forms\\Components\\TextInput::make('confirmation_code')->disabled()->dehydrated(),
                Forms\\Components\\Select::make('room_type_id')
                    ->label('Room type')
                    ->options(fn () => RoomType::orderBy('name')->pluck('name', 'id'))
                    ->required()
                    ->searchable()
                    ->live(),
                Forms\\Components\\Select::make('room_unit_id')
                    ->label('Assigned unit')
                    ->options(function (Forms\\Get $get) {
                        $typeId = $get('room_type_id');
                        $q = RoomUnit::query()->orderBy('code');
                        if ($typeId) {
                            $q->where('room_type_id', $typeId);
                        }
                        return $q->pluck('code', 'id');
                    })
                    ->searchable()
                    ->nullable(),
                Forms\\Components\\DatePicker::make('check_in')->required(),
                Forms\\Components\\DatePicker::make('check_out')->required(),
                Forms\\Components\\TextInput::make('adults')->numeric()->required()->default(1),
                Forms\\Components\\TextInput::make('children')->numeric()->default(0),
                Forms\\Components\\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'checked_in' => 'Checked in',
                        'checked_out' => 'Checked out',
                        'cancelled' => 'Cancelled',
                        'no_show' => 'No show',
                    ])
                    ->required(),
                Forms\\Components\\Select::make('source')
                    ->options([
                        'website' => 'Website',
                        'phone' => 'Phone',
                        'walk_in' => 'Walk-in',
                        'admin' => 'Admin',
                    ])
                    ->default('admin'),
            ])->columns(2),
            Forms\\Components\\Section::make('Guest')->schema([
                Forms\\Components\\TextInput::make('guest_name')->required(),
                Forms\\Components\\TextInput::make('guest_email')->email()->required(),
                Forms\\Components\\TextInput::make('guest_phone'),
                Forms\\Components\\Textarea::make('special_requests')->rows(3),
                Forms\\Components\\Textarea::make('admin_notes')->rows(3),
            ])->columns(2),
            Forms\\Components\\Section::make('Pricing')->schema([
                Forms\\Components\\TextInput::make('nightly_rate')->numeric(),
                Forms\\Components\\TextInput::make('total_price')->numeric(),
                Forms\\Components\\TextInput::make('currency')->maxLength(3)->default('USD'),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\\Columns\\TextColumn::make('confirmation_code')->searchable()->copyable()->label('Code'),
                Tables\\Columns\\TextColumn::make('guest_name')->searchable(),
                Tables\\Columns\\TextColumn::make('roomType.name')->label('Type'),
                Tables\\Columns\\TextColumn::make('roomUnit.code')->label('Unit'),
                Tables\\Columns\\TextColumn::make('check_in')->date()->sortable(),
                Tables\\Columns\\TextColumn::make('check_out')->date(),
                Tables\\Columns\\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'confirmed',
                        'info' => 'checked_in',
                        'gray' => 'checked_out',
                        'danger' => fn ($state) => in_array($state, ['cancelled', 'no_show'], true),
                    ]),
                Tables\\Columns\\TextColumn::make('total_price')->money(fn ($record) => $record->currency),
                Tables\\Columns\\TextColumn::make('source')->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('check_in', 'desc')
            ->filters([
                Tables\\Filters\\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'checked_in' => 'Checked in',
                        'checked_out' => 'Checked out',
                        'cancelled' => 'Cancelled',
                        'no_show' => 'No show',
                    ]),
            ])
            ->actions([
                Tables\\Actions\\EditAction::make(),
                Tables\\Actions\\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\\Actions\\BulkActionGroup::make([
                    Tables\\Actions\\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\\ListReservations::route('/'),
            'create' => Pages\\CreateReservation::route('/create'),
            'edit' => Pages\\EditReservation::route('/{record}/edit'),
        ];
    }
}
`
}

/** Route lines to inject into routes/web.php */
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

/** Nav link fragments for Blade when booking is enabled */
export function bookingNavLinksBlade(): string {
  return `@if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('rooms.index') }}" class="hover:underline opacity-80">Rooms</a><a href="{{ route('book') }}" class="hover:underline opacity-80">Book</a>@endif`
}

export function bookingFooterLinksBlade(): string {
  return `@if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('rooms.index') }}" class="hover:underline opacity-70">Rooms</a><a href="{{ route('book') }}" class="hover:underline opacity-70">Book</a>@endif`
}

/** Settings columns to store section titles */
export function bookingSettingsFields(content: SiteContent): Record<string, unknown> {
  return {
    rooms_section_title: content.roomsSectionTitle || 'Rooms & Suites',
    rooms_section_subtitle: content.roomsSectionSubtitle || '',
    booking_section_title: content.bookingSectionTitle || 'Book Your Stay',
    booking_section_subtitle: content.bookingSectionSubtitle || '',
  }
}
