import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { RequireAuth } from '../auth/RequireAuth'

export function AccountPage() {
  return (
    <RequireAuth>
      <AccountBody />
    </RequireAuth>
  )
}

function AccountBody() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Templates
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Account</h1>
        <dl className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <Row label="Name" value={user.fullName} />
          <Row label="Email" value={user.email} />
          <Row label="Role" value={user.role.toLowerCase().replace('_', ' ')} />
        </dl>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-900">{value}</dd>
    </div>
  )
}
