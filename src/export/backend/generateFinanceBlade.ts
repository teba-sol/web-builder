import type { SiteExportPayload } from './exportPayload'

const FINANCE_HOME_IDS = new Set(['taxfighters', 'aureum', 'flux', 'axiom', 'helix'])

export function isCustomFinanceHome(templateId: string): boolean {
  return FINANCE_HOME_IDS.has(templateId)
}

export function generateFinanceHomeBlade(payload: SiteExportPayload): string | null {
  switch (payload.templateId) {
    case 'taxfighters':
      return taxfightersHome()
    case 'aureum':
      return aureumHome()
    case 'flux':
      return fluxHome()
    case 'axiom':
      return axiomHome()
    case 'helix':
      return helixHome()
    default:
      return null
  }
}

function taxfightersHome(): string {
  return `@extends('layouts.site')
@section('content')
@include('partials.hero')

@if(($settings->section_visibility['steps'] ?? false) && $steps->isNotEmpty())
<section class="w-full bg-[#6b1f34] text-white py-24 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-20">
      <h2 class="text-6xl md:text-7xl font-bold tracking-tight mb-4">{{ $settings->steps_section_title }}</h2>
      <div class="flex justify-center"><div class="w-20 h-1 bg-white"></div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      <div class="space-y-12">
        @foreach($steps->take(3) as $step)
        <div class="border-l-4 border-white pl-6">
          <h3 class="text-2xl font-bold mb-3 tracking-wide">{{ $loop->iteration < 3 ? 'Step '.$loop->iteration : $step->title }}</h3>
          <p class="text-lg leading-relaxed text-white/90">{{ $step->description }}</p>
        </div>
        @endforeach
      </div>
      @if($galleryImages->isNotEmpty())
      <div class="w-full h-96 rounded-lg overflow-hidden shadow-2xl"><img src="{{ \\App\\Support\\PublicAsset::url($galleryImages->first()->path) }}" class="w-full h-full object-cover" alt="" /></div>
      @endif
    </div>
    @if($steps->count() > 3)
    @php $last = $steps->slice(3, 1)->first(); @endphp
    <div class="h-px bg-white/20 my-16"></div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div><h2 class="text-5xl md:text-6xl font-bold mb-8 tracking-tight">{{ $last->title }}</h2><p class="text-lg leading-relaxed text-white/90">{{ $last->description }}</p></div>
    </div>
    @endif
    <div class="flex justify-center mt-20"><a href="{{ route('services') }}" class="border-2 border-white px-10 py-4 text-lg font-bold tracking-wide uppercase hover:bg-white hover:text-[#6b1f34]">Learn More</a></div>
  </div>
</section>
@endif

@if(($settings->page_visibility['services'] ?? false) && $services->isNotEmpty())
<section class="py-20 px-4" style="background-color:#f9f9f9">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{{ $settings->services_section_title }}</h2>
      <p class="text-xl text-gray-600">{{ $settings->services_section_subtitle }}</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      @foreach($services->take(3) as $service)
      <a href="{{ route('services') }}" class="bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
        <div class="w-12 h-12 rounded-lg mb-4" style="background-color:#800020"></div>
        <h3 class="text-2xl font-bold mb-4">{{ $service->title }}</h3>
        <p class="text-gray-600 leading-relaxed">{{ $service->description }}</p>
      </a>
      @endforeach
    </div>
  </div>
</section>
@endif

@if($settings->page_visibility['about'] ?? false)
<section class="w-full bg-white">
  <div class="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div class="space-y-8">
      <p class="text-4xl lg:text-5xl font-bold leading-tight" style="color:#800020">{{ $settings->about_title }}</p>
      <p class="text-lg leading-relaxed" style="color:#800020">{{ $settings->about }}</p>
      <a href="{{ route('contact') }}" class="inline-block px-8 py-3 rounded-lg font-semibold text-white" style="background-color:#800020">Book Now<br><span class="text-sm font-medium">Receive 20% Off</span></a>
    </div>
    @if($settings->about_image)<div class="rounded-xl overflow-hidden shadow-lg"><img src="{{ \\App\\Support\\PublicAsset::url($settings->about_image) }}" class="w-full h-[550px] object-cover" alt="" /></div>@endif
  </div>
</section>
@endif

@include('partials.testimonials')

<section class="py-20 px-4" style="background-color:#800020">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-4xl sm:text-5xl font-bold text-white mb-6">{{ $settings->cta_banner_title }}</h2>
    <p class="text-xl text-gray-100 mb-8">{{ $settings->cta_banner_text }}</p>
    <a href="{{ route('contact') }}" class="inline-block bg-white text-[#800020] px-10 py-4 rounded-lg font-semibold text-lg shadow-lg">Contact Us</a>
  </div>
</section>
@endsection`
}

