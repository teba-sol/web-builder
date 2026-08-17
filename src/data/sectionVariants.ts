import { requireManifest } from '../catalog/catalog'
import type { TemplateId } from '../types'

export type FaqLayoutId =
  | 'stacked'
  | 'accordion'
  | 'cards'
  | 'two-column'
  | 'numbered'
  | 'sidebar'
  | 'minimal'
  | 'boxed'

export type ExploreLayoutId =
  | 'card-grid'
  | 'bento'
  | 'pills'
  | 'list-arrows'
  | 'strips'
  | 'tiles'
  | 'magazine'
  | 'compass'

export type ContactShellId =
  | 'split-classic'
  | 'full-bleed'
  | 'centered-elegant'
  | 'sidebar-panel'
  | 'split-dark'
  | 'boutique-luxe'
  | 'card-float'
  | 'minimal-split'
  | 'intake'
  | 'formal-columns'
  | 'salon-mirror'
  | 'noir-gold'
  | 'terra-pill'
  | 'coastal-wave'
  | 'vineyard-reserve'
  | 'arcade-neon'
  | 'coffee-warm'

export type ContactFormStyleId =
  | 'standard'
  | 'underline'
  | 'dark-filled'
  | 'soft-rounded'
  | 'minimal-border'
  | 'bold-outline'
  | 'elegant-serif'
  | 'neon-glow'

export interface SectionVariantConfig {
  faq: FaqLayoutId
  explore: ExploreLayoutId
  contactShell: ContactShellId
  contactForm: ContactFormStyleId
  exploreTitle: string
  exploreSubtitle: string
  exploreLinkLabel: string
}

export function getSectionVariants(templateId: TemplateId): SectionVariantConfig {
  return requireManifest(templateId).sectionVariants
}
