import type { HomeSectionId } from '../data/homePageConfig'
import type { ColorSchemeOption } from '../data/colorSchemes'
import type { ShowcaseConfig } from '../data/sectionConfig'
import type { SectionVariantConfig } from '../data/sectionVariants'
import type { TemplatePageLayouts } from '../templates/pageLayouts'
import type {
  ContactFieldDef,
  PageVisibility,
  ShowcaseItem,
  SiteContent,
  TemplateCategory,
  TemplateMeta,
} from '../types'
import type { BlockDesign } from './blockDesign'
import type { HeroBadgeMode, NavShellId, TemplateFeature } from './vocab'
import type { SectionId, TemplateTheme } from './theme'

export const TEMPLATE_MANIFEST_SCHEMA_VERSION = 1 as const

export interface HeroConfig {
  overlay: boolean
  overlayGradient: string
  splitColumns: boolean
  badge: HeroBadgeMode
  grayscaleImage?: boolean
}

/**
 * A template is a document, not a TypeScript union.
 * JSON may only reference engines that already exist in preview + export.
 */
export interface TemplateManifest {
  schemaVersion: typeof TEMPLATE_MANIFEST_SCHEMA_VERSION
  id: string
  name: string
  description: string
  category: TemplateCategory
  previewGradient: string
  accentColor: string
  premium?: boolean
  sortOrder: number
  features: TemplateFeature[]
  pages: PageVisibility
  homeSections: HomeSectionId[]
  sectionOrder: SectionId[]
  theme: TemplateTheme
  colorSchemes: ColorSchemeOption[]
  defaultColorSchemeId?: string
  defaultLayoutVariantId?: string
  sectionVariants: SectionVariantConfig
  showcase: ShowcaseConfig
  defaultShowcase: ShowcaseItem[]
  navShell: NavShellId
  contactFields: ContactFieldDef[]
  servicesLabel: string
  pageLayouts: TemplatePageLayouts
  hero: HeroConfig
  /** Per-block layout tokens. Design only — not content. */
  blocks?: Record<string, Partial<BlockDesign>>
  defaults: SiteContent
}

export function manifestToMeta(manifest: TemplateManifest): TemplateMeta {
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    category: manifest.category,
    previewGradient: manifest.previewGradient,
    accentColor: manifest.accentColor,
    contactFields: manifest.contactFields,
    servicesLabel: manifest.servicesLabel,
    premium: manifest.premium,
  }
}
