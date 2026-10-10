import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  consumeHandoff as consumeHandoffRequest,
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateMe,
} from '../api/auth'
import { ApiError } from '../api/types'
import { clearTokens, getAccessToken } from '../api/client'
import type { UserProfile } from '../api/types'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    fullName: string,
    email: string,
    password: string,
    accountType?: 'personal' | 'agency',
    agencyName?: string,
  ) => Promise<void>
  completeHandoff: (code: string) => Promise<void>
  updateProfile: (body: { fullName?: string; currentPassword?: string; newPassword?: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe()
      .then((me) => setUser(me.user))
      .catch((error) => {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearTokens()
        }
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password)
    setUser(response.user)
  }, [])

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      accountType: 'personal' | 'agency' = 'personal',
      agencyName?: string,
    ) => {
      const response = await registerRequest(fullName, email, password, accountType, agencyName)
      setUser(response.user)
    },
    [],
  )

  const completeHandoff = useCallback(async (code: string) => {
    const response = await consumeHandoffRequest(code)
    setUser(response.user)
  }, [])

  const updateProfile = useCallback(async (body: { fullName?: string; currentPassword?: string; newPassword?: string }) => {
    const response = await updateMe(body)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, completeHandoff, updateProfile, logout }),
    [user, loading, login, register, completeHandoff, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
