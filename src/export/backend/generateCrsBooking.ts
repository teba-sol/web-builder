import { DEPLOYED_CRS_API_URL, resolveCrsApiUrl } from './crsApiUrl'
/**
 * Hotel and guest house exports talk to the Buildaura room API.
 * Guest name, email, and phone stay in this site's database.
 * Buildaura only receives the room, the dates, and the confirmation code.
 */
import type { SiteExportPayload } from './exportPayload'
import { roomPriceFiles, stayPoliciesPartial, stayRequestPhp, staySearchPartial } from './generateBooking'
import {
  crsBookBlade,
  crsConfirmBlade,
  crsRoomDetailBlade,
  crsRoomsBlade,
  heroStaySearchPartial,
} from './hospitalityPublic'
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
  const url = resolveCrsApiUrl(credentials?.apiBaseUrl)
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
  Object.assign(files, roomPriceFiles())
  files['app/Support/StayRequest.php'] = stayRequestPhp()
  Object.assign(files, stayPoliciesAdminFiles(false))

  files['config/services.php'] = `<?php

return [
    'buildaura' => [
        'url' => rtrim((string) env('BUILDAURA_API_URL', env('CRS_API_URL', '${DEPLOYED_CRS_API_URL}')), '/'),
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
    public function occupy(string $unitId, string $checkIn, string $checkOut, string $confirmationCode, string $kind = 'STAY'): array
    {
        return $this->send('POST', $this->path('/occupancy'), [
            'roomUnitId' => $unitId,
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
            'kind' => $kind,
            'externalRef' => $confirmationCode,
        ]);
    }

    public function updateOccupancy(string $blockId, array $payload): array
    {
        return $this->send('PATCH', $this->path('/occupancy/'.$blockId), $payload);
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

    public function amenityCatalog(string $scope): array
    {
        try {
            $rows = $this->send('GET', '/api/v1/crs/amenities', null, ['scope' => $scope]);
        } catch (\\Throwable) {
            return [];
        }

        return array_is_list($rows) ? $rows : [];
    }

    public function hotel(): array
    {
        return $this->send('GET', $this->path(''));
    }

    public function updateHotel(array $payload): array
    {
        return $this->send('PATCH', $this->path(''), $payload);
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
            $table->string('group_code')->nullable()->index();
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
            $table->boolean('breakfast_selected')->default(false);
            $table->decimal('breakfast_total', 12, 2)->default(0);
            $table->boolean('free_cancellation')->default(false);
            $table->decimal('cancellation_fee', 12, 2)->default(0);
            $table->string('currency', 8)->default('USD');
            $table->text('special_requests')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('payment_method')->default('sandbox');
            $table->string('payment_last4', 4)->nullable();
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
        'group_code',
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
        'breakfast_selected',
        'breakfast_total',
        'free_cancellation',
        'cancellation_fee',
        'currency',
        'special_requests',
        'admin_notes',
        'payment_method',
        'payment_last4',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'child_ages' => 'array',
        'nightly_rate' => 'decimal:2',
        'total_price' => 'decimal:2',
        'breakfast_selected' => 'boolean',
        'breakfast_total' => 'decimal:2',
        'free_cancellation' => 'boolean',
        'cancellation_fee' => 'decimal:2',
    ];
}
`

  files['app/Http/Controllers/BookingController.php'] = `<?php

namespace App\\Http\\Controllers;

use App\\Models\\GuestReservation;
use App\\Models\\SiteSetting;
use App\\Services\\BuildauraClient;
use App\\Support\\RoomPrice;
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

    public function rooms(Request $request): View
    {
        $stay = StayRequest::from($request);
        [$types, $error] = $this->activeTypes();

        return $this->stayView('site.rooms', $stay, [
            'settings' => SiteSetting::current(),
            'roomTypes' => $types,
            'apiError' => $error,
        ]);
    }

    public function showRoom(Request $request, string $slug): View
    {
        $stay = StayRequest::from($request);
        [$types, $error] = $this->activeTypes();
        $type = null;
        foreach ($types as $candidate) {
            if (($candidate['slug'] ?? '') === $slug) {
                $type = $candidate;
                break;
            }
        }
        abort_if($type === null, 404);

        $units = [];
        $nightly = 0.0;
        $listNightly = (float) ($type['basePrice'] ?? 0);
        $stayTotal = 0.0;
        $nights = 1;
        if ($stay['searched'] && $error === null) {
            try {
                $availability = $this->crs->availability($stay['checkIn'], $stay['checkOut'], (string) ($type['id'] ?? ''));
                $nights = max(1, (int) Carbon::parse($stay['checkIn'])->diffInDays(Carbon::parse($stay['checkOut'])));
                foreach ($availability['types'] ?? [] as $row) {
                    $rowType = $row['roomType'] ?? [];
                    if (($rowType['id'] ?? '') !== ($type['id'] ?? '')) {
                        continue;
                    }
                    if (! $this->fits($rowType, $stay['adults'], $stay['children'])) {
                        break;
                    }
                    $listNightly = (float) ($row['nightlyRate'] ?? ($rowType['basePrice'] ?? 0));
                    $nightly = RoomPrice::selling($listNightly, (float) ($rowType['discountPercent'] ?? 0));
                    $stayTotal = round($nightly * $nights, 2);
                    $units = array_values($row['units'] ?? []);
                    break;
                }
            } catch (RuntimeException $e) {
                $error = $e->getMessage();
            }
        }
        if ($error) {
            $stay['errors'][] = $error;
        }

        return $this->stayView('site.room-detail', $stay, [
            'settings' => SiteSetting::current(),
            'roomType' => $type,
            'units' => $units,
            'nightly' => $nightly,
            'listNightly' => $listNightly,
            'stayTotal' => $stayTotal,
            'nights' => $nights,
        ]);
    }

    public function bookForm(Request $request): View|RedirectResponse
    {
        $stay = StayRequest::from($request);
        $roomTypeId = (string) $request->query('room_type_id', '');
        $wanted = array_values(array_filter((array) $request->query('room_unit_ids', []), fn ($id) => is_string($id) && $id !== ''));
        $back = $this->stayBack($request, $stay);
        if (! $stay['searched'] || $roomTypeId === '' || $wanted === []) {
            return redirect()->route('rooms.index', $back);
        }
        [$types, $error] = $this->activeTypes();
        $type = null;
        foreach ($types as $candidate) {
            if (($candidate['id'] ?? '') === $roomTypeId) {
                $type = $candidate;
                break;
            }
        }
        if ($type === null) {
            return redirect()->route('rooms.index', $back)->withErrors(['booking' => 'Choose a room to continue.']);
        }
        $slug = (string) ($type['slug'] ?? $roomTypeId);
        if ($error !== null) {
            return redirect()->route('rooms.show', array_merge(['slug' => $slug], $back))->withErrors(['booking' => $error]);
        }
        try {
            $availability = $this->crs->availability($stay['checkIn'], $stay['checkOut'], $roomTypeId);
        } catch (RuntimeException $e) {
            return redirect()->route('rooms.show', array_merge(['slug' => $slug], $back))->withErrors(['booking' => $e->getMessage()]);
        }
        $units = [];
        $nightly = 0.0;
        $listNightly = (float) ($type['basePrice'] ?? 0);
        $nights = max(1, (int) Carbon::parse($stay['checkIn'])->diffInDays(Carbon::parse($stay['checkOut'])));
        foreach ($availability['types'] ?? [] as $row) {
            $rowType = $row['roomType'] ?? [];
            if (($rowType['id'] ?? '') !== $roomTypeId) {
                continue;
            }
            if (! $this->fits($rowType, $stay['adults'], $stay['children'])) {
                break;
            }
            $listNightly = (float) ($row['nightlyRate'] ?? ($rowType['basePrice'] ?? 0));
            $nightly = RoomPrice::selling($listNightly, (float) ($rowType['discountPercent'] ?? 0));
            $byId = [];
            foreach ($row['units'] ?? [] as $unit) {
                if (! empty($unit['id'])) {
                    $byId[$unit['id']] = $unit;
                }
            }
            foreach ($wanted as $id) {
                if (isset($byId[$id])) {
                    $units[] = $byId[$id];
                }
            }
            break;
        }
        if (count($units) !== count($wanted)) {
            return redirect()->route('rooms.show', array_merge(['slug' => $slug], $back))
                ->withErrors(['booking' => 'That room was just taken. Choose another.']);
        }

        return view('site.book', array_merge($this->stayData($stay), [
            'settings' => SiteSetting::current(),
            'roomType' => $type,
            'units' => $units,
            'nightly' => $nightly,
            'listNightly' => $listNightly,
            'stayTotal' => round($nightly * $nights, 2),
            'nights' => $nights,
        ]));
    }

    public function store(Request $request): RedirectResponse
    {
        $stay = StayRequest::from($request);
        if ($stay['errors'] !== []) {
            return back()->withInput()->withErrors($stay['errors']);
        }
        $validated = $request->validate([
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
        if ($match === null || ! $this->fits($match['roomType'] ?? [], $stay['adults'], $stay['children'])) {
            return back()->withInput()->withErrors(['booking' => 'That room is not available for those dates']);
        }

        $byId = [];
        foreach ($match['units'] as $unit) {
            if (! empty($unit['id'])) {
                $byId[$unit['id']] = $unit;
            }
        }
        $chosen = [];
        foreach (array_values(array_unique(array_filter((array) $validated['room_unit_ids']))) as $id) {
            if (! isset($byId[$id])) {
                return back()->withInput()->withErrors(['booking' => 'That room is not available for those dates']);
            }
            $chosen[] = $byId[$id];
        }

        $type = $match['roomType'];
        $code = strtoupper(Str::random(8));
        $nights = max(1, (int) Carbon::parse($validated['check_in'])->diffInDays(Carbon::parse($validated['check_out'])));
        $listNightly = (float) ($match['nightlyRate'] ?? ($type['basePrice'] ?? 0));
        $nightly = RoomPrice::selling($listNightly, (float) ($type['discountPercent'] ?? 0));
        $charge = RoomPrice::breakfastCharge(
            (bool) ($type['freeBreakfast'] ?? false),
            $request->boolean('add_breakfast'),
            (float) SiteSetting::current()->breakfast_price,
            $nights
        );
        $made = [];
        try {
            foreach ($chosen as $index => $unit) {
                $rowCode = $index === 0 ? $code : $code.'-'.($index + 1);
                $block = $this->crs->occupy($unit['id'], $stay['checkIn'], $stay['checkOut'], $rowCode);
                try {
                    $made[] = GuestReservation::create([
                        'confirmation_code' => $rowCode,
                        'group_code' => $code,
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
                        'guest_email' => $validated['guest_email'],
                        'guest_phone' => $validated['guest_phone'],
                        'status' => 'confirmed',
                        'nightly_rate' => $nightly,
                        'total_price' => round($nightly * $nights + $charge['total'], 2),
                        'breakfast_selected' => $charge['selected'],
                        'breakfast_total' => $charge['total'],
                        'free_cancellation' => (bool) ($type['freeCancellation'] ?? false),
                        'cancellation_fee' => ! empty($type['freeCancellation']) ? 0 : (float) SiteSetting::current()->cancellation_fee,
                        'currency' => $type['currency'] ?? 'USD',
                        'special_requests' => $validated['special_requests'] ?? null,
                        'payment_method' => 'none',
                        'payment_last4' => null,
                    ]);
                } catch (\\Throwable $e) {
                    if (! empty($block['id'])) {
                        try {
                            $this->crs->release($block['id']);
                        } catch (\\Throwable $ignored) {
                        }
                    }
                    throw $e;
                }
            }
        } catch (\\Throwable $e) {
            foreach ($made as $row) {
                if ($row->crs_block_id) {
                    try {
                        $this->crs->release((string) $row->crs_block_id);
                    } catch (\\Throwable $ignored) {
                    }
                }
                $row->delete();
            }
            $message = $e instanceof RuntimeException
                ? $e->getMessage()
                : 'Could not save the reservation on this website. The rooms were released.';

            return back()->withInput()->withErrors(['booking' => $message]);
        }

        return redirect()->route('booking.confirm', $code);
    }

    public function confirm(string $code): View
    {
        $reservations = GuestReservation::query()->where('group_code', $code)->orderBy('id')->get();
        if ($reservations->isEmpty()) {
            $reservations = GuestReservation::query()->where('confirmation_code', $code)->orderBy('id')->get();
        }
        abort_if($reservations->isEmpty(), 404);

        return view('site.booking-confirm', [
            'settings' => SiteSetting::current(),
            'reservations' => $reservations,
            'reservation' => $reservations->first(),
        ]);
    }

    private function stayView(string $name, array $stay, array $data): View
    {
        $view = view($name, array_merge($data, $this->stayData($stay)));
        if ($stay['errors'] !== []) {
            $view->withErrors($stay['errors']);
        }

        return $view;
    }

    private function stayData(array $stay): array
    {
        unset($stay['errors']);

        return $stay;
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

        return $adults >= 1 && $adults <= $maxAdults && $children <= $maxChildren;
    }
}
`

  files['app/Http/Controllers/PropertyController.php'] = `<?php

namespace App\\Http\\Controllers;

use App\\Models\\GuestReservation;
use App\\Services\\BuildauraClient;
use App\\Support\\RoomPrice;
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
            'discount_percent' => 'nullable|numeric|min:0|max:100',
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
                'discountPercent' => (float) ($data['discount_percent'] ?? 0),
                'currency' => filled($data['currency'] ?? null) ? RoomPrice::currency((string) $data['currency']) : null,
                'maxAdults' => (int) ($data['max_adults'] ?? 2),
                'maxChildren' => (int) ($data['max_children'] ?? 0),
                'photos' => [],
                'amenities' => [],
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
            'description' => 'nullable|string',
            'base_price' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|max:8',
            'max_adults' => 'nullable|integer|min:1|max:20',
            'max_children' => 'nullable|integer|min:0|max:20',
            'bed_configuration' => 'nullable|string|max:255',
            'size_sqm' => 'nullable|string|max:40',
            'unit_prefix' => 'nullable|string|max:20',
        ]);

        return $this->attempt(function () use ($data, $request, $typeId) {
            $this->crs->updateType($typeId, [
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'basePrice' => (float) ($data['base_price'] ?? 0),
                'discountPercent' => (float) ($data['discount_percent'] ?? 0),
                'currency' => filled($data['currency'] ?? null) ? RoomPrice::currency((string) $data['currency']) : null,
                'maxAdults' => (int) ($data['max_adults'] ?? 2),
                'maxChildren' => (int) ($data['max_children'] ?? 0),
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
            'smoking_allowed' => 'nullable|boolean',
        ]);

        return $this->attempt(function () use ($data, $request) {
            $this->crs->createUnit([
                'roomTypeId' => $data['room_type_id'],
                'code' => $data['code'],
                'smokingAllowed' => $request->boolean('smoking_allowed'),
                'status' => 'AVAILABLE',
            ]);
        }, 'Room saved in Buildaura.');
    }

    public function updateUnit(Request $request, string $unitId): RedirectResponse
    {
        $data = $request->validate([
            'room_type_id' => 'required|uuid',
            'code' => 'required|string|max:40',
            'smoking_allowed' => 'nullable|boolean',
            'status' => 'required|string|in:AVAILABLE,BOOKED,INACTIVE',
        ]);

        return $this->attempt(function () use ($data, $request, $unitId) {
            $this->crs->updateUnit($unitId, [
                'roomTypeId' => $data['room_type_id'],
                'code' => $data['code'],
                'smokingAllowed' => $request->boolean('smoking_allowed'),
                'status' => $data['status'],
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

  files['resources/views/partials/hero-stay-search.blade.php'] = heroStaySearchPartial(payload.templateId)
  files['resources/views/site/rooms.blade.php'] = crsRoomsBlade(accent, payload.templateId)
  files['resources/views/site/room-detail.blade.php'] = crsRoomDetailBlade(accent, payload.templateId)
  files['resources/views/site/book.blade.php'] = crsBookBlade(accent, payload.templateId)
  files['resources/views/site/booking-confirm.blade.php'] = crsConfirmBlade(accent, payload.templateId)

  const flash = `@if($errors->any())<div style="margin-bottom:12px;padding:12px;border:1px solid #fecaca;background:#fef2f2;color:#991b1b">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
