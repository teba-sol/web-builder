import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { projectIdFromNext, saveBuilderSession } from '../auth/builderSession'

function safeNext(next: string): string {
  if (!next.startsWith('/') || next.startsWith('//')) return '/'
  return next
}

export function HandoffPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = params.get('code')
    const next = params.get('next') || '/'
    if (!code) {
      setError('This link is missing its code. Open the website from Buildaura again.')
      return
    }
    const origin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080'
    let cancelled = false
    fetch(`${origin}/api/v1/auth/handoff/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Handoff failed')
        return response.json() as Promise<{ accessToken?: string }>
      })
      .then((body) => {
        if (cancelled) return
        if (!body.accessToken) throw new Error('Handoff failed')
        saveBuilderSession(body.accessToken, projectIdFromNext(next))
        navigate(safeNext(next), { replace: true })
      })
      .catch(() => {
        if (!cancelled) setError('This link has expired. Open the website from Buildaura again.')
      })
    return () => {
      cancelled = true
    }
  }, [navigate, params])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <p className="max-w-md text-center text-sm text-slate-700">
        {error ?? 'Opening your website…'}
      </p>
    </div>
  )
}
