import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { importTemplateJson } from '../catalog/io'
import { importSiteDocument } from '../siteDocument/io'
import { SITE_DOCUMENT_KIND } from '../siteDocument/types'
import { useWebsite } from '../context/WebsiteContext'

export function ImportTemplateButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { restoreSite } = useWebsite()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as { kind?: string }
      if (parsed.kind === SITE_DOCUMENT_KIND) {
        const result = importSiteDocument(text)
        if (!result.ok) {
          setError(result.errors.slice(0, 6).join(' · '))
          return
        }
        restoreSite(result.document)
        navigate(`/editor/${result.document.templateId}`)
        return
      }
      const result = importTemplateJson(text)
      if (!result.ok) {
        setError(result.errors.slice(0, 6).join(' · '))
        return
      }
      navigate(`/demo/${result.manifest.id}`)
    } catch {
      setError('Could not read that file.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
      >
        {busy ? 'Importing…' : 'Import JSON'}
      </button>
      {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
    </div>
  )
}
