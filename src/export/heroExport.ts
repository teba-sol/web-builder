import { requireManifest } from '../catalog/catalog'
import type { HeroLayout } from '../data/layoutVariants'
import type { TemplateId } from '../types'
import { escapeHtml } from './imageUtils'

export function heroUsesBackgroundImage(templateId: TemplateId, heroLayout: HeroLayout): boolean {
  return requireManifest(templateId).hero.overlay || heroLayout === 'immersive'
}

function overlayGradient(templateId: TemplateId): string {
  return requireManifest(templateId).hero.overlayGradient
}

function headerClasses(templateId: TemplateId, heroLayout: HeroLayout): string {
  const t = requireManifest(templateId).theme
  const immersiveExtra =
    heroLayout === 'immersive' && !requireManifest(templateId).hero.overlay
      ? 'min-h-[85vh] flex flex-col justify-center'
      : ''
  return `relative ${t.hero} ${immersiveExtra}`.trim()
}

function contentWrapperClass(templateId: TemplateId, heroLayout: HeroLayout, hasOverlay: boolean): string {
  const base = 'relative mx-auto max-w-6xl px-6 w-full'
  if (heroLayout === 'centered') {
    return `${base} text-center py-24 flex flex-col items-center`
  }
  switch (templateId) {
    case 'boutique':
      return heroLayout === 'immersive' ? `${base} py-32` : base
    case 'saas':
    case 'medical':
    case 'business':
    case 'lawfirm':
    case 'cpa':
    case 'aureum':
    case 'flux':
    case 'axiom':
    case 'helix':
      return heroLayout === 'immersive'
        ? `${base} py-32 text-center`
        : `${base} grid lg:grid-cols-2 gap-12 items-center py-24`
    case 'restaurant':
      return `${base} pb-16 pt-28`
    case 'realtor':
    case 'photography':
      return `${base} pb-16 pt-28`
    case 'creative':
      return base
    case 'fitness':
      return `${base} py-28`
    case 'noir':
    case 'coastal':
    case 'vineyard':
    case 'arcade':
    case 'taxfighters':
      return `${base} pb-20 pt-28`
    case 'terra':
      return hasOverlay
        ? `${base} py-24`
        : `${base} grid lg:grid-cols-2 gap-12 items-center py-24`
    default:
      return `${base} py-32`
  }
}

function heroBadgeHtml(templateId: TemplateId, businessName: string, mode: 'html' | 'blade'): string {
  const manifest = requireManifest(templateId)
  const t = manifest.theme
  const name = mode === 'html' ? escapeHtml(businessName) : '{{ $settings->business_name }}'
  if (manifest.hero.badge === 'established') {
    return `<p class="mb-3 ${t.heroBadge}">Est. 2010</p>`
  }
  if (manifest.hero.badge === 'none') {
    return ''
  }
  return `<p class="mb-4 ${t.heroBadge}">${name}</p>`
}

function heroImageSrc(mode: 'html' | 'blade', heroImage: string): string {
  if (mode === 'blade') {
    return '{{ \\App\\Support\\PublicAsset::url($settings->hero_image) }}'
  }
  return escapeHtml(heroImage)
}

function inlineHeroImage(
  templateId: TemplateId,
  heroLayout: HeroLayout,
  heroImage: string,
  hasOverlay: boolean,
  mode: 'html' | 'blade',
): string {
  if (hasOverlay || (mode === 'html' && !heroImage)) return ''
  const src = heroImageSrc(mode, heroImage)
  let imgClass = 'rounded-2xl shadow-2xl w-full mt-8 lg:mt-0'
  if (templateId === 'boutique') {
    imgClass = 'mx-auto mt-10 max-h-[500px] w-full max-w-4xl object-cover'
  } else if (heroLayout !== 'immersive' && heroLayout !== 'centered' && !requireManifest(templateId).hero.overlay) {
    imgClass = 'rounded-2xl shadow-2xl w-full'
  }
  const img = `<img src="${src}" alt="" class="${imgClass}" />`
  return mode === 'blade' ? `@if($settings->hero_image)\n    ${img}\n    @endif` : heroImage ? img : ''
}

