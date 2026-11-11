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
        <div className="space-y-3 border-t border-navy/10 pt-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={content.logoShowName !== false}
              onChange={(e) => onChange({ logoShowName: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-accent"
            />
            Show business name next to logo
          </label>

          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-1">
            <label htmlFor="logo-size-slider" className="shrink-0 text-xs font-medium text-slate-600">
              Size
            </label>
            <input
              id="logo-size-slider"
              type="range"
              min={LOGO_SIZE_MIN}
              max={LOGO_SIZE_MAX}
              step={2}
              value={logoSize}
              aria-valuetext={`${logoSize} pixels`}
              onChange={(e) => onChange({ logoSize: resolveLogoSize(Number(e.target.value)) })}
              className="m-0 h-1.5 w-full min-w-0 cursor-pointer accent-accent"
            />
            <output htmlFor="logo-size-slider" className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-500">
              {logoSize}px
            </output>
            <button
              type="button"
              disabled={logoSize === LOGO_SIZE_DEFAULT}
              onClick={() => onChange({ logoSize: LOGO_SIZE_DEFAULT })}
              aria-label="Reset logo size to 32 pixels"
              className="shrink-0 rounded px-1 py-1 text-xs font-medium text-accent hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-default disabled:text-slate-300"
            >
              Reset
            </button>
            <div aria-hidden="true" className="relative col-start-2 mx-2 h-5">
              {LOGO_SIZE_PRESETS.map((preset) => (
                <span
                  key={preset.id}
                  className={`absolute top-0 flex flex-col items-center gap-1 text-[10px] leading-none ${logoSize === preset.size ? 'font-semibold text-accent' : 'text-slate-400'}`}
                  style={{
                    left: `${((preset.size - LOGO_SIZE_MIN) / (LOGO_SIZE_MAX - LOGO_SIZE_MIN)) * 100}%`,
                    transform: preset.size === LOGO_SIZE_MAX ? 'translateX(-100%)' : 'translateX(-50%)',
                  }}
                >
                  <span className="h-1 w-px bg-current" />
                  {preset.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
