import type { SiteContent } from '../types'

export interface FontOption {
  id: string
  label: string
  family: string
  google: string
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'inter', label: 'Inter', family: 'Inter, system-ui, sans-serif', google: 'Inter:wght@400;500;600;700;800' },
  { id: 'poppins', label: 'Poppins', family: 'Poppins, system-ui, sans-serif', google: 'Poppins:wght@400;500;600;700' },
  { id: 'montserrat', label: 'Montserrat', family: 'Montserrat, system-ui, sans-serif', google: 'Montserrat:wght@400;600;700' },
  { id: 'outfit', label: 'Outfit', family: 'Outfit, system-ui, sans-serif', google: 'Outfit:wght@400;500;600;700' },
  { id: 'space-grotesk', label: 'Space Grotesk', family: '"Space Grotesk", system-ui, sans-serif', google: 'Space+Grotesk:wght@400;500;600;700' },
  { id: 'open-sans', label: 'Open Sans', family: '"Open Sans", system-ui, sans-serif', google: 'Open+Sans:wght@400;600;700' },
  { id: 'lato', label: 'Lato', family: 'Lato, system-ui, sans-serif', google: 'Lato:wght@400;700' },
  { id: 'source-sans', label: 'Source Sans 3', family: '"Source Sans 3", system-ui, sans-serif', google: 'Source+Sans+3:wght@400;600;700' },
  { id: 'playfair', label: 'Playfair Display', family: '"Playfair Display", Georgia, serif', google: 'Playfair+Display:wght@500;600;700' },
  { id: 'merriweather', label: 'Merriweather', family: 'Merriweather, Georgia, serif', google: 'Merriweather:wght@400;700' },
  { id: 'dm-serif', label: 'DM Serif Display', family: '"DM Serif Display", Georgia, serif', google: 'DM+Serif+Display' },
  { id: 'fraunces', label: 'Fraunces', family: 'Fraunces, Georgia, serif', google: 'Fraunces:wght@500;700' },
]

export function getFont(id: string | undefined): FontOption | undefined {
  if (!id) return undefined
  return FONT_OPTIONS.find((font) => font.id === id)
}

export function isHexColor(value: string | undefined): boolean {
  return Boolean(value && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim()))
}

export function resolveBrandAccent(content: SiteContent, fallback: string): string {
  if (isHexColor(content.brandAccent)) return content.brandAccent.trim()
  if (isHexColor(content.brandPrimary)) return content.brandPrimary.trim()
  return fallback
}

export function showBrandName(content: SiteContent): boolean {
  if (!content.logo) return true
  return content.logoShowName !== false
}

function googleHref(ids: string[]): string {
  const families = ids
    .map((id) => getFont(id)?.google)
    .filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index)
  if (families.length === 0) return ''
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join('&')}&display=swap`
}

export function brandFontHref(content: SiteContent): string {
  return googleHref([content.fontHeading, content.fontBody].filter(Boolean))
}

export function brandCss(content: SiteContent): string {
  const heading = getFont(content.fontHeading)
  const body = getFont(content.fontBody)
  const primary = isHexColor(content.brandPrimary) ? content.brandPrimary.trim() : ''
  const secondary = isHexColor(content.brandSecondary) ? content.brandSecondary.trim() : ''
  const accent = isHexColor(content.brandAccent) ? content.brandAccent.trim() : ''
  const lines = [
    '[data-site-brand] {',
    primary ? `  --brand-primary: ${primary};` : '',
    secondary ? `  --brand-secondary: ${secondary};` : '',
    accent ? `  --brand-accent: ${accent};` : '',
    body ? `  --font-body: ${body.family};` : '',
    heading ? `  --font-heading: ${heading.family};` : '',
    body ? '  font-family: var(--font-body);' : '',
    '}',
    heading ? '[data-site-brand] h1, [data-site-brand] h2, [data-site-brand] h3 { font-family: var(--font-heading); }' : '',
    primary
      ? '[data-site-brand] [data-brand-cta] { background-color: var(--brand-primary) !important; color: #fff !important; border-color: var(--brand-primary) !important; }'
      : '',
  ]
  return lines.filter(Boolean).join('\n')
}

export function brandCtaStyle(content: SiteContent): { backgroundColor: string; color: string } | undefined {
  if (!isHexColor(content.brandPrimary)) return undefined
  return { backgroundColor: content.brandPrimary.trim(), color: '#fff' }
}
