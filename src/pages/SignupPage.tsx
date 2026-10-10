import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { AuthShell, authButtonClass, authFieldClass } from '../components/AuthShell'

type AccountKind = 'personal' | 'agency'

export function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [accountKind, setAccountKind] = useState<AccountKind>(params.get('type') === 'agency' ? 'agency' : 'personal')
  const [fullName, setFullName] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await register(fullName, email, password, accountKind, accountKind === 'agency' ? agencyName : undefined)
      navigate(params.get('return') || '/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  const title = accountKind === 'agency' ? 'Register an agency' : 'Create an account'
  const subtitle =
    accountKind === 'agency'
      ? 'You become the agency admin. Salespeople are added later from the agency portal.'
      : 'Use the builder for your own sites. One payment unlocks export and cloud save.'

  return (
    <AuthShell title={title} subtitle={subtitle}>
      <div className="mb-10 flex flex-wrap gap-8 text-[11px] font-semibold uppercase tracking-[0.22em]">
        <button
          type="button"
          onClick={() => setAccountKind('personal')}
          className={accountKind === 'personal' ? 'text-accent' : 'text-navy/35 hover:text-navy'}
        >
          Personal
        </button>
        <button
          type="button"
          onClick={() => setAccountKind('agency')}
          className={accountKind === 'agency' ? 'text-accent' : 'text-navy/35 hover:text-navy'}
        >
          Agency
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {accountKind === 'agency' && (
          <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/50">
            Agency name
            <input
              required
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Northwind Digital"
              className={authFieldClass}
            />
          </label>
        )}
        <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/50">
          {accountKind === 'agency' ? 'Your name' : 'Full name'}
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={authFieldClass} />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/50">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldClass}
          />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/50">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldClass}
          />
        </label>
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Creating…' : accountKind === 'agency' ? 'Register agency' : 'Create account'}
        </button>
      </form>
      <p className="mt-10 text-[11px] uppercase tracking-[0.22em] text-navy/45">
        Already have an account?{' '}
        <Link to="/login" className="text-navy">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
