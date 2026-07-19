import type { HeroLayout } from '../data/layoutVariants'
import { themes } from '../templates/themes'
import type { TemplateId } from '../types'
import { escapeHtml } from './imageUtils'

const OVERLAY_VARIANTS: TemplateId[] = [
  'creative',
  'restaurant',
  'fitness',
  'realtor',
  'photography',
  'noir',
  'coastal',
  'vineyard',
  'arcade',
  'coffee',
  'hotel',
  'guesthouse',
  'alpine',
  'ryokan',
  'desert',
  'nordic',
  'jungle',
]

export function heroUsesBackgroundImage(templateId: TemplateId, heroLayout: HeroLayout): boolean {
  return OVERLAY_VARIANTS.includes(templateId) || heroLayout === 'immersive'
}

function overlayGradient(templateId: TemplateId): string {
  switch (templateId) {
    case 'creative':
      return 'bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent'
    case 'restaurant':
      return 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
    case 'fitness':
      return 'bg-gradient-to-r from-black via-black/80 to-transparent'
    case 'realtor':
      return 'bg-black/40'
    case 'noir':
      return 'bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/30'
    case 'coastal':
    case 'hotel':
      return 'bg-gradient-to-t from-sky-950/90 via-sky-900/40 to-transparent'
    case 'alpine':
      return 'bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent'
    case 'ryokan':
      return 'bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent'
    case 'desert':
      return 'bg-gradient-to-t from-amber-950/95 via-orange-900/40 to-transparent'
    case 'nordic':
      return 'bg-gradient-to-t from-teal-950/90 via-slate-900/40 to-transparent'
    case 'jungle':
      return 'bg-gradient-to-t from-emerald-950 via-lime-950/50 to-transparent'
    case 'vineyard':
      return 'bg-gradient-to-r from-rose-950/90 via-rose-900/50 to-transparent'
    case 'arcade':
      return 'bg-gradient-to-br from-fuchsia-950/80 via-black/70 to-lime-950/40'
    case 'coffee':
    case 'guesthouse':
      return 'bg-gradient-to-r from-[#1a0f08]/95 via-[#2d1810]/75 to-[#1a0f08]/40'
    default:
      return 'bg-black/30'
  }
}

function headerClasses(templateId: TemplateId, heroLayout: HeroLayout): string {
  const t = themes[templateId]
  const immersiveExtra =
    heroLayout === 'immersive' && !OVERLAY_VARIANTS.includes(templateId)
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
  const t = themes[templateId]
  const name = mode === 'html' ? escapeHtml(businessName) : '{{ $settings->business_name }}'
  if (templateId === 'restaurant') {
    return `<p class="mb-3 ${t.heroBadge}">Est. 2010</p>`
  }
  if (templateId === 'photography') {
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
  } else if (heroLayout !== 'immersive' && heroLayout !== 'centered' && !OVERLAY_VARIANTS.includes(templateId)) {
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
}

function heroTextBlock(input: HeroExportInput, mode: 'html' | 'blade'): string {
  const t = themes[input.templateId]
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
      <a href="${ctaHref}" class="inline-block ${t.heroCta}">${ctaText} →</a>`
}

function usesSplitColumns(templateId: TemplateId, heroLayout: HeroLayout, hasOverlay: boolean): boolean {
  if (hasOverlay || heroLayout === 'centered' || heroLayout === 'immersive') return false
  return ['business', 'saas', 'medical', 'lawfirm', 'terra'].includes(templateId)
}

export function buildStaticHeroHtml(input: HeroExportInput): string {
  return buildHeroHtml(input, 'html')
}

export function buildBladeHeroHtml(input: HeroExportInput): string {
  return buildHeroHtml(input, 'blade')
}

function buildHeroHtml(input: HeroExportInput, mode: 'html' | 'blade'): string {
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
    const imgFilter = templateId === 'noir' ? 'grayscale contrast-125' : ''
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