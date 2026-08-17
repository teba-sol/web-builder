import { isValidTemplateId as catalogHas, listTemplateIds } from '../catalog/catalog'

export const TEMPLATE_IDS: string[] = listTemplateIds()

export function isValidTemplateId(id: string): boolean {
  return catalogHas(id)
}
