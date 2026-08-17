import { Link } from 'react-router-dom'
import { resolveSiteHref, sitePath } from '../data/siteNav'
import type { SiteContent } from '../types'

const WINE = '#7a2e38'
const GOLD = '#b8956a'
const INK = '#2a211c'

interface Props {
  c: SiteContent
  basePath: string
}

export function AureumHome({ c, basePath }: Props) {
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact', c)
  const servicesHref = sitePath(basePath, 'services')
  const aboutHref = sitePath(basePath, 'about')
  const locationsHref = sitePath(basePath, 'portfolio')
  const stats = c.stats.filter((s) => s.value).slice(0, 3)
  const steps = c.steps.filter((s) => s.title)
  const services = c.services.filter((s) => s.title).slice(0, 3)
  const locations = c.showcaseItems.filter((s) => s.title).slice(0, 6)
  const reviews = c.testimonials.filter((t) => t.quote).slice(0, 3)
  const faqs = c.faqs.filter((f) => f.question)

  return (
    <div className="bg-[#f4efe6] text-[#2a211c]">
      <header className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[86vh] max-w-7xl items-center gap-12 px-6 pb-28 pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-32">
          <div className="lg:col-span-6">
            <p className="mb-5 text-xs font-semibold tracking-[0.28em] uppercase" style={{ color: WINE }}>
              {c.businessName}
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl lg:text-7xl" style={{ color: INK }}>
              {c.tagline}
            </h1>
            <div className="mt-6 h-px w-20" style={{ backgroundColor: GOLD }} />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#5c5148]">{c.heroSubtext}</p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to={ctaHref}
                className="rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide text-white shadow-lg transition hover:opacity-90"
                style={{ backgroundColor: WINE }}
              >
                {c.ctaText}
              </Link>
              <Link to={servicesHref} className="text-sm font-semibold tracking-wide" style={{ color: WINE }}>
                View services →
              </Link>
            </div>
          </div>
          <div className="relative lg:col-span-6">
            {c.heroImage && (
              <img
                src={c.heroImage}
                alt=""
                className="h-[420px] w-full rounded-[2rem] object-cover shadow-2xl md:h-[560px]"
              />
            )}
            <div
              className="absolute -bottom-6 left-6 hidden rounded-2xl px-5 py-4 text-white shadow-xl md:block"
              style={{ backgroundColor: WINE }}
            >
              <p className="font-serif text-3xl">$7,500</p>
              <p className="mt-1 text-xs tracking-wide text-white/80">Largest same-week advance</p>
            </div>
          </div>
        </div>
        {stats.length > 0 && (
          <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-6">
            <div className="grid grid-cols-3 overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-24px_rgba(42,33,28,0.35)]">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`px-4 py-7 text-center md:px-8 ${i > 0 ? 'border-l border-[#eadfce]' : ''}`}
                >
                  <p className="font-serif text-3xl md:text-4xl" style={{ color: WINE }}>
                    {s.value}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold tracking-[0.18em] text-[#8a7d72] uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {services.length > 0 && (
        <section className="px-6 pb-8 pt-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 max-w-2xl">
              <p className="mb-3 text-xs font-semibold tracking-[0.28em] uppercase" style={{ color: GOLD }}>
                What we do
              </p>
              <h2 className="font-serif text-4xl tracking-tight md:text-5xl">{c.servicesSectionTitle}</h2>
              <p className="mt-4 text-lg text-[#5c5148]">{c.servicesSectionSubtitle}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {services.map((service, i) => (
                <Link
                  key={service.title}
                  to={servicesHref}
                  className="group overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-[#eadfce] transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {c.galleryImages[i] && (
                    <img src={c.galleryImages[i]} alt="" className="h-48 w-full object-cover" />
                  )}
                  <div className="p-8">
                    <p className="mb-4 font-serif text-4xl" style={{ color: GOLD }}>
                      0{i + 1}
                    </p>
                    <h3 className="font-serif text-2xl leading-snug">{service.title}</h3>
                    <p className="mt-3 leading-relaxed text-[#5c5148]">{service.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl rounded-[2rem] px-6 py-16 text-white md:px-14" style={{ backgroundColor: INK }}>
            <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mb-3 text-xs font-semibold tracking-[0.28em] uppercase" style={{ color: GOLD }}>
                  The engagement
                </p>
                <h2 className="font-serif text-4xl md:text-5xl">{c.stepsSectionTitle}</h2>
              </div>
              <div className="h-px w-24" style={{ backgroundColor: GOLD }} />
            </div>
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.title}>
                  <p className="font-serif text-3xl" style={{ color: GOLD }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 font-serif text-xl">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 pb-8">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.28em] uppercase" style={{ color: WINE }}>
              The studio
            </p>
            <h2 className="font-serif text-4xl tracking-tight md:text-5xl">{c.aboutTitle}</h2>
            <p className="mt-6 text-lg leading-relaxed text-[#5c5148]">{c.about}</p>
            {c.missionStatement && (
              <p className="mt-8 border-l-2 pl-5 font-serif text-xl leading-snug" style={{ borderColor: GOLD, color: INK }}>
                {c.missionStatement}
              </p>
            )}
            <Link to={aboutHref} className="mt-8 inline-block text-sm font-semibold" style={{ color: WINE }}>
              Our story →
            </Link>
          </div>
          {c.aboutImage && (
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem]" style={{ border: `1px solid ${GOLD}` }} />
              <img src={c.aboutImage} alt="" className="relative h-[460px] w-full rounded-[1.75rem] object-cover" />
            </div>
          )}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-center font-serif text-4xl md:text-5xl">{c.testimonialsSectionTitle}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {reviews.map((review) => (
                <figure key={review.author} className="rounded-[1.5rem] bg-white p-8 ring-1 ring-[#eadfce]">
                  <p className="font-serif text-2xl leading-snug" style={{ color: INK }}>
                    “{review.quote}”
                  </p>
                  <figcaption className="mt-8 text-sm">
                    <span className="font-semibold">{review.author}</span>
                    <span className="mt-1 block text-[#8a7d72]">{review.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {locations.length > 0 && (
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between gap-4">
              <h2 className="font-serif text-4xl md:text-5xl">{c.showcaseSectionTitle}</h2>
              <Link to={locationsHref} className="text-sm font-semibold" style={{ color: WINE }}>
                All locations →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {locations.map((loc) => (
                <Link key={loc.title} to={locationsHref} className="group relative overflow-hidden rounded-[1.25rem]">
                  {loc.image ? (
                    <img src={loc.image} alt="" className="h-52 w-full object-cover transition duration-500 group-hover:scale-105 md:h-64" />
                  ) : (
                    <div className="h-52 bg-[#eadfce] md:h-64" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="font-serif text-xl">{loc.title}</p>
                    {loc.tag && <p className="mt-1 text-xs tracking-wide text-white/70">{loc.tag}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center font-serif text-4xl">{c.faqSectionTitle}</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl bg-white px-6 py-2 ring-1 ring-[#eadfce]">
                  <summary className="cursor-pointer py-4 font-semibold">{faq.question}</summary>
                  <p className="border-t border-[#eadfce] py-4 leading-relaxed text-[#5c5148]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 pb-24">
        <div
          className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] px-8 py-14 md:flex-row md:items-center md:px-14"
          style={{ backgroundColor: WINE }}
        >
          <div className="max-w-xl text-white">
            <h2 className="font-serif text-4xl md:text-5xl">{c.ctaBannerTitle}</h2>
            <p className="mt-4 text-white/80">{c.ctaBannerText}</p>
          </div>
          <Link
            to={ctaHref}
            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold"
            style={{ color: WINE }}
          >
            {c.ctaText}
          </Link>
        </div>
      </section>
    </div>
  )
}
