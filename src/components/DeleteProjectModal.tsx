import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { LoaderCircle, Trash2, X } from 'lucide-react'

export function DeleteProjectModal({ name, busy, error, onClose, onConfirm }: {
  name: string
  busy: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    element?.showModal()
    cancel.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  // The modal dialog keeps keyboard focus inside and makes the page behind it inert.
  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Trash2 size={24} aria-hidden="true" />
          </div>
          <button type="button" disabled={busy} onClick={onClose} aria-label="Close delete confirmation" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:opacity-40">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <h2 id={titleId} className="text-xl font-semibold tracking-tight">Delete this website?</h2>
        <p id={descriptionId} className="mt-3 break-words text-sm leading-6 text-slate-600">
          <strong className="font-semibold text-slate-900">{name}</strong> will be removed from your work history. You will no longer be able to open or edit it.
        </p>
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
        <button ref={cancel} type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:opacity-50">
          Keep website
        </button>
        <button type="button" disabled={busy} onClick={onConfirm} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
          {busy ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
          {busy ? 'Deleting…' : 'Delete website'}
        </button>
      </div>
    </dialog>,
    document.body,
  )
}
