import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProjects } from '../api/projects'
import type { ProjectResponse } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { getTemplateMeta } from '../data/defaults'

export function RecentlyUsed() {
  const { user } = useAuth()
  const [items, setItems] = useState<ProjectResponse[] | null>(null)

  useEffect(() => {
    if (!user) {
      setItems(null)
      return
    }
    listProjects()
      .then((result) => setItems(result.recentlyUsed))
      .catch(() => setItems([]))
  }, [user])

  if (!user || !items || items.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Continue</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((project) => {
          const meta = getTemplateMeta(project.templateId)
          return (
            <Link
              key={project.id}
              to={`/editor/${project.templateId}?project=${project.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-900">{project.name}</p>
              <p className="mt-1 text-xs text-slate-500">{meta?.name ?? project.templateId}</p>
              <p className="mt-3 text-[11px] font-medium text-slate-400">
                {project.entitlementStatus === 'UNPAID' ? 'Unpaid' : 'Ready to export'}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
