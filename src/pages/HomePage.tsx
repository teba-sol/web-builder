import { useMemo, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { RecentlyUsed } from '../components/RecentlyUsed'
import { TemplateCard } from '../components/TemplateCard'
import { CategoryFilter } from '../components/CategoryFilter'
import { useTemplateCatalog } from '../catalog/useTemplateCatalog'
import type { TemplateCategory } from '../types'
import { useAuth } from '../auth/AuthContext'
import { AgencyReviewHome } from './AgencyReviewHome'
import { SalespersonHome } from './SalespersonHome'

export function HomePage() {
  const { user, loading } = useAuth()
  const templates = useTemplateCatalog()
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all')

  const filtered = useMemo(
    () => (category === 'all' ? templates : templates.filter((t) => t.category === category)),
    [category, templates],
  )

  const counts = useMemo(() => {
    const result: Record<TemplateCategory | 'all', number> = {
      all: templates.length,
      business: 0,
      creative: 0,
      food: 0,
      hospitality: 0,
      health: 0,
      tech: 0,
      retail: 0,
      realestate: 0,
      finance: 0,
    }
    for (const t of templates) result[t.category]++
    return result
  }, [templates])

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
          <p className="text-sm font-medium text-indigo-700">Website builder</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 md:text-[2.75rem]">
            Choose a template. Ship a working site.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Browse {templates.length} designs, edit your content, then export. Every download includes site.json so you can restore later.
          </p>
        </div>

        <RecentlyUsed />

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Filter by business type</h2>
          <CategoryFilter active={category} onChange={setCategory} counts={counts} />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <strong className="text-slate-800">{filtered.length}</strong> template{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
            No templates in this category yet.
          </div>
        )}

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { step: '01', title: 'Browse', desc: 'Filter by business type and preview the live design.' },
            { step: '02', title: 'Customize', desc: 'Edit copy, images, colors, and layout in the builder.' },
            { step: '03', title: 'Export', desc: 'Download a working site with site.json for later restore.' },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold tracking-wide text-indigo-600">{item.step}</p>
              <h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}