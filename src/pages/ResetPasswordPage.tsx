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
        <p className="text-sm text-red-600">This reset link is missing a token.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/50">
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
      <p className="mt-10 text-[11px] uppercase tracking-[0.22em]">
        <Link to="/login" className="text-navy">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}
