import { buildCloneHomeBlade, isCloneTemplate } from '../cloneHomeExport'
import type { SiteExportPayload } from './exportPayload'

export function isCustomFinanceHome(templateId: string): boolean {
  return isCloneTemplate(templateId)
}

export function generateFinanceHomeBlade(payload: SiteExportPayload): string | null {
  if (!isCloneTemplate(payload.templateId)) return null
  return buildCloneHomeBlade(payload.templateId, payload.content, payload.colorSchemeId, payload.layoutVariantId)
}
