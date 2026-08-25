import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FONT_OPTIONS, fontsStylesheetHref } from '../data/brand'
import { getDefaultColorSchemeId } from '../data/colorSchemes'
import { getTemplateDefaults } from '../data/defaults'
import {
  CUSTOM_COLOR_SCHEME_ID,
  buildPickTemplatePayload,
  emptyCustomPalette,
  fontLabel,
  isSafeHttpUrl,
  listPickerTemplates,
  paletteFromScheme,
  submitPickTemplatePayload,
  validatePickSelection,
  type CustomPalette,
  type PickTemplatePayload,
} from '../data/pickTemplate'
import { PickTemplateCustomize } from '../components/pick-template/PickTemplateCustomize'
import { PickTemplateGallery } from '../components/pick-template/PickTemplateGallery'
import { PickTemplatePreviewModal } from '../components/pick-template/PickTemplatePreviewModal'
import type { TemplateCategory, TemplateMeta } from '../types'

type Step = 'gallery' | 'customize' | 'done'

export function PickTemplatePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const submitUrl = searchParams.get('submitUrl') ?? searchParams.get('callback') ?? envSubmitUrl()
  const returnUrl = searchParams.get('returnUrl') ?? searchParams.get('redirect') ?? ''
  const parentOrigin = searchParams.get('origin') ?? ''

  const templates = useMemo(() => listPickerTemplates(), [])
  const [step, setStep] = useState<Step>('gallery')
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<TemplateMeta | null>(null)
  const [preview, setPreview] = useState<TemplateMeta | null>(null)
  const [colorSchemeId, setColorSchemeId] = useState('')
  const [customPalette, setCustomPalette] = useState<CustomPalette>(emptyCustomPalette())
  const [fontHeading, setFontHeading] = useState('')
  const [fontBody, setFontBody] = useState('')
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payload, setPayload] = useState<PickTemplatePayload | null>(null)

  useEffect(() => {
    const href = fontsStylesheetHref(FONT_OPTIONS.map((font) => font.id))
    if (!href) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
    return () => {
      link.remove()
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return templates.filter((template) => {
      if (category !== 'all' && template.category !== category) return false
      if (!needle) return true
      return (
        template.name.toLowerCase().includes(needle) ||
        template.description.toLowerCase().includes(needle) ||
        template.category.toLowerCase().includes(needle)
      )
    })
  }, [templates, category, query])

  const previewContent = useMemo(() => {
    if (!selected) return null
    const base = getTemplateDefaults(selected.id)
    const usingCustom = colorSchemeId === CUSTOM_COLOR_SCHEME_ID
    const palette = usingCustom ? customPalette : paletteFromScheme(selected.id, colorSchemeId)
    return {
      ...base,
      fontHeading,
      fontBody,
      brandPrimary: palette.primary,
      brandSecondary: palette.secondary,
      brandAccent: palette.accent,
    }
  }, [selected, colorSchemeId, customPalette, fontHeading, fontBody])

  const openCustomize = (template: TemplateMeta) => {
    const schemeId = getDefaultColorSchemeId(template.id)
    setSelected(template)
    setColorSchemeId(schemeId)
    setCustomPalette(paletteFromScheme(template.id, schemeId))
    setFontHeading('')
    setFontBody('')
    setViewport('desktop')
    setError(null)
    setPreview(null)
    setStep('customize')
  }

  const handleSchemeChange = (schemeId: string) => {
    if (!selected) return
    if (schemeId === CUSTOM_COLOR_SCHEME_ID) {
      setCustomPalette((current) =>
        colorSchemeId === CUSTOM_COLOR_SCHEME_ID ? current : paletteFromScheme(selected.id, colorSchemeId || getDefaultColorSchemeId(selected.id)),
      )
      setColorSchemeId(CUSTOM_COLOR_SCHEME_ID)
      return
    }
    setColorSchemeId(schemeId)
    setCustomPalette(paletteFromScheme(selected.id, schemeId))
  }

  const handleSubmit = async () => {
    if (!selected || !token) return
    const problem = validatePickSelection({
      templateId: selected.id,
      colorSchemeId,
      customPalette: colorSchemeId === CUSTOM_COLOR_SCHEME_ID ? customPalette : null,
    })
    if (problem) {
      setError(problem)
      return
    }

    const nextPayload = buildPickTemplatePayload({
      token,
      templateId: selected.id,
      templateName: selected.name,
      colorSchemeId,
      customPalette: colorSchemeId === CUSTOM_COLOR_SCHEME_ID ? customPalette : null,
      fontHeading,
      fontBody,
    })
    console.log('[pick-template] payload', nextPayload)
    console.log('[pick-template] json', JSON.stringify(nextPayload, null, 2))

    setSubmitting(true)
    setError(null)
    try {
      await submitPickTemplatePayload(nextPayload, {
        submitUrl: submitUrl || undefined,
        parentOrigin: parentOrigin || undefined,
      })
      setPayload(nextPayload)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your selection.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <PickerShell>
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white px-8 py-14 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">WebBuilder</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">This link needs a token</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Open this page from your project so we can attach your choices to the right account.
          </p>
        </div>
      </PickerShell>
    )
  }

  return (
    <PickerShell fill={step === 'customize'}>
      {step === 'gallery' && (
        <PickTemplateGallery
          templates={templates}
          filtered={filtered}
          category={category}
          query={query}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
          onPreview={setPreview}
          onSelect={openCustomize}
        />
      )}

      {step === 'customize' && selected && previewContent && (
        <PickTemplateCustomize
          template={selected}
          content={previewContent}
          colorSchemeId={colorSchemeId}
          customPalette={customPalette}
          fontHeading={fontHeading}
          fontBody={fontBody}
          viewport={viewport}
          submitting={submitting}
          error={error}
          onBack={() => setStep('gallery')}
          onViewportChange={setViewport}
          onColorSchemeChange={handleSchemeChange}
          onCustomPaletteChange={(palette) => {
            setColorSchemeId(CUSTOM_COLOR_SCHEME_ID)
            setCustomPalette(palette)
          }}
          onFontChange={(heading, body) => {
            setFontHeading(heading)
            setFontBody(body)
          }}
          onSubmit={() => void handleSubmit()}
        />
      )}

      {step === 'done' && payload && selected && (
        <DoneState payload={payload} template={selected} returnUrl={returnUrl} />
      )}

      {preview && (
        <PickTemplatePreviewModal
          template={preview}
          content={getTemplateDefaults(preview.id)}
          onClose={() => setPreview(null)}
          onUse={() => openCustomize(preview)}
        />
      )}
    </PickerShell>
  )
}

