import { listManifests, requireManifest } from '../catalog/catalog'
import type { TemplateTheme } from '../templates/themes'
import type { TemplateId } from '../types'

export interface ColorSchemeOption {
  id: string
  name: string
  swatches: [string, string, string]
  overrides: Partial<TemplateTheme>
}

export const colorSchemesByTemplate: Record<string, ColorSchemeOption[]> = Object.fromEntries(
  listManifests().map((manifest) => [manifest.id, manifest.colorSchemes]),
)

export function getDefaultColorSchemeId(templateId: TemplateId): string {
  const manifest = requireManifest(templateId)
  return manifest.defaultColorSchemeId || manifest.colorSchemes[0]?.id || ''
}

export function getColorSchemes(templateId: TemplateId): ColorSchemeOption[] {
  return requireManifest(templateId).colorSchemes
}