export interface HeroExportInput {
  templateId: TemplateId
  heroLayout: HeroLayout
  heroImage: string
  businessName: string
  tagline: string
  heroSubtext: string
  ctaText: string
  ctaHref: string
  stats?: { value: string; label: string }[]
}

function heroTextBlock(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const t = requireManifest(input.templateId).theme
  const tagline = mode === 'html' ? escapeHtml(input.tagline) : '{{ $settings->tagline }}'
  const subtext = mode === 'html' ? escapeHtml(input.heroSubtext) : '{{ $settings->hero_subtext }}'
  const ctaText = mode === 'html' ? escapeHtml(input.ctaText) : '{{ $settings->cta_text }}'
  const ctaHref =
    mode === 'html'
      ? escapeHtml(input.ctaHref)
      : "{{ str_starts_with($settings->cta_link ?? '', 'http') ? $settings->cta_link : route(($settings->cta_link ?? 'contact') === 'contact' ? 'contact' : 'home') }}"

  return `${heroBadgeHtml(input.templateId, input.businessName, mode)}
      <h1 class="mb-6 ${t.heroTitle}">${tagline}</h1>
      <p class="mb-8 ${t.heroText}">${subtext}</p>
      <a href="${ctaHref}" data-brand-cta class="inline-block ${t.heroCta}">${ctaText} →</a>`
}

function buildTaxFightersHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const src = heroImageSrc(mode, input.heroImage)
  const title = mode === 'html' ? escapeHtml(input.tagline) : '{{ $settings->tagline }}'
  const subtext = mode === 'html' ? escapeHtml(input.heroSubtext) : '{{ $settings->hero_subtext }}'
  const img =
    mode === 'blade'
      ? `@if($settings->hero_image)<img src="${src}" alt="" class="absolute inset-0 h-full w-full object-cover" />@endif`
      : input.heroImage
        ? `<img src="${src}" alt="" class="absolute inset-0 h-full w-full object-cover" />`
        : ''
  return `<header class="relative h-screen min-h-[640px] -mt-20 overflow-hidden">
  ${img}
  <div class="absolute inset-0 bg-black/50"></div>
  <div class="relative z-10 max-w-3xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center pt-20">
    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">${title}</h1>
    <p class="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed">${subtext}</p>
    <a href="${mode === 'html' ? escapeHtml(input.ctaHref) : "{{ route('contact') }}"}" class="px-8 py-3 rounded-full font-semibold text-lg border-2 text-white" style="border-color:#800020">Learn More</a>
  </div>
  ${
    input.stats?.length
      ? `<div class="absolute bottom-10 left-0 right-0 z-10 flex flex-wrap justify-center gap-8 sm:gap-16 px-4">${input.stats
          .map(
            (s) =>
              `<div class="text-center"><div class="text-2xl sm:text-3xl font-bold text-white">${escapeHtml(s.value)}</div><div class="text-sm sm:text-base text-gray-300">${escapeHtml(s.label)}</div></div>`,
          )
          .join('')}</div>`
      : ''
  }
</header>`
}

function usesSplitColumns(templateId: TemplateId, heroLayout: HeroLayout, hasOverlay: boolean): boolean {
  if (hasOverlay || heroLayout === 'centered' || heroLayout === 'immersive') return false
  return requireManifest(templateId).hero.splitColumns
}

export function buildStaticHeroHtml(input: HeroExportInput): string {
  return buildHeroHtml(input, 'html')
}

export function buildBladeHeroHtml(input: HeroExportInput): string {
  return buildHeroHtml(input, 'blade')
}

function buildAureumHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const src = heroImageSrc(mode, input.heroImage)
  const title = mode === 'html' ? escapeHtml(input.tagline) : '{{ $settings->tagline }}'
  const subtext = mode === 'html' ? escapeHtml(input.heroSubtext) : '{{ $settings->hero_subtext }}'
  const name = mode === 'html' ? escapeHtml(input.businessName) : '{{ $settings->business_name }}'
  const ctaText = mode === 'html' ? escapeHtml(input.ctaText) : '{{ $settings->cta_text }}'
  const ctaHref = mode === 'html' ? escapeHtml(input.ctaHref) : "{{ route('contact') }}"
  const img =
    mode === 'blade'
      ? `@if($settings->hero_image)<img src="${src}" alt="" class="h-[420px] md:h-[560px] w-full rounded-[2rem] object-cover shadow-2xl" />@endif`
      : input.heroImage
        ? `<img src="${src}" alt="" class="h-[420px] md:h-[560px] w-full rounded-[2rem] object-cover shadow-2xl" />`
        : ''
  const stats = input.stats?.length
    ? `<div class="relative z-10 max-w-5xl mx-auto px-6 -mt-16"><div class="grid grid-cols-3 bg-white rounded-2xl shadow-xl overflow-hidden">${input.stats
        .map(
          (s, i) =>
            `<div class="text-center px-4 py-7 ${i > 0 ? 'border-l border-[#eadfce]' : ''}"><p class="font-serif text-3xl md:text-4xl text-[#7a2e38]">${escapeHtml(s.value)}</p><p class="mt-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8a7d72]">${escapeHtml(s.label)}</p></div>`,
        )
        .join('')}</div></div>`
    : ''
  return `<header class="relative overflow-hidden bg-[#f4efe6] text-[#2a211c]">
  <div class="max-w-7xl mx-auto px-6 pt-16 pb-28 grid lg:grid-cols-12 gap-12 items-center min-h-[86vh]">
    <div class="lg:col-span-6">
      <p class="mb-5 text-xs font-semibold tracking-[0.28em] uppercase text-[#7a2e38]">${name}</p>
      <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">${title}</h1>
      <div class="mt-6 h-px w-20 bg-[#b8956a]"></div>
      <p class="mt-6 max-w-xl text-lg leading-relaxed text-[#5c5148]">${subtext}</p>
      <a href="${ctaHref}" class="inline-block mt-10 rounded-full px-8 py-3.5 text-sm font-semibold text-white" style="background-color:#7a2e38">${ctaText}</a>
    </div>
    <div class="lg:col-span-6">${img}</div>
  </div>
  ${stats}
</header>`
}

function buildFluxHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const src = heroImageSrc(mode, input.heroImage)
  const title = mode === 'html' ? escapeHtml(input.tagline) : '{{ $settings->tagline }}'
  const subtext = mode === 'html' ? escapeHtml(input.heroSubtext) : '{{ $settings->hero_subtext }}'
  const name = mode === 'html' ? escapeHtml(input.businessName) : '{{ $settings->business_name }}'
  const ctaText = mode === 'html' ? escapeHtml(input.ctaText) : '{{ $settings->cta_text }}'
  const ctaHref = mode === 'html' ? escapeHtml(input.ctaHref) : "{{ route('contact') }}"
  const img =
    mode === 'blade'
      ? `@if($settings->hero_image)<img src="${src}" alt="" class="h-[380px] md:h-[480px] w-full rounded-[2rem] object-cover ring-2 ring-[#c8ff3d]" />@endif`
      : input.heroImage
        ? `<img src="${src}" alt="" class="h-[380px] md:h-[480px] w-full rounded-[2rem] object-cover ring-2 ring-[#c8ff3d]" />`
        : ''
  const stats = input.stats?.length
    ? `<div class="border-y border-white/10 bg-black"><div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">${input.stats
        .map(
          (s, i) =>
            `<div class="px-6 py-8 ${i > 0 ? 'md:border-l border-white/10' : ''}"><p class="text-3xl md:text-4xl font-black tracking-tight text-[#c8ff3d]">${escapeHtml(s.value)}</p><p class="mt-2 text-xs font-bold tracking-[0.2em] uppercase text-white/45">${escapeHtml(s.label)}</p></div>`,
        )
        .join('')}</div></div>`
    : ''
  return `<header class="relative overflow-hidden bg-[#070708] text-white">
  <div class="max-w-7xl mx-auto px-6 pt-16 pb-16 grid lg:grid-cols-12 gap-10 items-end">
    <div class="lg:col-span-7">
      <p class="mb-6 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold tracking-[0.22em] uppercase text-[#c8ff3d]">${name} · same-week money</p>
      <h1 class="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.9] tracking-tight">${title}</h1>
      <p class="mt-8 max-w-xl text-lg leading-relaxed text-white/65">${subtext}</p>
      <a href="${ctaHref}" class="inline-block mt-10 rounded-full px-8 py-3.5 text-sm font-black text-black" style="background-color:#c8ff3d">${ctaText}</a>
    </div>
    <div class="lg:col-span-5">${img}</div>
  </div>
  ${stats}
</header>`
}

function buildAxiomHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const src = heroImageSrc(mode, input.heroImage)
  const title = mode === 'html' ? escapeHtml(input.tagline) : '{{ $settings->tagline }}'
  const subtext = mode === 'html' ? escapeHtml(input.heroSubtext) : '{{ $settings->hero_subtext }}'
  const ctaText = mode === 'html' ? escapeHtml(input.ctaText) : '{{ $settings->cta_text }}'
  const ctaHref = mode === 'html' ? escapeHtml(input.ctaHref) : "{{ route('contact') }}"
  const img =
    mode === 'blade'
      ? `@if($settings->hero_image)<img src="${src}" alt="" class="relative h-[420px] w-full object-cover" />@endif`
      : input.heroImage
        ? `<img src="${src}" alt="" class="relative h-[420px] w-full object-cover" />`
        : ''
  const stats = input.stats?.length
    ? `<div class="bg-[#0a1628] text-white"><div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">${input.stats
        .map(
          (s, i) =>
            `<div class="px-6 py-10 ${i > 0 ? 'md:border-l border-white/10' : ''}"><p class="font-serif text-3xl md:text-4xl text-[#c41e3a]">${escapeHtml(s.value)}</p><p class="mt-2 text-[11px] font-bold tracking-[0.2em] uppercase text-white/55">${escapeHtml(s.label)}</p></div>`,
        )
        .join('')}</div></div>`
    : ''
  return `<header class="bg-white text-[#0a1628] border-b border-[#0a1628]/10">
  <div class="h-1.5 w-full bg-[#c41e3a]"></div>
  <div class="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-12 gap-12 items-center">
    <div class="lg:col-span-7">
      <p class="mb-4 text-xs font-bold tracking-[0.32em] uppercase text-[#c41e3a]">Tax controversy & audit defense</p>
      <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">${title}</h1>
      <div class="mt-6 h-1 w-16 bg-[#c41e3a]"></div>
      <p class="mt-6 max-w-xl text-lg leading-relaxed text-[#3d4a5c]">${subtext}</p>
      <a href="${ctaHref}" class="inline-block mt-10 px-8 py-3.5 text-sm font-bold text-white bg-[#c41e3a]">${ctaText}</a>
    </div>
    <div class="relative lg:col-span-5">${img}</div>
  </div>
  ${stats}
</header>`
}

function buildHelixHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const src = heroImageSrc(mode, input.heroImage)
  const title = mode === 'html' ? escapeHtml(input.tagline) : '{{ $settings->tagline }}'
  const subtext = mode === 'html' ? escapeHtml(input.heroSubtext) : '{{ $settings->hero_subtext }}'
  const ctaText = mode === 'html' ? escapeHtml(input.ctaText) : '{{ $settings->cta_text }}'
  const ctaHref = mode === 'html' ? escapeHtml(input.ctaHref) : "{{ route('contact') }}"
  const img =
    mode === 'blade'
      ? `@if($settings->hero_image)<img src="${src}" alt="" class="mt-14 h-[360px] w-full rounded-2xl object-cover ring-1 ring-white/10" />@endif`
      : input.heroImage
        ? `<img src="${src}" alt="" class="mt-14 h-[360px] w-full rounded-2xl object-cover ring-1 ring-white/10" />`
        : ''
  const stats = input.stats?.length
    ? `<div class="max-w-7xl mx-auto px-6 pb-12 grid grid-cols-3 gap-3">${input.stats
        .map(
          (s) =>
            `<div class="rounded-2xl bg-white px-5 py-6 text-[#0f172a]"><p class="text-3xl font-black tracking-tight text-[#155dfc]">${escapeHtml(s.value)}</p><p class="mt-1 text-xs font-bold tracking-wide uppercase text-slate-500">${escapeHtml(s.label)}</p></div>`,
        )
        .join('')}</div>`
    : ''
  return `<header class="relative overflow-hidden bg-[#0f172a] text-white">
  <div class="max-w-7xl mx-auto px-6 py-20 lg:py-28">
    <p class="mb-5 text-xs font-bold tracking-[0.28em] uppercase text-[#93c5fd]">Financial audit · tax examination</p>
    <h1 class="max-w-4xl text-5xl md:text-7xl font-black leading-[0.95] tracking-tight">${title}</h1>
    <p class="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">${subtext}</p>
    <a href="${ctaHref}" class="inline-block mt-10 rounded-md px-8 py-3.5 text-sm font-bold text-white bg-[#155dfc]">${ctaText}</a>
    ${img}
  </div>
  ${stats}
</header>`
}

function buildHeroHtml(input: HeroExportInput, mode: 'html' | 'blade'): string {
  if (input.templateId === 'taxfighters') {
    return buildTaxFightersHero(input, mode)
  }
  if (input.templateId === 'aureum') {
    return buildAureumHero(input, mode)
  }
  if (input.templateId === 'flux') {
    return buildFluxHero(input, mode)
  }
  if (input.templateId === 'axiom') {
    return buildAxiomHero(input, mode)
  }
  if (input.templateId === 'helix') {
    return buildHelixHero(input, mode)
  }
  const { templateId, heroLayout, heroImage } = input
  const hasOverlay = heroUsesBackgroundImage(templateId, heroLayout)
  const wrapperClass = contentWrapperClass(templateId, heroLayout, hasOverlay)
  const textBlock = heroTextBlock(input, mode)
  const split = usesSplitColumns(templateId, heroLayout, hasOverlay) && (mode === 'blade' || heroImage)

  let inner = ''
  if (split) {
    const img = inlineHeroImage(templateId, heroLayout, heroImage, hasOverlay, mode)
    inner = `<div>${textBlock}</div>${img}`
  } else {
    const img = inlineHeroImage(templateId, heroLayout, heroImage, hasOverlay, mode)
    inner = `${textBlock}${img}`
  }

  if (hasOverlay && heroImage) {
    const src = heroImageSrc(mode, heroImage)
    const imgFilter = requireManifest(templateId).hero.grayscaleImage ? 'grayscale contrast-125' : ''
    const imageTag =
      mode === 'blade'
        ? `@if($settings->hero_image)
    <img src="${src}" alt="" class="absolute inset-0 h-full w-full object-cover ${imgFilter}" />
    <div class="absolute inset-0 ${overlayGradient(templateId)}"></div>
    @endif`
        : `<img src="${src}" alt="" class="absolute inset-0 h-full w-full object-cover ${imgFilter}" />
    <div class="absolute inset-0 ${overlayGradient(templateId)}"></div>`

    return `<header class="${headerClasses(templateId, heroLayout)}">
  ${imageTag}
  <div class="${wrapperClass}">
    ${inner}
  </div>
</header>`
  }

  return `<header class="${headerClasses(templateId, heroLayout)}">
  <div class="${wrapperClass}">
    ${inner}
  </div>
</header>`
}