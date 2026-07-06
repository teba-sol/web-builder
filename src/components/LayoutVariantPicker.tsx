import { getLayoutVariants } from '../data/layoutVariants'
import type { TemplateId } from '../types'

interface Props {
  templateId: TemplateId
  activeVariantId: string
  onChange: (variantId: string) => void
}

export function LayoutVariantPicker({ templateId, activeVariantId, onChange }: Props) {
  const variants = getLayoutVariants(templateId)

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
        Layout Style
      </h3>
      <div className="grid gap-3">
        {variants.map((variant) => {
          const active = variant.id === activeVariantId
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onChange(variant.id)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                active
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-sm font-semibold ${active ? 'text-indigo-900' : 'text-slate-900'}`}>
                    {variant.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{variant.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      {variant.heroLayout} hero
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      {variant.testimonialLayout} reviews
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      {variant.contactLayout} contact
                    </span>
                  </div>
                </div>
                {active && (
                  <span className="shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
                    Active
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}