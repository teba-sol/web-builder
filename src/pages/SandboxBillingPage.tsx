import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { completeSandboxPayment } from '../api/billing'
import { ApiError } from '../api/types'
import { RequireAuth } from '../auth/RequireAuth'

export function SandboxBillingPage() {
  return (
    <RequireAuth>
      <SandboxBody />
    </RequireAuth>
  )
}

function SandboxBody() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const invoiceId = params.get('invoiceId') ?? ''
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!invoiceId) setError('Missing invoice id')
  }, [invoiceId])

  const pay = async () => {
    setBusy(true)
    setError(null)
    try {
      await completeSandboxPayment(invoiceId)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Sandbox checkout</h1>
        <p className="mt-2 text-sm text-slate-600">
          This confirms the website purchase without a live payment provider. Use it in development and tests.
        </p>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          type="button"
          disabled={!invoiceId || busy}
          onClick={pay}
          className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? 'Confirming…' : 'Pay sandbox invoice'}
        </button>
        <Link to="/" className="mt-4 block text-center text-sm text-slate-500">
          Cancel
        </Link>
      </div>
    </div>
  )
}
