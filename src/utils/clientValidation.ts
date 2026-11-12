export function clientNameError(raw: string): string | null {
  const name = raw.trim()
  if (!name) return 'Client name is required.'
  if (name.length < 2) return 'Client name must contain at least 2 characters.'
  if (name.length > 255) return 'Client name must contain no more than 255 characters.'
  return null
}

export function clientEmailError(raw: string): string | null {
  const email = raw.trim()
  if (!email) return null
  if (email.length > 254) return 'Email must contain no more than 254 characters.'
  if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email)) {
    return 'Enter a valid email address, such as name@example.com.'
  }
  return null
}
