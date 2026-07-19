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

const sectionVariants: Record<TemplateId, SectionVariantConfig> = {
  business: {
    faq: 'stacked',
    explore: 'card-grid',
    contactShell: 'split-classic',
    contactForm: 'standard',
    exploreTitle: 'Company',
    exploreSubtitle: 'Find services, case studies, and ways to work with us',
    exploreLinkLabel: 'Open',
  },
  creative: {
    faq: 'accordion',
    explore: 'bento',
    contactShell: 'full-bleed',
    contactForm: 'underline',
    exploreTitle: 'Studio',
    exploreSubtitle: 'Jump between projects, process, and client stories',
    exploreLinkLabel: 'View',
  },
  restaurant: {
    faq: 'cards',
    explore: 'pills',
    contactShell: 'centered-elegant',
    contactForm: 'soft-rounded',
    exploreTitle: 'The House',
    exploreSubtitle: 'Menu, gallery, reservations, and our story',
    exploreLinkLabel: 'Visit',
  },
  saas: {
    faq: 'two-column',
    explore: 'list-arrows',
    contactShell: 'sidebar-panel',
    contactForm: 'minimal-border',
    exploreTitle: 'Product',
    exploreSubtitle: 'Features, pricing, docs, and product updates',
    exploreLinkLabel: 'Go to',
  },
  fitness: {
    faq: 'numbered',
    explore: 'strips',
    contactShell: 'split-dark',
    contactForm: 'bold-outline',
    exploreTitle: 'Train',
    exploreSubtitle: 'Programs, schedules, results, and membership',
    exploreLinkLabel: 'Start',
  },
  boutique: {
    faq: 'minimal',
    explore: 'magazine',
    contactShell: 'boutique-luxe',
    contactForm: 'elegant-serif',
    exploreTitle: 'Collection',
    exploreSubtitle: 'Curated pieces, lookbook, and personal styling',
    exploreLinkLabel: 'Discover',
  },
  realtor: {
    faq: 'boxed',
    explore: 'compass',
    contactShell: 'card-float',
    contactForm: 'standard',
    exploreTitle: 'Properties',
    exploreSubtitle: 'Listings, neighborhoods, and market insights',
    exploreLinkLabel: 'Browse',
  },
  photography: {
    faq: 'sidebar',
    explore: 'tiles',
    contactShell: 'minimal-split',
    contactForm: 'underline',
    exploreTitle: 'Archive',
    exploreSubtitle: 'Portfolios, sessions, prints, and booking',
    exploreLinkLabel: 'See',
  },
  medical: {
    faq: 'accordion',
    explore: 'list-arrows',
    contactShell: 'intake',
    contactForm: 'soft-rounded',
    exploreTitle: 'Patient Care',
    exploreSubtitle: 'Services, providers, insurance, and appointments',
    exploreLinkLabel: 'Learn',
  },
  lawfirm: {
    faq: 'numbered',
    explore: 'magazine',
    contactShell: 'formal-columns',
    contactForm: 'minimal-border',
    exploreTitle: 'Practice Areas',
    exploreSubtitle: 'Expertise, attorneys, insights, and consultations',
    exploreLinkLabel: 'Read',
  },
  salon: {
    faq: 'cards',
    explore: 'pills',
    contactShell: 'salon-mirror',
    contactForm: 'soft-rounded',
    exploreTitle: 'Services',
    exploreSubtitle: 'Treatments, stylists, gallery, and booking',
    exploreLinkLabel: 'Book',
  },
  noir: {
    faq: 'minimal',
    explore: 'strips',
    contactShell: 'noir-gold',
    contactForm: 'dark-filled',
    exploreTitle: 'Experience',
    exploreSubtitle: 'Private offerings, gallery, and reservations',
    exploreLinkLabel: 'Enter',
  },
  terra: {
    faq: 'boxed',
    explore: 'bento',
    contactShell: 'terra-pill',
    contactForm: 'bold-outline',
    exploreTitle: 'Land & Craft',
    exploreSubtitle: 'Workshops, goods, stories, and visits',
    exploreLinkLabel: 'Explore',
  },
  coastal: {
    faq: 'accordion',
    explore: 'tiles',
    contactShell: 'coastal-wave',
    contactForm: 'soft-rounded',
    exploreTitle: 'Shoreline',
    exploreSubtitle: 'Rooms, experiences, gallery, and local guides',
    exploreLinkLabel: 'Sail to',
  },
  hotel: {
    faq: 'boxed',
    explore: 'tiles',
    contactShell: 'split-dark',
    contactForm: 'soft-rounded',
    exploreTitle: 'The Hotel',
    exploreSubtitle: 'Rooms, dining, spa, and reservations',
    exploreLinkLabel: 'Explore',
  },
  guesthouse: {
    faq: 'stacked',
    explore: 'compass',
    contactShell: 'coffee-warm',
    contactForm: 'soft-rounded',
    exploreTitle: 'The House',
    exploreSubtitle: 'Rooms, garden, stories, and stay with us',
    exploreLinkLabel: 'Visit',
  },
  alpine: {
    faq: 'numbered',
    explore: 'tiles',
    contactShell: 'split-dark',
    contactForm: 'bold-outline',
    exploreTitle: 'The Lodge',
    exploreSubtitle: 'Rooms, spa, dining, and book your peak stay',
    exploreLinkLabel: 'Explore',
  },
  ryokan: {
    faq: 'minimal',
    explore: 'magazine',
    contactShell: 'noir-gold',
    contactForm: 'elegant-serif',
    exploreTitle: 'The Ryokan',
    exploreSubtitle: 'Rooms, onsen, garden, and reserve',
    exploreLinkLabel: 'Enter',
  },
  desert: {
    faq: 'cards',
    explore: 'bento',
    contactShell: 'coastal-wave',
    contactForm: 'soft-rounded',
    exploreTitle: 'The Oasis',
    exploreSubtitle: 'Suites, spa, dining, and book your escape',
    exploreLinkLabel: 'Wander',
  },
  nordic: {
    faq: 'accordion',
    explore: 'list-arrows',
    contactShell: 'minimal-split',
    contactForm: 'underline',
    exploreTitle: 'The House',
    exploreSubtitle: 'Rooms, spa, dining, and book rest',
    exploreLinkLabel: 'Discover',
  },
  jungle: {
    faq: 'boxed',
    explore: 'strips',
    contactShell: 'terra-pill',
    contactForm: 'soft-rounded',
    exploreTitle: 'The Canopy',
    exploreSubtitle: 'Cabins, trails, dining, and book',
    exploreLinkLabel: 'Enter',
  },
  vineyard: {
    faq: 'cards',
    explore: 'magazine',
    contactShell: 'vineyard-reserve',
    contactForm: 'elegant-serif',
    exploreTitle: 'Estate',
    exploreSubtitle: 'Wines, tastings, events, and visits',
    exploreLinkLabel: 'Taste',
  },
  arcade: {
    faq: 'numbered',
    explore: 'pills',
    contactShell: 'arcade-neon',
    contactForm: 'neon-glow',
    exploreTitle: 'Levels',
    exploreSubtitle: 'Games, merch, news, and join the crew',
    exploreLinkLabel: 'Play',
  },
  coffee: {
    faq: 'stacked',
    explore: 'compass',
    contactShell: 'coffee-warm',
    contactForm: 'soft-rounded',
    exploreTitle: 'The Café',
    exploreSubtitle: 'Menu, beans, events, and visit us',
    exploreLinkLabel: 'Order',
  },
}

export function getSectionVariants(templateId: TemplateId): SectionVariantConfig {
  return sectionVariants[templateId]
}