export interface TemplateTheme {
  page: string
  nav: string
  navLink: string
  navCta: string
  hero: string
  heroBadge: string
  heroTitle: string
  heroText: string
  heroCta: string
  stats: string
  statValue: string
  statLabel: string
  section: string
  sectionAlt: string
  sectionTitle: string
  sectionSubtitle: string
  card: string
  cardTitle: string
  cardText: string
  aboutImage: string
  mission: string
  stepNum: string
  gallery: string
  showcase: string
  showcaseCard: string
  showcaseImage: string
  showcasePrice: string
  showcaseTag: string
  testimonial: string
  faq: string
  teamCard: string
  ctaBanner: string
  ctaBannerBtn: string
  contact: string
  contactLabel: string
  footer: string
}

export const THEME_KEYS: (keyof TemplateTheme)[] = [
  'page',
  'nav',
  'navLink',
  'navCta',
  'hero',
  'heroBadge',
  'heroTitle',
  'heroText',
  'heroCta',
  'stats',
  'statValue',
  'statLabel',
  'section',
  'sectionAlt',
  'sectionTitle',
  'sectionSubtitle',
  'card',
  'cardTitle',
  'cardText',
  'aboutImage',
  'mission',
  'stepNum',
  'gallery',
  'showcase',
  'showcaseCard',
  'showcaseImage',
  'showcasePrice',
  'showcaseTag',
  'testimonial',
  'faq',
  'teamCard',
  'ctaBanner',
  'ctaBannerBtn',
  'contact',
  'contactLabel',
  'footer',
]

export type SectionId =
  | 'nav'
  | 'hero'
  | 'stats'
  | 'about'
  | 'services'
  | 'steps'
  | 'showcase'
  | 'gallery'
  | 'testimonials'
  | 'blog'
  | 'team'
  | 'faq'
  | 'cta'
  | 'contact'
  | 'footer'
