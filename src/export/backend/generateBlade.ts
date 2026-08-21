import { getNavShellId, requireManifest } from '../../catalog/catalog'
import { clonePaletteCss, isCloneTemplate, resolveClonePalette } from '../../templates/cloneTheme'
import { LAYOUT_VARIANT_IDS, LAYOUT_VARIANT_PRESETS } from '../../data/layoutVariants'
import { generateBladeSectionPartials } from '../bladeSectionPartials'
import { buildBladeHeroHtml } from '../heroExport'
import { LAYOUT_SHELL_CSS } from '../htmlShared'
import type { SiteExportPayload } from './exportPayload'
import { hasBookingFeature } from './generateBooking'
import { generateFinanceHomeBlade } from './generateFinanceBlade'

const NAV_LINKS = `@if($settings->page_visibility['about'] ?? false)<a href="{{ route('about') }}" class="hover:underline opacity-80">About</a>@endif
    @if($settings->page_visibility['services'] ?? false)<a href="{{ route('services') }}" class="hover:underline opacity-80">Services</a>@endif
    @if($settings->page_visibility['portfolio'] ?? false)<a href="{{ route('portfolio') }}" class="hover:underline opacity-80">Portfolio</a>@endif
    @if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('rooms.index') }}" class="hover:underline opacity-80">Rooms</a>@endif
    @if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('book') }}" class="hover:underline opacity-80">Book</a>@endif
    @if($settings->page_visibility['blog'] ?? false)<a href="{{ route('blog.index') }}" class="hover:underline opacity-80">Blog</a>@endif
    @if($settings->page_visibility['news'] ?? false)<a href="{{ route('news.index') }}" class="hover:underline opacity-80">News</a>@endif
    @if($settings->page_visibility['gallery'] ?? false)<a href="{{ route('gallery') }}" class="hover:underline opacity-80">Gallery</a>@endif
    @if($settings->page_visibility['contact'] ?? false)<a href="{{ route('contact') }}" class="hover:underline opacity-80">Contact</a>@endif`

const BRAND_MARK = `<span class="inline-flex items-center gap-2">@if($settings->logo)<img src="{{ \\App\\Support\\PublicAsset::url($settings->logo) }}" alt="" class="h-8 w-auto max-h-9 max-w-[10rem] object-contain" />@endif @if(!$settings->logo || ($settings->logo_show_name ?? true))<span>{{ $settings->business_name }}</span>@else<span class="sr-only">{{ $settings->business_name }}</span>@endif</span>`

