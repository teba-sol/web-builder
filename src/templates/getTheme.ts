import { colorSchemesByTemplate } from '../data/colorSchemes'
import type { TemplateId } from '../types'
import { themes, type TemplateTheme } from './themes'

export function getTheme(templateId: TemplateId, colorSchemeId?: string): TemplateTheme {
  const base = themes[templateId]
  const schemes = colorSchemesByTemplate[templateId]
  const scheme = schemes.find((s) => s.id === colorSchemeId) ?? schemes[0]
  return { ...base, ...scheme.overrides }
}