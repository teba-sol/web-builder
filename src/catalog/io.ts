import { registerImportedManifest, requireManifest } from './catalog'
import { asDesignManifest } from './layoutContent'
import type { TemplateManifest } from './types'
import { validateManifest } from './validate'
import type { SiteContent } from '../types'

export function stringifyManifest(manifest: TemplateManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`
}

export function parseTemplateJson(raw: string): { ok: true; manifest: TemplateManifest } | { ok: false; errors: string[] } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, errors: ['File is not valid JSON'] }
  }
  return validateManifest(parsed)
}

export function importTemplateJson(raw: string): { ok: true; manifest: TemplateManifest } | { ok: false; errors: string[] } {
  const result = parseTemplateJson(raw)
  if (!result.ok) return result
  return { ok: true, manifest: registerImportedManifest(asDesignManifest(result.manifest)) }
}

export function downloadManifestJson(manifest: TemplateManifest) {
  const blob = new Blob([stringifyManifest(asDesignManifest(manifest))], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${manifest.id}.template.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function snapshotManifest(
  templateId: string,
  content: SiteContent,
  colorSchemeId?: string,
  layoutVariantId?: string,
): TemplateManifest {
  const base = requireManifest(templateId)
  return asDesignManifest({
    ...base,
    defaultColorSchemeId: colorSchemeId || base.defaultColorSchemeId,
    defaultLayoutVariantId: layoutVariantId || base.defaultLayoutVariantId,
    pages: content.pageVisibility,
  })
}
