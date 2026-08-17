import { listManifests, requireManifest } from '../catalog/catalog'
import type { SectionVisibility, ShowcaseItem, TemplateId, ToggleableSection } from '../types'

export interface ShowcaseConfig {
  sectionTitle: string
  sectionSubtitle: string
  navLabel: string
  itemLabel: string
  showPrice: boolean
  priceLabel: string
  showTag: boolean
  tagLabel: string
}

export interface SectionMeta {
  key: ToggleableSection
  label: string
  description: string
}

export const defaultSectionVisibility: SectionVisibility = {
  stats: true,
  team: true,
  steps: true,
  faq: true,
  cta: true,
  testimonials: true,
  pricing: false,
}

export const sectionMetas: SectionMeta[] = [
  { key: 'stats', label: 'Trust Signals', description: 'Key numbers and partner-style stats on the home page' },
  { key: 'steps', label: 'Process', description: 'How-it-works steps on services page' },
  { key: 'team', label: 'Team', description: 'Team members on the about page' },
  { key: 'testimonials', label: 'Testimonials', description: 'Client reviews on home or about' },
  { key: 'pricing', label: 'Pricing', description: 'Pricing plans on services page' },
  { key: 'faq', label: 'FAQ', description: 'Common questions on contact page' },
  { key: 'cta', label: 'CTA Banner', description: 'Mid-page call to action' },
]

export const showcaseConfigByTemplate: Record<string, ShowcaseConfig> = Object.fromEntries(
  listManifests().map((manifest) => [manifest.id, manifest.showcase]),
)

const emptyShowcase = (): ShowcaseItem => ({
  title: '',
  description: '',
  image: '',
  price: '',
  tag: '',
  link: 'contact',
})

export function createShowcaseItems(items: Partial<ShowcaseItem>[]): ShowcaseItem[] {
  const filled = items.map((item) => ({ ...emptyShowcase(), ...item }))
  while (filled.length < 6) filled.push(emptyShowcase())
  return filled.slice(0, 6)
}

export const defaultShowcaseByTemplate: Record<string, ShowcaseItem[]> = Object.fromEntries(
  listManifests().map((manifest) => [manifest.id, manifest.defaultShowcase]),
)

export function getShowcaseConfig(templateId: TemplateId): ShowcaseConfig {
  return requireManifest(templateId).showcase
}
