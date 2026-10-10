import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { AuthShell, authButtonClass, authFieldClass } from '../components/AuthShell'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email, password)
      const next = params.get('return') || '/'
      navigate(next, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const signupQuery = new URLSearchParams()
  const returnTo = params.get('return')
  if (returnTo) signupQuery.set('return', returnTo)

  return (
    <AuthShell title="Welcome back" subtitle="Personal accounts and salespeople sign in here. Agency admins use the agency portal.">
      <form onSubmit={onSubmit} className="space-y-6">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/50">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.et"
            className={authFieldClass}
          />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/50">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldClass}
          />
        </label>
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-10 text-[11px] uppercase tracking-[0.22em] text-navy/45">
        No account?{' '}
        <Link to={`/signup${signupQuery.toString() ? `?${signupQuery}` : ''}`} className="text-navy">
          Create one
        </Link>
      </p>
      <p className="mt-4 text-[11px] uppercase tracking-[0.22em]">
        <Link to="/forgot-password" className="text-navy/45 hover:text-navy">
          Forgot password
        </Link>
      </p>
    </AuthShell>
  )
}
