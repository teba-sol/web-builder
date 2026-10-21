import { AppHeader } from '../components/AppHeader'
import { RecentlyUsed } from '../components/RecentlyUsed'
import { TemplateGallery } from '../components/TemplateGallery'
import { useTemplateCatalog } from '../catalog/useTemplateCatalog'
import { templatesForPersonalAccount } from '../data/hospitalityAccess'
import { useAuth } from '../auth/AuthContext'
import { AgencyReviewHome } from './AgencyReviewHome'
import { LandingPage } from './LandingPage'
import { SalespersonHome } from './SalespersonHome'

export function HomePage() {
  const { user, loading } = useAuth()
  const templates = templatesForPersonalAccount(useTemplateCatalog())

  if (!loading && !user) {
    return <LandingPage />
  }
  if (!loading && user?.role === 'SALESPERSON') {
    return <SalespersonHome />
  }
  if (!loading && (user?.role === 'AGENCY_ADMIN' || user?.role === 'PLATFORM_ADMIN')) {
    return <AgencyReviewHome />
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium text-navy">Website builder</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 md:text-[2.75rem]">
            Choose a template. Ship a working site.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Browse {templates.length} designs, edit your content, then save in the cloud and export when the website is unlocked.
          </p>
        </div>

        <RecentlyUsed />

        <TemplateGallery title="Template gallery" />

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { step: '01', title: 'Browse', desc: 'Filter by business type and preview the live design.' },
            { step: '02', title: 'Customize', desc: 'Edit copy, images, colors, and layout in the builder.' },
            { step: '03', title: 'Export', desc: 'Save your draft, then download a working site when it is unlocked.' },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold tracking-wide text-accent">{item.step}</p>
              <h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}