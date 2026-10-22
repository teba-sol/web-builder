import { accentButton, exportStaySkin } from '../../templates/booking/hospitalitySkin'

function skinOf(templateId: string, accent?: string) {
  const skin = exportStaySkin(templateId)
  if (!accent) return skin
  return { ...skin, button: accentButton(templateId, accent) }
}

export function breakfastStatus(freeExpr: string, currencyExpr: string, invite: boolean): string {
  const inviteLine = invite
    ? '\n<p class="text-xs text-slate-500">Add it when you select rooms.</p>'
    : ''
  return `@php
  $breakfastIncluded = (bool) (${freeExpr});
  $breakfastNight = (float) ($settings->breakfast_price ?? 0);
  $breakfastCode = \\App\\Support\\RoomPrice::currency((string) (${currencyExpr}));
  $breakfastOther = \\App\\Support\\RoomPrice::other($breakfastNight, $breakfastCode, (float) ($settings->usdt_etb_rate ?? 0));
  $breakfastExtra = $breakfastOther ? ' · '.$breakfastOther.' / night' : '';
@endphp
@if($breakfastIncluded)
<p class="mt-1 text-sm font-semibold text-emerald-700">Breakfast included</p>
@elseif($breakfastNight > 0)
<p class="mt-1 text-sm text-slate-700">Breakfast {{ number_format($breakfastNight, 0) }} {{ $breakfastCode }} / night{{ $breakfastExtra }}</p>${inviteLine}
@else
<p class="mt-1 text-sm text-slate-500">Breakfast is not included.</p>
@endif`
}

export function heroStaySearchPartial(templateId: string): string {
  const skin = skinOf(templateId)
  return `@php
  $checkIn = now()->addDay()->toDateString();
  $checkOut = now()->addDays(3)->toDateString();
  $adults = 2;
  $children = 0;
  $childAges = [];
  $minDate = now()->toDateString();
@endphp
<div class="mt-8 w-full text-left text-slate-900 lg:col-span-2">
@include('partials.stay-search', [
  'searchAction' => route('rooms.index'),
  'checkIn' => $checkIn,
  'checkOut' => $checkOut,
  'adults' => $adults,
  'children' => $children,
  'childAges' => $childAges,
  'minDate' => $minDate,
  'submitLabel' => 'Search',
  'searchClass' => '${skin.search}',
])
</div>
`
}

function stepper(step: number, templateId: string): string {
  const skin = skinOf(templateId)
  return `@php $bookingStep = ${step}; @endphp
<ol class="${skin.stepper}" aria-label="Booking steps">
  @foreach(['Reservation', 'Payment', 'Confirmation'] as $index => $label)
  <li class="{{ $bookingStep === $index + 1 ? '${skin.stepOn}' : '${skin.stepOff}' }}" @if($bookingStep === $index + 1) aria-current="step" @endif>
    <span class="mb-1 block text-[11px] opacity-70">{{ $index + 1 }}</span>{{ $label }}
  </li>
  @endforeach
</ol>`
}

function tail(templateId: string, accent: string): string {
  const skin = skinOf(templateId, accent)
  return `<section class="mt-12">
  <h2 class="text-2xl ${skin.heading}">House rules</h2>
  @if(!empty($settings->house_rules))
  <a href="{{ \\App\\Support\\PublicAsset::url($settings->house_rules) }}" class="mt-3 inline-block text-sm font-semibold underline" style="color:${accent}" target="_blank" rel="noreferrer">Download house rules</a>
  <p class="mt-2 text-sm text-slate-600">PDF or Word, published by the hotel.</p>
  @else
  <p class="mt-3 text-slate-600">House rules will appear here when the hotel uploads a PDF or Word file.</p>
  @endif
</section>
<section class="mt-12">
  <h2 class="text-2xl ${skin.heading}">Contact</h2>
  <dl class="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
    @if($settings->phone)<div><dt class="text-xs font-semibold uppercase tracking-wider text-slate-600">Phone</dt><dd class="mt-1">{{ $settings->phone }}</dd></div>@endif
    @if($settings->email)<div><dt class="text-xs font-semibold uppercase tracking-wider text-slate-600">Email</dt><dd class="mt-1">{{ $settings->email }}</dd></div>@endif
    @if($settings->reservation_email)<div><dt class="text-xs font-semibold uppercase tracking-wider text-slate-600">Reservations</dt><dd class="mt-1">{{ $settings->reservation_email }}</dd></div>@endif
    @if($settings->address)<div><dt class="text-xs font-semibold uppercase tracking-wider text-slate-600">Address</dt><dd class="mt-1">{{ $settings->address }}</dd></div>@endif
  </dl>
  @include('partials.map')
</section>`
}

export function crsRoomsBlade(accent: string, templateId: string): string {
  const skin = skinOf(templateId, accent)
  return `@extends('layouts.site')
@section('title', ($settings->rooms_section_title ?? 'Book') . ' — ' . $settings->business_name)
@section('content')
@php
  $stayQuery = $searched ? ['check_in' => $checkIn, 'check_out' => $checkOut, 'adults' => $adults, 'children' => $children, 'child_ages' => $childAges] : [];
@endphp
<section class="${skin.page} py-12">
  <div class="mx-auto max-w-6xl px-6">
    <p class="${skin.eyebrow}">Book</p>
    <h1 class="mt-2 text-4xl ${skin.heading}">{{ $settings->rooms_section_title ?? 'Rooms' }}</h1>
    <p class="mt-3 text-lg text-slate-600">{{ $settings->rooms_section_subtitle }}</p>
    @include('partials.stay-policies')
    <div class="mt-8">
      @include('partials.stay-search', ['searchAction' => route('rooms.index'), 'checkIn' => $checkIn, 'checkOut' => $checkOut, 'adults' => $adults, 'children' => $children, 'childAges' => $childAges, 'minDate' => $minDate, 'submitLabel' => 'Search', 'searchClass' => '${skin.search}'])
    </div>
    @if($apiError)<p class="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">{{ $apiError }}</p>@endif
    @if($errors->any())<div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
    <div class="mt-8 space-y-5">
      @foreach($roomTypes as $type)
      @php $amenities = is_array($type['amenities'] ?? null) ? $type['amenities'] : []; @endphp
      <article class="${skin.tile}">
        <div class="grid md:grid-cols-[280px_1fr]">
          @if(!empty($type['photos'][0]))
          <a href="{{ route('rooms.show', array_merge(['slug' => $type['slug']], $stayQuery)) }}"><img src="{{ \\App\\Support\\PublicAsset::url($type['photos'][0]) }}" alt="{{ $type['name'] }}" class="h-56 w-full object-cover md:h-full" /></a>
          @else
          <div class="h-56 w-full bg-slate-100 md:h-full"></div>
          @endif
          <div class="flex flex-col p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl ${skin.heading}">{{ $type['name'] }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ (int) ($type['maxAdults'] ?? 2) }} adults · {{ (int) ($type['maxChildren'] ?? 0) }} children</p>
              </div>
              <div class="text-right">@include('partials.room-price', ['priceBase' => $type['basePrice'] ?? 0, 'pricePercent' => $type['discountPercent'] ?? 0, 'priceCurrency' => $type['currency'] ?? '', 'priceAccent' => '${accent}', 'priceSuffix' => '/ night'])</div>
            </div>
            <p class="mt-3 text-sm font-semibold {{ !empty($type['freeCancellation']) ? 'text-emerald-700' : 'text-slate-500' }}">{{ \\App\\Support\\RoomPrice::cancellationNote(!empty($type['freeCancellation']), (float) ($settings->cancellation_fee ?? 0), (string) ($type['currency'] ?? '')) }}</p>
            ${breakfastStatus("!empty($type['freeBreakfast'])", "(string) ($type['currency'] ?? '')", false)}
            @if(!empty($type['description']))<p class="mt-4 leading-relaxed text-slate-600">{{ $type['description'] }}</p>@endif
            <div class="mt-4 flex flex-wrap gap-2 text-xs">
              @foreach(array_slice($amenities, 0, 8) as $amenity)<span class="rounded-full bg-white px-3 py-1 text-slate-900">{{ $amenity }}</span>@endforeach
            </div>
            <div class="mt-4">@include('partials.stay-policies', ['compact' => true])</div>
            <div class="mt-5 flex justify-end">
              <a href="{{ route('rooms.show', array_merge(['slug' => $type['slug']], $stayQuery)) }}" class="${skin.button}" style="background-color:${accent}">See availability</a>
            </div>
          </div>
        </div>
      </article>
      @endforeach
    </div>
    @if(empty($roomTypes) && !$apiError)<p class="mt-8 text-center text-slate-500">Rooms will appear here once they are added in the site admin.</p>@endif
  </div>
</section>
@endsection
`
}

