import { useEffect, useState } from 'react'
import { completeSandboxPayment, fetchPricing, startWebsiteCheckout } from '../api/billing'
import { ApiError } from '../api/types'
import type { PricingSettings } from '../api/types'

interface Props {
  projectId: string
  open: boolean
  onClose: () => void
  onPaid: () => void
}

export function PaywallModal({ projectId, open, onClose, onPaid }: Props) {
  const [pricing, setPricing] = useState<PricingSettings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    fetchPricing().then(setPricing).catch(() => setPricing(null))
  }, [open])

  if (!open) return null

  const pay = async () => {
    setBusy(true)
    setError(null)
    try {
      const checkout = await startWebsiteCheckout(projectId, 'sandbox')
      await completeSandboxPayment(checkout.invoiceId)
      onPaid()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment failed')
    } finally {
      setBusy(false)
    }
  }

  const amount = pricing ? `${pricing.websitePrice.toLocaleString()} ${pricing.currency}` : '9,000 ETB'

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">Pay for this website</h2>
        <p className="mt-2 text-sm text-slate-600">
          Export and cloud save unlock after a one-time payment of <strong>{amount}</strong> for this website. A second website is a second purchase.
        </p>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
            Not now
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={pay}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? 'Processing…' : `Pay ${amount} (sandbox)`}
          </button>
        </div>
      </div>
    </div>
  )
}