function navPartial(payload: SiteExportPayload): string {
  const { accent, templateId } = payload
  const ctaRoute = hasBookingFeature(payload.content) ? 'book' : 'contact'
  const cta = `<a href="{{ route('${ctaRoute}') }}" data-brand-cta class="text-white px-5 py-2 rounded-lg text-sm font-semibold shrink-0" style="background-color:{{ filled($settings->brand_primary) ? $settings->brand_primary : '${accent}' }}">{{ $settings->cta_text }}</a>`

  const shells: Record<string, string> = {
    business: `<nav class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-xl font-bold">${BRAND_MARK}</a><div class="hidden lg:flex gap-6 text-sm font-medium">${NAV_LINKS}</div>${cta}</div></nav>`,
    creative: `<nav class="fixed top-0 z-50 w-full bg-zinc-950/85 backdrop-blur-lg text-white px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-lg font-black uppercase tracking-widest">${BRAND_MARK}</a><div class="hidden lg:flex gap-8 text-xs font-semibold uppercase tracking-wider">${NAV_LINKS}</div>${cta}</div></nav>`,
    restaurant: `<nav class="sticky top-0 z-50 bg-black/80 text-white px-6 py-5 backdrop-blur"><div class="max-w-6xl mx-auto flex items-center justify-between border-b border-white/10 pb-4 gap-4"><div class="hidden lg:flex flex-1 gap-6 text-sm">${NAV_LINKS}</div><a href="{{ route('home') }}" class="px-4 text-center font-serif text-2xl font-semibold">${BRAND_MARK}</a><div class="flex flex-1 justify-end items-center gap-6 text-sm">${cta}</div></div></nav>`,
    saas: `<nav class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-lg font-bold">${BRAND_MARK}</a><div class="hidden lg:flex items-center gap-3 text-sm">${NAV_LINKS}</div>${cta}</div></nav>`,
    fitness: `<nav class="sticky top-0 z-50 bg-black/70 text-white backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-xl font-bold uppercase tracking-wide">${BRAND_MARK}</a><div class="hidden lg:flex gap-7 text-sm font-medium uppercase tracking-wide">${NAV_LINKS}</div>${cta}</div></nav>`,
    boutique: `<nav class="relative border-b bg-white/95 px-6 py-6 text-center"><a href="{{ route('home') }}" class="font-serif text-2xl font-light tracking-wide">${BRAND_MARK}</a><div class="mt-4 hidden lg:flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">${NAV_LINKS}</div><div class="mt-4 lg:absolute lg:right-6 lg:top-6 lg:mt-0">${cta}</div></nav>`,
    realtor: `<nav class="sticky top-0 z-50 bg-black/75 text-white backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto border-b border-amber-600/30 pb-3 flex items-center justify-between gap-4"><div><a href="{{ route('home') }}" class="text-lg font-bold uppercase tracking-wide">${BRAND_MARK}</a><p class="mt-0.5 text-xs uppercase tracking-widest text-amber-400/80">Luxury Real Estate</p></div><div class="hidden lg:flex gap-8 text-sm">${NAV_LINKS}</div>${cta}</div></nav>`,
    photography: `<nav class="sticky top-0 z-50 bg-black/50 text-white backdrop-blur border-b border-white/10 px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-sm font-light uppercase tracking-[0.3em]">${BRAND_MARK}</a><div class="hidden lg:flex gap-10 text-xs uppercase tracking-widest">${NAV_LINKS}</div>${cta}</div></nav>`,
    medical: `<nav class="sticky top-0 z-50 border-b bg-white/95 backdrop-blur"><div class="border-b border-teal-100 bg-teal-50/80 px-6 py-1.5 text-center text-xs font-medium text-teal-800">Compassionate care · Same-week appointments</div><div class="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-4"><a href="{{ route('home') }}" class="text-lg font-semibold text-teal-900">${BRAND_MARK}</a><div class="hidden lg:flex gap-6 text-sm font-medium">${NAV_LINKS}</div>${cta}</div></nav>`,
    lawfirm: `<nav class="sticky top-0 z-50 border-b bg-white/95 backdrop-blur px-6 py-5"><div class="max-w-6xl mx-auto flex items-center gap-8"><a href="{{ route('home') }}" class="shrink-0 font-serif text-xl font-semibold">${BRAND_MARK}</a><div class="hidden h-8 w-px bg-stone-300 lg:block"></div><div class="hidden lg:flex flex-1 items-center justify-between"><div class="flex gap-8 text-sm">${NAV_LINKS}</div>${cta}</div></div></nav>`,
    cpa: `<div><div class="text-xs text-[#DDEBD0]" style="background-color:#0F211C"><div class="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap justify-between">@if($settings->phone)<a href="tel:{{ $settings->phone }}">{{ $settings->phone }}</a>@endif @if($settings->hours)<span>{{ $settings->hours }}</span>@endif</div></div><nav class="sticky top-0 z-50" style="background-color:#16302A"><div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between"><a href="{{ route('home') }}" class="text-xl font-black text-white">${BRAND_MARK}</a><div class="hidden lg:flex gap-1">${NAV_LINKS}</div>${cta}</div></nav></div>`,
    axiom: `<nav class="sticky top-0 z-50 border-b bg-white"><div class="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between"><a href="{{ route('home') }}" class="text-lg font-black">${BRAND_MARK}</a><div class="hidden lg:flex gap-1 text-sm font-semibold">${NAV_LINKS}</div>${cta}</div></nav>`,
    helix: `<div><div class="bg-black text-white py-3 px-4"><div class="max-w-7xl mx-auto flex items-center justify-between">@if($settings->email)<a href="mailto:{{ $settings->email }}" class="font-medium hover:underline">Email</a>@endif @if($settings->phone)<a href="tel:{{ $settings->phone }}" class="font-medium text-sm md:text-2xl">{{ $settings->phone }}</a>@endif</div></div><nav class="sticky top-0 z-50 bg-[#800020] text-white shadow-lg rounded-b-3xl"><div class="max-w-7xl mx-auto px-4"><div class="flex items-center justify-between h-20"><a href="{{ route('home') }}" class="shrink-0 font-bold text-xl">@if($settings->logo)<img src="{{ \\App\\Support\\PublicAsset::url($settings->logo) }}" alt="" class="h-16 w-16 object-contain" />@else${BRAND_MARK}@endif</a><div class="hidden md:flex items-center gap-1">${NAV_LINKS}</div><a href="{{ route('contact') }}" class="hidden md:block bg-white text-[#800020] px-6 py-2 rounded-lg font-semibold">Book now</a></div></div></nav></div>`,
    flux: `<div><div class="text-xs text-[#FFF3E7]" style="background-color:#241C15"><div class="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-6">@if($settings->phone)<a href="tel:{{ $settings->phone }}">{{ $settings->phone }}</a>@endif @if($settings->email)<span>{{ $settings->email }}</span>@endif</div></div><nav class="sticky top-0 z-50 bg-[#FFF9F4]/95 border-b border-[#EEDFCF]"><div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between"><a href="{{ route('home') }}" class="text-xl font-black">${BRAND_MARK}</a><div class="hidden lg:flex gap-1">${NAV_LINKS}</div>${cta}</div></nav></div>`,
    aureum: `<div><div class="border-b border-purple-200 text-xs" style="background-color:#eee4e6"><div class="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-6 text-purple-700">@if($settings->phone)<a href="tel:{{ $settings->phone }}">{{ $settings->phone }}</a>@endif @if($settings->email)<span>{{ $settings->email }}</span>@endif</div></div><nav class="sticky top-0 z-50 bg-slate-50/95 border-b"><div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between"><a href="{{ route('home') }}" class="text-xl font-black">${BRAND_MARK}</a><div class="hidden lg:flex gap-1">${NAV_LINKS}</div>${cta}</div></nav></div>`,
    taxfighters: `<div><div class="border-b border-rose-200 text-xs" style="background-color:#eee4e6"><div class="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-6 text-rose-700">@if($settings->phone)<a href="tel:{{ $settings->phone }}">{{ $settings->phone }}</a>@endif @if($settings->email)<span>{{ $settings->email }}</span>@endif</div></div><nav class="sticky top-0 z-50 bg-slate-50/95 border-b"><div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between"><a href="{{ route('home') }}" class="text-xl font-black">@if($settings->logo)<img src="{{ \\App\\Support\\PublicAsset::url($settings->logo) }}" alt="" class="h-10 w-auto object-contain" />@else${BRAND_MARK}@endif</a><div class="hidden lg:flex gap-1">${NAV_LINKS}</div>${cta}</div></nav></div>`,
    salon: `<nav class="sticky top-0 z-50 border-b bg-pink-50/90 backdrop-blur px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><div class="hidden lg:flex flex-1 justify-end gap-6 text-sm">${NAV_LINKS}</div><a href="{{ route('home') }}" class="font-serif text-2xl font-light tracking-wide text-pink-900">${BRAND_MARK}</a><div class="flex flex-1 justify-end items-center gap-6 text-sm">${cta}</div></div></nav>`,
    noir: `<nav class="fixed top-0 z-50 w-full bg-neutral-950/90 backdrop-blur text-amber-100 border-b border-amber-500/40 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="font-serif text-lg font-semibold uppercase tracking-[0.2em]">${BRAND_MARK}</a><div class="hidden lg:flex gap-8 text-xs font-semibold uppercase tracking-widest">${NAV_LINKS}</div>${cta}</div></nav>`,
    terra: `<nav class="sticky top-0 z-50 bg-orange-50/95 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4 rounded-full border border-orange-200 bg-orange-50/90 px-6 py-3 shadow-sm"><a href="{{ route('home') }}" class="text-lg font-bold text-orange-950">${BRAND_MARK}</a><div class="hidden lg:flex gap-6 text-sm font-medium">${NAV_LINKS}</div>${cta}</div></nav>`,
    coastal: `<nav class="sticky top-0 z-50 bg-sky-50/95 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto border-b-2 border-sky-300/50 pb-3 flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-xl font-bold text-sky-950"><span class="border-b-2 border-sky-400 pb-0.5">${BRAND_MARK}</span></a><div class="hidden lg:flex gap-7 text-sm font-medium text-sky-900">${NAV_LINKS}</div>${cta}</div></nav>`,
    vineyard: `<nav class="sticky top-0 z-50 bg-rose-50/95 backdrop-blur px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between border-b border-rose-900/20 pb-4"><a href="{{ route('home') }}" class="font-serif text-2xl font-semibold text-rose-950">${BRAND_MARK}</a><div class="hidden lg:flex items-center gap-8 text-sm">${NAV_LINKS}${cta}</div></div></nav>`,
    arcade: `<nav class="sticky top-0 z-50 bg-black text-lime-300 border-b-2 border-lime-400/60 shadow-[0_4px_24px_rgba(163,230,53,0.15)] px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-lg font-black uppercase tracking-wider">${BRAND_MARK}</a><div class="hidden lg:flex gap-6 text-xs font-bold uppercase tracking-widest">${NAV_LINKS}</div>${cta}</div></nav>`,
    coffee: `<nav class="sticky top-0 z-50 border-b border-amber-900/10 bg-[#faf6f0]/85 backdrop-blur-xl px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="font-serif text-2xl font-semibold text-[#2d1810]">${BRAND_MARK}</a><div class="hidden lg:flex gap-8 text-sm">${NAV_LINKS}</div>${cta}</div></nav>`,
    hotel: `<nav class="sticky top-0 z-50 border-b bg-stone-950/95 text-amber-50 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-lg font-semibold tracking-[0.15em] uppercase">${BRAND_MARK}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${NAV_LINKS}</div>${cta}</div></nav>`,
    guesthouse: `<nav class="sticky top-0 z-50 border-b border-stone-200 bg-[#f7f3ec]/95 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="font-serif text-2xl text-stone-900">${BRAND_MARK}</a><div class="hidden lg:flex gap-6 text-sm">${NAV_LINKS}</div>${cta}</div></nav>`,
    alpine: `<nav class="sticky top-0 z-50 bg-slate-950/90 text-sky-50 backdrop-blur border-b border-sky-400/20 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-lg font-light tracking-[0.2em] uppercase">${BRAND_MARK}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${NAV_LINKS}</div>${cta}</div></nav>`,
    ryokan: `<nav class="sticky top-0 z-50 bg-[#f3efe6]/95 backdrop-blur border-b border-stone-300 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="font-serif text-xl tracking-wide text-stone-900">${BRAND_MARK}</a><div class="hidden lg:flex gap-8 text-sm">${NAV_LINKS}</div>${cta}</div></nav>`,
    desert: `<nav class="sticky top-0 z-50 bg-[#1c1410]/95 text-amber-50 backdrop-blur border-b border-amber-700/40 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-lg font-light tracking-wide">${BRAND_MARK}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${NAV_LINKS}</div>${cta}</div></nav>`,
    nordic: `<nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-lg font-light tracking-wide text-slate-800">${BRAND_MARK}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${NAV_LINKS}</div>${cta}</div></nav>`,
    jungle: `<nav class="sticky top-0 z-50 bg-[#0a120c]/90 backdrop-blur border-b border-lime-700/30 text-lime-50 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="{{ route('home') }}" class="text-lg font-medium tracking-wide">${BRAND_MARK}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${NAV_LINKS}</div>${cta}</div></nav>`,
  }

  return shells[getNavShellId(templateId)] ?? shells.business
}

