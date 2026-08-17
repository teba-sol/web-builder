import { asDesignManifest } from '../catalog/layoutContent'
import { validateManifest } from '../catalog/validate'
import { SITE_DOCUMENT_KIND, SITE_DOCUMENT_SCHEMA_VERSION, type SiteDocument } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validateSiteDocument(
  raw: unknown,
): { ok: true; document: SiteDocument } | { ok: false; errors: string[] } {
  if (!isRecord(raw)) {
    return { ok: false, errors: ['expected an object'] }
  }
  const errors: string[] = []
  if (raw.kind !== SITE_DOCUMENT_KIND) {
    errors.push(`kind must be "${SITE_DOCUMENT_KIND}"`)
  }
  if (raw.schemaVersion !== SITE_DOCUMENT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${SITE_DOCUMENT_SCHEMA_VERSION}`)
  }
  if (typeof raw.templateId !== 'string' || !raw.templateId.trim()) {
    errors.push('templateId is required')
  }
  if (typeof raw.colorSchemeId !== 'string') {
    errors.push('colorSchemeId is required')
  }
  if (typeof raw.layoutVariantId !== 'string') {
    errors.push('layoutVariantId is required')
  }
  if (!isRecord(raw.content)) {
    errors.push('content is required')
  }
  const templateResult = validateManifest(raw.template)
  if (!templateResult.ok) {
    errors.push(...templateResult.errors.map((item) => `template.${item}`))
  }
  if (errors.length > 0 || !templateResult.ok) {
    return { ok: false, errors }
  }

  const template = asDesignManifest(templateResult.manifest)
  return {
    ok: true,
    document: {
      schemaVersion: SITE_DOCUMENT_SCHEMA_VERSION,
      kind: SITE_DOCUMENT_KIND,
      exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
      templateId: String(raw.templateId),
      colorSchemeId: String(raw.colorSchemeId),
      layoutVariantId: String(raw.layoutVariantId),
      content: raw.content as SiteDocument['content'],
      template: { ...template, id: String(raw.templateId) },
    },
  }
}
