import { pageHasContent, type SitePageId } from '../data/pageConfig'
import { sitePath, staticPostPath, staticSitePath } from '../data/siteNav'
import type { PageVisibility, SiteContent } from '../types'

const PAGE_SEGMENTS: Record<keyof PageVisibility, string> = {
  about: 'about',
  services: 'services',
  portfolio: 'portfolio',
  blog: 'blog',
  news: 'news',
  gallery: 'gallery',
  contact: 'contact',
  rooms: 'rooms',
}

const LEGACY_HASH_TARGETS: Record<string, keyof PageVisibility | 'home' | 'book'> = {
  contact: 'contact',
  about: 'about',
  services: 'services',
  portfolio: 'portfolio',
  showcase: 'portfolio',
  gallery: 'gallery',
  blog: 'blog',
  news: 'news',
  rooms: 'rooms',
  book: 'book',
  booking: 'book',
  home: 'home',
  testimonials: 'home',
  reviews: 'home',
  faq: 'contact',
}

/** Normalize legacy hash links (#contact) and paths (/contact) to page segments. */
export function normalizeLinkTarget(href: string): string {
  const trimmed = (href || 'contact').trim()
  if (!trimmed || trimmed === '#') return 'contact'

  if (trimmed.startsWith('http') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed
  }

  if (trimmed.startsWith('#')) {
    const key = trimmed.slice(1).toLowerCase()
    const mapped = LEGACY_HASH_TARGETS[key]
    if (mapped === 'home') return ''
    if (mapped === 'book') return 'book'
    if (mapped && mapped in PAGE_SEGMENTS) return PAGE_SEGMENTS[mapped as keyof PageVisibility]
    return key
  }

  return trimmed.replace(/^\/+/, '')
}

export function isPageReachable(page: keyof PageVisibility, content: SiteContent): boolean {
  if (!content.pageVisibility[page]) return false
  return pageHasContent(page, content)
}

function fallbackPage(content: SiteContent): string {
  if (isPageReachable('contact', content)) return 'contact'
  for (const key of Object.keys(PAGE_SEGMENTS) as Array<keyof PageVisibility>) {
    if (key !== 'contact' && isPageReachable(key, content)) return PAGE_SEGMENTS[key]
  }
  return ''
}

/** Resolve in-app React Router links — never returns dead hash anchors. */
export function resolveSiteHref(basePath: string, href: string, content: SiteContent): string {
  const target = normalizeLinkTarget(href)

  if (target.startsWith('http') || target.startsWith('mailto:') || target.startsWith('tel:')) {
    return target
  }

  const postMatch = target.match(/^(blog|news)\/(.+)$/)
  if (postMatch) {
    const [, kind, slug] = postMatch
    const pageKey = kind as 'blog' | 'news'
    if (!isPageReachable(pageKey, content)) {
      return sitePath(basePath, fallbackPage(content))
    }
    return sitePath(basePath, `${kind}/${slug}`)
  }

  const roomMatch = target.match(/^rooms\/(.+)$/)
  if (roomMatch) {
    if (!isPageReachable('rooms', content)) {
      return sitePath(basePath, fallbackPage(content))
    }
    return sitePath(basePath, target)
  }

  if (target === 'book' || target.startsWith('book/')) {
    if (!isPageReachable('rooms', content)) {
      return sitePath(basePath, fallbackPage(content))
    }
    return sitePath(basePath, target)
  }

  const pageKey = Object.entries(PAGE_SEGMENTS).find(([, seg]) => seg === target)?.[0] as
    | keyof PageVisibility
    | undefined

  if (pageKey) {
    if (!isPageReachable(pageKey, content)) {
      return sitePath(basePath, fallbackPage(content))
    }
    return sitePath(basePath, target)
  }

  if (!target) return basePath
  return sitePath(basePath, target)
}

export function canLinkToPage(page: keyof PageVisibility, content: SiteContent): boolean {
  return isPageReachable(page, content)
}

/** Resolve links for static HTML export. */
export function resolveStaticHref(
  href: string,
  content: SiteContent,
  fromNested = false,
): string {
  const target = normalizeLinkTarget(href)

  if (target.startsWith('http') || target.startsWith('mailto:') || target.startsWith('tel:')) {
    return target
  }

  const postMatch = target.match(/^(blog|news)\/(.+)$/)
  if (postMatch) {
    const kind = postMatch[1] as 'blog' | 'news'
    const slug = postMatch[2]
    if (!isPageReachable(kind, content)) {
      return staticSitePath('home', fromNested)
    }
    return staticPostPath(kind, slug, fromNested)
  }

  const pageKey = Object.entries(PAGE_SEGMENTS).find(([, seg]) => seg === target)?.[0] as
    | keyof PageVisibility
    | undefined

  if (pageKey) {
    if (!isPageReachable(pageKey, content)) {
      const fb = fallbackPage(content)
      return fb ? staticSitePath(fb as SitePageId, fromNested) : staticSitePath('home', fromNested)
    }
    return staticSitePath(target as SitePageId, fromNested)
  }

  return staticSitePath('home', fromNested)
}

export function sanitizeContentLinks(content: SiteContent): SiteContent {
  return {
    ...content,
    ctaLink: normalizeLinkTarget(content.ctaLink || 'contact'),
    showcaseItems: content.showcaseItems.map((item) => ({
      ...item,
      link: item.link ? normalizeLinkTarget(item.link) : 'contact',
    })),
  }
}