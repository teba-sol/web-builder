import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { SiteContent, TemplateMeta } from '../../types'
import { RichTemplateLayout } from '../../templates/RichTemplateLayout'

interface Props {
  template: TemplateMeta
  content: SiteContent
  onClose: () => void
  onUse: () => void
}

export function PickTemplatePreviewModal({ template, content, onClose, onUse }: Props) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-slate-900/40 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${template.name} preview`}
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-[90%] max-w-none flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Preview</p>
            <h2 className="text-lg font-semibold text-slate-950">{template.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onUse}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Use this template
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div
          className="editor-site-preview min-h-0 flex-1 overflow-y-auto"
          onClickCapture={(event) => {
            const target = event.target as HTMLElement
            if (target.closest('a, button')) {
              event.preventDefault()
              event.stopPropagation()
            }
          }}
        >
          <RichTemplateLayout variant={template.id} content={content} basePath="#" page="home" />
        </div>
      </div>
    </div>
  )
}