function footerPartial(): string {
  return `<footer class="border-t py-8 text-center text-sm text-slate-500">
  <div class="mb-4 flex flex-wrap justify-center gap-6 max-w-6xl mx-auto px-6">
    <a href="{{ route('home') }}" class="hover:underline opacity-70">Home</a>
    @if($settings->page_visibility['about'] ?? false)<a href="{{ route('about') }}" class="hover:underline opacity-70">About</a>@endif
    @if($settings->page_visibility['services'] ?? false)<a href="{{ route('services') }}" class="hover:underline opacity-70">Services</a>@endif
    @if($settings->page_visibility['portfolio'] ?? false)<a href="{{ route('portfolio') }}" class="hover:underline opacity-70">Portfolio</a>@endif
    @if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('rooms.index') }}" class="hover:underline opacity-70">Rooms</a>@endif
    @if($settings->page_visibility['rooms'] ?? false)<a href="{{ route('book') }}" class="hover:underline opacity-70">Book</a>@endif
    @if($settings->page_visibility['blog'] ?? false)<a href="{{ route('blog.index') }}" class="hover:underline opacity-70">Blog</a>@endif
    @if($settings->page_visibility['news'] ?? false)<a href="{{ route('news.index') }}" class="hover:underline opacity-70">News</a>@endif
    @if($settings->page_visibility['gallery'] ?? false)<a href="{{ route('gallery') }}" class="hover:underline opacity-70">Gallery</a>@endif
    @if($settings->page_visibility['contact'] ?? false)<a href="{{ route('contact') }}" class="hover:underline opacity-70">Contact</a>@endif
  </div>
  <p>© {{ date('Y') }} {{ $settings->business_name }}</p>
</footer>`
}

