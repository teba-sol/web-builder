const TOKEN_KEY = 'buildaura.accessToken'
const PROJECT_KEY = 'buildaura.projectId'

export function saveBuilderSession(accessToken: string, projectId: string | null) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  if (projectId) localStorage.setItem(PROJECT_KEY, projectId)
}

export function rememberProjectId(projectId: string | null) {
  if (projectId) localStorage.setItem(PROJECT_KEY, projectId)
}

export function readBuilderSession(): { accessToken: string; projectId: string } | null {
  const accessToken = localStorage.getItem(TOKEN_KEY)
  const projectId = localStorage.getItem(PROJECT_KEY)
  if (!accessToken || !projectId) return null
  return { accessToken, projectId }
}

export function projectIdFromNext(next: string): string | null {
  const query = next.includes('?') ? next.slice(next.indexOf('?') + 1) : ''
  return new URLSearchParams(query).get('project')
}
