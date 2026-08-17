import { getManifest, listManifests, requireManifest } from '../catalog/catalog'
import type { SiteContent } from '../types'
import { migrateContent } from '../utils/migrateContent'
import { mergeRichContent } from './richDefaults'

export { emptyContacts } from './contacts'
export { getTemplateMeta, templates } from './templates'

export const defaultContent: SiteContent = mergeRichContent({})

export function getTemplateDefaults(id: string): SiteContent {
  return migrateContent(requireManifest(id).defaults, id)
}

/** Same as getTemplateDefaults — sample content shown when you start editing a template. */
export function getEditorContent(id: string): SiteContent {
  return getTemplateDefaults(id)
}

/** Snapshot of bundled + currently imported defaults. Prefer getTemplateDefaults(). */
export const templateDefaults: Record<string, SiteContent> = new Proxy({} as Record<string, SiteContent>, {
  get(_target, id: string) {
    return getManifest(id)?.defaults
  },
  ownKeys() {
    return listManifests().map((manifest) => manifest.id)
  },
  getOwnPropertyDescriptor(_target, id) {
    const defaults = getManifest(String(id))?.defaults
    return defaults ? { configurable: true, enumerable: true, value: defaults } : undefined
  },
})
