import { useState } from 'react'
import { Lock } from 'lucide-react'
import { ApiError } from '../api/types'
import { issueCrsCredentials, recordExportEvent, saveProjectDraft } from '../api/projects'
import { isHospitalityTemplate } from '../data/hospitality'
import { downloadWebsiteZip } from '../export/downloadZip'
import type { CrsExportSecrets } from '../export/backend/exportPayload'
import { buildSiteDocument } from '../siteDocument/io'
import type { SiteContent, TemplateId } from '../types'

interface Props {
  templateId: TemplateId
  content: SiteContent
  colorSchemeId?: string
  layoutVariantId?: string
  className?: string
  label?: string
  canExport?: boolean
  projectId?: string | null
  onNeedPayment?: () => void
}

export function DownloadButton({
  templateId,
  content,
  colorSchemeId,
  layoutVariantId,
  className,
  label = 'Download Full Stack (.zip)',
  canExport = true,
  projectId,
  onNeedPayment,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleDownload = async () => {
    if (!canExport) {
      onNeedPayment?.()
      return
    }
    setStatus('loading')
    try {
      const crs = await crsSecretsForExport(templateId, content, colorSchemeId, layoutVariantId, projectId)
      await downloadWebsiteZip(templateId, content, colorSchemeId, layoutVariantId, crs)
      if (projectId) {
        await recordExportEvent(projectId).catch(() => undefined)
      }
      setStatus('done')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('idle')
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Download failed. Please try again.'
      alert(message)
    }
  }

  const text =
    status === 'loading' ? 'Preparing...' : status === 'done' ? 'Downloaded!' : canExport ? label : 'Download locked'

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'loading'}
      className={
        className ??
        'inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60 transition-colors'
      }
    >
      {!canExport && <Lock size={14} />}
      {text}
    </button>
  )
}

/** Saves the site, then asks BuildAura for the hotel id and site key baked into .env. */
async function crsSecretsForExport(
  templateId: TemplateId,
  content: SiteContent,
  colorSchemeId: string | undefined,
  layoutVariantId: string | undefined,
  projectId: string | null | undefined,
): Promise<CrsExportSecrets | undefined> {
  if (!projectId || !isHospitalityTemplate(templateId)) return undefined
  await saveProjectDraft(projectId, {
    name: content.businessName || templateId,
    colorSchemeId,
    layoutVariantId,
    document: buildSiteDocument(templateId, content, colorSchemeId, layoutVariantId),
  })
  const issued = await issueCrsCredentials(projectId)
  return {
    apiBaseUrl: issued.apiBaseUrl,
    apiKey: issued.apiKey,
    hotelId: issued.hotelId,
  }
}