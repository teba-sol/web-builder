import { Link } from 'react-router-dom'
import { resolveSiteHref, sitePath } from '../data/siteNav'
import type { SiteContent } from '../types'

const COBALT = '#155dfc'
const INK = '#0f172a'

interface Props {
  c: SiteContent
  basePath: string
}

export function HelixHome({ c, basePath }: Props) {
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact', c)
  const servicesHref = sitePath(basePath, 'services')
  const aboutHref = sitePath(basePath, 'about')
  const portfolioHref = sitePath(basePath, 'portfolio')
  const stats = c.stats.filter((s) => s.value).slice(0, 3)
  const steps = c.steps.filter((s) => s.title)
  const services = c.services.filter((s) => s.title).slice(0, 4)
  const cases = c.showcaseItems.filter((s) => s.title).slice(0, 4)
  const reviews = c.testimonials.filter((t) => t.quote).slice(0, 3)
  const faqs = c.faqs.filter((f) => f.question)

  return (
    <div className="bg-[#f8fafc] text-[#0f172a]">
      <header className="relative overflow-hidden bg-[#0f172a] text-white">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#155dfc]/30 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <p className="mb-5 text-xs font-bold tracking-[0.28em] uppercase text-[#93c5fd]">
            Financial audit · tax examination
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">{c.tagline}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{c.heroSubtext}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to={ctaHref} className="rounded-md px-8 py-3.5 text-sm font-bold text-white" style={{ backgroundColor: COBALT }}>
              {c.ctaText}
            </Link>
            <Link to={servicesHref} className="rounded-md border border-white/25 px-8 py-3.5 text-sm font-bold text-white">
              Engagement types
            </Link>
          </div>
          {c.heroImage && (
            <img src={c.heroImage} alt="" className="mt-14 h-[360px] w-full rounded-2xl object-cover ring-1 ring-white/10" />
          )}
        </div>
        {stats.length > 0 && (
          <div className="relative mx-auto grid max-w-7xl grid-cols-3 gap-3 px-6 pb-12">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white px-5 py-6 text-[#0f172a]">
                <p className="text-3xl font-black tracking-tight" style={{ color: COBALT }}>
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-bold tracking-wide text-slate-500 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </header>

      {services.length > 0 && (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.24em] uppercase" style={{ color: COBALT }}>
                Engagements
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{c.servicesSectionTitle}</h2>
              <p className="mt-3 text-slate-600">{c.servicesSectionSubtitle}</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {services.map((service, i) => (
                <Link
                  key={service.title}
                  to={servicesHref}
                  className={`rounded-2xl p-8 transition hover:-translate-y-0.5 ${i === 0 ? 'text-white md:col-span-2' : 'bg-white ring-1 ring-slate-200'}`}
                  style={i === 0 ? { backgroundColor: COBALT } : undefined}
                >
                  <p className={`text-xs font-black tracking-[0.2em] uppercase ${i === 0 ? 'text-white/70' : 'text-[#155dfc]'}`}>
                    0{i + 1}
                  </p>
                  <h3 className="mt-3 text-2xl font-black">{service.title}</h3>
                  <p className={`mt-3 max-w-2xl leading-relaxed ${i === 0 ? 'text-white/80' : 'text-slate-600'}`}>
                    {service.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-7xl rounded-3xl bg-white p-8 ring-1 ring-slate-200 md:p-12">
            <h2 className="text-4xl font-black tracking-tight">{c.stepsSectionTitle}</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.title} className="relative">
                  <p className="text-5xl font-black" style={{ color: COBALT }}>
                    {i + 1}
                  </p>
                  <h3 className="mt-3 text-lg font-black">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">{c.aboutTitle}</h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">{c.about}</p>
            {c.missionStatement && (
              <p className="mt-6 border-l-4 pl-5 text-lg font-semibold" style={{ borderColor: COBALT }}>
                {c.missionStatement}
              </p>
            )}
            <Link to={aboutHref} className="mt-8 inline-block text-sm font-black" style={{ color: COBALT }}>
              The methodology →
            </Link>
          </div>
          {c.aboutImage && <img src={c.aboutImage} alt="" className="h-[420px] w-full rounded-2xl object-cover" />}
        </div>
      </section>

      {cases.length > 0 && (
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-4xl font-black tracking-tight">{c.showcaseSectionTitle}</h2>
              <Link to={portfolioHref} className="text-sm font-black" style={{ color: COBALT }}>
                All matters →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {cases.map((item) => (
                <Link key={item.title} to={portfolioHref} className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                  {item.image && <img src={item.image} alt="" className="h-48 w-full object-cover" />}
                  <div className="p-6">
                    {item.tag && (
                      <p className="text-xs font-black tracking-wider uppercase" style={{ color: COBALT }}>
                        {item.tag}
                      </p>
                    )}
                    <h3 className="mt-2 text-xl font-black">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-10 text-4xl font-black tracking-tight">{c.testimonialsSectionTitle}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.map((review) => (
                <figure key={review.author} className="rounded-2xl p-7 text-white" style={{ backgroundColor: INK }}>
                  <p className="text-lg font-semibold leading-snug">“{review.quote}”</p>
                  <figcaption className="mt-6 text-sm font-black text-[#93c5fd]">
                    {review.author}
                    <span className="mt-1 block font-medium text-white/50">{review.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-4xl font-black">{c.faqSectionTitle}</h2>
            <div className="space-y-2">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-xl bg-white px-5 ring-1 ring-slate-200">
                  <summary className="cursor-pointer py-4 font-bold">{faq.question}</summary>
                  <p className="border-t border-slate-100 py-4 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl rounded-3xl px-8 py-14 text-white md:px-14" style={{ backgroundColor: COBALT }}>
          <h2 className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">{c.ctaBannerTitle}</h2>
          <p className="mt-4 max-w-xl text-white/85">{c.ctaBannerText}</p>
          <Link to={ctaHref} className="mt-8 inline-block rounded-md bg-white px-8 py-3.5 text-sm font-black" style={{ color: COBALT }}>
            {c.ctaText}
          </Link>
        </div>
      </section>
    </div>
  )
}
