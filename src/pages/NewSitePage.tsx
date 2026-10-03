import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, Plus, Search, UserRound } from 'lucide-react'
import { createClient, listClients } from '../api/clients'
import { createProject } from '../api/projects'
import type { ClientRecord } from '../api/types'
import { ApiError } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { OffsetCarousel, Stepper } from '../components/OffsetCarousel'
import { PageShell } from '../components/workspace'
import { useTemplateCatalog } from '../catalog/useTemplateCatalog'
import { getTemplateThumbnail } from '../catalog/thumbnails'
import { businessTypes } from '../data/categories'
import type { TemplateMeta } from '../types'

const STEPS = ['Client', 'Business', 'Template', 'Review']
const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/15'

export function NewSitePage() {
  const templates = useTemplateCatalog()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [clientId, setClientId] = useState('')
  const [creatingClient, setCreatingClient] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [typeQuery, setTypeQuery] = useState('')
  const [typeIndex, setTypeIndex] = useState(0)
  const [templateQuery, setTemplateQuery] = useState('')
  const [templateIndex, setTemplateIndex] = useState(0)
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

  const visibleClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase()
    if (!q) return clients
    return clients.filter((client) =>
      [client.name, client.contactEmail, client.phone, client.createdByName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q)),
    )
  }, [clients, clientQuery])

  const filteredTypes = useMemo(() => {
    const q = typeQuery.trim().toLowerCase()
    if (!q) return businessTypes
    return businessTypes.filter(
      (type) =>
        type.label.toLowerCase().includes(q) ||
        (type.blurb ?? '').toLowerCase().includes(q) ||
        type.id.toLowerCase().includes(q),
    )
  }, [typeQuery])

  const selectedType = filteredTypes[Math.min(typeIndex, Math.max(filteredTypes.length - 1, 0))] ?? filteredTypes[0]

  const typedTemplates = useMemo(() => {
    const inType = templates.filter((template) => template.category === selectedType?.id)
    const q = templateQuery.trim().toLowerCase()
    if (!q) return inType
    return inType.filter(
      (template) =>
        template.name.toLowerCase().includes(q) || template.description.toLowerCase().includes(q),
    )
  }, [templates, selectedType, templateQuery])

  const selectedTemplate: TemplateMeta | undefined = typedTemplates[Math.min(templateIndex, Math.max(typedTemplates.length - 1, 0))] ?? typedTemplates[0]
  const selectedClient = clients.find((client) => client.id === clientId)
  const clientReady = creatingClient
    ? clientName.trim().length > 0 && clientPhone.trim().length > 0
    : Boolean(clientId)

  useEffect(() => {
    setTypeIndex(0)
  }, [typeQuery])

  useEffect(() => {
    setTemplateIndex(0)
  }, [selectedType?.id, templateQuery])

  useEffect(() => {
    const preset = params.get('template')
    if (!preset) return
    const match = templates.find((template) => template.id === preset)
    if (!match) return
    const typePos = businessTypes.findIndex((type) => type.id === match.category)
    if (typePos >= 0) setTypeIndex(typePos)
    setTypeQuery('')
    setTemplateQuery('')
  }, [params, templates])

  useEffect(() => {
    const preset = params.get('template')
    if (!preset) return
    const pos = typedTemplates.findIndex((template) => template.id === preset)
    if (pos >= 0) setTemplateIndex(pos)
  }, [params, typedTemplates])

  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const type of businessTypes) {
      result[type.id] = templates.filter((template) => template.category === type.id).length
    }
    return result
  }, [templates])

  const showExisting = () => {
    setCreatingClient(false)
    setError(null)
  }

  const showNew = () => {
    setCreatingClient(true)
    setClientId('')
    setError(null)
  }

  const startSite = async () => {
    if (!selectedTemplate) {
      setError('Choose a template')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      let nextClientId = clientId
      if (creatingClient) {
        const created = await createClient({
          name: clientName.trim(),
          phone: clientPhone.trim(),
          contactEmail: clientEmail || undefined,
        })
        nextClientId = created.id
        setClients((prev) => [created, ...prev])
        setClientId(created.id)
        setCreatingClient(false)
      }
      const siteName = creatingClient ? clientName.trim() : selectedClient?.name
      const project = await createProject({
        templateId: selectedTemplate.id,
        name: siteName || selectedTemplate.name,
        clientId: nextClientId || undefined,
      })
      navigate(`/editor/${selectedTemplate.id}?project=${project.id}`, { replace: true })
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
      <div className="mt-5 flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-navy">Start a new site</h1>
          <p className="mt-2 text-sm text-slate-500">Client, business type, template, then confirm.</p>
        </div>
        <Stepper steps={STEPS} current={step} />
      </div>
      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {step === 0 && (
        <section className="mt-8">
          {clients.length > 0 && (
            <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={showExisting}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  !creatingClient ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Existing clients
              </button>
              <button
                type="button"
                onClick={showNew}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  creatingClient ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Plus className="h-4 w-4" />
                New client
              </button>
            </div>
          )}

          {creatingClient ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
                  <Building2 className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-navy">Register a client</h2>
                  <p className="mt-1 text-sm text-slate-500">Name and Ethiopian phone are required. Email is optional.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Client name
                  <input
                    required
                    autoFocus
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Skylight Hotel"
                    className={fieldClass}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Email
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="hello@studio.et"
                    className={fieldClass}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Phone
                  <input
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="0911 223 344"
                    className={fieldClass}
                  />
                </label>
              </div>
            </div>
          ) : (
            <>
              <label className="relative mb-4 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  placeholder="Search clients by name, email, phone, or salesperson"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
                />
              </label>
              {visibleClients.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
                  <p className="font-medium text-slate-800">No clients match that search.</p>
                  <button type="button" onClick={showNew} className="mt-3 text-sm font-semibold text-navy">
                    Create a new client
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => setClientId(client.id)}
                      className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                        clientId === client.id ? 'border-navy ring-2 ring-navy' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                          <Building2 className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block font-semibold text-slate-900">{client.name}</span>
                          <span className="mt-0.5 block text-sm text-slate-500">
                            {client.contactEmail ?? client.phone ?? 'No contact'}
                          </span>
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-navy">
                            <UserRound size={12} />
                            Brought by {client.createdByName ?? 'your agency'}
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!clientReady}
              onClick={() => {
                setError(null)
                setStep(1)
              }}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="mt-8">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-slate-500">Business type</h2>
          <label className="relative mx-auto mb-4 block max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={typeQuery}
              onChange={(e) => setTypeQuery(e.target.value)}
              placeholder="Search business types"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
            />
          </label>
          {filteredTypes.length === 0 ? (
            <p className="py-16 text-center text-slate-500">No business types match that search.</p>
          ) : (
            <OffsetCarousel
              items={filteredTypes}
              index={Math.min(typeIndex, filteredTypes.length - 1)}
              onIndex={setTypeIndex}
              render={(type, active) => (
                <div className={`rounded-3xl border bg-white p-8 shadow-sm ${active ? 'border-navy' : 'border-slate-200'}`}>
                  <p className="text-5xl">{type.icon}</p>
                  <h3 className="mt-5 text-2xl font-semibold text-navy">{type.label}</h3>
                  <p className="mt-2 text-sm text-slate-500">{type.blurb}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent">
                    {counts[type.id] ?? 0} templates
                  </p>
                </div>
              )}
            />
          )}
          <div className="mt-8 flex justify-between">
            <button type="button" onClick={() => setStep(0)} className="text-sm font-medium text-slate-500">
              Back
            </button>
            <button
              type="button"
              disabled={!selectedType}
              onClick={() => setStep(2)}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
            Templates for {selectedType?.label}
          </h2>
          <label className="relative mx-auto mb-4 block max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={templateQuery}
              onChange={(e) => setTemplateQuery(e.target.value)}
              placeholder="Search templates"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
            />
          </label>
          {typedTemplates.length === 0 ? (
            <p className="py-16 text-center text-slate-500">No templates match that search.</p>
          ) : (
            <OffsetCarousel
              items={typedTemplates}
              index={Math.min(templateIndex, typedTemplates.length - 1)}
              onIndex={setTemplateIndex}
              render={(template, active) => {
                const thumb = getTemplateThumbnail(template.id)
                return (
                  <div className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${active ? 'border-navy' : 'border-slate-200'}`}>
                    <div className="relative aspect-[16/9] bg-slate-900">
                      {thumb ? (
                        <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${template.previewGradient}`} />
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-lg font-semibold text-navy">{template.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{template.description}</p>
                    </div>
                  </div>
                )
              }}
            />
          )}
          <div className="mt-8 flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-slate-500">
              Back
            </button>
            <button
              type="button"
              disabled={!selectedTemplate}
              onClick={() => setStep(3)}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
            >
              Review
            </button>
          </div>
        </section>
      )}

      {step === 3 && selectedTemplate && (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[16/9] bg-slate-900">
              {getTemplateThumbnail(selectedTemplate.id) ? (
                <img src={getTemplateThumbnail(selectedTemplate.id)} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedTemplate.previewGradient}`} />
              )}
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <p className="font-semibold text-navy">{selectedTemplate.name}</p>
              <a href={`/demo/${selectedTemplate.id}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-accent">
                Live preview
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-navy">Confirm</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Client</dt>
                <dd className="mt-1 font-medium">{creatingClient ? clientName : selectedClient?.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Brought by</dt>
                <dd className="mt-1 font-medium">
                  {creatingClient ? user?.fullName : selectedClient?.createdByName ?? user?.fullName}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Business type</dt>
                <dd className="mt-1 font-medium">{selectedType?.label}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Template</dt>
                <dd className="mt-1 font-medium">{selectedTemplate.name}</dd>
              </div>
            </dl>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium">
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void startSite()}
                className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
              >
                {submitting ? 'Starting…' : 'Confirm and design'}
              </button>
            </div>
          </div>
        </section>
      )}
    </PageShell>
  )
}
