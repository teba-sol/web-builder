import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, Plus, Search } from 'lucide-react'
import { listClients } from '../api/clients'
import { createProject } from '../api/projects'
import type { ClientRecord } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { CategoryFilter } from '../components/CategoryFilter'
import { TemplateSelectCard } from '../components/TemplateSelectCard'
import { PageShell } from '../components/workspace'
import { useTemplateCatalog } from '../catalog/useTemplateCatalog'
import { ApiError } from '../api/types'
import type { TemplateCategory } from '../types'

type Step = 'client' | 'template'

export function NewSitePage() {
  const templates = useTemplateCatalog()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const presetTemplate = params.get('template') ?? ''
  const [step, setStep] = useState<Step>('client')
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [clientId, setClientId] = useState('')
  const [creatingClient, setCreatingClient] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [templateId, setTemplateId] = useState(presetTemplate)
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'SALESPERSON' && user.role !== 'AGENCY_ADMIN') {
      navigate('/', { replace: true })
    }
  }, [navigate, user])

  useEffect(() => {
    listClients()
      .then((items) => {
        setClients(items)
        if (items.length === 0) setCreatingClient(true)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId),
    [templates, templateId],
  )

  const selectedClient = clients.find((client) => client.id === clientId)
  const clientReady = creatingClient ? clientName.trim().length > 0 : Boolean(clientId)

  const counts = useMemo(() => {
    const result: Record<TemplateCategory | 'all', number> = {
      all: templates.length,
      business: 0,
      creative: 0,
      food: 0,
      hospitality: 0,
      health: 0,
      tech: 0,
      retail: 0,
      realestate: 0,
      finance: 0,
    }
    for (const template of templates) result[template.category]++
    return result
  }, [templates])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return templates.filter((template) => {
      if (category !== 'all' && template.category !== category) return false
      if (!needle) return true
      return (
        template.name.toLowerCase().includes(needle) ||
        template.description.toLowerCase().includes(needle)
      )
    })
  }, [templates, category, query])

  const startSite = async () => {
    if (!templateId) {
      setError('Choose a template')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const siteName = creatingClient ? clientName.trim() : selectedClient?.name
      const project = await createProject({
        templateId,
        name: siteName || selectedTemplate?.name || templateId,
        clientId: creatingClient ? undefined : clientId || undefined,
        clientName: creatingClient ? clientName : undefined,
        clientEmail: creatingClient ? clientEmail || undefined : undefined,
      })
      navigate(`/editor/${templateId}?project=${project.id}`, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the site')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell width="wide">
      <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
        ← Your sites
      </Link>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Start a new site</h1>
          <p className="mt-2 text-sm text-slate-500">Pick the client, then choose a template you can actually see.</p>
        </div>
        <ol className="flex items-center gap-2 text-sm">
          <StepChip n={1} label="Client" active={step === 'client'} done={step === 'template'} />
          <span className="text-slate-300">/</span>
          <StepChip n={2} label="Template" active={step === 'template'} done={false} />
        </ol>
      </div>

      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {step === 'client' ? (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Who is this site for?</h2>
            {clients.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCreatingClient(true)
                  setClientId('')
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-800"
              >
                <Plus className="h-4 w-4" />
                New client
              </button>
            )}
          </div>
          {creatingClient && (
            <div className="mb-4 grid gap-3 rounded-2xl border border-indigo-200 bg-white p-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Client name
                <input
                  required
                  autoFocus
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Skylight Hotel"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="hello@client.et"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              {clients.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCreatingClient(false)
                    setClientName('')
                    setClientEmail('')
                  }}
                  className="text-left text-sm font-medium text-slate-500 hover:text-slate-800 sm:col-span-2"
                >
                  Cancel, pick an existing client
                </button>
              )}
            </div>
          )}
          {!creatingClient && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setClientId(client.id)}
                  className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                    clientId === client.id
                      ? 'border-indigo-600 ring-2 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-slate-900">{client.name}</span>
                      <span className="mt-0.5 block text-sm text-slate-500">{client.contactEmail ?? 'No email'}</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!clientReady}
              onClick={() => {
                setError(null)
                setStep('template')
              }}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Continue to templates
            </button>
          </div>
        </section>
      ) : (
        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <button type="button" onClick={() => setStep('client')} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← {creatingClient ? clientName || 'New client' : selectedClient?.name || 'Client'}
            </button>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>
          <CategoryFilter active={category} onChange={setCategory} counts={counts} />
          <p className="mt-5 text-sm text-slate-500">
            {filtered.length} template{filtered.length === 1 ? '' : 's'}
          </p>
          {filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
              No templates match that filter.
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((template) => (
                <TemplateSelectCard
                  key={template.id}
                  template={template}
                  selected={templateId === template.id}
                  onSelect={() => setTemplateId(template.id)}
                />
              ))}
            </div>
          )}
          <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {selectedTemplate ? selectedTemplate.name : 'Select a template'}
              </p>
              <p className="truncate text-xs text-slate-500">
                {creatingClient ? clientName : selectedClient?.name}
              </p>
            </div>
            <button
              type="button"
              disabled={!templateId || submitting}
              onClick={() => void startSite()}
              className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Starting…' : 'Start designing'}
            </button>
          </div>
        </section>
      )}
    </PageShell>
  )
}

function StepChip({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <li className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${active || done ? 'bg-indigo-50 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>
      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${active || done ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>
        {n}
      </span>
      {label}
    </li>
  )
}
