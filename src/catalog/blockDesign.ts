import type { HomeSectionId } from '../data/homePageConfig'
import type { TemplateManifest } from './types'

export type Density = 'compact' | 'regular' | 'spacious'
export type Align = 'left' | 'center' | 'right'
export type Width = 'full' | 'wide' | 'narrow'

export interface BlockPart {
  id: string
  label: string
}

export interface BlockDesign {
  density: Density
  align: Align
  width: Width
  parts: Record<string, boolean>
}

export const DENSITY_OPTIONS: Density[] = ['compact', 'regular', 'spacious']
export const ALIGN_OPTIONS: Align[] = ['left', 'center', 'right']
export const WIDTH_OPTIONS: Width[] = ['full', 'wide', 'narrow']

export const BLOCK_PARTS: Partial<Record<HomeSectionId, BlockPart[]>> = {
  nav: [{ id: 'cta', label: 'CTA button' }],
  hero: [
    { id: 'badge', label: 'Badge' },
    { id: 'title', label: 'Headline' },
    { id: 'subtitle', label: 'Subtitle' },
    { id: 'cta', label: 'Button' },
    { id: 'image', label: 'Image' },
  ],
  stats: [{ id: 'heading', label: 'Heading' }],
  'rooms-teaser': [
    { id: 'heading', label: 'Heading' },
    { id: 'price', label: 'Prices' },
  ],
  'services-teaser': [{ id: 'heading', label: 'Heading' }],
  'portfolio-teaser': [{ id: 'heading', label: 'Heading' }],
  'blog-teaser': [{ id: 'heading', label: 'Heading' }],
  'news-teaser': [{ id: 'heading', label: 'Heading' }],
  'about-teaser': [
    { id: 'heading', label: 'Heading' },
    { id: 'image', label: 'Image' },
  ],
  testimonials: [{ id: 'heading', label: 'Heading' }],
  faq: [{ id: 'heading', label: 'Heading' }],
  contact: [
    { id: 'heading', label: 'Heading' },
    { id: 'form', label: 'Form' },
  ],
  explore: [{ id: 'heading', label: 'Heading' }],
  footer: [{ id: 'links', label: 'Links' }],
}

export function defaultBlockDesign(id: string): BlockDesign {
  const parts: Record<string, boolean> = {}
  for (const part of BLOCK_PARTS[id as HomeSectionId] ?? []) parts[part.id] = true
  return { density: 'regular', align: 'left', width: 'wide', parts }
}

export function getBlockDesign(manifest: TemplateManifest | undefined, id: string): BlockDesign {
  const base = defaultBlockDesign(id)
  const stored = manifest?.blocks?.[id]
  if (!stored) return base
  return {
    density: stored.density ?? base.density,
    align: stored.align ?? base.align,
    width: stored.width ?? base.width,
    parts: { ...base.parts, ...stored.parts },
  }
}

export function blockWrapperClass(design: BlockDesign): string {
  const density =
    design.density === 'compact' ? 'bd-density-compact' : design.density === 'spacious' ? 'bd-density-spacious' : 'bd-density-regular'
  const align =
    design.align === 'center' ? 'bd-align-center' : design.align === 'right' ? 'bd-align-right' : 'bd-align-left'
  const width =
    design.width === 'full' ? 'bd-width-full' : design.width === 'narrow' ? 'bd-width-narrow' : 'bd-width-wide'
  return `${density} ${align} ${width}`
}

export function blockHideAttrs(design: BlockDesign): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const [part, on] of Object.entries(design.parts)) {
    if (!on) attrs[`data-hide-${part}`] = 'true'
  }
  return attrs
}
