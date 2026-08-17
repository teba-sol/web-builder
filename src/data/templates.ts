import { getTemplateMeta as catalogMeta, listTemplateMeta } from '../catalog/catalog'
import type { TemplateMeta } from '../types'

export const templates: TemplateMeta[] = listTemplateMeta()

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return catalogMeta(id)
}
