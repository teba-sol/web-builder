import { Check } from 'lucide-react'
import { getColorSchemes } from '../../data/colorSchemes'
import { isHexColor } from '../../data/brand'
import { CUSTOM_COLOR_SCHEME_ID, type CustomPalette } from '../../data/pickTemplate'
import type { TemplateId } from '../../types'

interface Props {
  templateId: TemplateId
  colorSchemeId: string
  customPalette: CustomPalette
  onSchemeChange: (schemeId: string) => void
  onCustomPaletteChange: (palette: CustomPalette) => void
  layout?: 'stack' | 'toolbar'
}

export function PalettePicker({
  templateId,
  colorSchemeId,
  customPalette,
  onSchemeChange,
  onCustomPaletteChange,
  layout = 'stack',
}: Props) {
  const schemes = getColorSchemes(templateId)
  const customActive = colorSchemeId === CUSTOM_COLOR_SCHEME_ID
  const toolbar = layout === 'toolbar'

  return (
    <div>
      <h3 className={`font-semibold uppercase tracking-wider text-slate-500 ${toolbar ? 'mb-1.5 text-[11px]' : 'mb-3 text-sm'}`}>
        Color palette
      </h3>
      <div className={toolbar ? 'flex flex-wrap items-start gap-2' : 'grid gap-3'}>
        {schemes.map((scheme) => {
          const active = !customActive && scheme.id === colorSchemeId
          return (
            <button
              key={scheme.id}
              type="button"
              onClick={() => onSchemeChange(scheme.id)}
              className={`flex items-center gap-2 text-left transition-colors ${
                toolbar ? 'rounded-lg border px-2 py-1.5' : 'rounded-xl border-2 p-3'
              } ${
                active
                  ? 'border-navy bg-navy/5 text-navy ring-2 ring-accent/20'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
              }`}
            >
              <span className="flex -space-x-1.5">
                {scheme.swatches.map((color) => (
                  <span
                    key={color}
                    className={`rounded-full border-2 border-white shadow-sm ${toolbar ? 'h-5 w-5' : 'h-8 w-8'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
              <span className={`font-semibold ${toolbar ? 'text-xs' : 'text-sm'}`}>{scheme.name}</span>
              {active && !toolbar ? <Check className="ml-auto h-4 w-4 text-accent" /> : null}
            </button>
          )
        })}

        <div
          className={`${toolbar ? 'rounded-lg border px-2 py-1.5' : 'rounded-xl border-2 p-3'} ${
            customActive
              ? 'border-navy bg-navy/5 text-navy ring-2 ring-accent/20'
              : 'border-slate-200 bg-white text-slate-900'
          }`}
        >
          <button type="button" onClick={() => onSchemeChange(CUSTOM_COLOR_SCHEME_ID)} className="flex w-full items-center gap-2 text-left">
            <span className="flex -space-x-1.5">
              {[customPalette.secondary, customPalette.primary, customPalette.accent].map((color) => (
                <span
                  key={color}
                  className={`rounded-full border-2 border-white shadow-sm ${toolbar ? 'h-5 w-5' : 'h-8 w-8'}`}
                  style={{ backgroundColor: isHexColor(color) ? color : '#e2e8f0' }}
                />
              ))}
            </span>
            <span className={`font-semibold ${toolbar ? 'text-xs' : 'text-sm'}`}>Your palette</span>
            {customActive && !toolbar ? <Check className="ml-auto h-4 w-4 text-accent" /> : null}
          </button>
          {customActive && (
            <div className={`mt-3 grid gap-2 ${toolbar ? 'sm:grid-cols-3' : ''}`}>
              <ColorField
                label="Primary"
                value={customPalette.primary}
                onChange={(primary) => onCustomPaletteChange({ ...customPalette, primary })}
              />
              <ColorField
                label="Secondary"
                value={customPalette.secondary}
                onChange={(secondary) => onCustomPaletteChange({ ...customPalette, secondary })}
              />
              <ColorField
                label="Accent"
                value={customPalette.accent}
                onChange={(accent) => onCustomPaletteChange({ ...customPalette, accent })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const hex = isHexColor(value) ? expandHex(value.trim()) : '#2563eb'
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value.trim())}
          spellCheck={false}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
        />
      </div>
    </label>
  )
}

function expandHex(value: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
  }
  return '#2563eb'
}