function aureumHome(): string {
  return `@extends('layouts.site')
@section('content')
@include('partials.hero')

@if(($settings->page_visibility['services'] ?? false) && $services->isNotEmpty())
<section class="px-6 pt-24 pb-8 bg-[#f4efe6]">
  <div class="max-w-7xl mx-auto">
    <p class="mb-3 text-xs font-semibold tracking-[0.28em] uppercase text-[#b8956a]">What we do</p>
    <h2 class="font-serif text-4xl md:text-5xl">{{ $settings->services_section_title }}</h2>
    <p class="mt-4 text-lg text-[#5c5148] max-w-2xl">{{ $settings->services_section_subtitle }}</p>
    <div class="mt-14 grid md:grid-cols-3 gap-6">
      @foreach($services->take(3) as $service)
      <a href="{{ route('services') }}" class="bg-white rounded-[1.5rem] overflow-hidden shadow-sm ring-1 ring-[#eadfce]">
        @if($galleryImages[$loop->index] ?? false)<img src="{{ \\App\\Support\\PublicAsset::url($galleryImages[$loop->index]->path) }}" class="h-48 w-full object-cover" alt="" />@endif
        <div class="p-8">
          <p class="font-serif text-4xl text-[#b8956a] mb-4">0{{ $loop->iteration }}</p>
          <h3 class="font-serif text-2xl">{{ $service->title }}</h3>
          <p class="mt-3 text-[#5c5148] leading-relaxed">{{ $service->description }}</p>
        </div>
      </a>
      @endforeach
    </div>
  </div>
</section>
@endif

@if(($settings->section_visibility['steps'] ?? false) && $steps->isNotEmpty())
<section class="px-6 py-24 bg-[#f4efe6]">
  <div class="max-w-7xl mx-auto rounded-[2rem] bg-[#2a211c] text-white px-6 md:px-14 py-16">
    <p class="text-xs font-semibold tracking-[0.28em] uppercase text-[#b8956a] mb-3">The engagement</p>
    <h2 class="font-serif text-4xl md:text-5xl mb-14">{{ $settings->steps_section_title }}</h2>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
      @foreach($steps as $step)
      <div>
        <p class="font-serif text-3xl text-[#b8956a]">{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }}</p>
        <h3 class="mt-4 font-serif text-xl">{{ $step->title }}</h3>
        <p class="mt-3 text-sm text-white/70 leading-relaxed">{{ $step->description }}</p>
      </div>
      @endforeach
    </div>
  </div>
</section>
@endif

@if($settings->page_visibility['about'] ?? false)
<section class="px-6 pb-8 bg-[#f4efe6]">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
    <div>
      <h2 class="font-serif text-4xl md:text-5xl">{{ $settings->about_title }}</h2>
      <p class="mt-6 text-lg text-[#5c5148] leading-relaxed">{{ $settings->about }}</p>
    </div>
    @if($settings->about_image)<img src="{{ \\App\\Support\\PublicAsset::url($settings->about_image) }}" class="h-[460px] w-full object-cover rounded-[1.75rem]" alt="" />@endif
  </div>
</section>
@endif

@include('partials.testimonials')

<section class="px-6 pb-24 bg-[#f4efe6]">
  <div class="max-w-7xl mx-auto rounded-[2rem] px-8 md:px-14 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8" style="background-color:#7a2e38">
    <div class="text-white max-w-xl">
      <h2 class="font-serif text-4xl md:text-5xl">{{ $settings->cta_banner_title }}</h2>
      <p class="mt-4 text-white/80">{{ $settings->cta_banner_text }}</p>
    </div>
    <a href="{{ route('contact') }}" class="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#7a2e38]">{{ $settings->cta_text }}</a>
  </div>
</section>
@endsection`
}

