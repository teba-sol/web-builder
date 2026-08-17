import { asDesignManifest } from '../catalog/layoutContent'
import { getManifest, registerImportedManifest, requireManifest } from '../catalog/catalog'
import type { SiteContent } from '../types'
import { migrateContent } from '../utils/migrateContent'
import { SITE_DOCUMENT_KIND, SITE_DOCUMENT_SCHEMA_VERSION, type SiteDocument } from './types'
import { validateSiteDocument } from './validate'

export function buildSiteDocument(
  templateId: string,
  content: SiteContent,
  colorSchemeId?: string,
  layoutVariantId?: string,
): SiteDocument {
  const template = asDesignManifest(getManifest(templateId) ?? requireManifest(templateId))
  return {
    schemaVersion: SITE_DOCUMENT_SCHEMA_VERSION,
    kind: SITE_DOCUMENT_KIND,
    exportedAt: new Date().toISOString(),
    templateId,
    colorSchemeId: colorSchemeId ?? template.defaultColorSchemeId ?? '',
    layoutVariantId: layoutVariantId ?? template.defaultLayoutVariantId ?? 'classic',
    content,
    template: { ...template, id: templateId },
  }
}

export function stringifySiteDocument(document: SiteDocument): string {
  return `${JSON.stringify(document, null, 2)}\n`
}

export function parseSiteDocument(raw: string): { ok: true; document: SiteDocument } | { ok: false; errors: string[] } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, errors: ['File is not valid JSON'] }
  }
  return validateSiteDocument(parsed)
}

/** Register the embedded template (if needed) and return a document ready to apply. */
export function importSiteDocument(raw: string): { ok: true; document: SiteDocument } | { ok: false; errors: string[] } {
  const result = parseSiteDocument(raw)
  if (!result.ok) return result
  const document = result.document
  registerImportedManifest(document.template)
  return {
    ok: true,
    document: {
      ...document,
      content: migrateContent(document.content, document.templateId),
    },
  }
}

export function downloadSiteDocument(site: SiteDocument) {
  const blob = new Blob([stringifySiteDocument(site)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = `${site.templateId}.site.json`
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