function generateHeroPartials(payload: SiteExportPayload): Record<string, string> {
  const heroCta = hasBookingFeature(payload.content) ? 'book' : 'contact'
  const files: Record<string, string> = {}

  for (const id of LAYOUT_VARIANT_IDS) {
    const preset = LAYOUT_VARIANT_PRESETS[id]
    files[`resources/views/partials/heroes/${id}.blade.php`] = buildBladeHeroHtml({
      templateId: payload.templateId,
      heroLayout: preset.heroLayout,
      heroImage: 'hero',
      businessName: payload.content.businessName,
      tagline: payload.content.tagline,
      heroSubtext: payload.content.heroSubtext,
      ctaText: payload.content.ctaText,
      ctaHref: heroCta,
      stats: payload.content.stats.filter((s) => s.value).slice(0, 3),
    })
  }

  // Runtime switcher — all three variants ship; admin picks via layout_variant_id
  files['resources/views/partials/hero.blade.php'] = `{{-- classic / modern / luxury heroes all export; active from Site Settings --}}
@php
    $layoutId = \\App\\Support\\LayoutVariants::normalize($settings->layout_variant_id ?? 'classic');
@endphp
@include('partials.heroes.' . $layoutId)
`

  return files
}

function testimonialsPartial(): string {
  return `@if($settings->section_visibility['testimonials'] ?? false)
<section class="py-20"><div class="max-w-6xl mx-auto px-6">
  <h2 class="text-3xl font-bold text-center mb-4">{{ $settings->testimonials_section_title }}</h2>
  <p class="text-center text-slate-600 mb-12">What our clients say about us</p>
  @if($testimonials->isEmpty())
    <p class="text-center text-slate-500">Client reviews</p>
  @else
    @php $tLayout = \\App\\Support\\LayoutVariants::testimonialLayout($settings->layout_variant_id); @endphp
    @if($tLayout === 'featured')
      <div class="space-y-8">
        @php $first = $testimonials->first(); $rest = $testimonials->slice(1)->take(3); @endphp
        <div class="mx-auto max-w-3xl rounded-xl border bg-white p-10 text-center">
          <div class="mb-4 text-amber-400">★★★★★</div>
          <p class="mb-6 text-2xl leading-relaxed">"{{ $first->quote }}"</p>
          <p class="text-lg font-semibold">{{ $first->author }}</p>
          <p class="text-sm opacity-70">{{ $first->role }}</p>
        </div>
        @if($rest->isNotEmpty())
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          @foreach($rest as $item)
          <div class="rounded-xl border bg-white p-8">
            <div class="mb-3 text-amber-400">★★★★★</div>
            <p class="mb-6 text-lg">"{{ $item->quote }}"</p>
            <p class="font-semibold">{{ $item->author }}</p>
            <p class="text-sm opacity-70">{{ $item->role }}</p>
          </div>
          @endforeach
        </div>
        @endif
      </div>
    @elseif($tLayout === 'list')
      <div class="mx-auto max-w-3xl space-y-6">
        @foreach($testimonials->take(6) as $item)
        <div class="flex flex-col gap-4 rounded-xl border bg-white p-6 sm:flex-row sm:items-start">
          <div class="shrink-0 text-2xl text-amber-400">★★★★★</div>
          <div>
            <p class="mb-3 text-lg leading-relaxed">"{{ $item->quote }}"</p>
            <p class="font-semibold">{{ $item->author }}</p>
            <p class="text-sm opacity-70">{{ $item->role }}</p>
          </div>
        </div>
        @endforeach
      </div>
    @else
      <div class="grid md:grid-cols-3 gap-6">
        @foreach($testimonials->take(3) as $item)
        <div class="rounded-xl border bg-white p-8">
          <div class="mb-3 text-amber-400">★★★★★</div>
          <p class="mb-6 text-lg">"{{ $item->quote }}"</p>
          <p class="font-semibold">{{ $item->author }}</p>
          <p class="text-sm opacity-70">{{ $item->role }}</p>
        </div>
        @endforeach
      </div>
    @endif
  @endif
</div></section>
@endif`
}

