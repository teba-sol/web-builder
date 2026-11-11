import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { readReviewSession, reviewAllowsLocation, reviewEditorPath, reviewPortalUrl } from './reviewSession'

export function ReviewAccessGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const session = readReviewSession()
  if (location.pathname === '/handoff' || !session) return children
  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Opening website review…</div>
  if (!user || !session.accessToken) {
    const portal = reviewPortalUrl(session.role)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6">
        <p className="text-sm text-slate-600">This review session has expired. Open the website again from your portal.</p>
        <a href={portal} className="text-sm font-semibold text-navy underline">Back to portal</a>
      </div>
    )
  }
  if (!reviewAllowsLocation(session, location.pathname, location.search)) {
    return <Navigate to={reviewEditorPath(session)} replace />
  }
  return children
}
