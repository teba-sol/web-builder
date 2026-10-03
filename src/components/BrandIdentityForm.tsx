import type { SiteContent } from '../types'
import { ImagePicker } from './ImagePicker'

interface Props {
  content: SiteContent
  onChange: (updates: Partial<SiteContent>) => void
}

export function BrandIdentityForm({ content, onChange }: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-navy/20 bg-navy/5 p-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-accent">Logo</p>
        <p className="mt-1 text-xs text-slate-500">Shown in the navigation. PNG or SVG works best.</p>
      </div>

      <ImagePicker
        label="Logo"
        value={content.logo ?? ''}
        onChange={(logo) => onChange({ logo })}
        hint="PNG or SVG works best. Shown in the navigation."
        fit="contain"
      />
      {content.logo && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={content.logoShowName !== false}
            onChange={(e) => onChange({ logoShowName: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-accent"
          />
          Show business name next to logo
        </label>
      )}

    </div>
  )
}
