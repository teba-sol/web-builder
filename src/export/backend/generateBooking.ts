import { DEPLOYED_CRS_API_URL } from './crsApiUrl'
import { ROOM_PRICE_COLORS } from '../../data/roomPrice'
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
  stayCurrency,
} from '../../data/hospitality'
import { actionBackground, accentInk } from '../../utils/accentInk'
import type { SiteExportPayload } from './exportPayload'
import { resolveAssetPath } from './exportPayload'
import { stayPoliciesAdminFiles } from './generateFilament'
import { roomCalendarFiles } from './generateRoomCalendar'
import {
  heroStaySearchPartial,
  localBookBlade,
  localConfirmBlade,
  localRoomDetailBlade,
  localRoomsBlade,
} from './hospitalityPublic'

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
  const buttonColor = actionBackground(accent)
  return `<form method="GET" action="{{ $searchAction }}" data-stay-search data-today="{{ $minDate ?? now()->toDateString() }}" class="{{ $searchClass ?? 'grid gap-4 rounded-2xl border bg-white p-5 text-slate-900 shadow-sm grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-end' }}">
  <label class="block min-w-0 text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-in</span><input type="date" name="check_in" value="{{ $checkIn }}" min="{{ $minDate ?? now()->toDateString() }}" required class="{{ $inputClass ?? 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5' }} h-12 min-w-0 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30" /></label>
  <label class="block min-w-0 text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-out</span><input type="date" name="check_out" value="{{ $checkOut }}" min="{{ $minDate ?? now()->toDateString() }}" required class="{{ $inputClass ?? 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5' }} h-12 min-w-0 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30" /></label>
  <label class="block min-w-0 text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Adults</span><input type="number" name="adults" min="1" max="20" value="{{ $adults }}" required class="{{ $inputClass ?? 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5' }} h-12 min-w-0 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30" /></label>
  <label class="block min-w-0 text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Children</span><input type="number" name="children" min="0" max="10" value="{{ $children }}" required class="{{ $inputClass ?? 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5' }} h-12 min-w-0 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30" /></label>
  <button type="submit" class="{{ $buttonClass ?? 'rounded-lg px-5 py-3 font-semibold' }} ${accentInk(buttonColor)} inline-flex h-12 w-full items-center justify-center gap-2 self-end whitespace-nowrap shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 md:col-span-2 lg:col-span-1" style="background-color:${buttonColor}"><svg aria-hidden="true" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>{{ $submitLabel ?? 'Search' }}</button>
  <p class="col-span-full border-t border-slate-200/70 pt-3 text-xs leading-5 text-slate-500">Children are 17 or younger. Guests 18 and older count as adults.</p>
  <div data-child-ages class="grid gap-3 col-span-full sm:grid-cols-2 lg:grid-cols-4 empty:hidden">
    @foreach(($childAges ?? []) as $index => $age)
    <label class="block min-w-0 text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Child {{ $index + 1 }} age</span><input type="number" name="child_ages[]" min="0" max="17" @if($age !== '') required @endif value="{{ $age }}" class="{{ $inputClass ?? 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5' }} h-12 min-w-0 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400/30" /></label>
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
      input.className = (checkIn ? checkIn.className : 'w-full h-12 min-w-0 rounded-lg border border-slate-300 px-3 py-2.5');
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
    description: rt.description,
    base_price: parseRoomPrice(rt.basePrice),
    discount_percent: Math.min(100, Math.max(0, parseRoomPrice(rt.discountPercent || '0'))),
    currency: stayCurrency(rt.currency),
    max_adults: parseRoomInt(rt.maxAdults, 2),
    max_children: parseRoomInt(rt.maxChildren, 0),
    bed_configuration: rt.bedConfiguration,
    size_sqm: rt.sizeSqm,
    amenities: parseAmenities(rt.amenities),
    photos: (rt.photos || []).map((photo, photoIndex) => resolveAssetPath(photo, `room-${i + 1}-${photoIndex + 1}`, assetMap)).filter((photo) => photo !== ''),
    free_cancellation: rt.freeCancellation === true,
    free_breakfast: rt.freeBreakfast === true,
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
  Object.assign(files, roomPriceFiles())
  files['app/Support/StayRequest.php'] = stayRequestPhp()
  Object.assign(files, stayPoliciesAdminFiles(true))

  files['config/crs.php'] = `<?php

