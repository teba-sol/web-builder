import { flowstackHeroGrid, FLOWSTACK_COPY, FLOWSTACK_MEDIA, FLOWSTACK_IMAGE, FLOWSTACK_ACTION } from '../templates/flowstackHero'
import { medicalHeroClass } from '../templates/medicalStyles'
import { heroContentWrapperClass } from '../templates/heroLayout'
import { getTheme } from '../templates/getTheme'
import { exportStaySkin } from '../templates/booking/hospitalitySkin'
import { actionBackground, accentInk } from '../utils/accentInk'
import { requireManifest } from '../catalog/catalog'
import type { HeroLayout } from '../data/layoutVariants'
import { isHospitalityTemplate } from '../data/hospitality'
import type { TemplateId } from '../types'
import { escapeHtml } from './imageUtils'

export function heroUsesBackgroundImage(templateId: TemplateId, heroLayout: HeroLayout): boolean {
  return requireManifest(templateId).hero.overlay || heroLayout === 'immersive'
}

function overlayGradient(templateId: TemplateId): string {
  return requireManifest(templateId).hero.overlayGradient
}

function headerClasses(templateId: TemplateId, heroLayout: HeroLayout, colorSchemeId?: string): string {
  const t = getTheme(templateId, colorSchemeId)
  const immersiveExtra =
    heroLayout === 'immersive' && !requireManifest(templateId).hero.overlay
      ? 'min-h-[85vh] flex flex-col justify-center'
      : ''
  return `${isHospitalityTemplate(templateId) ? 'stay-hero ' : ''}relative ${t.hero} ${immersiveExtra}`.trim()
}


function heroBadgeHtml(templateId: TemplateId, businessName: string, mode: 'html' | 'blade', colorSchemeId?: string): string {
  const manifest = requireManifest(templateId)
  const t = getTheme(templateId, colorSchemeId)
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
  colorSchemeId?: string
  heroImage: string
  businessName: string
  tagline: string
  heroSubtext: string
  ctaText: string
  ctaHref: string
  accent?: string
  stats?: { value: string; label: string }[]
}

function heroTextBlock(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const t = getTheme(input.templateId, input.colorSchemeId)
  const tagline = mode === 'html' ? escapeHtml(input.tagline) : '{{ $settings->tagline }}'
  const subtext = mode === 'html' ? escapeHtml(input.heroSubtext) : '{{ $settings->hero_subtext }}'
  const ctaText = mode === 'html' ? escapeHtml(input.ctaText) : '{{ $settings->cta_text }}'
  const ctaHref =
    mode === 'html'
      ? escapeHtml(input.ctaHref)
      : '{{ \\App\\Support\\SiteLinks::href($settings->cta_link) }}'

  return `${heroBadgeHtml(input.templateId, input.businessName, mode, input.colorSchemeId)}
      <h1 class="mb-6 ${t.heroTitle}">${tagline}</h1>
      <p class="mb-8 ${t.heroText}">${subtext}</p>
      ${isHospitalityTemplate(input.templateId) ? '' : `<a href="${ctaHref}" data-brand-cta class="inline-block ${t.heroCta}">${ctaText} →</a>`}`
}

function heroCopy(input: HeroExportInput, mode: 'html' | 'blade') {
  return {
    src: heroImageSrc(mode, input.heroImage),
    title: mode === 'html' ? escapeHtml(input.tagline) : '{{ $settings->tagline }}',
    subtext: mode === 'html' ? escapeHtml(input.heroSubtext) : '{{ $settings->hero_subtext }}',
    name: mode === 'html' ? escapeHtml(input.businessName) : '{{ $settings->business_name }}',
    ctaText: mode === 'html' ? escapeHtml(input.ctaText) : '{{ $settings->cta_text }}',
    ctaHref: mode === 'html' ? escapeHtml(input.ctaHref) : '{{ \\App\\Support\\SiteLinks::href($settings->cta_link) }}',
  }
}

function heroImg(mode: 'html' | 'blade', src: string, heroImage: string, className: string): string {
  if (mode === 'blade') return `@if($settings->hero_image)<img src="${src}" alt="" class="${className}" />@endif`
  return heroImage ? `<img src="${src}" alt="" class="${className}" />` : ''
}

function buildTaxFightersHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const h = heroCopy(input, mode)
  const img = heroImg(mode, h.src, input.heroImage, 'w-full h-full object-cover opacity-15 contrast-125 brightness-75')
  const stats = (input.stats ?? [])
    .slice(0, 3)
    .map((s) => `<div class="flex items-center gap-2.5 text-xs font-semibold text-slate-700">${escapeHtml(s.value)} ${escapeHtml(s.label)}</div>`)
    .join('')
  return `<header class="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-28 bg-slate-50">
  <div class="absolute inset-0 z-0">${img}<div class="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70"></div></div>
  <div class="relative z-10 max-w-7xl mx-auto">
    <p class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-wider text-white uppercase bg-[#E73F39]">${h.name}</p>
    <h1 class="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900">${h.title}</h1>
    <p class="mt-6 max-w-2xl text-lg text-slate-700">${h.subtext}</p>
    <a href="${h.ctaHref}" class="inline-block mt-8 rounded-xl px-8 py-4 font-extrabold text-white" style="background-color:#e60039">${h.ctaText}</a>
    <div class="grid sm:grid-cols-3 gap-4 pt-8 border-t border-slate-300 mt-8">${stats}</div>
  </div>
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
  const h = heroCopy(input, mode)
  const img = heroImg(mode, h.src, input.heroImage, 'h-full w-full object-cover')
  return `<header class="relative min-h-screen flex flex-col overflow-hidden bg-[#976DE8] text-white">
  <div class="relative z-10 max-w-[1400px] mx-auto w-full px-6 lg:px-12 py-16 grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <h1 class="text-[2.75rem] lg:text-[4rem] font-bold leading-[1.05] mb-6">${h.title}</h1>
      <p class="text-[17px] text-gray-200 mb-10 max-w-[500px]">${h.subtext}</p>
      <a href="${h.ctaHref}" class="inline-block rounded-full bg-[#6035EE] px-8 py-3 text-xs font-bold uppercase tracking-widest">${h.ctaText}</a>
    </div>
    <div class="relative h-[450px] lg:h-[600px]">
      <div class="absolute right-[5%] bottom-0 w-[75%] h-[85%] bg-[#FBD043] rounded-tl-[140px]"></div>
      <div class="relative z-10 w-[70%] h-[95%] ml-auto rounded-t-full overflow-hidden border-[6px] border-[#211543]">${img}</div>
    </div>
  </div>
</header>`
}

function buildFluxHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const h = heroCopy(input, mode)
  const img = heroImg(mode, h.src, input.heroImage, 'w-full h-full object-cover object-center')
  return `<header class="relative min-h-screen flex flex-col bg-[#141110] text-white">
  <div class="absolute inset-0 z-0">${img}<div class="absolute inset-0 bg-gradient-to-r from-[#141110] via-[#141110]/80 to-transparent"></div></div>
  <div class="relative z-10 max-w-[1400px] mx-auto w-full px-6 lg:px-12 pb-24 flex-1 flex flex-col justify-center">
    <p class="text-[13px] font-bold tracking-[0.2em] uppercase text-[#E8D9CB] mb-6">${h.name}</p>
    <h1 class="text-5xl lg:text-[5.5rem] font-bold leading-[1.05] mb-8 max-w-3xl">${h.title}</h1>
    <p class="text-lg text-[#CBBBAC] max-w-[600px] mb-10 border-l-2 pl-4" style="border-color:#FA6B34">${h.subtext}</p>
    <a href="${h.ctaHref}" class="inline-block rounded-lg px-8 py-4 font-bold text-sm text-white" style="background-color:#FA6B34">${h.ctaText}</a>
  </div>
