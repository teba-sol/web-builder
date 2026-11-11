import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { parseReviewTarget } from '../auth/reviewSession'

export function HandoffPage() {
  const { completeHandoff } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const pending = useRef<{ key: string; promise: Promise<void> } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const code = params.get('code') ?? ''
  const next = params.get('next') || '/'

  useEffect(() => {
    let active = true
    try {
      const target = parseReviewTarget(next)
      if (!code) throw new Error('This builder link is missing a handoff code.')
      const key = `${code}:${target.path}`
      if (pending.current?.key !== key) pending.current = { key, promise: completeHandoff(code, target) }
      void pending.current.promise
        .then(() => { if (active) navigate(target.path, { replace: true }) })
        .catch((err) => { if (active) setError(err instanceof ApiError || err instanceof Error ? err.message : 'Could not open the builder') })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the builder')
    }
    return () => { active = false }
  }, [code, completeHandoff, navigate, next])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <p className="text-sm text-slate-600">{error ?? 'Opening the site in the web builder…'}</p>
    </div>
  )
}