export function generateBladePartials(payload: SiteExportPayload): Record<string, string> {
  return {
    'resources/views/partials/nav.blade.php': navPartial(payload),
    'resources/views/partials/footer.blade.php': footerPartial(),
    'resources/views/partials/testimonials.blade.php': testimonialsPartial(),
    ...generateHeroPartials(payload),
    ...generateBladeSectionPartials(payload),
  }
}

export function generateBladeView(payload: SiteExportPayload): string {
  const financeHome = generateFinanceHomeBlade(payload)
  if (financeHome) return financeHome
  const { accent } = payload
  const roomsTeaser = hasBookingFeature(payload.content)
    ? `
@if($settings->page_visibility['rooms'] ?? false)
<section class="py-20 bg-slate-50"><div class="max-w-6xl mx-auto px-6">
  <div class="flex flex-wrap justify-between items-end gap-4 mb-10"><div><h2 class="text-3xl font-bold">{{ $settings->rooms_section_title ?? 'Rooms & Suites' }}</h2><p class="text-slate-600 mt-2">{{ $settings->rooms_section_subtitle }}</p></div><a href="{{ route('book') }}" class="text-sm font-semibold" style="color:${accent}">Check availability →</a></div>
  <div class="grid md:grid-cols-3 gap-6">@foreach(\\App\\Models\\RoomType::where('is_active', true)->whereNull('parent_id')->orderBy('sort_order')->take(3)->get() as $room)<a href="{{ route('rooms.show', $room->slug) }}" class="block rounded-xl border overflow-hidden bg-white hover:shadow-lg">@if($room->image)<img src="{{ \\App\\Support\\PublicAsset::url($room->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif<div class="p-5"><h3 class="font-semibold">{{ $room->name }}</h3><p class="text-sm opacity-70 mt-1 line-clamp-2">{{ $room->short_description }}</p><p class="mt-3 font-bold" style="color:${accent}">{{ number_format($room->base_price, 0) }} {{ $room->currency }} <span class="text-sm font-normal opacity-60">/ night</span></p></div></a>@endforeach</div>
</div></section>
@endif`
    : ''
  return `@extends('layouts.site')

@section('content')
@include('partials.hero')
${roomsTeaser}

@if(($settings->section_visibility['stats'] ?? false) && $stats->isNotEmpty())
<section class="py-16 text-white" style="background-color:${accent}">
  <div class="max-w-6xl mx-auto px-6 pb-2 text-center"><p class="text-sm font-semibold uppercase tracking-widest opacity-80">Trust signals</p></div>
  <div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
    @foreach($stats as $stat)
    <div class="text-center"><p class="text-3xl font-bold">{{ $stat->value }}</p><p class="text-sm opacity-70 mt-1">{{ $stat->label }}</p></div>
    @endforeach
  </div>
</section>
@endif

@if(($settings->page_visibility['services'] ?? false) && $services->isNotEmpty())
<section class="py-20"><div class="max-w-6xl mx-auto px-6">
  <div class="flex flex-wrap justify-between items-end gap-4 mb-10"><div><h2 class="text-3xl font-bold">{{ $settings->services_section_title }}</h2><p class="text-slate-600 mt-2">{{ $settings->services_section_subtitle }}</p></div><a href="{{ route('services') }}" class="text-sm font-semibold" style="color:${accent}">Explore all →</a></div>
  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">@foreach($services->take(4) as $service)<a href="{{ route('services') }}" class="block rounded-xl border p-6 hover:shadow-md"><h3 class="font-semibold text-lg mb-2">{{ $service->title }}</h3><p class="opacity-80 line-clamp-3">{{ $service->description }}</p></a>@endforeach</div>
</div></section>
@endif

@if(($settings->page_visibility['portfolio'] ?? false) && $showcaseItems->isNotEmpty())
<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6">
  <div class="flex flex-wrap justify-between items-end gap-4 mb-10"><div><h2 class="text-3xl font-bold">{{ $settings->showcase_section_title }}</h2><p class="text-slate-600 mt-2">{{ $settings->showcase_section_subtitle }}</p></div><a href="{{ route('portfolio') }}" class="text-sm font-semibold" style="color:${accent}">Explore all →</a></div>
  <div class="grid sm:grid-cols-3 gap-8">@foreach($showcaseItems->take(3) as $item)<a href="{{ route('portfolio') }}" class="block rounded-xl border overflow-hidden bg-white hover:shadow-lg">@if($item->image)<img src="{{ \\App\\Support\\PublicAsset::url($item->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif<div class="p-6"><h3 class="font-semibold">{{ $item->title }}</h3><p class="opacity-80 line-clamp-2 mt-2">{{ $item->description }}</p></div></a>@endforeach</div>
</div></section>
@endif

@if(($settings->page_visibility['blog'] ?? false) && $blogPosts->isNotEmpty())
<section class="py-20"><div class="max-w-6xl mx-auto px-6">
  <div class="flex flex-wrap justify-between items-end gap-4 mb-10"><div><h2 class="text-3xl font-bold">{{ $settings->blog_section_title }}</h2><p class="text-slate-600 mt-2">{{ $settings->blog_section_subtitle }}</p></div><a href="{{ route('blog.index') }}" class="text-sm font-semibold" style="color:${accent}">Explore all posts →</a></div>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">@foreach($blogPosts->take(3) as $post)<a href="{{ route('blog.show', $post->slug) }}" class="block rounded-xl border overflow-hidden hover:shadow-lg bg-white">@if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif<div class="p-6">@if($post->published_at)<p class="text-xs uppercase tracking-wider opacity-60 mb-2">{{ $post->published_at->format('F j, Y') }}</p>@endif<h3 class="font-semibold text-lg mb-2">{{ $post->title }}</h3><p class="opacity-80 line-clamp-3">{{ $post->excerpt }}</p></div></a>@endforeach</div>
</div></section>
@endif

@if(($settings->page_visibility['news'] ?? false) && $newsPosts->isNotEmpty())
<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6">
  <div class="flex flex-wrap justify-between items-end gap-4 mb-10"><div><h2 class="text-3xl font-bold">{{ $settings->news_section_title }}</h2><p class="text-slate-600 mt-2">{{ $settings->news_section_subtitle }}</p></div><a href="{{ route('news.index') }}" class="text-sm font-semibold" style="color:${accent}">Explore all news →</a></div>
  <div class="grid sm:grid-cols-3 gap-8">@foreach($newsPosts->take(3) as $post)<a href="{{ route('news.show', $post->slug) }}" class="block rounded-xl border overflow-hidden hover:shadow-lg bg-white">@if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif<div class="p-6">@if($post->published_at)<p class="text-xs uppercase tracking-wider opacity-60 mb-2">{{ $post->published_at->format('F j, Y') }}</p>@endif<h3 class="font-semibold text-lg mb-2">{{ $post->title }}</h3><p class="opacity-80 line-clamp-3">{{ $post->excerpt }}</p></div></a>@endforeach</div>
</div></section>
@endif

@include('partials.testimonials')

@if($settings->page_visibility['about'] ?? false)
<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center"><div><h2 class="text-3xl font-bold mb-6">{{ $settings->about_title }}</h2><p class="text-lg leading-relaxed text-slate-600 mb-6">{{ Str::limit($settings->about, 280) }}</p>@if($settings->mission_statement)<p class="border-l-4 pl-6 italic text-slate-600" style="border-color:${accent}">{{ $settings->mission_statement }}</p>@endif<a href="{{ route('about') }}" class="inline-block mt-8 text-sm font-semibold" style="color:${accent}">Learn more about us →</a></div>@if($settings->about_image)<img src="{{ \\App\\Support\\PublicAsset::url($settings->about_image) }}" class="rounded-2xl w-full" alt="" />@endif</div></section>
@endif

@if(($settings->section_visibility['faq'] ?? false) && $faqs->isNotEmpty())
@include('partials.home-faq')
@endif

@if($settings->page_visibility['contact'] ?? false)
@include('partials.home-contact')
@endif

@include('partials.home-explore')
@endsection`
}

