import { mergeRichContent } from '../data/richDefaults'
import type { SiteContent } from '../types'

export function migrateContent(raw: Partial<SiteContent>): SiteContent {
  return mergeRichContent(raw)
}