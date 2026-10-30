import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Lock, PanelLeftClose, PanelLeftOpen, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createProject, getProject } from '../api/projects'
import { ContentForm } from '../components/ContentForm'
import { DownloadButton } from '../components/DownloadButton'
import { PaywallModal } from '../components/PaywallModal'
import { useAuth } from '../auth/AuthContext'
import { rememberProjectId } from '../auth/builderSession'
import { useWebsite } from '../context/WebsiteContext'
import { TemplateRenderer } from '../templates/TemplateRenderer'
import { getTemplateDefaults, getTemplateMeta } from '../data/defaults'
import { appearanceFromSearchParams } from '../data/pickTemplate'
import { isValidTemplateId } from '../data/templateIds'
import { useHospitalityTemplateGuard } from '../hooks/useHospitalityTemplateGuard'

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
    canCloudSave,
    canEdit,
    bindProject,
    markProjectPaid,
    persistNow,
  } = useWebsite()
  const { user } = useAuth()
  const appliedQuery = useRef<string | null>(null)
  const bootedKey = useRef<string | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editorCollapsed, setEditorCollapsed] = useState(false)

  const id = templateId ?? ''
  const held = useHospitalityTemplateGuard(id)
  const template = isValidTemplateId(id) ? getTemplateMeta(id) : undefined
  const projectQuery = searchParams.get('project')
  const viewRequested = searchParams.get('mode') === 'view'

  useEffect(() => {
    if (held) return
    if (!isValidTemplateId(id)) {
      navigate('/')
      return
    }
    rememberProjectId(searchParams.get('project'))
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
  }, [held, id, selectedId, searchParams, content.businessName, selectTemplate, navigate])

  useEffect(() => {
    if (held || !isValidTemplateId(id)) return
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
        if (user?.role === 'SALESPERSON' || user?.role === 'AGENCY_ADMIN') {
          navigate(`/new-site?template=${id}`, { replace: true })
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
  }, [held, id, projectQuery, bindProject, navigate, template?.name, user?.role])

  if (held || !template || !isValidTemplateId(id)) return null

  const readOnly = viewRequested || !canEdit

  const openFullscreen = () => {
    window.open(`/site/${id}?chromeless=true`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="relative z-[200] flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          {!readOnly && (
            <button
              type="button"
              onClick={() => setEditorCollapsed((collapsed) => !collapsed)}
              aria-label={editorCollapsed ? 'Expand editor panel' : 'Collapse editor panel'}
              aria-expanded={!editorCollapsed}
              aria-controls="editor-panel"
              title={editorCollapsed ? 'Expand editor panel' : 'Collapse editor panel'}
              className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {editorCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          )}
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            ← Sites
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <span className="truncate font-semibold text-slate-900">{content.businessName || template.name}</span>
          {readOnly && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              Viewing
            </span>
          )}
          {!canExport && !readOnly && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              {user?.role === 'SALESPERSON' ? 'Contact us — export locked' : 'Unpaid — export locked'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openFullscreen}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Full preview
          </button>
          {!readOnly && (
            <>
              <Link
                to={`/preview/${id}`}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Preview
              </Link>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  if (!canCloudSave) {
                    setPaywallOpen(true)
                    return
                  }
                  setSaving(true)
                  void persistNow()
                    .then(() => toast.success('Site saved'))
                    .catch((err: Error) => toast.error(err.message))
                    .finally(() => setSaving(false))
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {canCloudSave ? <Save size={14} /> : <Lock size={14} />}
                {saving ? 'Saving…' : canCloudSave ? 'Save' : 'Save locked'}
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
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {!readOnly && (
          <aside
            id="editor-panel"
            className={`${editorCollapsed ? 'hidden' : 'flex'} h-full w-full max-w-md shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white`}
          >
            <ContentForm />
          </aside>
        )}

        <main className="min-w-0 flex-1 overflow-hidden bg-slate-200 p-4">
          <div className={`mx-auto flex h-full ${editorCollapsed ? 'w-full' : 'w-[90%]'} flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg`}>
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
