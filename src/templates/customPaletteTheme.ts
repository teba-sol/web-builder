import { THEME_KEYS, type TemplateTheme } from '../catalog/theme'

/** Complete class strings so Tailwind v4 emits these CSS-variable utilities. */
export const CUSTOM_PALETTE_CLASS_NAMES = [
  'bg-[var(--brand-primary)]',
  'bg-[var(--brand-secondary)]',
  'bg-[var(--brand-primary-dark)]',
  'text-[var(--brand-primary)]',
  'text-[var(--brand-secondary)]',
  'text-[var(--brand-tint)]',
  'text-[var(--brand-accent)]',
  'from-[var(--brand-primary)]',
  'from-[var(--brand-secondary)]',
  'to-[var(--brand-primary)]',
  'to-[var(--brand-secondary)]',
  'via-[var(--brand-primary)]',
  'border-[var(--brand-primary)]',
  'border-[var(--brand-secondary)]',
  'hover:bg-[var(--brand-primary)]',
  'hover:bg-[var(--brand-secondary)]',
  'hover:bg-[var(--brand-primary-dark)]',
  'hover:text-[var(--brand-primary)]',
  'hover:border-[var(--brand-primary)]',
  'ring-[var(--brand-primary)]',
].join(' ')

const ACCENT_FAMILIES =
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const DARK_NEUTRALS = 'slate|gray|zinc|neutral|stone'
const SURFACE_KEYS = new Set<keyof TemplateTheme>(['hero', 'stats', 'ctaBanner', 'contact', 'navCta', 'stepNum'])

const COLOR_UTIL = new RegExp(
  `(^|\\s)((?:hover:|focus:|group-hover:)*)(bg|text|from|to|via|border|ring|outline|fill|stroke)-((?:${ACCENT_FAMILIES})-\\d{2,3}|\\[#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\])`,
  'g',
)

const DARK_NEUTRAL_UTIL = new RegExp(
  `(^|\\s)((?:hover:|focus:)*)(bg|from|to|via|border)-(?:${DARK_NEUTRALS})-(800|900|950)\\b`,
  'g',
)

function brandToken(shade: number): string {
  if (shade <= 300) return 'var(--brand-tint)'
  if (shade <= 600) return 'var(--brand-primary)'
  if (shade <= 700) return 'var(--brand-primary-dark)'
  return 'var(--brand-secondary)'
}

function varClass(prefix: string, prop: string, token: string): string {
  return `${prefix}${prop}-[${token}]`
}

function rewriteColorUtilities(value: string, recastDarkNeutrals: boolean): string {
  let next = value.replace(COLOR_UTIL, (_full, lead: string, prefix: string, prop: string, color: string) => {
    const shadeMatch = color.match(/-(\d{2,3})$/)
    const shade = shadeMatch ? Number(shadeMatch[1]) : 600
    const token = brandToken(shade)
    return `${lead}${varClass(prefix, prop, token)}`
  })

  if (recastDarkNeutrals) {
    next = next.replace(DARK_NEUTRAL_UTIL, (_full, lead: string, prefix: string, prop: string) => {
      return `${lead}${varClass(prefix, prop, 'var(--brand-secondary)')}`
    })
  }

  return next
}

function recastGradient(value: string): string {
  if (!/\b(?:bg-gradient-|from-|to-|via-)/.test(value)) return value
  return value
    .replace(/\bfrom-[a-z]+-\d{2,3}\b/g, 'from-[var(--brand-secondary)]')
    .replace(/\bto-[a-z]+-\d{2,3}\b/g, 'to-[var(--brand-primary)]')
    .replace(/\bvia-[a-z]+-\d{2,3}\b/g, 'via-[var(--brand-primary)]')
}

export function applyCustomPaletteToTheme(theme: TemplateTheme): TemplateTheme {
  const next = { ...theme }
  for (const key of THEME_KEYS) {
    const recastDark = SURFACE_KEYS.has(key)
    let value = theme[key]
    if (key === 'hero' || key === 'ctaBanner') value = recastGradient(value)
    next[key] = rewriteColorUtilities(value, recastDark)
  }
  if (!/border-\[var\(--brand-primary\)\]/.test(next.teamCard)) {
    next.teamCard = `${next.teamCard} border-t-4 border-[var(--brand-primary)] pt-4`.trim()
  }
  next.cardTitle = next.cardTitle
    .replace(/\btext-(?:slate|gray|zinc|neutral|stone)-\d{2,3}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .concat(' text-[var(--brand-primary)]')
  return next
}
