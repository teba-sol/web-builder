import { FONT_OPTIONS, getFont, isHexColor } from '../data/brand'
import type { SiteContent } from '../types'
import { ImagePicker } from './ImagePicker'

interface Props {
  content: SiteContent
  onChange: (updates: Partial<SiteContent>) => void
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
  const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : '#2563eb'
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-slate-300 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          placeholder="#2563eb"
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
            Clear
          </button>
        )}
      </div>
    </label>
  )
}

export function BrandIdentityForm({ content, onChange }: Props) {
  const heading = getFont(content.fontHeading)
  const body = getFont(content.fontBody)
  const swatches = [
    { label: 'Primary', value: content.brandPrimary },
    { label: 'Secondary', value: content.brandSecondary },
    { label: 'Accent', value: content.brandAccent },
  ]

  return (
    <div className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">Brand identity</p>
        <p className="mt-1 text-xs text-slate-500">
          Logo, palette, and fonts apply in the preview and in the exported site. Leave a color empty to keep the template look.
        </p>
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
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          />
          Show business name next to logo
        </label>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <ColorField label="Primary" value={content.brandPrimary ?? ''} onChange={(brandPrimary) => onChange({ brandPrimary })} />
        <ColorField label="Secondary" value={content.brandSecondary ?? ''} onChange={(brandSecondary) => onChange({ brandSecondary })} />
        <ColorField label="Accent" value={content.brandAccent ?? ''} onChange={(brandAccent) => onChange({ brandAccent })} />
      </div>
      <p className="text-[11px] text-slate-500">Primary colors buttons. Accent tints prices and highlights. Secondary is saved on the brand kit.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Heading font</span>
          <select
            value={content.fontHeading ?? ''}
            onChange={(e) => onChange({ fontHeading: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Template default</option>
            {FONT_OPTIONS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Body font</span>
          <select
            value={content.fontBody ?? ''}
            onChange={(e) => onChange({ fontBody: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Template default</option>
            {FONT_OPTIONS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-lg border border-indigo-100 bg-white p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Preview</p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {swatches.map((swatch) => (
              <div key={swatch.label} className="text-center">
                <span
                  className="block h-8 w-8 rounded-full border border-slate-200"
                  style={{ backgroundColor: isHexColor(swatch.value) ? swatch.value.trim() : '#e2e8f0' }}
                />
                <span className="mt-1 block text-[10px] text-slate-500">{swatch.label}</span>
              </div>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold" style={heading ? { fontFamily: heading.family } : undefined}>
              {content.businessName || 'Your business'}
            </p>
            <p className="truncate text-sm text-slate-600" style={body ? { fontFamily: body.family } : undefined}>
              Heading {heading?.label ?? 'template'} · Body {body?.label ?? 'template'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
