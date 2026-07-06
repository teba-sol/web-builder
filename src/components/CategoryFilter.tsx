import { categories } from '../data/categories'
import type { TemplateCategory } from '../types'

interface Props {
  active: TemplateCategory | 'all'
  onChange: (category: TemplateCategory | 'all') => void
  counts: Record<TemplateCategory | 'all', number>
}

export function CategoryFilter({ active, onChange, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            active === cat.id
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          <span>{cat.icon}</span>
          {cat.label}
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              active === cat.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {counts[cat.id]}
          </span>
        </button>
      ))}
    </div>
  )
}