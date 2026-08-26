/**
 * Public picker contract for a host project.
 *
 * Open: /pick-template?token=...&submitUrl=https://host/api/templates/pick&returnUrl=https://host/next
 * Submit JSON: { token, templateId, templateName, colorScheme, font, editorPath }
 * Open editorPath later to continue in the editor with the same palette and fonts.
 * Also posts { source: 'webbuilder', type: 'webbuilder:template-picked', payload } to window.parent / window.opener.
 */
import { isBundledTemplate, listTemplateMeta, templateHasFeature } from '../catalog/catalog'
import { categories } from './categories'
import { getColorSchemes } from './colorSchemes'
import { getFont, isHexColor } from './brand'
import { brandColorsFromScheme } from '../templates/cloneTheme'
import type { CategoryMeta, SiteContent, TemplateCategory, TemplateMeta } from '../types'

export const CUSTOM_COLOR_SCHEME_ID = 'custom'

export const PICK_TEMPLATE_MESSAGE_TYPE = 'webbuilder:template-picked'

export interface PickedColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  swatches: [string, string, string]
}

export interface PickedFont {
  heading: string | null
  body: string | null
}

/** JSON posted to the host project when the user submits. */
export interface PickTemplatePayload {
  token: string
  templateId: string
  templateName: string
  colorScheme: PickedColorScheme
  font: PickedFont
  /** Open this in WebBuilder to continue editing with the same look. */
  editorPath: string
}

export interface EditorAppearance {
  colorSchemeId: string
  fontHeading: string
  fontBody: string
  brandPrimary: string
  brandSecondary: string
  brandAccent: string
}

export interface FontPairing {
  id: string
  label: string
  heading: string
  body: string
}

export const FONT_PAIRINGS: FontPairing[] = [
  { id: 'modern', label: 'Modern Sans', heading: 'outfit', body: 'inter' },
  { id: 'clean', label: 'Clean & Neutral', heading: 'inter', body: 'inter' },
  { id: 'friendly', label: 'Friendly', heading: 'poppins', body: 'open-sans' },
  { id: 'classic', label: 'Classic Serif', heading: 'playfair', body: 'source-sans' },
  { id: 'editorial', label: 'Editorial', heading: 'fraunces', body: 'lato' },
  { id: 'bold', label: 'Bold Tech', heading: 'space-grotesk', body: 'inter' },
  { id: 'literary', label: 'Literary', heading: 'merriweather', body: 'open-sans' },
  { id: 'display', label: 'Display', heading: 'dm-serif', body: 'source-sans' },
]

export interface CustomPalette {
  primary: string
  secondary: string
  accent: string
}

export function listPickerTemplates(): TemplateMeta[] {
  return listTemplateMeta().filter(
    (template) =>
      isBundledTemplate(template.id) &&
      template.category !== 'hospitality' &&
      !templateHasFeature(template.id, 'hospitality'),
  )
}

export function listPickerCategories(templates: TemplateMeta[]): CategoryMeta[] {
  const present = new Set(templates.map((template) => template.category))
  return categories.filter((category) => category.id === 'all' || present.has(category.id as TemplateCategory))
}

export function isPickerTemplate(id: string | null | undefined): boolean {
  if (!id) return false
  return listPickerTemplates().some((template) => template.id === id)
}

export function emptyCustomPalette(swatches?: [string, string, string] | string[]): CustomPalette {
  const [secondary, primary, accent] = swatches ?? ['#0f172a', '#2563eb', '#f8fafc']
  return {
    primary: primary || '#2563eb',
    secondary: secondary || '#0f172a',
    accent: accent || '#f8fafc',
  }
}

export function paletteFromScheme(templateId: string, schemeId: string): CustomPalette {
  const scheme = getColorSchemes(templateId).find((item) => item.id === schemeId) ?? getColorSchemes(templateId)[0]
  return emptyCustomPalette(scheme?.swatches)
}

export function matchingFontPairing(heading: string, body: string): string | null {
  return FONT_PAIRINGS.find((pair) => pair.heading === heading && pair.body === body)?.id ?? null
}

export function buildPickTemplatePayload(input: {
  token: string
  templateId: string
  templateName: string
  colorSchemeId: string
  customPalette: CustomPalette | null
  fontHeading: string
  fontBody: string
}): PickTemplatePayload {
  const colorScheme = resolvePickedColorScheme(input.templateId, input.colorSchemeId, input.customPalette)
  const font = {
    heading: input.fontHeading || null,
    body: input.fontBody || null,
  }
  const payload: PickTemplatePayload = {
    token: input.token,
    templateId: input.templateId,
    templateName: input.templateName,
    colorScheme,
    font,
    editorPath: '',
  }
  payload.editorPath = editorPathFromAppearance(input.templateId, appearanceFromPayload(payload))
  return payload
}

export function appearanceFromPayload(payload: PickTemplatePayload): EditorAppearance {
  return {
    colorSchemeId: payload.colorScheme.id,
    fontHeading: payload.font.heading ?? '',
    fontBody: payload.font.body ?? '',
    brandPrimary: payload.colorScheme.primary,
    brandSecondary: payload.colorScheme.secondary,
    brandAccent: payload.colorScheme.accent,
  }
}

export function appearanceFromSearchParams(params: URLSearchParams): EditorAppearance | null {
  const colorSchemeId = params.get('colorScheme')?.trim() || ''
  const fontHeading = params.get('fontHeading')?.trim() || ''
  const fontBody = params.get('fontBody')?.trim() || ''
  const brandPrimary = params.get('primary')?.trim() || ''
  const brandSecondary = params.get('secondary')?.trim() || ''
  const brandAccent = params.get('accent')?.trim() || ''
  if (!colorSchemeId && !fontHeading && !fontBody && !brandPrimary && !brandSecondary && !brandAccent) {
    return null
  }
  return { colorSchemeId, fontHeading, fontBody, brandPrimary, brandSecondary, brandAccent }
}