function fluxHome(): string {
  return `@extends('layouts.site')
@section('content')
@include('partials.hero')

@if(($settings->page_visibility['services'] ?? false) && $services->isNotEmpty())
<section class="px-6 py-24 bg-[#070708] text-white">
  <div class="max-w-7xl mx-auto">
    <p class="text-xs font-black tracking-[0.24em] uppercase text-[#ff2d6a] mb-2">The menu</p>
    <h2 class="text-4xl md:text-5xl font-black tracking-tight">{{ $settings->services_section_title }}</h2>
    <div class="mt-10 grid lg:grid-cols-5 gap-4">
      @php $lead = $services->first(); $rest = $services->slice(1)->take(2); @endphp
      <a href="{{ route('services') }}" class="relative overflow-hidden rounded-[1.75rem] lg:col-span-3 min-h-[320px] bg-[#c8ff3d] text-black">
        <div class="relative p-8 flex flex-col justify-end h-full">
          <p class="text-xs font-black tracking-[0.2em] uppercase">01</p>
          <h3 class="mt-3 text-3xl md:text-4xl font-black">{{ $lead->title }}</h3>
          <p class="mt-3 max-w-md text-sm font-medium text-black/70">{{ $lead->description }}</p>
        </div>
      </a>
      <div class="lg:col-span-2 grid gap-4">
        @foreach($rest as $service)
        <a href="{{ route('services') }}" class="rounded-[1.75rem] border border-white/10 bg-white/5 p-7">
          <p class="text-xs font-black tracking-[0.2em] uppercase text-[#c8ff3d]">0{{ $loop->iteration + 1 }}</p>
          <h3 class="mt-3 text-2xl font-black">{{ $service->title }}</h3>
          <p class="mt-2 text-sm text-white/55">{{ $service->description }}</p>
        </a>
        @endforeach
      </div>
    </div>
  </div>
</section>
@endif

@if(($settings->section_visibility['steps'] ?? false) && $steps->isNotEmpty())
<section class="px-6 pb-8 bg-[#070708]">
  <div class="max-w-7xl mx-auto rounded-[2rem] bg-[#c8ff3d] text-black px-6 md:px-12 py-16">
    <h2 class="text-4xl md:text-6xl font-black tracking-tight">{{ $settings->steps_section_title }}</h2>
    <div class="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      @foreach($steps as $step)
      <div class="border-t-4 border-black pt-5">
        <p class="text-5xl font-black">{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }}</p>
        <h3 class="mt-4 text-xl font-black">{{ $step->title }}</h3>
        <p class="mt-2 text-sm font-medium text-black/70">{{ $step->description }}</p>
      </div>
      @endforeach
    </div>
  </div>
</section>
@endif

@if($settings->page_visibility['about'] ?? false)
<section class="px-6 py-24 bg-[#070708] text-white">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <p class="text-xs font-black tracking-[0.24em] uppercase text-[#ff2d6a] mb-3">Why Flux</p>
      <h2 class="text-4xl md:text-5xl font-black tracking-tight">{{ $settings->about_title }}</h2>
      <p class="mt-6 text-lg text-white/60 leading-relaxed">{{ $settings->about }}</p>
    </div>
    @if($settings->about_image)<img src="{{ \\App\\Support\\PublicAsset::url($settings->about_image) }}" class="h-[420px] w-full object-cover rounded-[1.75rem]" alt="" />@endif
  </div>
</section>
@endif

@include('partials.testimonials')

<section class="px-6 py-24 bg-[#070708]">
  <div class="max-w-7xl mx-auto rounded-[2rem] px-8 md:px-14 py-16" style="background-color:#ff2d6a">
    <h2 class="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl">{{ $settings->cta_banner_title }}</h2>
    <p class="mt-4 text-lg text-white/85 max-w-xl">{{ $settings->cta_banner_text }}</p>
    <a href="{{ route('contact') }}" class="inline-block mt-8 rounded-full bg-black px-8 py-3.5 text-sm font-black text-[#c8ff3d]">{{ $settings->cta_text }}</a>
  </div>
</section>
@endsection`
}

function axiomHome(): string {
  return `@extends('layouts.site')
@section('content')
@include('partials.hero')

@if(($settings->page_visibility['services'] ?? false) && $services->isNotEmpty())
<section class="px-6 py-24 bg-white text-[#0a1628]">
  <div class="max-w-7xl mx-auto">
    <p class="text-xs font-bold tracking-[0.28em] uppercase text-[#c41e3a]">Practice</p>
    <h2 class="mt-3 font-serif text-4xl md:text-5xl">{{ $settings->services_section_title }}</h2>
    <div class="mt-12 divide-y divide-[#0a1628]/10 border-y border-[#0a1628]/10">
      @foreach($services->take(4) as $service)
      <a href="{{ route('services') }}" class="grid md:grid-cols-12 gap-4 py-8 items-center">
        <p class="font-serif text-3xl text-[#c41e3a] md:col-span-2">{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }}</p>
        <h3 class="font-serif text-2xl md:col-span-4">{{ $service->title }}</h3>
        <p class="text-[#3d4a5c] md:col-span-6">{{ $service->description }}</p>
      </a>
      @endforeach
    </div>
  </div>
</section>
@endif

@if(($settings->section_visibility['steps'] ?? false) && $steps->isNotEmpty())
<section class="px-6 pb-8 bg-white">
  <div class="max-w-7xl mx-auto bg-[#0a1628] text-white px-8 md:px-14 py-16">
    <h2 class="font-serif text-4xl md:text-5xl">{{ $settings->steps_section_title }}</h2>
    <div class="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
      @foreach($steps as $step)
      <div>
        <p class="text-xs font-bold tracking-[0.24em] uppercase text-[#c41e3a]">0{{ $loop->iteration }}</p>
        <h3 class="mt-3 font-serif text-xl">{{ $step->title }}</h3>
        <p class="mt-3 text-sm text-white/65">{{ $step->description }}</p>
      </div>
      @endforeach
    </div>
  </div>
</section>
@endif

@if($settings->page_visibility['about'] ?? false)
<section class="px-6 py-24 bg-white">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
    <div>
      <h2 class="font-serif text-4xl md:text-5xl">{{ $settings->about_title }}</h2>
      <p class="mt-6 text-lg text-[#3d4a5c] leading-relaxed">{{ $settings->about }}</p>
    </div>
    @if($settings->about_image)<img src="{{ \\App\\Support\\PublicAsset::url($settings->about_image) }}" class="h-[440px] w-full object-cover" alt="" />@endif
  </div>
</section>
@endif

@include('partials.testimonials')

<section class="px-6 pb-24 bg-white">
  <div class="max-w-7xl mx-auto px-10 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-white" style="background-color:#c41e3a">
    <div class="max-w-xl">
      <h2 class="font-serif text-4xl md:text-5xl">{{ $settings->cta_banner_title }}</h2>
      <p class="mt-4 text-white/85">{{ $settings->cta_banner_text }}</p>
    </div>
    <a href="{{ route('contact') }}" class="bg-white px-8 py-3.5 text-sm font-bold text-[#0a1628]">{{ $settings->cta_text }}</a>
  </div>
</section>
@endsection`
}

