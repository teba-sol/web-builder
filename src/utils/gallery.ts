import type { GalleryItem, SiteContent } from '../types'

export const emptyGalleryItem = (): GalleryItem => ({
  image: '',
  title: '',
  category: '',
})

/** Normalize gallery entries from `galleryItems` when present, falling back to `galleryImages`. */
export function getGalleryEntries(
  content: Pick<SiteContent, 'galleryImages' | 'galleryItems'>,
): GalleryItem[] {
  if (Array.isArray(content.galleryItems) && content.galleryItems.length > 0) {
    return content.galleryItems.map((item) => ({
      image: typeof item?.image === 'string' ? item.image : '',
      title: typeof item?.title === 'string' ? item.title : '',
      category: typeof item?.category === 'string' ? item.category : '',
    }))
  }
  return (content.galleryImages ?? []).map((image) => ({
    image: typeof image === 'string' ? image : '',
    title: '',
    category: '',
  }))
}

export function getPopulatedGalleryEntries(
  content: Pick<SiteContent, 'galleryImages' | 'galleryItems'>,
): GalleryItem[] {
  return getGalleryEntries(content).filter((item) => item.image.trim() !== '')
}

export interface GalleryGroup {
  category: string
  items: GalleryItem[]
}

/** Group populated gallery entries by category order; returns empty category when uncategorized. */
export function groupGalleryEntries(entries: GalleryItem[]): {
  categories: string[]
  groups: GalleryGroup[]
} {
  const hasCategories = entries.some((item) => item.category.trim() !== '')
  if (!hasCategories) {
    return { categories: [], groups: [{ category: '', items: entries }] }
  }

  const order: string[] = []
  const byCategory = new Map<string, GalleryItem[]>()

  for (const item of entries) {
    const category = item.category.trim() || 'Other Photos'
    if (!byCategory.has(category)) {
      byCategory.set(category, [])
      order.push(category)
    }
    byCategory.get(category)!.push(item)
  }

  return {
    categories: order,
    groups: order.map((category) => ({
      category,
      items: byCategory.get(category) ?? [],
    })),
  }
}
