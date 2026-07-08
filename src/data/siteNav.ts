import { getShowcaseConfig } from './sectionConfig'
import type { SectionVisibility, TemplateId } from '../types'

export type SitePageId =
  | 'home'
  | 'about'
  | 'services'
  | 'gallery'
  | 'reviews'
  | 'blog'
  | 'blog-post'
  | 'faq'
  | 'contact'

export interface SiteNavItem {
  page: SitePageId
  label: string
  segment: string
  visible: boolean
}

export function resolveSiteHref(basePath: string, href: string): string {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
    return href
  }
  const clean = href.replace(/^\//, '')
  return clean ? `${basePath}/${clean}` : basePath
}

export function getSiteNavItems(templateId: TemplateId, visibility: SectionVisibility): SiteNavItem[] {
  const showcaseCfg = getShowcaseConfig(templateId)
  const items: SiteNavItem[] = [
    { page: 'home', label: 'Home', segment: '', visible: true },
    { page: 'about', label: 'About', segment: 'about', visible: visibility.about },
    { page: 'services', label: showcaseCfg.navLabel === 'Menu' ? 'Menu' : 'Services', segment: 'services', visible: visibility.services || visibility.showcase },
    { page: 'gallery', label: 'Gallery', segment: 'gallery', visible: visibility.gallery },
    { page: 'reviews', label: 'Reviews', segment: 'reviews', visible: true },
    { page: 'blog', label: 'Blog', segment: 'blog', visible: visibility.blog },
    { page: 'faq', label: 'FAQ', segment: 'faq', visible: visibility.faq },
    { page: 'contact', label: 'Contact', segment: 'contact', visible: true },
  ]
  return items.filter((item) => item.visible)
}

export function sitePath(basePath: string, segment: string): string {
  return segment ? `${basePath}/${segment}` : basePath
}

/** Relative paths for static HTML export (from site root). */
export function staticSitePath(page: SitePageId, fromBlogPost = false): string {
  const prefix = fromBlogPost ? '..' : '.'
  switch (page) {
    case 'home': return `${prefix}/index.html`
    case 'about': return `${prefix}/about.html`
    case 'services': return `${prefix}/services.html`
    case 'gallery': return `${prefix}/gallery.html`
    case 'reviews': return `${prefix}/reviews.html`
    case 'blog': return `${prefix}/blog/index.html`
    case 'faq': return `${prefix}/faq.html`
    case 'contact': return `${prefix}/contact.html`
    default: return `${prefix}/index.html`
  }
}

export function staticBlogPostPath(slug: string, fromBlogPost = false): string {
  return fromBlogPost ? `./${slug}.html` : `./blog/${slug}.html`
}