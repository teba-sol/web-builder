import { requireManifest } from '../catalog/catalog'
import type { TemplateId } from '../types'
import type { TemplateTheme } from './themes'

export function getTheme(templateId: TemplateId, colorSchemeId?: string): TemplateTheme {
  const manifest = requireManifest(templateId)
  const scheme =
    manifest.colorSchemes.find((item) => item.id === colorSchemeId) ?? manifest.colorSchemes[0]
  return { ...manifest.theme, ...scheme?.overrides }
}
