import { ApiError, type ApiErrorBody, type AuthResponse } from './types'

const ACCESS_KEY = 'buildoura.accessToken'
const REFRESH_KEY = 'buildoura.refreshToken'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!response.ok) {
        clearTokens()
        return false
      }
      const body = (await response.json()) as AuthResponse
      storeTokens(body.accessToken, body.refreshToken)
      return true
    } catch {
      clearTokens()
      return false
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const access = getAccessToken()
  if (access) headers.set('Authorization', `Bearer ${access}`)

  const response = await fetch(path, { ...init, headers })
  if (response.status === 401 && retry && getRefreshToken()) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return apiFetch<T>(path, init, false)
  }
  if (response.status === 204) return undefined as T
  const text = await response.text()
  const parsed = text ? (JSON.parse(text) as unknown) : undefined
  if (!response.ok) {
    const error = parsed as ApiErrorBody | undefined
    throw new ApiError(response.status, error?.code ?? 'ERROR', error?.message ?? response.statusText)
  }
  return parsed as T
}