function helixHome(): string {
  return `@extends('layouts.site')
@section('content')
@include('partials.hero')

@if(($settings->page_visibility['services'] ?? false) && $services->isNotEmpty())
<section class="px-6 py-24 bg-[#f8fafc]">
  <div class="max-w-7xl mx-auto">
    <p class="text-xs font-bold tracking-[0.24em] uppercase text-[#155dfc]">Engagements</p>
    <h2 class="mt-3 text-4xl md:text-5xl font-black tracking-tight">{{ $settings->services_section_title }}</h2>
    <div class="mt-12 grid md:grid-cols-2 gap-4">
      @foreach($services->take(4) as $service)
      <a href="{{ route('services') }}" class="rounded-2xl p-8 {{ $loop->first ? 'md:col-span-2 text-white bg-[#155dfc]' : 'bg-white ring-1 ring-slate-200' }}">
        <p class="text-xs font-black tracking-[0.2em] uppercase {{ $loop->first ? 'text-white/70' : 'text-[#155dfc]' }}">0{{ $loop->iteration }}</p>
        <h3 class="mt-3 text-2xl font-black">{{ $service->title }}</h3>
        <p class="mt-3 leading-relaxed {{ $loop->first ? 'text-white/80' : 'text-slate-600' }}">{{ $service->description }}</p>
      </a>
      @endforeach
    </div>
  </div>
</section>
@endif

@if(($settings->section_visibility['steps'] ?? false) && $steps->isNotEmpty())
<section class="px-6 pb-8 bg-[#f8fafc]">
  <div class="max-w-7xl mx-auto rounded-3xl bg-white p-8 md:p-12 ring-1 ring-slate-200">
    <h2 class="text-4xl font-black tracking-tight">{{ $settings->steps_section_title }}</h2>
    <div class="mt-10 grid md:grid-cols-4 gap-8">
      @foreach($steps as $step)
      <div>
        <p class="text-5xl font-black text-[#155dfc]">{{ $loop->iteration }}</p>
        <h3 class="mt-3 text-lg font-black">{{ $step->title }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ $step->description }}</p>
      </div>
      @endforeach
    </div>
  </div>
</section>
@endif

@if($settings->page_visibility['about'] ?? false)
<section class="px-6 py-24 bg-[#f8fafc]">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <h2 class="text-4xl md:text-5xl font-black tracking-tight">{{ $settings->about_title }}</h2>
      <p class="mt-6 text-lg text-slate-600 leading-relaxed">{{ $settings->about }}</p>
    </div>
    @if($settings->about_image)<img src="{{ \\App\\Support\\PublicAsset::url($settings->about_image) }}" class="h-[420px] w-full object-cover rounded-2xl" alt="" />@endif
  </div>
</section>
@endif

@include('partials.testimonials')

<section class="px-6 py-24 bg-[#f8fafc]">
  <div class="max-w-7xl mx-auto rounded-3xl px-8 md:px-14 py-14 text-white bg-[#155dfc]">
    <h2 class="max-w-3xl text-4xl md:text-5xl font-black tracking-tight">{{ $settings->cta_banner_title }}</h2>
    <p class="mt-4 max-w-xl text-white/85">{{ $settings->cta_banner_text }}</p>
    <a href="{{ route('contact') }}" class="inline-block mt-8 rounded-md bg-white px-8 py-3.5 text-sm font-black text-[#155dfc]">{{ $settings->cta_text }}</a>
  </div>
</section>
@endsection`
}
