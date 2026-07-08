import { sectionMetas } from '../data/sectionConfig'
import type { SectionVisibility, ToggleableSection } from '../types'

interface Props {
  visibility: SectionVisibility
  onToggle: (section: ToggleableSection) => void
}

export function SectionVisibilityPicker({ visibility, onToggle }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-500">Optional Sections</p>
      <p className="mb-4 text-xs text-slate-400">Toggle extra sections within your pages (stats, FAQ, pricing, etc.)</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {sectionMetas.map((meta) => (
          <label
            key={meta.key}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-indigo-300 transition-colors"
          >
            <input
              type="checkbox"
              checked={visibility[meta.key]}
              onChange={() => onToggle(meta.key)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">{meta.label}</span>
              <span className="block text-xs text-slate-400">{meta.description}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}