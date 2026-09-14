import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { createProject, getProject } from '../api/projects'
import { ContentForm } from '../components/ContentForm'
import { DownloadButton } from '../components/DownloadButton'
import { PaywallModal } from '../components/PaywallModal'
import { useWebsite } from '../context/WebsiteContext'
import { TemplateRenderer } from '../templates/TemplateRenderer'
import { getTemplateDefaults, getTemplateMeta } from '../data/defaults'
import { appearanceFromSearchParams } from '../data/pickTemplate'
import { isValidTemplateId } from '../data/templateIds'
import { buildSiteDocument, downloadSiteDocument } from '../siteDocument/io'

export function EditorPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    selectTemplate,
    templateId: selectedId,
    content,
    colorSchemeId,
    layoutVariantId,
    projectId,
    canExport,
    bindProject,
    markProjectPaid,
  } = useWebsite()
  const appliedQuery = useRef<string | null>(null)
  const bootedKey = useRef<string | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)

  const id = templateId ?? ''
  const template = isValidTemplateId(id) ? getTemplateMeta(id) : undefined
  const projectQuery = searchParams.get('project')

  useEffect(() => {
    if (!isValidTemplateId(id)) {
      navigate('/')
      return
    }
    const appearance = appearanceFromSearchParams(searchParams)
    const queryKey = `${id}?${searchParams.toString()}`
    if (appearance) {
      if (appliedQuery.current !== queryKey) {
        appliedQuery.current = queryKey
        selectTemplate(id, appearance)
      }
      return
    }
    if (selectedId !== id) {
      if (appliedQuery.current?.startsWith(`${id}?`)) return
      selectTemplate(id)
      return
    }
    const sample = getTemplateDefaults(id)
    if (!content.businessName?.trim() && sample.businessName?.trim()) {
      selectTemplate(id)
    }
  }, [id, selectedId, searchParams, content.businessName, selectTemplate, navigate])

  useEffect(() => {
    if (!isValidTemplateId(id)) return
    const key = `${id}:${projectQuery ?? 'new'}`
    if (bootedKey.current === key) return
    bootedKey.current = key
    const run = async () => {
      try {
        if (projectQuery) {
          const project = await getProject(projectQuery)
          bindProject(project)
          return
        }
        const project = await createProject({
          templateId: id,
          name: template?.name ?? id,
        })
        bindProject(project)
        navigate(`/editor/${id}?project=${project.id}`, { replace: true })
      } catch {
        bootedKey.current = null
      }
    }
    void run()
  }, [id, projectQuery, bindProject, navigate, template?.name])

  if (!template || !isValidTemplateId(id)) return null

  const openFullscreen = () => {
    window.open(`/site/${id}?chromeless=true`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="relative z-[200] flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            ← Back
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <span className="font-semibold text-slate-900">{template.name}</span>
          {!canExport && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              Unpaid — export locked
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openFullscreen}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Full Preview
          </button>
          <Link
            to={`/preview/${id}`}
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            Preview
          </Link>
          <button
            type="button"
            onClick={() => downloadSiteDocument(buildSiteDocument(id, content, colorSchemeId, layoutVariantId))}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Save site JSON
          </button>
          <DownloadButton
            templateId={id}
            content={content}
            colorSchemeId={colorSchemeId}
            layoutVariantId={layoutVariantId}
            canExport={canExport}
            projectId={projectId}
            onNeedPayment={() => setPaywallOpen(true)}
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-full max-w-md shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-bold text-slate-900">Edit your content</h2>
          <ContentForm />
        </aside>

        <main className="flex-1 overflow-hidden bg-slate-200 p-4">
          <div className="mx-auto flex h-full w-[90%] flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 rounded-md bg-white px-3 py-1 text-center text-xs text-slate-400">
                {content.businessName || 'your-site'}.webbuilder.app
              </div>
              <button
                onClick={openFullscreen}
                title="Open full window preview"
                className="rounded px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-200"
              >
                ⛶
              </button>
            </div>
            <div className="editor-site-preview relative min-h-0 flex-1 overflow-y-auto">
              <TemplateRenderer templateId={id} content={content} basePath={`/editor/${id}`} colorSchemeId={colorSchemeId} layoutVariantId={layoutVariantId} />
            </div>
          </div>
        </main>
      </div>
      {projectId && (
        <PaywallModal
          projectId={projectId}
          open={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          onPaid={() => {
            markProjectPaid()
            setPaywallOpen(false)
          }}
        />
      )}
    </div>
  )
}