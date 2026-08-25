import { getColorSchemes } from '../data/colorSchemes'
import { CUSTOM_COLOR_SCHEME_ID } from '../data/pickTemplate'
import { isHexColor } from '../data/brand'
import type { TemplateId } from '../types'

interface Props {
  templateId: TemplateId
  activeSchemeId: string
  customSwatches?: [string, string, string]
  onChange: (schemeId: string) => void
}

export function ColorSchemePicker({ templateId, activeSchemeId, customSwatches, onChange }: Props) {
  const schemes = getColorSchemes(templateId)
  const customActive = activeSchemeId === CUSTOM_COLOR_SCHEME_ID
  const swatches = (customSwatches ?? ['#0f172a', '#2563eb', '#f8fafc']) as [string, string, string]

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
        Color Scheme
      </h3>
      <div className="grid gap-3">
        {schemes.map((scheme) => {
          const active = !customActive && scheme.id === activeSchemeId
          return (
            <button
              key={scheme.id}
              type="button"
              onClick={() => onChange(scheme.id)}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                active
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex -space-x-1">
                {scheme.swatches.map((color) => (
                  <div
                    key={color}
                    className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${active ? 'text-indigo-900' : 'text-slate-900'}`}>
                  {scheme.name}
                </p>
              </div>
              {active && (
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
                  Active
                </span>
              )}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onChange(CUSTOM_COLOR_SCHEME_ID)}
          className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
            customActive
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex -space-x-1">
            {swatches.map((color) => (
              <div
                key={color}
                className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: isHexColor(color) ? color : '#e2e8f0' }}
              />
            ))}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${customActive ? 'text-indigo-900' : 'text-slate-900'}`}>
              Custom palette
            </p>
            <p className="text-xs text-slate-500">Uses the brand colors above</p>
          </div>
          {customActive && (
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
              Active
            </span>
          )}
        </button>
      </div>
    </div>
  )
}