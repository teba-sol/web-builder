import type { TemplateManifest } from '../catalog/types'
import type { SiteContent } from '../types'

export const SITE_DOCUMENT_KIND = 'webbuilder-site' as const
export const SITE_DOCUMENT_SCHEMA_VERSION = 1 as const

/**
 * Standard checkpoint written on every export.
 * Same shape for every site, including ones built from a new / imported template.
 */
export interface SiteDocument {
  schemaVersion: typeof SITE_DOCUMENT_SCHEMA_VERSION
  kind: typeof SITE_DOCUMENT_KIND
  exportedAt: string
  templateId: string
  colorSchemeId: string
  layoutVariantId: string
  content: SiteContent
  /** Design snapshot so restore works even if this template is not in the local catalog. */
  template: TemplateManifest
}
