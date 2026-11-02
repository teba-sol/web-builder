import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'
import { ApiError } from '../api/types'
import { AuthShell, authButtonClass, authFieldClass } from '../components/AuthShell'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      await resetPassword(token, password)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reset failed')
    }
  }

  return (
    <AuthShell title="New password" subtitle="Use at least 8 characters.">
      {!token ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">This reset link is missing a token.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <label className="block text-sm font-medium text-slate-700">
            New password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authFieldClass}
            />
          </label>
          <button type="submit" className={authButtonClass}>
            Update password
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="text-navy">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}
