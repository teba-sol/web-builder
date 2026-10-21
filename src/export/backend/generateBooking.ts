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
import { stayPoliciesAdminFiles } from './generateFilament'
import { roomCalendarFiles } from './generateRoomCalendar'

export function hasBookingFeature(content: SiteContent): boolean {
  return Boolean(content.pageVisibility?.rooms && content.roomTypes?.some((r) => r.name))
}

export function stayRequestPhp(): string {
  return `<?php

namespace App\\Support;

use Carbon\\Carbon;
use Illuminate\\Http\\Request;

class StayRequest
{
    public static function from(Request $request): array
    {
        $submitted = $request->filled('check_in');
        $today = Carbon::today();
        if ($submitted) {
            $checkIn = trim((string) $request->input('check_in', ''));
            $checkOut = trim((string) $request->input('check_out', ''));
        } else {
            $checkIn = $today->copy()->addDay()->toDateString();
            $checkOut = $today->copy()->addDays(3)->toDateString();
        }

        $errors = [];
        $checkInDate = self::parseDate($checkIn);
        $checkOutDate = self::parseDate($checkOut);
        if ($submitted) {
            if ($checkInDate === null) {
                $errors[] = 'Enter a valid check-in date.';
            } elseif ($checkInDate->lt($today)) {
                $errors[] = 'Check-in cannot be before today.';
            }
            if ($checkOutDate === null) {
                $errors[] = 'Enter a valid check-out date.';
            } else {
                if ($checkOutDate->lt($today)) {
                    $errors[] = 'Check-out cannot be before today.';
                }
                if ($checkInDate !== null && ! $checkOutDate->gt($checkInDate)) {
                    $errors[] = 'Check-out must be after check-in.';
                }
            }
        }

        $adults = (int) $request->input('adults', 2);
        if ($submitted && ($adults < 1 || $adults > 20)) {
            $errors[] = 'Adults must be between 1 and 20.';
        }
        if (! $submitted && $adults < 1) {
            $adults = 2;
        }

        $children = (int) $request->input('children', 0);
        if ($submitted && ($children < 0 || $children > 10)) {
            $errors[] = 'Children must be between 0 and 10.';
        }
        $ageCount = ($children >= 0 && $children <= 10) ? $children : 0;
        $childAges = self::agesFor($request, $ageCount);
        if ($submitted && $ageCount > 0) {
            $missing = false;
            $tooOld = false;
            $invalid = false;
            foreach ($childAges as $age) {
                if ($age === '') {
                    $missing = true;
                    continue;
                }
                if (! preg_match('/^\\d+$/', $age)) {
                    $invalid = true;
                    continue;
                }
                if ((int) $age > 17) {
                    $tooOld = true;
                }
            }
            if ($missing) {
                $errors[] = 'Enter the age of each child.';
            }
            if ($tooOld) {
                $errors[] = 'A child must be 17 or younger. Guests 18 and older count as adults.';
            }
            if ($invalid) {
                $errors[] = 'Enter each child age as a whole number from 0 to 17.';
            }
        }

        return [
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
            'adults' => $adults,
            'children' => $children,
            'childAges' => $childAges,
            'searched' => $submitted && $errors === [],
            'errors' => $errors,
            'minDate' => $today->toDateString(),
        ];
    }

    /** @return list<string> */
    private static function agesFor(Request $request, int $children): array
    {
        $raw = $request->input('child_ages', []);
        if (is_string($raw)) {
            $raw = $raw === '' ? [] : array_map('trim', explode(',', $raw));
        }
        if (! is_array($raw)) {
            $raw = [];
        }
        $raw = array_values($raw);
        $ages = [];
        for ($index = 0; $index < $children; $index++) {
            $ages[] = array_key_exists($index, $raw) ? trim((string) $raw[$index]) : '';
        }

        return $ages;
    }

    private static function parseDate(string $value): ?Carbon
    {
        if (! preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $value)) {
            return null;
        }
        $date = Carbon::createFromFormat('!Y-m-d', $value);
        if (! $date || $date->format('Y-m-d') !== $value) {
            return null;
        }

        return $date->startOfDay();
    }
}
`
}

