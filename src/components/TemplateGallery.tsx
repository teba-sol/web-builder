import { useMemo, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { CategoryFilter } from './CategoryFilter'
import { TemplateCard } from './TemplateCard'
import { useTemplateCatalog } from '../catalog/useTemplateCatalog'
import { categories } from '../data/categories'
import { templatesForPersonalAccount } from '../data/hospitalityAccess'
import type { TemplateCategory } from '../types'

export function TemplateGallery({
  title = 'Template gallery',
  subtitle,
}: {
  title?: string
  subtitle?: string
}) {
  const templates = templatesForPersonalAccount(useTemplateCatalog())
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const filtersRef = useRef<HTMLDivElement>(null)

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
    for (const template of templates) result[template.category]++
    return result
  }, [templates])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return templates.filter((template) => {
      if (category !== 'all' && template.category !== category) return false
      if (!q) return true
      const label = categories.find((item) => item.id === template.category)?.label ?? ''
      return (
        template.name.toLowerCase().includes(q) ||
        template.description.toLowerCase().includes(q) ||
        template.category.toLowerCase().includes(q) ||
        label.toLowerCase().includes(q)
      )
    })
  }, [templates, category, query])

  const exploring = category === 'all' && !query.trim()
  const spotlight = templates.find((template) => template.id === 'realtor') ?? templates[0]
  const collections = categories.filter((item) => item.id !== 'all' && counts[item.id] > 0)

  return (
    <section id="templates">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-navy">{title}</h2>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
        </div>
        <label className="relative w-full lg:max-w-sm">
          <span className="sr-only">Search templates</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
          />
        </label>
      </div>
      {exploring && spotlight && (
        <div className="mb-8">
          <TemplateCard template={spotlight} featured />
        </div>
      )}
      <div ref={filtersRef} tabIndex={-1} aria-label="Filter templates by category" className="mb-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 focus:outline-none sm:p-5">
        <CategoryFilter active={category} onChange={setCategory} counts={counts} />
      </div>
      <div className="mb-6 flex items-center justify-between gap-3">
      <p aria-live="polite" className="text-sm text-slate-500">
        Showing <strong className="text-slate-800">{filtered.length}</strong> template{filtered.length !== 1 ? 's' : ''}
      </p>
      {(query || category !== 'all') && (
        <button type="button" onClick={() => { setQuery(''); setCategory('all') }} className="rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:bg-slate-200/60">Clear filters</button>
      )}
      </div>
      {exploring ? (
        <div className="space-y-12">
          {collections.map((collection) => {
            const designs = templates.filter((template) => template.category === collection.id)
            return (
              <section key={collection.id} aria-label={collection.label}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                      <collection.icon size={16} aria-hidden="true" className="shrink-0 text-slate-500" />
                      <span>{designs.length} design{designs.length === 1 ? '' : 's'}</span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-900">{collection.label}</h3>
                    <p className="mt-1 text-sm text-slate-500">{collection.blurb}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => {
                      setCategory(collection.id)
                      filtersRef.current?.scrollIntoView({ block: 'start' })
                      filtersRef.current?.focus({ preventScroll: true })
                    }} className="mr-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-navy hover:bg-slate-200/60">
                      View collection <ArrowRight size={15} />
                    </button>
                    {designs.length > 1 && <>
                      <button type="button" aria-label={`Scroll ${collection.label} left`} onClick={(event) => {
                        const rail = event.currentTarget.closest('section')?.querySelector('[data-template-rail]')
                        rail?.scrollBy({ left: -rail.clientWidth * 0.85, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
                      }} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><ChevronLeft size={16} /></button>
                      <button type="button" aria-label={`Scroll ${collection.label} right`} onClick={(event) => {
                        const rail = event.currentTarget.closest('section')?.querySelector('[data-template-rail]')
                        rail?.scrollBy({ left: rail.clientWidth * 0.85, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
                      }} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"><ChevronRight size={16} /></button>
                    </>}
                  </div>
                </div>
                <div data-template-rail tabIndex={0} role="region" aria-label={`${collection.label} templates, scroll to browse`} className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain rounded-2xl pb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
                  {designs.map((template) => (
                    <div key={template.id} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]">
                      <TemplateCard template={template} />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500">
          <h3 className="font-semibold text-slate-900">No matching templates</h3>
          <p className="mt-2 text-sm">Try another search or clear the filters to explore all designs.</p>
        </div>
      )}
    </section>
  )
}
