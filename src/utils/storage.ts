import { defaultContent } from '../data/defaults'
import { getDefaultColorSchemeId } from '../data/colorSchemes'
import {
  getDefaultLayoutVariantId,
  isValidLayoutVariant,
  normalizeLayoutVariantId,
} from '../data/layoutVariants'
import type { SiteContent, TemplateId } from '../types'
import { migrateContent } from './migrateContent'

const STORAGE_KEY = 'webbuilder-site'

export interface SavedSite {
  templateId: TemplateId
  content: SiteContent
  colorSchemeId: string
  layoutVariantId: string
}

export function loadSavedSite(): SavedSite | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SavedSite>
    if (parsed.templateId && parsed.content) {
      // Normalize legacy ids (e.g. "bold" → "luxury") so every template has classic / modern / luxury
      const layoutVariantId =
        parsed.layoutVariantId && isValidLayoutVariant(parsed.templateId, parsed.layoutVariantId)
          ? normalizeLayoutVariantId(parsed.layoutVariantId)
          : getDefaultLayoutVariantId(parsed.templateId)
      return {
        templateId: parsed.templateId,
        content: migrateContent(parsed.content, parsed.templateId),
        colorSchemeId: parsed.colorSchemeId ?? getDefaultColorSchemeId(parsed.templateId),
        layoutVariantId,
      }
    }
  } catch {
    /* ignore corrupt data */
  }
  return null
}

export function saveSite(
  templateId: TemplateId,
  content: SiteContent,
  colorSchemeId: string,
  layoutVariantId: string,
) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ templateId, content, colorSchemeId, layoutVariantId }))
}

export function clearSavedSite() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getSiteOrDefault(templateId: TemplateId): SiteContent {
  const saved = loadSavedSite()
  if (saved?.templateId === templateId) return saved.content
  return defaultContent
}