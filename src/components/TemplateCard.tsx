import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isImportedTemplate, removeImportedManifest } from '../catalog/catalog'
import { getTemplateThumbnail } from '../catalog/thumbnails'
import { categories } from '../data/categories'
import { getLayoutVariants } from '../data/layoutVariants'
import type { TemplateMeta } from '../types'

interface Props {
  template: TemplateMeta
}

export function TemplateCard({ template }: Props) {
  const { user } = useAuth()
  const useHref = user?.role === 'SALESPERSON' ? `/new-site?template=${template.id}` : `/editor/${template.id}`
  const categoryLabel = categories.find((c) => c.id === template.category)?.label ?? template.category
  const layoutCount = getLayoutVariants(template.id).length
  const imported = isImportedTemplate(template.id)
  const thumbnail = getTemplateThumbnail(template.id)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`${template.name} hero`}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${template.previewGradient}`} />
        )}

        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          <span className="inline-block rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {categoryLabel}
          </span>
          <span className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {layoutCount} styles
          </span>
          {template.premium && (
            <span className="inline-block rounded-full bg-amber-400/90 px-2.5 py-1 text-[11px] font-bold text-amber-950 backdrop-blur-sm">
              Premium
            </span>
          )}
          {imported && (
            <span className="inline-block rounded-full bg-emerald-400/90 px-2.5 py-1 text-[11px] font-bold text-emerald-950 backdrop-blur-sm">
              Imported
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-lg font-semibold text-slate-900">{template.name}</h3>
        <p className="flex-1 text-sm leading-relaxed text-slate-500">{template.description}</p>
        <div className="mt-5 flex gap-3">
          <Link
            to={`/demo/${template.id}`}
            target="_blank"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Preview
          </Link>
          <Link
            to={useHref}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Use Template
          </Link>
        </div>
        {imported && (
          <button
            type="button"
            onClick={() => removeImportedManifest(template.id)}
            className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700"
          >
            Remove import
          </button>
        )}
      </div>
    </div>
  )
}
