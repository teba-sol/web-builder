import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isImportedTemplate, removeImportedManifest } from '../catalog/catalog'
import { getTemplateThumbnail } from '../catalog/thumbnails'
import { categories } from '../data/categories'
import type { TemplateMeta } from '../types'

interface Props {
  template: TemplateMeta
  featured?: boolean
}

export function TemplateCard({ template, featured = false }: Props) {
  const { user } = useAuth()
  const useHref = user
    ? user.role === 'SALESPERSON'
      ? `/new-site?template=${template.id}`
      : `/editor/${template.id}`
    : `/login?return=${encodeURIComponent(`/editor/${template.id}`)}`
  const categoryLabel = categories.find((c) => c.id === template.category)?.label ?? template.category
  const imported = isImportedTemplate(template.id)
  const thumbnail = getTemplateThumbnail(template.id)

  return (
    <div className={`group flex overflow-hidden rounded-2xl shadow-sm ${featured ? 'flex-col border border-navy bg-navy text-white lg:flex-row-reverse' : 'h-full flex-col border border-slate-200 bg-white transition-shadow hover:shadow-lg'}`}>
      <div className={`relative overflow-hidden bg-slate-900 ${featured ? 'aspect-[16/10] lg:aspect-auto lg:w-[58%] lg:shrink-0' : 'aspect-[16/9]'}`}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`${template.name} hero`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${template.previewGradient}`} />
        )}

        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          <span className="inline-block rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {categoryLabel}
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
      <div className={`flex min-w-0 flex-1 flex-col ${featured ? 'justify-center p-7 sm:p-10 lg:py-12' : 'p-5'}`}>
        {featured && <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">In the spotlight</p>}
        <h3 className={`mb-3 font-semibold ${featured ? 'text-3xl tracking-tight sm:text-4xl' : 'text-lg text-slate-900'}`}>{template.name}</h3>
        <p className={`text-sm leading-7 ${featured ? 'text-white/75' : 'flex-1 text-slate-500'}`}>{template.description}</p>
        <div className="mt-5 flex gap-3">
          <Link
            to={`/demo/${template.id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Preview ${template.name} (opens in a new tab)`}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-center text-sm font-semibold transition-colors ${featured ? 'border-white/30 text-white hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            Preview
          </Link>
          <Link
            to={useHref}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-accent-dark transition-colors"
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
