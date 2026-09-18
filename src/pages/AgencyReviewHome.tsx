import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProjects } from '../api/projects'
import type { ProjectResponse } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { PageShell, ProgressBar, StatusBadge } from '../components/workspace'
import { getTemplateMeta } from '../data/defaults'

const ADMIN_ORIGIN = import.meta.env.VITE_ADMIN_ORIGIN || 'http://localhost:5174'

export function AgencyReviewHome() {
  const { user } = useAuth()
  const [sites, setSites] = useState<ProjectResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listProjects()
      .then((result) => setSites(result.items))
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <PageShell width="wide">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-700">Review</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {user?.role === 'PLATFORM_ADMIN' ? 'All sites' : 'Agency sites'}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Open any site in view mode. Salespeople do the editing.
          </p>
        </div>
        {user?.role === 'AGENCY_ADMIN' && (
          <a
            href={`${ADMIN_ORIGIN}/portal`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Open agency portal
          </a>
        )}
      </div>
      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!sites ? (
        <p className="text-sm text-slate-500">Loading sites…</p>
      ) : sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
          No sites to review yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Site</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Salesperson</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{site.name}</p>
                    <p className="text-xs text-slate-500">{getTemplateMeta(site.templateId)?.name ?? site.templateId}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{site.clientName ?? '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{site.ownerName ?? '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={site.status} />
                      <div className="w-24">
                        <ProgressBar value={site.progressPercent} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/editor/${site.templateId}?project=${site.id}&mode=view`}
                      className="text-sm font-semibold text-indigo-700 hover:underline"
                    >
                      View site
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  )
}
