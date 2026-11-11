import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams, useBlocker } from 'react-router-dom'
import { Lock, Maximize2, Monitor, PanelLeftClose, PanelLeftOpen, Save, Smartphone, Tablet } from 'lucide-react'
import { toast } from 'sonner'
import { createProject, getProject, listProjects } from '../api/projects'
import type { ProjectResponse } from '../api/types'
import { ContentForm } from '../components/ContentForm'
import { DevicePreviewFrame } from '../components/DevicePreviewFrame'
import { DownloadButton } from '../components/DownloadButton'
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog'
import { PaywallModal } from '../components/PaywallModal'
import { useAuth } from '../auth/AuthContext'
import { rememberProjectId } from '../auth/builderSession'
import { useWebsite } from '../context/WebsiteContext'
import { TemplateRenderer } from '../templates/TemplateRenderer'
import { getTemplateMeta } from '../data/defaults'
import { appearanceFromSearchParams } from '../data/pickTemplate'
import { isValidTemplateId } from '../data/templateIds'
import { savePreviewSite } from '../utils/storage'
import { useHospitalityTemplateGuard } from '../hooks/useHospitalityTemplateGuard'

const previewDevices = [
  { id: 'mobile', label: 'Mobile', width: 390, Icon: Smartphone },
  { id: 'tablet', label: 'Tablet', width: 768, Icon: Tablet },
  { id: 'desktop', label: 'Desktop', width: 1280, Icon: Monitor },
] as const