export function generateAboutView(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@extends('layouts.site')
@section('content')
<section class="py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
  <div><h1 class="text-4xl font-bold mb-6">{{ $settings->about_title }}</h1><p class="text-lg leading-relaxed text-slate-600 mb-6">{{ $settings->about }}</p>@if($settings->mission_statement)<p class="border-l-4 pl-6 italic text-slate-600" style="border-color:${accent}">{{ $settings->mission_statement }}</p>@endif</div>
  @if($settings->about_image)<img src="{{ \\App\\Support\\PublicAsset::url($settings->about_image) }}" class="rounded-2xl w-full" alt="" />@endif
</div></section>
@if(($settings->section_visibility['team'] ?? false) && $team->isNotEmpty())
<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">{{ $settings->team_section_title }}</h2><div class="grid md:grid-cols-3 gap-8">@foreach($team as $member)<div class="text-center">@if($member->image)<img src="{{ \\App\\Support\\PublicAsset::url($member->image) }}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover" alt="" />@endif<h3 class="font-semibold">{{ $member->name }}</h3><p class="opacity-70">{{ $member->role }}</p></div>@endforeach</div></div></section>
@endif
@endsection`
}

export function generateServicesView(_payload: SiteExportPayload): string {
  return `@extends('layouts.site')
@section('content')
@if($services->isNotEmpty())
<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">{{ $settings->services_section_title }}</h1><p class="text-center text-slate-600 mb-12">{{ $settings->services_section_subtitle }}</p><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">@foreach($services as $service)<div class="rounded-xl border p-6"><h3 class="font-semibold text-lg mb-2">{{ $service->title }}</h3><p class="opacity-80">{{ $service->description }}</p></div>@endforeach</div></div></section>
@endif
@if(($settings->section_visibility['steps'] ?? false) && $steps->isNotEmpty())
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">{{ $settings->steps_section_title }}</h2><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">@foreach($steps as $step)<div><span class="text-2xl font-bold opacity-40">0{{ $loop->iteration }}</span><h3 class="font-semibold mt-2">{{ $step->title }}</h3><p class="opacity-80 mt-1">{{ $step->description }}</p></div>@endforeach</div></div></section>
@endif
@if($settings->section_visibility['pricing'] ?? false)
<section class="py-20 bg-slate-50"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">{{ $settings->pricing_section_title }}</h2><p class="text-center text-slate-600">Ask us for a quote — we will price the work clearly before we start.</p></div></section>
@endif
@endsection`
}

export function generatePortfolioView(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@extends('layouts.site')
@section('content')
@if($showcaseItems->isNotEmpty())
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">{{ $settings->showcase_section_title }}</h1><p class="text-center text-slate-600 mb-12">{{ $settings->showcase_section_subtitle }}</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">@foreach($showcaseItems as $item)<a href="{{ route('contact') }}" class="block rounded-xl border overflow-hidden hover:shadow-lg">@if($item->image)<img src="{{ \\App\\Support\\PublicAsset::url($item->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif<div class="p-6"><h3 class="font-semibold text-lg mb-2">{{ $item->title }}</h3><p class="opacity-80">{{ $item->description }}</p>@if($item->price)<p class="text-lg font-bold mt-2" style="color:${accent}">{{ $item->price }}</p>@endif</div></a>@endforeach</div></div></section>
@endif
@endsection`
}

