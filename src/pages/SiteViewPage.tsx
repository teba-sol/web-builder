import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getTemplateDefaults } from '../data/defaults'
import { isValidTemplateId } from '../data/templateIds'
import { useHospitalityTemplateGuard } from '../hooks/useHospitalityTemplateGuard'
import { TemplateRenderer } from '../templates/TemplateRenderer'
import { loadSavedSite, loadPreviewSite } from '../utils/storage'

export function SiteViewPage() {
  const { templateId, '*': splat = '' } = useParams<{ templateId: string; '*': string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const id = templateId ?? ''
  const subPath = splat.replace(/^\/+|\/+$/g, '')
  const held = useHospitalityTemplateGuard(id)
  const isDemo = searchParams.get('demo') === 'true'
  const chromeless = searchParams.get('chromeless') === 'true'

  const hostFlagsRef = useRef<{ id: string; demo: boolean; chromeless: boolean } | null>(null)
  if (hostFlagsRef.current?.id !== id) {
    hostFlagsRef.current = { id, demo: isDemo, chromeless }
  } else {
    if (isDemo) hostFlagsRef.current.demo = true
    if (chromeless) hostFlagsRef.current.chromeless = true
  }

  const effectiveDemo = isDemo || (hostFlagsRef.current?.id === id && hostFlagsRef.current.demo)
  const effectiveChromeless = chromeless || (hostFlagsRef.current?.id === id && hostFlagsRef.current.chromeless)

  const preview = loadPreviewSite()
  const saved = preview?.templateId === id ? preview : loadSavedSite()
  const hasUserContent = isValidTemplateId(id) && saved?.templateId === id
  const content = isValidTemplateId(id)
    ? effectiveDemo
      ? getTemplateDefaults(id)
      : hasUserContent
        ? saved.content
        : null
    : null

  useEffect(() => {
    if (held) return
    if (!isValidTemplateId(id)) {
      navigate('/')
      return
    }
    if (!effectiveDemo && !hasUserContent) {
      navigate(`/editor/${id}`)
      return
    }
    const nextParams = new URLSearchParams(searchParams)
    let changed = false
    if (effectiveDemo && nextParams.get('demo') !== 'true') {
      nextParams.set('demo', 'true')
      changed = true
    }
    if (effectiveChromeless && nextParams.get('chromeless') !== 'true') {
      nextParams.set('chromeless', 'true')
      changed = true
    }
    if (changed) {
      const target = subPath ? `/site/${id}/${subPath}` : `/site/${id}`
      navigate(`${target}?${nextParams.toString()}`, { replace: true })
    }
  }, [held, id, subPath, effectiveDemo, effectiveChromeless, hasUserContent, searchParams, navigate])

  if (held || !isValidTemplateId(id) || !content) return null

  const schemeId = effectiveDemo ? undefined : saved?.colorSchemeId
  const layoutVariantId = effectiveDemo ? undefined : saved?.layoutVariantId

  if (effectiveChromeless) {
    return <TemplateRenderer templateId={id} content={content} basePath={`/site/${id}`} colorSchemeId={schemeId} layoutVariantId={layoutVariantId} />
  }

  const openFullscreen = () => {
    const params = new URLSearchParams()
    if (effectiveDemo) params.set('demo', 'true')
    params.set('chromeless', 'true')
    const target = subPath ? `/site/${id}/${subPath}` : `/site/${id}`
    window.open(`${target}?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-[100] flex gap-2">
        {!effectiveDemo && (
          <Link
            to={`/editor/${id}`}
            className="rounded-lg border border-white/20 bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md hover:bg-black/80"
          >
            ← Edit
          </Link>
        )}
        <button
          onClick={openFullscreen}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Open Full Window
        </button>
      </div>
      <TemplateRenderer templateId={id} content={content} basePath={`/site/${id}`} colorSchemeId={schemeId} layoutVariantId={layoutVariantId} />
    </div>
  )
}