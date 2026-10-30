import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { DeleteProjectButton } from '../components/DeleteProjectButton'
import { listProjects } from '../api/projects'
import type { ProjectResponse } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { PageShell, StatusBadge } from '../components/workspace'
import { getTemplateMeta } from '../data/defaults'
import { getTemplateThumbnail } from '../catalog/thumbnails'

export function SalespersonHome() {
  const { user } = useAuth()
  const [sites, setSites] = useState<ProjectResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listProjects()
      .then((result) => setSites(result.items))
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <PageShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-navy">Workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {user ? `Hello, ${user.fullName.split(' ')[0]}` : 'Your sites'}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Continue a client site, or start a new one from a template you can preview first.
          </p>
        </div>
        <Link
          to="/new-site"
          className="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-accent-dark"
        >
          New site
        </Link>
      </div>
      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!sites ? (
        <p className="text-sm text-slate-500">Loading sites…</p>
      ) : sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <p className="text-base font-semibold text-slate-900">No client sites yet</p>
          <p className="mt-1 text-sm text-slate-500">Pick a client and a template to begin.</p>
          <Link to="/new-site" className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark">
            Create first site
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => {
            const meta = getTemplateMeta(site.templateId)
            const thumb = getTemplateThumbnail(site.templateId)
            return (
              <article
                key={site.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link to={`/editor/${site.templateId}?project=${site.id}`} className="block">
                  <div className="relative aspect-[16/9] bg-slate-900">
                    {thumb ? (
                      <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${meta?.previewGradient ?? 'from-slate-700 to-slate-900'}`} />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{site.name}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{site.clientName ?? 'No client'} · {meta?.name ?? site.templateId}</p>
                      </div>
                      <StatusBadge status={site.status} />
                    </div>
                  </div>
                </Link>
                <div className="flex justify-end border-t border-slate-100 px-2 py-1">
                  <DeleteProjectButton id={site.id} name={site.name} onDeleted={() => setSites((current) => current?.filter((item) => item.id !== site.id) ?? [])} />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
