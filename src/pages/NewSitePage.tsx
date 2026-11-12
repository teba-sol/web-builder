import { clientNameError, clientEmailError } from '../utils/clientValidation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, Check, CheckCircle2, LoaderCircle, Plus, Search, UserRound } from 'lucide-react'
import { createClient, listClients } from '../api/clients'
import { createProject } from '../api/projects'
import type { ClientRecord } from '../api/types'
import { ApiError } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { Stepper } from '../components/OffsetCarousel'
import { PageShell } from '../components/workspace'
import { useTemplateCatalog } from '../catalog/useTemplateCatalog'
import { getTemplateThumbnail } from '../catalog/thumbnails'
import { businessTypes } from '../data/categories'
import type { TemplateMeta } from '../types'
import { ethiopianPhoneError, normalizeEthiopianPhone } from '../utils/ethiopianPhone'

const STEPS = ['Client', 'Business', 'Template', 'Review']
const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/15'

export function NewSitePage() {
  const templates = useTemplateCatalog()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientLoadError, setClientLoadError] = useState<string | null>(null)
  const [clientAttempt, setClientAttempt] = useState(0)
  const appliedPreset = useRef<string | null>(null)
  const submittingRef = useRef(false)
  const stepHeading = useRef<HTMLHeadingElement>(null)
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [clientId, setClientId] = useState('')
  const [creatingClient, setCreatingClient] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [typeQuery, setTypeQuery] = useState('')
  const [businessTypeId, setBusinessTypeId] = useState('')
  const [templateQuery, setTemplateQuery] = useState('')
  const [chosenTemplateId, setChosenTemplateId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [savingClient, setSavingClient] = useState(false)
  const savingClientRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'SALESPERSON' && user.role !== 'AGENCY_ADMIN') {
      navigate('/', { replace: true })
    }
  }, [navigate, user])

  useEffect(() => {
    let active = true
    setClientsLoading(true)
    setClientLoadError(null)
    listClients()
      .then((items) => {
        if (!active) return
        setClients(items)
        if (items.length === 0) setCreatingClient(true)
      })
      .catch((err: Error) => { if (active) setClientLoadError(err.message) })
      .finally(() => { if (active) setClientsLoading(false) })
    return () => { active = false }
  }, [clientAttempt])

  useEffect(() => {
    if (step > 0) {
      stepHeading.current?.focus({ preventScroll: true })
      stepHeading.current?.scrollIntoView({ block: 'start' })
    }
  }, [step])

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

  const selectedType = businessTypes.find((type) => type.id === businessTypeId)

  const typedTemplates = useMemo(() => {
    const inType = templates.filter((template) => template.category === selectedType?.id)
    const q = templateQuery.trim().toLowerCase()
    if (!q) return inType
    return inType.filter(
      (template) =>
        template.name.toLowerCase().includes(q) || template.description.toLowerCase().includes(q),
    )
  }, [templates, selectedType, templateQuery])

  const selectedTemplate: TemplateMeta | undefined = templates.find((template) => template.id === chosenTemplateId && template.category === businessTypeId)
  const selectedClient = clients.find((client) => client.id === clientId)
  const clientReady = creatingClient
    ? true
    : Boolean(clientId)

  useEffect(() => {
    const preset = params.get('template')
    if (!preset || appliedPreset.current === preset) return
    const match = templates.find((template) => template.id === preset)
    if (!match) return
    appliedPreset.current = preset
    setBusinessTypeId(match.category)
    setChosenTemplateId(match.id)
  }, [params, templates])

  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const type of businessTypes) {
      result[type.id] = templates.filter((template) => template.category === type.id).length
    }
    return result
  }, [templates])

  const showExisting = () => {
    setCreatingClient(false)
    setNameError(null)
    setEmailError(null)
    setError(null)
    setPhoneError(null)
  }

  const showNew = () => {
    setCreatingClient(true)
    setNameError(null)
    setEmailError(null)
    setClientId('')
    setError(null)
    setPhoneError(null)
  }

  const continueFromClient = async () => {
    setError(null)
    if (!creatingClient) {
      if (!clientId) {
        setError('Choose a client')
        return
      }
      setStep(1)
      return
    }
    const name = clientName.trim()
    const invalidName = clientNameError(clientName)
    const invalidEmail = clientEmailError(clientEmail)
    const invalidPhone = ethiopianPhoneError(clientPhone)
    setNameError(invalidName)
    setEmailError(invalidEmail)
    setPhoneError(invalidPhone)
    if (invalidName || invalidEmail || invalidPhone) {
      const field = invalidName ? 'client-name' : invalidEmail ? 'client-email' : 'client-phone'
      document.getElementById(field)?.focus()
      return
    }
    const phone = normalizeEthiopianPhone(clientPhone)
    if (!phone) {
      setPhoneError(ethiopianPhoneError(clientPhone))
      return
    }
    if (savingClientRef.current) return
    savingClientRef.current = true
    setSavingClient(true)
    setPhoneError(null)
    try {
      const created = await createClient({
        name,
        phone,
        contactEmail: clientEmail.trim() || undefined,
      })
      setClients((prev) => [created, ...prev])
      setClientId(created.id)
      setClientName('')
      setClientEmail('')
      setClientPhone('')
      setCreatingClient(false)
      setStep(1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the client')
    } finally {
      savingClientRef.current = false
      setSavingClient(false)
    }
  }

  const startSite = async () => {
    if (submittingRef.current) return
    if (!selectedTemplate) {
      setError('Choose a template')
      return
    }
    if (!clientId) {
      setError('Save the client on the first step before starting the site')
      setStep(0)
      return
    }
    submittingRef.current = true
    setSubmitting(true)
    setError(null)
    try {
      const project = await createProject({
        templateId: selectedTemplate.id,
        name: selectedClient?.name || selectedTemplate.name,
        clientId,
      })
      navigate(`/editor/${selectedTemplate.id}?project=${project.id}`, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the site')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
        ← Your sites
      </Link>
      <div className="mt-5 flex flex-col gap-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">New client website</p>
          <h1 ref={stepHeading} tabIndex={-1} className="scroll-mt-24 text-3xl font-semibold tracking-tight text-navy focus:outline-none">{['Who are you building for?', 'What kind of business?', 'Choose the right design', 'Ready to start building?'][step]}</h1>
          <p className="mt-2 text-sm text-slate-500">{['Choose an existing client or add someone new.', 'Find designs tailored to your client’s industry.', 'Preview a design, then select it for your client.', 'Check the details below before opening the editor.'][step]}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="mb-4 text-xs font-medium text-slate-500">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
          <Stepper steps={STEPS} current={step} />
        </div>
      </div>
      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {step === 0 && clientsLoading && <div role="status" className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" /> Loading your clients…</div>}
      {step === 0 && clientLoadError && <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-white p-6"><p className="text-sm text-red-700">{clientLoadError}</p><button type="button" onClick={() => setClientAttempt((value) => value + 1)} className="mt-3 text-sm font-semibold text-navy">Try again</button></div>}
      {step === 0 && !clientsLoading && !clientLoadError && (
        <section className="mt-8">
          {clients.length > 0 && (
            <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={showExisting}
                disabled={savingClient}
                aria-pressed={!creatingClient}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  !creatingClient ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Existing clients
              </button>
              <button
                type="button"
                onClick={showNew}
                disabled={savingClient}
                aria-pressed={creatingClient}
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
            <form noValidate id="new-client-form" onSubmit={(event) => { event.preventDefault(); void continueFromClient() }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
                  <Building2 className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-navy">Client details</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add their business name and contact details. You can use this client for future websites too.
                  </p>
                </div>
              </div>
              <fieldset disabled={savingClient} className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Client name *
                  <input
                    required
                    id="client-name"
                    aria-invalid={Boolean(nameError)}
                    aria-describedby={nameError ? 'client-name-error' : undefined}
                    onBlur={() => setNameError(clientNameError(clientName))}
                    autoComplete="organization"
                    value={clientName}
                    onChange={(e) => { setClientName(e.target.value); if (nameError) setNameError(clientNameError(e.target.value)) }}
                    placeholder="Skylight Hotel"
                    className={`${fieldClass}${nameError ? ' !border-red-400' : ''}`}
                  />
                  {nameError && <span id="client-name-error" role="alert" className="mt-1 block text-xs font-normal text-red-600">{nameError}</span>}
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Email <span className="font-normal text-slate-400">(optional)</span>
                  <input
                    id="client-email"
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? 'client-email-error' : undefined}
                    onBlur={() => setEmailError(clientEmailError(clientEmail))}
                    autoComplete="email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => { setClientEmail(e.target.value); if (emailError) setEmailError(clientEmailError(e.target.value)) }}
                    placeholder="hello@studio.et"
                    className={`${fieldClass}${emailError ? ' !border-red-400' : ''}`}
                  />
                  {emailError && <span id="client-email-error" role="alert" className="mt-1 block text-xs font-normal text-red-600">{emailError}</span>}
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Phone *
                  <input
                    required
                    id="client-phone"
                    onBlur={() => setPhoneError(ethiopianPhoneError(clientPhone))}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={clientPhone}
                    onChange={(e) => {
                      setClientPhone(e.target.value)
                      if (phoneError) setPhoneError(ethiopianPhoneError(e.target.value))
                    }}
                    placeholder="0911 223 344"
                    aria-invalid={phoneError ? true : undefined}
                    aria-describedby="client-phone-hint"
                    className={`${fieldClass}${phoneError ? ' !border-red-400 focus:!border-red-500 focus:!ring-red-200' : ''}`}
                  />
                  {phoneError ? (
                    <span id="client-phone-hint" role="alert" className="mt-1 block text-xs font-normal text-red-600">{phoneError}</span>
                  ) : (
                    <span id="client-phone-hint" className="mt-1 block text-xs font-normal text-slate-500">
                      0911 223 344, 0711 223 344, +251911223344, or +251711223344
                    </span>
                  )}
                </label>
              </fieldset>
            </form>
          ) : (
            <>
              <label className="relative mb-4 block">
                <span className="sr-only">Search clients</span>
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
                      aria-pressed={clientId === client.id}
                      className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                        clientId === client.id ? 'border-navy ring-2 ring-navy' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                          <Building2 className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1 break-words">
                          <span className="block font-semibold text-slate-900">{client.name}</span>
                          <span className="mt-0.5 block text-sm text-slate-500">
                            {client.contactEmail ?? client.phone ?? 'No contact'}
                          </span>
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-navy">
                            <UserRound size={12} />
                            Brought by {client.createdByName ?? 'your agency'}
                          </span>
                        </span>
                        {clientId === client.id && <CheckCircle2 size={20} className="shrink-0 text-navy" aria-hidden="true" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <div className="mt-8 flex justify-end">
            <button
              type={creatingClient ? 'submit' : 'button'}
              form={creatingClient ? 'new-client-form' : undefined}
              disabled={!clientReady || savingClient}
              onClick={creatingClient ? undefined : () => void continueFromClient()}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
            >
              {savingClient ? 'Saving client…' : creatingClient ? 'Save client & continue' : 'Continue to business type'}
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-navy">Business type</h2>
          <label className="relative mb-6 block max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search business types"
              value={typeQuery}
              onChange={(e) => setTypeQuery(e.target.value)}
              placeholder="Search business types"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
            />
          </label>
          {filteredTypes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
              <p className="text-sm text-slate-500">No business types match that search.</p>
              <button type="button" onClick={() => setTypeQuery('')} className="mt-3 text-sm font-semibold text-navy">Clear search</button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTypes.map((type) => {
                const active = selectedType?.id === type.id
                const available = (counts[type.id] ?? 0) > 0
                return (
                  <button key={type.id} type="button" aria-pressed={active} disabled={!available} onClick={() => {
                    if (businessTypeId !== type.id) { setChosenTemplateId(''); setTemplateQuery('') }
                    setBusinessTypeId(type.id)
                  }} className={`relative rounded-2xl border bg-white p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:opacity-40 ${active ? 'border-navy ring-1 ring-navy' : 'border-slate-200 hover:border-slate-400'}`}>
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy"><type.icon size={23} strokeWidth={1.5} /></div>
                    {active && <CheckCircle2 size={20} className="absolute right-4 top-4 text-navy" />}
                    <h3 className="font-semibold text-navy">{type.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{type.blurb}</p>
                    <p className="mt-4 text-xs font-semibold text-slate-500">{counts[type.id] ?? 0} designs</p>
                  </button>
                )
              })}
            </div>
          )}
          <div className="mt-8 flex justify-between">
            <button type="button" onClick={() => setStep(0)} className="text-sm font-medium text-slate-500">
              Back
            </button>
            <button
              type="button"
              disabled={!selectedType || !counts[selectedType.id]}
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
          <h2 className="mb-4 text-lg font-semibold text-navy">
            Templates for {selectedType?.label}
          </h2>
          <label className="relative mb-6 block max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search templates"
              value={templateQuery}
              onChange={(e) => setTemplateQuery(e.target.value)}
              placeholder="Search templates"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
            />
          </label>
          {typedTemplates.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
              <p className="text-sm text-slate-500">No templates match that search.</p>
              <button type="button" onClick={() => setTemplateQuery('')} className="mt-3 text-sm font-semibold text-navy">Clear search</button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {typedTemplates.map((template) => {
                const thumb = getTemplateThumbnail(template.id)
                const active = selectedTemplate?.id === template.id
                return (
                  <article key={template.id} className={`flex flex-col overflow-hidden rounded-2xl border bg-white ${active ? 'border-navy ring-1 ring-navy' : 'border-slate-200'}`}>
                    <button type="button" aria-pressed={active} aria-label={`Select ${template.name}`} onClick={() => setChosenTemplateId(template.id)} className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy">
                      <div className={`relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br ${template.previewGradient}`}>
                        {thumb && <img src={thumb} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />}
                        {active && <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white"><Check size={14} /> Selected</span>}
                      </div>
                      <div className="p-4"><h3 className="font-semibold text-navy">{template.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{template.description}</p></div>
                    </button>
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                      <a href={`/demo/${template.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${template.name} in a new tab`} className="rounded-lg py-1 text-sm font-semibold text-navy hover:underline">Live preview ↗</a>
                      <button type="button" onClick={() => setChosenTemplateId(template.id)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${active ? 'bg-navy/5 text-navy' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{active ? 'Selected' : 'Select design'}</button>
                    </div>
                  </article>
                )
              })}
            </div>
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
        <section className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
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
            <h2 className="text-lg font-semibold text-navy">Your website brief</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">We’ll create a website for this client and open it in the editor.</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">Client <button type="button" disabled={submitting} onClick={() => setStep(0)} className="font-semibold normal-case text-navy hover:underline">Change</button></dt>
                <dd className="mt-1 break-words font-medium">{selectedClient?.name}<span className="mt-1 block text-xs font-normal text-slate-500">{selectedClient?.phone}{selectedClient?.contactEmail ? ` · ${selectedClient.contactEmail}` : ''}</span></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Brought by</dt>
                <dd className="mt-1 font-medium">
                  {selectedClient?.createdByName ?? user?.fullName}
                </dd>
              </div>
              <div>
                <dt className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">Business type <button type="button" disabled={submitting} onClick={() => setStep(1)} className="font-semibold normal-case text-navy hover:underline">Change</button></dt>
                <dd className="mt-1 font-medium">{selectedType?.label}</dd>
              </div>
              <div>
                <dt className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">Template <button type="button" disabled={submitting} onClick={() => setStep(2)} className="font-semibold normal-case text-navy hover:underline">Change</button></dt>
                <dd className="mt-1 font-medium">{selectedTemplate.name}</dd>
              </div>
            </dl>
            <div className="mt-8 flex gap-3">
              <button type="button" disabled={submitting} onClick={() => setStep(2)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium">
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void startSite()}
                className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
              >
                {submitting ? 'Creating website…' : 'Create & open editor'}
              </button>
            </div>
          </div>
        </section>
      )}
    </PageShell>
  )
}
