import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import { ApiError } from '../api/types'
import { AuthShell, authButtonClass, authFieldClass } from '../components/AuthShell'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send reset email')
    }
  }

  return (
    <AuthShell title="Reset password" subtitle="If the email exists, we send a one-time reset link.">
      {sent ? (
        <p className="text-sm leading-relaxed text-navy/70">
          If an account exists for that email, a reset link was sent. In local development the link is printed in the API logs.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/50">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authFieldClass}
            />
          </label>
          <button type="submit" className={authButtonClass}>
            Send reset link
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