export function crsRoomDetailBlade(accent: string, templateId: string): string {
  const skin = skinOf(templateId, accent)
  return `@extends('layouts.site')
@section('title', ($roomType['name'] ?? 'Room') . ' — ' . $settings->business_name)
@section('content')
@php
  $amenities = is_array($roomType['amenities'] ?? null) ? $roomType['amenities'] : [];
  $photos = array_values(array_filter($roomType['photos'] ?? []));
  $stayQuery = $searched ? ['check_in' => $checkIn, 'check_out' => $checkOut, 'adults' => $adults, 'children' => $children, 'child_ages' => $childAges] : [];
@endphp
<section class="${skin.page} py-12">
  <div class="mx-auto max-w-6xl px-6">
    ${stepper(1, templateId)}
    <a href="{{ route('rooms.index', $stayQuery) }}" class="text-sm text-slate-500 hover:underline">Back to Book</a>
    <div class="mt-6 grid items-start gap-10 lg:grid-cols-2">
      <div>
        @if(!empty($roomType['photos'][0]))
        <img src="{{ \\App\\Support\\PublicAsset::url($roomType['photos'][0]) }}" alt="{{ $roomType['name'] }}" class="aspect-[16/9] w-full object-cover ${skin.card}" />
        @else
        <div class="aspect-[16/9] w-full bg-slate-100 ${skin.card}"></div>
        @endif
        @if(count($photos) > 1)
        <div class="mt-3 flex gap-2 overflow-x-auto">
          @foreach($photos as $photo)
          <img src="{{ \\App\\Support\\PublicAsset::url($photo) }}" alt="" class="h-16 w-24 object-cover ${skin.card}" />
          @endforeach
        </div>
        @endif
      </div>
      <div>
        <p class="${skin.eyebrow}">Room type</p>
        <h1 class="mt-2 text-4xl ${skin.heading}">{{ $roomType['name'] }}</h1>
        <p class="mt-2 text-sm text-slate-500">{{ (int) ($roomType['maxAdults'] ?? 2) }} adults · {{ (int) ($roomType['maxChildren'] ?? 0) }} children</p>
        @include('partials.room-price', ['priceBase' => $listNightly ?? ($roomType['basePrice'] ?? 0), 'pricePercent' => $roomType['discountPercent'] ?? 0, 'priceCurrency' => $roomType['currency'] ?? '', 'priceAccent' => '${accent}', 'priceSuffix' => '/ night', 'priceRateHint' => true])
        <p class="mt-3 text-sm font-medium {{ !empty($roomType['freeCancellation']) ? 'text-emerald-700' : 'text-slate-500' }}">{{ \\App\\Support\\RoomPrice::cancellationNote(!empty($roomType['freeCancellation']), (float) ($settings->cancellation_fee ?? 0), (string) ($roomType['currency'] ?? '')) }}</p>
        ${breakfastStatus("!empty($roomType['freeBreakfast'])", "(string) ($roomType['currency'] ?? '')", true)}
        @if(!empty($roomType['description']))<p class="mt-5 leading-relaxed text-slate-700">{{ $roomType['description'] }}</p>@endif
        <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt class="text-slate-600">Sleeps</dt><dd>{{ $roomType['maxAdults'] ?? 2 }} adults · {{ $roomType['maxChildren'] ?? 0 }} children</dd></div>
          @if(!empty($roomType['bedConfiguration']))<div><dt class="text-slate-600">Beds</dt><dd>{{ $roomType['bedConfiguration'] }}</dd></div>@endif
          @if(!empty($roomType['sizeSqm']))<div><dt class="text-slate-600">Size</dt><dd>{{ $roomType['sizeSqm'] }} m²</dd></div>@endif
        </dl>
      </div>
    </div>
    <section class="mt-12 grid items-center gap-8 lg:grid-cols-2">
      <div>
        <h2 class="text-2xl ${skin.heading}">About the property</h2>
        <p class="mt-4 leading-relaxed text-slate-700">{{ $settings->about }}</p>
      </div>
      @if($settings->about_image)
      <img src="{{ \\App\\Support\\PublicAsset::url($settings->about_image) }}" alt="" class="aspect-[4/3] w-full object-cover ${skin.card}" />
      @else
      <div class="aspect-[4/3] w-full bg-slate-100 ${skin.card}"></div>
      @endif
    </section>
    <section class="mt-12">
      <h2 class="text-2xl ${skin.heading}">Amenities</h2>
      <ul class="mt-4 flex flex-wrap gap-2">@foreach($amenities as $amenity)<li class="rounded-full border bg-white px-3 py-1 text-slate-900 text-sm">{{ $amenity }}</li>@endforeach</ul>
    </section>
    <section class="mt-12">
      <h2 class="text-2xl ${skin.heading}">Find a room</h2>
      @include('partials.stay-search', ['searchAction' => route('rooms.show', $roomType['slug']), 'checkIn' => $checkIn, 'checkOut' => $checkOut, 'adults' => $adults, 'children' => $children, 'childAges' => $childAges, 'minDate' => $minDate, 'submitLabel' => 'Search room', 'searchClass' => '${skin.search}'])
    </section>
    @include('partials.stay-policies')
    @if($errors->any())<div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
    <div class="mt-8">
      @if($searched)
        @if(count($units))
        <form method="GET" action="{{ route('book') }}" class="space-y-4">
          <input type="hidden" name="room_type_id" value="{{ $roomType['id'] }}" />
          <input type="hidden" name="check_in" value="{{ $checkIn }}" />
          <input type="hidden" name="check_out" value="{{ $checkOut }}" />
          <input type="hidden" name="adults" value="{{ $adults }}" />
          <input type="hidden" name="children" value="{{ $children }}" />
          @foreach($childAges as $age)<input type="hidden" name="child_ages[]" value="{{ $age }}" />@endforeach
          @foreach($units as $unit)
          <label class="relative grid cursor-pointer items-center gap-4 p-4 md:grid-cols-[180px_1fr_auto] ${skin.card}">
            <span class="${skin.badge}">{{ $unit['code'] ?? '' }}</span>
            @if(!empty($roomType['photos'][0]))
            <img src="{{ \\App\\Support\\PublicAsset::url($roomType['photos'][0]) }}" alt="" class="h-28 w-full object-cover" />
            @else
            <div class="h-28 w-full bg-slate-100"></div>
            @endif
            <span>
              <span class="block font-semibold">{{ (int) ($roomType['maxAdults'] ?? 2) }} adults · {{ (int) ($roomType['maxChildren'] ?? 0) }} children</span>
              <span class="mt-2 block text-sm text-slate-600">{{ !empty($unit['smokingAllowed']) ? 'Smoking allowed' : 'No smoking' }}</span>
            </span>
            <div class="text-right">
              @include('partials.room-price', ['priceBase' => $listNightly ?? 0, 'pricePercent' => $roomType['discountPercent'] ?? 0, 'priceCurrency' => $roomType['currency'] ?? '', 'priceAccent' => '${accent}', 'priceSuffix' => '/ night', 'priceAlign' => 'end', 'priceRateHint' => true])
              @php $stayOther = \\App\\Support\\RoomPrice::other((float) $stayTotal, (string) ($roomType['currency'] ?? ''), (float) ($settings->usdt_etb_rate ?? 0)); @endphp
              <p class="mt-1 text-sm text-slate-600">{{ number_format($stayTotal, 0) }} {{ \\App\\Support\\RoomPrice::currency((string) ($roomType['currency'] ?? '')) }} · {{ $nights }} nights</p>
              @if($stayOther)<p class="text-sm text-slate-600">{{ $stayOther }}</p>@endif
              <span class="mt-3 inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="room_unit_ids[]" value="{{ $unit['id'] }}" /> Select</span>
            </div>
          </label>
          @endforeach
          @include('partials.stay-addons', ['freeBreakfast' => $roomType['freeBreakfast'] ?? false, 'freeCancellation' => $roomType['freeCancellation'] ?? false, 'showCancellation' => false, 'breakfastPerNight' => (float) ($settings->breakfast_price ?? 0), 'cancellationFee' => (float) ($settings->cancellation_fee ?? 0), 'nights' => $nights, 'roomEach' => (float) $stayTotal, 'roomCount' => 1, 'countSelectedRooms' => true, 'currency' => $roomType['currency'] ?? ''])
          <div class="flex justify-end"><button type="submit" class="${skin.button}" style="background-color:${accent}">Reserve</button></div>
        </form>
        @else
        <p class="p-8 text-slate-600 ${skin.card}">No rooms of this type are free for those dates and guests.</p>
        @endif
      @else
      <p class="p-8 text-slate-600 ${skin.card}">Search room to see which rooms of this type are free.</p>
      @endif
    </div>
    ${tail(templateId, accent)}
  </div>
</section>
@endsection
`
}

