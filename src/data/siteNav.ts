export {
  getSiteNavItems,
  staticSitePath,
  staticPostPath,
  type SiteNavItem,
  type SitePageId,
} from './pageConfig'

export { resolveSiteHref, resolveStaticHref, canLinkToPage, normalizeLinkTarget } from '../utils/linkResolver'

export function sitePath(basePath: string, segment: string): string {
  return segment ? `${basePath}/${segment}` : basePath
}

/** @deprecated Use staticPostPath('blog', slug) */
export function staticBlogPostPath(slug: string, fromBlogPost = false): string {
  return fromBlogPost ? `./${slug}.html` : `./blog/${slug}.html`
}