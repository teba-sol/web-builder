import { knownHotelAmenities, knownRoomAmenities } from '../data/amenityCatalog'
import { contactButtonLabel } from '../data/footer'
import { clampVisibilityToProfile } from '../data/editorProfile'
import { emptyRoomType, parseAmenities, stayCurrency } from '../data/hospitality'
import { defaultPageVisibility } from '../data/pageConfig'
import { mergeRichContent } from '../data/richDefaults'
import {
  defaultSectionVisibility,
  defaultShowcaseByTemplate,
  showcaseConfigByTemplate,
} from '../data/sectionConfig'
import type { PageVisibility, RoomTypeItem, SectionVisibility, SiteContent, TemplateId } from '../types'
import { sanitizeContentLinks } from './linkResolver'
import { slugify } from './slugify'

function migrateRoom(room: Omit<Partial<RoomTypeItem>, 'amenities' | 'photos'> & {
  image?: unknown
  amenities?: unknown
  photos?: unknown
}): RoomTypeItem {
  const base = emptyRoomType()
  const legacyImage = typeof room.image === 'string' ? room.image : ''
  const photos = Array.isArray(room.photos)
    ? room.photos.filter((photo): photo is string => typeof photo === 'string' && photo.trim() !== '')
    : []
  if (photos.length === 0 && legacyImage) photos.push(legacyImage)
  const name = typeof room.name === 'string' ? room.name : ''
  const rawAmenities = typeof room.amenities === 'string'
    ? parseAmenities(room.amenities)
    : Array.isArray(room.amenities)
      ? room.amenities.filter((item): item is string => typeof item === 'string')
      : parseAmenities(base.amenities)
  return {
    ...base,
    name,
    slug: typeof room.slug === 'string' && room.slug ? room.slug : slugify(name),
    description: typeof room.description === 'string' ? room.description : '',
    basePrice: typeof room.basePrice === 'string' ? room.basePrice : base.basePrice,
    discountPercent: typeof room.discountPercent === 'string' ? room.discountPercent : '0',
    currency: stayCurrency(typeof room.currency === 'string' ? room.currency : base.currency),
    maxAdults: typeof room.maxAdults === 'string' ? room.maxAdults : base.maxAdults,
    maxChildren: typeof room.maxChildren === 'string' ? room.maxChildren : base.maxChildren,
    bedConfiguration: typeof room.bedConfiguration === 'string' ? room.bedConfiguration : base.bedConfiguration,
    sizeSqm: typeof room.sizeSqm === 'string' ? room.sizeSqm : base.sizeSqm,
    amenities: knownRoomAmenities(rawAmenities).join(', '),
    photos,
    unitCount: typeof room.unitCount === 'string' ? room.unitCount : base.unitCount,
    unitPrefix: typeof room.unitPrefix === 'string' ? room.unitPrefix : base.unitPrefix,
    isActive: room.isActive !== false,
    freeCancellation: room.freeCancellation === true,
    freeBreakfast: room.freeBreakfast === true,
  }
}

function migrateSectionVisibility(raw: Partial<SectionVisibility> & Record<string, boolean | undefined>): SectionVisibility {
  const legacy = { ...raw }
  return {
    stats: legacy.stats ?? true,
    team: legacy.team ?? true,
    steps: legacy.steps ?? true,
    faq: legacy.faq ?? true,
    cta: legacy.cta ?? true,
    testimonials: legacy.testimonials ?? true,
    pricing: legacy.pricing ?? false,
  }
}

function migratePageVisibility(
  rawContent: Partial<SiteContent>,
  legacySections: Record<string, boolean | undefined>,
): PageVisibility {
  const existing = rawContent.pageVisibility
  if (existing) {
    return { ...defaultPageVisibility, ...existing }
  }
  return {
    about: legacySections.about ?? true,
    services: legacySections.services ?? true,
    portfolio: legacySections.showcase ?? legacySections.portfolio ?? true,
    blog: legacySections.blog ?? true,
    news: legacySections.news ?? true,
    gallery: legacySections.gallery ?? true,
    contact: legacySections.contact ?? true,
    rooms: legacySections.rooms ?? false,
  }
}

