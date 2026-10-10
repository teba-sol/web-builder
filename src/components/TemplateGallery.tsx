import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { CategoryFilter } from './CategoryFilter'
import { TemplateCard } from './TemplateCard'
import { useTemplateCatalog } from '../catalog/useTemplateCatalog'
import { categories } from '../data/categories'
import type { TemplateCategory } from '../types'

export function TemplateGallery({
  title = 'Template gallery',
  subtitle,
}: {
  title?: string
  subtitle?: string
}) {
  const templates = useTemplateCatalog()
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all')
  const [query, setQuery] = useState('')

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

  return (
    <section id="templates">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-navy">{title}</h2>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
        </div>
        <label className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
          />
        </label>
      </div>
      <div className="mb-8">
        <CategoryFilter active={category} onChange={setCategory} counts={counts} />
      </div>
      <p className="mb-6 text-sm text-slate-500">
        Showing <strong className="text-slate-800">{filtered.length}</strong> template{filtered.length !== 1 ? 's' : ''}
      </p>
      {filtered.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
          No templates match that search.
        </div>
      )}
    </section>
  )
}