export function crsBookBlade(accent: string, templateId: string): string {
  const skin = skinOf(templateId, accent)
  return `@extends('layouts.site')
@section('title', 'Payment — ' . $settings->business_name)
@section('content')
@php
  $row = ['type' => $roomType];
  $count = max(1, count($units));
  $roomTotal = round((float) $stayTotal * $count, 2);
@endphp
<section class="${skin.page} py-12">
  <div class="mx-auto max-w-6xl px-6">
    ${stepper(2, templateId)}
    <a href="{{ route('rooms.show', ['slug' => $roomType['slug'], 'check_in' => $checkIn, 'check_out' => $checkOut, 'adults' => $adults, 'children' => $children]) }}" class="text-sm text-slate-500 hover:underline">Back to {{ $roomType['name'] }}</a>
    <h1 class="mt-4 text-3xl ${skin.heading}">Payment</h1>
    @include('partials.stay-policies')
    @if($errors->any())<div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
    <div class="mt-8 grid items-start gap-6 lg:grid-cols-3">
      <aside class="p-6 ${skin.card}">
        <h2 class="text-lg font-semibold">Price breakdown</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Rooms</dt><dd>{{ $count }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Nights</dt><dd>{{ $nights }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Nightly</dt><dd class="text-right">@include('partials.room-price', ['priceBase' => $listNightly ?? ($roomType['basePrice'] ?? 0), 'pricePercent' => $roomType['discountPercent'] ?? 0, 'priceCurrency' => $roomType['currency'] ?? '', 'priceAccent' => '${accent}', 'priceSuffix' => '/ night', 'priceAlign' => 'end', 'priceRateHint' => true])</dd></div>
          <div class="flex justify-between gap-4" data-breakfast-line hidden><dt class="text-slate-500">Breakfast</dt><dd><span data-breakfast-amount>0</span> {{ \\App\\Support\\RoomPrice::currency((string) ($roomType['currency'] ?? '')) }}</dd></div>
          <div class="flex justify-between gap-4 border-t pt-3 text-base"><dt class="font-semibold">Total</dt><dd class="text-right font-bold" style="color:${accent}"><span data-stay-total>{{ number_format($roomTotal, 0) }}</span> {{ \\App\\Support\\RoomPrice::currency((string) ($roomType['currency'] ?? '')) }}<span class="mt-1 block text-xs font-medium text-slate-500" data-other-total></span></dd></div>
        </dl>
      </aside>
      <section class="p-6 ${skin.card}">
        <h2 class="text-lg font-semibold">Your stay</h2>
        @if(!empty($row['type']['photos'][0]))
        <img src="{{ \\App\\Support\\PublicAsset::url($row['type']['photos'][0]) }}" alt="" class="mt-4 aspect-[16/10] w-full object-cover" />
        @else
        <div class="mt-4 aspect-[16/10] w-full bg-slate-100"></div>
        @endif
        <p class="mt-4 text-xl ${skin.heading}">{{ $roomType['name'] }}</p>
        <ul class="mt-3 space-y-2 text-sm">
          @foreach($units as $unit)
          <li class="flex justify-between gap-3"><span>Room {{ $unit['code'] ?? '' }}</span><span class="text-slate-500">{{ !empty($unit['smokingAllowed']) ? 'Smoking allowed' : 'No smoking' }}</span></li>
          @endforeach
        </ul>
        <p class="mt-4 text-sm text-slate-600">{{ $checkIn }} to {{ $checkOut }}</p>
      </section>
      <form method="POST" action="{{ route('book.store') }}" class="space-y-4 p-6 ${skin.card}">
        @csrf
        <input type="hidden" name="room_type_id" value="{{ $roomType['id'] }}" />
        @foreach($units as $unit)<input type="hidden" name="room_unit_ids[]" value="{{ $unit['id'] }}" />@endforeach
        <input type="hidden" name="check_in" value="{{ $checkIn }}" />
        <input type="hidden" name="check_out" value="{{ $checkOut }}" />
        <input type="hidden" name="adults" value="{{ $adults }}" />
        <input type="hidden" name="children" value="{{ $children }}" />
        @foreach($childAges as $age)<input type="hidden" name="child_ages[]" value="{{ $age }}" />@endforeach
        <h2 class="text-lg font-semibold">Guest</h2>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Full name</span><input name="guest_name" required value="{{ old('guest_name') }}" class="${skin.input}" /></label>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Email</span><input type="email" name="guest_email" value="{{ old('guest_email') }}" class="${skin.input}" /></label>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Phone</span><input name="guest_phone" required value="{{ old('guest_phone') }}" class="${skin.input}" /></label>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Special requests</span><textarea name="special_requests" rows="3" class="${skin.input}">{{ old('special_requests') }}</textarea></label>
        @include('partials.stay-addons', ['freeBreakfast' => $roomType['freeBreakfast'] ?? false, 'freeCancellation' => $roomType['freeCancellation'] ?? false, 'breakfastPerNight' => (float) ($settings->breakfast_price ?? 0), 'cancellationFee' => (float) ($settings->cancellation_fee ?? 0), 'nights' => $nights, 'roomEach' => (float) $stayTotal, 'roomCount' => $count, 'currency' => $roomType['currency'] ?? ''])
        <fieldset class="space-y-2">
          <legend class="text-sm font-semibold">Payment method</legend>
          <label class="flex items-start gap-2 text-sm"><input type="radio" name="payment_method" value="chapa" @checked(old('payment_method') === 'chapa') /> <span>Chapa<span class="mt-0.5 block text-xs text-slate-500">Records Chapa. The processor is not connected yet, and the stay is still confirmed.</span></span></label>
          <label class="flex items-start gap-2 text-sm"><input type="radio" name="payment_method" value="sandbox" @checked(old('payment_method', 'sandbox') === 'sandbox') /> <span>Sandbox<span class="mt-0.5 block text-xs text-slate-500">Confirms the stay without a payment processor.</span></span></label>
          <label class="flex items-start gap-2 text-sm"><input type="radio" name="payment_method" value="card" @checked(old('payment_method') === 'card') /> <span>Card<span class="mt-0.5 block text-xs text-slate-500">Card details stay on this website. They are not sent to Buildaura.</span></span></label>
        </fieldset>
        <div data-card-fields class="space-y-3" @if(old('payment_method') !== 'card') hidden @endif>
          <label class="block text-sm"><span class="mb-1 block text-slate-500">Name on card</span><input name="card_holder" value="{{ old('card_holder') }}" class="${skin.input}" /></label>
          <label class="block text-sm"><span class="mb-1 block text-slate-500">Card number</span><input name="card_number" inputmode="numeric" autocomplete="cc-number" value="{{ old('card_number') }}" class="${skin.input}" /></label>
          <div class="grid grid-cols-2 gap-3">
            <label class="block text-sm"><span class="mb-1 block text-slate-500">Expiry</span><input name="card_expiry" placeholder="MM/YY" value="{{ old('card_expiry') }}" class="${skin.input}" /></label>
            <label class="block text-sm"><span class="mb-1 block text-slate-500">CVC</span><input name="card_cvc" value="{{ old('card_cvc') }}" class="${skin.input}" /></label>
          </div>
        </div>
        <button type="submit" class="w-full ${skin.button}" style="background-color:${accent}">Pay</button>
        <script>
          (function () {
            var form = document.currentScript && document.currentScript.closest('form');
            if (!form) return;
            var fields = form.querySelector('[data-card-fields]');
            function sync() {
              var selected = form.querySelector('input[name="payment_method"]:checked');
              var card = selected && selected.value === 'card';
              if (fields) fields.hidden = !card;
              fields && fields.querySelectorAll('input').forEach(function (input) { input.required = !!card; });
            }
            form.querySelectorAll('input[name="payment_method"]').forEach(function (radio) { radio.addEventListener('change', sync); });
            sync();
          })();
        </script>
      </form>
    </div>
  </div>
</section>
@endsection
`
}

