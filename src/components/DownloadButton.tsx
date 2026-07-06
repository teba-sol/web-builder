import { useState } from 'react'
import { downloadWebsiteZip } from '../export/downloadZip'
import type { SiteContent, TemplateId } from '../types'

interface Props {
  templateId: TemplateId
  content: SiteContent
  className?: string
  label?: string
}

export function DownloadButton({ templateId, content, className, label = 'Download Website (.zip)' }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleDownload = async () => {
    setStatus('loading')
    try {
      await downloadWebsiteZip(templateId, content)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('idle')
      alert('Download failed. Please try again.')
    }
  }

  const text =
    status === 'loading' ? 'Preparing...' : status === 'done' ? 'Downloaded!' : label

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'loading'}
      className={
        className ??
        'rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors'
      }
    >
      {text}
    </button>
  )
}