import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { Initials } from './workspace'

function roleLabel(role: string) {
  if (role === 'SALESPERSON') return 'Salesperson'
  if (role === 'AGENCY_ADMIN') return 'Agency admin'
  if (role === 'PLATFORM_ADMIN') return 'Platform admin'
  if (role === 'CONSUMER') return 'Personal'
  return role.replaceAll('_', ' ')
}

export function AppHeader({ extra }: { extra?: React.ReactNode }) {
  const { user, logout, loading } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-[11px] font-bold tracking-tight text-white">
              B
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">Buildoura</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'text-navy' : 'hover:text-navy')}>
              Home
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'text-navy' : 'hover:text-navy')}>
              About
            </NavLink>
            <NavLink to="/pricing" className={({ isActive }) => (isActive ? 'text-navy' : 'hover:text-navy')}>
              Pricing
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {extra}
          {loading ? null : user ? (
            <>
              {user.role === 'SALESPERSON' && (
                <Link
                  to="/new-site"
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-dark"
                >
                  New site
                </Link>
              )}
              {user.role === 'AGENCY_ADMIN' && (
                <a
                  href={`${import.meta.env.VITE_ADMIN_ORIGIN || 'http://localhost:5174'}/portal`}
                  className="hidden rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline"
                >
                  Agency portal
                </a>
              )}
              <AccountMenu name={user.fullName} role={user.role} onLogout={() => void logout()} />
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-dark"
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

function AccountMenu({
  name,
  role,
  onLogout,
}: {
  name: string
  role: string
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="relative" ref={wrap}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-slate-50"
      >
        <Initials name={name} />
        <span className="hidden min-w-0 flex-col items-start text-left leading-tight sm:flex">
          <span className="max-w-[10rem] truncate text-sm font-medium text-navy">{name}</span>
          <span className="text-[11px] text-slate-500">{roleLabel(role)}</span>
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              navigate('/account')
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <UserRound size={15} />
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
