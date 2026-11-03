import { Link, useSearchParams } from 'react-router-dom'
import { LayoutGrid, PanelsTopLeft, Plus } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { RecentlyUsed } from '../components/RecentlyUsed'
import { TemplateGallery } from '../components/TemplateGallery'
import { useAuth } from '../auth/AuthContext'
import { LandingPage } from './LandingPage'
import { SalespersonHome } from './SalespersonHome'

export function HomePage() {
  const { user, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const browsing = searchParams.get('view') === 'templates'

  if (!loading && !user) {
    return <LandingPage />
  }
  if (!loading && user?.role === 'SALESPERSON') {
    return <SalespersonHome />
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Your workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {browsing ? 'Find your starting point' : 'My websites'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {browsing ? 'Choose a design, preview it, and make it your own.' : 'Pick up where you left off and manage your websites.'}
            </p>
          </div>
          {!browsing && (
            <Link to="/?view=templates" className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              <Plus size={17} /> Create website
            </Link>
          )}
        </div>
        <nav aria-label="Workspace views" className="mb-8 flex gap-1 border-b border-slate-200">
          {[
            { to: '/', label: 'My websites', icon: PanelsTopLeft, active: !browsing },
            { to: '/?view=templates', label: 'Templates', icon: LayoutGrid, active: browsing },
          ].map(({ to, label, icon: Icon, active }) => (
            <Link key={label} to={to} aria-current={active ? 'page' : undefined} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${active ? 'border-navy text-navy' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}>
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>
        <div hidden={browsing}><RecentlyUsed /></div>
        <div hidden={!browsing}>
          <TemplateGallery title="Explore templates" />
        </div>
      </main>
    </div>
  )
}
