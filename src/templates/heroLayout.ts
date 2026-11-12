import type { TemplateId } from '../types'
import type { HeroLayout } from '../data/layoutVariants'

export function heroContentWrapperClass(templateId: TemplateId, heroLayout: HeroLayout, hasOverlay: boolean): string {
  const base = 'relative mx-auto max-w-6xl px-4 sm:px-6 w-full'
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