</header>`
}

function buildAxiomHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const h = heroCopy(input, mode)
  const img = heroImg(mode, h.src, input.heroImage, 'w-full h-full object-cover')
  const stats = (input.stats ?? [])
    .slice(0, 4)
    .map((s) => `<div class="p-2"><p class="text-sm font-bold">${escapeHtml(s.value)}</p><p class="text-xs text-[#546E8A]">${escapeHtml(s.label)}</p></div>`)
    .join('')
  return `<header class="relative w-full">
  <div class="relative overflow-hidden">
    <div class="absolute inset-0">${img}<div class="absolute inset-0" style="background:linear-gradient(135deg, rgba(6,31,58,.92), rgba(11,79,138,.82))"></div></div>
    <div class="relative z-10 max-w-7xl mx-auto px-4 py-20 lg:py-28 pb-28">
      <p class="text-xs font-bold tracking-[0.25em] uppercase text-[#64B5F6] mb-4">${h.name}</p>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white max-w-2xl">${h.title}</h1>
      <p class="mt-6 max-w-lg text-blue-100/80">${h.subtext}</p>
      <a href="${h.ctaHref}" class="inline-block mt-8 rounded-lg px-7 py-3.5 text-sm font-bold text-white" style="background-color:#2196F3">${h.ctaText}</a>
    </div>
  </div>
  <div class="relative z-20 max-w-7xl mx-auto px-4 -mt-16"><div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white text-slate-900 rounded-2xl p-6 shadow-2xl">${stats}</div></div>
</header>`
}

function buildHelixHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const h = heroCopy(input, mode)
  return `<header class="bg-black text-rose-50 py-28 px-6 text-center">
  <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold uppercase tracking-widest mb-8">${h.name}</div>
  <h1 class="text-5xl sm:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto">${h.title}</h1>
  <p class="text-neutral-400 text-lg max-w-2xl mx-auto mt-8">${h.subtext}</p>
  <a href="${h.ctaHref}" class="inline-block mt-10 px-8 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm">${h.ctaText}</a>
</header>`
}

function buildCpaHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const h = heroCopy(input, mode)
  const img = heroImg(mode, h.src, input.heroImage, 'w-full h-[420px] object-cover')
  return `<header class="relative overflow-hidden text-white" style="background-color:#16302A">
  <div class="max-w-7xl mx-auto px-4 py-16 lg:py-20 grid lg:grid-cols-12 gap-10 items-center">
    <div class="lg:col-span-6">
      <p class="text-xs font-semibold text-[#DDEBD0] mb-6">${h.name}</p>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[1.05] mb-6">${h.title}</h1>
      <p class="text-[15px] text-[#C7D6C9] max-w-md mb-8">${h.subtext}</p>
      <a href="${h.ctaHref}" class="inline-flex items-center rounded-full pl-6 pr-2 py-2.5 font-bold text-sm" style="background-color:#A8D93F;color:#16302A">${h.ctaText}</a>
    </div>
    <div class="lg:col-span-6 rounded-[2rem] overflow-hidden border-4 border-white/10">${img}</div>
  </div>
</header>`
}

function buildMedicalHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const t = getTheme(input.templateId, input.colorSchemeId)
  const copy = heroCopy(input, mode)
  const media = `<div class="medical-hero-media"><img data-part="image" src="${copy.src}" alt="" class="medical-hero-image object-cover" fetchpriority="high" decoding="async" /></div>`
  return `<header class="relative isolate ${medicalHeroClass(input.heroLayout)} ${t.hero}">
  <div class="medical-hero-layout">
    <div class="medical-hero-copy">
      <p data-part="badge" class="${t.heroBadge}">${copy.name}</p>
      <h1 data-part="title" class="medical-hero-title ${t.heroTitle}">${copy.title}</h1>
      <p data-part="subtitle" class="medical-hero-description ${t.heroText}">${copy.subtext}</p>
      <a data-part="cta" data-brand-cta href="${copy.ctaHref}" class="medical-hero-action ${t.heroCta}">${copy.ctaText}<span aria-hidden="true">→</span></a>
    </div>
    ${mode === 'blade' ? `@if($settings->hero_image)${media}@endif` : input.heroImage ? media : ''}
  </div>
