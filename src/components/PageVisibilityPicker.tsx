import { pageMetas, type PageMeta } from '../data/pageConfig'
import type { PageVisibility } from '../types'

interface Props {
  visibility: PageVisibility
  onToggle: (page: keyof PageVisibility) => void
  pages?: PageMeta[]
}

export function PageVisibilityPicker({ visibility, onToggle, pages = pageMetas }: Props) {
  return (
    <div className="rounded-xl border border-navy/20 bg-navy/5 p-4">
      <p className="mb-1 text-sm font-bold uppercase tracking-wider text-accent">Site Pages</p>
      <p className="mb-4 text-xs text-slate-500">Toggle which pages this template includes. Home is always included. Unused page types stay out of this editor.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 opacity-70">
          <input type="checkbox" checked disabled className="mt-0.5 h-4 w-4 rounded border-slate-300" />
          <span>
            <span className="block text-sm font-medium text-slate-800">Home</span>
            <span className="block text-xs text-slate-400">Landing page — always on</span>
          </span>
        </div>
        {pages.map((meta) => (
          <label
            key={meta.key}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-accent transition-colors"
          >
            <input
              type="checkbox"
              checked={visibility[meta.key]}
              onChange={() => onToggle(meta.key)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-accent focus:ring-navy"
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