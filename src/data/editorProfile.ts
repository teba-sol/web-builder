import { getManifest } from '../catalog/catalog'
import { PAGE_VISIBILITY_KEYS, SECTION_VISIBILITY_KEYS } from '../catalog/vocab'
import { isCloneTemplate } from '../templates/cloneTheme'
import type { PageVisibility, TemplateId, ToggleableSection } from '../types'
import { pageMetas, type PageMeta } from './pageConfig'
import { sectionMetas, type SectionMeta } from './sectionConfig'

export { PAGE_VISIBILITY_KEYS, SECTION_VISIBILITY_KEYS }

const FINANCE_PAGES: Array<keyof PageVisibility> = [
  'about',
  'services',
  'portfolio',
  'blog',
  'contact',
]

const FINANCE_SECTIONS: ToggleableSection[] = [
  'stats',
  'steps',
  'testimonials',
  'faq',
  'cta',
  'team',
  'pricing',
]

export interface EditorProfile {
  pages: Array<keyof PageVisibility>
  sections: ToggleableSection[]
}

export function getEditorProfile(templateId: TemplateId | null | undefined): EditorProfile {
  if (!templateId) {
    return {
      pages: PAGE_VISIBILITY_KEYS.filter((key) => key !== 'rooms').slice(),
      sections: SECTION_VISIBILITY_KEYS.slice(),
    }
  }

  const manifest = getManifest(templateId)
  const fromManifestPages = manifest?.editorPages?.filter((key) => PAGE_VISIBILITY_KEYS.includes(key))
  const fromManifestSections = manifest?.editorSections?.filter((key) =>
    SECTION_VISIBILITY_KEYS.includes(key),
  )

  if (fromManifestPages?.length || fromManifestSections?.length) {
    return {
      pages: fromManifestPages?.length ? fromManifestPages : defaultPagesFor(templateId),
      sections: fromManifestSections?.length ? fromManifestSections : [...SECTION_VISIBILITY_KEYS],
    }
  }

  return {
    pages: defaultPagesFor(templateId),
    sections: isCloneTemplate(templateId) || manifest?.category === 'finance' ? [...FINANCE_SECTIONS] : [...SECTION_VISIBILITY_KEYS],
  }
}

function defaultPagesFor(templateId: TemplateId): Array<keyof PageVisibility> {
  const manifest = getManifest(templateId)
  if (isCloneTemplate(templateId) || manifest?.category === 'finance') return [...FINANCE_PAGES]
  if (manifest?.features.includes('hospitality')) return [...PAGE_VISIBILITY_KEYS]
  return PAGE_VISIBILITY_KEYS.filter((key) => key !== 'rooms')
}

export function getEditablePageMetas(templateId: TemplateId | null | undefined): PageMeta[] {
  const allowed = new Set(getEditorProfile(templateId).pages)
  return pageMetas.filter((meta) => allowed.has(meta.key))
}

export function getEditableSectionMetas(templateId: TemplateId | null | undefined): SectionMeta[] {
  const allowed = new Set(getEditorProfile(templateId).sections)
  return sectionMetas.filter((meta) => allowed.has(meta.key))
}

export function isEditablePage(templateId: TemplateId | null | undefined, page: keyof PageVisibility): boolean {
  return getEditorProfile(templateId).pages.includes(page)
}

export function isEditableSection(templateId: TemplateId | null | undefined, section: ToggleableSection): boolean {
  return getEditorProfile(templateId).sections.includes(section)
}

export function clampVisibilityToProfile<T extends { pageVisibility: PageVisibility; sectionVisibility: Record<ToggleableSection, boolean> }>(
  templateId: TemplateId | undefined,
  content: T,
): T {
  if (!templateId) return content
  const profile = getEditorProfile(templateId)
  const pageVisibility = { ...content.pageVisibility }
  for (const key of PAGE_VISIBILITY_KEYS) {
    if (!profile.pages.includes(key)) pageVisibility[key] = false
  }
  const sectionVisibility = { ...content.sectionVisibility }
  for (const key of SECTION_VISIBILITY_KEYS) {
    if (!profile.sections.includes(key)) sectionVisibility[key] = false
  }
  return { ...content, pageVisibility, sectionVisibility }
}
