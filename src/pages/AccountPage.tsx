import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMe } from '../api/auth'
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
  const [agencyName, setAgencyName] = useState<string | null>(null)

  useEffect(() => {
    fetchMe()
      .then((me) => setAgencyName(me.agencyName))
      .catch(() => undefined)
  }, [])

  if (!user) return null

  const kind =
    user.role === 'CONSUMER'
      ? 'Personal use'
      : user.role === 'AGENCY_ADMIN'
        ? 'Agency admin'
        : user.role === 'SALESPERSON'
          ? 'Agency salesperson'
          : user.role.toLowerCase().replaceAll('_', ' ')

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
          ← Back
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">Account</h1>
        <dl className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Row label="Name" value={user.fullName} />
          <Row label="Email" value={user.email} />
          <Row label="Account type" value={kind} />
          {agencyName && <Row label="Agency" value={agencyName} />}
        </dl>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
