import { apiFetch } from './client'
import type { ProjectListResponse, ProjectResponse } from './types'

export function listProjects() {
  return apiFetch<ProjectListResponse>('/api/v1/projects')
}

export function createProject(input: {
  templateId: string
  name?: string
  colorSchemeId?: string
  clientId?: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
}) {
  return apiFetch<ProjectResponse>('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getProject(id: string) {
  return apiFetch<ProjectResponse>(`/api/v1/projects/${id}`)
}

export function saveProjectDraft(id: string, input: {
  name?: string
  colorSchemeId?: string
  layoutVariantId?: string
  document?: unknown
}) {
  return apiFetch<ProjectResponse>(`/api/v1/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function recordExportEvent(id: string) {
  return apiFetch<void>(`/api/v1/projects/${id}/export-event`, { method: 'POST' })
}

export function issueCrsCredentials(id: string) {
  return apiFetch<{ hotelId: string; apiKey: string; prefix: string; apiBaseUrl: string }>(
    `/api/v1/projects/${id}/crs-credentials`,
    { method: 'POST' },
  )
}

export function getExportEntitlement(id: string) {
  return apiFetch<ProjectResponse>(`/api/v1/projects/${id}/export-entitlement`)
}

export function deleteProject(id: string) {
  return apiFetch<void>(`/api/v1/projects/${id}`, { method: 'DELETE' })
}