export function crsConfirmBlade(accent: string, templateId: string): string {
  const skin = skinOf(templateId, accent)
  return `@extends('layouts.site')
@section('title', 'Reservation confirmed — ' . $settings->business_name)
@section('content')
@php
  $rows = isset($reservations) ? $reservations : collect([$reservation]);
  $reservation = $rows->first();
  $total = $rows->sum(fn ($row) => (float) $row->total_price);
  $confirmOther = \\App\\Support\\RoomPrice::other((float) $total, (string) $reservation->currency, (float) ($settings->usdt_etb_rate ?? 0));
  $breakfastSum = (float) $rows->sum('breakfast_total');
  $breakfastOther = \\App\\Support\\RoomPrice::other($breakfastSum, (string) $reservation->currency, (float) ($settings->usdt_etb_rate ?? 0));
@endphp
<section class="${skin.page} py-16">
  <div class="mx-auto max-w-xl px-6">
    ${stepper(3, templateId)}
    <div class="p-8 text-center ${skin.card}">
      <p class="${skin.eyebrow}">Confirmed</p>
      <h1 class="mt-2 text-3xl ${skin.heading}">Your stay is confirmed</h1>
      <p class="mt-2 text-slate-600">Your contact details stay on this website. The rooms are now held in Buildaura.</p>
      <div class="mt-8 space-y-3 text-left text-sm">
        <div class="flex justify-between gap-4"><span class="text-slate-500">Confirmation</span><span class="font-mono font-bold tracking-wider">{{ $reservation->group_code ?: $reservation->confirmation_code }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Room type</span><span>{{ $reservation->room_type_name }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Rooms</span><span>{{ $rows->pluck('room_code')->filter()->implode(', ') }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Check-in</span><span>{{ $reservation->check_in->format('M j, Y') }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Check-out</span><span>{{ $reservation->check_out->format('M j, Y') }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Guests</span><span>{{ $reservation->adults }} adults{{ $reservation->children ? ' · '.$reservation->children.' children'.((is_array($reservation->child_ages) && count($reservation->child_ages)) ? ' ('.collect($reservation->child_ages)->map(fn ($age) => $age.'y')->implode(', ').')' : '') : '' }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Guest</span><span>{{ $reservation->guest_name }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Phone</span><span>{{ $reservation->guest_phone }}</span></div>
        @if($reservation->guest_email)<div class="flex justify-between gap-4"><span class="text-slate-500">Email</span><span>{{ $reservation->guest_email }}</span></div>@endif
        <div class="flex justify-between gap-4"><span class="text-slate-500">Payment</span><span>{{ $reservation->payment_method === 'chapa' ? 'Chapa' : ($reservation->payment_method === 'card' || $reservation->payment_method === 'fake_card' ? 'Card' : 'Sandbox') }}@if($reservation->payment_last4) ···· {{ $reservation->payment_last4 }}@endif</span></div>
        @if($reservation->breakfast_selected)
        <div class="flex justify-between gap-4"><span class="text-slate-500">Breakfast</span><span>{{ $breakfastSum > 0 ? number_format($breakfastSum, 0).' '.\\App\\Support\\RoomPrice::currency((string) $reservation->currency).($breakfastOther ? ' · '.$breakfastOther : '') : 'Breakfast included' }}</span></div>
        @else
        <div class="flex justify-between gap-4"><span class="text-slate-500">Breakfast</span><span>Breakfast is not included.</span></div>
        @endif
        <div class="flex justify-between gap-4"><span class="text-slate-500">Cancellation</span><span>{{ \\App\\Support\\RoomPrice::cancellationNote((bool) $reservation->free_cancellation, (float) $reservation->cancellation_fee, (string) $reservation->currency) }}</span></div>
        <div class="flex justify-between gap-4 border-t pt-3"><span class="text-slate-500">Total</span><span class="font-bold" style="color:${accent}">{{ number_format($total, 0) }} {{ \\App\\Support\\RoomPrice::currency((string) $reservation->currency) }}@if($confirmOther)<span class="mt-1 block text-xs font-medium text-slate-500">{{ $confirmOther }}</span>@else<span class="mt-1 block text-xs font-normal text-slate-500">Set the USD to ETB rate on Hotel Policy to show this price in ETB and USD.</span>@endif</span></div>
      </div>
      @include('partials.stay-policies')
      <a href="{{ route('home') }}" class="mt-8 inline-block text-sm font-semibold" style="color:${accent}">Back to home</a>
    </div>
  </div>
</section>
@endsection
`
}

