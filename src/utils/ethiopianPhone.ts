const SEPARATORS = /[\s().-]/g

/**
 * Ethio telecom mobiles are 09 / +2519. Safaricom mobiles are 07 / +2517.
 * Returns the 9-digit national number (9xxxxxxxx or 7xxxxxxxx), or null.
 */
export function ethiopianMobileNational(raw: string): string | null {
  const compact = raw.trim().replace(SEPARATORS, '')
  const local = compact.match(/^0([79]\d{8})$/)
  if (local) return local[1]
  const international = compact.match(/^\+?251([79]\d{8})$/)
  if (international) return international[1]
  return null
}

export function ethiopianPhoneError(raw: string): string | null {
  if (!raw.trim()) return 'Phone is required'
  if (ethiopianMobileNational(raw)) return null
  return 'Use an Ethio telecom number (09 or +2519) or a Safaricom number (07 or +2517), such as 0911 223 344'
}

/** Canonical +2519xxxxxxxx or +2517xxxxxxxx, or null when the number is not accepted. */
export function normalizeEthiopianPhone(raw: string): string | null {
  const national = ethiopianMobileNational(raw)
  return national ? `+251${national}` : null
}
