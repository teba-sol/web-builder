import type { TemplateId } from '../types'
import { sectionOrders, type SectionId } from '../templates/themes'

export type HeroLayout = 'split' | 'centered' | 'immersive'
export type TestimonialLayout = 'grid' | 'featured' | 'list'
export type ContactLayout = 'split' | 'stacked' | 'form-focus'

export interface LayoutVariant {
  id: string
  name: string
  description: string
  sectionOrder: SectionId[]
  heroLayout: HeroLayout
  testimonialLayout: TestimonialLayout
  contactLayout: ContactLayout
}

function moveSection(order: SectionId[], section: SectionId, after: SectionId): SectionId[] {
  const next = order.filter((s) => s !== section)
  const idx = next.indexOf(after)
  if (idx === -1) return order
  next.splice(idx + 1, 0, section)
  return next
}

function ensureReviewsBeforeContact(order: SectionId[]): SectionId[] {
  const next: SectionId[] = order.filter((s) => s !== 'testimonials')
  const contactIdx = next.indexOf('contact')
  if (contactIdx === -1) return [...next, 'testimonials']
  next.splice(contactIdx, 0, 'testimonials')
  return next
}

function buildVariant(
  templateId: TemplateId,
  id: string,
  name: string,
  description: string,
  heroLayout: HeroLayout,
  testimonialLayout: TestimonialLayout,
  contactLayout: ContactLayout,
  transform: (base: SectionId[]) => SectionId[],
): LayoutVariant {
  const base = sectionOrders[templateId]
  return {
    id,
    name,
    description,
    sectionOrder: ensureReviewsBeforeContact(transform([...base])),
    heroLayout,
    testimonialLayout,
    contactLayout,
  }
}

const variantBuilders: Record<TemplateId, LayoutVariant[]> = {
  business: [
    buildVariant('business', 'classic', 'Classic', 'Balanced corporate flow with stats and showcase', 'split', 'grid', 'stacked', (o) => o),
    buildVariant('business', 'modern', 'Modern', 'Showcase and gallery up front, split contact form', 'split', 'list', 'split', (o) => moveSection(moveSection(o, 'gallery', 'showcase'), 'showcase', 'hero')),
    buildVariant('business', 'bold', 'Bold', 'Immersive hero with featured client reviews', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'about')),
  ],
  creative: [
    buildVariant('creative', 'classic', 'Classic', 'Gallery-first creative portfolio flow', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('creative', 'modern', 'Modern', 'Projects before story, list-style reviews', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'about', 'showcase'), 'services', 'about')),
    buildVariant('creative', 'bold', 'Bold', 'Full-screen hero with featured testimonial', 'immersive', 'featured', 'form-focus', (o) => moveSection(moveSection(o, 'testimonials', 'showcase'), 'cta', 'testimonials')),
  ],
  restaurant: [
    buildVariant('restaurant', 'classic', 'Classic', 'Menu-first dining experience', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('restaurant', 'modern', 'Modern', 'Gallery and menu highlighted, split contact', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'gallery', 'showcase'), 'about', 'gallery')),
    buildVariant('restaurant', 'bold', 'Bold', 'Dramatic hero with featured diner review', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
  ],
  saas: [
    buildVariant('saas', 'classic', 'Classic', 'Features and pricing focused', 'split', 'grid', 'stacked', (o) => o),
    buildVariant('saas', 'modern', 'Modern', 'Pricing up front, split contact with form', 'split', 'list', 'split', (o) => moveSection(moveSection(o, 'showcase', 'hero'), 'services', 'showcase')),
    buildVariant('saas', 'bold', 'Bold', 'Product-led with featured social proof', 'centered', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
  ],
  fitness: [
    buildVariant('fitness', 'classic', 'Classic', 'Programs and plans upfront', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('fitness', 'modern', 'Modern', 'Membership plans first, split contact', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'showcase', 'hero'), 'gallery', 'showcase')),
    buildVariant('fitness', 'bold', 'Bold', 'High-energy hero with member spotlight', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
  ],
  boutique: [
    buildVariant('boutique', 'classic', 'Classic', 'Shop collection and editorial gallery', 'centered', 'grid', 'stacked', (o) => o),
    buildVariant('boutique', 'modern', 'Modern', 'Products first, elegant split contact', 'centered', 'list', 'split', (o) => moveSection(moveSection(o, 'gallery', 'showcase'), 'services', 'gallery')),
    buildVariant('boutique', 'bold', 'Bold', 'Lookbook hero with featured review', 'centered', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'gallery')),
  ],
  realtor: [
    buildVariant('realtor', 'classic', 'Classic', 'Listings-first luxury real estate', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('realtor', 'modern', 'Modern', 'Properties and gallery lead, split contact', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'gallery', 'showcase'), 'about', 'services')),
    buildVariant('realtor', 'bold', 'Bold', 'Cinematic hero with client spotlight', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'stats')),
  ],
  photography: [
    buildVariant('photography', 'classic', 'Classic', 'Portfolio gallery with packages', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('photography', 'modern', 'Modern', 'Packages early, split booking form', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'showcase', 'gallery'), 'services', 'showcase')),
    buildVariant('photography', 'bold', 'Bold', 'Fullscreen work with featured review', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'gallery')),
  ],
  medical: [
    buildVariant('medical', 'classic', 'Classic', 'Trust-building care services flow', 'split', 'grid', 'stacked', (o) => o),
    buildVariant('medical', 'modern', 'Modern', 'Programs and team up front, split form', 'split', 'list', 'split', (o) => moveSection(moveSection(o, 'showcase', 'services'), 'team', 'showcase')),
    buildVariant('medical', 'bold', 'Bold', 'Welcoming hero with patient spotlight', 'split', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'about')),
  ],
}

export function getLayoutVariants(templateId: TemplateId): LayoutVariant[] {
  return variantBuilders[templateId]
}

export function getLayoutVariant(templateId: TemplateId, variantId?: string): LayoutVariant {
  const variants = getLayoutVariants(templateId)
  return variants.find((v) => v.id === variantId) ?? variants[0]
}

export function getDefaultLayoutVariantId(_templateId: TemplateId): string {
  return 'classic'
}

export function isValidLayoutVariant(templateId: TemplateId, variantId: string): boolean {
  return getLayoutVariants(templateId).some((v) => v.id === variantId)
}