export function editorPathFromAppearance(templateId: string, appearance: EditorAppearance): string {
  const params = new URLSearchParams()
  if (appearance.colorSchemeId) params.set('colorScheme', appearance.colorSchemeId)
  if (appearance.fontHeading) params.set('fontHeading', appearance.fontHeading)
  if (appearance.fontBody) params.set('fontBody', appearance.fontBody)
  if (appearance.brandPrimary) params.set('primary', appearance.brandPrimary)
  if (appearance.brandSecondary) params.set('secondary', appearance.brandSecondary)
  if (appearance.brandAccent) params.set('accent', appearance.brandAccent)
  const query = params.toString()
  return query ? `/editor/${templateId}?${query}` : `/editor/${templateId}`
}

export function resolveEditorColorSchemeId(templateId: string, colorSchemeId: string): string {
  if (colorSchemeId === CUSTOM_COLOR_SCHEME_ID) return CUSTOM_COLOR_SCHEME_ID
  const schemes = getColorSchemes(templateId)
  if (schemes.some((scheme) => scheme.id === colorSchemeId)) return colorSchemeId
  return schemes[0]?.id || ''
}

export function applyAppearanceToContent(
  templateId: string,
  content: SiteContent,
  appearance: EditorAppearance,
): { content: SiteContent; colorSchemeId: string } {
  const colorSchemeId = resolveEditorColorSchemeId(templateId, appearance.colorSchemeId)
  const schemeBrand =
    colorSchemeId && colorSchemeId !== CUSTOM_COLOR_SCHEME_ID
      ? brandColorsFromScheme(templateId, colorSchemeId)
      : { brandPrimary: '', brandSecondary: '', brandAccent: '' }

  return {
    colorSchemeId: colorSchemeId || appearance.colorSchemeId,
    content: {
      ...content,
      brandPrimary: isHexColor(appearance.brandPrimary) ? appearance.brandPrimary.trim() : schemeBrand.brandPrimary,
      brandSecondary: isHexColor(appearance.brandSecondary) ? appearance.brandSecondary.trim() : schemeBrand.brandSecondary,
      brandAccent: isHexColor(appearance.brandAccent) ? appearance.brandAccent.trim() : schemeBrand.brandAccent,
      fontHeading: getFont(appearance.fontHeading) ? appearance.fontHeading : content.fontHeading,
      fontBody: getFont(appearance.fontBody) ? appearance.fontBody : content.fontBody,
    },
  }
}

function resolvePickedColorScheme(
  templateId: string,
  colorSchemeId: string,
  customPalette: CustomPalette | null,
): PickedColorScheme {
  if (colorSchemeId === CUSTOM_COLOR_SCHEME_ID && customPalette) {
    const primary = customPalette.primary.trim()
    const secondary = customPalette.secondary.trim()
    const accent = customPalette.accent.trim()
    return {
      id: CUSTOM_COLOR_SCHEME_ID,
      name: 'Custom',
      primary,
      secondary,
      accent,
      swatches: [secondary, primary, accent],
    }
  }

  const scheme = getColorSchemes(templateId).find((item) => item.id === colorSchemeId) ?? getColorSchemes(templateId)[0]
  const swatches = (scheme?.swatches ?? ['#0f172a', '#2563eb', '#f8fafc']) as [string, string, string]
  return {
    id: scheme?.id ?? colorSchemeId,
    name: scheme?.name ?? 'Default',
    primary: swatches[1],
    secondary: swatches[0],
    accent: swatches[2],
    swatches,
  }
}

export function validatePickSelection(input: {
  templateId: string
  colorSchemeId: string
  customPalette: CustomPalette | null
}): string | null {
  if (!isPickerTemplate(input.templateId)) return 'Choose a template to continue.'
  if (input.colorSchemeId === CUSTOM_COLOR_SCHEME_ID) {
    if (!input.customPalette) return 'Add a custom palette or pick a preset.'
    if (!isHexColor(input.customPalette.primary) || !isHexColor(input.customPalette.secondary) || !isHexColor(input.customPalette.accent)) {
      return 'Custom colors need to be valid hex values, like #2563eb.'
    }
  }
  return null
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isSafeSubmitUrl(value: string): boolean {
  if (value.startsWith('/') && !value.startsWith('//')) return true
  return isSafeHttpUrl(value)
}

export interface SubmitPickTemplateOptions {
  submitUrl?: string
  parentOrigin?: string
}

export async function submitPickTemplatePayload(
  payload: PickTemplatePayload,
  options: SubmitPickTemplateOptions = {},
): Promise<void> {
  const message = {
    source: 'webbuilder',
    type: PICK_TEMPLATE_MESSAGE_TYPE,
    payload,
  }
  const targetOrigin = options.parentOrigin && isSafeHttpUrl(options.parentOrigin) ? options.parentOrigin : '*'
  window.parent?.postMessage(message, targetOrigin)
  window.opener?.postMessage(message, targetOrigin)

  const submitUrl = options.submitUrl?.trim()
  if (!submitUrl) return
  if (!isSafeSubmitUrl(submitUrl)) {
    throw new Error('The submit URL is not allowed.')
  }

  const response = await fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${payload.token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`The host project rejected the selection (${response.status}).`)
  }
}

export function fontLabel(id: string | null | undefined): string {
  if (!id) return 'Template default'
  return getFont(id)?.label ?? id
}
