import { defaultContent } from '../data/defaults'
import type { SiteContent, TemplateId } from '../types'
import { migrateContent } from './migrateContent'

const STORAGE_KEY = 'webbuilder-site'

export interface SavedSite {
  templateId: TemplateId
  content: SiteContent
}

export function loadSavedSite(): SavedSite | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedSite
    if (parsed.templateId && parsed.content) {
      return { templateId: parsed.templateId, content: migrateContent(parsed.content) }
    }
  } catch {
    /* ignore corrupt data */
  }
  return null
}

export function saveSite(templateId: TemplateId, content: SiteContent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ templateId, content }))
}

export function clearSavedSite() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getSiteOrDefault(templateId: TemplateId): SiteContent {
  const saved = loadSavedSite()
  if (saved?.templateId === templateId) return saved.content
  return defaultContent
}