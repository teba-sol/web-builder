import { apiFetch, clearTokens, storeTokens } from './client'
import type { AuthResponse, MeResponse } from './types'

export async function register(
  fullName: string,
  email: string,
  password: string,
  accountType: 'personal' | 'agency' = 'personal',
  agencyName?: string,
) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName,
      email,
      password,
      accountType,
      agencyName: accountType === 'agency' ? agencyName : undefined,
    }),
  })
  storeTokens(response.accessToken, response.refreshToken)
  return response
}

export async function login(email: string, password: string) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  storeTokens(response.accessToken, response.refreshToken)
  return response
}

export async function acceptInvite(token: string, fullName: string, password: string) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/accept-invite', {
    method: 'POST',
    body: JSON.stringify({ token, fullName, password }),
  })
  storeTokens(response.accessToken, response.refreshToken)
  return response
}

export async function logout() {
  const refreshToken = localStorage.getItem('buildoura.refreshToken')
  try {
    await apiFetch('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  } finally {
    clearTokens()
  }
}

export async function forgotPassword(email: string) {
  await apiFetch('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(token: string, password: string) {
  await apiFetch('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export function fetchMe() {
  return apiFetch<MeResponse>('/api/v1/me')
}

export async function consumeHandoff(code: string) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/handoff/consume', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
  storeTokens(response.accessToken, response.refreshToken)
  return response
}
