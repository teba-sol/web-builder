import type { HeroLayout } from '../data/layoutVariants'

/** Shared geometry for the editor and both export formats. */
export function flowstackHeroGrid(layout: HeroLayout, hasImage: boolean): string {
  const base = 'relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 csm:px-6 csm:py-16 clg:gap-14 clg:py-20'
  return layout === 'centered'
    ? `${base} grid-cols-1 text-center`
    : `${base} grid-cols-1${hasImage ? ' clg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : ''}`
}

export const FLOWSTACK_COPY = 'min-w-0'
export const FLOWSTACK_MEDIA = 'w-full min-w-0 overflow-hidden rounded-2xl border border-white/15 shadow-2xl'
export const FLOWSTACK_IMAGE = 'aspect-[4/3] w-full object-cover'
export const FLOWSTACK_ACTION = 'inline-flex min-h-12 items-center justify-center gap-3 max-csm:w-full'
