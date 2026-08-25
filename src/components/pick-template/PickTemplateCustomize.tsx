import { useMemo, type MouseEvent } from 'react'
import { ArrowLeft, Check, Loader2, Monitor, Smartphone } from 'lucide-react'
import { getColorSchemes } from '../../data/colorSchemes'
import { FONT_OPTIONS, getFont, isHexColor } from '../../data/brand'
import {
  CUSTOM_COLOR_SCHEME_ID,
  FONT_PAIRINGS,
  matchingFontPairing,
  type CustomPalette,
} from '../../data/pickTemplate'
import type { SiteContent, TemplateMeta } from '../../types'
import { RichTemplateLayout } from '../../templates/RichTemplateLayout'

interface Props {
  template: TemplateMeta
  content: SiteContent
  colorSchemeId: string
  customPalette: CustomPalette
  fontHeading: string
  fontBody: string
  viewport: 'desktop' | 'mobile'
  submitting: boolean
  error: string | null
  onBack: () => void
  onViewportChange: (viewport: 'desktop' | 'mobile') => void
  onColorSchemeChange: (schemeId: string) => void
  onCustomPaletteChange: (palette: CustomPalette) => void
  onFontChange: (heading: string, body: string) => void
  onSubmit: () => void
}

export function PickTemplateCustomize({
  template,
  content,
  colorSchemeId,
  customPalette,
  fontHeading,
  fontBody,
  viewport,
  submitting,
  error,
  onBack,
  onViewportChange,
  onColorSchemeChange,
  onCustomPaletteChange,
  onFontChange,
  onSubmit,
}: Props) {
  const schemes = getColorSchemes(template.id)
  const customActive = colorSchemeId === CUSTOM_COLOR_SCHEME_ID
  const activePairing = matchingFontPairing(fontHeading, fontBody)
  const headingFont = getFont(fontHeading)
  const bodyFont = getFont(fontBody)
  const previewSchemeId = customActive ? schemes[0]?.id : colorSchemeId
  const customCss = useMemo(() => (customActive ? customPaletteCss(customPalette) : ''), [customActive, customPalette])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All templates
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">Step 2 of 2</p>
      </div>

      <div className="grid min-h-0 flex-1 gap-6 xl:h-[calc(100dvh-11.5rem)] xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] xl:overflow-hidden">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:min-h-[calc(100dvh-11.5rem)]">
          <div className="border-b border-slate-200 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Styling</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{template.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Tune colors and fonts. Content stays as sample copy.</p>
          </div>

          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-5">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-950">Color palette</h3>
              <div className="grid gap-2">
                {schemes.map((scheme) => {
                  const active = !customActive && scheme.id === colorSchemeId
                  return (
                    <button
                      key={scheme.id}
                      type="button"
                      onClick={() => onColorSchemeChange(scheme.id)}
                      className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                        active
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-100'
                          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex -space-x-1.5">
                        {scheme.swatches.map((color) => (
                          <span
                            key={color}
                            className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="flex-1 text-sm font-semibold">{scheme.name}</span>
                      {active && <Check className="h-4 w-4 text-indigo-600" />}
                    </button>
                  )
                })}

                <div
                  className={`rounded-2xl border p-3 ${
                    customActive
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-100'
                      : 'border-slate-200 bg-white text-slate-900'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onColorSchemeChange(CUSTOM_COLOR_SCHEME_ID)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="flex -space-x-1.5">
                      {[customPalette.secondary, customPalette.primary, customPalette.accent].map((color) => (
                        <span
                          key={color}
                          className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: isHexColor(color) ? color : '#cbd5e1' }}
                        />
                      ))}
                    </div>
                    <span className="flex-1 text-sm font-semibold">Your palette</span>
                    {customActive && <Check className="h-4 w-4 text-indigo-600" />}
                  </button>
                  {customActive && (
                    <div className="mt-4 grid gap-3">
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
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-950">Fonts</h3>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => onFontChange('', '')}
                  className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold ${
                    !fontHeading && !fontBody
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-100'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                  }`}
                >
                  Template default
                </button>
                {FONT_PAIRINGS.map((pair) => {
                  const heading = getFont(pair.heading)
                  const body = getFont(pair.body)
                  const active = activePairing === pair.id
                  return (
                    <button
                      key={pair.id}
                      type="button"
                      onClick={() => onFontChange(pair.heading, pair.body)}
                      className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                        active
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-100'
                          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-sm font-semibold">{pair.label}</p>
                      <p className="mt-1 text-lg leading-tight" style={{ fontFamily: heading?.family }}>
                        {heading?.label}
                      </p>
                      <p className="text-xs opacity-70" style={{ fontFamily: body?.family }}>
                        {body?.label} for body text
                      </p>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-500">Heading</span>
                  <select
                    value={fontHeading}
                    onChange={(event) => onFontChange(event.target.value, fontBody)}
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
                  <span className="mb-1 block text-xs font-medium text-slate-500">Body</span>
                  <select
                    value={fontBody}
                    onChange={(event) => onFontChange(fontHeading, event.target.value)}
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

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xl text-slate-950" style={headingFont ? { fontFamily: headingFont.family } : undefined}>
                  {template.name}
                </p>
                <p className="mt-1 text-sm text-slate-500" style={bodyFont ? { fontFamily: bodyFont.family } : undefined}>
                  Heading {headingFont?.label ?? 'template'} · Body {bodyFont?.label ?? 'template'}
                </p>
              </div>
            </section>
          </div>

          <div className="border-t border-slate-200 p-5">
            {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}
            <button
              type="button"
              data-pick-submit
              onClick={onSubmit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Use this look
            </button>
          </div>
        </aside>

        <section className="flex min-h-[70vh] min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 shadow-sm xl:h-full xl:min-h-0">
          <div className="flex items-center justify-between gap-3 border-b border-slate-300 bg-slate-100 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <p className="hidden flex-1 truncate rounded-full bg-white px-3 py-1 text-center text-xs text-slate-400 sm:block">
              {template.name}
            </p>
            <div className="flex rounded-full bg-white p-0.5">
              <button
                type="button"
                onClick={() => onViewportChange('desktop')}
                className={`rounded-full p-1.5 ${viewport === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                aria-label="Desktop preview"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewportChange('mobile')}
                className={`rounded-full p-1.5 ${viewport === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                aria-label="Mobile preview"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-slate-300 p-3 sm:p-5">
            <div
              className={`editor-site-preview h-full overflow-y-auto overflow-x-hidden bg-white shadow-2xl ${
                viewport === 'mobile' ? 'w-full max-w-[390px] rounded-[1.75rem]' : 'w-full max-w-5xl rounded-xl'
              }`}
              onClickCapture={blockPreviewNavigation}
            >
              {customCss ? <style>{customCss}</style> : null}
              <RichTemplateLayout
                variant={template.id}
                content={content}
                basePath="#"
                page="home"
                colorSchemeId={previewSchemeId}
              />
            </div>
          </div>
        </section>
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
      <span className="mb-1 block text-xs font-medium">{label}</span>
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
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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

function customPaletteCss(palette: CustomPalette): string {
  const primary = isHexColor(palette.primary) ? palette.primary.trim() : '#2563eb'
  const secondary = isHexColor(palette.secondary) ? palette.secondary.trim() : '#0f172a'
  const accent = isHexColor(palette.accent) ? palette.accent.trim() : '#f8fafc'
  return `[data-site-brand] {
  --clone-ink: ${secondary};
  --clone-accent: ${primary};
  --clone-highlight: ${accent};
  --brand-primary: ${primary};
  --brand-secondary: ${secondary};
  --brand-accent: ${accent};
}`
}

function blockPreviewNavigation(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.closest('a, button')) {
    event.preventDefault()
    event.stopPropagation()
  }
}
