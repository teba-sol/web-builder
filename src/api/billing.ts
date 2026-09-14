import { apiFetch } from './client'
import type { CheckoutResponse, PricingSettings, WebsiteBilling } from './types'

export function fetchPricing() {
  return apiFetch<PricingSettings>('/api/v1/billing/pricing')
}

export function fetchWebsiteBilling(projectId: string) {
  return apiFetch<WebsiteBilling>(`/api/v1/billing/websites/${projectId}`)
}

export function startWebsiteCheckout(projectId: string, provider = 'sandbox') {
  return apiFetch<CheckoutResponse>(`/api/v1/billing/websites/${projectId}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ provider }),
  })
}

export function completeSandboxPayment(invoiceId: string) {
  return apiFetch<WebsiteBilling>('/api/v1/billing/sandbox/complete', {
    method: 'POST',
    body: JSON.stringify({ invoiceId }),
  })
}
