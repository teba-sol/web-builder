import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getTemplateMeta } from '../data/defaults'
import { getSectionVariants } from '../data/sectionVariants'
import { getSiteNavItems, resolveSiteHref, sitePath } from '../data/siteNav'
import type { ContactFieldKey, SiteContent, TemplateId } from '../types'
import type { ContactLayout } from '../data/layoutVariants'
import { ContactFormBlock } from './ContactFormBlock'
import type { TemplateTheme } from './themes'

interface SectionProps {
  c: SiteContent
  t: TemplateTheme
  variant: TemplateId
  basePath?: string
}

const EXPLORE_ICONS: Record<string, string> = {
  about: '◆',
  services: '◇',
  portfolio: '□',
  blog: '▣',
  news: '▤',
  gallery: '▦',
  contact: '◎',
}

function FaqAccordion({ faqs, t }: { faqs: { question: string; answer: string }[]; t: TemplateTheme }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className={`overflow-hidden rounded-xl border ${t.card}`}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left ${t.cardTitle}`}
          >
            <span>{faq.question}</span>
            <span className="text-lg opacity-50">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <div className={`border-t px-5 py-4 ${t.cardText}`}>{faq.answer}</div>}
        </div>
      ))}
    </div>
  )
}

export function FaqSectionView({ c, t, variant }: SectionProps) {
  const faqs = c.faqs.filter((faq) => faq.question)
  if (faqs.length === 0) return null
  const layout = getSectionVariants(variant).faq

  const title = <h2 className={`mb-10 text-center ${t.sectionTitle}`}>{c.faqSectionTitle}</h2>

  switch (layout) {
    case 'accordion':
      return (
        <section id="faq" className={t.section}>
          <div className="mx-auto max-w-3xl px-6">{title}<FaqAccordion faqs={faqs} t={t} /></div>
        </section>
      )
    case 'cards':
      return (
        <section id="faq" className={t.sectionAlt}>
          <div className="mx-auto max-w-6xl px-6">
            {title}
            <div className="grid gap-6 md:grid-cols-2">
              {faqs.map((faq, i) => (
                <div key={i} className={`rounded-2xl p-6 ${t.card}`}>
                  <h3 className={`mb-3 text-lg font-semibold ${t.cardTitle}`}>{faq.question}</h3>
                  <p className={t.cardText}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    case 'two-column':
      return (
        <section id="faq" className={t.section}>
          <div className="mx-auto max-w-6xl px-6">
            {title}
            <div className="columns-1 gap-10 md:columns-2">
              {faqs.map((faq, i) => (
                <div key={i} className={`mb-8 break-inside-avoid ${t.faq}`}>
                  <h3 className={`mb-2 font-semibold ${t.cardTitle}`}>{faq.question}</h3>
                  <p className={t.cardText}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    case 'numbered':
      return (
        <section id="faq" className={t.section}>
          <div className="mx-auto max-w-3xl px-6">
            {title}
            <div className="space-y-8">
              {faqs.map((faq, i) => (
                <div key={i} className="flex gap-6">
                  <span className={`shrink-0 text-3xl font-black opacity-25 ${t.stepNum}`}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className={`mb-2 font-bold uppercase tracking-wide ${t.cardTitle}`}>{faq.question}</h3>
                    <p className={t.cardText}>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    case 'sidebar':
      return (
        <section id="faq" className={t.sectionAlt}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
              <div>
                <h2 className={t.sectionTitle}>{c.faqSectionTitle}</h2>
                <p className={`mt-4 ${t.sectionSubtitle}`}>Common questions from clients and collaborators</p>
              </div>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i} className="grid gap-4 border-b pb-6 md:grid-cols-[35%_1fr]">
                    <h3 className={`font-semibold ${t.cardTitle}`}>{faq.question}</h3>
                    <p className={t.cardText}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )
    case 'minimal':
      return (
        <section id="faq" className={t.section}>
          <div className="mx-auto max-w-2xl px-6">
            <h2 className={`mb-12 text-center font-serif text-3xl font-light ${t.sectionTitle}`}>{c.faqSectionTitle}</h2>
            <div className="space-y-10">
              {faqs.map((faq, i) => (
                <div key={i} className="text-center">
                  <h3 className={`mb-3 font-serif text-lg ${t.cardTitle}`}>{faq.question}</h3>
                  <p className={`mx-auto max-w-lg text-sm leading-relaxed ${t.cardText}`}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    case 'boxed':
      return (
        <section id="faq" className={t.section}>
          <div className="mx-auto max-w-4xl px-6">
            {title}
            <div className={`rounded-2xl border-2 p-8 md:p-10 ${t.card}`}>
              {faqs.map((faq, i) => (
                <div key={i} className={t.faq}>
                  <h3 className={`mb-3 font-semibold ${t.cardTitle}`}>{faq.question}</h3>
                  <p className={t.cardText}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    default:
      return (
        <section id="faq" className={t.section}>
          <div className="mx-auto max-w-3xl px-6">
            {title}
            <div>
              {faqs.map((faq, i) => (
                <div key={i} className={t.faq}>
                  <h3 className={`mb-3 font-semibold ${t.cardTitle}`}>{faq.question}</h3>
                  <p className={t.cardText}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
  }
}

export function ExploreSectionView({ c, t, variant, basePath = '/' }: SectionProps) {
  const items = getSiteNavItems(variant, c).filter((item) => item.page !== 'home')
  if (items.length === 0) return null
  const cfg = getSectionVariants(variant)
  const layout = cfg.explore

  const header = (
    <div className="mb-10">
      <h2 className={`tpl-teaser-heading ${t.sectionTitle}`}>{cfg.exploreTitle}</h2>
      <p className={`mt-2 max-w-2xl ${t.sectionSubtitle}`}>{cfg.exploreSubtitle}</p>
    </div>
  )

  switch (layout) {
    case 'bento':
      return (
        <section className={t.sectionAlt}>
          <div className="mx-auto max-w-6xl px-6">
            {header}
            <div className="grid auto-rows-[minmax(120px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, i) => (
                <Link
                  key={item.page}
                  to={sitePath(basePath, item.segment)}
                  className={`flex flex-col justify-end rounded-2xl p-6 transition-transform hover:scale-[1.02] ${t.card} ${i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}
                >
                  <span className="mb-2 text-3xl opacity-30">{EXPLORE_ICONS[item.page] ?? '•'}</span>
                  <h3 className={`text-xl font-bold ${t.cardTitle}`}>{item.label}</h3>
                  <p className={`mt-1 text-sm ${t.cardText}`}>{cfg.exploreLinkLabel} →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )
    case 'pills':
      return (
        <section className={t.section}>
          <div className="mx-auto max-w-6xl px-6">
            {header}
            <div className="flex flex-wrap gap-3">
              {items.map((item) => (
                <Link
                  key={item.page}
                  to={sitePath(basePath, item.segment)}
                  className={`rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90 ${t.navCta}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )
    case 'list-arrows':
      return (
        <section className={t.sectionAlt}>
          <div className="mx-auto max-w-3xl px-6">
            {header}
            <div className="divide-y">
              {items.map((item) => (
                <Link key={item.page} to={sitePath(basePath, item.segment)} className="group flex items-center justify-between py-5">
                  <div>
                    <h3 className={`text-lg font-semibold group-hover:underline ${t.cardTitle}`}>{item.label}</h3>
                    <p className={`text-sm ${t.cardText}`}>{cfg.exploreSubtitle.split(',')[0]}</p>
                  </div>
                  <span className={`text-2xl transition-transform group-hover:translate-x-1 ${t.showcasePrice}`}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )
    case 'strips':
      return (
        <section className={t.section}>
          <div className="mx-auto max-w-6xl px-6">
            {header}
            <div className="space-y-3">
              {items.map((item) => (
                <Link
                  key={item.page}
                  to={sitePath(basePath, item.segment)}
                  className={`flex items-center justify-between rounded-lg px-6 py-5 uppercase tracking-wider transition-opacity hover:opacity-90 ${t.ctaBanner}`}
                >
                  <span className="font-bold">{item.label}</span>
                  <span className="text-sm">{cfg.exploreLinkLabel} →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )
    case 'tiles':
      return (
        <section className={t.sectionAlt}>
          <div className="mx-auto max-w-6xl px-6">
            {header}
            <div className="grid grid-cols-2 gap-px bg-black/10 md:grid-cols-4">
              {items.map((item) => (
                <Link key={item.page} to={sitePath(basePath, item.segment)} className={`flex aspect-square flex-col items-center justify-center bg-white p-4 text-center transition-colors hover:bg-black/5 ${t.card}`}>
                  <span className="mb-3 text-2xl tracking-widest">{EXPLORE_ICONS[item.page]}</span>
                  <span className={`text-xs font-medium uppercase tracking-[0.2em] ${t.cardTitle}`}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )
    case 'magazine':
      return (
        <section className={t.section}>
          <div className="mx-auto max-w-6xl px-6">
            {header}
            <div className="border-t">
              {items.map((item, i) => (
                <Link key={item.page} to={sitePath(basePath, item.segment)} className="group grid border-b py-8 md:grid-cols-[120px_1fr_auto] md:items-center md:gap-8">
                  <span className={`font-serif text-4xl opacity-20 ${t.stepNum}`}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className={`font-serif text-2xl group-hover:underline ${t.cardTitle}`}>{item.label}</h3>
                  </div>
                  <span className={`text-sm font-semibold ${t.showcasePrice}`}>{cfg.exploreLinkLabel}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )
    case 'compass':
      return (
        <section className={t.sectionAlt}>
          <div className="mx-auto max-w-4xl px-6 text-center">
            {header}
            <div className="relative mx-auto grid max-w-lg grid-cols-3 gap-4">
              {items.map((item, i) => {
                const positions = ['col-start-2', 'col-start-1 row-start-2', 'col-start-3 row-start-2', 'col-start-2 row-start-3', 'col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-2 row-start-1']
                return (
                  <Link key={item.page} to={sitePath(basePath, item.segment)} className={`rounded-full border px-4 py-3 text-sm font-semibold transition-shadow hover:shadow-md ${positions[i] ?? ''} ${t.card}`}>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )
    default:
      return (
        <section className={t.sectionAlt}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 text-center">
              <h2 className={`tpl-teaser-heading ${t.sectionTitle}`}>{cfg.exploreTitle}</h2>
              <p className={t.sectionSubtitle}>{cfg.exploreSubtitle}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link key={item.page} to={sitePath(basePath, item.segment)} className={`group rounded-xl border p-6 transition-shadow hover:shadow-lg ${t.card}`}>
                  <h3 className={`mb-2 text-lg font-semibold ${t.cardTitle}`}>{item.label}</h3>
                  <p className={`text-sm ${t.cardText}`}>{cfg.exploreLinkLabel} {item.label.toLowerCase()}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )
  }
}

function ContactDetails({ c, t, meta, className = '' }: {
  c: SiteContent; t: TemplateTheme
  meta: NonNullable<ReturnType<typeof getTemplateMeta>>
  className?: string
}) {
  const fields = meta.contactFields.filter((field) => c[field.key as ContactFieldKey])
  if (fields.length === 0) return null
  return (
    <div className={`grid gap-6 sm:grid-cols-2 ${className}`}>
      {fields.map((field) => (
        <div key={field.key}>
          <p className={`mb-1 ${t.contactLabel}`}>{field.label}</p>
          <p className="break-all">{c[field.key as ContactFieldKey]}</p>
        </div>
      ))}
    </div>
  )
}

function ContactFormWrap({ c, t, variant, layout }: { c: SiteContent; t: TemplateTheme; variant: TemplateId; layout: ContactLayout }) {
  const formStyle = getSectionVariants(variant).contactForm
  return <ContactFormBlock c={c} t={t} layout={layout} formStyle={formStyle} />
}

export function ContactSectionView({
  c, t, variant, layout, basePath = '/',
}: SectionProps & { layout: ContactLayout }) {
  const meta = getTemplateMeta(variant)
  if (!meta) return null
  const shell = getSectionVariants(variant).contactShell
  const title = c.contactSectionTitle || 'Get in Touch'
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact', c)
  const form = <ContactFormWrap c={c} t={t} variant={variant} layout={layout} />
  const info = <ContactDetails c={c} t={t} meta={meta} />
  const cta = <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>

  const shells: Record<string, ReactNode> = {
    'full-bleed': (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-4xl px-6 py-4 text-center">
          <h2 className={`mb-4 text-4xl font-black uppercase tracking-tight ${t.sectionTitle}`}>{title}</h2>
          <p className={`mb-10 ${t.sectionSubtitle}`}>{c.contactFormTitle}</p>
          <div className="text-left">{form}</div>
          <div className="mt-10 flex justify-center gap-8 text-sm">{info}</div>
        </div>
      </section>
    ),
    'centered-elegant': (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className={`mb-3 font-serif text-4xl font-light ${t.sectionTitle}`}>{title}</h2>
          <p className={`mb-8 ${t.sectionSubtitle}`}>We look forward to welcoming you</p>
          <div className="mb-10 text-left">{info}</div>
          <div className="text-left">{form}</div>
          <div className="mt-8">{cta}</div>
        </div>
      </section>
    ),
    'sidebar-panel': (
      <section id="contact" className={t.section}>
        <div className="mx-auto max-w-6xl px-6">
          <h2 className={`mb-10 text-3xl font-bold ${t.sectionTitle}`}>{title}</h2>
          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-6">{info}<div>{cta}</div></aside>
            <div className="lg:pl-4">{form}</div>
          </div>
        </div>
      </section>
    ),
    'split-dark': (
      <section id="contact" className={t.contact}>
        <div className="mx-auto grid max-w-6xl gap-0 px-6 lg:grid-cols-2">
          <div className="py-4 lg:pr-12">
            <h2 className={`mb-6 text-4xl font-black uppercase ${t.sectionTitle}`}>{title}</h2>
            {info}
            <div className="mt-8">{cta}</div>
          </div>
          <div className="py-4 lg:pl-12">{form}</div>
        </div>
      </section>
    ),
    'boutique-luxe': (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-xl px-6 text-center">
          <p className={`mb-2 text-xs uppercase tracking-[0.3em] ${t.contactLabel}`}>Concierge</p>
          <h2 className={`mb-10 font-serif text-4xl ${t.sectionTitle}`}>{title}</h2>
          {info}
          <div className="mt-12 text-left">{form}</div>
        </div>
      </section>
    ),
    'card-float': (
      <section id="contact" className={t.section}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative rounded-2xl border p-8 md:p-12">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <div>
                <h2 className={`mb-6 text-3xl font-bold ${t.sectionTitle}`}>{title}</h2>
                {info}
              </div>
              <div className="rounded-xl shadow-2xl lg:-mt-16 lg:translate-y-4">{form}</div>
            </div>
          </div>
        </div>
      </section>
    ),
    'minimal-split': (
      <section id="contact" className={t.sectionAlt}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className={`mb-8 text-sm font-light uppercase tracking-[0.4em] ${t.sectionTitle}`}>{title}</h2>
              {info}
            </div>
            <div>{form}</div>
          </div>
        </div>
      </section>
    ),
    intake: (
      <section id="contact" className={t.section}>
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-center text-sm text-teal-800">
            Secure patient inquiry — we respond within one business day
          </div>
          <h2 className={`mb-2 text-3xl font-bold ${t.sectionTitle}`}>{title}</h2>
          <p className={`mb-8 ${t.sectionSubtitle}`}>{c.contactFormTitle}</p>
          {form}
          <div className="mt-10 border-t pt-8">{info}</div>
        </div>
      </section>
    ),
    'formal-columns': (
      <section id="contact" className={t.sectionAlt}>
        <div className="mx-auto max-w-6xl px-6">
          <h2 className={`mb-2 font-serif text-3xl ${t.sectionTitle}`}>{title}</h2>
          <p className={`mb-10 border-b pb-6 text-sm ${t.sectionSubtitle}`}>Schedule a confidential consultation</p>
          <div className="mb-12 grid gap-8 sm:grid-cols-3">{info}</div>
          <div className="max-w-2xl">{form}</div>
        </div>
      </section>
    ),
    'salon-mirror': (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-6xl px-6">
          <h2 className={`mb-10 text-center font-serif text-3xl ${t.sectionTitle}`}>{title}</h2>
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="order-2 lg:order-1">{form}</div>
            <div className="order-1 space-y-6 text-center lg:order-2 lg:text-left">{info}<div className="flex justify-center lg:justify-start">{cta}</div></div>
          </div>
        </div>
      </section>
    ),
    'noir-gold': (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-5xl border border-amber-500/30 px-6 py-12 md:px-12">
          <h2 className={`mb-8 text-center font-serif text-2xl uppercase tracking-[0.25em] text-amber-200 ${t.sectionTitle}`}>{title}</h2>
          <div className="grid gap-12 lg:grid-cols-2">{info}{form}</div>
        </div>
      </section>
    ),
    'terra-pill': (
      <section id="contact" className={t.section}>
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-orange-200 bg-orange-50/80 p-8 md:p-12">
            <h2 className={`mb-8 text-2xl font-bold text-orange-950 ${t.sectionTitle}`}>{title}</h2>
            <div className="grid gap-10 lg:grid-cols-2">{info}{form}</div>
          </div>
        </div>
      </section>
    ),
    'coastal-wave': (
      <section id="contact" className={t.contact}>
        <div className="border-b-4 border-sky-400 bg-gradient-to-b from-sky-50 to-white px-6 py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className={`mb-2 text-3xl font-bold text-sky-950 ${t.sectionTitle}`}>{title}</h2>
            <p className="mb-10 text-sky-700">Reach our team for bookings and local recommendations</p>
            <div className="grid gap-12 lg:grid-cols-2">{info}{form}</div>
          </div>
        </div>
      </section>
    ),
    'vineyard-reserve': (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className={`mb-2 font-serif text-sm uppercase tracking-widest ${t.contactLabel}`}>Reservations</p>
          <h2 className={`mb-10 font-serif text-4xl ${t.sectionTitle}`}>{title}</h2>
          <div className="mb-10 text-left">{info}</div>
          <div className="text-left">{form}</div>
        </div>
      </section>
    ),
    'arcade-neon': (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-4xl px-6">
          <h2 className={`mb-8 text-center text-2xl font-black uppercase tracking-wider text-lime-300 ${t.sectionTitle}`}>{title}</h2>
          <div className="rounded-xl border-2 border-lime-400/50 p-6 shadow-[0_0_30px_rgba(163,230,53,0.12)] md:p-10">
            {form}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">{info}</div>
        </div>
      </section>
    ),
    'coffee-warm': (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 className={`mb-4 font-serif text-3xl text-[#2d1810] ${t.sectionTitle}`}>{title}</h2>
              <p className={`mb-8 text-[#5c3d2e] ${t.cardText}`}>Questions about beans, events, or catering? Send us a note.</p>
              {info}
            </div>
            <div>{form}</div>
          </div>
        </div>
      </section>
    ),
    'split-classic': (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-6xl px-6">
          <h2 className={`mb-10 text-3xl font-bold ${t.sectionTitle}`}>{title}</h2>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <h3 className={`mb-6 text-xl font-semibold ${t.cardTitle}`}>{c.contactFormTitle}</h3>
              {info}
              <div className="mt-8">{cta}</div>
            </div>
            {form}
          </div>
        </div>
      </section>
    ),
  }

  return shells[shell] ?? shells['split-classic']
}