export function staySearchPartial(accent: string): string {
  return `<form method="GET" action="{{ $searchAction }}" data-stay-search data-today="{{ $minDate ?? now()->toDateString() }}" class="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-6 lg:items-end">
  <label class="block text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-in</span><input type="date" name="check_in" value="{{ $checkIn }}" min="{{ $minDate ?? now()->toDateString() }}" required class="w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
  <label class="block text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-out</span><input type="date" name="check_out" value="{{ $checkOut }}" min="{{ $minDate ?? now()->toDateString() }}" required class="w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
  <label class="block text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Adults</span><input type="number" name="adults" min="1" max="20" value="{{ $adults }}" required class="w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
  <label class="block text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Children</span><input type="number" name="children" min="0" max="10" value="{{ $children }}" required class="w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
  @if(!empty($roomTypes))
  <label class="block text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Room type</span><select name="room_type_id" class="w-full rounded-lg border border-slate-300 px-3 py-2.5"><option value="">Any</option>@foreach($roomTypes as $type)<option value="{{ $type['id'] }}" @selected(($roomTypeId ?? '') === ($type['id'] ?? ''))>{{ $type['name'] }}</option>@endforeach</select></label>
  @endif
  <button type="submit" class="rounded-lg px-5 py-3 font-semibold text-white" style="background-color:${accent}">{{ $submitLabel ?? 'Search availability' }}</button>
  <p class="text-xs text-slate-500 lg:col-span-6">Children are 17 or younger. Guests 18 and older count as adults.</p>
  <div data-child-ages class="grid gap-3 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-4">
    @foreach(($childAges ?? []) as $index => $age)
    <label class="block text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Child {{ $index + 1 }} age</span><input type="number" name="child_ages[]" min="0" max="17" @if($age !== '') required @endif value="{{ $age }}" class="w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
    @endforeach
  </div>
  <script type="application/json" data-child-ages-seed>@json($childAges ?? [])</script>
</form>
<script>
(function () {
  var form = document.currentScript && document.currentScript.previousElementSibling;
  if (!form || form.dataset.stayReady !== undefined && form.dataset.stayReady !== '') return;
  if (!form || !form.getAttribute('data-stay-search')) return;
  form.dataset.stayReady = '1';
  var today = form.getAttribute('data-today') || '';
  var checkIn = form.querySelector('[name="check_in"]');
  var checkOut = form.querySelector('[name="check_out"]');
  var childrenInput = form.querySelector('[name="children"]');
  var box = form.querySelector('[data-child-ages]');
  var seedNode = form.querySelector('[data-child-ages-seed]');
  var seed = [];
  try { seed = JSON.parse(seedNode && seedNode.textContent ? seedNode.textContent : '[]'); } catch (e) { seed = []; }
  if (!Array.isArray(seed)) seed = [];
  function addDays(iso, days) {
    var parts = String(iso || '').split('-');
    if (parts.length !== 3) return iso;
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    date.setDate(date.getDate() + days);
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
  }
  function syncCheckoutMin() {
    if (!checkIn || !checkOut) return;
    var base = checkIn.value && today && checkIn.value >= today ? checkIn.value : today;
    var minOut = addDays(base || checkIn.value, 1);
    if (minOut) checkOut.min = minOut;
  }
  function syncAges() {
    if (!childrenInput || !box) return;
    var count = parseInt(childrenInput.value || '0', 10);
    if (isNaN(count) || count < 0) count = 0;
    if (count > 10) count = 10;
    var current = [];
    box.querySelectorAll('input').forEach(function (input) { current.push(input.value); });
    if (!current.length) current = seed.slice();
    box.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var label = document.createElement('label');
      label.className = 'block text-sm';
      var span = document.createElement('span');
      span.className = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500';
      span.textContent = 'Child ' + (i + 1) + ' age';
      var input = document.createElement('input');
      input.type = 'number';
      input.name = 'child_ages[]';
      input.min = '0';
      input.max = '17';
      input.required = true;
      input.value = current[i] != null ? String(current[i]) : '';
      input.className = 'w-full rounded-lg border border-slate-300 px-3 py-2.5';
      label.appendChild(span);
      label.appendChild(input);
      box.appendChild(label);
    }
  }
  if (checkIn) checkIn.addEventListener('change', syncCheckoutMin);
  if (childrenInput) {
    childrenInput.addEventListener('input', function () { seed = []; syncAges(); });
  }
  syncCheckoutMin();
  syncAges();
  form.addEventListener('submit', function (event) {
    if (checkIn && today && checkIn.value < today) {
      event.preventDefault();
      window.alert('Check-in cannot be before today.');
      return;
    }
    if (checkIn && checkOut && (!checkOut.value || checkOut.value <= checkIn.value)) {
      event.preventDefault();
      window.alert('Check-out must be after check-in.');
      return;
    }
    var ages = box ? box.querySelectorAll('input') : [];
    for (var i = 0; i < ages.length; i++) {
      var value = ages[i].value;
      if (value === '') {
        event.preventDefault();
        window.alert('Enter the age of each child.');
        return;
      }
      if (Number(value) > 17) {
        event.preventDefault();
        window.alert('A child must be 17 or younger. Guests 18 and older count as adults.');
        return;
      }
    }
  });
})();
</script>`
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
    currency: rt.currency || 'ETB',
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
  files['resources/views/partials/stay-policies.blade.php'] = stayPoliciesPartial()
  files['resources/views/partials/stay-search.blade.php'] = staySearchPartial(accent)
  files['app/Support/StayRequest.php'] = stayRequestPhp()
  Object.assign(files, stayPoliciesAdminFiles(true))

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

    public function updateRoomType(string $typeId, array $payload): array
    {
        return $this->request('patch', '/room-types/' . $typeId, $payload);
    }

    public function deleteRoomType(string $typeId): void
    {
        $this->request('delete', '/room-types/' . $typeId);
    }

    public function uploadImage(string $bytes, string $filename, string $mime): string
    {
        if (! $this->configured()) {
            throw new RuntimeException('CRS is not configured. Set CRS_API_URL, CRS_API_KEY, and CRS_HOTEL_ID in .env.');
        }
        try {
            $response = Http::timeout(60)
                ->acceptJson()
                ->withHeaders(['X-Api-Key' => config('crs.key')])
                ->attach('file', $bytes, $filename, ['Content-Type' => $mime])
                ->post(config('crs.url') . $this->hotelPath('/images'));
            if ($response->failed()) {
                $message = $response->json('message') ?? $response->body();
                throw new RuntimeException(is_string($message) && $message !== '' ? $message : 'Could not store the room photo.');
            }
            $url = $response->json('url');
            if (! is_string($url) || $url === '') {
                throw new RuntimeException('BuildAura did not return a photo URL.');
            }
            return $url;
        } catch (\\Throwable $e) {
            if ($e instanceof RuntimeException) {
                throw $e;
            }
            throw new RuntimeException('Could not reach BuildAura CRS: ' . $e->getMessage(), 0, $e);
        }
    }

    public function createUnit(array $payload): array
    {
        return $this->post('/units', $payload);
    }

    public function updateUnit(string $unitId, array $payload): array
    {
        return $this->request('patch', '/units/' . $unitId, $payload);
    }

    public function deleteUnit(string $unitId): void
    {
        $this->request('delete', '/units/' . $unitId);
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

    /** Active types in inventory order, including subtypes and orphaned subtypes. */
    public static function catalogue(array $inventory): array
    {
        $mapped = array_map([self::class, 'type'], $inventory['roomTypes'] ?? []);
        $byId = [];
        foreach ($mapped as $type) {
            if (! empty($type->id)) {
                $byId[$type->id] = $type;
            }
        }
        foreach ($mapped as $type) {
            if ($type->parent_id && isset($byId[$type->parent_id])) {
                $type->parent = $byId[$type->parent_id];
            }
        }

        return array_values(array_filter($mapped, fn ($type) => $type->is_active));
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
            'currency' => $row['currency'] ?? 'ETB',
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
            $table->json('child_ages')->nullable();
            $table->string('guest_name');
            $table->string('guest_email');
            $table->string('guest_phone')->nullable();
            $table->string('status')->default('confirmed');
            $table->decimal('nightly_rate', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->string('currency', 3)->default('ETB');
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
        'room_type_name', 'room_unit_code', 'check_in', 'check_out', 'adults', 'children', 'child_ages',
        'guest_name', 'guest_email', 'guest_phone', 'status', 'nightly_rate', 'total_price',
        'currency', 'special_requests', 'admin_notes', 'source', 'payment_status',
        'payment_method', 'payment_holder', 'payment_last4', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'child_ages' => 'array',
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
        $wanted = $data['room_unit_id'] ?? null;
        $unit = null;
        foreach ($match['units'] ?? [] as $candidate) {
            if ($wanted && ($candidate['id'] ?? null) !== $wanted) {
                continue;
            }
            $unit = $candidate;
            break;
        }
        if (! $unit) {
            throw new RuntimeException($wanted
                ? 'That room is no longer available for the selected dates.'
                : 'No rooms available for the selected dates.');
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
        $arrival = ($data['payment_method'] ?? '') === 'arrival';
        $digits = $arrival ? '' : preg_replace('/\\D/', '', (string) ($data['card_number'] ?? ''));
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
            'child_ages' => array_values(array_map('intval', $data['child_ages'] ?? [])),
            'guest_name' => $data['guest_name'],
            'guest_email' => $data['guest_email'],
            'guest_phone' => $data['guest_phone'] ?? null,
            'status' => Reservation::STATUS_CONFIRMED,
            'nightly_rate' => $nightly,
            'total_price' => round($nightly * $nights, 2),
            'currency' => $type->currency,
            'special_requests' => $data['special_requests'] ?? null,
            'source' => $data['source'] ?? 'website',
            'payment_status' => $arrival ? 'unpaid' : 'paid',
            'payment_method' => $arrival ? 'pay_on_arrival' : 'fake_card',
            'payment_holder' => $arrival ? null : ($data['card_holder'] ?? $data['guest_name']),
            'payment_last4' => (! $arrival && $digits !== '') ? substr($digits, -4) : null,
            'paid_at' => $arrival ? null : now(),
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
use App\\Support\\StayRequest;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Http\\Request;
use Illuminate\\View\\View;

class BookingController extends Controller
{
    public function __construct(private CrsClient $crs, private AvailabilityService $availability) {}

    public function rooms(Request $request): View
    {
        $stay = $this->stayQuery($request);
        $inventory = $this->crs->inventory();
        $cards = [];
        if ($stay['searched']) {
            foreach ($this->offers($stay, null) as $offer) {
                $cards[] = ['type' => $offer['type'], 'offer' => $offer, 'children' => collect()];
            }
        } else {
            foreach (CrsInventory::catalogue($inventory) as $type) {
                $cards[] = ['type' => $type, 'offer' => null, 'children' => collect()];
            }
        }
        return $this->stayView('site.rooms', $stay, [
            'settings' => SiteSetting::current(),
            'cards' => $cards,
        ]);
    }

    public function showRoom(Request $request, string $slug): View
    {
        $stay = $this->stayQuery($request);
        $inventory = $this->crs->inventory();
        $type = CrsInventory::findType($inventory, $slug);
        abort_unless($type, 404);
        $offer = null;
        if ($stay['searched']) {
            foreach ($this->offers($stay, $type->id) as $row) {
                if ($row['type']->id === $type->id) {
                    $offer = $row;
                    break;
                }
            }
        }
        return $this->stayView('site.room-detail', $stay, [
            'settings' => SiteSetting::current(),
            'roomType' => $type,
            'offer' => $offer,
        ]);
    }

    public function bookForm(Request $request): View|RedirectResponse
    {
        $stay = $this->stayQuery($request);
        $roomTypeId = (string) $request->query('room_type_id', '');
        $unitId = (string) $request->query('room_unit_id', '');
        $back = $this->stayBack($request, $stay);
        if (! $stay['searched'] || $roomTypeId === '') {
            return redirect()->route('rooms.index', $back);
        }
        $type = null;
        foreach (CrsInventory::allTypes($this->crs->inventory()) as $candidate) {
            if ($candidate->id === $roomTypeId) {
                $type = $candidate;
                break;
            }
        }
        if (! $type) {
            return redirect()->route('rooms.index', $back)->withErrors(['booking' => 'Choose a room to continue.']);
        }
        $offer = null;
        foreach ($this->offers($stay, $roomTypeId) as $row) {
            if ($row['type']->id === $roomTypeId) {
                $offer = $row;
                break;
            }
        }
        if (! $offer) {
            return redirect()->route('rooms.show', array_merge(['slug' => $type->slug], $back))
                ->withErrors(['booking' => 'That room is not available for those dates.']);
        }
        $unit = null;
        foreach ($offer['units'] as $candidate) {
            if ($unitId === '' || ($candidate['id'] ?? null) === $unitId) {
                $unit = $candidate;
                break;
            }
        }
        if (! $unit) {
            return redirect()->route('rooms.show', array_merge(['slug' => $type->slug], $back))
                ->withErrors(['booking' => 'That room was just taken. Choose another.']);
        }
        return $this->stayView('site.book', $stay, [
            'settings' => SiteSetting::current(),
            'roomType' => $type,
            'unit' => $unit,
            'offer' => $offer,
        ]);
    }

    private function stayQuery(Request $request): array
    {
        return StayRequest::from($request);
    }

    private function stayView(string $name, array $stay, array $data): View
    {
        $messages = $stay['errors'];
        unset($stay['errors']);
        $view = view($name, array_merge($data, $stay));
        if ($messages !== []) {
            $view->withErrors($messages);
        }

        return $view;
    }

    private function stayBack(Request $request, array $stay): array
    {
        if (! $request->filled('check_in')) {
            return [];
        }
        $back = [
            'check_in' => $stay['checkIn'],
            'check_out' => $stay['checkOut'],
            'adults' => $stay['adults'],
            'children' => $stay['children'],
        ];
        if ((int) $stay['children'] > 0) {
            $back['child_ages'] = $stay['childAges'];
        }

        return $back;
    }

    private function offers(array $stay, ?string $roomTypeId): array
    {
        if (! $stay['searched'] || $stay['checkIn'] >= $stay['checkOut']) {
            return [];
        }
        $availability = $this->crs->availability($stay['checkIn'], $stay['checkOut'], $roomTypeId ?: null);
        $nights = max(1, (int) \\Carbon\\Carbon::parse($stay['checkIn'])->diffInDays(\\Carbon\\Carbon::parse($stay['checkOut'])));
        $results = [];
        foreach ($availability['types'] ?? [] as $row) {
            $type = CrsInventory::type($row['roomType']);
            if (! CrsInventory::acceptsGuests($type, $stay['adults'], $stay['children'])) {
                continue;
            }
            $count = (int) ($row['availableCount'] ?? 0);
            if ($count < 1) {
                continue;
            }
            $nightly = (float) ($row['nightlyRate'] ?? $type->base_price);
            $results[] = [
                'type' => $type,
                'available' => $count,
                'units' => array_values($row['units'] ?? []),
                'nightly' => $nightly,
                'total' => round($nightly * $nights, 2),
                'nights' => $nights,
            ];
        }
        return $results;
    }

    public function store(Request $request): RedirectResponse
    {
        $stay = StayRequest::from($request);
        if ($stay['errors'] !== []) {
            return back()->withInput()->withErrors($stay['errors']);
        }
        $payOnArrival = (bool) SiteSetting::current()->pay_on_arrival;
        $rules = [
            'room_type_id' => 'required|string',
            'room_unit_id' => 'nullable|string',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'adults' => 'required|integer|min:1|max:20',
            'children' => 'nullable|integer|min:0|max:10',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'special_requests' => 'nullable|string|max:2000',
        ];
        if ($payOnArrival) {
            $rules['payment_method'] = 'required|in:card,arrival';
        } else {
            $rules['card_holder'] = 'required|string|max:255';
            $rules['card_number'] = 'required|string|min:12|max:24';
            $rules['card_expiry'] = 'required|string|max:7';
            $rules['card_cvc'] = 'required|string|min:3|max:4';
        }
        $validated = $request->validate($rules);
        $arrival = $payOnArrival && ($validated['payment_method'] ?? '') === 'arrival';
        if ($payOnArrival && ! $arrival) {
            $validated = array_merge($validated, $request->validate([
                'card_holder' => 'required|string|max:255',
                'card_number' => 'required|string|min:12|max:24',
                'card_expiry' => 'required|string|max:7',
                'card_cvc' => 'required|string|min:3|max:4',
            ]));
        }
        $validated['payment_method'] = $arrival ? 'arrival' : 'card';
        try {
            $reservation = $this->availability->book([
                ...$validated,
                'check_in' => $stay['checkIn'],
                'check_out' => $stay['checkOut'],
                'adults' => $stay['adults'],
                'children' => $stay['children'],
                'child_ages' => array_map('intval', $stay['childAges']),
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
@php
  $stayQuery = $searched ? ['check_in' => $checkIn, 'check_out' => $checkOut, 'adults' => $adults, 'children' => $children, 'child_ages' => $childAges] : [];
@endphp
<section class="bg-slate-50 py-12">
  <div class="mx-auto max-w-6xl px-6">
    <div class="mb-8">
      <div class="max-w-3xl">
        <h1 class="text-4xl font-bold">{{ $settings->rooms_section_title ?? 'Rooms & Suites' }}</h1>
        <p class="mt-3 text-lg text-slate-600">{{ $settings->rooms_section_subtitle ?? 'Choose dates and guests, then open a room to see what is free.' }}</p>
      </div>
      @include('partials.stay-policies')
    </div>
    @include('partials.stay-search', ['searchAction' => route('rooms.index'), 'checkIn' => $checkIn, 'checkOut' => $checkOut, 'adults' => $adults, 'children' => $children, 'childAges' => $childAges, 'minDate' => $minDate, 'submitLabel' => 'Search'])
    @if($errors->any())
    <div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>
    @endif
    <div class="mt-8 space-y-6">
      @forelse($cards as $card)
      @php
        $type = $card['type'];
        $offer = $card['offer'];
        $amenities = is_array($type->amenities) ? $type->amenities : array_filter(array_map('trim', explode(',', (string) $type->amenities)));
      @endphp
      <article class="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div class="grid md:grid-cols-[320px_1fr]">
          @if($type->image)
          <a href="{{ route('rooms.show', array_merge(['slug' => $type->slug], $stayQuery)) }}" class="block min-h-56">
            <img src="{{ \\App\\Support\\PublicAsset::url($type->image) }}" alt="{{ $type->name }}" class="h-full w-full object-cover md:min-h-full" />
          </a>
          @else
          <div class="min-h-56 bg-slate-100"></div>
          @endif
          <div class="flex flex-col p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl font-semibold"><a href="{{ route('rooms.show', array_merge(['slug' => $type->slug], $stayQuery)) }}" class="hover:underline">{{ $type->name }}</a></h2>
                @if($type->short_description)<p class="mt-1 text-sm text-slate-500">{{ $type->short_description }}</p>@endif
                @if($type->parent)<p class="mt-1 text-xs uppercase tracking-widest text-slate-400">{{ $type->parent->name }}</p>@endif
              </div>
              <div class="text-right">
                @if($offer)
                <p class="text-xl font-bold" style="color:${accent}">{{ number_format($offer['total'], 0) }} {{ $type->currency }}</p>
                <p class="text-xs text-slate-500">{{ $offer['nights'] }} night{{ $offer['nights'] === 1 ? '' : 's' }} · {{ number_format($offer['nightly'], 0) }} / night</p>
                @else
                <p class="text-xl font-bold" style="color:${accent}">{{ number_format($type->base_price, 0) }} {{ $type->currency }}</p>
                <p class="text-xs text-slate-500">per night</p>
                @endif
              </div>
            </div>
            @if($type->description)<p class="mt-4 leading-relaxed text-slate-600">{{ $type->description }}</p>@endif
            <div class="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
              <span class="rounded-full bg-slate-100 px-3 py-1">Up to {{ $type->max_adults }} adults</span>
              <span class="rounded-full bg-slate-100 px-3 py-1">{{ $type->max_children }} children</span>
              @if($type->bed_configuration)<span class="rounded-full bg-slate-100 px-3 py-1">{{ $type->bed_configuration }}</span>@endif
              @if($type->size_sqm)<span class="rounded-full bg-slate-100 px-3 py-1">{{ $type->size_sqm }} m²</span>@endif
              @foreach(array_slice($amenities, 0, 6) as $amenity)<span class="rounded-full bg-slate-100 px-3 py-1">{{ $amenity }}</span>@endforeach
            </div>
            <div class="mt-4">@include('partials.stay-policies', ['compact' => true])</div>
            <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
              @if($offer)
              <p class="text-sm font-medium text-emerald-700">{{ $offer['available'] }} room{{ $offer['available'] === 1 ? '' : 's' }} available</p>
              @else
              <p class="text-sm text-slate-500">Search dates to see which rooms are free.</p>
              @endif
              <a href="{{ route('rooms.show', array_merge(['slug' => $type->slug], $stayQuery)) }}" class="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style="background-color:${accent}">View room</a>
            </div>
          </div>
        </div>
      </article>
      @empty
      <p class="rounded-2xl border bg-white p-10 text-center text-slate-600">{{ $searched ? 'No rooms are free for those dates and guests. Try different dates or fewer people.' : 'Rooms appear here once this site can reach BuildAura.' }}</p>
      @endforelse
    </div>
  </div>
</section>
@endsection
`

  files['resources/views/site/room-detail.blade.php'] = `@extends('layouts.site')
@section('title', $roomType->name . ' — ' . $settings->business_name)
@section('content')
@php
  $amenities = is_array($roomType->amenities) ? $roomType->amenities : array_filter(array_map('trim', explode(',', (string) $roomType->amenities)));
  $stayQuery = $searched ? ['check_in' => $checkIn, 'check_out' => $checkOut, 'adults' => $adults, 'children' => $children, 'child_ages' => $childAges] : [];
@endphp
<section class="bg-slate-50 py-12">
  <div class="mx-auto max-w-6xl px-6">
    <a href="{{ route('rooms.index', $stayQuery) }}" class="text-sm text-slate-500 hover:underline">← All rooms</a>
    <div class="mt-6 grid items-start gap-10 lg:grid-cols-2">
      <div>
        @if($roomType->image)
        <img src="{{ \\App\\Support\\PublicAsset::url($roomType->image) }}" alt="{{ $roomType->name }}" class="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg" />
        @else
        <div class="aspect-[4/3] w-full rounded-2xl bg-slate-100"></div>
        @endif
      </div>
      <div>
        @if($roomType->parent)<p class="mb-2 text-xs uppercase tracking-widest text-slate-400">{{ $roomType->parent->name }}</p>@endif
        <h1 class="text-4xl font-bold">{{ $roomType->name }}</h1>
        @if($roomType->short_description)<p class="mt-2 text-slate-500">{{ $roomType->short_description }}</p>@endif
        <p class="mt-4 text-2xl font-bold" style="color:${accent}">{{ number_format(is_array($offer) ? ($offer['nightly'] ?? $roomType->base_price) : $roomType->base_price, 0) }} {{ $roomType->currency }} <span class="text-base font-normal text-slate-500">/ night</span></p>
        @if($roomType->description)<p class="mt-5 leading-relaxed text-slate-700">{{ $roomType->description }}</p>@endif
        <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt class="text-slate-400">Sleeps</dt><dd class="font-medium">{{ $roomType->max_adults }} adults · {{ $roomType->max_children }} children</dd></div>
          <div><dt class="text-slate-400">Maximum</dt><dd class="font-medium">{{ $roomType->max_occupancy }} guests</dd></div>
          @if($roomType->bed_configuration)<div><dt class="text-slate-400">Beds</dt><dd class="font-medium">{{ $roomType->bed_configuration }}</dd></div>@endif
          @if($roomType->size_sqm)<div><dt class="text-slate-400">Size</dt><dd class="font-medium">{{ $roomType->size_sqm }} m²</dd></div>@endif
        </dl>
        @if(count($amenities))
        <div class="mt-6">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-400">In the room</h2>
          <ul class="mt-3 flex flex-wrap gap-2">@foreach($amenities as $amenity)<li class="rounded-full border bg-white px-3 py-1 text-sm">{{ $amenity }}</li>@endforeach</ul>
        </div>
        @endif
        @include('partials.stay-policies')
      </div>
    </div>
    <div class="mt-10">
      <h2 class="text-2xl font-semibold">Check this room</h2>
      <p class="mt-1 mb-4 text-slate-600">Enter your dates and guests. Free rooms for this type are listed below.</p>
      @include('partials.stay-search', ['searchAction' => route('rooms.show', $roomType->slug), 'checkIn' => $checkIn, 'checkOut' => $checkOut, 'adults' => $adults, 'children' => $children, 'childAges' => $childAges, 'minDate' => $minDate, 'submitLabel' => 'Show available rooms'])
    </div>
    @if($errors->any())
    <div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>
    @endif
    <div class="mt-8">
      @if($searched)
        @if($offer)
        <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 class="text-2xl font-semibold">Available rooms</h2>
          <p class="text-sm text-slate-600">{{ $offer['available'] }} free · {{ number_format($offer['total'], 0) }} {{ $roomType->currency }} for {{ $offer['nights'] }} night{{ $offer['nights'] === 1 ? '' : 's' }}</p>
        </div>
        <ul class="space-y-3">
          @foreach($offer['units'] as $unit)
          <li class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-5">
            <div>
              <p class="text-lg font-semibold">Room {{ $unit['code'] ?? '' }}</p>
              <p class="text-sm text-slate-500">@if(!empty($unit['name'])){{ $unit['name'] }}@endif @if(!empty($unit['floor'])) · Floor {{ $unit['floor'] }}@endif</p>
            </div>
            <a href="{{ route('book', array_merge($stayQuery, ['room_type_id' => $roomType->id, 'room_unit_id' => $unit['id'] ?? ''])) }}" class="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style="background-color:${accent}">Reserve this room</a>
          </li>
          @endforeach
        </ul>
        @else
        <p class="rounded-2xl border bg-white p-8 text-slate-600">No rooms of this type are free for those dates and guests.</p>
        @endif
      @else
      <p class="rounded-2xl border bg-white p-8 text-slate-600">Search above to see the rooms that are free, then continue to checkout.</p>
      @endif
    </div>
  </div>
</section>
@endsection
`

  files['resources/views/site/book.blade.php'] = `@extends('layouts.site')
@section('title', 'Checkout — ' . $settings->business_name)
@section('content')
<section class="bg-slate-50 py-12">
  <div class="mx-auto max-w-5xl px-6">
    <a href="{{ route('rooms.show', array_merge(['slug' => $roomType->slug, 'check_in' => $checkIn, 'check_out' => $checkOut, 'adults' => $adults, 'children' => $children], $children > 0 ? ['child_ages' => $childAges] : [])) }}" class="text-sm text-slate-500 hover:underline">← Back to {{ $roomType->name }}</a>
    <h1 class="mt-4 text-3xl font-bold">Checkout</h1>
    <p class="mt-2 text-slate-600">This stay is held for you on this page. Guest and card details stay on this website.</p>
    @include('partials.stay-policies')
    @if($errors->any())
    <div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>
    @endif
    <div class="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_320px]">
      <form method="POST" action="{{ route('book.store') }}" class="space-y-4 rounded-2xl border bg-white p-6">
        @csrf
        <input type="hidden" name="room_type_id" value="{{ $roomType->id }}" />
        <input type="hidden" name="room_unit_id" value="{{ $unit['id'] ?? '' }}" />
        <input type="hidden" name="check_in" value="{{ $checkIn }}" />
        <input type="hidden" name="check_out" value="{{ $checkOut }}" />
        <input type="hidden" name="adults" value="{{ $adults }}" />
        <input type="hidden" name="children" value="{{ $children }}" />
        @foreach($childAges as $age)
        <input type="hidden" name="child_ages[]" value="{{ $age }}" />
        @endforeach
        <h2 class="text-lg font-semibold">Guest</h2>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Full name</span><input name="guest_name" required value="{{ old('guest_name') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Email</span><input type="email" name="guest_email" required value="{{ old('guest_email') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Phone</span><input name="guest_phone" value="{{ old('guest_phone') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Special requests</span><textarea name="special_requests" rows="3" class="w-full rounded-lg border px-3 py-2.5">{{ old('special_requests') }}</textarea></label>
        <h2 class="pt-2 text-lg font-semibold">Payment</h2>
        @if($settings->pay_on_arrival)
        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-slate-700">How will you pay?</legend>
          <label class="flex items-center gap-2 text-sm"><input type="radio" name="payment_method" value="card" @checked(old('payment_method', 'card') !== 'arrival') /> Pay now by card</label>
          <label class="flex items-center gap-2 text-sm"><input type="radio" name="payment_method" value="arrival" @checked(old('payment_method') === 'arrival') /> Pay on arrival</label>
        </fieldset>
        <div data-card-fields class="space-y-4" @if(old('payment_method') === 'arrival') hidden @endif>
          <p class="text-xs text-slate-500">Card details are stored on this website only. They are not sent to BuildAura.</p>
          <label class="block text-sm"><span class="mb-1 block text-slate-500">Name on card</span><input name="card_holder" value="{{ old('card_holder') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
          <label class="block text-sm"><span class="mb-1 block text-slate-500">Card number</span><input name="card_number" inputmode="numeric" autocomplete="cc-number" value="{{ old('card_number') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
          <div class="grid grid-cols-2 gap-3">
            <label class="block text-sm"><span class="mb-1 block text-slate-500">Expiry</span><input name="card_expiry" placeholder="MM/YY" value="{{ old('card_expiry') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
            <label class="block text-sm"><span class="mb-1 block text-slate-500">CVC</span><input name="card_cvc" value="{{ old('card_cvc') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
          </div>
        </div>
        <button type="submit" class="w-full rounded-lg px-4 py-3 font-semibold text-white" style="background-color:${accent}">
          <span data-pay-label-card @if(old('payment_method') === 'arrival') hidden @endif>Confirm and pay {{ number_format($offer['total'], 0) }} {{ $roomType->currency }}</span>
          <span data-pay-label-arrival @if(old('payment_method') !== 'arrival') hidden @endif>Confirm reservation — pay on arrival</span>
        </button>
        <script>
          (function () {
            var form = document.currentScript.closest('form');
            if (!form) return;
            var fields = form.querySelector('[data-card-fields]');
            var cardLabel = form.querySelector('[data-pay-label-card]');
            var arrivalLabel = form.querySelector('[data-pay-label-arrival]');
            function sync() {
              var selected = form.querySelector('input[name="payment_method"]:checked');
              var arrival = selected && selected.value === 'arrival';
              if (fields) fields.hidden = arrival;
              if (cardLabel) cardLabel.hidden = arrival;
              if (arrivalLabel) arrivalLabel.hidden = !arrival;
            }
            form.querySelectorAll('input[name="payment_method"]').forEach(function (radio) {
              radio.addEventListener('change', sync);
            });
            sync();
          })();
        </script>
        @else
        <p class="text-xs text-slate-500">Card details are stored on this website only. They are not sent to BuildAura.</p>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Name on card</span><input name="card_holder" required value="{{ old('card_holder') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Card number</span><input name="card_number" required inputmode="numeric" autocomplete="cc-number" value="{{ old('card_number') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
        <div class="grid grid-cols-2 gap-3">
          <label class="block text-sm"><span class="mb-1 block text-slate-500">Expiry</span><input name="card_expiry" required placeholder="MM/YY" value="{{ old('card_expiry') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
          <label class="block text-sm"><span class="mb-1 block text-slate-500">CVC</span><input name="card_cvc" required value="{{ old('card_cvc') }}" class="w-full rounded-lg border px-3 py-2.5" /></label>
        </div>
        <button type="submit" class="w-full rounded-lg px-4 py-3 font-semibold text-white" style="background-color:${accent}">Confirm and pay {{ number_format($offer['total'], 0) }} {{ $roomType->currency }}</button>
        @endif
      </form>
      <aside class="rounded-2xl border bg-white p-6">
        @if($roomType->image)<img src="{{ \\App\\Support\\PublicAsset::url($roomType->image) }}" alt="" class="mb-4 aspect-[16/10] w-full rounded-xl object-cover" />@else<div class="mb-4 aspect-[16/10] w-full rounded-xl bg-slate-100"></div>@endif
        <h2 class="text-xl font-semibold">{{ $roomType->name }}</h2>
        <p class="mt-1 text-sm text-slate-500">Room {{ $unit['code'] ?? '' }}</p>
        @include('partials.stay-policies', ['compact' => true])
        <dl class="mt-5 space-y-3 text-sm">
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Check-in</dt><dd>{{ \\Carbon\\Carbon::parse($checkIn)->format('M j, Y') }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Check-out</dt><dd>{{ \\Carbon\\Carbon::parse($checkOut)->format('M j, Y') }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Guests</dt><dd>{{ $adults }} adults · {{ $children }} children{{ $children > 0 ? ' ('.collect($childAges)->map(fn ($age) => $age.'y')->implode(', ').')' : '' }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Nights</dt><dd>{{ $offer['nights'] }} × {{ number_format($offer['nightly'], 0) }}</dd></div>
          <div class="flex justify-between gap-4 border-t pt-3 text-base"><dt class="font-semibold">Total</dt><dd class="font-bold" style="color:${accent}">{{ number_format($offer['total'], 0) }} {{ $roomType->currency }}</dd></div>
        </dl>
      </aside>
    </div>
  </div>
</section>
@endsection
`

  files['resources/views/site/booking-confirm.blade.php'] = `@extends('layouts.site')
@section('title', 'Booking confirmed — ' . $settings->business_name)
@section('content')
<section class="py-20">
  <div class="mx-auto max-w-xl px-6 text-center">
    <h1 class="text-3xl font-bold">You're booked</h1>
    <p class="mt-2 text-slate-600">Your stay is confirmed. Guest and payment details were saved on this website only.</p>
    <div class="mt-8 space-y-3 rounded-2xl border bg-slate-50 p-6 text-left">
      <div class="flex justify-between gap-4"><span class="text-slate-500">Confirmation</span><span class="font-mono font-bold">{{ $reservation->confirmation_code }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Room</span><span class="font-medium">{{ $reservation->room_type_name }}</span></div>
      @if($reservation->room_unit_code)<div class="flex justify-between gap-4"><span class="text-slate-500">Unit</span><span>{{ $reservation->room_unit_code }}</span></div>@endif
      <div class="flex justify-between gap-4"><span class="text-slate-500">Stay</span><span>{{ $reservation->check_in->format('M j, Y') }} – {{ $reservation->check_out->format('M j, Y') }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Guests</span><span>{{ $reservation->adults }} adults{{ $reservation->children ? ' · '.$reservation->children.' children'.((is_array($reservation->child_ages) && count($reservation->child_ages)) ? ' ('.collect($reservation->child_ages)->map(fn ($age) => $age.'y')->implode(', ').')' : '') : '' }}</span></div>
      <div class="flex justify-between gap-4"><span class="text-slate-500">Guest</span><span>{{ $reservation->guest_name }}</span></div>
      @if($reservation->payment_method === 'pay_on_arrival')
      <div class="flex justify-between gap-4"><span class="text-slate-500">Payment</span><span>Pay on arrival</span></div>
      @else
      <div class="flex justify-between gap-4"><span class="text-slate-500">Card</span><span>···· {{ $reservation->payment_last4 }}</span></div>
      @endif
      <div class="flex justify-between gap-4 border-t pt-3"><span class="text-slate-500">Total</span><span class="font-bold" style="color:${accent}">{{ number_format($reservation->total_price, 0) }} {{ $reservation->currency }}</span></div>
    </div>
    @include('partials.stay-policies')
    <a href="{{ route('home') }}" class="mt-8 inline-block text-sm font-semibold" style="color:${accent}">Back to the hotel</a>
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
    protected static ?string $navigationLabel = 'Reservations';
    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?int $navigationSort = 3;

    public static function form(Forms\\Form $form): Forms\\Form
    {
        return $form->schema([
            Forms\\Components\\Placeholder::make('crs_note')
                ->label('')
                ->content('The room and dates are held in BuildAura. Guest details stay on this website.')
                ->columnSpanFull(),
            Forms\\Components\\Select::make('crs_room_type_id')
                ->label('Room type')
                ->options(fn () => static::typeOptions())
                ->searchable()
                ->required()
                ->live()
                ->afterStateUpdated(function (Forms\\Set $set, ?string $state) {
                    $set('crs_room_unit_id', null);
                    $type = static::findType($state);
                    if ($type) {
                        $set('nightly_rate', $type['basePrice'] ?? 0);
                    }
                }),
            Forms\\Components\\Select::make('crs_room_unit_id')
                ->label('Room')
                ->options(fn (Forms\\Get $get) => static::unitOptions($get('crs_room_type_id')))
                ->searchable()
                ->required(),
            Forms\\Components\\DatePicker::make('check_in')->required()->minDate(now()->startOfDay()),
            Forms\\Components\\DatePicker::make('check_out')->required()->minDate(now()->startOfDay()),
            Forms\\Components\\TextInput::make('adults')->numeric()->default(1)->minValue(1)->maxValue(20)->required(),
            Forms\\Components\\TextInput::make('children')->numeric()->default(0)->minValue(0)->maxValue(10)->required(),
            Forms\\Components\\TextInput::make('child_ages')
                ->label('Child ages')
                ->helperText('Comma-separated ages from 0 to 17, one for each child. Guests 18 and older count as adults.')
                ->formatStateUsing(fn ($state) => is_array($state) ? implode(', ', $state) : (string) ($state ?? ''))
                ->dehydrateStateUsing(function ($state) {
                    if (is_array($state)) {
                        return array_values(array_map('intval', $state));
                    }
                    $parts = array_values(array_filter(array_map('trim', explode(',', (string) $state)), fn ($age) => $age !== ''));

                    return array_map('intval', $parts);
                }),
            Forms\\Components\\TextInput::make('nightly_rate')->numeric()->label('Nightly rate'),
            Forms\\Components\\Select::make('status')->options([
                'pending' => 'Pending',
                'confirmed' => 'Confirmed',
                'checked_in' => 'Checked in',
                'checked_out' => 'Checked out',
                'cancelled' => 'Cancelled',
                'no_show' => 'No show',
            ])->default('confirmed')->required(),
            Forms\\Components\\TextInput::make('guest_name')->required(),
            Forms\\Components\\TextInput::make('guest_email')->email()->required(),
            Forms\\Components\\TextInput::make('guest_phone'),
            Forms\\Components\\Textarea::make('special_requests')->columnSpanFull(),
            Forms\\Components\\Textarea::make('admin_notes')->columnSpanFull(),
            Forms\\Components\\TextInput::make('confirmation_code')->disabled()->dehydrated(false)->visibleOn('edit'),
            Forms\\Components\\TextInput::make('room_type_name')->disabled()->dehydrated(false)->visibleOn('edit'),
            Forms\\Components\\TextInput::make('room_unit_code')->label('Room number')->disabled()->dehydrated(false)->visibleOn('edit'),
            Forms\\Components\\TextInput::make('payment_last4')->label('Card last 4')->disabled()->dehydrated(false)->visibleOn('edit'),
        ])->columns(2);
    }

    public static function table(Tables\\Table $table): Tables\\Table
    {
        return $table->columns([
            Tables\\Columns\\TextColumn::make('confirmation_code')->searchable()->sortable(),
            Tables\\Columns\\TextColumn::make('guest_name')->searchable()->sortable(),
            Tables\\Columns\\TextColumn::make('guest_email')->searchable()->sortable()->toggleable(),
            Tables\\Columns\\TextColumn::make('guest_phone')->searchable()->sortable()->toggleable(),
            Tables\\Columns\\TextColumn::make('room_type_name')->label('Room type')->searchable()->sortable(),
            Tables\\Columns\\TextColumn::make('room_unit_code')->label('Room')->searchable()->sortable(),
            Tables\\Columns\\TextColumn::make('check_in')->date()->sortable(),
            Tables\\Columns\\TextColumn::make('check_out')->date()->sortable(),
            Tables\\Columns\\TextColumn::make('status')->badge()->searchable()->sortable(),
            Tables\\Columns\\TextColumn::make('total_price')->money(fn ($record) => $record->currency)->sortable(),
        ])->filters([
            Tables\\Filters\\SelectFilter::make('status')->options([
                'pending' => 'Pending',
                'confirmed' => 'Confirmed',
                'checked_in' => 'Checked in',
                'checked_out' => 'Checked out',
                'cancelled' => 'Cancelled',
                'no_show' => 'No show',
            ]),
            Tables\\Filters\\SelectFilter::make('room_type_name')
                ->label('Room type')
                ->searchable()
                ->options(fn () => Reservation::query()->whereNotNull('room_type_name')->where('room_type_name', '!=', '')->distinct()->orderBy('room_type_name')->pluck('room_type_name', 'room_type_name')->all()),
            Tables\\Filters\\SelectFilter::make('room_unit_code')
                ->label('Room')
                ->searchable()
                ->options(fn () => Reservation::query()->whereNotNull('room_unit_code')->where('room_unit_code', '!=', '')->distinct()->orderBy('room_unit_code')->pluck('room_unit_code', 'room_unit_code')->all()),
            Tables\\Filters\\Filter::make('stay')
                ->label('Stay dates')
                ->form([
                    Forms\\Components\\DatePicker::make('from')->label('Check-in from'),
                    Forms\\Components\\DatePicker::make('until')->label('Check-out until'),
                ])
                ->query(function ($query, array $data) {
                    return $query
                        ->when($data['from'] ?? null, fn ($query, $date) => $query->whereDate('check_in', '>=', $date))
                        ->when($data['until'] ?? null, fn ($query, $date) => $query->whereDate('check_out', '<=', $date));
                }),
        ])->actions([
            Tables\\Actions\\EditAction::make(),
        ])->defaultSort('created_at', 'desc')
            ->persistSearchInSession()
            ->persistFiltersInSession()
            ->persistSortInSession();
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\\ListReservations::route('/'),
            'create' => Pages\\CreateReservation::route('/create'),
            'edit' => Pages\\EditReservation::route('/{record}/edit'),
        ];
    }

    private static function inventory(): array
    {
        try {
            return app(\\App\\Services\\CrsClient::class)->inventory();
        } catch (\\Throwable) {
            return [];
        }
    }

    private static function typeOptions(): array
    {
        $options = [];
        foreach (static::inventory()['roomTypes'] ?? [] as $type) {
            if (! empty($type['id'])) {
                $options[$type['id']] = $type['name'] ?? $type['id'];
            }
        }
        return $options;
    }

    private static function unitOptions(?string $typeId): array
    {
        if (! $typeId) {
            return [];
        }
        $options = [];
        foreach (static::inventory()['units'] ?? [] as $unit) {
            if (($unit['roomTypeId'] ?? null) !== $typeId || empty($unit['id'])) {
                continue;
            }
            $label = $unit['code'] ?? $unit['id'];
            if (! empty($unit['name'])) {
                $label .= ' — ' . $unit['name'];
            }
            $options[$unit['id']] = $label;
        }
        return $options;
    }

    private static function findType(?string $typeId): ?array
    {
        if (! $typeId) {
            return null;
        }
        foreach (static::inventory()['roomTypes'] ?? [] as $type) {
            if (($type['id'] ?? null) === $typeId) {
                return $type;
            }
        }
        return null;
    }
}
`

  files['app/Filament/Resources/ReservationResource/Pages/ListReservations.php'] = `<?php

namespace App\\Filament\\Resources\\ReservationResource\\Pages;

use App\\Filament\\Resources\\ReservationResource;
use Filament\\Actions;
use Filament\\Resources\\Pages\\ListRecords;

class ListReservations extends ListRecords
{
    protected static string $resource = ReservationResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\\CreateAction::make()];
    }
}
`

  files['app/Filament/Resources/ReservationResource/Pages/CreateReservation.php'] = `<?php

namespace App\\Filament\\Resources\\ReservationResource\\Pages;

use App\\Filament\\Resources\\ReservationResource;
use App\\Services\\ReservationDesk;
use Filament\\Resources\\Pages\\CreateRecord;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Validation\\ValidationException;
use RuntimeException;

class CreateReservation extends CreateRecord
{
    protected static string $resource = ReservationResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        try {
            return app(ReservationDesk::class)->create($data);
        } catch (RuntimeException $e) {
            throw ValidationException::withMessages([
                'crs_room_unit_id' => $e->getMessage(),
            ]);
        }
    }
}
`

  files['app/Filament/Resources/ReservationResource/Pages/EditReservation.php'] = `<?php

namespace App\\Filament\\Resources\\ReservationResource\\Pages;

use App\\Filament\\Resources\\ReservationResource;
use App\\Services\\ReservationDesk;
use Filament\\Resources\\Pages\\EditRecord;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Validation\\ValidationException;
use RuntimeException;

class EditReservation extends EditRecord
{
    protected static string $resource = ReservationResource::class;

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        try {
            return app(ReservationDesk::class)->update($record, $data);
        } catch (RuntimeException $e) {
            throw ValidationException::withMessages([
                'crs_room_unit_id' => $e->getMessage(),
            ]);
        }
    }
}
`

  files['app/Services/ReservationDesk.php'] = `<?php

namespace App\\Services;

use App\\Models\\Reservation;
use Carbon\\Carbon;
use Illuminate\\Database\\Eloquent\\Model;
use RuntimeException;

/**
 * Admin create/update. Public checkout already calls CrsClient::occupy itself,
 * so this is not a model observer.
 */
class ReservationDesk
{
    private bool $loaded = false;

    private array $inventory = [];

    public function __construct(private CrsClient $crs) {}

    public function create(array $data): Reservation
    {
        $data = $this->normalize($data);
        $status = (string) ($data['status'] ?? Reservation::STATUS_CONFIRMED);
        [$type, $unit] = $this->selection($data);
        $code = Reservation::generateConfirmationCode();
        $occupancyId = null;
        if ($this->holdsRoom($status)) {
            $occupancyId = $this->hold($unit['id'], $data['check_in'], $data['check_out'], $code);
        }
        try {
            return Reservation::create($this->attributes($data, $type, $unit, $status, $occupancyId, $code, null));
        } catch (\\Throwable $e) {
            if ($occupancyId) {
                try {
                    $this->crs->release($occupancyId);
                } catch (\\Throwable $releaseError) {
                    throw new RuntimeException($e->getMessage() . ' The room hold could not be released (' . $releaseError->getMessage() . ').', 0, $e);
                }
            }
            throw $e;
        }
    }

    public function update(Model $record, array $data): Reservation
    {
        if (! $record instanceof Reservation) {
            throw new RuntimeException('Reservation not found.');
        }
        $data = $this->normalize($data);
        $status = (string) ($data['status'] ?? $record->status);
        [$type, $unit] = $this->selection($data);
        $held = $this->holdsRoom((string) $record->status) && filled($record->crs_occupancy_id);
        $shouldHold = $this->holdsRoom($status);
        $occupancyId = $record->crs_occupancy_id;
        $unitChanged = (string) $record->crs_room_unit_id !== (string) $unit['id'];
        $datesChanged = $record->check_in->toDateString() !== $data['check_in']
            || $record->check_out->toDateString() !== $data['check_out'];

        if ($held && ! $shouldHold) {
            $this->crs->release((string) $occupancyId);
            $occupancyId = null;
        } elseif ($shouldHold && ! $held) {
            $occupancyId = $this->hold($unit['id'], $data['check_in'], $data['check_out'], $record->confirmation_code);
        } elseif ($shouldHold && $held && $unitChanged) {
            $this->crs->release((string) $occupancyId);
            try {
                $occupancyId = $this->hold($unit['id'], $data['check_in'], $data['check_out'], $record->confirmation_code);
            } catch (\\Throwable $e) {
                $this->restoreHold($record, $e);
            }
        } elseif ($shouldHold && $held && $datesChanged) {
            $this->crs->updateOccupancy((string) $occupancyId, [
                'checkIn' => $data['check_in'],
                'checkOut' => $data['check_out'],
                'externalRef' => $record->confirmation_code,
            ]);
        }

        $record->fill($this->attributes($data, $type, $unit, $status, $occupancyId, null, $record));
        $record->save();
        return $record;
    }

    private function selection(array $data): array
    {
        $this->assertDates($data);
        $this->assertChildAges($data);
        $type = $this->requireType((string) ($data['crs_room_type_id'] ?? ''));
        $adults = (int) ($data['adults'] ?? 1);
        $children = (int) ($data['children'] ?? 0);
        if ($adults < 1) {
            throw new RuntimeException('At least one adult is required.');
        }
        if (
            $adults > (int) ($type['maxAdults'] ?? 2)
            || $children > (int) ($type['maxChildren'] ?? 0)
            || ($adults + $children) > (int) ($type['maxOccupancy'] ?? 2)
        ) {
            throw new RuntimeException('Guest count exceeds the maximum occupancy for this room type.');
        }
        $unit = $this->requireUnit((string) ($data['crs_room_unit_id'] ?? ''), (string) $type['id']);
        return [$type, $unit];
    }

    private function hold(string $unitId, string $checkIn, string $checkOut, string $code): string
    {
        $occupancy = $this->crs->occupy([
            'roomUnitId' => $unitId,
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
            'kind' => 'MANUAL',
            'externalRef' => $code,
        ]);
        $id = $occupancy['id'] ?? null;
        if (! is_string($id) || $id === '') {
            throw new RuntimeException('BuildAura did not confirm the room hold.');
        }
        return $id;
    }

    private function restoreHold(Reservation $reservation, \\Throwable $failed): void
    {
        try {
            $reservation->crs_occupancy_id = $this->hold(
                (string) $reservation->crs_room_unit_id,
                $reservation->check_in->toDateString(),
                $reservation->check_out->toDateString(),
                $reservation->confirmation_code,
            );
            $reservation->save();
        } catch (\\Throwable) {
            $reservation->crs_occupancy_id = null;
            $reservation->save();
            throw new RuntimeException('The room change failed and the previous hold could not be restored. Check the room in BuildAura, then save again. ' . $failed->getMessage(), 0, $failed);
        }
        throw new RuntimeException($failed->getMessage(), 0, $failed);
    }

    private function attributes(array $data, array $type, array $unit, string $status, ?string $occupancyId, ?string $code, ?Reservation $existing): array
    {
        $nights = max(1, (int) Carbon::parse($data['check_in'])->diffInDays(Carbon::parse($data['check_out'])));
        $nightly = $data['nightly_rate'] ?? null;
        if ($nightly === null || $nightly === '') {
            $nightly = $existing ? (float) $existing->nightly_rate : (float) ($type['basePrice'] ?? 0);
        }
        $typeChanged = $existing && (string) $existing->crs_room_type_id !== (string) $type['id'];
        $currency = (! $existing || $typeChanged)
            ? (string) ($type['currency'] ?? 'ETB')
            : (string) ($existing->currency ?: ($type['currency'] ?? 'ETB'));
        $attributes = [
            'crs_room_type_id' => $type['id'],
            'crs_room_unit_id' => $unit['id'],
            'crs_occupancy_id' => $occupancyId,
            'room_type_name' => $type['name'] ?? '',
            'room_unit_code' => $unit['code'] ?? null,
            'check_in' => $data['check_in'],
            'check_out' => $data['check_out'],
            'adults' => (int) ($data['adults'] ?? 1),
            'children' => (int) ($data['children'] ?? 0),
            'child_ages' => array_values(array_map('intval', is_array($data['child_ages'] ?? null) ? $data['child_ages'] : [])),
            'guest_name' => $data['guest_name'] ?? '',
            'guest_email' => $data['guest_email'] ?? '',
            'guest_phone' => $data['guest_phone'] ?? null,
            'status' => $status,
            'nightly_rate' => $nightly,
            'total_price' => round((float) $nightly * $nights, 2),
            'currency' => $currency,
            'special_requests' => $data['special_requests'] ?? null,
            'admin_notes' => $data['admin_notes'] ?? null,
        ];
        if ($code !== null) {
            $attributes['confirmation_code'] = $code;
            $attributes['source'] = 'admin';
            $attributes['payment_status'] = 'unpaid';
            $attributes['payment_method'] = 'admin';
            $attributes['payment_holder'] = null;
            $attributes['payment_last4'] = null;
            $attributes['paid_at'] = null;
        }
        return $attributes;
    }

    private function holdsRoom(string $status): bool
    {
        return ! in_array($status, [Reservation::STATUS_CANCELLED, Reservation::STATUS_NO_SHOW], true);
    }

    private function normalize(array $data): array
    {
        $data['check_in'] = Carbon::parse($data['check_in'] ?? null)->toDateString();
        $data['check_out'] = Carbon::parse($data['check_out'] ?? null)->toDateString();
        $ages = $data['child_ages'] ?? [];
        if (is_string($ages)) {
            $ages = array_values(array_filter(array_map('trim', explode(',', $ages)), fn ($age) => $age !== ''));
        }
        if (! is_array($ages)) {
            $ages = [];
        }
        $data['child_ages'] = array_values(array_map('intval', $ages));
        $data['children'] = (int) ($data['children'] ?? 0);

        return $data;
    }

    private function assertDates(array $data): void
    {
        $checkIn = Carbon::parse($data['check_in'])->startOfDay();
        $checkOut = Carbon::parse($data['check_out'])->startOfDay();
        if ($checkIn->lt(Carbon::today())) {
            throw new RuntimeException('Check-in cannot be before today.');
        }
        if (! $checkOut->gt($checkIn)) {
            throw new RuntimeException('Check-out must be after check-in.');
        }
    }

    private function assertChildAges(array $data): void
    {
        $children = (int) ($data['children'] ?? 0);
        $ages = $data['child_ages'] ?? [];
        if ($children < 0 || $children > 10) {
            throw new RuntimeException('Children must be between 0 and 10.');
        }
        if (! is_array($ages) || count($ages) !== $children) {
            throw new RuntimeException($children > 0 ? 'Enter the age of each child.' : 'Child ages do not match the number of children.');
        }
        foreach ($ages as $age) {
            if (! is_numeric($age) || (int) $age < 0 || (int) $age > 17) {
                throw new RuntimeException('A child must be 17 or younger. Guests 18 and older count as adults.');
            }
        }
    }

    private function inventory(): array
    {
        if (! $this->loaded) {
            $this->inventory = $this->crs->inventory();
            $this->loaded = true;
        }
        return $this->inventory;
    }

    private function requireType(string $typeId): array
    {
        foreach ($this->inventory()['roomTypes'] ?? [] as $type) {
            if (($type['id'] ?? null) === $typeId) {
                return $type;
            }
        }
        throw new RuntimeException('Select a room type from BuildAura.');
    }

    private function requireUnit(string $unitId, string $typeId): array
    {
        foreach ($this->inventory()['units'] ?? [] as $unit) {
            if (($unit['id'] ?? null) !== $unitId) {
                continue;
            }
            if (($unit['roomTypeId'] ?? null) !== $typeId) {
                throw new RuntimeException('That room does not belong to the selected room type.');
            }
            return $unit;
        }
        throw new RuntimeException('Select a room from BuildAura.');
    }
}
`

  files['app/Filament/Concerns/LoadsCrsInventory.php'] = `<?php

namespace App\\Filament\\Concerns;

use App\\Services\\CrsClient;
use Filament\\Notifications\\Notification;
use Illuminate\\Support\\Facades\\Storage;
use RuntimeException;

trait LoadsCrsInventory
{
    public array $inventory = [];

    public ?string $crsError = null;

    /** @var array<string, string> data-URL photos, kept off the Livewire snapshot */
    protected array $images = [];

    public function mount(): void
    {
        $this->reload();
        if (method_exists($this, 'mountPageForm')) {
            $this->mountPageForm();
        }
    }

    public function hydrate(): void
    {
        $this->reload();
    }

    public function imageFor(string $typeId): ?string
    {
        return $this->images[$typeId] ?? null;
    }

    protected function finish(string $title): void
    {
        $this->reload();
        $notice = Notification::make()->title($title);
        if ($this->crsError) {
            $notice->body('Saved, but the list could not be refreshed. ' . $this->crsError)->warning()->send();
            return;
        }
        $notice->success()->send();
    }

    protected function guard(callable $callback): void
    {
        try {
            $callback();
        } catch (\\Filament\\Support\\Exceptions\\Halt $halt) {
            throw $halt;
        } catch (\\Throwable $e) {
            Notification::make()->title('BuildAura could not save that change')->body($e->getMessage())->danger()->send();
            throw new \\Filament\\Support\\Exceptions\\Halt();
        }
    }

    protected function storedImage(array $data, ?array $existing): string
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
                throw new RuntimeException('The current photo could not be loaded from BuildAura. Try again before saving.');
            }
            return $kept;
        }
        $image = $existing['image'] ?? '';
        return is_string($image) ? $image : '';
    }

    protected function readUpload(mixed $upload): ?string
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
        $url = app(CrsClient::class)->uploadImage($bytes, 'room-photo.' . $ext, $mime);
        $disk->delete($upload);
        return $url;
    }

    protected function amenities(mixed $value): array
    {
        $parts = array_map('trim', explode(',', (string) $value));
        return array_values(array_filter($parts, fn ($part) => $part !== ''));
    }

    protected function typeOptions(): array
    {
        $options = [];
        foreach ($this->inventory['roomTypes'] ?? [] as $type) {
            if (! empty($type['id'])) {
                $options[$type['id']] = $type['name'] ?? $type['id'];
            }
        }
        return $options;
    }

    protected function statusOptions(): array
    {
        return [
            'AVAILABLE' => 'Available',
            'RESERVED' => 'Reserved',
            'OCCUPIED' => 'Occupied',
            'MAINTENANCE' => 'Maintenance',
            'OUT_OF_SERVICE' => 'Out of service',
        ];
    }

    protected function findType(string $id): ?array
    {
        foreach ($this->inventory['roomTypes'] ?? [] as $type) {
            if (($type['id'] ?? null) === $id) {
                return $type;
            }
        }
        return null;
    }

    protected function findUnit(string $id): ?array
    {
        foreach ($this->inventory['units'] ?? [] as $unit) {
            if (($unit['id'] ?? null) === $id) {
                return $unit;
            }
        }
        return null;
    }

    protected function reload(): void
    {
        try {
            $raw = app(CrsClient::class)->inventory();
            $this->images = [];
            $types = [];
            foreach ($raw['roomTypes'] ?? [] as $type) {
                $image = $type['image'] ?? null;
                if (is_string($image) && str_starts_with($image, 'data:')) {
                    $this->images[(string) $type['id']] = $image;
                    $type['image'] = null;
                    $type['hasInlineImage'] = true;
                } else {
                    $type['hasInlineImage'] = false;
                }
                $types[] = $type;
            }
            $raw['roomTypes'] = $types;
            $this->inventory = $raw;
            $this->crsError = null;
        } catch (\\Throwable $e) {
            $this->inventory = ['roomTypes' => [], 'units' => [], 'occupancy' => []];
            $this->images = [];
            $this->crsError = $e->getMessage();
        }
    }
}
`

  files['app/Filament/Pages/ManageRoomTypes.php'] = `<?php

namespace App\\Filament\\Pages;

use App\\Filament\\Concerns\\LoadsCrsInventory;
use App\\Services\\CrsClient;
use Filament\\Actions\\Action;
use Filament\\Forms\\Components\\FileUpload;
use Filament\\Forms\\Components\\Select;
use Filament\\Forms\\Components\\Textarea;
use Filament\\Forms\\Components\\TextInput;
use Filament\\Forms\\Components\\Toggle;
use Filament\\Notifications\\Notification;
use Filament\\Pages\\Page;
use RuntimeException;

class ManageRoomTypes extends Page
{
    use LoadsCrsInventory;

    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationIcon = 'heroicon-o-photo';
    protected static ?string $navigationLabel = 'Room types';
    protected static ?string $title = 'Room types';
    protected static ?int $navigationSort = 1;
    protected static string $view = 'filament.pages.manage-room-types';

    public static function getSlug(): string
    {
        return 'room-types';
    }

    public ?string $editingTypeId = null;

    public ?array $filters = [
        'search' => '',
        'parent' => '',
        'active' => '',
        'sort' => 'sortOrder',
    ];

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

    private function filterText(string $key): string
    {
        $value = $this->filters[$key] ?? null;

        return is_scalar($value) ? trim((string) $value) : '';
    }

    public function getSubheading(): ?string
    {
        return 'Room types and photos are saved in BuildAura. This website does not store them.';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('addType')
                ->label('Add room type')
                ->slideOver()
                ->modalSubmitActionLabel('Save to BuildAura')
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
            ->modalSubmitActionLabel('Save to BuildAura')
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
                        throw new RuntimeException('That room type is no longer in BuildAura.');
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
            ->modalDescription('This removes the room type and its rooms from BuildAura. Reservations already saved on this website stay here.')
            ->action(function (array $arguments): void {
                $this->guard(function () use ($arguments) {
                    app(CrsClient::class)->deleteRoomType((string) ($arguments['typeId'] ?? ''));
                    $this->reload();
                    Notification::make()->title('Room type deleted from BuildAura')->success()->send();
                });
            });
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
                ? ((int) collect($this->inventory['roomTypes'] ?? [])->max('sortOrder')) + 1
                : (int) ($existing['sortOrder'] ?? 0),
        ];
        $parentId = trim((string) ($data['parentId'] ?? ''));
        if ($parentId !== '' && ($existing === null || $parentId !== (string) ($existing['id'] ?? ''))) {
            $payload['parentId'] = $parentId;
        }
        $crs = app(CrsClient::class);
        if ($existing === null) {
            $payload['unitCount'] = max(0, (int) ($data['unitCount'] ?? 1));
            $crs->createRoomType($payload);
            $title = 'Room type created in BuildAura';
        } else {
            $crs->updateRoomType((string) $existing['id'], $payload);
            $title = 'Room type updated in BuildAura';
        }
        $this->finish($title);
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
                ->placeholder($creating ? 'None (top-level)' : 'Keep current parent')
                ->helperText($creating
                    ? 'Optional. Leave blank for a top-level type.'
                    : 'Leave blank to keep the current parent. A parent cannot be cleared from here.'),
            TextInput::make('shortDescription')->label('Short description')->maxLength(240),
            Textarea::make('description')->rows(3),
            TextInput::make('basePrice')->label('Nightly price')->numeric()->default(0)->required(),
            TextInput::make('currency')->default('ETB')->maxLength(3)->required(),
            TextInput::make('maxAdults')->numeric()->default(2)->required()->minValue(1),
            TextInput::make('maxChildren')->numeric()->default(0)->required()->minValue(0),
            TextInput::make('maxOccupancy')->numeric()->default(2)->required()->minValue(1),
            TextInput::make('bedConfiguration')->label('Beds'),
            TextInput::make('sizeSqm')->label('Size (m²)'),
            Textarea::make('amenities')->helperText('Comma-separated. Example: Wi-Fi, Breakfast, Lake view'),
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
                ->helperText('JPEG, PNG, WebP, or GIF up to 5 MB. Stored in BuildAura, then removed from this server.'),
            Toggle::make('clearImage')->label('Remove current photo')->default(false)->helperText('Ignored when you upload a replacement.'),
        ];
        if ($creating) {
            $fields[] = TextInput::make('unitCount')
                ->label('Rooms to create')
                ->numeric()
                ->default(1)
                ->minValue(0)
                ->helperText('BuildAura creates these rooms with the type. Add more later under Rooms.');
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
        foreach ($this->inventory['roomTypes'] ?? [] as $type) {
            $id = (string) ($type['id'] ?? '');
            if ($id === '' || $id === (string) $this->editingTypeId) {
                continue;
            }
            $options[$id] = $type['name'] ?? $id;
        }
        return $options;
    }

    public function filterParentOptions(): array
    {
        $options = [];
        foreach ($this->inventory['roomTypes'] ?? [] as $type) {
            $id = (string) ($type['id'] ?? '');
            if ($id === '') {
                continue;
            }
            $options[$id] = (string) ($type['name'] ?? $id);
        }

        return $options;
    }

    public function visibleTypes(): array
    {
        $needle = mb_strtolower($this->filterText('search'));
        $parentFilter = $this->filterText('parent');
        $activeFilter = $this->filterText('active');
        $types = [];
        foreach ($this->inventory['roomTypes'] ?? [] as $type) {
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

  files['app/Filament/Pages/ManageRooms.php'] = `<?php

namespace App\\Filament\\Pages;

use App\\Filament\\Concerns\\LoadsCrsInventory;
use App\\Services\\CrsClient;
use Filament\\Actions\\Action;
use Filament\\Forms\\Components\\Select;
use Filament\\Forms\\Components\\Textarea;
use Filament\\Forms\\Components\\TextInput;
use Filament\\Forms\\Components\\Toggle;
use Filament\\Notifications\\Notification;
use Filament\\Pages\\Page;
use RuntimeException;

class ManageRooms extends Page
{
    use LoadsCrsInventory;

    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $navigationLabel = 'Rooms';
    protected static ?string $title = 'Rooms';
    protected static ?int $navigationSort = 2;
    protected static string $view = 'filament.pages.manage-rooms';

    public static function getSlug(): string
    {
        return 'rooms';
    }

    public ?array $filters = [
        'search' => '',
        'roomType' => '',
        'status' => '',
        'sort' => 'code',
    ];

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

    private function filterText(string $key): string
    {
        $value = $this->filters[$key] ?? null;

        return is_scalar($value) ? trim((string) $value) : '';
    }

    public function getSubheading(): ?string
    {
        return 'Rooms are saved in BuildAura. This website does not store them.';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('addUnit')
                ->label('Add room')
                ->slideOver()
                ->modalSubmitActionLabel('Save to BuildAura')
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
            ->modalSubmitActionLabel('Save to BuildAura')
            ->fillForm(function (array $arguments): array {
                $unit = $this->findUnit((string) ($arguments['unitId'] ?? ''));
                return $unit ? $this->unitState($unit) : [];
            })
            ->form($this->unitForm())
            ->action(function (array $arguments, array $data): void {
                $this->guard(function () use ($arguments, $data) {
                    $unit = $this->findUnit((string) ($arguments['unitId'] ?? ''));
                    if (! $unit) {
                        throw new RuntimeException('That room is no longer in BuildAura.');
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
            ->modalDescription('This removes the room and its date holds from BuildAura. Reservations on this website stay here.')
            ->action(function (array $arguments): void {
                $this->guard(function () use ($arguments) {
                    app(CrsClient::class)->deleteUnit((string) ($arguments['unitId'] ?? ''));
                    $this->reload();
                    Notification::make()->title('Room deleted from BuildAura')->success()->send();
                });
            });
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
                ? ((int) collect($this->inventory['units'] ?? [])->max('sortOrder')) + 1
                : (int) ($existing['sortOrder'] ?? 0),
        ];
        $crs = app(CrsClient::class);
        if ($existing === null) {
            $crs->createUnit($payload);
            $title = 'Room created in BuildAura';
        } else {
            $crs->updateUnit((string) $existing['id'], $payload);
            $title = 'Room updated in BuildAura';
        }
        $this->finish($title);
    }

    private function unitForm(): array
    {
        return [
            Select::make('roomTypeId')->label('Room type')->options(fn () => $this->typeOptions())->searchable()->required(),
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

    public function visibleUnits(): array
    {
        $names = [];
        foreach ($this->inventory['roomTypes'] ?? [] as $type) {
            if (is_array($type) && ! empty($type['id'])) {
                $names[(string) $type['id']] = (string) ($type['name'] ?? '');
            }
        }
        $needle = mb_strtolower($this->filterText('search'));
        $typeFilter = $this->filterText('roomType');
        $statusFilter = $this->filterText('status');
        $units = [];
        foreach ($this->inventory['units'] ?? [] as $unit) {
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
            $units[] = $unit;
        }
        $sort = $this->filterText('sort');
        if ($sort === '') {
            $sort = 'code';
        }
        usort($units, function (array $a, array $b) use ($sort, $names): int {
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

        return $units;
    }
}
`

  files['resources/views/filament/pages/manage-room-types.blade.php'] = `@php
    $types = $this->visibleTypes();
    $units = $this->inventory['units'] ?? [];
    $typeFiltersOn = $this->typeFiltersActive();
@endphp
<x-filament-panels::page>
    @if($this->crsError)
        <div style="margin-bottom:16px;padding:12px 14px;border:1px solid #fecaca;border-radius:8px;color:#991b1b;font-size:14px;">
            {{ $this->crsError }}
            <div style="margin-top:6px;color:#6b7280;">Room types are stored in BuildAura. This page calls that API with this site's key.</div>
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
                            <td colspan="5" style="padding:16px 10px;color:#6b7280;font-size:14px;">@if($typeFiltersOn)No room types match these filters.@else No room types yet. Add one to create it in BuildAura.@endif</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-filament::section>
</x-filament-panels::page>
`

  files['resources/views/filament/pages/manage-rooms.blade.php'] = `@php
    $types = $this->inventory['roomTypes'] ?? [];
    $units = $this->visibleUnits();
    $occupancy = $this->inventory['occupancy'] ?? [];
    $typeNames = [];
    foreach ($types as $type) {
        $typeNames[$type['id']] = $type['name'] ?? '';
    }
    $allUnits = $this->inventory['units'] ?? [];
    $unitCodes = [];
    foreach ($allUnits as $unit) {
        $unitCodes[$unit['id']] = $unit['code'] ?? '';
    }
    $visibleIds = [];
    foreach ($units as $unit) {
        $visibleIds[(string) ($unit['id'] ?? '')] = true;
    }
    $unitFiltersOn = $this->unitFiltersActive();
    $holds = [];
    foreach ($occupancy as $block) {
        $unitId = (string) ($block['roomUnitId'] ?? '');
        if ($unitFiltersOn && empty($visibleIds[$unitId])) {
            continue;
        }
        $holds[] = $block;
    }
@endphp
<x-filament-panels::page>
    @if($this->crsError)
        <div style="margin-bottom:16px;padding:12px 14px;border:1px solid #fecaca;border-radius:8px;color:#991b1b;font-size:14px;">
            {{ $this->crsError }}
            <div style="margin-top:6px;color:#6b7280;">Rooms are stored in BuildAura. This page calls that API with this site's key.</div>
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
                            <td colspan="6" style="padding:16px 10px;color:#6b7280;font-size:14px;">@if($unitFiltersOn)No rooms match these filters.@else No rooms yet. Add a room type with a room count, or add a room here.@endif</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-filament::section>

    <div style="height:16px;"></div>

    <x-filament::section heading="Date holds">
        <p style="margin:0 0 12px;font-size:14px;color:#6b7280;">Dates only. Guest names are under Reservations.</p>
        <div style="overflow-x:auto;">
            <table style="width:100%;min-width:520px;border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Room</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Dates</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Kind</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Ref</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($holds as $block)
                        <tr style="border-top:1px solid #e5e7eb;">
                            <td style="padding:8px 10px;white-space:nowrap;">{{ $unitCodes[$block['roomUnitId'] ?? ''] ?? '' }}</td>
                            <td style="padding:8px 10px;white-space:nowrap;">{{ $block['checkIn'] ?? '' }} → {{ $block['checkOut'] ?? '' }}</td>
                            <td style="padding:8px 10px;white-space:nowrap;">{{ $block['kind'] ?? '' }}</td>
                            <td style="padding:8px 10px;">{{ $block['externalRef'] ?? '' }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" style="padding:12px 10px;color:#6b7280;font-size:14px;">@if($unitFiltersOn)No date holds for these rooms.@else No date holds.@endif</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
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

  files['public/.user.ini'] = `; Room photos upload to BuildAura and can be 5 MB.
upload_max_filesize = 8M
post_max_size = 8M
`

  Object.assign(files, roomCalendarFiles('CrsClient', 'ManageRooms'))

  return files
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
  return `@if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('rooms.index') }}" class="hover:underline opacity-80">Rooms</a>@endif`
}

export function bookingFooterLinksBlade(): string {
  return `@if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('rooms.index') }}" class="hover:underline opacity-70">Rooms</a>@endif`
}

export function bookingSettingsFields(content: SiteContent): Record<string, unknown> {
  return {
    rooms_section_title: content.roomsSectionTitle || 'Rooms & Suites',
    rooms_section_subtitle: content.roomsSectionSubtitle || '',
    booking_section_title: content.bookingSectionTitle || 'Book Your Stay',
    booking_section_subtitle: content.bookingSectionSubtitle || '',
    free_cancellation: false,
    pay_on_arrival: false,
    free_breakfast: false,
  }
}

/** Guest-facing stay policies. Renders nothing until the hotel admin turns a policy on. */
export function stayPoliciesPartial(): string {
  return `@php
  $policies = array_values(array_filter([
      $settings->free_cancellation ? ['label' => 'Free cancellation', 'detail' => 'You can cancel this stay at no charge.'] : null,
      $settings->pay_on_arrival ? ['label' => 'Payment on arrival', 'detail' => 'You can pay at the property when you arrive.'] : null,
      $settings->free_breakfast ? ['label' => 'Free breakfast', 'detail' => 'Breakfast is included with your stay.'] : null,
  ]));
  $compact = $compact ?? false;
@endphp
@if(count($policies))
  @if($compact)
  <ul class="flex flex-wrap gap-2" aria-label="Stay policies">
    @foreach($policies as $policy)
    <li class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">{{ $policy['label'] }}</li>
    @endforeach
  </ul>
  @else
  <ul class="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Stay policies">
    @foreach($policies as $policy)
    <li class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
      <p class="font-semibold">{{ $policy['label'] }}</p>
      <p class="mt-1 text-emerald-800">{{ $policy['detail'] }}</p>
    </li>
    @endforeach
  </ul>
  @endif
@endif
`
}