export function EditorPage() {
  const { templateId, '*': splat = '' } = useParams<{ templateId: string; '*': string }>()
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
    hasUnsavedChanges,
    discardChanges,
  } = useWebsite()
  const { user } = useAuth()
  const appliedQuery = useRef<string | null>(null)
  const bootedKey = useRef<string | null>(null)
  const inFlightCreateRef = useRef<Promise<ProjectResponse | null> | null>(null)
  const [ready, setReady] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [editorCollapsed, setEditorCollapsed] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const previewWidth = previewDevices.find((device) => device.id === previewDevice)!.width

  const subPath = splat.replace(/^\/+|\/+$/g, '')
  const subPathRef = useRef(subPath)
  subPathRef.current = subPath
  const id = templateId ?? ''
  const held = useHospitalityTemplateGuard(id)
  const template = isValidTemplateId(id) ? getTemplateMeta(id) : undefined
  const projectQuery = searchParams.get('project')
  const modeQuery = searchParams.get('mode')

  const hostQueryRef = useRef<{ id: string; project: string | null; mode: string | null } | null>(null)
  if (hostQueryRef.current?.id !== id) {
    hostQueryRef.current = { id, project: projectQuery, mode: modeQuery }
  } else {
    if (projectQuery) hostQueryRef.current.project = projectQuery
    if (searchParams.has('mode')) hostQueryRef.current.mode = modeQuery
  }

  const effectiveProjectQuery =
    projectQuery ?? (hostQueryRef.current?.id === id ? hostQueryRef.current.project : null)
  const viewRequested =
    modeQuery === 'view' || (hostQueryRef.current?.id === id && hostQueryRef.current.mode === 'view')

  useEffect(() => {
    if (held || !isValidTemplateId(id)) return
    const host = hostQueryRef.current
    if (!host || host.id !== id) return
    const nextParams = new URLSearchParams(searchParams)
    let changed = false
    if (host.project && !nextParams.get('project')) {
      nextParams.set('project', host.project)
      changed = true
    }
    if (host.mode === 'view' && nextParams.get('mode') !== 'view') {
      nextParams.set('mode', 'view')
      changed = true
    }
    if (!changed) return
    const target = subPath ? `/editor/${id}/${subPath}` : `/editor/${id}`
    internalNavigation.current = true
    void navigate(`${target}?${nextParams.toString()}`, { replace: true })
    internalNavigation.current = false
  }, [held, id, subPath, searchParams, navigate])
  const readOnly = viewRequested || !canEdit

  const latestRef = useRef({ projectId, selectedId, searchParams })
  latestRef.current = { projectId, selectedId, searchParams }

  useEffect(() => {
    if (held) return
    if (!isValidTemplateId(id)) {
      navigate('/')
      return
    }
    rememberProjectId(effectiveProjectQuery)
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
    }
  }, [held, id, selectedId, searchParams, effectiveProjectQuery, selectTemplate, navigate])

  const ensureProject = async (): Promise<ProjectResponse | null> => {
    if (latestRef.current.projectId) return null
    if (inFlightCreateRef.current) return inFlightCreateRef.current
    const promise = createProject({ templateId: id, name: content.businessName || template?.name || id, colorSchemeId })
    inFlightCreateRef.current = promise
    try {
      const created = await promise
      latestRef.current.projectId = created.id
      bootedKey.current = `${id}:${created.id}`
      bindProject(created, true)
      return created
    } finally {
      inFlightCreateRef.current = null
    }
  }

  const internalNavigation = useRef(false)
  const blocker = useBlocker(({ nextLocation }) =>
    !internalNavigation.current && !readOnly && (hasUnsavedChanges || saving) &&
    (!(nextLocation.pathname === `/editor/${id}` || nextLocation.pathname.startsWith(`/editor/${id}/`)) ||
      Boolean(new URLSearchParams(nextLocation.search).get('project') && new URLSearchParams(nextLocation.search).get('project') !== effectiveProjectQuery)),
  )

  useEffect(() => {
    if (!projectId || projectQuery || !ready || selectedId !== id || bootedKey.current !== `${id}:${projectId}` || blocker.state !== 'unblocked') return
    internalNavigation.current = true
    const params = new URLSearchParams(searchParams)
    params.set('project', projectId)
    const target = subPath ? `/editor/${id}/${subPath}` : `/editor/${id}`
    void navigate(`${target}?${params}`, { replace: true })
    internalNavigation.current = false
  }, [projectId, projectQuery, ready, blocker.state, selectedId, id, subPath, searchParams, navigate])

  useEffect(() => {
    if (readOnly || (!hasUnsavedChanges && !saving)) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasUnsavedChanges, saving, readOnly])

  const save = async (): Promise<boolean> => {
    if (savingRef.current || !ready) return false
    savingRef.current = true
    setSaving(true)
    try {
      if (!projectId) {
        const created = await ensureProject()
        if (created && !created.canCloudSave) {
          if (blocker.state === 'blocked') blocker.reset()
          setPaywallOpen(true)
        }
        if (!created?.canCloudSave) return false
        await persistNow(created)
        toast.success('Site saved')
        return true
      }
      if (!canCloudSave) {
        if (blocker.state === 'blocked') blocker.reset()
        setPaywallOpen(true)
        return false
      }
      await persistNow()
      toast.success('Site saved')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save site')
      return false
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  useEffect(() => {
    if (held || !isValidTemplateId(id)) return
    const key = `${id}:${effectiveProjectQuery ?? 'new'}`
    if (bootedKey.current === key) return
    bootedKey.current = key
    let active = true
    let settled = false
    setReady(false)

    const run = async (): Promise<boolean> => {
      try {
        if (effectiveProjectQuery) {
          const project = await getProject(effectiveProjectQuery)
          if (!active) return false
          bindProject(project)
          setReady(true)
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
          setReady(true)
          settled = true
          return false
        }
        const { items } = await listProjects()
        if (!active) return false
        const existing = items
          .filter((p) => p.templateId === id && (!user || p.ownerId === user.id))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
        if (existing) {
          const params = new URLSearchParams(latestRef.current.searchParams)
          params.set('project', existing.id)
          const target = subPathRef.current ? `/editor/${id}/${subPathRef.current}` : `/editor/${id}`
          navigate(`${target}?${params}`, { replace: true })
          settled = true
          return true
        }
        if (latestRef.current.projectId) clearProject()
        setReady(true)
        settled = true
        return false
      } catch (err: unknown) {
        if (active) {
          if (effectiveProjectQuery) {
            toast.error(err instanceof Error ? err.message : 'Could not load project')
          } else {
            toast.error(err instanceof Error ? err.message : 'Could not load drafts. Refresh the page and try again.')
            bootedKey.current = null
          }
        }
        return false
      }
    }

    void run()
    return () => {
      active = false
      if (!settled && bootedKey.current === key) {
        bootedKey.current = null
      }
    }
  }, [held, id, effectiveProjectQuery, user, navigate, selectTemplate, bindProject, clearProject])

  if (held || !template || !isValidTemplateId(id)) return null

  const openFullscreen = () => {
    savePreviewSite({ templateId: id, content, colorSchemeId, layoutVariantId })
    const target = subPath ? `/site/${id}/${subPath}` : `/site/${id}`
    window.open(`${target}?chromeless=true`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="relative z-[200] flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
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
          <div role="group" aria-label="Preview device" className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {previewDevices.map(({ id: deviceId, label, width, Icon }) => (
              <button
                key={deviceId}
                type="button"
                aria-label={`${label} preview (${width}px)`}
                aria-pressed={previewDevice === deviceId}
                title={`${label} · ${width}px`}
                onClick={() => setPreviewDevice(deviceId)}
                className={`rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${previewDevice === deviceId ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-white hover:text-slate-700'}`}
              >
                <Icon size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={openFullscreen}
            aria-label="Open full preview in a new tab"
            title="Full preview · new tab"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Maximize2 size={17} aria-hidden="true" />
          </button>
          {!readOnly && (
            <>
              <span role="status" className="sr-only">{!ready ? 'Loading editor' : saving ? 'Saving changes' : hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}</span>
              <span className="group relative inline-flex">
                <button
                  type="button"
                  disabled={saving || !ready}
                  onClick={() => { void save() }}
                  aria-describedby={hasUnsavedChanges ? 'save-status-tooltip' : undefined}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {canCloudSave || !projectId ? <Save size={14} /> : <Lock size={14} />}
                  {saving ? 'Saving…' : canCloudSave || !projectId ? 'Save' : 'Save locked'}
                  {hasUnsavedChanges && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 ring-2 ring-amber-100" />}
                </button>
                {hasUnsavedChanges && (
                  <span id="save-status-tooltip" role="tooltip" className="pointer-events-none invisible absolute right-0 top-full z-[250] mt-2 w-56 rounded-lg bg-slate-900 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    {projectId && !canCloudSave ? 'Unsaved changes. Unlock this website to save them.' : 'Unsaved changes. Save when you’re ready.'}
                  </span>
                )}
              </span>
              <DownloadButton
                templateId={id}
                content={content}
                colorSchemeId={colorSchemeId}
                layoutVariantId={layoutVariantId}
                canExport={canExport}
                projectId={projectId}
                onNeedPayment={() => { void save() }}
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
            <fieldset disabled={!ready || saving} className="min-h-0 overflow-y-auto"><ContentForm /></fieldset>
          </aside>
        )}

        <main className="min-w-0 flex-1 overflow-hidden bg-slate-200 p-4">
          <div className="mx-auto flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 rounded-md bg-white px-3 py-1 text-center text-xs text-slate-400">
                {content.businessName || 'your-site'}.webbuilder.app
              </div>
              <span className="shrink-0 text-xs tabular-nums text-slate-400" aria-live="polite">{previewWidth}px</span>
            </div>
            <DevicePreviewFrame width={previewWidth}>
              {ready && selectedId === id && (!effectiveProjectQuery || projectId === effectiveProjectQuery) ? (
                <TemplateRenderer templateId={id} content={content} basePath={`/editor/${id}`} colorSchemeId={colorSchemeId} layoutVariantId={layoutVariantId} />
              ) : (
                <div role="status" className="flex h-full items-center justify-center text-sm text-slate-500">Loading preview…</div>
              )}
            </DevicePreviewFrame>
          </div>
        </main>
      </div>
      {blocker.state === 'blocked' && (
        <UnsavedChangesDialog
          saving={saving} ready={ready} locked={Boolean(projectId && !canCloudSave)}
          onStay={() => blocker.reset()}
          onDiscard={() => { discardChanges(); blocker.proceed() }}
          onSave={() => { void save().then((saved) => { if (saved) blocker.proceed() }) }}
        />
      )}
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
