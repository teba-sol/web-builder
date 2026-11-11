import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getTemplateDefaults } from '../data/defaults'
import { isValidTemplateId } from '../data/templateIds'
import { useHospitalityTemplateGuard } from '../hooks/useHospitalityTemplateGuard'
import { TemplateRenderer } from '../templates/TemplateRenderer'
import { toast } from 'sonner'
import { openReviewPreview } from '../auth/openReviewPreview'
import { getProject } from '../api/projects'
import type { ProjectResponse } from '../api/types'
import { parseReviewTarget, readReviewSession, reviewPortalUrl } from '../auth/reviewSession'
import { migrateContent } from '../utils/migrateContent'
import type { SiteDocument } from '../siteDocument/types'
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
  const review = readReviewSession()
  const reviewId = review?.projectId
  const [reviewProject, setReviewProject] = useState<ProjectResponse | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)

  useEffect(() => {
    if (!reviewId) return
    let active = true
    setReviewProject(null)
    setReviewError(null)
    void getProject(reviewId).then((project) => {
      if (!active) return
      if (project.templateId !== id) throw new Error('This review link does not match the website.')
      setReviewProject(project)
    }).catch((error) => { if (active) setReviewError(error instanceof Error ? error.message : 'Could not load website') })
    return () => { active = false }
  }, [reviewId, id])

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
  const hasUserContent = reviewId ? Boolean(reviewProject) : isValidTemplateId(id) && saved?.templateId === id
  const reviewDocument = reviewProject?.document as SiteDocument | null
  const content = isValidTemplateId(id)
    ? reviewId
      ? reviewProject ? migrateContent(reviewDocument?.content ?? getTemplateDefaults(id), id) : null
      : effectiveDemo
      ? getTemplateDefaults(id)
      : hasUserContent
        ? saved?.content ?? null
        : null
    : null

  useEffect(() => {
    if (held) return
    if (!isValidTemplateId(id)) {
      navigate('/')
      return
    }
    if (!reviewId && !effectiveDemo && !hasUserContent) {
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
  }, [held, id, subPath, effectiveDemo, effectiveChromeless, hasUserContent, searchParams, navigate, reviewId])

  if (reviewId && (!reviewProject || reviewError)) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-sm text-slate-600"><p>{reviewError ?? 'Loading website review…'}</p>{reviewError && <a href={reviewPortalUrl(review?.role)} className="font-semibold underline">Back to portal</a>}</div>
  }
  if (held || !isValidTemplateId(id) || !content) return null

  const schemeId = reviewProject ? reviewDocument?.colorSchemeId || reviewProject.colorSchemeId || undefined : effectiveDemo ? undefined : saved?.colorSchemeId
  const layoutVariantId = reviewProject ? reviewDocument?.layoutVariantId || reviewProject.layoutVariantId || undefined : effectiveDemo ? undefined : saved?.layoutVariantId

  if (effectiveChromeless) {
    return <TemplateRenderer templateId={id} content={content} basePath={`/site/${id}`} colorSchemeId={schemeId} layoutVariantId={layoutVariantId} />
  }

  const openFullscreen = () => {
    const params = new URLSearchParams()
    if (effectiveDemo) params.set('demo', 'true')
    params.set('chromeless', 'true')
    const target = subPath ? `/site/${id}/${subPath}` : `/site/${id}`
    if (review) {
      params.set('project', review.projectId)
      void openReviewPreview(parseReviewTarget(`${target}?${params}`)).catch((err) => toast.error(err instanceof Error ? err.message : 'Could not open preview'))
      return
    }
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