function PickerShell({
  children,
  fill = false,
}: {
  children: ReactNode
  fill?: boolean
}) {
  return (
    <div
      className={`flex flex-col bg-slate-50 text-slate-900 ${
        fill ? 'min-h-screen xl:h-screen xl:overflow-hidden' : 'min-h-screen'
      }`}
    >
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              WB
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">WebBuilder</p>
              <p className="text-[11px] text-slate-500">Template picker</p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10 xl:h-full">{children}</main>
    </div>
  )
}

function DoneState({
  payload,
  template,
  returnUrl,
}: {
  payload: PickTemplatePayload
  template: TemplateMeta
  returnUrl: string
}) {
  const safeReturn = isSafeHttpUrl(returnUrl) ? returnUrl : ''

  useEffect(() => {
    if (!safeReturn) return
    const timer = window.setTimeout(() => {
      window.location.assign(safeReturn)
    }, 1600)
    return () => window.clearTimeout(timer)
  }, [safeReturn])

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-slate-200 bg-white px-8 py-14 text-center shadow-sm">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
        ✓
      </div>
      <h1 className="text-3xl font-semibold text-slate-950">Look selected</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {template.name} is ready for your project, with the palette and fonts you chose.
      </p>
      <div className="mt-8 flex items-center gap-2">
        {payload.colorScheme.swatches.map((color) => (
          <span key={color} className="h-8 w-8 rounded-full border border-slate-200" style={{ backgroundColor: color }} />
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-700">
        {payload.font.heading || payload.font.body
          ? `${fontLabel(payload.font.heading)} / ${fontLabel(payload.font.body)}`
          : 'Template fonts'}
      </p>
      {safeReturn ? (
        <a
          href={safeReturn}
          className="mt-8 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Continue
        </a>
      ) : (
        <p className="mt-8 text-xs text-slate-500">Your project can now read the selection from the submitted JSON.</p>
      )}
    </div>
  )
}

function envSubmitUrl(): string {
  const value = import.meta.env.VITE_PICK_TEMPLATE_SUBMIT_URL
  return typeof value === 'string' ? value : ''
}
