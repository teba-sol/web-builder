import { requireManifest } from '../catalog/catalog'
import type { TemplateId } from '../types'

export type BlogListLayout = 'grid' | 'magazine' | 'minimal'
export type BlogPostLayout = 'classic' | 'editorial' | 'split'
export type NewsListLayout = 'timeline' | 'grid' | 'compact'
export type NewsPostLayout = 'classic' | 'press' | 'split'
export type GalleryLayout = 'grid' | 'masonry' | 'rows'
export type PortfolioLayout = 'cards' | 'case-study' | 'showcase'

export interface TemplatePageLayouts {
  blog: BlogListLayout
  blogPost: BlogPostLayout
  news: NewsListLayout
  newsPost: NewsPostLayout
  gallery: GalleryLayout
  portfolio: PortfolioLayout
}

export function getPageLayouts(templateId: TemplateId): TemplatePageLayouts {
  return requireManifest(templateId).pageLayouts
}
