import { applyHospitalitySurfaces } from './booking/hospitalityTheme'
import { requireManifest } from '../catalog/catalog'
import { CUSTOM_COLOR_SCHEME_ID } from '../data/pickTemplate'
import type { TemplateId } from '../types'
import { applyCustomPaletteToTheme } from './customPaletteTheme'
import type { TemplateTheme } from './themes'

export function getTheme(templateId: TemplateId, colorSchemeId?: string): TemplateTheme {
  const manifest = requireManifest(templateId)
  const custom = colorSchemeId === CUSTOM_COLOR_SCHEME_ID
  const requested = custom ? '' : colorSchemeId || ''
  const scheme =
    manifest.colorSchemes.find((item) => item.id === requested) ?? manifest.colorSchemes[0]
  const theme = { ...manifest.theme, ...scheme?.overrides }
  const selected = custom ? applyCustomPaletteToTheme(theme) : theme
  return manifest.features.includes('hospitality') ? applyHospitalitySurfaces(selected, theme) : selected
}
