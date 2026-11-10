import {
  LOGO_SIZE_DEFAULT,
  LOGO_SIZE_MAX,
  LOGO_SIZE_MIN,
  LOGO_SIZE_PRESETS,
  resolveLogoSize,
} from '../data/brand'
import type { SiteContent } from '../types'
import { ImagePicker } from './ImagePicker'

interface Props {
  content: SiteContent
  onChange: (updates: Partial<SiteContent>) => void
}

export function BrandIdentityForm({ content, onChange }: Props) {
  const logoSize = resolveLogoSize(content.logoSize)

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
        <div className="space-y-4 border-t border-navy/10 pt-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={content.logoShowName !== false}
              onChange={(e) => onChange({ logoShowName: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-accent"
            />
            Show business name next to logo
          </label>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="logo-size-slider" className="text-sm font-medium text-slate-700">
                Logo size
              </label>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {logoSize}px
                </span>
                {logoSize !== LOGO_SIZE_DEFAULT && (
                  <button
                    type="button"
                    onClick={() => onChange({ logoSize: LOGO_SIZE_DEFAULT })}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Logo size presets">
              {LOGO_SIZE_PRESETS.map((preset) => {
                const active = logoSize === preset.size
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange({ logoSize: preset.size })}
                    className={`rounded-lg border px-2 py-1.5 text-center text-xs font-semibold transition-colors ${
                      active
                        ? 'border-accent bg-accent text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-navy/40'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>

            <input
              id="logo-size-slider"
              type="range"
              min={LOGO_SIZE_MIN}
              max={LOGO_SIZE_MAX}
              step={2}
              value={logoSize}
              onChange={(e) => onChange({ logoSize: resolveLogoSize(Number(e.target.value)) })}
              className="h-2 w-full cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{LOGO_SIZE_MIN}px</span>
              <span>Fits inside the navbar ({LOGO_SIZE_MAX}px max)</span>
              <span>{LOGO_SIZE_MAX}px</span>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