export function localRoomsBlade(accent: string, templateId: string): string {
  const skin = skinOf(templateId, accent)
  return `@extends('layouts.site')
@section('title', ($settings->rooms_section_title ?? 'Book') . ' — ' . $settings->business_name)
@section('content')
@php
  $stayQuery = $searched ? ['check_in' => $checkIn, 'check_out' => $checkOut, 'adults' => $adults, 'children' => $children, 'child_ages' => $childAges] : [];
@endphp
<section class="${skin.page} py-12">
  <div class="mx-auto max-w-6xl px-6">
    <p class="${skin.eyebrow}">Book</p>
    <h1 class="mt-2 text-4xl ${skin.heading}">{{ $settings->rooms_section_title ?? 'Rooms & Suites' }}</h1>
    <p class="mt-3 text-lg text-slate-600">{{ $settings->rooms_section_subtitle ?? 'Search dates, then open a room type to see which rooms are free.' }}</p>
    @include('partials.stay-policies')
    <div class="mt-8">
      @include('partials.stay-search', ['searchAction' => route('rooms.index'), 'checkIn' => $checkIn, 'checkOut' => $checkOut, 'adults' => $adults, 'children' => $children, 'childAges' => $childAges, 'minDate' => $minDate, 'submitLabel' => 'Search', 'searchClass' => '${skin.search}'])
    </div>
    @if($errors->any())<div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
    <div class="mt-8 space-y-5">
      @forelse($cards as $card)
      @php
        $type = $card['type'];
        $amenities = is_array($type->amenities) ? $type->amenities : array_filter(array_map('trim', explode(',', (string) $type->amenities)));
      @endphp
      <article class="${skin.tile}">
        <div class="grid md:grid-cols-[280px_1fr]">
          @if($type->cover)
          <a href="{{ route('rooms.show', array_merge(['slug' => $type->slug], $stayQuery)) }}" class="block min-h-56">
            <img src="{{ \\App\\Support\\PublicAsset::url($type->cover) }}" alt="{{ $type->name }}" class="h-full w-full object-cover md:min-h-full" />
          </a>
          @else
          <div class="min-h-56 bg-slate-100"></div>
          @endif
          <div class="flex flex-col p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl ${skin.heading}"><a href="{{ route('rooms.show', array_merge(['slug' => $type->slug], $stayQuery)) }}" class="hover:underline">{{ $type->name }}</a></h2>
                <p class="mt-1 text-sm text-slate-500">{{ (int) $type->max_adults }} adults · {{ (int) $type->max_children }} children</p>
              </div>
              <div class="text-right">@include('partials.room-price', ['priceBase' => $type->base_price, 'pricePercent' => $type->discount_percent, 'priceCurrency' => $type->currency, 'priceAccent' => '${accent}', 'priceSuffix' => '/ night'])</div>
            </div>
            <p class="mt-3 text-sm font-semibold {{ $type->free_cancellation ? 'text-emerald-700' : 'text-slate-500' }}">{{ \\App\\Support\\RoomPrice::cancellationNote((bool) $type->free_cancellation, (float) ($settings->cancellation_fee ?? 0), (string) $type->currency) }}</p>
            ${breakfastStatus('$type->free_breakfast', '(string) $type->currency', false)}
            @if($type->description)<p class="mt-4 leading-relaxed text-slate-600">{{ $type->description }}</p>@endif
            <div class="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
              @if($type->bed_configuration)<span class="rounded-full bg-white px-3 py-1 text-slate-900">{{ $type->bed_configuration }}</span>@endif
              @if($type->size_sqm)<span class="rounded-full bg-white px-3 py-1 text-slate-900">{{ $type->size_sqm }} m²</span>@endif
              @foreach(array_slice($amenities, 0, 8) as $amenity)<span class="rounded-full bg-white px-3 py-1 text-slate-900">{{ $amenity }}</span>@endforeach
            </div>
            <div class="mt-4">@include('partials.stay-policies', ['compact' => true])</div>
            <div class="mt-5 flex justify-end">
              <a href="{{ route('rooms.show', array_merge(['slug' => $type->slug], $stayQuery)) }}" class="${skin.button}" style="background-color:${accent}">See availability</a>
            </div>
          </div>
        </div>
      </article>
      @empty
      <p class="p-10 text-center text-slate-600 ${skin.card}">{{ $searched ? 'No rooms are available for those dates and guests. Try different dates or fewer people.' : 'Rooms appear here once this site can reach BuildAura.' }}</p>
      @endforelse
    </div>
  </div>
</section>
@endsection
`
}

