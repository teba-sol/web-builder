import type { FormEvent } from 'react'
import type { ContactFormStyleId } from '../data/sectionVariants'
import type { SiteContent } from '../types'
import type { ContactLayout } from '../data/layoutVariants'
import { canEmbedForm, EMBED_FORM_HEIGHT, getEmbedFormUrl } from '../utils/formEmbed'
import type { TemplateTheme } from './themes'

interface Props {
  c: SiteContent
  t: TemplateTheme
  layout: ContactLayout
  formStyle?: ContactFormStyleId
}

function formClasses(style: ContactFormStyleId = 'standard') {
  const base = 'w-full text-sm transition-colors focus:outline-none'
  switch (style) {
    case 'underline':
      return {
        input: `${base} border-0 border-b-2 border-zinc-300 bg-transparent px-0 py-3 placeholder:text-zinc-500 focus:border-zinc-900`,
        wrap: 'rounded-none border-0 bg-transparent p-0 shadow-none',
        label: 'text-xs font-semibold uppercase tracking-widest text-zinc-500',
      }
    case 'dark-filled':
      return {
        input: `${base} rounded-lg border border-amber-500/20 bg-neutral-900 px-4 py-3 text-amber-50 placeholder:text-amber-200/40 focus:border-amber-400`,
        wrap: 'rounded-xl border border-amber-500/30 bg-neutral-950 p-6',
        label: 'text-xs uppercase tracking-widest text-amber-400/80',
      }
    case 'soft-rounded':
      return {
        input: `${base} rounded-2xl border border-stone-200 bg-stone-50 px-5 py-3.5 placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200`,
        wrap: 'rounded-3xl border border-stone-200 bg-white p-8 shadow-sm',
        label: 'text-sm font-medium text-stone-600',
      }
    case 'minimal-border':
      return {
        input: `${base} rounded-md border border-slate-200 bg-white px-4 py-2.5 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30`,
        wrap: 'rounded-lg border border-slate-200 bg-slate-50/50 p-6',
        label: 'text-sm font-medium text-slate-700',
      }
    case 'bold-outline':
      return {
        input: `${base} rounded-none border-2 border-black bg-white px-4 py-3 font-medium uppercase tracking-wide placeholder:text-neutral-400 focus:bg-neutral-50`,
        wrap: 'rounded-none border-4 border-black bg-white p-6 shadow-[8px_8px_0_#000]',
        label: 'text-xs font-black uppercase tracking-widest',
      }
    case 'elegant-serif':
      return {
        input: `${base} rounded-none border-0 border-b border-stone-300 bg-transparent px-0 py-3 font-serif placeholder:text-stone-400 focus:border-stone-800`,
        wrap: 'rounded-none border-0 bg-transparent p-0',
        label: 'font-serif text-sm italic text-stone-500',
      }
    case 'neon-glow':
      return {
        input: `${base} rounded-lg border-2 border-lime-400/40 bg-black px-4 py-3 text-lime-100 placeholder:text-lime-400/40 focus:border-lime-400 focus:shadow-[0_0_12px_rgba(163,230,53,0.35)]`,
        wrap: 'rounded-xl border-2 border-lime-400/30 bg-black/90 p-6',
        label: 'text-xs font-bold uppercase tracking-widest text-lime-400',
      }
    default:
      return {
        input: `${base} rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`,
        wrap: 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
        label: 'text-sm font-medium text-slate-700',
      }
  }
}

function NativeContactForm({ c, t, formStyle }: { c: SiteContent; t: TemplateTheme; formStyle?: ContactFormStyleId }) {
  const mailTarget = c.email || c.reservationEmail || c.supportEmail
  const cls = formClasses(formStyle)

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
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
      window.location.href = `mailto:${mailTarget}?subject=${subject}&body=${body}`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className={`mb-1.5 block ${cls.label}`}>Your Name</label>
        <input id="contact-name" name="name" type="text" required className={cls.input} placeholder="John Smith" />
      </div>
      <div>
        <label htmlFor="contact-email" className={`mb-1.5 block ${cls.label}`}>Email Address</label>
        <input id="contact-email" name="email" type="email" required className={cls.input} placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="contact-message" className={`mb-1.5 block ${cls.label}`}>Message</label>
        <textarea id="contact-message" name="message" required rows={5} className={cls.input} placeholder="How can we help you?" />
      </div>
      <button type="submit" className={`w-full ${t.navCta}`}>{c.contactFormButtonText || 'Send Message'}</button>
      {!c.contactFormUrl.trim() && !mailTarget && (
        <p className={`text-xs ${t.cardText}`}>Add an email or form link in the editor to receive submissions.</p>
      )}
    </form>
  )
}

function EmbeddedForm({ c, embedUrl, wrapClass }: { c: SiteContent; embedUrl: string; wrapClass: string }) {
  return (
    <div className={`relative isolate w-full overflow-hidden ${wrapClass}`} style={{ height: EMBED_FORM_HEIGHT }}>
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

export function ContactFormBlock({ c, t, layout, formStyle = 'standard' }: Props) {
  const formUrl = c.contactFormUrl.trim()
  const embedUrl = getEmbedFormUrl(formUrl)
  const embeddable = canEmbedForm(formUrl)
  const cls = formClasses(formStyle)

  if (embeddable && embedUrl) {
    return (
      <div className="space-y-4">
        <EmbeddedForm c={c} embedUrl={embedUrl} wrapClass={cls.wrap} />
        <p className={`text-center text-xs ${t.cardText}`}>
          Form not loading?{' '}
          <a href={formUrl} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">Open in a new tab</a>
        </p>
      </div>
    )
  }

  return (
    <div className={`${cls.wrap} ${layout === 'form-focus' ? 'lg:p-8' : ''}`}>
      {formUrl && (
        <p className={`mb-4 text-sm ${t.cardText}`}>
          Fill out the form below — your message will open our contact page to complete.
        </p>
      )}
      <NativeContactForm c={c} t={t} formStyle={formStyle} />
      {formUrl && (
        <p className={`mt-4 text-center text-sm ${t.cardText}`}>
          Or <a href={formUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline">open the full form directly</a>
        </p>
      )}
    </div>
  )
}