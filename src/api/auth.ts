import { apiFetch, clearTokens, storeTokens } from './client'
import type { AuthResponse, MeResponse, UserProfile } from './types'
import { ApiError } from './types'

function requireBuilderAccount(user: UserProfile) {
  if (user.role !== 'CONSUMER' && user.role !== 'SALESPERSON') {
    clearTokens()
    throw new ApiError(403, 'BUILDER_ACCOUNT_NOT_ALLOWED', 'This account cannot sign in to the web builder. Please visit the agency or admin portal instead.')
  }
}

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
  requireBuilderAccount(response.user)
  storeTokens(response.accessToken, response.refreshToken)
  return response
}

export async function login(email: string, password: string) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  requireBuilderAccount(response.user)
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

export async function fetchMe() {
  const response = await apiFetch<MeResponse>('/api/v1/me')
  requireBuilderAccount(response.user)
  return response
}

export async function updateMe(body: { fullName?: string; currentPassword?: string; newPassword?: string }) {
  const response = await apiFetch<{
    user: UserProfile
    agencyName: string | null
    websiteCount: number
    accessToken?: string | null
    refreshToken?: string | null
  }>('/api/v1/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  requireBuilderAccount(response.user)
  if (response.accessToken && response.refreshToken) {
    storeTokens(response.accessToken, response.refreshToken)
  }
  return response
}

export async function consumeHandoff(code: string) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/handoff/consume', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
  requireBuilderAccount(response.user)
  storeTokens(response.accessToken, response.refreshToken)
  return response
}
