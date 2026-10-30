import { LoaderCircle } from 'lucide-react'
import { AuthPasswordField } from '../components/AuthPasswordField'
import { useRef, useState, type FormEvent } from 'react'
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
  const inFlight = useRef(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setSubmitting(true)
    setError(null)
    try {
      await login(email, password)
      const next = params.get('return') || '/'
      navigate(next, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  const signupQuery = new URLSearchParams()
  const returnTo = params.get('return')
  if (returnTo) signupQuery.set('return', returnTo)

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue building your websites.">
      <form onSubmit={onSubmit} className="space-y-5" aria-busy={submitting}>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}
        <fieldset disabled={submitting} className="space-y-5">
        <label className="block text-sm font-medium text-slate-700">
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
        <AuthPasswordField value={password} onChange={setPassword} autoComplete="current-password" />
        <div className="flex justify-end"><Link to="/forgot-password" className="text-sm font-semibold text-navy hover:underline">Forgot password?</Link></div>
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        </fieldset>
      </form>
      <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        No account?{' '}
        <Link to={`/signup${signupQuery.toString() ? `?${signupQuery}` : ''}`} className="font-semibold text-navy hover:underline">
          Create one
        </Link>
      </p>

    </AuthShell>
  )
}
