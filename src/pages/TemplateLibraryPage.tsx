import { useAuth } from '../auth/AuthContext'
import { AppHeader } from '../components/AppHeader'
import { PublicHeader } from '../components/landing/PublicHeader'
import { MarketingFooter } from '../components/MarketingFooter'
import { TemplateGallery } from '../components/TemplateGallery'

export function TemplateLibraryPage() {
  const { user, loading } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {user || loading ? <AppHeader /> : <PublicHeader />}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">Find your starting point.</h1>
        <p className="mb-10 text-sm leading-6 text-slate-500">Explore designs by business type, preview the pages, and choose one to make your own.</p>
        <TemplateGallery title="Template library" />
      </main>
      <MarketingFooter />
    </div>
  )
}
