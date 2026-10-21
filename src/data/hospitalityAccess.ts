import type { Role } from '../api/types'
import { isHospitalityTemplate } from './hospitality'
import type { TemplateId, TemplateMeta } from '../types'

export function canUseHospitalityTemplates(role: Role | null | undefined): boolean {
  return role === 'SALESPERSON' || role === 'AGENCY_ADMIN' || role === 'PLATFORM_ADMIN'
}

export function hospitalityTemplateBlocked(
  role: Role | null | undefined,
  templateId: TemplateId | string | null | undefined,
): boolean {
  return isHospitalityTemplate(templateId) && !canUseHospitalityTemplates(role)
}

export function templatesForPersonalAccount(templates: TemplateMeta[]): TemplateMeta[] {
  return templates.filter((template) => !isHospitalityTemplate(template.id))
}
