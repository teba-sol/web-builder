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
  'lawfirm',
  'salon',
  'noir',
  'terra',
  'coastal',
  'vineyard',
  'arcade',
  'coffee',
  'hotel',
  'guesthouse',
  'alpine',
  'ryokan',
  'desert',
  'nordic',
  'jungle',
]

export function isValidTemplateId(id: string): id is TemplateId {
  return TEMPLATE_IDS.includes(id as TemplateId)
}