export function localRoomDetailBlade(accent: string, templateId: string): string {
  const skin = skinOf(templateId, accent)
  return `@extends('layouts.site')
@section('title', $roomType->name . ' — ' . $settings->business_name)
@section('content')
@php
  $amenities = is_array($roomType->amenities) ? $roomType->amenities : array_filter(array_map('trim', explode(',', (string) $roomType->amenities)));
  $photos = array_values(array_filter($roomType->photos ?? []));
  $stayQuery = $searched ? ['check_in' => $checkIn, 'check_out' => $checkOut, 'adults' => $adults, 'children' => $children, 'child_ages' => $childAges] : [];
@endphp
<section class="${skin.page} py-12">
  <div class="mx-auto max-w-6xl px-6">
    ${stepper(1, templateId)}
    <a href="{{ route('rooms.index', $stayQuery) }}" class="text-sm text-slate-500 hover:underline">Back to Book</a>
    <div class="mt-6 grid items-start gap-10 lg:grid-cols-2">
      <div>
        @if($roomType->cover)
        <img src="{{ \\App\\Support\\PublicAsset::url($roomType->cover) }}" alt="{{ $roomType->name }}" class="aspect-[16/9] w-full object-cover ${skin.card}" />
        @else
        <div class="aspect-[16/9] w-full bg-slate-100 ${skin.card}"></div>
        @endif
        @if(count($photos) > 1)
        <div class="mt-3 flex gap-2 overflow-x-auto">
          @foreach($photos as $photo)
          <img src="{{ \\App\\Support\\PublicAsset::url($photo) }}" alt="" class="h-16 w-24 object-cover ${skin.card}" />
          @endforeach
        </div>
        @endif
      </div>
      <div>
        <p class="${skin.eyebrow}">Room type</p>
        <h1 class="mt-2 text-4xl ${skin.heading}">{{ $roomType->name }}</h1>
        <p class="mt-2 text-slate-500">{{ (int) $roomType->max_adults }} adults · {{ (int) $roomType->max_children }} children</p>
        @include('partials.room-price', ['priceBase' => $offer ? $offer['listNightly'] : $roomType->base_price, 'pricePercent' => $roomType->discount_percent, 'priceCurrency' => $roomType->currency, 'priceAccent' => '${accent}', 'priceSuffix' => '/ night', 'priceRateHint' => true])
        <p class="mt-3 text-sm font-medium {{ $roomType->free_cancellation ? 'text-emerald-700' : 'text-slate-500' }}">{{ \\App\\Support\\RoomPrice::cancellationNote((bool) $roomType->free_cancellation, (float) ($settings->cancellation_fee ?? 0), (string) $roomType->currency) }}</p>
        ${breakfastStatus('$roomType->free_breakfast', '(string) $roomType->currency', true)}
        @if($roomType->description)<p class="mt-5 leading-relaxed text-slate-700">{{ $roomType->description }}</p>@endif
        <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt class="text-slate-600">Sleeps</dt><dd class="font-medium">{{ $roomType->max_adults }} adults · {{ $roomType->max_children }} children</dd></div>
          @if($roomType->bed_configuration)<div><dt class="text-slate-600">Beds</dt><dd class="font-medium">{{ $roomType->bed_configuration }}</dd></div>@endif
          @if($roomType->size_sqm)<div><dt class="text-slate-600">Size</dt><dd class="font-medium">{{ $roomType->size_sqm }} m²</dd></div>@endif
        </dl>
      </div>
    </div>
    <section class="mt-12 grid items-center gap-8 lg:grid-cols-2">
      <div>
        <h2 class="text-2xl ${skin.heading}">About the property</h2>
        <p class="mt-4 leading-relaxed text-slate-700">{{ $settings->about }}</p>
      </div>
      @if($settings->about_image)
      <img src="{{ \\App\\Support\\PublicAsset::url($settings->about_image) }}" alt="" class="aspect-[4/3] w-full object-cover ${skin.card}" />
      @else
      <div class="aspect-[4/3] w-full bg-slate-100 ${skin.card}"></div>
      @endif
    </section>
    <section class="mt-12">
      <h2 class="text-2xl ${skin.heading}">Amenities</h2>
      <ul class="mt-4 flex flex-wrap gap-2">@foreach($amenities as $amenity)<li class="rounded-full border bg-white px-3 py-1 text-slate-900 text-sm">{{ $amenity }}</li>@endforeach</ul>
    </section>
    <section class="mt-12">
      <h2 class="text-2xl ${skin.heading}">Find a room</h2>
      @include('partials.stay-search', ['searchAction' => route('rooms.show', $roomType->slug), 'checkIn' => $checkIn, 'checkOut' => $checkOut, 'adults' => $adults, 'children' => $children, 'childAges' => $childAges, 'minDate' => $minDate, 'submitLabel' => 'Search room', 'searchClass' => '${skin.search}'])
    </section>
    @include('partials.stay-policies')
    @if($errors->any())<div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
    <div class="mt-8">
      @if($searched)
        @if($offer)
        <form method="GET" action="{{ route('book') }}" class="space-y-4">
          <input type="hidden" name="room_type_id" value="{{ $roomType->id }}" />
          <input type="hidden" name="check_in" value="{{ $checkIn }}" />
          <input type="hidden" name="check_out" value="{{ $checkOut }}" />
          <input type="hidden" name="adults" value="{{ $adults }}" />
          <input type="hidden" name="children" value="{{ $children }}" />
          @foreach($childAges as $age)<input type="hidden" name="child_ages[]" value="{{ $age }}" />@endforeach
          @foreach($offer['units'] as $unit)
          <label class="relative grid cursor-pointer items-center gap-4 p-4 md:grid-cols-[180px_1fr_auto] ${skin.card}">
            <span class="${skin.badge}">{{ $unit['code'] ?? '' }}</span>
            @if($roomType->cover)
            <img src="{{ \\App\\Support\\PublicAsset::url($roomType->cover) }}" alt="" class="h-28 w-full object-cover" />
            @else
            <div class="h-28 w-full bg-slate-100"></div>
            @endif
            <span>
              <span class="block font-semibold">{{ (int) $roomType->max_adults }} adults · {{ (int) $roomType->max_children }} children</span>
              <span class="mt-2 block text-sm text-slate-600">{{ !empty($unit['smokingAllowed']) ? 'Smoking allowed' : 'No smoking' }}</span>
            </span>
            <div class="text-right">
              @include('partials.room-price', ['priceBase' => $offer['listNightly'], 'pricePercent' => $roomType->discount_percent, 'priceCurrency' => $roomType->currency, 'priceAccent' => '${accent}', 'priceSuffix' => '/ night', 'priceAlign' => 'end', 'priceRateHint' => true])
              @php $stayOther = \\App\\Support\\RoomPrice::other((float) $offer['total'], (string) $roomType->currency, (float) ($settings->usdt_etb_rate ?? 0)); @endphp
              <p class="mt-1 text-sm text-slate-600">{{ number_format($offer['total'], 0) }} {{ \\App\\Support\\RoomPrice::currency((string) $roomType->currency) }} · {{ $offer['nights'] }} nights</p>
              @if($stayOther)<p class="text-sm text-slate-600">{{ $stayOther }}</p>@endif
              <span class="mt-3 inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="room_unit_ids[]" value="{{ $unit['id'] ?? '' }}" /> Select</span>
            </div>
          </label>
          @endforeach
          @include('partials.stay-addons', ['freeBreakfast' => $roomType->free_breakfast, 'freeCancellation' => $roomType->free_cancellation, 'showCancellation' => false, 'breakfastPerNight' => (float) ($settings->breakfast_price ?? 0), 'cancellationFee' => (float) ($settings->cancellation_fee ?? 0), 'nights' => $offer['nights'], 'roomEach' => (float) $offer['total'], 'roomCount' => 1, 'countSelectedRooms' => true, 'currency' => $roomType->currency])
          <div class="flex justify-end"><button type="submit" class="${skin.button}" style="background-color:${accent}">Reserve</button></div>
        </form>
        @else
        <p class="p-8 text-slate-600 ${skin.card}">No rooms of this type are free for those dates and guests.</p>
        @endif
      @else
      <p class="p-8 text-slate-600 ${skin.card}">Search room to see which rooms of this type are free.</p>
      @endif
    </div>
    ${tail(templateId, accent)}
  </div>
</section>
@endsection
`
}

