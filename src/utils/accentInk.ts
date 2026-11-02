function channel(value: number): number {
  const s = value / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function whiteContrast(accent: string): number | null {
  const raw = accent.trim().replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  const lum = 0.2126 * channel(parseInt(full.slice(0, 2), 16))
    + 0.7152 * channel(parseInt(full.slice(2, 4), 16))
    + 0.0722 * channel(parseInt(full.slice(4, 6), 16))
  const hi = Math.max(1, lum)
  const lo = Math.min(1, lum)
  return (hi + 0.05) / (lo + 0.05)
}

export function accentInk(accent: string): 'text-white' | 'text-slate-950' {
  const ratio = whiteContrast(accent)
  if (ratio == null || ratio >= 3) return 'text-white'
  return 'text-slate-950'
}

export function accentLabelColor(accent: string): string {
  return accentInk(accent) === 'text-white' ? accent : '#020617'
}

/** Keep primary actions visible against the light surfaces used by booking forms. */
export function actionBackground(accent: string, fallback = '#0f172a'): string {
  if ((whiteContrast(accent) ?? 0) >= 4.5) return accent
  return (whiteContrast(fallback) ?? 0) >= 4.5 ? fallback : '#0f172a'
}
