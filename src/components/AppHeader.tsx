import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ImportTemplateButton } from './ImportTemplateButton'
import { Initials } from './workspace'

export function AppHeader({ extra }: { extra?: React.ReactNode }) {
  const { user, logout, loading } = useAuth()
  const workspaceUser = user?.role === 'SALESPERSON' || user?.role === 'AGENCY_ADMIN' || user?.role === 'PLATFORM_ADMIN'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-[11px] font-bold tracking-tight text-white">
            B
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">Buildoura</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {extra}
          {!workspaceUser && <ImportTemplateButton />}
          {loading ? null : user ? (
            <>
              {user.role === 'SALESPERSON' && (
                <Link
                  to="/new-site"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  New site
                </Link>
              )}
              {user.role === 'AGENCY_ADMIN' && (
                <a
                  href={`${import.meta.env.VITE_ADMIN_ORIGIN || 'http://localhost:5174'}/portal`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Agency portal
                </a>
              )}
              <Link to="/account" className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-50">
                <Initials name={user.fullName} />
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user.fullName}</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
