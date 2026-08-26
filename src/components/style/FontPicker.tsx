import { FONT_OPTIONS, getFont } from '../../data/brand'
import { FONT_PAIRINGS, matchingFontPairing } from '../../data/pickTemplate'

interface Props {
  fontHeading: string
  fontBody: string
  previewName?: string
  onChange: (heading: string, body: string) => void
  layout?: 'stack' | 'toolbar'
}

export function FontPicker({
  fontHeading,
  fontBody,
  previewName = 'Your business',
  onChange,
  layout = 'stack',
}: Props) {
  const headingFont = getFont(fontHeading)
  const bodyFont = getFont(fontBody)
  const activePairing = matchingFontPairing(fontHeading, fontBody)
  const toolbar = layout === 'toolbar'

  return (
    <div>
      <h3 className={`font-semibold uppercase tracking-wider text-slate-500 ${toolbar ? 'mb-1.5 text-[11px]' : 'mb-3 text-sm'}`}>
        Fonts
      </h3>
      <div className={toolbar ? 'flex flex-wrap items-end gap-2' : 'grid gap-2'}>
        <button
          type="button"
          onClick={() => onChange('', '')}
          className={`text-left font-semibold ${toolbar ? 'rounded-lg border px-2.5 py-1.5 text-xs' : 'rounded-xl border px-3 py-3 text-sm'} ${
            !fontHeading && !fontBody
              ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-100'
              : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
          }`}
        >
          Template default
        </button>
        {FONT_PAIRINGS.map((pair) => {
          const heading = toolbar ? null : getFont(pair.heading)
          const bodyFontOption = toolbar ? null : getFont(pair.body)
          const active = activePairing === pair.id
          return (
            <button
              key={pair.id}
              type="button"
              onClick={() => onChange(pair.heading, pair.body)}
              className={`text-left ${toolbar ? 'rounded-lg border px-2.5 py-1.5' : 'rounded-xl border px-3 py-3'} ${
                active
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
              }`}
            >
              <p className={`font-semibold ${toolbar ? 'text-xs' : 'text-sm'}`}>{pair.label}</p>
              {!toolbar && (
                <>
                  <p className="mt-1 text-lg leading-tight" style={{ fontFamily: heading?.family }}>
                    {heading?.label}
                  </p>
                  <p className="text-xs opacity-70" style={{ fontFamily: bodyFontOption?.family }}>
                    {bodyFontOption?.label} for body text
                  </p>
                </>
              )}
            </button>
          )
        })}
        {toolbar && (
          <>
            <label className="min-w-[10rem] flex-1">
              <span className="mb-1 block text-[11px] font-medium text-slate-500">Heading</span>
              <select
                value={fontHeading}
                onChange={(event) => onChange(event.target.value, fontBody)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900"
              >
                <option value="">Template default</option>
                {FONT_OPTIONS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[10rem] flex-1">
              <span className="mb-1 block text-[11px] font-medium text-slate-500">Body</span>
              <select
                value={fontBody}
                onChange={(event) => onChange(fontHeading, event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900"
              >
                <option value="">Template default</option>
                {FONT_OPTIONS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      {!toolbar && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-500">Heading</span>
            <select
              value={fontHeading}
              onChange={(event) => onChange(event.target.value, fontBody)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
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
            <span className="mb-1 block text-[11px] font-medium text-slate-500">Body</span>
            <select
              value={fontBody}
              onChange={(event) => onChange(fontHeading, event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
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
      )}

      {!toolbar && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-lg text-slate-950" style={headingFont ? { fontFamily: headingFont.family } : undefined}>
            {previewName}
          </p>
          <p className="mt-1 text-sm text-slate-500" style={bodyFont ? { fontFamily: bodyFont.family } : undefined}>
            Heading {headingFont?.label ?? 'template'} · Body {bodyFont?.label ?? 'template'}
          </p>
        </div>
      )}
    </div>
  )
}