</header>`
}

function buildFlowstackHero(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const t = getTheme(input.templateId, input.colorSchemeId)
  const copy = heroCopy(input, mode)
  const image = `<div data-hero-media class="${FLOWSTACK_MEDIA}"><img data-part="image" src="${copy.src}" alt="" class="${FLOWSTACK_IMAGE}" fetchpriority="high" decoding="async" /></div>`
  // Laravel can remove its hero image after export; :has() is unnecessary when
  // the grid's desktop columns are emitted conditionally with the image.
  const grid = flowstackHeroGrid(input.heroLayout, mode === 'blade' || Boolean(input.heroImage))
  return `<header class="relative isolate ${t.hero} ${t.page}" style="padding-block:0">
  <div class="${grid}"${mode === 'blade' && input.heroLayout === 'split' ? ` @if(!$settings->hero_image) style="grid-template-columns:minmax(0,1fr)" @endif` : ''}>
    <div data-hero-copy class="${FLOWSTACK_COPY}">
      <p data-part="badge" class="mb-5 inline-block ${t.heroBadge}">${copy.name}</p>
      <h1 data-part="title" class="mb-6 text-balance ${t.heroTitle}">${copy.title}</h1>
      <p data-part="subtitle" class="mb-8 leading-relaxed ${t.heroText}">${copy.subtext}</p>
      <a data-part="cta" data-brand-cta href="${copy.ctaHref}" class="${FLOWSTACK_ACTION} ${t.heroCta}">${copy.ctaText}<span aria-hidden="true">→</span></a>
    </div>
    ${mode === 'blade' ? `@if($settings->hero_image)${image}@endif` : input.heroImage ? image : ''}
  </div>
</header>`
}

function buildHeroHtml(input: HeroExportInput, mode: 'html' | 'blade'): string {
  if (input.templateId === 'saas' && !heroUsesBackgroundImage(input.templateId, input.heroLayout)) return buildFlowstackHero(input, mode)
  if (input.templateId === 'medical' && input.heroLayout !== 'immersive') return buildMedicalHero(input, mode)
  if (input.templateId === 'taxfighters') return buildTaxFightersHero(input, mode)
  if (input.templateId === 'aureum') return buildAureumHero(input, mode)
  if (input.templateId === 'flux') return buildFluxHero(input, mode)
  if (input.templateId === 'axiom') return buildAxiomHero(input, mode)
  if (input.templateId === 'helix') return buildHelixHero(input, mode)
  if (input.templateId === 'cpa') return buildCpaHero(input, mode)
  const { templateId, heroLayout, heroImage } = input
  const hasOverlay = heroUsesBackgroundImage(templateId, heroLayout)
  const wrapperClass = heroContentWrapperClass(templateId, heroLayout, hasOverlay)
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

    return `<header class="${headerClasses(templateId, heroLayout, input.colorSchemeId)}">
  ${imageTag}
  <div class="${wrapperClass}">
    ${inner}${hospitalitySearch(templateId, mode, input.accent)}
  </div>
</header>`
  }

  return `<header class="${headerClasses(templateId, heroLayout, input.colorSchemeId)}">
  <div class="${wrapperClass}">
    ${inner}${hospitalitySearch(templateId, mode, input.accent)}
  </div>
</header>`
}

function hospitalitySearch(templateId: TemplateId, mode: 'html' | 'blade', accent?: string): string {
  if (!isHospitalityTemplate(templateId)) return ''
  if (mode === 'blade') {
    return `\n    @include('partials.hero-stay-search')`
  }
  const skin = exportStaySkin(templateId)
  const color = actionBackground(accent ?? requireManifest(templateId).colorSchemes[0]?.swatches[1] ?? '#0f172a')
  return `
    <form action="rooms/index.html" method="get" class="mt-8 ${skin.search}">
      <label class="block min-w-0 text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-in</span><input type="date" name="check_in" required class="${skin.input} h-12 min-w-0 text-sm outline-none focus:ring-2 focus:ring-slate-400/30" /></label>
      <label class="block min-w-0 text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-out</span><input type="date" name="check_out" required class="${skin.input} h-12 min-w-0 text-sm outline-none focus:ring-2 focus:ring-slate-400/30" /></label>
      <label class="block min-w-0 text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Adults</span><input type="number" name="adults" min="1" value="2" required class="${skin.input} h-12 min-w-0 text-sm outline-none focus:ring-2 focus:ring-slate-400/30" /></label>
      <label class="block min-w-0 text-sm"><span class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Children</span><input type="number" name="children" min="0" value="0" required class="${skin.input} h-12 min-w-0 text-sm outline-none focus:ring-2 focus:ring-slate-400/30" /></label>
      <button type="submit" class="${skin.button.replace(/\btext-white\b/, accentInk(color))} inline-flex h-12 w-full items-center justify-center gap-2 self-end whitespace-nowrap shadow-sm hover:brightness-110 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 md:col-span-2 lg:col-span-1" style="background-color:${color}">Search</button>
    </form>`
}
