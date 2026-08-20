import { requireManifest } from '../catalog/catalog'
import { isHexColor } from '../data/brand'
import { getLayoutVariant } from '../data/layoutVariants'
import type { SiteContent } from '../types'

export const CLONE_TEMPLATE_IDS = ['taxfighters', 'aureum', 'flux', 'cpa', 'axiom', 'helix'] as const
export type CloneTemplateId = (typeof CLONE_TEMPLATE_IDS)[number]

export function isCloneTemplate(id: string): id is CloneTemplateId {
  return (CLONE_TEMPLATE_IDS as readonly string[]).includes(id)
}

export interface ClonePalette {
  ink: string
  accent: string
  highlight: string
  surface: string
  accentFg: string
}

const NATIVE_SURFACE: Record<CloneTemplateId, string> = {
  taxfighters: '#f8fafc',
  aureum: '#f8fafc',
  flux: '#FFF9F4',
  cpa: '#F6F3EA',
  axiom: '#F7F9FC',
  helix: '#ffffff',
}

function hexLuminance(hex: string): number {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function isLightColor(hex: string): boolean {
  return isHexColor(hex) && hexLuminance(hex.trim()) >= 0.65
}

function isSurfaceColor(hex: string): boolean {
  return isHexColor(hex) && hexLuminance(hex.trim()) >= 0.88
}

function mixHex(a: string, b: string, amount: number): string {
  const parse = (hex: string) => {
    const raw = hex.replace('#', '')
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
    return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)]
  }
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  const to = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${to(r1 + (r2 - r1) * amount)}${to(g1 + (g2 - g1) * amount)}${to(b1 + (b2 - b1) * amount)}`
}

function resolveSurface(templateId: string, highlight: string, accent: string, nativeLook: boolean): string {
  if (isSurfaceColor(highlight)) return highlight.trim()
  const native = isCloneTemplate(templateId) ? NATIVE_SURFACE[templateId] : '#f8fafc'
  if (nativeLook || !isHexColor(accent)) return native
  return mixHex(native, accent, 0.12)
}

export function brandColorsFromScheme(
  templateId: string,
  colorSchemeId?: string,
): Pick<SiteContent, 'brandPrimary' | 'brandSecondary' | 'brandAccent'> {
  const palette = resolveClonePalette(templateId, {} as SiteContent, colorSchemeId)
  return {
    brandPrimary: palette.accent,
    brandSecondary: palette.ink,
    brandAccent: palette.highlight,
  }
}

export function resolveClonePalette(
  templateId: string,
  _content: SiteContent,
  colorSchemeId?: string,
): ClonePalette {
  const manifest = requireManifest(templateId)
  const scheme =
    manifest.colorSchemes.find((item) => item.id === colorSchemeId) ?? manifest.colorSchemes[0]
  const [ink, accent, highlight] = scheme?.swatches ?? ['#111827', manifest.accentColor, '#f8fafc']
  const nativeLook = !colorSchemeId || scheme?.id === (manifest.defaultColorSchemeId || manifest.colorSchemes[0]?.id)
  const surface = resolveSurface(templateId, highlight, accent, nativeLook)
  return {
    ink,
    accent,
    highlight,
    surface,
    accentFg: isLightColor(accent) ? ink : '#ffffff',
  }
}

function tokenRemap(templateId: string): string {
  switch (templateId) {
    case 'taxfighters':
      return `
        --color-rose-200: color-mix(in srgb, var(--clone-accent) 22%, var(--clone-surface));
        --color-rose-300: color-mix(in srgb, var(--clone-accent) 38%, white);
        --color-rose-400: color-mix(in srgb, var(--clone-accent) 62%, white);
        --color-rose-500: var(--clone-accent);
        --color-rose-600: var(--clone-accent);
        --color-rose-700: var(--clone-ink);
        --color-rose-900: var(--clone-ink);
        --color-amber-300: var(--clone-highlight);
        --color-amber-400: var(--clone-highlight);`
    case 'aureum':
      return `
        --color-purple-600: var(--clone-accent);
        --color-purple-700: var(--clone-ink);
        --color-purple-100: color-mix(in srgb, var(--clone-accent) 16%, var(--clone-surface));
        --color-purple-200: color-mix(in srgb, var(--clone-accent) 28%, white);
        --color-pink-400: var(--clone-highlight);
        --color-pink-500: var(--clone-highlight);`
    case 'flux':
      return `
        --color-orange-500: var(--clone-accent);
        --color-orange-600: var(--clone-accent);`
    case 'cpa':
      return `
        --color-lime-400: var(--clone-accent);
        --color-lime-500: var(--clone-accent);
        --color-emerald-600: var(--clone-accent);
        --color-teal-300: var(--clone-accent);
        --color-teal-700: var(--clone-ink);
        --color-teal-800: var(--clone-ink);`
    case 'axiom':
      return `
        --color-blue-600: var(--clone-accent);
        --color-blue-500: var(--clone-highlight);
        --color-blue-400: var(--clone-highlight);
        --color-sky-400: var(--clone-highlight);`
    case 'helix':
      return `
        --color-red-500: var(--clone-highlight);
        --color-red-600: var(--clone-accent);`
    default:
      return ''
  }
}

export function clonePaletteCss(templateId: string, palette: ClonePalette): string {
  return `.webtemplate-clone, .tpl-${templateId}.webtemplate-clone {
  --clone-ink: ${palette.ink};
  --clone-accent: ${palette.accent};
  --clone-highlight: ${palette.highlight};
  --clone-surface: ${palette.surface};
  --clone-surface-alt: color-mix(in srgb, var(--clone-surface) 86%, var(--clone-ink));
  --clone-accent-soft: color-mix(in srgb, var(--clone-accent) 18%, var(--clone-surface));
  --clone-accent-fg: ${palette.accentFg};
  background-color: var(--clone-surface);
  color: var(--clone-ink);
  ${tokenRemap(templateId)}
}`
}

export function cloneWrapperClass(templateId: string, layoutVariantId?: string): string {
  const layout = getLayoutVariant(templateId, layoutVariantId)
  return `webtemplate-clone tpl-${templateId} ${layout.shellClass} min-h-screen`
}
