import { Link } from 'react-router-dom'
import { getManifest, isImportedTemplate, removeImportedManifest } from '../catalog/catalog'
import { categories } from '../data/categories'
import { getLayoutVariants } from '../data/layoutVariants'
import type { TemplateMeta } from '../types'

interface Props {
  template: TemplateMeta
}

export function TemplateCard({ template }: Props) {
  const categoryLabel = categories.find((c) => c.id === template.category)?.label ?? template.category
  const layoutCount = getLayoutVariants(template.id).length
  const imported = isImportedTemplate(template.id)
  const manifest = getManifest(template.id)
  const heroImage = manifest?.defaults.heroImage ?? ''
  const tagline = manifest?.defaults.tagline || template.name
  const businessName = manifest?.defaults.businessName || template.name
  const overlay = Boolean(manifest?.hero.overlay)
  const split = Boolean(manifest?.hero.splitColumns) && !overlay
  const heroPanel = (manifest?.theme.hero ?? 'bg-slate-900 text-white')
    .split(/\s+/)
    .filter((cls) => !/^(p|px|py|pt|pb|pl|pr)-/.test(cls))
    .join(' ')

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 overflow-hidden bg-slate-900">
        {split ? (
          <div className="absolute inset-0 grid grid-cols-2">
            <div className={`relative flex flex-col justify-end p-4 ${heroPanel}`}>
              <p className="mb-1 line-clamp-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">{businessName}</p>
              <p className="line-clamp-3 text-sm font-bold leading-snug text-white">{tagline}</p>
            </div>
            {heroImage ? (
              <img src={heroImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${template.previewGradient}`} />
            )}
          </div>
        ) : (
          <>
            {heroImage ? (
              <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${template.previewGradient}`} />
            )}
            <div className={`absolute inset-0 ${manifest?.hero.overlayGradient || 'bg-black/40'}`} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-16">
              <p className="mb-1 line-clamp-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">{businessName}</p>
              <p className="line-clamp-2 text-sm font-bold leading-snug text-white">{tagline}</p>
            </div>
          </>
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