export function localBookBlade(accent: string, templateId: string): string {
  const skin = skinOf(templateId, accent)
  return `@extends('layouts.site')
@section('title', 'Payment — ' . $settings->business_name)
@section('content')
@php $count = max(1, count($units)); $roomTotal = round((float) $offer['total'] * $count, 2); @endphp
<section class="${skin.page} py-12">
  <div class="mx-auto max-w-6xl px-6">
    ${stepper(2, templateId)}
    <a href="{{ route('rooms.show', array_merge(['slug' => $roomType->slug, 'check_in' => $checkIn, 'check_out' => $checkOut, 'adults' => $adults, 'children' => $children], $children > 0 ? ['child_ages' => $childAges] : [])) }}" class="text-sm text-slate-500 hover:underline">Back to {{ $roomType->name }}</a>
    <h1 class="mt-4 text-3xl ${skin.heading}">Payment</h1>
    <p class="mt-2 text-slate-600">Guest and card details stay on this website.</p>
    @include('partials.stay-policies')
    @if($errors->any())<div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
    <div class="mt-8 grid items-start gap-6 lg:grid-cols-3">
      <aside class="p-6 ${skin.card}">
        <h2 class="text-lg font-semibold">Price breakdown</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Rooms</dt><dd>{{ $count }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Nights</dt><dd>{{ $offer['nights'] }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Nightly</dt><dd class="text-right">@include('partials.room-price', ['priceBase' => $offer['listNightly'], 'pricePercent' => $roomType->discount_percent, 'priceCurrency' => $roomType->currency, 'priceAccent' => '${accent}', 'priceSuffix' => '/ night', 'priceAlign' => 'end', 'priceRateHint' => true])</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Guests</dt><dd>{{ $adults }} adults · {{ $children }} children</dd></div>
          <div class="flex justify-between gap-4" data-breakfast-line hidden><dt class="text-slate-500">Breakfast</dt><dd><span data-breakfast-amount>0</span> {{ \\App\\Support\\RoomPrice::currency((string) $roomType->currency) }}</dd></div>
          <div class="flex justify-between gap-4 border-t pt-3 text-base"><dt class="font-semibold">Total</dt><dd class="text-right font-bold" style="color:${accent}"><span data-stay-total>{{ number_format($roomTotal, 0) }}</span> {{ \\App\\Support\\RoomPrice::currency((string) $roomType->currency) }}<span class="mt-1 block text-xs font-medium text-slate-500" data-other-total></span></dd></div>
        </dl>
      </aside>
      <section class="p-6 ${skin.card}">
        <h2 class="text-lg font-semibold">Your stay</h2>
        @if($roomType->cover)<img src="{{ \\App\\Support\\PublicAsset::url($roomType->cover) }}" alt="" class="mt-4 aspect-[16/10] w-full object-cover" />@else<div class="mt-4 aspect-[16/10] w-full bg-slate-100"></div>@endif
        <p class="mt-4 text-xl ${skin.heading}">{{ $roomType->name }}</p>
        <ul class="mt-3 space-y-2 text-sm">
          @foreach($units as $unit)
          <li class="flex justify-between gap-3"><span>Room {{ $unit['code'] ?? '' }}</span><span class="text-slate-500">{{ !empty($unit['smokingAllowed']) ? 'Smoking allowed' : 'No smoking' }}</span></li>
          @endforeach
        </ul>
      </section>
      <form method="POST" action="{{ route('book.store') }}" class="space-y-4 p-6 ${skin.card}">
        @csrf
        <input type="hidden" name="room_type_id" value="{{ $roomType->id }}" />
        @foreach($units as $unit)<input type="hidden" name="room_unit_ids[]" value="{{ $unit['id'] ?? '' }}" />@endforeach
        <input type="hidden" name="check_in" value="{{ $checkIn }}" />
        <input type="hidden" name="check_out" value="{{ $checkOut }}" />
        <input type="hidden" name="adults" value="{{ $adults }}" />
        <input type="hidden" name="children" value="{{ $children }}" />
        @foreach($childAges as $age)<input type="hidden" name="child_ages[]" value="{{ $age }}" />@endforeach
        <h2 class="text-lg font-semibold">Guest</h2>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Full name</span><input name="guest_name" required value="{{ old('guest_name') }}" class="${skin.input}" /></label>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Email</span><input type="email" name="guest_email" required value="{{ old('guest_email') }}" class="${skin.input}" /></label>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Phone</span><input name="guest_phone" value="{{ old('guest_phone') }}" class="${skin.input}" /></label>
        <label class="block text-sm"><span class="mb-1 block text-slate-500">Special requests</span><textarea name="special_requests" rows="3" class="${skin.input}">{{ old('special_requests') }}</textarea></label>
        @include('partials.stay-addons', ['freeBreakfast' => $roomType->free_breakfast, 'freeCancellation' => $roomType->free_cancellation, 'breakfastPerNight' => (float) ($settings->breakfast_price ?? 0), 'cancellationFee' => (float) ($settings->cancellation_fee ?? 0), 'nights' => $offer['nights'], 'roomEach' => (float) $offer['total'], 'roomCount' => $count, 'currency' => $roomType->currency])
        <h2 class="pt-2 text-lg font-semibold">Payment</h2>
        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-slate-700">How will you pay?</legend>
          <label class="flex items-start gap-2 text-sm"><input type="radio" name="payment_method" value="chapa" @checked(old('payment_method') === 'chapa') /> Chapa</label>
          <label class="flex items-start gap-2 text-sm"><input type="radio" name="payment_method" value="sandbox" @checked(old('payment_method', 'sandbox') !== 'card' && old('payment_method') !== 'arrival' && old('payment_method') !== 'chapa') /> Sandbox</label>
          <label class="flex items-start gap-2 text-sm"><input type="radio" name="payment_method" value="card" @checked(old('payment_method') === 'card') /> Card</label>
          @if($settings->pay_on_arrival)
          <label class="flex items-start gap-2 text-sm"><input type="radio" name="payment_method" value="arrival" @checked(old('payment_method') === 'arrival') /> Pay on arrival</label>
          @endif
        </fieldset>
        <div data-card-fields class="space-y-4" @if(old('payment_method') !== 'card') hidden @endif>
          <p class="text-xs text-slate-500">Card details are stored on this website only. They are not sent to BuildAura.</p>
          <label class="block text-sm"><span class="mb-1 block text-slate-500">Name on card</span><input name="card_holder" value="{{ old('card_holder') }}" class="${skin.input}" /></label>
          <label class="block text-sm"><span class="mb-1 block text-slate-500">Card number</span><input name="card_number" required inputmode="numeric" autocomplete="cc-number" value="{{ old('card_number') }}" class="${skin.input}" /></label>
          <div class="grid grid-cols-2 gap-3">
            <label class="block text-sm"><span class="mb-1 block text-slate-500">Expiry</span><input name="card_expiry" placeholder="MM/YY" value="{{ old('card_expiry') }}" class="${skin.input}" /></label>
            <label class="block text-sm"><span class="mb-1 block text-slate-500">CVC</span><input name="card_cvc" value="{{ old('card_cvc') }}" class="${skin.input}" /></label>
          </div>
        </div>
        <button type="submit" class="w-full ${skin.button}" style="background-color:${accent}">Pay</button>
        <script>
          (function () {
            var form = document.currentScript && document.currentScript.closest('form');
            if (!form) return;
            var fields = form.querySelector('[data-card-fields]');
            function sync() {
              var selected = form.querySelector('input[name="payment_method"]:checked');
              var card = selected && selected.value === 'card';
              if (fields) fields.hidden = !card;
            }
            form.querySelectorAll('input[name="payment_method"]').forEach(function (radio) { radio.addEventListener('change', sync); });
            sync();
          })();
        </script>
      </form>
    </div>
  </div>
</section>
@endsection
`
}

