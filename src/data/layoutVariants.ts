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
  const pinned: SectionId[] = ['testimonials', 'blog']
  const next: SectionId[] = order.filter((s) => !pinned.includes(s))
  const contactIdx = next.indexOf('contact')
  if (contactIdx === -1) return [...next, ...pinned]
  next.splice(contactIdx, 0, ...pinned)
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
  lawfirm: [
    buildVariant('lawfirm', 'classic', 'Classic', 'Practice areas and attorneys upfront', 'split', 'grid', 'stacked', (o) => o),
    buildVariant('lawfirm', 'modern', 'Modern', 'Case results first, split consultation form', 'split', 'list', 'split', (o) => moveSection(moveSection(o, 'showcase', 'services'), 'team', 'showcase')),
    buildVariant('lawfirm', 'bold', 'Bold', 'Commanding hero with client spotlight', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'about')),
  ],
  salon: [
    buildVariant('salon', 'classic', 'Classic', 'Service menu and gallery focused', 'centered', 'grid', 'stacked', (o) => o),
    buildVariant('salon', 'modern', 'Modern', 'Treatments first, split booking form', 'centered', 'list', 'split', (o) => moveSection(moveSection(o, 'showcase', 'hero'), 'gallery', 'showcase')),
    buildVariant('salon', 'bold', 'Bold', 'Dreamy hero with featured client glow-up', 'centered', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'gallery')),
  ],
  noir: [
    buildVariant('noir', 'classic', 'Classic', 'Gallery-first editorial runway flow', 'immersive', 'list', 'stacked', (o) => o),
    buildVariant('noir', 'modern', 'Modern', 'Collection spotlight with split contact', 'immersive', 'featured', 'split', (o) => moveSection(moveSection(o, 'showcase', 'gallery'), 'about', 'showcase')),
    buildVariant('noir', 'bold', 'Bold', 'Full-bleed hero with featured press quote', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
  ],
  terra: [
    buildVariant('terra', 'classic', 'Classic', 'Story-first artisan journey', 'split', 'grid', 'stacked', (o) => o),
    buildVariant('terra', 'modern', 'Modern', 'Shop collection early, split contact', 'centered', 'list', 'split', (o) => moveSection(moveSection(o, 'showcase', 'about'), 'gallery', 'showcase')),
    buildVariant('terra', 'bold', 'Bold', 'Immersive craft hero with maker spotlight', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'about')),
  ],
  coastal: [
    buildVariant('coastal', 'classic', 'Classic', 'Resort experiences and suites first', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('coastal', 'modern', 'Modern', 'Gallery-led escape, split booking', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'gallery', 'showcase'), 'about', 'gallery')),
    buildVariant('coastal', 'bold', 'Bold', 'Sunset hero with guest spotlight', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
  ],
  hotel: [
    buildVariant('hotel', 'classic', 'Classic', 'Skyline hero with suites and services', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('hotel', 'modern', 'Modern', 'Gallery-first property tour, split contact', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'gallery', 'showcase'), 'about', 'gallery')),
    buildVariant('hotel', 'bold', 'Bold', 'Dramatic lobby hero with guest reviews', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
  ],
  guesthouse: [
    buildVariant('guesthouse', 'classic', 'Classic', 'Story-first countryside welcome', 'split', 'grid', 'stacked', (o) => o),
    buildVariant('guesthouse', 'modern', 'Modern', 'Rooms early, garden gallery, split contact', 'centered', 'list', 'split', (o) => moveSection(moveSection(o, 'showcase', 'about'), 'gallery', 'showcase')),
    buildVariant('guesthouse', 'bold', 'Bold', 'Immersive home hero with guest love', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'about')),
  ],
  alpine: [
    buildVariant('alpine', 'classic', 'Classic', 'Peak hero with rooms and mountain services', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('alpine', 'modern', 'Modern', 'Gallery-led lodge tour, split contact', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'gallery', 'hero'), 'showcase', 'gallery')),
    buildVariant('alpine', 'bold', 'Bold', 'Full-bleed summit with guest spotlight', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
  ],
  ryokan: [
    buildVariant('ryokan', 'classic', 'Classic', 'Story-first zen welcome', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('ryokan', 'modern', 'Modern', 'Rooms early, garden gallery', 'centered', 'list', 'split', (o) => moveSection(moveSection(o, 'showcase', 'about'), 'gallery', 'showcase')),
    buildVariant('ryokan', 'bold', 'Bold', 'Dramatic garden hero with guest reflections', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'about')),
  ],
  desert: [
    buildVariant('desert', 'classic', 'Classic', 'Dune hero with suites first', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('desert', 'modern', 'Modern', 'Gallery-led oasis, split booking', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'gallery', 'showcase'), 'about', 'gallery')),
    buildVariant('desert', 'bold', 'Bold', 'Sunset hero with guest voices', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
  ],
  nordic: [
    buildVariant('nordic', 'classic', 'Classic', 'Calm hero with wellness and rooms', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('nordic', 'modern', 'Modern', 'About and spa early, split contact', 'centered', 'list', 'split', (o) => moveSection(moveSection(o, 'about', 'hero'), 'services', 'about')),
    buildVariant('nordic', 'bold', 'Bold', 'Fjord panorama with featured review', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'stats')),
  ],
  jungle: [
    buildVariant('jungle', 'classic', 'Classic', 'Canopy hero with gallery and cabins', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('jungle', 'modern', 'Modern', 'Experiences first, split contact', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'services', 'hero'), 'gallery', 'services')),
    buildVariant('jungle', 'bold', 'Bold', 'Immersive forest with guest notes', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
  ],
  vineyard: [
    buildVariant('vineyard', 'classic', 'Classic', 'Estate story and wine programs', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('vineyard', 'modern', 'Modern', 'Tasting menu up front, split contact', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'showcase', 'about'), 'team', 'showcase')),
    buildVariant('vineyard', 'bold', 'Bold', 'Vineyard panorama with sommelier quote', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'about')),
  ],
  arcade: [
    buildVariant('arcade', 'classic', 'Classic', 'Neon showcase and event grid', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('arcade', 'modern', 'Modern', 'Gallery-first hype, split contact', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'gallery', 'hero'), 'showcase', 'gallery')),
    buildVariant('arcade', 'bold', 'Bold', 'Full-screen hero with player spotlight', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
  ],
  coffee: [
    buildVariant('coffee', 'classic', 'Classic', 'Immersive hero with signature menu upfront', 'immersive', 'grid', 'stacked', (o) => o),
    buildVariant('coffee', 'modern', 'Modern', 'Gallery-first café atmosphere, split contact', 'immersive', 'list', 'split', (o) => moveSection(moveSection(o, 'gallery', 'hero'), 'showcase', 'gallery')),
    buildVariant('coffee', 'bold', 'Bold', 'Dramatic hero with featured guest review', 'immersive', 'featured', 'form-focus', (o) => moveSection(o, 'testimonials', 'showcase')),
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