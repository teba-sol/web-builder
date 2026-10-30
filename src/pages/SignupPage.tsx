import { LoaderCircle, Building2, UserRound } from 'lucide-react'
import { AuthPasswordField } from '../components/AuthPasswordField'
import { useRef, useState, type FormEvent } from 'react'
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
  const inFlight = useRef(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setSubmitting(true)
    setError(null)
    try {
      await register(fullName, email, password, accountKind, accountKind === 'agency' ? agencyName : undefined)
      navigate(params.get('return') || '/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Signup failed')
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  const title = accountKind === 'agency' ? 'Register an agency' : 'Create an account'
  const subtitle =
    accountKind === 'agency'
      ? 'You become the agency admin. Salespeople are added later from the agency portal.'
      : 'Choose a template and create a website for your business or personal brand.'

  return (
    <AuthShell title={title} subtitle={subtitle}>
      <div role="group" aria-label="Account type" className="mb-6 grid grid-cols-2 gap-3">
        {([{ kind: 'personal', label: 'Personal', icon: UserRound }, { kind: 'agency', label: 'Agency', icon: Building2 }] as const).map(({ kind, label, icon: Icon }) => (
          <button key={kind} type="button" disabled={submitting} aria-pressed={accountKind === kind} onClick={() => { setAccountKind(kind); setError(null) }} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:opacity-50 ${accountKind === kind ? 'border-navy bg-navy/5 text-navy ring-1 ring-navy' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <Icon size={17} />{label}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="space-y-5" aria-busy={submitting}>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}
        <fieldset disabled={submitting} className="space-y-5">
        {accountKind === 'agency' && (
          <label className="block text-sm font-medium text-slate-700">
            Agency name
            <input
              required
              autoComplete="organization"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Northwind Digital"
              className={authFieldClass}
            />
          </label>
        )}
        <label className="block text-sm font-medium text-slate-700">
          {accountKind === 'agency' ? 'Your name' : 'Full name'}
          <input required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={authFieldClass} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
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
        <AuthPasswordField value={password} onChange={setPassword} autoComplete="new-password" minLength={8} hint="Use at least 8 characters." />
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
          {submitting ? 'Creating…' : accountKind === 'agency' ? 'Register agency' : 'Create account'}
        </button>
        </fieldset>
      </form>
      <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to={`/login${params.get('return') ? `?${new URLSearchParams({ return: params.get('return')! })}` : ''}`} className="font-semibold text-navy hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
