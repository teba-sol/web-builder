import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DownloadButton } from '../components/DownloadButton'
import { useWebsite } from '../context/WebsiteContext'
import { TemplateRenderer } from '../templates/TemplateRenderer'
import { loadSavedSite } from '../utils/storage'
import { isValidTemplateId } from '../data/templateIds'
import { useHospitalityTemplateGuard } from '../hooks/useHospitalityTemplateGuard'
import type { TemplateId } from '../types'

export function PreviewPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { content, templateId: selectedId, colorSchemeId, layoutVariantId } = useWebsite()

  const id = templateId ?? ''
  const held = useHospitalityTemplateGuard(id)
  const saved = loadSavedSite()
  const hasContent = isValidTemplateId(id) && (selectedId === id || saved?.templateId === id)

  useEffect(() => {
    if (held) return
    if (!isValidTemplateId(id)) navigate('/')
    else if (!hasContent) navigate(`/editor/${id}`)
  }, [held, id, hasContent, navigate])

  if (held || !isValidTemplateId(id) || !hasContent) return null

  const activeContent = selectedId === id ? content : saved!.content
  const activeSchemeId = selectedId === id ? colorSchemeId : saved!.colorSchemeId
  const activeLayoutVariantId = selectedId === id ? layoutVariantId : saved!.layoutVariantId
  const templateIdTyped = id as TemplateId

  const openFullscreen = () => {
    window.open(`/site/${id}?chromeless=true`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 right-0 z-[100] flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-md">
        <div className="text-sm text-white">
          <span className="font-semibold">{activeContent.businessName || 'Your Website'}</span>
          <span className="ml-2 text-white/50">Preview</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/editor/${id}`}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            ← Edit Content
          </Link>
          <button
            onClick={openFullscreen}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Full Window Preview
          </button>
          <DownloadButton templateId={templateIdTyped} content={activeContent} colorSchemeId={activeSchemeId} layoutVariantId={activeLayoutVariantId} />
          <Link
            to="/"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            New Site
          </Link>
        </div>
      </div>

      <div className="pt-14">
        <TemplateRenderer templateId={templateIdTyped} content={activeContent} basePath={`/preview/${id}`} colorSchemeId={activeSchemeId} layoutVariantId={activeLayoutVariantId} />
      </div>

      <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-emerald-500/30 bg-emerald-950/90 px-6 py-3 text-sm text-emerald-100 shadow-xl backdrop-blur-md">
        Happy with your site? Click <strong>Download Website (.zip)</strong> to get your files.
      </div>
    </div>
  )
}