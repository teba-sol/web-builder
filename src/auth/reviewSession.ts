import type { UserProfile } from '../api/types'

const REVIEW_KEY = 'buildoura.reviewSession'

export interface ReviewTarget {
  templateId: string
  projectId: string
  path: string
}

interface ReviewSession extends ReviewTarget {
  accessToken: string
  userId: string
  role: UserProfile['role']
}

export function parseReviewTarget(path: string): ReviewTarget {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) throw new Error('This review link is invalid.')
  const url = new URL(path, 'https://builder.local')
  const match = url.pathname.match(/^\/(editor|site)\/([a-zA-Z0-9_-]+)(?:\/.*)?$/)
  const projectId = url.searchParams.get('project')
  if (!match || !projectId) throw new Error('This review link must identify a website.')
  if (match[1] === 'editor') url.searchParams.set('mode', 'view')
  return { templateId: match[2], projectId, path: `${url.pathname}?${url.searchParams}${url.hash}` }
}

export function readReviewSession(): ReviewSession | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(REVIEW_KEY) ?? 'null') as ReviewSession | null
    if (!value || typeof value.accessToken !== 'string' || !value.userId || !value.projectId || !value.templateId) return null
    if (value.role !== 'AGENCY_ADMIN' && value.role !== 'PLATFORM_ADMIN') return null
    return value
  } catch {
    return null
  }
}

export function storeReviewSession(accessToken: string, user: UserProfile, target: ReviewTarget) {
  sessionStorage.setItem(REVIEW_KEY, JSON.stringify({ ...target, accessToken, userId: user.id, role: user.role }))
}

export function clearReviewSession() {
  sessionStorage.removeItem(REVIEW_KEY)
}

export function expireReviewSession() {
  const session = readReviewSession()
  if (session) sessionStorage.setItem(REVIEW_KEY, JSON.stringify({ ...session, accessToken: '' }))
}

export function reviewEditorPath(session: ReviewTarget) {
  return `/editor/${session.templateId}?project=${encodeURIComponent(session.projectId)}&mode=view`
}

export function reviewAllowsLocation(session: ReviewTarget, pathname: string, search: string) {
  const editor = pathname === `/editor/${session.templateId}` || pathname.startsWith(`/editor/${session.templateId}/`)
  const site = pathname === `/site/${session.templateId}` || pathname.startsWith(`/site/${session.templateId}/`)
  const params = new URLSearchParams(search)
  const project = params.get('project')
  return (editor || site) && (!project || project === session.projectId)
}

export function reviewPortalUrl(role: UserProfile['role'] | undefined) {
  return `${import.meta.env.VITE_ADMIN_ORIGIN || 'http://localhost:5174'}${role === 'AGENCY_ADMIN' ? '/portal/sites' : '/websites'}`
}
