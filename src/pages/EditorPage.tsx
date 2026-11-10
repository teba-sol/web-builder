import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Lock, PanelLeftClose, PanelLeftOpen, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createProject, getProject, listProjects, saveProjectDraft } from '../api/projects'
import type { ProjectResponse } from '../api/types'
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
import { buildSiteDocument } from '../siteDocument/io'

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
    clearProject,
    markProjectPaid,
    persistNow,
  } = useWebsite()
  const { user } = useAuth()
  const appliedQuery = useRef<string | null>(null)
  const bootedKey = useRef<string | null>(null)
  const bootGuardRef = useRef<Promise<boolean> | null>(null)
  const inFlightCreateRef = useRef<Promise<ProjectResponse | null> | null>(null)
  const initialContentRef = useRef<string | null>(null)
  const [newDraftReady, setNewDraftReady] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editorCollapsed, setEditorCollapsed] = useState(false)

  const id = templateId ?? ''
  const held = useHospitalityTemplateGuard(id)
  const template = isValidTemplateId(id) ? getTemplateMeta(id) : undefined
  const projectQuery = searchParams.get('project')
  const viewRequested = searchParams.get('mode') === 'view'
  const readOnly = viewRequested || !canEdit

  const latestRef = useRef({ projectId, selectedId, searchParams })
  latestRef.current = { projectId, selectedId, searchParams }

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

  const ensureProject = useCallback(async (): Promise<ProjectResponse | null> => {
    if (latestRef.current.projectId) return null
    if (inFlightCreateRef.current) return inFlightCreateRef.current

    const promise = (async (): Promise<ProjectResponse | null> => {
      if (bootGuardRef.current) {
        const redirected = await bootGuardRef.current
        if (redirected) return null
      }
      if (latestRef.current.projectId) return null

      const document = buildSiteDocument(id, content, colorSchemeId, layoutVariantId)
      const created = await createProject({
        templateId: id,
        name: content.businessName || template?.name || id,
        colorSchemeId,
      })
      bootedKey.current = `${id}:${created.id}`
      let bound = created
      if (created.canCloudSave) {
        bound = await saveProjectDraft(created.id, {
          name: content.businessName || template?.name || id,
          colorSchemeId,
          layoutVariantId,
          document,
        })
      }
      bindProject(bound)
      navigate(`/editor/${id}?project=${bound.id}`, { replace: true })
      return bound
    })()

    inFlightCreateRef.current = promise
    try {
      return await promise
    } finally {
      inFlightCreateRef.current = null
    }
  }, [id, content, colorSchemeId, layoutVariantId, template?.name, bindProject, navigate])

  useEffect(() => {
    if (held || !isValidTemplateId(id)) return
    const key = `${id}:${projectQuery ?? 'new'}`
    if (bootedKey.current === key) return
    bootedKey.current = key
    let active = true
    let settled = false
    initialContentRef.current = null
    setNewDraftReady(false)

    const run = async (): Promise<boolean> => {
      try {
        if (projectQuery) {
          const project = await getProject(projectQuery)
          if (!active) return false
          const hasDocContent = Boolean((project.document as { content?: unknown } | null)?.content)
          if (project.id !== latestRef.current.projectId && !hasDocContent) {
            selectTemplate(id)
          }
          bindProject(project)
          settled = true
          return true
        }
        if (user?.role === 'SALESPERSON' || user?.role === 'AGENCY_ADMIN') {
          navigate(`/new-site?template=${id}`, { replace: true })
          settled = true
          return true
        }
        if (appearanceFromSearchParams(latestRef.current.searchParams)) {
          if (latestRef.current.projectId) clearProject()
          setNewDraftReady(true)
          settled = true
          return false
        }
        const { items } = await listProjects()
        if (!active) return false
        const existing = items
          .filter((p) => p.templateId === id && (!user || p.ownerId === user.id))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
        if (existing) {
          if (existing.id === latestRef.current.projectId && latestRef.current.selectedId === id) {
            bootedKey.current = `${id}:${existing.id}`
          }
          navigate(`/editor/${id}?project=${existing.id}`, { replace: true })
          settled = true
          return true
        }
        if (latestRef.current.projectId) clearProject()
        setNewDraftReady(true)
        settled = true
        return false
      } catch (err: unknown) {
        if (active) {
          if (projectQuery) {
            toast.error(err instanceof Error ? err.message : 'Could not load project')
          } else if (bootedKey.current === key) {
            bootedKey.current = null
          }
        }
        return false
      }
    }

    const bootPromise = run()
    bootGuardRef.current = bootPromise
    void bootPromise.finally(() => {
      if (bootGuardRef.current === bootPromise) {
        bootGuardRef.current = null
      }
    })
    return () => {
      active = false
      if (!settled && bootedKey.current === key) {
        bootedKey.current = null
      }
      if (bootGuardRef.current === bootPromise) {
        bootGuardRef.current = null
      }
    }
  }, [held, id, projectQuery, user, navigate, selectTemplate, bindProject, clearProject])

  useEffect(() => {
    if (held || !isValidTemplateId(id) || projectQuery || projectId || readOnly || !newDraftReady) return
    if (selectedId !== id) return
    const snapshot = JSON.stringify({ content, colorSchemeId, layoutVariantId })
    if (!initialContentRef.current) {
      initialContentRef.current = snapshot
      return
    }
    if (snapshot === initialContentRef.current) return

    const timer = window.setTimeout(() => {
      void ensureProject().catch((err: unknown) => {
        console.error('Failed to create project:', err)
      })
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [held, id, selectedId, projectQuery, projectId, readOnly, newDraftReady, content, colorSchemeId, layoutVariantId, ensureProject])

  if (held || !template || !isValidTemplateId(id)) return null

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
                onClick={async () => {
                  if (projectId && !canCloudSave) {
                    setPaywallOpen(true)
                    return
                  }
                  setSaving(true)
                  try {
                    if (!projectId) {
                      if (bootGuardRef.current) {
                        const loaded = await bootGuardRef.current
                        if (loaded) return
                      }
                      if (projectQuery) {
                        toast.error('This project could not be loaded. Refresh the page and try again.')
                        return
                      }
                      const created = await ensureProject()
                      if (!created) return
                      if (!created.canCloudSave) {
                        setPaywallOpen(true)
                        return
                      }
                    } else {
                      await persistNow()
                    }
                    toast.success('Site saved')
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : 'Could not save site')
                  } finally {
                    setSaving(false)
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {canCloudSave || !projectId ? <Save size={14} /> : <Lock size={14} />}
                {saving ? 'Saving…' : canCloudSave || !projectId ? 'Save' : 'Save locked'}
              </button>
              <DownloadButton
                templateId={id}
                content={content}
                colorSchemeId={colorSchemeId}
                layoutVariantId={layoutVariantId}
                canExport={canExport}
                projectId={projectId}
                onNeedPayment={async () => {
                  if (!projectId) {
                    if (bootGuardRef.current) {
                      const loaded = await bootGuardRef.current
                      if (loaded) return
                    }
                    if (projectQuery) {
                      toast.error('This project could not be loaded. Refresh the page and try again.')
                      return
                    }
                    try {
                      const created = await ensureProject()
                      if (!created || created.canExport) return
                    } catch (err: unknown) {
                      toast.error(err instanceof Error ? err.message : 'Could not start project')
                      return
                    }
                  }
                  setPaywallOpen(true)
                }}
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
