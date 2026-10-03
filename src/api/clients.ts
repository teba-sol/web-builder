import { apiFetch } from './client'
import type { ClientRecord, Page } from './types'

export async function listClients() {
  const result = await apiFetch<Page<ClientRecord>>('/api/v1/clients?size=100')
  return result.items
}

export function createClient(input: { name: string; phone: string; contactEmail?: string }) {
  return apiFetch<ClientRecord>('/api/v1/clients', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
