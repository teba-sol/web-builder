import { Eye, Search } from 'lucide-react'
import { getTemplateThumbnail } from '../../catalog/thumbnails'
import { categories } from '../../data/categories'
import { listPickerCategories } from '../../data/pickTemplate'
import type { TemplateCategory, TemplateMeta } from '../../types'

interface Props {
  templates: TemplateMeta[]
  filtered: TemplateMeta[]
  category: TemplateCategory | 'all'
  query: string
  onCategoryChange: (category: TemplateCategory | 'all') => void
  onQueryChange: (query: string) => void
  onPreview: (template: TemplateMeta) => void
  onSelect: (template: TemplateMeta) => void
}

export function PickTemplateGallery({
  templates,
  filtered,
  category,
  query,
  onCategoryChange,
  onQueryChange,
  onPreview,
  onSelect,
}: Props) {
  const pickerCategories = listPickerCategories(templates)
  const counts = Object.fromEntries(
    pickerCategories.map((item) => [
      item.id,
      item.id === 'all' ? templates.length : templates.filter((template) => template.category === item.id).length,
    ]),
  ) as Record<string, number>

  return (
    <div>
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">Step 1 of 2</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Pick a template</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
          Choose a starting look. Next you can change the color palette and fonts, then send it back to your project.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {pickerCategories.map((item) => {
            const active = category === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onCategoryChange(item.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                }`}
              >
                {item.label}
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {counts[item.id] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
        <label className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search templates"
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </div>

      <p className="mb-5 text-sm text-slate-500">
        {filtered.length} template{filtered.length === 1 ? '' : 's'}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center text-slate-500">
          No templates match that filter.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <GalleryCard
              key={template.id}
              template={template}
              onPreview={() => onPreview(template)}
              onSelect={() => onSelect(template)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function GalleryCard({
  template,
  onPreview,
  onSelect,
}: {
  template: TemplateMeta
  onPreview: () => void
  onSelect: () => void
}) {
  const thumbnail = getTemplateThumbnail(template.id)
  const categoryLabel = categories.find((item) => item.id === template.category)?.label ?? template.category

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`${template.name} preview`}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${template.previewGradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {categoryLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <h2 className="text-lg font-semibold text-slate-950">{template.name}</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{template.description}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            onClick={onSelect}
            className="flex-1 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Use this
          </button>
        </div>
      </div>
    </article>
  )
}
