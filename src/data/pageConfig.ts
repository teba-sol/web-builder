import { getPopulatedGalleryEntries } from '../utils/gallery'
import { getShowcaseConfig } from './sectionConfig'
import type { PageVisibility, SiteContent, TemplateId } from '../types'

export type SitePageId =
  | 'home'
  | 'about'
  | 'services'
  | 'portfolio'
  | 'blog'
  | 'blog-post'
  | 'news'
  | 'news-post'
  | 'gallery'
  | 'contact'
  | 'rooms'
  | 'room-detail'
  | 'book'
  | 'booking-confirm'

export interface PageMeta {
  key: keyof PageVisibility
  label: string
  description: string
  segment: string
  alwaysOn?: boolean
}

export const pageMetas: PageMeta[] = [
  { key: 'about', label: 'About', description: 'Company story, mission, and team', segment: 'about' },
  { key: 'services', label: 'Services / Products', description: 'What you offer and how you work', segment: 'services' },
  { key: 'portfolio', label: 'Portfolio / Case Studies', description: 'Featured work, products, or listings', segment: 'portfolio' },
  { key: 'rooms', label: 'Rooms & Booking', description: 'Room types, availability search, and online reservations', segment: 'rooms' },
  { key: 'blog', label: 'Blog', description: 'Long-form articles and insights', segment: 'blog' },
  { key: 'news', label: 'News', description: 'Announcements, press, and updates', segment: 'news' },
  { key: 'gallery', label: 'Gallery', description: 'Photo and media showcase', segment: 'gallery' },
  { key: 'contact', label: 'Contact', description: 'Contact form and details', segment: 'contact' },
]

export const defaultPageVisibility: PageVisibility = {
  about: true,
  services: true,
  portfolio: true,
  blog: true,
  news: true,
  gallery: true,
  contact: true,
  rooms: false,
}

export function getPageNavLabel(templateId: TemplateId, key: keyof PageVisibility): string {
  const cfg = getShowcaseConfig(templateId)
  switch (key) {
    case 'services': return cfg.navLabel === 'Menu' ? 'Menu' : 'Services'
    case 'portfolio': return cfg.navLabel
    case 'rooms': return 'Book'
    default: return pageMetas.find((p) => p.key === key)?.label ?? key
  }
}

export function pageHasContent(key: keyof PageVisibility, content: SiteContent): boolean {
  switch (key) {
    case 'about': return Boolean(content.about?.trim())
    case 'services': return content.services.some((s) => s.title)
    case 'portfolio': return content.showcaseItems.some((i) => i.title)
    case 'rooms': return content.roomTypes.some((r) => r.name && r.isActive)
    case 'blog': return content.blogPosts.some((p) => p.title)
    case 'news': return content.newsPosts.some((p) => p.title)
    case 'gallery': return getPopulatedGalleryEntries(content).length > 0
    case 'contact': return true
    default: return true
  }
}

export interface SiteNavItem {
  page: SitePageId
  label: string
  segment: string
}

export function getSiteNavItems(templateId: TemplateId, content: SiteContent): SiteNavItem[] {
  const pv = content.pageVisibility
  const items: SiteNavItem[] = [{ page: 'home', label: 'Home', segment: '' }]

  for (const meta of pageMetas) {
    if (!pv[meta.key]) continue
    if (!pageHasContent(meta.key, content) && meta.key !== 'contact') continue
    const label =
      meta.key === 'rooms'
        ? 'Book'
        : getPageNavLabel(templateId, meta.key)
    items.push({
      page: meta.segment as SitePageId,
      label,
      segment: meta.segment,
    })
  }

  return items
}

export function staticSitePath(page: SitePageId, fromNested = false): string {
  const prefix = fromNested ? '..' : '.'
  const map: Record<SitePageId, string> = {
    home: `${prefix}/index.html`,
    about: `${prefix}/about.html`,
    services: `${prefix}/services.html`,
    portfolio: `${prefix}/portfolio.html`,
    blog: `${prefix}/blog/index.html`,
    'blog-post': `${prefix}/blog/index.html`,
    news: `${prefix}/news/index.html`,
    'news-post': `${prefix}/news/index.html`,
    gallery: `${prefix}/gallery.html`,
    contact: `${prefix}/contact.html`,
    rooms: `${prefix}/rooms/index.html`,
    'room-detail': `${prefix}/rooms/index.html`,
    book: `${prefix}/book/index.html`,
    'booking-confirm': `${prefix}/book/index.html`,
  }
  return map[page] ?? `${prefix}/index.html`
}

export function staticPostPath(kind: 'blog' | 'news', slug: string, fromPost = false): string {
  return fromPost ? `./${slug}.html` : `./${kind}/${slug}.html`
}