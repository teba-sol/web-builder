import { FONT_OPTIONS, getFont } from '../../data/brand'

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
  const toolbar = layout === 'toolbar'

  return (
    <div>
      <h3 className={`font-semibold uppercase tracking-wider text-slate-500 ${toolbar ? 'mb-1.5 text-[11px]' : 'mb-3 text-sm'}`}>
        Fonts
      </h3>
      <div className={toolbar ? 'flex flex-wrap items-end gap-2' : 'grid gap-3 sm:grid-cols-2'}>
        <label className={toolbar ? 'min-w-[10rem] flex-1' : 'block'}>
          <span className={`mb-1 block font-medium text-slate-500 ${toolbar ? 'text-[11px]' : 'text-xs'}`}>Heading</span>
          <select
            value={fontHeading}
            onChange={(event) => onChange(event.target.value, fontBody)}
            className={`w-full border border-slate-200 bg-white text-slate-900 ${toolbar ? 'rounded-lg px-2.5 py-1.5 text-sm' : 'rounded-xl px-3 py-2.5 text-sm'}`}
          >
            <option value="">Template default</option>
            {FONT_OPTIONS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
        <label className={toolbar ? 'min-w-[10rem] flex-1' : 'block'}>
          <span className={`mb-1 block font-medium text-slate-500 ${toolbar ? 'text-[11px]' : 'text-xs'}`}>Body</span>
          <select
            value={fontBody}
            onChange={(event) => onChange(fontHeading, event.target.value)}
            className={`w-full border border-slate-200 bg-white text-slate-900 ${toolbar ? 'rounded-lg px-2.5 py-1.5 text-sm' : 'rounded-xl px-3 py-2.5 text-sm'}`}
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
