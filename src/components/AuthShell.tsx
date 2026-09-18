import { Link } from 'react-router-dom'
import { Building2, UserRound } from 'lucide-react'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-indigo-700 px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-indigo-700">
            B
          </div>
          <span className="text-lg font-semibold">Buildoura</span>
        </Link>
        <div>
          <h2 className="max-w-md text-4xl font-bold leading-tight">Build for yourself, or as an agency.</h2>
          <p className="mt-4 max-w-md text-indigo-100">
            Personal accounts pay when they export. Agencies get a workspace for salespeople who build client sites without the website fee.
          </p>
          <div className="mt-10 grid max-w-md gap-4">
            <div className="flex gap-3 rounded-2xl bg-white/10 p-4">
              <UserRound className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Personal use</p>
                <p className="text-sm text-indigo-100">Your own sites. Pay 9,000 birr per website when you export.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl bg-white/10 p-4">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Agency</p>
                <p className="text-sm text-indigo-100">Register your agency, then add salespeople from the admin console.</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-indigo-200">Export includes site.json so you can restore your edits later.</p>
      </div>
      <div className="flex min-h-screen flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-[11px] font-bold text-white">
              B
            </div>
            <span className="text-[15px] font-semibold text-slate-900">Buildoura</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
