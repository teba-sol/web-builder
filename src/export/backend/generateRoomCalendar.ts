/** Room detail calendar for an exported Filament admin. Checkout morning is free. */
export function roomCalendarFiles(
  client: 'CrsClient' | 'BuildauraClient',
  backPage: 'ManageRooms' | 'Rooms',
): Record<string, string> {
  const php = `<?php

namespace App\\Filament\\Pages;

use Carbon\\Carbon;
use Filament\\Actions\\Action;
use Filament\\Pages\\Page;

class RoomCalendar extends Page
{
    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $slug = 'rooms/{unitId}/calendar';

    protected static string $view = 'filament.pages.room-calendar';

    public string $unitId = '';

    public string $month = '';

    protected array $inventoryCache = [];

    protected ?string $loadError = null;

    public function mount(string $unitId): void
    {
        $this->unitId = $unitId;
        if ($this->month === '') {
            $this->month = now()->format('Y-m');
        }
    }

    public function previousMonth(): void
    {
        $this->month = $this->monthStart()->subMonth()->format('Y-m');
    }

    public function nextMonth(): void
    {
        $this->month = $this->monthStart()->addMonth()->format('Y-m');
    }

    public function currentMonth(): void
    {
        $this->month = now()->format('Y-m');
    }

    public function getTitle(): string
    {
        $unit = $this->findUnit();
        $code = is_array($unit) ? trim((string) ($unit['code'] ?? '')) : '';

        return ($code !== '' ? $code : 'Room') . ' calendar';
    }

    public function getSubheading(): ?string
    {
        return 'Available, booked, and inactive nights. The checkout morning is available.';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('rooms')
                ->label('All rooms')
                ->color('gray')
                ->url(\\App\\Filament\\Pages\\${backPage}::getUrl()),
        ];
    }

    public function getViewData(): array
    {
        $inventory = $this->inventory();
        $unit = $this->findUnit();
        $monthStart = $this->monthStart();
        $monthEnd = $monthStart->copy()->endOfMonth();
        $blocks = $this->blocksForUnit();
        $typeName = '';
        if (is_array($unit)) {
            foreach ($inventory['roomTypes'] ?? [] as $type) {
                if (is_array($type) && (string) ($type['id'] ?? '') === (string) ($unit['roomTypeId'] ?? '')) {
                    $typeName = (string) ($type['name'] ?? '');
                    break;
                }
            }
        }

        $unitStatus = is_array($unit) ? strtoupper((string) ($unit['status'] ?? 'AVAILABLE')) : 'AVAILABLE';
        $inactiveRoom = $unitStatus === 'INACTIVE';
        $days = [];
        $cursor = $monthStart->copy()->startOfWeek(Carbon::MONDAY);
        $gridEnd = $monthEnd->copy()->endOfWeek(Carbon::SUNDAY);
        while ($cursor->lte($gridEnd)) {
            $date = $cursor->toDateString();
            $inMonth = $cursor->month === $monthStart->month;
            $cover = $inactiveRoom ? null : $this->coveringBlock($blocks, $date);
            if (! $inMonth) {
                $kind = '';
                $kindLabel = '';
                $dot = '';
                $cell = 'background:#f8fafc;border-color:transparent;color:#cbd5e1;';
            } elseif ($inactiveRoom) {
                $kind = 'INACTIVE';
                $kindLabel = 'Inactive';
                $dot = '#6b7280';
                $cell = 'background:#f3f4f6;border-color:#6b7280;color:#4b5563;';
            } elseif (is_array($cover)) {
                $kind = 'BOOKED';
                $kindLabel = 'Booked';
                $dot = '#ffffff';
                $cell = 'background:#7c3aed;border-color:#5b21b6;color:#ffffff;';
            } else {
                $kind = 'AVAILABLE';
                $kindLabel = 'Available';
                $dot = '#34d399';
                $cell = 'background:#ecfdf5;border-color:#34d399;color:#065f46;';
            }
            $days[] = [
                'label' => $cursor->format('j'),
                'inMonth' => $inMonth,
                'isToday' => $date === now()->toDateString(),
                'kind' => $kind,
                'kindLabel' => $kindLabel,
                'dot' => $dot,
                'cell' => $cell,
                'ref' => is_array($cover) ? (string) ($cover['externalRef'] ?? '') : '',
            ];
            $cursor->addDay();
        }

        $busy = 0;
        $walk = $monthStart->copy();
        while ($walk->lte($monthEnd)) {
            if (! $inactiveRoom && $this->coveringBlock($blocks, $walk->toDateString()) !== null) {
                $busy++;
            }
            $walk->addDay();
        }
        $daysInMonth = $monthStart->daysInMonth;
        $inactiveNights = $inactiveRoom ? $daysInMonth : 0;
        $availableNights = $inactiveRoom ? 0 : max(0, $daysInMonth - $busy);

        $bars = [];
        $rows = [];
        $laneEnds = [];
        foreach ($blocks as $block) {
            $in = $this->dayString($block['checkIn'] ?? null);
            $out = $this->dayString($block['checkOut'] ?? null);
            if ($in === '' || $out === '' || $out <= $in) {
                continue;
            }
            $nights = 0;
            for ($night = Carbon::parse($in); $night->lt(Carbon::parse($out)) && $nights < 3660; $night->addDay()) {
                $nights++;
            }
            $meta = $this->kindMeta((string) ($block['kind'] ?? ''));
            $rows[] = [
                'checkIn' => $in,
                'checkOut' => $out,
                'nights' => $nights,
                'kindLabel' => $meta['label'],
                'bar' => $meta['bar'],
                'ref' => (string) ($block['externalRef'] ?? ''),
                'touches' => $in <= $monthEnd->toDateString() && $out > $monthStart->toDateString(),
            ];
            $lastNight = Carbon::parse($out)->subDay();
            if ($lastNight->lt($monthStart) || Carbon::parse($in)->gt($monthEnd)) {
                continue;
            }
            $barStart = Carbon::parse($in)->lt($monthStart) ? $monthStart->copy() : Carbon::parse($in);
            $barEnd = $lastNight->gt($monthEnd) ? $monthEnd->copy() : $lastNight;
            $span = 0;
            for ($tick = $barStart->copy(); $tick->lte($barEnd) && $span < 40; $tick->addDay()) {
                $span++;
            }
            $lane = null;
            foreach ($laneEnds as $index => $endDay) {
                if ($barStart->toDateString() > $endDay) {
                    $lane = $index;
                    $laneEnds[$index] = $barEnd->toDateString();
                    break;
                }
            }
            if ($lane === null) {
                $lane = count($laneEnds);
                $laneEnds[] = $barEnd->toDateString();
            }
            $bars[] = [
                'left' => round(($barStart->day - 1) / $daysInMonth * 100, 4),
                'width' => round(max(1, $span) / $daysInMonth * 100, 4),
                'label' => trim($meta['label'] . ' ' . (string) ($block['externalRef'] ?? '')),
                'fill' => $meta['bar'],
                'lane' => $lane,
            ];
        }

        return [
            'error' => $this->loadError,
            'unit' => $unit,
            'typeName' => $typeName,
            'monthLabel' => $monthStart->format('F Y'),
            'days' => $days,
            'daysInMonth' => $daysInMonth,
            'busyNights' => $busy,
            'availableNights' => $availableNights,
            'inactiveNights' => $inactiveNights,
            'bars' => $bars,
            'laneCount' => max(1, count($laneEnds)),
            'rows' => $rows,
            'legend' => [
                ['label' => 'Available', 'swatch' => '#34d399'],
                ['label' => 'Booked', 'swatch' => '#7c3aed'],
                ['label' => 'Inactive', 'swatch' => '#6b7280'],
            ],
            'backUrl' => \\App\\Filament\\Pages\\${backPage}::getUrl(),
        ];
    }

    private function monthStart(): Carbon
    {
        try {
            return Carbon::parse($this->month . '-01')->startOfMonth();
        } catch (\\Throwable) {
            return now()->startOfMonth();
        }
    }

    private function inventory(): array
    {
        if ($this->inventoryCache !== []) {
            return $this->inventoryCache;
        }
        try {
            $loaded = app(\\App\\Services\\${client}::class)->inventory();
            $this->inventoryCache = is_array($loaded) && $loaded !== [] ? $loaded : ['roomTypes' => [], 'units' => [], 'occupancy' => []];
            $this->loadError = null;
        } catch (\\Throwable $e) {
            $this->inventoryCache = ['roomTypes' => [], 'units' => [], 'occupancy' => []];
            $this->loadError = $e->getMessage();
        }

        return $this->inventoryCache;
    }

    private function findUnit(): ?array
    {
        foreach ($this->inventory()['units'] ?? [] as $unit) {
            if (is_array($unit) && (string) ($unit['id'] ?? '') === $this->unitId) {
                return $unit;
            }
        }

        return null;
    }

    private function blocksForUnit(): array
    {
        $blocks = [];
        foreach ($this->inventory()['occupancy'] ?? [] as $block) {
            if (! is_array($block) || (string) ($block['roomUnitId'] ?? '') !== $this->unitId) {
                continue;
            }
            $blocks[] = $block;
        }
        usort($blocks, function (array $a, array $b): int {
            return strcmp($this->dayString($a['checkIn'] ?? null), $this->dayString($b['checkIn'] ?? null));
        });

        return $blocks;
    }

    private function coveringBlock(array $blocks, string $date): ?array
    {
        foreach ($blocks as $block) {
            $in = $this->dayString($block['checkIn'] ?? null);
            $out = $this->dayString($block['checkOut'] ?? null);
            if ($in !== '' && $out !== '' && $date >= $in && $date < $out) {
                return $block;
            }
        }

        return null;
    }

    private function dayString(mixed $value): string
    {
        if (! is_string($value) || trim($value) === '') {
            return '';
        }
        try {
            return Carbon::parse($value)->toDateString();
        } catch (\\Throwable) {
            return '';
        }
    }

    private function kindMeta(string $kind): array
    {
        return [
            'label' => 'Booked',
            'swatch' => '#7c3aed',
            'dot' => '#ffffff',
            'cell' => 'background:#7c3aed;border-color:#5b21b6;color:#ffffff;',
            'bar' => 'background:#7c3aed;color:#ffffff;',
        ];
    }
}
`

  const blade = `<x-filament-panels::page>
    @if($error)
        <div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ $error }}</div>
    @endif

    @if(! is_array($unit))
        <div class="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            <p class="text-sm text-gray-600">This room is no longer in BuildAura.</p>
            <a href="{{ $backUrl }}" class="mt-4 inline-flex text-sm font-semibold text-gray-900 underline">Back to rooms</a>
        </div>
    @else
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
                <p class="text-sm text-gray-500">
                    {{ $typeName !== '' ? $typeName : 'Room' }}
                    · @if(strtoupper((string) ($unit['status'] ?? 'AVAILABLE')) === 'BOOKED') Booked @elseif(strtoupper((string) ($unit['status'] ?? 'AVAILABLE')) === 'INACTIVE') Inactive @else Available @endif
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
                    <span style="border-radius:999px;background:#ecfdf5;color:#065f46;border:1px solid #34d399;padding:4px 12px;font-size:14px;font-weight:600;">{{ $availableNights }} available</span>
                    <span style="border-radius:999px;background:#7c3aed;color:#ffffff;padding:4px 12px;font-size:14px;font-weight:600;">{{ $busyNights }} booked</span>
                    <span style="border-radius:999px;background:#f3f4f6;color:#4b5563;border:1px solid #6b7280;padding:4px 12px;font-size:14px;font-weight:600;">{{ $inactiveNights }} inactive</span>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <x-filament::button size="sm" color="gray" type="button" wire:click="previousMonth">Previous</x-filament::button>
                <span class="min-w-36 text-center text-sm font-semibold text-gray-950">{{ $monthLabel }}</span>
                <x-filament::button size="sm" color="gray" type="button" wire:click="nextMonth">Next</x-filament::button>
                <x-filament::button size="sm" color="gray" outlined type="button" wire:click="currentMonth">Today</x-filament::button>
            </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:16px;font-size:13px;font-weight:600;color:#374151;">
            @foreach($legend as $item)
                <span style="display:inline-flex;align-items:center;gap:8px;">
                    <span style="width:12px;height:12px;border-radius:999px;background:{{ $item['swatch'] }};box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);"></span>
                    {{ $item['label'] }}
                </span>
            @endforeach
        </div>

        <x-filament::section>
            <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin-bottom:8px;text-align:center;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#9ca3af;">
                @foreach(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as $weekday)
                    <div>{{ $weekday }}</div>
                @endforeach
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;">
                @foreach($days as $day)
                    <div style="min-height:4.75rem;border-radius:12px;border:1px solid transparent;padding:8px;{{ $day['cell'] }}{{ $day['isToday'] ? 'box-shadow:inset 0 0 0 2px #111827;' : '' }}">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                            <span style="font-size:14px;font-weight:700;">{{ $day['label'] }}</span>
                            @if($day['dot'] !== '')
                                <span style="width:8px;height:8px;border-radius:999px;background:{{ $day['dot'] }};"></span>
                            @endif
                        </div>
                        @if($day['kind'] !== '')
                            <p style="margin:8px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:700;">{{ $day['kindLabel'] }}</p>
                            @if($day['ref'] !== '')
                                <p style="margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;opacity:.8;">{{ $day['ref'] }}</p>
                            @endif
                        @elseif($day['inMonth'])
                            <p style="margin:8px 0 0;font-size:11px;font-weight:700;">Available</p>
                        @endif
                    </div>
                @endforeach
            </div>
        </x-filament::section>

        <x-filament::section heading="Timeline" class="mt-6">
            <div style="position:relative;border-radius:12px;background:#f1f5f9;height:{{ count($bars) === 0 ? 3 : ($laneCount * 2.25) }}rem;">
                @forelse($bars as $bar)
                    <div style="position:absolute;display:flex;align-items:center;overflow:hidden;border-radius:8px;padding:0 8px;font-size:12px;font-weight:700;left:{{ $bar['left'] }}%;width:{{ $bar['width'] }}%;top:{{ ($bar['lane'] * 2.25) + 0.25 }}rem;height:1.75rem;{{ $bar['fill'] }}">
                        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ $bar['label'] }}</span>
                    </div>
                @empty
                    <div style="display:flex;height:100%;align-items:center;justify-content:center;font-size:14px;color:#64748b;">Every night this month is available.</div>
                @endforelse
            </div>
            <div class="mt-1 grid text-[10px] text-gray-400" style="grid-template-columns: repeat({{ $daysInMonth }}, minmax(0, 1fr));">
                @for($tick = 1; $tick <= $daysInMonth; $tick++)
                    <div class="text-center">{{ $tick % 2 === 1 || $daysInMonth <= 16 ? $tick : '' }}</div>
                @endfor
            </div>
        </x-filament::section>

        <x-filament::section heading="Reservations" class="mt-6">
            <div class="overflow-x-auto">
                <table class="w-full min-w-[36rem] text-sm">
                    <thead>
                        <tr class="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <th class="px-3 py-2">Check-in</th>
                            <th class="px-3 py-2">Check-out</th>
                            <th class="px-3 py-2">Nights</th>
                            <th class="px-3 py-2">Status</th>
                            <th class="px-3 py-2">Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($rows as $row)
                            <tr class="border-t border-gray-100 {{ $row['touches'] ? 'bg-gray-50' : '' }}">
                                <td class="px-3 py-3 font-medium text-gray-900">{{ $row['checkIn'] }}</td>
                                <td class="px-3 py-3">{{ $row['checkOut'] }}</td>
                                <td class="px-3 py-3">{{ $row['nights'] }}</td>
                                <td class="px-3 py-3">
                                    <span style="display:inline-block;border-radius:999px;padding:2px 8px;font-size:12px;font-weight:700;{{ $row['bar'] }}">{{ $row['kindLabel'] }}</span>
                                </td>
                                <td class="px-3 py-3 text-gray-600">{{ $row['ref'] !== '' ? $row['ref'] : '—' }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="px-3 py-8 text-center text-gray-500">No reservations on this room yet.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </x-filament::section>
    @endif
</x-filament-panels::page>
`

  return {
    'app/Filament/Pages/RoomCalendar.php': php,
    'resources/views/filament/pages/room-calendar.blade.php': blade,
  }
}
