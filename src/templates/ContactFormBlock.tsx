import type { FormEvent } from 'react'
import type { SiteContent } from '../types'
import type { ContactLayout } from '../data/layoutVariants'
import { canEmbedForm, EMBED_FORM_HEIGHT, getEmbedFormUrl } from '../utils/formEmbed'
import type { TemplateTheme } from './themes'

interface Props {
  c: SiteContent
  t: TemplateTheme
  layout: ContactLayout
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

function NativeContactForm({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  const mailTarget = c.email || c.reservationEmail || c.supportEmail

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const message = String(data.get('message') ?? '')

    if (c.contactFormUrl.trim()) {
      window.open(c.contactFormUrl.trim(), '_blank', 'noopener,noreferrer')
      return
    }

    if (mailTarget) {
      const subject = encodeURIComponent(`Message from ${name || 'website visitor'}`)
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`,
      )
      window.location.href = `mailto:${mailTarget}?subject=${subject}&body=${body}`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Your Name
        </label>
        <input id="contact-name" name="name" type="text" required className={inputClass} placeholder="John Smith" />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <input id="contact-email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-700">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className={inputClass}
          placeholder="How can we help you?"
        />
      </div>
      <button type="submit" className={`w-full ${t.navCta}`}>
        {c.contactFormButtonText || 'Send Message'}
      </button>
      {!c.contactFormUrl.trim() && !mailTarget && (
        <p className="text-xs text-slate-500">Add an email or form link in the editor to receive submissions.</p>
      )}
    </form>
  )
}

function EmbeddedForm({ c, embedUrl }: { c: SiteContent; embedUrl: string }) {
  return (
    <div
      className="relative isolate w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      style={{ height: EMBED_FORM_HEIGHT }}
    >
      <iframe
        src={embedUrl}
        title={c.contactFormTitle}
        width="100%"
        height={EMBED_FORM_HEIGHT}
        className="block w-full border-0 pointer-events-auto"
        style={{ height: EMBED_FORM_HEIGHT }}
        loading="lazy"
        allow="fullscreen"
      />
    </div>
  )
}

export function ContactFormBlock({ c, t, layout }: Props) {
  const formUrl = c.contactFormUrl.trim()
  const embedUrl = getEmbedFormUrl(formUrl)
  const embeddable = canEmbedForm(formUrl)

  if (embeddable && embedUrl) {
    return (
      <div className="space-y-4">
        <EmbeddedForm c={c} embedUrl={embedUrl} />
        <p className={`text-center text-xs ${t.cardText}`}>
          Form not loading?{' '}
          <a href={formUrl} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
            Open in a new tab
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${layout === 'form-focus' ? 'lg:p-8' : ''}`}>
      {formUrl && (
        <p className={`mb-4 text-sm ${t.cardText} text-slate-600`}>
          Fill out the form below — your message will open our contact page to complete.
        </p>
      )}
      <NativeContactForm c={c} t={t} />
      {formUrl && (
        <p className="mt-4 text-center text-sm text-slate-500">
          Or{' '}
          <a href={formUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 underline">
            open the full form directly
          </a>
        </p>
      )}
    </div>
  )
}