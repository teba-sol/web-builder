import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ImportTemplateButton } from './ImportTemplateButton'

export function AppHeader({ extra }: { extra?: React.ReactNode }) {
  const { user, logout, loading } = useAuth()

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            WB
          </div>
          <span className="text-lg font-bold text-slate-900">WebBuilder</span>
        </Link>
        <div className="flex items-center gap-3">
          {extra}
          <ImportTemplateButton />
          {loading ? null : user ? (
            <>
              <Link to="/account" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                {user.fullName}
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
