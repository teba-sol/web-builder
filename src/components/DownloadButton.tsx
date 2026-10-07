import { useState } from 'react'
import { readBuilderSession } from '../auth/builderSession'
import { downloadWebsiteZip } from '../export/downloadZip'
import { usesBuildauraCrs, type CrsExportCredentials } from '../export/backend/generateCrsBooking'
import type { SiteContent, TemplateId } from '../types'

interface Props {
  templateId: TemplateId
  content: SiteContent
  colorSchemeId?: string
  layoutVariantId?: string
  className?: string
  label?: string
}

export function DownloadButton({ templateId, content, colorSchemeId, layoutVariantId, className, label = 'Download Full Stack (.zip)' }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleDownload = async () => {
    setStatus('loading')
    try {
      const credentials = await crsCredentialsForDownload(templateId)
      if (credentials === null) {
        setStatus('idle')
        return
      }
      await downloadWebsiteZip(templateId, content, colorSchemeId, layoutVariantId, credentials)
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

/** undefined continues the download. null stops it because a signed-in export could not get a key. */
async function crsCredentialsForDownload(
  templateId: TemplateId,
): Promise<CrsExportCredentials | undefined | null> {
  if (!usesBuildauraCrs(templateId)) return undefined
  const session = readBuilderSession()
  if (!session) {
    alert(
      'Open this website from Buildaura before downloading so .env.example includes a working API key. The download will continue with a blank key.',
    )
    return undefined
  }
  const origin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080'
  const response = await fetch(`${origin}/api/v1/projects/${session.projectId}/crs-credentials`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    alert('Could not issue a Buildaura API key. The download was stopped so the zip does not include a key that will not work.')
    return null
  }
  const body = (await response.json()) as { apiBaseUrl?: string; hotelId?: string; apiKey?: string }
  if (!body.apiKey || !body.hotelId || !body.apiBaseUrl) {
    alert('Could not issue a Buildaura API key. The download was stopped so the zip does not include a key that will not work.')
    return null
  }
  return { apiBaseUrl: body.apiBaseUrl, hotelId: body.hotelId, apiKey: body.apiKey }
}