import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  consumeHandoff as consumeHandoffRequest,
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateMe,
} from '../api/auth'
import { ApiError } from '../api/types'
import type { ReviewTarget } from './reviewSession'
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
  completeHandoff: (code: string, target: ReviewTarget) => Promise<void>
  updateProfile: (body: { fullName?: string; currentPassword?: string; newPassword?: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const sessionVersion = useRef(0)

  useEffect(() => {
    const version = sessionVersion.current
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe()
      .then((me) => { if (version === sessionVersion.current) setUser(me.user) })
      .catch((error) => {
        if (version !== sessionVersion.current) return
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearTokens()
        }
        setUser(null)
      })
      .finally(() => { if (version === sessionVersion.current) setLoading(false) })
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

  const completeHandoff = useCallback(async (code: string, target: ReviewTarget) => {
    sessionVersion.current += 1
    setLoading(true)
    try {
      const response = await consumeHandoffRequest(code, target)
      sessionVersion.current += 1
      setUser(response.user)
    } finally {
      setLoading(false)
    }
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
