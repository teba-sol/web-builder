/** Default home page section order — shared by preview, static export, and Laravel views. */
export const DEFAULT_HOME_SECTIONS = [
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
  'cookie',
] as const

export type HomeSectionId = (typeof DEFAULT_HOME_SECTIONS)[number]