import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, UserRound } from 'lucide-react'
import { ApiError } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { AuthShell } from '../components/AuthShell'

type AccountKind = 'personal' | 'agency'

const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900'

export function SignupPage() {
  const { register, completeInvite } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const invite = params.get('invite') ?? ''
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
      if (invite) {
        await completeInvite(invite, fullName, password)
      } else {
        await register(fullName, email, password, accountKind, accountKind === 'agency' ? agencyName : undefined)
      }
      navigate(params.get('return') || '/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  const title = invite
    ? 'Join as salesperson'
    : accountKind === 'agency'
      ? 'Register your agency'
      : 'Create a personal account'
  const subtitle = invite
    ? 'Set a password to start building client sites without the website fee.'
    : accountKind === 'agency'
      ? 'You become the agency admin. Salespeople are added later from the admin console.'
      : 'Use the builder for your own sites. Pay 9,000 birr per website when you export.'

  return (
    <AuthShell title={title} subtitle={subtitle}>
      {!invite && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <AccountTypeButton
            active={accountKind === 'personal'}
            icon={UserRound}
            label="Personal use"
            hint="Just me"
            onClick={() => setAccountKind('personal')}
          />
          <AccountTypeButton
            active={accountKind === 'agency'}
            icon={Building2}
            label="Agency"
            hint="My company"
            onClick={() => setAccountKind('agency')}
          />
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {accountKind === 'agency' && !invite && (
          <label className="block text-sm font-medium text-slate-700">
            Agency name
            <input
              required
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Northwind Digital"
              className={fieldClass}
            />
          </label>
        )}
        <label className="block text-sm font-medium text-slate-700">
          {accountKind === 'agency' && !invite ? 'Your name' : 'Full name'}
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={fieldClass} />
        </label>
        {!invite && (
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
          </label>
        )}
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Creating…' : invite ? 'Accept invite' : accountKind === 'agency' ? 'Create agency account' : 'Create personal account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}

function AccountTypeButton({
  active,
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  active: boolean
  icon: typeof UserRound
  label: string
  hint: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left transition ${
        active
          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? 'text-indigo-700' : 'text-slate-500'}`} />
      <p className="mt-2 text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">{hint}</p>
    </button>
  )
}
