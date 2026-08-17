import { Link } from 'react-router-dom'
import { resolveSiteHref, sitePath } from '../data/siteNav'
import type { SiteContent } from '../types'

const NAVY = '#0a1628'
const CRIMSON = '#c41e3a'

interface Props {
  c: SiteContent
  basePath: string
}

export function AxiomHome({ c, basePath }: Props) {
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact', c)
  const servicesHref = sitePath(basePath, 'services')
  const aboutHref = sitePath(basePath, 'about')
  const stats = c.stats.filter((s) => s.value).slice(0, 4)
  const steps = c.steps.filter((s) => s.title)
  const services = c.services.filter((s) => s.title).slice(0, 4)
  const reviews = c.testimonials.filter((t) => t.quote).slice(0, 3)
  const faqs = c.faqs.filter((f) => f.question)

  return (
    <div className="bg-white text-[#0a1628]">
      <header className="border-b border-[#0a1628]/10">
        <div className="h-1.5 w-full" style={{ backgroundColor: CRIMSON }} />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-7">
            <p className="mb-4 text-xs font-bold tracking-[0.32em] uppercase" style={{ color: CRIMSON }}>
              Tax controversy & audit defense
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">{c.tagline}</h1>
            <div className="mt-6 h-1 w-16" style={{ backgroundColor: CRIMSON }} />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#3d4a5c]">{c.heroSubtext}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to={ctaHref}
                className="px-8 py-3.5 text-sm font-bold tracking-wide text-white"
                style={{ backgroundColor: CRIMSON }}
              >
                {c.ctaText}
              </Link>
              <Link to={servicesHref} className="border border-[#0a1628] px-8 py-3.5 text-sm font-bold">
                Practice areas
              </Link>
            </div>
          </div>
          {c.heroImage && (
            <div className="relative lg:col-span-5">
              <div className="absolute -left-4 -top-4 h-full w-full border" style={{ borderColor: CRIMSON }} />
              <img src={c.heroImage} alt="" className="relative h-[420px] w-full object-cover" />
            </div>
          )}
        </div>
        {stats.length > 0 && (
          <div className="text-white" style={{ backgroundColor: NAVY }}>
            <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
              {stats.map((s, i) => (
                <div key={s.label} className={`px-6 py-10 ${i > 0 ? 'md:border-l border-white/10' : ''}`}>
                  <p className="font-serif text-3xl md:text-4xl" style={{ color: CRIMSON }}>
                    {s.value}
                  </p>
                  <p className="mt-2 text-[11px] font-bold tracking-[0.2em] text-white/55 uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {services.length > 0 && (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold tracking-[0.28em] uppercase" style={{ color: CRIMSON }}>
              Practice
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">{c.servicesSectionTitle}</h2>
            <p className="mt-3 max-w-2xl text-[#3d4a5c]">{c.servicesSectionSubtitle}</p>
            <div className="mt-12 divide-y divide-[#0a1628]/10 border-y border-[#0a1628]/10">
              {services.map((service, i) => (
                <Link key={service.title} to={servicesHref} className="group grid gap-4 py-8 md:grid-cols-12 md:items-center">
                  <p className="font-serif text-3xl md:col-span-2" style={{ color: CRIMSON }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-serif text-2xl md:col-span-4">{service.title}</h3>
                  <p className="text-[#3d4a5c] md:col-span-6">{service.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-7xl px-8 py-16 text-white md:px-14" style={{ backgroundColor: NAVY }}>
            <h2 className="font-serif text-4xl md:text-5xl">{c.stepsSectionTitle}</h2>
            <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.title}>
                  <p className="text-xs font-bold tracking-[0.24em] uppercase" style={{ color: CRIMSON }}>
                    0{i + 1}
                  </p>
                  <h3 className="mt-3 font-serif text-xl">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-[0.28em] uppercase" style={{ color: CRIMSON }}>
              The firm
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">{c.aboutTitle}</h2>
            <p className="mt-6 text-lg leading-relaxed text-[#3d4a5c]">{c.about}</p>
            {c.missionStatement && (
              <p className="mt-8 border-l-4 pl-5 font-serif text-xl" style={{ borderColor: CRIMSON }}>
                {c.missionStatement}
              </p>
            )}
            <Link to={aboutHref} className="mt-8 inline-block text-sm font-bold" style={{ color: CRIMSON }}>
              Counsel and credentials →
            </Link>
          </div>
          {c.aboutImage && <img src={c.aboutImage} alt="" className="h-[440px] w-full object-cover" />}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="bg-[#f6f4f0] px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 font-serif text-4xl">{c.testimonialsSectionTitle}</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {reviews.map((review) => (
                <figure key={review.author} className="border-t-4 bg-white p-8" style={{ borderColor: CRIMSON }}>
                  <p className="font-serif text-xl leading-snug">“{review.quote}”</p>
                  <figcaption className="mt-8 text-sm font-bold">
                    {review.author}
                    <span className="mt-1 block font-normal text-[#3d4a5c]">{review.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center font-serif text-4xl">{c.faqSectionTitle}</h2>
            <div className="divide-y divide-[#0a1628]/10 border-y border-[#0a1628]/10">
              {faqs.map((faq) => (
                <details key={faq.question} className="py-2">
                  <summary className="cursor-pointer py-4 font-bold">{faq.question}</summary>
                  <p className="pb-4 leading-relaxed text-[#3d4a5c]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 pb-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-10 py-14 text-white md:flex-row md:items-center" style={{ backgroundColor: CRIMSON }}>
          <div className="max-w-xl">
            <h2 className="font-serif text-4xl md:text-5xl">{c.ctaBannerTitle}</h2>
            <p className="mt-4 text-white/85">{c.ctaBannerText}</p>
          </div>
          <Link to={ctaHref} className="bg-white px-8 py-3.5 text-sm font-bold" style={{ color: NAVY }}>
            {c.ctaText}
          </Link>
        </div>
      </section>
    </div>
  )
}
