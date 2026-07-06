import { mergeRichContent } from '../data/richDefaults'
import {
  defaultSectionVisibility,
  defaultShowcaseByTemplate,
  showcaseConfigByTemplate,
} from '../data/sectionConfig'
import type { SiteContent, TemplateId } from '../types'

export function migrateContent(raw: Partial<SiteContent>, templateId?: TemplateId): SiteContent {
  const merged = mergeRichContent(raw)
  const id = templateId ?? 'business'
  const cfg = showcaseConfigByTemplate[id]

  const legacyVisibility = { ...raw.sectionVisibility } as Record<string, boolean | undefined>
  delete legacyVisibility.testimonials

  return {
    ...merged,
    contactSectionTitle: raw.contactSectionTitle || merged.contactSectionTitle,
    contactFormTitle: raw.contactFormTitle || merged.contactFormTitle,
    contactFormUrl: raw.contactFormUrl ?? merged.contactFormUrl,
    contactFormButtonText: raw.contactFormButtonText || merged.contactFormButtonText,
    sectionVisibility: { ...defaultSectionVisibility, ...legacyVisibility },
    showcaseSectionTitle: raw.showcaseSectionTitle || cfg.sectionTitle,
    showcaseSectionSubtitle: raw.showcaseSectionSubtitle || cfg.sectionSubtitle,
    showcaseItems: raw.showcaseItems?.length
      ? raw.showcaseItems
      : defaultShowcaseByTemplate[id],
    galleryImages: raw.galleryImages?.length
      ? raw.galleryImages
      : merged.galleryImages,
  }
}

export function migrateContentWithTemplate(saved: { templateId: TemplateId; content: Partial<SiteContent> }) {
  return migrateContent(saved.content, saved.templateId)
}