export function localConfirmBlade(accent: string, templateId: string): string {
  const skin = skinOf(templateId, accent)
  return `@extends('layouts.site')
@section('title', 'Booking confirmed — ' . $settings->business_name)
@section('content')
@php
  $rows = isset($reservations) ? $reservations : collect([$reservation]);
  $reservation = $rows->first();
  $total = $rows->sum(fn ($row) => (float) $row->total_price);
  $confirmOther = \\App\\Support\\RoomPrice::other((float) $total, (string) $reservation->currency, (float) ($settings->usdt_etb_rate ?? 0));
  $breakfastSum = (float) $rows->sum('breakfast_total');
  $breakfastOther = \\App\\Support\\RoomPrice::other($breakfastSum, (string) $reservation->currency, (float) ($settings->usdt_etb_rate ?? 0));
@endphp
<section class="${skin.page} py-16">
  <div class="mx-auto max-w-xl px-6">
    ${stepper(3, templateId)}
    <div class="p-8 ${skin.card}">
      <p class="${skin.eyebrow}">Confirmed</p>
      <h1 class="mt-2 text-3xl ${skin.heading}">Your stay is confirmed</h1>
      <p class="mt-2 text-slate-600">Guest and payment details were saved on this website only.</p>
      <div class="mt-8 space-y-3 text-sm">
        <div class="flex justify-between gap-4"><span class="text-slate-500">Confirmation</span><span class="font-mono font-bold">{{ $reservation->group_code ?: $reservation->confirmation_code }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Room</span><span class="font-medium">{{ $reservation->room_type_name }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Rooms</span><span>{{ $rows->pluck('room_unit_code')->filter()->implode(', ') }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Stay</span><span>{{ $reservation->check_in->format('M j, Y') }} – {{ $reservation->check_out->format('M j, Y') }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Guests</span><span>{{ $reservation->adults }} adults{{ $reservation->children ? ' · '.$reservation->children.' children'.((is_array($reservation->child_ages) && count($reservation->child_ages)) ? ' ('.collect($reservation->child_ages)->map(fn ($age) => $age.'y')->implode(', ').')' : '') : '' }}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">Guest</span><span>{{ $reservation->guest_name }}</span></div>
        @if($reservation->payment_method === 'pay_on_arrival')
        <div class="flex justify-between gap-4"><span class="text-slate-500">Payment</span><span>Pay on arrival</span></div>
        @elseif($reservation->payment_method === 'chapa')
        <div class="flex justify-between gap-4"><span class="text-slate-500">Payment</span><span>Chapa</span></div>
        @elseif($reservation->payment_method === 'sandbox')
        <div class="flex justify-between gap-4"><span class="text-slate-500">Payment</span><span>Sandbox</span></div>
        @else
        <div class="flex justify-between gap-4"><span class="text-slate-500">Card</span><span>···· {{ $reservation->payment_last4 }}</span></div>
        @endif
        @if($reservation->breakfast_selected)
        <div class="flex justify-between gap-4"><span class="text-slate-500">Breakfast</span><span>{{ $breakfastSum > 0 ? number_format($breakfastSum, 0).' '.\\App\\Support\\RoomPrice::currency((string) $reservation->currency).($breakfastOther ? ' · '.$breakfastOther : '') : 'Breakfast included' }}</span></div>
        @else
        <div class="flex justify-between gap-4"><span class="text-slate-500">Breakfast</span><span>Breakfast is not included.</span></div>
        @endif
        <div class="flex justify-between gap-4"><span class="text-slate-500">Cancellation</span><span>{{ \\App\\Support\\RoomPrice::cancellationNote((bool) $reservation->free_cancellation, (float) $reservation->cancellation_fee, (string) $reservation->currency) }}</span></div>
        <div class="flex justify-between gap-4 border-t pt-3"><span class="text-slate-500">Total</span><span class="font-bold" style="color:${accent}">{{ number_format($total, 0) }} {{ \\App\\Support\\RoomPrice::currency((string) $reservation->currency) }}@if($confirmOther)<span class="mt-1 block text-xs font-medium text-slate-500">{{ $confirmOther }}</span>@else<span class="mt-1 block text-xs font-normal text-slate-500">Set the USD to ETB rate on Hotel Policy to show this price in ETB and USD.</span>@endif</span></div>
      </div>
      @include('partials.stay-policies')
      <a href="{{ route('home') }}" class="mt-8 inline-block text-sm font-semibold" style="color:${accent}">Back to the hotel</a>
    </div>
  </div>
</section>
@endsection
`
}
