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

const layouts: Record<TemplateId, TemplatePageLayouts> = {
  business: { blog: 'grid', blogPost: 'classic', news: 'grid', newsPost: 'classic', gallery: 'grid', portfolio: 'cards' },
  creative: { blog: 'magazine', blogPost: 'editorial', news: 'timeline', newsPost: 'press', gallery: 'masonry', portfolio: 'case-study' },
  restaurant: { blog: 'minimal', blogPost: 'classic', news: 'compact', newsPost: 'classic', gallery: 'rows', portfolio: 'showcase' },
  saas: { blog: 'grid', blogPost: 'split', news: 'grid', newsPost: 'split', gallery: 'grid', portfolio: 'cards' },
  fitness: { blog: 'grid', blogPost: 'classic', news: 'compact', newsPost: 'classic', gallery: 'grid', portfolio: 'showcase' },
  boutique: { blog: 'magazine', blogPost: 'editorial', news: 'timeline', newsPost: 'press', gallery: 'masonry', portfolio: 'case-study' },
  realtor: { blog: 'minimal', blogPost: 'split', news: 'compact', newsPost: 'classic', gallery: 'rows', portfolio: 'showcase' },
  photography: { blog: 'magazine', blogPost: 'editorial', news: 'timeline', newsPost: 'press', gallery: 'masonry', portfolio: 'case-study' },
  medical: { blog: 'grid', blogPost: 'classic', news: 'grid', newsPost: 'classic', gallery: 'grid', portfolio: 'cards' },
  lawfirm: { blog: 'minimal', blogPost: 'split', news: 'compact', newsPost: 'press', gallery: 'rows', portfolio: 'cards' },
  salon: { blog: 'magazine', blogPost: 'editorial', news: 'timeline', newsPost: 'classic', gallery: 'masonry', portfolio: 'showcase' },
  noir: { blog: 'magazine', blogPost: 'editorial', news: 'compact', newsPost: 'press', gallery: 'masonry', portfolio: 'case-study' },
  terra: { blog: 'minimal', blogPost: 'classic', news: 'timeline', newsPost: 'classic', gallery: 'grid', portfolio: 'cards' },
  coastal: { blog: 'magazine', blogPost: 'editorial', news: 'grid', newsPost: 'split', gallery: 'rows', portfolio: 'showcase' },
  vineyard: { blog: 'minimal', blogPost: 'split', news: 'timeline', newsPost: 'press', gallery: 'rows', portfolio: 'case-study' },
  arcade: { blog: 'grid', blogPost: 'split', news: 'compact', newsPost: 'split', gallery: 'grid', portfolio: 'showcase' },
}

export function getPageLayouts(templateId: TemplateId): TemplatePageLayouts {
  return layouts[templateId]
}