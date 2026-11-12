import { resolveBrandAccent, isHexColor } from '../../data/brand'
import { CUSTOM_COLOR_SCHEME_ID } from '../../data/pickTemplate'
import { getColorSchemes } from '../../data/colorSchemes'
import { isHospitalityTemplate } from '../../data/hospitality'
import { getLayoutVariant } from '../../data/layoutVariants'
import { getShowcaseConfig } from '../../data/sectionConfig'
import type { SiteContent, TemplateId } from '../../types'
import type { ImageAsset } from '../imageUtils'

export interface CrsExportSecrets {
  apiBaseUrl: string
  apiKey: string
  hotelId: string
}

export interface SiteExportPayload {
  templateId: TemplateId
  colorSchemeId: string
  layoutVariantId: string
  accent: string
  accentDark: string
  showcaseConfig: ReturnType<typeof getShowcaseConfig>
  layout: ReturnType<typeof getLayoutVariant>
  content: SiteContent
  assetMap: Record<string, string>
  crs?: CrsExportSecrets
}

export function buildExportPayload(
  templateId: TemplateId,
  content: SiteContent,
  colorSchemeId: string | undefined,
  layoutVariantId: string | undefined,
  assets: ImageAsset[],
): SiteExportPayload {
  const scheme =
    getColorSchemes(templateId).find((s) => s.id === colorSchemeId) ??
    getColorSchemes(templateId)[0]
  const layout = getLayoutVariant(templateId, layoutVariantId)

  const assetMap: Record<string, string> = {}
  for (const asset of assets) {
    assetMap[asset.htmlPath] = asset.zipPath.replace(/^assets\//, '')
  }

  const exportedContent = isHospitalityTemplate(templateId)
    ? { ...content, pageVisibility: { ...content.pageVisibility, portfolio: false } }
    : content

  return {
    templateId,
    colorSchemeId: colorSchemeId === CUSTOM_COLOR_SCHEME_ID ? CUSTOM_COLOR_SCHEME_ID : scheme.id,
    layoutVariantId: layout.id,
    accent: resolveBrandAccent(content, scheme.swatches[1]),
    accentDark: isHexColor(content.brandSecondary) ? content.brandSecondary.trim() : scheme.swatches[0],
    showcaseConfig: getShowcaseConfig(templateId),
    layout,
    content: exportedContent,
    assetMap,
  }
}

export function resolveAssetPath(
  imageUrl: string,
  assetName: string,
  assetMap: Record<string, string>,
): string {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('data:')) {
    const ext = imageUrl.includes('jpeg') ? 'jpg' : 'png'
    const filename = assetMap[`assets/${assetName}.${ext}`] ?? ''
    return filename ? `assets/${filename}` : ''
  }
  return imageUrl
}