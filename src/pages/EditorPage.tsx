import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ContentForm } from '../components/ContentForm'
import { DownloadButton } from '../components/DownloadButton'
import { useWebsite } from '../context/WebsiteContext'
import { TemplateRenderer } from '../templates/TemplateRenderer'
import { templates } from '../data/defaults'
import { isValidTemplateId } from '../data/templateIds'

export function EditorPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { selectTemplate, templateId: selectedId, content } = useWebsite()

  const id = templateId ?? ''
  const template = isValidTemplateId(id) ? templates.find((t) => t.id === id) : undefined

  useEffect(() => {
    if (!isValidTemplateId(id)) {
      navigate('/')
      return
    }
    if (selectedId !== id) {
      selectTemplate(id)
    }
  }, [id, selectedId, selectTemplate, navigate])

  if (!template || !isValidTemplateId(id)) return null

  const openFullscreen = () => {
    window.open(`/site/${id}?chromeless=true`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            ← Back
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <span className="font-semibold text-slate-900">{template.name}</span>
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
          <DownloadButton templateId={id} content={content} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-full max-w-md shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-bold text-slate-900">Edit your content</h2>
          <ContentForm />
        </aside>

        <main className="flex-1 overflow-hidden bg-slate-200 p-4">
          <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg">
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
            <div className="flex-1 overflow-y-auto">
              <TemplateRenderer templateId={id} content={content} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}