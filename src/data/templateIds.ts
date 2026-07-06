import type { TemplateId } from '../types'

export const TEMPLATE_IDS: TemplateId[] = [
  'business',
  'creative',
  'restaurant',
  'saas',
  'fitness',
  'boutique',
  'realtor',
  'photography',
  'medical',
]

export function isValidTemplateId(id: string): id is TemplateId {
  return TEMPLATE_IDS.includes(id as TemplateId)
}