export function generateGalleryView(): string {
  return `@extends('layouts.site')
@section('content')
@if($galleryImages->isNotEmpty())
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-12">{{ $settings->gallery_section_title }}</h1><div class="grid md:grid-cols-3 gap-4">@foreach($galleryImages as $image)<img src="{{ \\App\\Support\\PublicAsset::url($image->path) }}" class="w-full rounded-xl aspect-[4/3] object-cover" alt="" />@endforeach</div></div></section>
@endif
@endsection`
}

export function generateReviewsView(): string {
  return `@extends('layouts.site')
@section('content')
@include('partials.testimonials')
@endsection`
}

export function generateBlogIndexView(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@extends('layouts.site')
@section('content')
<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">{{ $settings->blog_section_title }}</h1><p class="text-center text-slate-600 mb-12">{{ $settings->blog_section_subtitle }}</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">@foreach($blogPosts as $post)<a href="{{ route('blog.show', $post->slug) }}" class="block rounded-xl border overflow-hidden hover:shadow-lg bg-white">@if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif<div class="p-6">@if($post->published_at)<p class="text-xs uppercase tracking-wider opacity-60 mb-2">{{ $post->published_at->format('F j, Y') }}</p>@endif<h3 class="font-semibold text-lg mb-2">{{ $post->title }}</h3><p class="opacity-80 line-clamp-3">{{ $post->excerpt }}</p><span class="inline-block mt-3 text-sm font-semibold" style="color:${accent}">Read more →</span></div></a>@endforeach</div></div></section>
@endsection`
}

export function generateBlogPostView(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@extends('layouts.site')
@section('content')
<article class="py-16"><div class="max-w-3xl mx-auto px-6">
<a href="{{ route('blog.index') }}" class="text-sm opacity-70 hover:underline mb-8 inline-block">← Back to blog</a>
@if($post->published_at)<p class="text-sm uppercase tracking-wider text-slate-400 mb-4">{{ $post->published_at->format('F j, Y') }}</p>@endif
<h1 class="text-4xl font-bold mb-4">{{ $post->title }}</h1>
@if($post->author)<p class="text-slate-500 mb-8">By {{ $post->author }}</p>@endif
@if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full rounded-2xl mb-10 aspect-[16/9] object-cover" alt="" />@endif
@if($post->excerpt)<p class="text-xl text-slate-700 mb-10 border-l-4 pl-6 italic" style="border-color:${accent}">{{ $post->excerpt }}</p>@endif
<div class="prose prose-slate max-w-none">{!! nl2br(e($post->body)) !!}</div>
</div></article>
@endsection`
}

export function generateFaqView(): string {
  return `@extends('layouts.site')
@section('content')
@if($faqs->isNotEmpty())
<section class="py-20"><div class="max-w-3xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-12">{{ $settings->faq_section_title }}</h1>@foreach($faqs as $faq)<div class="border-b py-5"><h3 class="font-semibold mb-2">{{ $faq->question }}</h3><p class="opacity-80">{{ $faq->answer }}</p></div>@endforeach</div></section>
@endif
@endsection`
}

