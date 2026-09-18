import { Check } from 'lucide-react'
import { getTemplateThumbnail } from '../catalog/thumbnails'
import { categories } from '../data/categories'
import type { TemplateMeta } from '../types'

export function TemplateSelectCard({
  template,
  selected,
  onSelect,
}: {
  template: TemplateMeta
  selected: boolean
  onSelect: () => void
}) {
  const thumbnail = getTemplateThumbnail(template.id)
  const categoryLabel = categories.find((cat) => cat.id === template.category)?.label ?? template.category

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
        selected
          ? 'border-indigo-600 ring-2 ring-indigo-600'
          : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`${template.name} preview`}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${template.previewGradient}`} />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {categoryLabel}
        </span>
        {selected && (
          <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow">
            <Check className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-semibold text-slate-900">{template.name}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{template.description}</p>
        <a
          href={`/demo/${template.id}`}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="mt-3 text-xs font-semibold text-indigo-700 hover:underline"
        >
          Preview live
        </a>
      </div>
    </div>
  )
}
