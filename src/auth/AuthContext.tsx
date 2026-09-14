import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { acceptInvite, fetchMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../api/auth'
import { ApiError } from '../api/types'
import { clearTokens, getAccessToken } from '../api/client'
import type { UserProfile } from '../api/types'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  completeInvite: (token: string, fullName: string, password: string) => Promise<void>
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

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const response = await registerRequest(fullName, email, password)
    setUser(response.user)
  }, [])

  const completeInvite = useCallback(async (token: string, fullName: string, password: string) => {
    const response = await acceptInvite(token, fullName, password)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, completeInvite, logout }),
    [user, loading, login, register, completeInvite, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
