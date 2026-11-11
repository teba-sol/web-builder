import { useEffect, useRef } from 'react'
import { Save, X } from 'lucide-react'

interface Props {
  saving: boolean
  ready: boolean
  locked: boolean
  onStay: () => void
  onDiscard: () => void
  onSave: () => void
}

export function UnsavedChangesDialog({ saving, ready, locked, onStay, onDiscard, onSave }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const previousFocus = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  return (
    <dialog ref={dialog} aria-labelledby="unsaved-title" aria-describedby="unsaved-description" aria-busy={saving}
      onCancel={(event) => { event.preventDefault(); if (!saving) onStay() }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm">
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Save size={22} aria-hidden="true" />
          </div>
          <button type="button" autoFocus disabled={saving} onClick={onStay} aria-label="Close and keep editing"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:opacity-40">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <h2 id="unsaved-title" className="text-xl font-semibold tracking-tight">Save before leaving?</h2>
        <p id="unsaved-description" className="mt-3 text-sm leading-6 text-slate-600">
          Your latest changes haven’t been saved. Save them now, or leave without saving.
          {locked && ' Saving is locked until this website is unlocked.'}
        </p>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" disabled={saving} onClick={onDiscard}
          className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:opacity-50">
          Leave without saving
        </button>
        <button type="button" disabled={saving || !ready} onClick={onSave}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:opacity-50">
          <Save size={16} aria-hidden="true" />
          {saving ? 'Saving…' : 'Save and leave'}
        </button>
      </div>
    </dialog>
  )
}