return [
    'url' => rtrim((string) env('CRS_API_URL', '${DEPLOYED_CRS_API_URL}'), '/'),
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

    public function amenityCatalog(string $scope): array
    {
        if (! $this->configured()) {
            return [];
        }
        try {
            $response = Http::timeout(20)
                ->acceptJson()
                ->withHeaders(['X-Api-Key' => config('crs.key')])
                ->get(rtrim((string) config('crs.url'), '/').'/api/v1/crs/amenities', ['scope' => $scope]);
            if ($response->failed()) {
                return [];
            }
            $json = $response->json();

            return is_array($json) && array_is_list($json) ? $json : [];
        } catch (\\Throwable) {
            return [];
        }
    }

    public function hotel(): array
    {
        return $this->get('');
    }

    public function updateHotel(array $payload): array
    {
        return $this->request('patch', '', $payload);
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
        return self::allTypes($inventory);
    }

    /** Active types in inventory order. */
    public static function catalogue(array $inventory): array
    {
        return array_values(array_filter(self::allTypes($inventory), fn ($type) => $type->is_active));
    }

    public static function allTypes(array $inventory): array
    {
        return array_map([self::class, 'type'], $inventory['roomTypes'] ?? []);
    }

    public static function type(array $row): object
    {
        $photos = [];
        foreach (is_array($row['photos'] ?? null) ? $row['photos'] : [] as $photo) {
            if (is_string($photo) && $photo !== '') {
                $photos[] = $photo;
            }
        }
        $base = (float) ($row['basePrice'] ?? 0);
        $percent = (float) ($row['discountPercent'] ?? 0);
        $cover = $photos[0] ?? null;

        return (object) [
            'id' => $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'description' => $row['description'] ?? '',
            'base_price' => $base,
            'discount_percent' => $percent,
            'selling_price' => RoomPrice::selling($base, $percent),
            'currency' => $row['currency'] ?? 'USD',
            'max_adults' => (int) ($row['maxAdults'] ?? 2),
            'max_children' => (int) ($row['maxChildren'] ?? 0),
            'bed_configuration' => $row['bedConfiguration'] ?? '',
            'size_sqm' => $row['sizeSqm'] ?? '',
            'amenities' => $row['amenities'] ?? [],
            'photos' => $photos,
            'cover' => $cover,
            'image' => $cover,
            'free_cancellation' => (bool) ($row['freeCancellation'] ?? false),
            'free_breakfast' => (bool) ($row['freeBreakfast'] ?? false),
            'is_active' => (bool) ($row['isActive'] ?? true),
        ];
    }

    public static function findType(array $inventory, string $idOrSlug): ?object
    {
        foreach (self::allTypes($inventory) as $type) {
            if ($type->id === $idOrSlug || $type->slug === $idOrSlug) {
                return $type;
            }
        }

        return null;
    }

    public static function acceptsGuests(object $type, int $adults, int $children): bool
    {
        return $adults >= 1
            && $adults <= $type->max_adults
            && $children <= $type->max_children;
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
            $table->string('group_code')->nullable()->index();
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
            $table->boolean('breakfast_selected')->default(false);
            $table->decimal('breakfast_total', 12, 2)->default(0);
            $table->boolean('free_cancellation')->default(false);
            $table->decimal('cancellation_fee', 12, 2)->default(0);
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
        'confirmation_code', 'group_code', 'crs_room_type_id', 'crs_room_unit_id', 'crs_occupancy_id',
        'room_type_name', 'room_unit_code', 'check_in', 'check_out', 'adults', 'children', 'child_ages',
        'guest_name', 'guest_email', 'guest_phone', 'status', 'nightly_rate', 'total_price',
        'breakfast_selected', 'breakfast_total', 'free_cancellation', 'cancellation_fee',
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
            'breakfast_selected' => 'boolean',
            'breakfast_total' => 'decimal:2',
            'free_cancellation' => 'boolean',
            'cancellation_fee' => 'decimal:2',
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
use App\\Models\\SiteSetting;
use App\\Support\\CrsInventory;
use App\\Support\\RoomPrice;
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
        $code = trim((string) ($data['confirmation_code'] ?? ''));
        if ($code === '') {
            $code = Reservation::generateConfirmationCode();
        }
        $occupancy = $this->crs->occupy([
            'roomUnitId' => $unit['id'],
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
            'kind' => 'STAY',
            'externalRef' => $code,
        ]);
        $nights = max(1, Carbon::parse($checkIn)->diffInDays(Carbon::parse($checkOut)));
        $listNightly = (float) ($match['nightlyRate'] ?? $type->base_price);
        $nightly = RoomPrice::selling($listNightly, (float) $type->discount_percent);
        $charge = RoomPrice::breakfastCharge(
            (bool) $type->free_breakfast,
            (bool) ($data['add_breakfast'] ?? false),
            (float) SiteSetting::current()->breakfast_price,
            $nights
        );
        $method = (string) ($data['payment_method'] ?? 'none');
        if ($method === 'arrival') {
            $stored = 'pay_on_arrival';
        } elseif ($method === 'card') {
            $stored = 'fake_card';
        } elseif ($method === 'chapa') {
            $stored = 'chapa';
        } elseif ($method === 'sandbox') {
            $stored = 'sandbox';
        } elseif ($method === 'admin') {
            $stored = 'admin';
        } else {
            $stored = 'none';
        }
        $paid = $stored === 'fake_card' || $stored === 'sandbox';
        $digits = $stored === 'fake_card' ? preg_replace('/\\D/', '', (string) ($data['card_number'] ?? '')) : '';
        return Reservation::create([
            'confirmation_code' => $code,
            'group_code' => $data['group_code'] ?? null,
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
            'total_price' => round($nightly * $nights + $charge['total'], 2),
            'breakfast_selected' => $charge['selected'],
            'breakfast_total' => $charge['total'],
            'free_cancellation' => (bool) $type->free_cancellation,
            'cancellation_fee' => (bool) $type->free_cancellation ? 0 : (float) SiteSetting::current()->cancellation_fee,
            'currency' => $type->currency,
            'special_requests' => $data['special_requests'] ?? null,
            'source' => $data['source'] ?? 'website',
            'payment_status' => $paid ? 'paid' : 'unpaid',
            'payment_method' => $stored,
            'payment_holder' => $stored === 'fake_card' ? ($data['card_holder'] ?? $data['guest_name']) : null,
            'payment_last4' => ($stored === 'fake_card' && $digits !== '') ? substr($digits, -4) : null,
            'paid_at' => $paid ? now() : null,
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
use App\\Support\\RoomPrice;
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
        $offers = [];
        if ($stay['searched']) {
            foreach ($this->offers($stay, null) as $offer) {
                $offers[$offer['type']->id] = $offer;
            }
        }
        $cards = [];
        foreach (CrsInventory::catalogue($inventory) as $type) {
            $cards[] = ['type' => $type, 'offer' => $offers[$type->id] ?? null, 'children' => collect()];
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
        $wanted = array_values(array_filter((array) $request->query('room_unit_ids', []), fn ($id) => is_string($id) && $id !== ''));
        if ($wanted === [] && $request->filled('room_unit_id')) {
            $wanted = [(string) $request->query('room_unit_id')];
        }
        $back = $this->stayBack($request, $stay);
        if (! $stay['searched'] || $roomTypeId === '' || $wanted === []) {
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
        $units = [];
        foreach ($offer['units'] as $candidate) {
            if (in_array($candidate['id'] ?? '', $wanted, true)) {
                $units[] = $candidate;
            }
        }
        if (count($units) !== count($wanted)) {
            return redirect()->route('rooms.show', array_merge(['slug' => $type->slug], $back))
                ->withErrors(['booking' => 'That room was just taken. Choose another.']);
        }
        return $this->stayView('site.book', $stay, [
            'settings' => SiteSetting::current(),
            'roomType' => $type,
            'units' => $units,
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
            $listNightly = (float) ($row['nightlyRate'] ?? $type->base_price);
            $nightly = RoomPrice::selling($listNightly, (float) $type->discount_percent);
            $results[] = [
                'type' => $type,
                'available' => $count,
                'units' => array_values($row['units'] ?? []),
                'listNightly' => $listNightly,
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
        $rules = [
            'room_type_id' => 'required|string',
            'room_unit_ids' => 'required|array|min:1',
            'room_unit_ids.*' => 'string',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'adults' => 'required|integer|min:1|max:20',
            'children' => 'nullable|integer|min:0|max:10',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'required|string|max:50',
            'special_requests' => 'nullable|string|max:2000',
            'add_breakfast' => 'nullable|boolean',
        ];
        $validated = $request->validate($rules);
        $validated['add_breakfast'] = $request->boolean('add_breakfast');
        $ids = array_values(array_filter((array) ($validated['room_unit_ids'] ?? [])));
        $code = Reservation::generateConfirmationCode();
        $made = [];
        try {
            foreach ($ids as $index => $id) {
                $made[] = $this->availability->book([
                    ...$validated,
                    'room_unit_id' => $id,
                    'confirmation_code' => $index === 0 ? $code : $code.'-'.($index + 1),
                    'group_code' => $code,
                    'check_in' => $stay['checkIn'],
                    'check_out' => $stay['checkOut'],
                    'adults' => $stay['adults'],
                    'children' => $stay['children'],
                    'child_ages' => array_map('intval', $stay['childAges']),
                    'source' => 'website',
                ]);
            }
        } catch (\\Throwable $e) {
            foreach ($made as $row) {
                if ($row->crs_occupancy_id) {
                    try {
                        $this->crs->release((string) $row->crs_occupancy_id);
                    } catch (\\Throwable $ignored) {
                    }
                }
                $row->delete();
            }
            return back()->withInput()->withErrors(['booking' => $e->getMessage()]);
        }
        return redirect()->route('booking.confirm', $code);
    }

    public function confirm(string $code): View
    {
        $reservations = Reservation::query()->where('group_code', $code)->orderBy('id')->get();
        if ($reservations->isEmpty()) {
            $reservations = Reservation::query()->where('confirmation_code', $code)->orderBy('id')->get();
        }
        abort_if($reservations->isEmpty(), 404);
        return view('site.booking-confirm', [
            'settings' => SiteSetting::current(),
            'reservations' => $reservations,
            'reservation' => $reservations->first(),
        ]);
    }
}
`



  files['resources/views/partials/hero-stay-search.blade.php'] = heroStaySearchPartial(payload.templateId)
  files['resources/views/site/rooms.blade.php'] = localRoomsBlade(accent, payload.templateId)
  files['resources/views/site/room-detail.blade.php'] = localRoomDetailBlade(accent, payload.templateId)
  files['resources/views/site/book.blade.php'] = localBookBlade(accent, payload.templateId)
  files['resources/views/site/booking-confirm.blade.php'] = localConfirmBlade(accent, payload.templateId)

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
                        $set('nightly_rate', \\App\\Support\\RoomPrice::selling((float) ($type['basePrice'] ?? 0), (float) ($type['discountPercent'] ?? 0)));
                        if (! empty($type['freeBreakfast'])) {
                            $set('breakfast_selected', true);
                        }
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
            Forms\\Components\\TextInput::make('nightly_rate')->numeric()->label('Price')->live(onBlur: true)->helperText(function (Forms\\Get $get) {
                $rate = (float) \\App\\Models\\SiteSetting::current()->usdt_etb_rate;
                $rawId = $get('crs_room_type_id');
                $type = static::findType(is_string($rawId) ? $rawId : null);
                $currency = (string) ($type['currency'] ?? 'USD');
                $amount = is_numeric($get('nightly_rate')) ? (float) $get('nightly_rate') : 0.0;
                $other = \\App\\Support\\RoomPrice::other($amount, $currency, $rate);
                if ($rate <= 0) {
                    return 'Set the USD to ETB rate on Hotel Policy to show the other currency.';
                }
                if ($other === null) {
                    return '1 USD = '.$rate.' ETB.';
                }

                return 'About '.$other.' · 1 USD = '.$rate.' ETB.';
            }),
            Forms\\Components\\Toggle::make('breakfast_selected')
                ->label('Add breakfast')
                ->helperText('Included at no charge when the room type has breakfast. Otherwise the hotel breakfast price is added for each night.'),
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
            Tables\\Filters\\SelectFilter::make('status')->label('Status')->placeholder('All statuses')->options([
                'pending' => 'Pending',
                'confirmed' => 'Confirmed',
                'checked_in' => 'Checked in',
                'checked_out' => 'Checked out',
                'cancelled' => 'Cancelled',
                'no_show' => 'No show',
            ]),
            Tables\\Filters\\SelectFilter::make('room_type_name')
                ->label('Room type')
                ->placeholder('All room types')
                ->searchable()
                ->options(fn () => Reservation::query()->whereNotNull('room_type_name')->where('room_type_name', '!=', '')->distinct()->orderBy('room_type_name')->pluck('room_type_name', 'room_type_name')->all()),
            Tables\\Filters\\SelectFilter::make('room_unit_code')
                ->label('Room')
                ->placeholder('All rooms')
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
            $options[$unit['id']] = $unit['code'] ?? $unit['id'];
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
use App\\Models\\SiteSetting;
use App\\Support\\RoomPrice;
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
        ) {
            throw new RuntimeException('Guest count exceeds the maximum for this room type.');
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
            $nightly = $existing
                ? (float) $existing->nightly_rate
                : RoomPrice::selling((float) ($type['basePrice'] ?? 0), (float) ($type['discountPercent'] ?? 0));
        }
        $typeChanged = $existing && (string) $existing->crs_room_type_id !== (string) $type['id'];
        $currency = (! $existing || $typeChanged)
            ? (string) ($type['currency'] ?? 'USD')
            : (string) ($existing->currency ?: ($type['currency'] ?? 'USD'));
        $freeBreakfast = (bool) ($type['freeBreakfast'] ?? false);
        $wantsBreakfast = $freeBreakfast || (bool) ($data['breakfast_selected'] ?? false);
        $charge = RoomPrice::breakfastCharge(
            $freeBreakfast,
            $wantsBreakfast,
            (float) SiteSetting::current()->breakfast_price,
            $nights
        );
        $breakfastSelected = $charge['selected'];
        $breakfastTotal = $charge['total'];
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
            'breakfast_selected' => $breakfastSelected,
            'breakfast_total' => $breakfastTotal,
            'free_cancellation' => (bool) ($type['freeCancellation'] ?? false),
            'cancellation_fee' => ! empty($type['freeCancellation']) ? 0 : (float) SiteSetting::current()->cancellation_fee,
            'total_price' => round((float) $nightly * $nights + $breakfastTotal, 2),
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

    /** @var array<string, list<string>> data-URL photos, kept off the Livewire snapshot */
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

    /** @return list<string> */
    public function imageFor(string $typeId): array
    {
        return $this->images[$typeId] ?? [];
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

    protected function storedPhotos(array $data, ?array $existing): array
    {
        $photos = [];
        $existingPhotos = is_array($existing['photos'] ?? null) ? $existing['photos'] : [];
        foreach (is_array($data['keptPhotos'] ?? null) ? $data['keptPhotos'] : [] as $photo) {
            if (is_string($photo) && $photo !== '' && in_array($photo, $existingPhotos, true)) {
                $photos[] = $photo;
            }
        }
        if (! empty($existing['hasInlinePhotos'])) {
            foreach ($this->images[(string) ($existing['id'] ?? '')] ?? [] as $inline) {
                if (is_string($inline) && $inline !== '') {
                    $photos[] = $inline;
                }
            }
        }
        $uploads = $data['newPhotos'] ?? [];
        if (! is_array($uploads)) {
            $uploads = [$uploads];
        }
        foreach ($uploads as $upload) {
            $url = $this->readUpload($upload);
            if (is_string($url) && $url !== '') {
                $photos[] = $url;
            }
        }

        return array_values($photos);
    }

    protected function readUpload(mixed $upload): ?string
    {
        if (is_array($upload)) {
            return null;
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

    protected function amenityOptions(): array
    {
        $options = [];
        foreach (app(CrsClient::class)->amenityCatalog('ROOM_TYPE') as $item) {
            $name = is_array($item) ? (string) ($item['name'] ?? '') : '';
            $key = trim(strtolower((string) preg_replace('/[^a-z0-9]+/i', '_', $name)), '_');
            if ($key === '') {
                continue;
            }
            $base = $key;
            $n = 2;
            while (isset($options[$key])) {
                $key = $base.'_'.$n;
                $n++;
            }
            $options[$key] = $name;
        }

        return $options;
    }

    protected function amenities(array $data): array
    {
        $allowed = $this->amenityOptions();
        if ($allowed === []) {
            throw new RuntimeException('Amenities could not be loaded.');
        }
        $flags = is_array($data['amenityFlags'] ?? null) ? $data['amenityFlags'] : [];
        $names = [];
        foreach ($allowed as $key => $name) {
            if (! empty($flags[$key])) {
                $names[] = $name;
            }
        }

        return $names;
    }

    protected function discountPercent(mixed $value): float
    {
        if (! is_numeric($value)) {
            throw new RuntimeException('Discount must be between 0 and 100');
        }
        $percent = (float) $value;
        if ($percent < 0 || $percent > 100) {
            throw new RuntimeException('Discount must be between 0 and 100');
        }

        return $percent;
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
            'BOOKED' => 'Booked',
            'INACTIVE' => 'Inactive',
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
                if (! is_array($type)) {
                    continue;
                }
                $photos = is_array($type['photos'] ?? null) ? $type['photos'] : [];
                $publicPhotos = [];
                $inline = [];
                foreach ($photos as $photo) {
                    if (! is_string($photo) || $photo === '') {
                        continue;
                    }
                    if (str_starts_with($photo, 'data:')) {
                        $inline[] = $photo;
                    } else {
                        $publicPhotos[] = $photo;
                    }
                }
                if ($inline !== []) {
                    $this->images[(string) ($type['id'] ?? '')] = $inline;
                    $type['hasInlinePhotos'] = true;
                } else {
                    $type['hasInlinePhotos'] = false;
                }
                $type['photos'] = $publicPhotos;
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
use App\\Models\\SiteSetting;
use App\\Services\\CrsClient;
use App\\Support\\RoomPrice;
use Filament\\Actions\\Action;
use Filament\\Forms\\Components\\Checkbox;
use Filament\\Forms\\Components\\CheckboxList;
use Filament\\Forms\\Components\\Fieldset;
use Filament\\Forms\\Components\\FileUpload;
use Filament\\Forms\\Components\\Placeholder;
use Filament\\Forms\\Get;
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
            'active' => '',
            'sort' => 'sortOrder',
        ];
    }

    public function typeFiltersActive(): bool
    {
        return $this->filterText('search') !== ''
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
            'description' => (string) ($data['description'] ?? ''),
            'basePrice' => is_numeric($data['basePrice'] ?? null) ? (float) $data['basePrice'] : 0,
            'discountPercent' => $this->discountPercent($data['discountPercent'] ?? 0),
            'currency' => RoomPrice::currency((string) ($data['currency'] ?? '')),
            'maxAdults' => (int) ($data['maxAdults'] ?? 2),
            'maxChildren' => (int) ($data['maxChildren'] ?? 0),
            'bedConfiguration' => (string) ($data['bedConfiguration'] ?? ''),
            'sizeSqm' => (string) ($data['sizeSqm'] ?? ''),
            'amenities' => $this->amenities($data),
            'photos' => $this->storedPhotos($data, $existing),
            'freeCancellation' => (bool) ($data['freeCancellation'] ?? false),
            'freeBreakfast' => (bool) ($data['freeBreakfast'] ?? false),
            'unitPrefix' => filled($data['unitPrefix'] ?? null) ? trim((string) $data['unitPrefix']) : 'RM-',
            'isActive' => (bool) ($data['isActive'] ?? true),
            'sortOrder' => $existing === null
                ? ((int) collect($this->inventory['roomTypes'] ?? [])->max('sortOrder')) + 1
                : (int) ($existing['sortOrder'] ?? 0),
        ];
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

    private function priceHint(Get $get): string
    {
        $rate = (float) SiteSetting::current()->usdt_etb_rate;
        $amount = is_numeric($get('basePrice')) ? (float) $get('basePrice') : 0.0;
        $currency = strtoupper(trim((string) ($get('currency') ?: 'USD')));
        $other = RoomPrice::other($amount, $currency, $rate);
        if ($rate <= 0) {
            return 'Set the USD to ETB rate on Hotel Policy to show the other currency.';
        }
        if ($other === null) {
            return '1 USD = '.$rate.' ETB.';
        }

        return 'About '.$other.' · 1 USD = '.$rate.' ETB.';
    }

    private function amenityFields(): array
    {
        $options = $this->amenityOptions();
        if ($options === []) {
            return [
                Placeholder::make('amenitiesUnavailable')
                    ->label('Room amenities')
                    ->content('Amenities could not be loaded.'),
            ];
        }
        $boxes = [];
        foreach ($options as $key => $name) {
            $boxes[] = Checkbox::make('amenityFlags.'.$key)->label($name);
        }

        return [
            Fieldset::make('Room amenities')
                ->schema($boxes)
                ->columns(2),
        ];
    }

    private function typeForm(bool $creating): array
    {
        $fields = [
            TextInput::make('name')->required()->maxLength(120),
            Textarea::make('description')->rows(3)->helperText('Optional.'),
            TextInput::make('basePrice')->label('Price')->numeric()->default(0)->required()->live(onBlur: true)->helperText(fn (Get $get) => $this->priceHint($get)),
            TextInput::make('discountPercent')->label('Discount %')->numeric()->default(0)->required()->minValue(0)->maxValue(100)->helperText('0 means no discount. 10 means 10% off the price.'),
            Select::make('currency')->options(['ETB' => 'ETB', 'USD' => 'USD'])->default('USD')->required()->live(),
            TextInput::make('maxAdults')->label('Max adults')->numeric()->default(2)->required()->minValue(1),
            TextInput::make('maxChildren')->label('Max children')->numeric()->default(0)->required()->minValue(0),
            TextInput::make('bedConfiguration')->label('Beds'),
            TextInput::make('sizeSqm')->label('Size (m²)'),
            ...$this->amenityFields(),
            Toggle::make('freeCancellation')->label('Free cancellation')->default(false),
            Toggle::make('freeBreakfast')->label('Breakfast included')->default(false),
            TextInput::make('unitPrefix')->label('Room number prefix')->default('RM-'),
            Toggle::make('isActive')->label('Active')->default(true),
            CheckboxList::make('keptPhotos')->label('Current photos')->options(function () {
                $type = $this->editingTypeId ? $this->findType((string) $this->editingTypeId) : null;
                $photos = is_array($type['photos'] ?? null) ? $type['photos'] : [];
                $options = [];
                foreach ($photos as $index => $photo) {
                    if (is_string($photo) && $photo !== '') {
                        $options[$photo] = 'Photo '.($index + 1);
                    }
                }

                return $options;
            }),
            FileUpload::make('newPhotos')
                ->label('Add photos')
                ->multiple()
                ->disk('local')
                ->directory('crs-uploads')
                ->visibility('private')
                ->image()
                ->imageEditor()
                ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
                ->maxSize(5120)
                ->helperText('JPEG, PNG, WebP, or GIF up to 5 MB each.'),
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
        $amenities = is_array($type['amenities'] ?? null) ? $type['amenities'] : [];
        $photos = is_array($type['photos'] ?? null) ? $type['photos'] : [];
        $stored = [];
        foreach ($amenities as $name) {
            if (is_string($name) && $name !== '') {
                $stored[$name] = true;
            }
        }
        $flags = [];
        foreach ($this->amenityOptions() as $key => $name) {
            $flags[$key] = isset($stored[$name]);
        }

        return [
            'name' => $type['name'] ?? '',
            'description' => $type['description'] ?? '',
            'basePrice' => $type['basePrice'] ?? 0,
            'discountPercent' => $type['discountPercent'] ?? 0,
            'currency' => RoomPrice::currency((string) ($type['currency'] ?? '')),
            'maxAdults' => $type['maxAdults'] ?? 2,
            'maxChildren' => $type['maxChildren'] ?? 0,
            'bedConfiguration' => $type['bedConfiguration'] ?? '',
            'sizeSqm' => $type['sizeSqm'] ?? '',
            'amenityFlags' => $flags,
            'keptPhotos' => array_values(array_filter($photos, fn ($photo) => is_string($photo) && $photo !== '')),
            'freeCancellation' => (bool) ($type['freeCancellation'] ?? false),
            'freeBreakfast' => (bool) ($type['freeBreakfast'] ?? false),
            'unitPrefix' => $type['unitPrefix'] ?? 'RM-',
            'isActive' => (bool) ($type['isActive'] ?? true),
        ];
    }

    public function visibleTypes(): array
    {
        $needle = mb_strtolower($this->filterText('search'));
        $activeFilter = $this->filterText('active');
        $types = [];
        foreach ($this->inventory['roomTypes'] ?? [] as $type) {
            if (! is_array($type)) {
                continue;
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
            'smokingAllowed' => (bool) ($data['smokingAllowed'] ?? false),
            'status' => $data['status'] ?? 'AVAILABLE',
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
            Toggle::make('smokingAllowed')->label('Smoking allowed')->default(false),
            Select::make('status')->options($this->statusOptions())->default('AVAILABLE')->required(),
            Textarea::make('notes'),
        ];
    }

    private function unitState(array $unit): array
    {
        return [
            'roomTypeId' => $unit['roomTypeId'] ?? null,
            'code' => $unit['code'] ?? '',
            'smokingAllowed' => (bool) ($unit['smokingAllowed'] ?? false),
            'status' => $unit['status'] ?? 'AVAILABLE',
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
            $status = strcasecmp((string) ($a['status'] ?? ''), (string) ($b['status'] ?? ''));
            $type = strcasecmp($names[(string) ($a['roomTypeId'] ?? '')] ?? '', $names[(string) ($b['roomTypeId'] ?? '')] ?? '');

            return match ($sort) {
                'code_desc' => -$code,
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

    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;align-items:end;margin-bottom:24px;">
        <x-filament-forms::field-wrapper label="Search">
            <x-filament::input.wrapper>
                <x-filament::input type="search" placeholder="Name, description" wire:model.live.debounce.300ms="filters.search" />
            </x-filament::input.wrapper>
        </x-filament-forms::field-wrapper>
        <x-filament-forms::field-wrapper label="Active">
            <x-filament::input.wrapper>
                <x-filament::input.select wire:model.live="filters.active">
                    <option value="">All</option>
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
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Type</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Size</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;white-space:nowrap;">Price</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Rooms</th>
                        <th style="text-align:right;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($types as $type)
                        @php
                            $preview = $type['photos'][0] ?? '';
                            if ($preview === '' && ! empty($type['hasInlinePhotos'])) {
                                $inline = $this->imageFor((string) ($type['id'] ?? ''));
                                $preview = $inline[0] ?? '';
                            }
                            $roomCount = 0;
                            foreach ($units as $candidate) {
                                if (($candidate['roomTypeId'] ?? null) === ($type['id'] ?? null)) {
                                    $roomCount++;
                                }
                            }
                            $base = (float) ($type['basePrice'] ?? 0);
                            $percent = (float) ($type['discountPercent'] ?? 0);
                            $selling = \\App\\Support\\RoomPrice::selling($base, $percent);
                            $currency = $type['currency'] ?? 'USD';
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
                                <div style="margin-top:2px;font-size:13px;color:#4b5563;">{{ (int) ($type['maxAdults'] ?? 2) }}Ad {{ (int) ($type['maxChildren'] ?? 0) }}Ch</div>
                            </td>
                            <td style="padding:10px;vertical-align:middle;white-space:nowrap;">{{ ! empty($type['sizeSqm']) ? $type['sizeSqm'].' m²' : '—' }}</td>
                            <td style="padding:10px;vertical-align:middle;white-space:nowrap;">
                                @if($percent > 0)
                                    <span style="text-decoration:line-through;color:#6b7280;">{{ number_format($base, 0) }} {{ $currency }}</span>
                                    <span style="margin-left:6px;font-weight:600;">{{ number_format($selling, 0) }} {{ $currency }}</span>
                                    <span style="margin-left:6px;color:#be123c;font-size:12px;font-weight:700;">{{ rtrim(rtrim(number_format($percent, 2), '0'), '.') }}% off</span>
                                @else
                                    {{ number_format($base, 0) }} {{ $currency }}
                                @endif
                            </td>
                            <td style="padding:10px;vertical-align:middle;white-space:nowrap;">{{ $roomCount }}</td>
                            <td style="padding:10px;vertical-align:middle;white-space:nowrap;text-align:right;">
                                <div style="display:flex;gap:8px;justify-content:flex-end;">
                                    {{ ($this->editTypeAction)(['typeId' => $type['id']]) }}
                                    {{ ($this->deleteTypeAction)(['typeId' => $type['id']]) }}
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" style="padding:16px 10px;color:#6b7280;font-size:14px;">@if($typeFiltersOn)No room types match these filters.@else No room types yet. Add one to create it in BuildAura.@endif</td>
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
                <x-filament::input type="search" placeholder="Code, notes" wire:model.live.debounce.300ms="filters.search" />
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
                    <option value="">All statuses</option>
                    @foreach(['AVAILABLE' => 'Available', 'BOOKED' => 'Booked', 'INACTIVE' => 'Inactive'] as $value => $label)
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
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Number</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Type</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Smoking</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Status</th>
                        <th style="text-align:right;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($units as $unit)
                        <tr wire:key="unit-{{ $unit['id'] }}" style="border-top:1px solid #e5e7eb;">
                            <td style="padding:10px;vertical-align:middle;white-space:nowrap;font-weight:600;">{{ $unit['code'] ?? '' }}</td>
                            <td style="padding:10px;vertical-align:middle;white-space:normal;word-break:normal;">{{ $typeNames[$unit['roomTypeId'] ?? ''] ?? '' }}</td>
                            <td style="padding:10px;vertical-align:middle;white-space:nowrap;">{{ ! empty($unit['smokingAllowed']) ? 'Allowed' : 'No' }}</td>
                            <td style="padding:10px;vertical-align:middle;white-space:nowrap;">@if(strtoupper((string) ($unit['status'] ?? 'AVAILABLE')) === 'BOOKED') Booked @elseif(strtoupper((string) ($unit['status'] ?? 'AVAILABLE')) === 'INACTIVE') Inactive @else Available @endif</td>
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
                            <td colspan="5" style="padding:16px 10px;color:#6b7280;font-size:14px;">@if($unitFiltersOn)No rooms match these filters.@else No rooms yet. Add a room type with a room count, or add a room here.@endif</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-filament::section>

    <div style="height:16px;"></div>

    <x-filament::section heading="Booked dates">
        <p style="margin:0 0 12px;font-size:14px;color:#6b7280;">Dates only. Guest names are under Reservations.</p>
        <div style="overflow-x:auto;">
            <table style="width:100%;min-width:520px;border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Room</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Dates</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Status</th>
                        <th style="text-align:left;padding:8px 10px;font-size:12px;color:#6b7280;font-weight:600;">Ref</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($holds as $block)
                        <tr style="border-top:1px solid #e5e7eb;">
                            <td style="padding:8px 10px;white-space:nowrap;">{{ $unitCodes[$block['roomUnitId'] ?? ''] ?? '' }}</td>
                            <td style="padding:8px 10px;white-space:nowrap;">{{ $block['checkIn'] ?? '' }} → {{ $block['checkOut'] ?? '' }}</td>
                            <td style="padding:8px 10px;white-space:nowrap;">Booked</td>
                            <td style="padding:8px 10px;">{{ $block['externalRef'] ?? '' }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" style="padding:12px 10px;color:#6b7280;font-size:14px;">@if($unitFiltersOn)No booked dates for these rooms.@else No booked dates.@endif</td>
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
        foreach ($seed as $row) {
            $crs->createRoomType([
                'name' => $row['name'],
                'description' => $row['description'],
                'basePrice' => $row['base_price'],
                'discountPercent' => $row['discount_percent'],
                'currency' => $row['currency'],
                'maxAdults' => $row['max_adults'],
                'maxChildren' => $row['max_children'],
                'bedConfiguration' => $row['bed_configuration'],
                'sizeSqm' => $row['size_sqm'],
                'amenities' => $row['amenities'],
                'photos' => $row['photos'],
                'freeCancellation' => $row['free_cancellation'],
                'freeBreakfast' => $row['free_breakfast'],
                'unitPrefix' => $row['unit_prefix'],
                'unitCount' => $row['unit_count'],
                'isActive' => $row['is_active'],
                'sortOrder' => $row['sort_order'],
            ]);
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
  return `@if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('rooms.index') }}" class="hover:underline opacity-80">Book</a>@endif`
}

export function bookingFooterLinksBlade(): string {
  return `@if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('rooms.index') }}" class="hover:underline opacity-70">Book</a>@endif`
}

export function bookingSettingsFields(content: SiteContent): Record<string, unknown> {
  return {
    rooms_section_title: content.roomsSectionTitle || 'Rooms & Suites',
    rooms_section_subtitle: content.roomsSectionSubtitle || '',
    booking_section_title: content.bookingSectionTitle || 'Book Your Stay',
    booking_section_subtitle: content.bookingSectionSubtitle || '',
    pay_on_arrival: false,
    usdt_etb_rate: 0,
    breakfast_price: 0,
    cancellation_fee: 0,
    house_rules: null,
  }
}

export function roomPriceFiles(): Record<string, string> {
  return {
    'app/Support/RoomPrice.php': `<?php

namespace App\\Support;

class RoomPrice
{
    public static function selling(float $base, float $percent): float
    {
        $bounded = max(0, min(100, $percent));

        return round($base * (100 - $bounded) / 100, 2);
    }

    public static function currency(string $currency): string
    {
        $code = strtoupper((string) preg_replace('/[^A-Za-z]/', '', $currency));
        if (in_array($code, ['ETB', 'BIRR'], true)) {
            return 'ETB';
        }

        return 'USD';
    }

    public static function other(float $amount, string $currency, float $rate): ?string
    {
        if ($rate <= 0 || $amount <= 0) {
            return null;
        }
        if (self::currency($currency) === 'USD') {
            return number_format($amount * $rate, 2).' ETB';
        }

        return number_format($amount / $rate, 2).' USD';
    }

    /** @return array{selected: bool, total: float} */
    public static function breakfastCharge(bool $freeBreakfast, bool $selected, float $pricePerNight, int $nights): array
    {
        if ($freeBreakfast) {
            return ['selected' => true, 'total' => 0.0];
        }
        if (! $selected || $pricePerNight <= 0) {
            return ['selected' => false, 'total' => 0.0];
        }

        return ['selected' => true, 'total' => round($pricePerNight * max(1, $nights), 2)];
    }

    public static function cancellationNote(bool $free, float $fee, string $currency): string
    {
        if ($free) {
            return 'Free cancellation.';
        }
        if ($fee > 0) {
            $amount = number_format($fee, 0);
            $code = trim($currency);

            return $code === '' ? 'Cancellation fee '.$amount.'.' : 'Cancellation fee '.$amount.' '.$code.'.';
        }

        return 'This rate is non-refundable.';
    }
}
`,
    'resources/views/partials/room-price.blade.php': `@php
  $base = (float) ($priceBase ?? 0);
  $percent = max(0, min(100, (float) ($pricePercent ?? 0)));
  $currency = \\App\\Support\\RoomPrice::currency((string) ($priceCurrency ?? ''));
  $suffix = (string) ($priceSuffix ?? '');
  $selling = \\App\\Support\\RoomPrice::selling($base, $percent);
  $rate = (float) ($settings->usdt_etb_rate ?? 0);
  $other = \\App\\Support\\RoomPrice::other($selling, $currency, $rate);
  $otherBase = $percent > 0 ? \\App\\Support\\RoomPrice::other($base, $currency, $rate) : null;
  $percentLabel = rtrim(rtrim(number_format($percent, 2), '0'), '.');
  $align = ($priceAlign ?? '') === 'end' ? 'text-right' : '';
@endphp
<div data-room-price class="mt-1 inline-block max-w-full rounded-xl px-3 py-2 leading-normal {{ $align }}" style="background-color:${ROOM_PRICE_COLORS.background};color:${ROOM_PRICE_COLORS.amount};text-decoration:none;">
  @if($percent > 0)
    <div class="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span style="color:${ROOM_PRICE_COLORS.muted};"><del data-price-original style="text-decoration:line-through;">{{ number_format($base, 0) }} {{ $currency }}@if($otherBase) · {{ $otherBase }}@endif</del></span>
      <span class="rounded-full px-2 py-0.5 text-xs font-semibold" style="color:${ROOM_PRICE_COLORS.discount};background-color:${ROOM_PRICE_COLORS.discountBackground};">{{ $percentLabel }}% off</span>
    </div>
  @endif
  <p>
    <span data-price-current class="text-xl font-bold tabular-nums" style="color:${ROOM_PRICE_COLORS.amount};text-decoration:none;">{{ number_format($selling, 0) }} {{ $currency }}</span>@if($suffix !== '')<span class="ml-1 text-sm font-normal" style="color:${ROOM_PRICE_COLORS.muted};">{{ $suffix }}</span>@endif
  </p>
  @if($other)
    <p class="mt-1 text-sm font-medium" style="color:${ROOM_PRICE_COLORS.muted};">{{ $other }}@if($suffix !== '') {{ $suffix }}@endif</p>
  @elseif(!empty($priceRateHint))
    <p class="mt-1 text-xs font-normal" style="color:${ROOM_PRICE_COLORS.muted};">Set the USD to ETB rate on Hotel Policy to show this price in ETB and USD.</p>
  @endif
</div>
`,
    'resources/views/partials/stay-addons.blade.php': `@php
  $freeBreakfast = (bool) ($freeBreakfast ?? false);
  $freeCancellation = (bool) ($freeCancellation ?? false);
  $perNight = (float) ($breakfastPerNight ?? 0);
  $cancellationFee = (float) ($cancellationFee ?? 0);
  $nights = max(1, (int) ($nights ?? 1));
  $roomCount = max(1, (int) ($roomCount ?? 1));
  $roomEach = (float) ($roomEach ?? 0);
  $currency = \\App\\Support\\RoomPrice::currency((string) ($currency ?? ''));
  $rate = (float) ($settings->usdt_etb_rate ?? 0);
  $picking = ! empty($countSelectedRooms);
  $checked = $freeBreakfast || (bool) old('add_breakfast', request()->boolean('add_breakfast'));
  $breakfastEach = (! $freeBreakfast && $perNight > 0) ? round($perNight * $nights, 2) : 0;
  $initialRooms = $picking ? 0 : $roomCount;
  $initialBreakfast = ($checked && $breakfastEach > 0) ? round($breakfastEach * $initialRooms, 2) : 0;
  $initialRoom = round($roomEach * $initialRooms, 2);
  $otherNight = \\App\\Support\\RoomPrice::other($perNight, $currency, $rate);
  $foreign = \\App\\Support\\RoomPrice::currency($currency) === 'USD' ? '1' : '0';
  $otherCode = $foreign === '1' ? 'ETB' : 'USD';
@endphp
@if($showCancellation ?? true)
<p class="text-sm {{ $freeCancellation ? 'text-emerald-700' : 'text-slate-600' }}">{{ \\App\\Support\\RoomPrice::cancellationNote($freeCancellation, $cancellationFee, $currency) }}</p>
@endif
@if($freeBreakfast)
  <p class="text-sm font-medium text-emerald-700">Breakfast included</p>
  <input type="hidden" name="add_breakfast" value="1" />
@elseif($perNight > 0)
  <label class="flex items-start gap-2 text-sm text-slate-900">
    <input type="checkbox" name="add_breakfast" value="1" data-add-breakfast @checked($checked) />
    <span>
      <span class="font-semibold">Add breakfast</span>
      <span class="mt-0.5 block text-slate-600">{{ number_format($perNight, 0) }} {{ $currency }} / night per room{{ $otherNight ? ' · '.$otherNight.' / night' : '' }}</span>
    </span>
  </label>
@else
  <p class="text-sm text-slate-500">Breakfast is not included.</p>
@endif
<p class="text-sm" data-price-breakdown data-room-each="{{ $roomEach }}" data-breakfast-each="{{ $breakfastEach }}" data-room-count="{{ $roomCount }}" data-rate="{{ $rate }}" data-foreign="{{ $foreign }}" data-other-code="{{ $otherCode }}" @if($freeBreakfast) data-breakfast-included="1" @endif @if($picking) data-count-selected="1" @endif>
  Room <span data-room-amount>{{ number_format($initialRoom, 0) }}</span> {{ $currency }}
  <span data-breakfast-line @if(! $checked || $breakfastEach <= 0) hidden @endif> · Breakfast <span data-breakfast-amount>{{ number_format($initialBreakfast, 0) }}</span> {{ $currency }}</span>
  · <strong>Total <span data-stay-total>{{ number_format($initialRoom + $initialBreakfast, 0) }}</span> {{ $currency }}</strong>
  <span class="mt-1 block text-xs text-slate-500" data-other-total></span>
</p>
<script>
(function () {
  var node = document.currentScript;
  var form = node && node.closest ? node.closest('form') : null;
  if (!form || form.dataset.breakfastReady) return;
  form.dataset.breakfastReady = '1';
  var box = form.querySelector('[data-add-breakfast]');
  var breakdown = form.querySelector('[data-price-breakdown]');
  if (!breakdown) return;
  var picks = form.querySelectorAll('input[type="checkbox"][name="room_unit_ids[]"]');
  var eachRoom = parseFloat(breakdown.getAttribute('data-room-each') || '0');
  var eachBreakfast = parseFloat(breakdown.getAttribute('data-breakfast-each') || '0');
  var included = breakdown.getAttribute('data-breakfast-included') === '1';
  var rate = parseFloat(breakdown.getAttribute('data-rate') || '0');
  var foreign = breakdown.getAttribute('data-foreign') === '1';
  var otherCode = breakdown.getAttribute('data-other-code') || '';
  var root = form.parentElement || form;
  function money(value) {
    return Math.round(value).toLocaleString();
  }
  function rooms() {
    if (breakdown.getAttribute('data-count-selected') === '1') {
      var count = 0;
      picks.forEach(function (el) { if (el.checked) count += 1; });
      return count;
    }
    return parseInt(breakdown.getAttribute('data-room-count') || '1', 10) || 1;
  }
  function otherText(amount) {
    if (!(rate > 0) || !(amount > 0) || !otherCode) return '';
    var value = foreign ? amount * rate : amount / rate;
    return '≈ ' + Math.round(value).toLocaleString() + ' ' + otherCode;
  }
  function sync() {
    var on = included || !!(box && box.checked);
    var count = rooms();
    var room = eachRoom * count;
    var breakfast = on ? eachBreakfast * count : 0;
    root.querySelectorAll('[data-breakfast-line]').forEach(function (line) { line.hidden = !on || breakfast <= 0; });
    root.querySelectorAll('[data-room-amount]').forEach(function (el) { el.textContent = money(room); });
    root.querySelectorAll('[data-breakfast-amount]').forEach(function (el) { el.textContent = money(breakfast); });
    root.querySelectorAll('[data-stay-total]').forEach(function (el) { el.textContent = money(room + breakfast); });
    root.querySelectorAll('[data-other-total]').forEach(function (el) { el.textContent = otherText(room + breakfast); });
  }
  if (box) box.addEventListener('change', sync);
  picks.forEach(function (el) { el.addEventListener('change', sync); });
  sync();
})();
</script>
`,
  }
}

/** Guest-facing hotel policy. Renders nothing until the hotel admin turns a policy on. */
export function stayPoliciesPartial(): string {
  return `@php
  $houseRules = $settings->house_rules ?? null;
  $breakfastPrice = (float) ($settings->breakfast_price ?? 0);
  $cancellationFee = (float) ($settings->cancellation_fee ?? 0);
  $policies = array_values(array_filter([
      $settings->pay_on_arrival ? ['label' => 'Payment on arrival', 'detail' => 'You can pay at the property when you arrive.'] : null,
      $houseRules ? ['label' => 'House rules', 'detail' => 'Read the house rules before you arrive.', 'href' => \\App\\Support\\PublicAsset::url($houseRules)] : null,
      $breakfastPrice > 0 ? ['label' => 'Breakfast', 'detail' => 'Breakfast can be added for '.number_format($breakfastPrice, 0).' per night on room types that do not include it.'] : null,
      $cancellationFee > 0 ? ['label' => 'Cancellation fee', 'detail' => 'A fee of '.number_format($cancellationFee, 0).' applies when cancelling a room that does not include free cancellation.'] : null,
  ]));
  $compact = $compact ?? false;
@endphp
@if(count($policies))
  @if($compact)
  <ul class="flex flex-wrap gap-2" aria-label="Hotel policy">
    @foreach($policies as $policy)
    <li class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">@if(!empty($policy['href']))<a href="{{ $policy['href'] }}" class="underline" target="_blank" rel="noreferrer">{{ $policy['label'] }}</a>@else{{ $policy['label'] }}@endif</li>
    @endforeach
  </ul>
  @else
  <ul class="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Hotel policy">
    @foreach($policies as $policy)
    <li class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
      <p class="font-semibold">@if(!empty($policy['href']))<a href="{{ $policy['href'] }}" class="underline" target="_blank" rel="noreferrer">{{ $policy['label'] }}</a>@else{{ $policy['label'] }}@endif</p>
      <p class="mt-1 text-emerald-800">{{ $policy['detail'] }}</p>
    </li>
    @endforeach
  </ul>
  @endif
@endif
`
}
