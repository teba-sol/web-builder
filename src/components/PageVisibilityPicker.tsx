import { pageMetas } from '../data/pageConfig'
import type { PageVisibility } from '../types'

interface Props {
  visibility: PageVisibility
  onToggle: (page: keyof PageVisibility) => void
}

export function PageVisibilityPicker({ visibility, onToggle }: Props) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
      <p className="mb-1 text-sm font-bold uppercase tracking-wider text-indigo-600">Site Pages</p>
      <p className="mb-4 text-xs text-slate-500">Toggle which pages are included when you export your site. Home is always included.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 opacity-70">
          <input type="checkbox" checked disabled className="mt-0.5 h-4 w-4 rounded border-slate-300" />
          <span>
            <span className="block text-sm font-medium text-slate-800">Home</span>
            <span className="block text-xs text-slate-400">Landing page — always on</span>
          </span>
        </div>
        {pageMetas.map((meta) => (
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