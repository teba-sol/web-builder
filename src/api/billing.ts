import { apiFetch } from './client'
import type { CheckoutResponse, PriceTier, PricingSettings, Role, WebsiteBilling } from './types'

export function fetchPricing() {
  return apiFetch<PricingSettings>('/api/v1/billing/pricing')
}

export function pricingTierForRole(pricing: PricingSettings | null, role: Role | undefined): PriceTier | null {
  if (!pricing) return null
  const userType = role === 'SALESPERSON' || role === 'AGENCY_ADMIN' ? 'AGENCY' : 'USER'
  return pricing.prices.find((tier) => tier.userType === userType) ?? pricing.prices[0] ?? null
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
