import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Globe, Plus, Search } from 'lucide-react'
import { DeleteProjectButton } from './DeleteProjectButton'
import { listProjects } from '../api/projects'
import type { ProjectResponse } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { getTemplateMeta } from '../data/defaults'
import { getTemplateThumbnail } from '../catalog/thumbnails'
import { StatusBadge } from './workspace'

export function RecentlyUsed() {
  const { user } = useAuth()
  const [items, setItems] = useState<ProjectResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    setItems(null)
    setError(null)
    if (!user) return
    listProjects()
      .then((result) => {
        if (!cancelled) setItems(result.items.filter((project) => project.ownerId === user.id))
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your websites.')
      })
    return () => { cancelled = true }
  }, [user, attempt])

  if (!user) return null
  if (error) return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-white p-6">
      <h2 className="font-semibold text-slate-900">Your websites could not be loaded</h2>
      <p className="mt-2 text-sm text-red-700">{error}</p>
      <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Try again</button>
    </div>
  )
  if (!items) return (
    <div role="status" aria-label="Loading websites" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((key) => <div key={key} aria-hidden="true" className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-slate-200/60 motion-reduce:animate-none" />)}
      <span className="sr-only">Loading your websites…</span>
    </div>
  )
  if (items.length === 0) return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <Globe size={32} className="mx-auto mb-4 text-slate-400" />
      <h2 className="text-xl font-semibold text-slate-900">Your next website starts here</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Choose a template and start building. Your websites will appear here so you can return to them anytime.</p>
      <Link to="/?view=templates" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-dark"><Plus size={16} /> Explore templates</Link>
    </div>
  )

  const search = query.trim().toLowerCase()
  const filtered = items.filter((project) => `${project.name} ${getTemplateMeta(project.templateId)?.name ?? project.templateId}`.toLowerCase().includes(search))

  return (
    <section aria-label="Your websites">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p aria-live="polite" className="text-sm text-slate-500">{search ? `${filtered.length} of ${items.length}` : items.length} website{items.length === 1 ? '' : 's'}</p>
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Search your websites</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your websites" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15" />
        </label>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-900">No matching websites</h2>
          <button type="button" onClick={() => setQuery('')} className="mt-3 text-sm font-semibold text-navy underline underline-offset-4">Clear search</button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const meta = getTemplateMeta(project.templateId)
            const thumbnail = getTemplateThumbnail(project.templateId)
            return (
              <article key={project.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Link to={`/editor/${project.templateId}?project=${project.id}`} aria-label={`Continue editing ${project.name}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy">
                  <div className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${meta?.previewGradient ?? 'from-slate-100 to-slate-200'}`}>
                    {thumbnail && <img src={thumbnail} alt="" loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none" />}
                    <span className="absolute bottom-3 left-3 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">{meta?.name ?? project.templateId} template</span>
                  </div>
                  <div className="p-4">
                    <h2 className="truncate font-semibold text-slate-900">{project.name}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusBadge status={project.status} />
                      <span className="text-xs text-slate-500">{project.entitlementStatus === 'UNPAID' ? 'Export locked' : 'Export unlocked'}</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Updated {new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </Link>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                  <Link to={`/editor/${project.templateId}?project=${project.id}`} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-navy hover:bg-slate-50">Continue editing <ArrowRight size={15} /></Link>
                  <DeleteProjectButton id={project.id} name={project.name} onDeleted={() => setItems((current) => current?.filter((item) => item.id !== project.id) ?? [])} />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
