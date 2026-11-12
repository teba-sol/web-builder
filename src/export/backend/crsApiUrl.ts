export const DEPLOYED_CRS_API_URL = 'https://24.144.94.138.sslip.io'

/** Older API deployments may still return a loopback URL with export credentials. */
export function resolveCrsApiUrl(configured?: string): string {
  const value = configured?.trim().replace(/\/+$/, '')
  if (!value) return DEPLOYED_CRS_API_URL
  const url = new URL(value)
  if (['localhost', '127.0.0.1', '[::1]', '0.0.0.0'].includes(url.hostname)) {
    return DEPLOYED_CRS_API_URL
  }
  return value
}
