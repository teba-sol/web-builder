import { requireManifest } from '../catalog/catalog'
import type { TemplateId } from '../types'
import type { SectionId } from '../templates/themes'

/** Shared look-and-feel variants — same set on every template. */
export type LayoutVariantId = 'classic' | 'modern' | 'luxury'

export type HeroLayout = 'split' | 'centered' | 'immersive'
export type TestimonialLayout = 'grid' | 'featured' | 'list'
export type ContactLayout = 'split' | 'stacked' | 'form-focus'

export interface LayoutVariant {
  id: LayoutVariantId
  name: string
  description: string
  /** Template section order (unchanged by variant — content structure stays fixed). */
  sectionOrder: SectionId[]
  heroLayout: HeroLayout
  testimonialLayout: TestimonialLayout
  contactLayout: ContactLayout
  /** CSS shell class for spacing, radius, typography density. */
  shellClass: string
}

export const LAYOUT_VARIANT_IDS: LayoutVariantId[] = ['classic', 'modern', 'luxury']

export interface LayoutVariantPreset {
  name: string
  description: string
  heroLayout: HeroLayout
  testimonialLayout: TestimonialLayout
  contactLayout: ContactLayout
  shellClass: string
}

/**
 * Presentation presets only.
 * - Does not change copy, colors (theme), or which template is used.
 * - Does not reorder sections / content structure.
 * - Exported into Laravel so admin can switch variants at runtime.
 */
export const LAYOUT_VARIANT_PRESETS: Record<LayoutVariantId, LayoutVariantPreset> = {
  classic: {
    name: 'Classic',
    description: 'Timeless, balanced structure — traditional split hero and grid reviews',
    heroLayout: 'split',
    testimonialLayout: 'grid',
    contactLayout: 'stacked',
    shellClass: 'layout-classic',
  },
  modern: {
    name: 'Modern',
    description: 'Clean geometric feel — centered hero, list reviews, split contact',
    heroLayout: 'centered',
    testimonialLayout: 'list',
    contactLayout: 'split',
    shellClass: 'layout-modern',
  },
  luxury: {
    name: 'Luxury',
    description: 'Premium spacious presentation — immersive hero and featured reviews',
    heroLayout: 'immersive',
    testimonialLayout: 'featured',
    contactLayout: 'form-focus',
    shellClass: 'layout-luxury',
  },
}

function ensureReviewsBeforeContact(order: SectionId[]): SectionId[] {
  const pinned: SectionId[] = ['testimonials', 'blog']
  const next: SectionId[] = order.filter((s) => !pinned.includes(s))
  const contactIdx = next.indexOf('contact')
  if (contactIdx === -1) return [...next, ...pinned]
  next.splice(contactIdx, 0, ...pinned)
  return next
}

/** Map legacy / typo ids onto the current three variants. */
export function normalizeLayoutVariantId(variantId?: string | null): LayoutVariantId {
  if (!variantId) return 'classic'
  if (variantId === 'bold' || variantId === 'lexury' || variantId === 'luxe') return 'luxury'
  if (variantId === 'classic' || variantId === 'modern' || variantId === 'luxury') return variantId
  return 'classic'
}

export function getLayoutVariants(templateId: TemplateId): LayoutVariant[] {
  // Section order is always the template’s base order — variants never reshuffle content.
  const sectionOrder = ensureReviewsBeforeContact([...requireManifest(templateId).sectionOrder])

  return LAYOUT_VARIANT_IDS.map((id) => {
    const preset = LAYOUT_VARIANT_PRESETS[id]
    return {
      id,
      name: preset.name,
      description: preset.description,
      sectionOrder,
      heroLayout: preset.heroLayout,
      testimonialLayout: preset.testimonialLayout,
      contactLayout: preset.contactLayout,
      shellClass: preset.shellClass,
    }
  })
}

export function getLayoutVariant(templateId: TemplateId, variantId?: string): LayoutVariant {
  const id = normalizeLayoutVariantId(variantId)
  const variants = getLayoutVariants(templateId)
  return variants.find((v) => v.id === id) ?? variants[0]
}

export function getDefaultLayoutVariantId(_templateId?: TemplateId): LayoutVariantId {
  return 'classic'
}

export function isValidLayoutVariant(_templateId: TemplateId, variantId: string): boolean {
  return LAYOUT_VARIANT_IDS.includes(normalizeLayoutVariantId(variantId))
}
