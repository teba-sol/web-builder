import { apiFetch } from './client'
import type { ClientRecord } from './types'

export function listClients() {
  return apiFetch<ClientRecord[]>('/api/v1/clients')
}

export function createClient(input: { name: string; contactEmail?: string; phone?: string }) {
  return apiFetch<ClientRecord>('/api/v1/clients', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
