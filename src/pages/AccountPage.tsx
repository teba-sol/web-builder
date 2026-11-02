import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, Building2, CreditCard, Lock, Mail, Phone, Shield } from 'lucide-react'
import { fetchMe } from '../api/auth'
import { ApiError } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { RequireAuth } from '../auth/RequireAuth'
import { AppHeader } from '../components/AppHeader'
import { MarketingFooter } from '../components/MarketingFooter'
import { Initials } from '../components/workspace'

export function AccountPage() {
  return (
    <RequireAuth>
      <AccountBody />
    </RequireAuth>
  )
}

function AccountBody() {
  const { user, updateProfile } = useAuth()
  const [agencyName, setAgencyName] = useState<string | null>(null)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMe()
      .then((me) => setAgencyName(me.agencyName))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (user) setFullName(user.fullName)
  }, [user])

  if (!user) return null

  const kind =
    user.role === 'CONSUMER'
      ? 'Personal use'
      : user.role === 'AGENCY_ADMIN'
        ? 'Agency admin'
        : user.role === 'SALESPERSON'
          ? 'Agency salesperson'
          : user.role.toLowerCase().replaceAll('_', ' ')

  const onSave = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await updateProfile({
        fullName,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      })
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Profile saved')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <AppHeader />
      <div className="relative overflow-hidden bg-navy py-10 text-white sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-5 px-6 sm:flex-row sm:items-center">
          <Initials name={user.fullName} size="lg" />
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Profile</p>
            <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight">{user.fullName}</h1>
            <p className="mt-1 text-sm text-white/70">
              {kind}
              {agencyName ? ` · ${agencyName}` : ''}
            </p>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:pb-16">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-navy">Account details</h2>
            <ul className="mt-5 space-y-4">
              <Info icon={Mail} label="Email" value={user.email} />
              <Info icon={Shield} label="Account type" value={kind} />
              {user.phone && <Info icon={Phone} label="Phone" value={user.phone} />}
              {agencyName && <Info icon={Building2} label="Agency" value={agencyName} />}
            </ul>
          </div>
          <form onSubmit={onSave} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                <Lock size={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-navy">Update profile</h2>
                <p className="text-sm text-slate-500">Change your display name or password.</p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Name
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/15"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Current password
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/15"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  New password
                  <input
                    type="password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/15"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500">
                Email cannot be changed. Current password is required only when setting a new password.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
        <section aria-labelledby="account-pricing-title" className="mt-6 flex flex-col justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
              <CreditCard size={18} aria-hidden="true" />
            </span>
            <div>
              <h2 id="account-pricing-title" className="text-lg font-semibold text-navy">Website pricing</h2>
              <p className="mt-1 text-sm text-slate-500">View website fees and options for your account.</p>
            </div>
          </div>
          <Link to="/pricing" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
            View pricing <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-navy">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 break-words text-slate-900">{value}</p>
      </div>
    </li>
  )
}
