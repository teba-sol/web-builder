import { useMemo, useState } from 'react'
import { templates } from '../data/defaults'
import { TemplateCard } from '../components/TemplateCard'
import { CategoryFilter } from '../components/CategoryFilter'
import type { TemplateCategory } from '../types'

export function HomePage() {
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all')

  const filtered = useMemo(
    () => (category === 'all' ? templates : templates.filter((t) => t.category === category)),
    [category],
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
    }
    for (const t of templates) result[t.category]++
    return result
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              WB
            </div>
            <span className="text-lg font-bold text-slate-900">WebBuilder</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Build your website in minutes
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Browse {templates.length} templates by business type — each with multiple layout styles,
            built-in reviews, and contact form support. Preview, customize, and download.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Filter by business type</h2>
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

        <div className="mt-20 rounded-2xl border border-slate-200 bg-white p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Browse & filter', desc: 'Find the right template for your business type.' },
              { step: '2', title: 'Preview & customize', desc: 'See the full design, then add your content and images.' },
              { step: '3', title: 'Download your site', desc: 'Get a .zip with index.html ready to publish anywhere.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}