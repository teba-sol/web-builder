import type { HomeSectionId } from '../data/homePageConfig'
import type {
  ContactFormStyleId,
  ContactShellId,
  ExploreLayoutId,
  FaqLayoutId,
} from '../data/sectionVariants'
import type {
  BlogListLayout,
  BlogPostLayout,
  GalleryLayout,
  NewsListLayout,
  NewsPostLayout,
  PortfolioLayout,
} from '../templates/pageLayouts'
import type { TemplateCategory } from '../types'
import type { SectionId } from './theme'

export const TEMPLATE_FEATURES = ['cms', 'hospitality'] as const
export type TemplateFeature = (typeof TEMPLATE_FEATURES)[number]

export const PAGE_VISIBILITY_KEYS = [
  'about',
  'services',
  'portfolio',
  'rooms',
  'blog',
  'news',
  'gallery',
  'contact',
] as const

export const SECTION_VISIBILITY_KEYS = [
  'stats',
  'steps',
  'team',
  'testimonials',
  'pricing',
  'faq',
  'cta',
] as const

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'business',
  'creative',
  'food',
  'health',
  'tech',
  'retail',
  'realestate',
  'hospitality',
  'finance',
]

export const SECTION_IDS: SectionId[] = [
  'nav',
  'hero',
  'stats',
  'about',
  'services',
  'steps',
  'showcase',
  'gallery',
  'testimonials',
  'blog',
  'team',
  'faq',
  'cta',
  'contact',
  'footer',
]

export const HOME_SECTION_IDS: HomeSectionId[] = [
  'nav',
  'hero',
  'stats',
  'rooms-teaser',
  'services-teaser',
  'portfolio-teaser',
  'blog-teaser',
  'news-teaser',
  'testimonials',
  'about-teaser',
  'faq',
  'contact',
  'explore',
  'footer',
]

export const FAQ_LAYOUT_IDS: FaqLayoutId[] = [
  'stacked',
  'accordion',
  'cards',
  'two-column',
  'numbered',
  'sidebar',
  'minimal',
  'boxed',
]

export const EXPLORE_LAYOUT_IDS: ExploreLayoutId[] = [
  'card-grid',
  'bento',
  'pills',
  'list-arrows',
  'strips',
  'tiles',
  'magazine',
  'compass',
]

export const CONTACT_SHELL_IDS: ContactShellId[] = [
  'split-classic',
  'full-bleed',
  'centered-elegant',
  'sidebar-panel',
  'split-dark',
  'boutique-luxe',
  'card-float',
  'minimal-split',
  'intake',
  'formal-columns',
  'salon-mirror',
  'noir-gold',
  'terra-pill',
  'coastal-wave',
  'vineyard-reserve',
  'arcade-neon',
  'coffee-warm',
]

export const CONTACT_FORM_STYLE_IDS: ContactFormStyleId[] = [
  'standard',
  'underline',
  'dark-filled',
  'soft-rounded',
  'minimal-border',
  'bold-outline',
  'elegant-serif',
  'neon-glow',
]

export const BLOG_LIST_LAYOUTS: BlogListLayout[] = ['grid', 'magazine', 'minimal']
export const BLOG_POST_LAYOUTS: BlogPostLayout[] = ['classic', 'editorial', 'split']
export const NEWS_LIST_LAYOUTS: NewsListLayout[] = ['timeline', 'grid', 'compact']
export const NEWS_POST_LAYOUTS: NewsPostLayout[] = ['classic', 'press', 'split']
export const GALLERY_LAYOUTS: GalleryLayout[] = ['grid', 'masonry', 'rows']
export const PORTFOLIO_LAYOUTS: PortfolioLayout[] = ['cards', 'case-study', 'showcase']

export const HERO_BADGE_MODES = ['name', 'established', 'none'] as const
export type HeroBadgeMode = (typeof HERO_BADGE_MODES)[number]

/** Nav chrome engines the React preview, static HTML, and Blade exporters share. */
export const NAV_SHELL_IDS = [
  'business',
  'creative',
  'restaurant',
  'saas',
  'fitness',
  'boutique',
  'realtor',
  'photography',
  'medical',
  'lawfirm',
  'cpa',
  'taxfighters',
  'aureum',
  'flux',
  'axiom',
  'helix',
  'salon',
  'noir',
  'terra',
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
] as const

export type NavShellId = (typeof NAV_SHELL_IDS)[number]