export function migrateContent(raw: Partial<SiteContent>, templateId?: TemplateId): SiteContent {
  const merged = mergeRichContent(raw)
  const id = templateId ?? 'business'
  const cfg = showcaseConfigByTemplate[id]

  const legacyVisibility = { ...(raw.sectionVisibility as Record<string, boolean | undefined> | undefined) }

  const result: SiteContent = {
    ...merged,
    contactSectionTitle: raw.contactSectionTitle || merged.contactSectionTitle,
    contactFormTitle: raw.contactFormTitle || merged.contactFormTitle,
    contactFormUrl: raw.contactFormUrl ?? merged.contactFormUrl,
    contactFormButtonText: contactButtonLabel(raw.contactFormButtonText || merged.contactFormButtonText),
    footerBlurb: raw.footerBlurb ?? merged.footerBlurb ?? '',
    footerNote: raw.footerNote || merged.footerNote || 'All rights reserved.',
    mapUrl: raw.mapUrl ?? merged.mapUrl ?? '',
    pageVisibility: migratePageVisibility(raw, legacyVisibility),
    sectionVisibility: migrateSectionVisibility({
      ...defaultSectionVisibility,
      ...legacyVisibility,
    }),
    showcaseSectionTitle: raw.showcaseSectionTitle || cfg.sectionTitle,
    showcaseSectionSubtitle: raw.showcaseSectionSubtitle || cfg.sectionSubtitle,
    showcaseItems: raw.showcaseItems?.length
      ? raw.showcaseItems
      : defaultShowcaseByTemplate[id],
    galleryImages: raw.galleryImages?.length
      ? raw.galleryImages
      : merged.galleryImages,
    blogSectionTitle: raw.blogSectionTitle || merged.blogSectionTitle,
    blogSectionSubtitle: raw.blogSectionSubtitle || merged.blogSectionSubtitle,
    blogPosts: raw.blogPosts?.length ? raw.blogPosts : merged.blogPosts,
    newsSectionTitle: raw.newsSectionTitle || merged.newsSectionTitle,
    newsSectionSubtitle: raw.newsSectionSubtitle || merged.newsSectionSubtitle,
    newsPosts: raw.newsPosts?.length ? raw.newsPosts : merged.newsPosts,
    pricingSectionTitle: raw.pricingSectionTitle || merged.pricingSectionTitle,
    pricing: raw.pricing?.length ? raw.pricing : merged.pricing,
    roomsSectionTitle: raw.roomsSectionTitle || merged.roomsSectionTitle,
    roomsSectionSubtitle: raw.roomsSectionSubtitle || merged.roomsSectionSubtitle,
    bookingSectionTitle: raw.bookingSectionTitle || merged.bookingSectionTitle,
    bookingSectionSubtitle: raw.bookingSectionSubtitle || merged.bookingSectionSubtitle,
    roomTypes: (raw.roomTypes?.length ? raw.roomTypes : merged.roomTypes).map((room) => migrateRoom(room)),
    propertyAmenities: knownHotelAmenities(parseAmenities(raw.propertyAmenities ?? merged.propertyAmenities ?? '')).join(', '),
    logo: raw.logo ?? merged.logo ?? '',
    logoShowName: raw.logoShowName ?? merged.logoShowName ?? true,
    brandPrimary: raw.brandPrimary ?? merged.brandPrimary ?? '',
    brandSecondary: raw.brandSecondary ?? merged.brandSecondary ?? '',
    brandAccent: raw.brandAccent ?? merged.brandAccent ?? '',
    fontHeading: raw.fontHeading ?? merged.fontHeading ?? '',
    fontBody: raw.fontBody ?? merged.fontBody ?? '',
    seoEnabled: raw.seoEnabled ?? merged.seoEnabled ?? false,
    seoTitle: raw.seoTitle ?? merged.seoTitle ?? '',
    seoDescription: raw.seoDescription ?? merged.seoDescription ?? '',
    seoKeywords: raw.seoKeywords ?? merged.seoKeywords ?? '',
    seoSiteUrl: raw.seoSiteUrl ?? merged.seoSiteUrl ?? '',
  }

  return clampVisibilityToProfile(id, sanitizeContentLinks(result))
}

export function migrateContentWithTemplate(saved: { templateId: TemplateId; content: Partial<SiteContent> }) {
  return migrateContent(saved.content, saved.templateId)
}