@if(session('property_error'))<p style="margin-bottom:12px;padding:12px;border:1px solid #fecaca;background:#fef2f2;color:#991b1b">{{ session('property_error') }}</p>@endif
@if(session('property_message'))<p style="margin-bottom:12px;padding:12px;border:1px solid #bbf7d0;background:#f0fdf4;color:#166534">{{ session('property_message') }}</p>@endif`

  files['app/Filament/Pages/RoomTypes.php'] = `<?php

namespace App\\Filament\\Pages;

use App\\Models\\SiteSetting;
use App\\Services\\BuildauraClient;
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
use Illuminate\\Support\\Facades\\Storage;
use RuntimeException;

class RoomTypes extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-photo';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationLabel = 'Room types';
    protected static ?string $title = 'Room types';
    protected static ?int $navigationSort = 1;
    protected static string $view = 'filament.pages.room-types';

    public ?array $filters = [
        'search' => '',
        'active' => '',
        'sort' => 'sortOrder',
    ];

    public ?string $editingTypeId = null;

    protected array $inventoryCache = [];

    /** @var array<string, list<string>> */
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

    public function imageFor(string $typeId): array
    {
        return $this->images[$typeId] ?? [];
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

    public function getViewData(): array
    {
        $inventory = $this->inventory();

        return [
            'types' => $this->visibleTypes($inventory['roomTypes'] ?? []),
            'units' => $inventory['units'] ?? [],
            'error' => $this->inventoryError,
        ];
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
        $activeFilter = $this->filterText('active');
        $types = [];
        foreach ($all as $type) {
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
                ? ((int) collect($this->inventory()['roomTypes'] ?? [])->max('sortOrder')) + 1
                : (int) ($existing['sortOrder'] ?? 0),
        ];
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

    private function priceHint(Get $get): string
    {
        $rate = (float) SiteSetting::current()->usdt_etb_rate;
        $amount = is_numeric($get('basePrice')) ? (float) $get('basePrice') : 0.0;
        $currency = strtoupper(trim((string) ($get('currency') ?: 'ETB')));
        $other = RoomPrice::other($amount, $currency, $rate);
        if ($rate <= 0) {
            return 'Set the USD to ETB rate on Hotel Policy to show the other currency.';
        }
        if ($other === null) {
            return '1 USD = '.$rate.' ETB.';
        }

        return 'About '.$other.' · 1 USD = '.$rate.' ETB.';
    }

    private function typeForm(bool $creating): array
    {
        $fields = [
            TextInput::make('name')->required()->maxLength(120),
            Textarea::make('description')->rows(3)->helperText('Optional.'),
            TextInput::make('basePrice')->label('Price')->numeric()->default(0)->required()->live(onBlur: true)->helperText(fn (Get $get) => $this->priceHint($get)),
            TextInput::make('discountPercent')->label('Discount %')->numeric()->default(0)->required()->minValue(0)->maxValue(100)->helperText('0 means no discount. 10 means 10% off the price.'),
            Select::make('currency')->options(['ETB' => 'ETB', 'USD' => 'USD'])->default('ETB')->required()->live(),
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
            $fields[] = TextInput::make('unitCount')->label('Rooms to create')->numeric()->default(1)->minValue(0);
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

    private function discountPercent(mixed $value): float
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

    private function amenityOptions(): array
    {
        $options = [];
        foreach (app(BuildauraClient::class)->amenityCatalog('ROOM_TYPE') as $item) {
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

    private function amenities(array $data): array
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

    private function storedPhotos(array $data, ?array $existing): array
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

    private function readUpload(mixed $upload): ?string
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
            $currency = $type['currency'] ?? 'ETB';
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
            <td colspan="6" style="padding:16px 10px;color:#6b7280;font-size:14px;">@if($this->typeFiltersActive())No room types match these filters.@else No room types yet. Add one to create it in Buildaura.@endif</td>
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
    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationLabel = 'Rooms';
    protected static ?string $title = 'Rooms';
    protected static ?int $navigationSort = 2;
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
            $status = strcasecmp((string) ($a['status'] ?? ''), (string) ($b['status'] ?? ''));
            $type = strcasecmp($names[(string) ($a['roomTypeId'] ?? '')] ?? '', $names[(string) ($b['roomTypeId'] ?? '')] ?? '');

            return match ($sort) {
                'code_desc' => -$code,
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
            'smokingAllowed' => (bool) ($data['smokingAllowed'] ?? false),
            'status' => $data['status'] ?? 'AVAILABLE',
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

    private function statusOptions(): array
    {
        return [
            'AVAILABLE' => 'Available',
            'BOOKED' => 'Booked',
            'INACTIVE' => 'Inactive',
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
            <td colspan="5" style="padding:16px 10px;color:#6b7280;">@if($this->unitFiltersActive())No rooms match these filters.@else No rooms yet.@endif</td>
          </tr>
        @endforelse
      </tbody>
    </table>
  </div>
</x-filament::section>
</x-filament-panels::page>
`

  files['app/Filament/Resources/ReservationResource.php'] = `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\ReservationResource\\Pages;
use App\\Models\\GuestReservation;
use App\\Services\\BuildauraClient;
use Filament\\Forms;
use Filament\\Resources\\Resource;
use Filament\\Tables;

class ReservationResource extends Resource
{
    protected static ?string $model = GuestReservation::class;
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
            Forms\\Components\\Select::make('room_type_id')
                ->label('Room type')
                ->options(fn () => static::typeOptions())
                ->searchable()
                ->required()
                ->live()
                ->afterStateUpdated(function (Forms\\Set $set, ?string $state) {
                    $set('room_unit_id', null);
                    $type = static::findType($state);
                    if ($type) {
                        $set('nightly_rate', \\App\\Support\\RoomPrice::selling((float) ($type['basePrice'] ?? 0), (float) ($type['discountPercent'] ?? 0)));
                        if (! empty($type['freeBreakfast'])) {
                            $set('breakfast_selected', true);
                        }
                    }
                }),
            Forms\\Components\\Select::make('room_unit_id')
                ->label('Room')
                ->options(fn (Forms\\Get $get) => static::unitOptions($get('room_type_id')))
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
                $rawId = $get('room_type_id');
                $type = static::findType(is_string($rawId) ? $rawId : null);
                $currency = (string) ($type['currency'] ?? 'ETB');
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
            Forms\\Components\\TextInput::make('room_code')->label('Room number')->disabled()->dehydrated(false)->visibleOn('edit'),
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
            Tables\\Columns\\TextColumn::make('room_code')->label('Room')->searchable()->sortable(),
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
                ->options(fn () => GuestReservation::query()->whereNotNull('room_type_name')->where('room_type_name', '!=', '')->distinct()->orderBy('room_type_name')->pluck('room_type_name', 'room_type_name')->all()),
            Tables\\Filters\\SelectFilter::make('room_code')
                ->label('Room')
                ->placeholder('All rooms')
                ->searchable()
                ->options(fn () => GuestReservation::query()->whereNotNull('room_code')->where('room_code', '!=', '')->distinct()->orderBy('room_code')->pluck('room_code', 'room_code')->all()),
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
            return app(BuildauraClient::class)->inventory();
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
                'room_unit_id' => $e->getMessage(),
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
                'room_unit_id' => $e->getMessage(),
            ]);
        }
    }
}
`

  files['app/Services/ReservationDesk.php'] = `<?php

namespace App\\Services;

use App\\Models\\GuestReservation;
use App\\Models\\SiteSetting;
use App\\Support\\RoomPrice;
use Carbon\\Carbon;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Support\\Str;
use RuntimeException;

class ReservationDesk
{
    private bool $loaded = false;

    private array $inventory = [];

    public function __construct(private BuildauraClient $crs) {}

    public function create(array $data): GuestReservation
    {
        $data = $this->normalize($data);
        $status = (string) ($data['status'] ?? 'confirmed');
        [$type, $unit] = $this->selection($data);
        $code = $this->confirmationCode();
        $blockId = null;
        if ($this->holdsRoom($status)) {
            $blockId = $this->hold((string) $unit['id'], $data['check_in'], $data['check_out'], $code);
        }
        try {
            return GuestReservation::create($this->attributes($data, $type, $unit, $status, $blockId, $code, null));
        } catch (\\Throwable $e) {
            if ($blockId) {
                try {
                    $this->crs->release($blockId);
                } catch (\\Throwable $releaseError) {
                    throw new RuntimeException($e->getMessage().' The room hold could not be released ('.$releaseError->getMessage().').', 0, $e);
                }
            }
            throw $e;
        }
    }

    public function update(Model $record, array $data): GuestReservation
    {
        if (! $record instanceof GuestReservation) {
            throw new RuntimeException('Reservation not found.');
        }
        $data = $this->normalize($data);
        $status = (string) ($data['status'] ?? $record->status);
        [$type, $unit] = $this->selection($data);
        $held = $this->holdsRoom((string) $record->status) && filled($record->crs_block_id);
        $shouldHold = $this->holdsRoom($status);
        $blockId = $record->crs_block_id;
        $unitChanged = (string) $record->room_unit_id !== (string) $unit['id'];
        $datesChanged = $record->check_in->toDateString() !== $data['check_in']
            || $record->check_out->toDateString() !== $data['check_out'];

        if ($held && ! $shouldHold) {
            $this->crs->release((string) $blockId);
            $blockId = null;
        } elseif ($shouldHold && ! $held) {
            $blockId = $this->hold((string) $unit['id'], $data['check_in'], $data['check_out'], (string) $record->confirmation_code);
        } elseif ($shouldHold && $held && $unitChanged) {
            $this->crs->release((string) $blockId);
            try {
                $blockId = $this->hold((string) $unit['id'], $data['check_in'], $data['check_out'], (string) $record->confirmation_code);
            } catch (\\Throwable $e) {
                $this->restoreHold($record, $e);
            }
        } elseif ($shouldHold && $held && $datesChanged) {
            $this->crs->updateOccupancy((string) $blockId, [
                'checkIn' => $data['check_in'],
                'checkOut' => $data['check_out'],
                'externalRef' => $record->confirmation_code,
            ]);
        }

        $record->fill($this->attributes($data, $type, $unit, $status, $blockId, null, $record));
        $record->save();

        return $record;
    }

    private function selection(array $data): array
    {
        $this->assertDates($data);
        $this->assertChildAges($data);
        $type = $this->requireType((string) ($data['room_type_id'] ?? ''));
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
        $unit = $this->requireUnit((string) ($data['room_unit_id'] ?? ''), (string) $type['id']);

        return [$type, $unit];
    }

    private function hold(string $unitId, string $checkIn, string $checkOut, string $code): string
    {
        $occupancy = $this->crs->occupy($unitId, $checkIn, $checkOut, $code, 'MANUAL');
        $id = $occupancy['id'] ?? null;
        if (! is_string($id) || $id === '') {
            throw new RuntimeException('BuildAura did not confirm the room hold.');
        }

        return $id;
    }

    private function restoreHold(GuestReservation $reservation, \\Throwable $failed): void
    {
        try {
            $reservation->crs_block_id = $this->hold(
                (string) $reservation->room_unit_id,
                $reservation->check_in->toDateString(),
                $reservation->check_out->toDateString(),
                (string) $reservation->confirmation_code,
            );
            $reservation->save();
        } catch (\\Throwable) {
            $reservation->crs_block_id = null;
            $reservation->save();
            throw new RuntimeException('The room change failed and the previous hold could not be restored. Check the room in BuildAura, then save again. '.$failed->getMessage(), 0, $failed);
        }
        throw new RuntimeException($failed->getMessage(), 0, $failed);
    }

    private function attributes(array $data, array $type, array $unit, string $status, ?string $blockId, ?string $code, ?GuestReservation $existing): array
    {
        $nights = max(1, (int) Carbon::parse($data['check_in'])->diffInDays(Carbon::parse($data['check_out'])));
        $nightly = $data['nightly_rate'] ?? null;
        if ($nightly === null || $nightly === '') {
            $nightly = $existing
                ? (float) $existing->nightly_rate
                : RoomPrice::selling((float) ($type['basePrice'] ?? 0), (float) ($type['discountPercent'] ?? 0));
        }
        $typeChanged = $existing && (string) $existing->room_type_id !== (string) $type['id'];
        $currency = (! $existing || $typeChanged)
            ? (string) ($type['currency'] ?? 'ETB')
            : (string) ($existing->currency ?: ($type['currency'] ?? 'ETB'));
        $freeBreakfast = (bool) ($type['freeBreakfast'] ?? false);
        $wantsBreakfast = $freeBreakfast || (bool) ($data['breakfast_selected'] ?? false);
        $charge = RoomPrice::breakfastCharge(
            $freeBreakfast,
            $wantsBreakfast,
            (float) SiteSetting::current()->breakfast_price,
            $nights
        );
        $attributes = [
            'room_type_id' => $type['id'],
            'room_unit_id' => $unit['id'],
            'crs_block_id' => $blockId,
            'room_type_name' => $type['name'] ?? '',
            'room_code' => $unit['code'] ?? '',
            'check_in' => $data['check_in'],
            'check_out' => $data['check_out'],
            'adults' => (int) ($data['adults'] ?? 1),
            'children' => (int) ($data['children'] ?? 0),
            'child_ages' => array_values(array_map('intval', is_array($data['child_ages'] ?? null) ? $data['child_ages'] : [])),
            'guest_name' => $data['guest_name'] ?? '',
            'guest_email' => $data['guest_email'] ?? '',
            'guest_phone' => $data['guest_phone'] ?? '',
            'status' => $status,
            'nightly_rate' => $nightly,
            'breakfast_selected' => $charge['selected'],
            'breakfast_total' => $charge['total'],
            'free_cancellation' => (bool) ($type['freeCancellation'] ?? false),
            'cancellation_fee' => ! empty($type['freeCancellation']) ? 0 : (float) SiteSetting::current()->cancellation_fee,
            'total_price' => round((float) $nightly * $nights + $charge['total'], 2),
            'currency' => $currency,
            'special_requests' => $data['special_requests'] ?? null,
            'admin_notes' => $data['admin_notes'] ?? null,
        ];
        if ($code !== null) {
            $attributes['confirmation_code'] = $code;
            $attributes['payment_method'] = 'admin';
            $attributes['payment_last4'] = null;
        }

        return $attributes;
    }

    private function holdsRoom(string $status): bool
    {
        return ! in_array($status, ['cancelled', 'no_show'], true);
    }

    private function confirmationCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (GuestReservation::query()->where('confirmation_code', $code)->exists());

        return $code;
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

  files['app/Filament/Pages/ApiKey.php'] = `<?php

namespace App\\Filament\\Pages;

use Filament\\Pages\\Page;

class ApiKey extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-lock-closed';
    protected static ?string $navigationGroup = 'Hospitality';
    protected static ?string $navigationLabel = 'API key';
    protected static ?string $title = 'API key';
    protected static ?int $navigationSort = 4;
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

  files['app/Filament/Widgets/BookingStatsOverview.php'] = `<?php

namespace App\\Filament\\Widgets;

use App\\Models\\GuestReservation;
use App\\Services\\BuildauraClient;
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
            $inventory = app(BuildauraClient::class)->inventory();
            $types = count($inventory['roomTypes'] ?? []);
            $units = count($inventory['units'] ?? []);
        } catch (\\Throwable) {
        }

        return [
            Stat::make('CRS room types', $types),
            Stat::make('CRS units', $units),
            Stat::make('Local reservations', GuestReservation::count()),
        ];
    }
}
`

  Object.assign(files, roomCalendarFiles('BuildauraClient', 'Rooms'))

  return files
}