export function generateNewsIndexView(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@extends('layouts.site')
@section('content')
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">{{ $settings->news_section_title }}</h1><p class="text-center text-slate-600 mb-12">{{ $settings->news_section_subtitle }}</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">@foreach($newsPosts as $post)<a href="{{ route('news.show', $post->slug) }}" class="block rounded-xl border overflow-hidden hover:shadow-lg bg-white">@if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif<div class="p-6">@if($post->published_at)<p class="text-xs uppercase tracking-wider opacity-60 mb-2">{{ $post->published_at->format('F j, Y') }}</p>@endif<h3 class="font-semibold text-lg mb-2">{{ $post->title }}</h3><p class="opacity-80 line-clamp-3">{{ $post->excerpt }}</p><span class="inline-block mt-3 text-sm font-semibold" style="color:${accent}">Read more →</span></div></a>@endforeach</div></div></section>
@endsection`
}

export function generateNewsPostView(_payload: SiteExportPayload): string {
  return `@extends('layouts.site')
@section('content')
<article class="py-16"><div class="max-w-3xl mx-auto px-6">
<a href="{{ route('news.index') }}" class="text-sm opacity-70 hover:underline mb-8 inline-block">← Back to news</a>
@if($post->published_at)<p class="text-sm uppercase tracking-wider text-slate-400 mb-4">{{ $post->published_at->format('F j, Y') }}</p>@endif
<h1 class="text-4xl font-bold mb-4">{{ $post->title }}</h1>
@if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full rounded-2xl mb-10 aspect-[16/9] object-cover" alt="" />@endif
<div class="prose prose-slate max-w-none">{!! nl2br(e($post->body)) !!}</div>
</div></article>
@endsection`
}

export function generateContactView(): string {
  return `@extends('layouts.site')
@section('content')
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold mb-10">{{ $settings->contact_section_title }}</h1><div class="grid lg:grid-cols-2 gap-12"><div><h2 class="text-xl font-semibold mb-6">{{ $settings->contact_form_title }}</h2><div class="grid sm:grid-cols-2 gap-6 text-sm">@if($settings->email)<div><p class="opacity-60 mb-1">Email</p><p>{{ $settings->email }}</p></div>@endif @if($settings->phone)<div><p class="opacity-60 mb-1">Phone</p><p>{{ $settings->phone }}</p></div>@endif @if($settings->address)<div><p class="opacity-60 mb-1">Address</p><p>{{ $settings->address }}</p></div>@endif @if($settings->hours)<div><p class="opacity-60 mb-1">Hours</p><p>{{ $settings->hours }}</p></div>@endif</div>@php $mapSrc = $settings->map_url; if ($mapSrc && (str_contains($mapSrc, 'maps/embed') || str_contains($mapSrc, 'output=embed'))) { } elseif ($mapSrc) { $mapSrc = 'https://www.google.com/maps?q='.urlencode($mapSrc).'&output=embed'; } elseif ($settings->address) { $mapSrc = 'https://www.google.com/maps?q='.urlencode($settings->address).'&output=embed'; } else { $mapSrc = ''; } @endphp @if($mapSrc)<div class="mt-8 overflow-hidden rounded-2xl border h-56"><iframe title="Office location" src="{{ $mapSrc }}" class="w-full h-full border-0" loading="lazy"></iframe></div>@endif</div><div>@include('partials.contact-form')</div></div></section>
@if(($settings->section_visibility['faq'] ?? false) && $faqs->isNotEmpty())
<section class="py-16"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">{{ $settings->faq_section_title }}</h2>@foreach($faqs as $faq)<div class="border-b py-5"><h3 class="font-semibold mb-2">{{ $faq->question }}</h3><p class="opacity-80">{{ $faq->answer }}</p></div>@endforeach</div></section>
@endif
@endsection`
}

export function generateSiteLayout(payload: SiteExportPayload): string {
  const title = payload.content.businessName || 'My Website'
  const c = payload.content
  const seoBlock = c.seoEnabled
    ? `@if(($settings->seo_enabled ?? false))
  <meta name="description" content="{{ $settings->seo_description }}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  @if($settings->seo_keywords)<meta name="keywords" content="{{ $settings->seo_keywords }}" />@endif
  @if($settings->seo_site_url)<link rel="canonical" href="{{ rtrim($settings->seo_site_url, '/') }}{{ request()->getPathInfo() === '/' ? '' : request()->getPathInfo() }}" />@endif
  <meta property="og:type" content="@yield('og_type', 'website')" />
  <meta property="og:title" content="@yield('title', $settings->seo_title ?: $settings->business_name)" />
  <meta property="og:description" content="@yield('meta_description', $settings->seo_description)" />
  <meta property="og:site_name" content="{{ $settings->business_name }}" />
  @if($settings->hero_image)<meta property="og:image" content="{{ asset($settings->hero_image) }}" /><meta name="twitter:image" content="{{ asset($settings->hero_image) }}" />@endif
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="@yield('title', $settings->seo_title ?: $settings->business_name)" />
  <meta name="twitter:description" content="@yield('meta_description', $settings->seo_description)" />
  @endif`
    : ''
  const cloneCss = isCloneTemplate(payload.templateId)
    ? clonePaletteCss(payload.templateId, resolveClonePalette(payload.templateId, payload.content, payload.colorSchemeId))
    : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>@yield('title', '${title}')</title>
  @php
    $settings = $settings ?? \\App\\Models\\SiteSetting::current();
    $layoutShell = \\App\\Support\\LayoutVariants::shellClass($settings->layout_variant_id ?? null);
  @endphp
  ${seoBlock}
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="{{ \\App\\Support\\Brand::fontHref($settings->font_heading, $settings->font_body) }}" rel="stylesheet" />
  <style>${LAYOUT_SHELL_CSS}
{!! \\App\\Support\\Brand::css($settings) !!}
${cloneCss}
</style>
</head>
<body data-site-brand class="@hasSection('fullpage') webtemplate-clone @else tpl-${payload.templateId} ${requireManifest(payload.templateId).theme.page} {{ $layoutShell }} @endif">
  @hasSection('fullpage')
    @yield('fullpage')
  @else
    @include('partials.nav')
    @yield('content')
    @include('partials.footer')
  @endif
</body>
</html>`
}

export function generateAllBladeViews(payload: SiteExportPayload): Record<string, string> {
  return {
    ...generateBladePartials(payload),
    'resources/views/layouts/site.blade.php': generateSiteLayout(payload),
    'resources/views/site/index.blade.php': generateBladeView(payload),
    'resources/views/site/about.blade.php': generateAboutView(payload),
    'resources/views/site/services.blade.php': generateServicesView(payload),
    'resources/views/site/portfolio.blade.php': generatePortfolioView(payload),
    'resources/views/site/gallery.blade.php': generateGalleryView(),
    'resources/views/site/blog.blade.php': generateBlogIndexView(payload),
    'resources/views/site/blog-post.blade.php': generateBlogPostView(payload),
    'resources/views/site/news.blade.php': generateNewsIndexView(payload),
    'resources/views/site/news-post.blade.php': generateNewsPostView(payload),
    'resources/views/site/contact.blade.php': generateContactView(),
  }
}