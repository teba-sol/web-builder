import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/types'
import { useAuth } from '../auth/AuthContext'

export function HandoffPage() {
  const { completeHandoff } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const code = params.get('code') ?? ''
  const next = params.get('next') || '/'

  useEffect(() => {
    const safeNext = next.startsWith('/') ? next : '/'
    if (!code) {
      setError('This builder link is missing a handoff code.')
      return
    }
    completeHandoff(code)
      .then(() => navigate(safeNext, { replace: true }))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not open the builder'))
  }, [code, completeHandoff, navigate, next])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <p className="text-sm text-slate-600">{error ?? 'Opening the site in the web builder…'}</p>
    </div>
  )
}
