import { useEffect } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { templateDefaults } from '../data/defaults'
import { isValidTemplateId } from '../data/templateIds'
import { TemplateRenderer } from '../templates/TemplateRenderer'
import { loadSavedSite } from '../utils/storage'
import type { TemplateId } from '../types'

export function SiteViewPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const id = templateId ?? ''
  const isDemo = searchParams.get('demo') === 'true'
  const chromeless = searchParams.get('chromeless') === 'true'

  const saved = loadSavedSite()
  const hasUserContent = isValidTemplateId(id) && saved?.templateId === id
  const content = isValidTemplateId(id)
    ? isDemo
      ? templateDefaults[id as TemplateId]
      : hasUserContent
        ? saved.content
        : null
    : null

  useEffect(() => {
    if (!isValidTemplateId(id)) navigate('/')
    else if (!isDemo && !hasUserContent) navigate(`/editor/${id}`)
  }, [id, isDemo, hasUserContent, navigate])

  if (!isValidTemplateId(id) || !content) return null

  const typedId = id as TemplateId

  const schemeId = isDemo ? undefined : saved?.colorSchemeId
  const layoutVariantId = isDemo ? undefined : saved?.layoutVariantId

  if (chromeless) {
    return <TemplateRenderer templateId={typedId} content={content} colorSchemeId={schemeId} layoutVariantId={layoutVariantId} />
  }

  const openFullscreen = () => {
    const params = new URLSearchParams()
    if (isDemo) params.set('demo', 'true')
    params.set('chromeless', 'true')
    window.open(`/site/${id}?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-[100] flex gap-2">
        {!isDemo && (
          <Link
            to={`/editor/${id}`}
            className="rounded-lg border border-white/20 bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md hover:bg-black/80"
          >
            ← Edit
          </Link>
        )}
        <button
          onClick={openFullscreen}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Open Full Window
        </button>
      </div>
      <TemplateRenderer templateId={typedId} content={content} colorSchemeId={schemeId} layoutVariantId={layoutVariantId} />
    </div>
  )
}