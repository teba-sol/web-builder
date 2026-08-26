import type { MouseEvent } from 'react'
import { ArrowLeft, Loader2, Monitor, Smartphone } from 'lucide-react'
import type { CustomPalette } from '../../data/pickTemplate'
import type { SiteContent, TemplateMeta } from '../../types'
import { RichTemplateLayout } from '../../templates/RichTemplateLayout'
import { PalettePicker } from '../style/PalettePicker'
import { FontPicker } from '../style/FontPicker'

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
  const previewSchemeId = colorSchemeId

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-14 z-30 space-y-3 bg-slate-50 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            All templates
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">Step 2 of 2</p>
            <h2 className="text-lg font-semibold text-slate-950">{template.name}</h2>
          </div>
          <button
            type="button"
            data-pick-submit
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Use this look
          </button>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3">
            <PalettePicker
              templateId={template.id}
              colorSchemeId={colorSchemeId}
              customPalette={customPalette}
              onSchemeChange={onColorSchemeChange}
              onCustomPaletteChange={onCustomPaletteChange}
              layout="toolbar"
            />
            <FontPicker
              fontHeading={fontHeading}
              fontBody={fontBody}
              previewName={template.name}
              onChange={onFontChange}
              layout="toolbar"
            />
          </div>
        </div>
      </div>

      <section className="flex min-h-[calc(100dvh-14rem)] min-w-0 flex-1 flex-col rounded-3xl border border-slate-200 bg-slate-200 shadow-sm">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-300 bg-slate-100 px-4 py-2.5">
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
        <div className="flex flex-1 justify-center bg-slate-300 p-2 sm:p-3">
          <div
            className={`editor-site-preview min-h-[calc(100dvh-16rem)] overflow-x-hidden bg-white shadow-2xl ${
              viewport === 'mobile' ? 'w-full max-w-[390px] shrink-0 rounded-[1.75rem]' : 'w-[90%] rounded-xl'
            }`}
            onClickCapture={blockPreviewNavigation}
          >
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
  )
}

function blockPreviewNavigation(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.closest('a, button')) {
    event.preventDefault()
    event.stopPropagation()
  }
}
