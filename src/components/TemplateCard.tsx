import { Link } from 'react-router-dom'
import { categories } from '../data/categories'
import { getLayoutVariants } from '../data/layoutVariants'
import type { TemplateMeta } from '../types'

interface Props {
  template: TemplateMeta
}

export function TemplateCard({ template }: Props) {
  const categoryLabel = categories.find((c) => c.id === template.category)?.label ?? template.category
  const layoutCount = getLayoutVariants(template.id).length

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className={`relative h-48 bg-gradient-to-br ${template.previewGradient} p-6`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-wrap gap-2">
          <span className="inline-block rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {categoryLabel}
          </span>
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {layoutCount} layouts
          </span>
        </div>
        <div className="relative mt-4 space-y-2">
          <div className="h-3 w-24 rounded bg-white/30" />
          <div className="h-6 w-40 rounded bg-white/50" />
          <div className="mt-4 flex gap-2">
            <div className="h-16 flex-1 rounded-lg bg-white/20" />
            <div className="h-16 flex-1 rounded-lg bg-white/20" />
            <div className="h-16 flex-1 rounded-lg bg-white/20" />
          </div>
        </div>
        <div
          className="absolute bottom-4 right-4 h-8 w-8 rounded-full opacity-80"
          style={{ backgroundColor: template.accentColor }}
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-xl font-bold text-slate-900">{template.name}</h3>
        <p className="flex-1 text-sm leading-relaxed text-slate-600">{template.description}</p>
        <div className="mt-5 flex gap-3">
          <Link
            to={`/demo/${template.id}`}
            target="_blank"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Preview
          </Link>
          <Link
            to={`/editor/${template.id}`}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Use Template
          </Link>
        </div>
      </div>
    </div>
  )
}