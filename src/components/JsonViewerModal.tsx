import { useState } from 'react'
import { downloadManifestJson, stringifyManifest } from '../catalog/io'
import type { TemplateManifest } from '../catalog/types'

interface Props {
  manifest: TemplateManifest
  onClose: () => void
}

export function JsonViewerModal({ manifest, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const json = stringifyManifest(manifest)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{manifest.name}</h2>
            <p className="text-sm text-slate-500">{manifest.id}.template.json — design and layout only</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>
        <pre className="flex-1 overflow-auto bg-slate-950 p-5 text-xs leading-relaxed text-slate-100">{json}</pre>
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={copy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
          <button
            type="button"
            onClick={() => downloadManifestJson(manifest)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Download JSON
          </button>
        </div>
      </div>
    </div>
  )
}
