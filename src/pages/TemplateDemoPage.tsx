import { Link, useParams } from 'react-router-dom'
import { getTemplateDefaults, getTemplateMeta } from '../data/defaults'
import { isValidTemplateId } from '../data/templateIds'
import { useHospitalityTemplateGuard } from '../hooks/useHospitalityTemplateGuard'
import { TemplateRenderer } from '../templates/TemplateRenderer'

export function TemplateDemoPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const id = templateId ?? ''
  const held = useHospitalityTemplateGuard(id)
  const template = isValidTemplateId(id) ? getTemplateMeta(id) : undefined

  if (held) return null

  if (!isValidTemplateId(id) || !template) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Link to="/" className="text-accent hover:underline">← Back to templates</Link>
      </div>
    )
  }

  const content = getTemplateDefaults(id)

  return (
    <div className="relative">
      <div className="fixed top-4 left-4 right-4 z-[100] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-black/70 px-4 py-2 text-sm text-white backdrop-blur-md">
          <span className="font-semibold">{template.name}</span>
          <span className="text-white/60">— Demo preview</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open(`/site/${id}?demo=true&chromeless=true`, '_blank')}
            className="rounded-lg border border-white/20 bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md hover:bg-black/80"
          >
            Full Window
          </button>
          <Link
            to={`/editor/${id}`}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Use This Template
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-white/20 bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md hover:bg-black/80"
          >
            ← All Templates
          </Link>
        </div>
      </div>
      <TemplateRenderer templateId={id} content={content} basePath={`/demo/${id}`} />
    </div>
  )
}