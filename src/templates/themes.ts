import { listManifests } from '../catalog/catalog'
import type { SectionId, TemplateTheme } from '../catalog/theme'

export type { SectionId, TemplateTheme } from '../catalog/theme'

export const themes: Record<string, TemplateTheme> = Object.fromEntries(
  listManifests().map((manifest) => [manifest.id, manifest.theme]),
)

export const sectionOrders: Record<string, SectionId[]> = Object.fromEntries(
  listManifests().map((manifest) => [manifest.id, [...manifest.sectionOrder]]),
)
