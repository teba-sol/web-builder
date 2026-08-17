import { Link } from 'react-router-dom'
import { resolveSiteHref, sitePath } from '../data/siteNav'
import type { SiteContent } from '../types'

const LIME = '#c8ff3d'
const MAGENTA = '#ff2d6a'

interface Props {
  c: SiteContent
  basePath: string
}

export function FluxHome({ c, basePath }: Props) {
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact', c)
  const servicesHref = sitePath(basePath, 'services')
  const aboutHref = sitePath(basePath, 'about')
  const locationsHref = sitePath(basePath, 'portfolio')
  const stats = c.stats.filter((s) => s.value).slice(0, 4)
  const steps = c.steps.filter((s) => s.title)
  const services = c.services.filter((s) => s.title).slice(0, 3)
  const locations = c.showcaseItems.filter((s) => s.title).slice(0, 5)
  const reviews = c.testimonials.filter((t) => t.quote).slice(0, 3)
  const faqs = c.faqs.filter((f) => f.question)
  const [lead, ...rest] = c.tagline.split(' ')
  const restTitle = rest.join(' ')

  return (
    <div className="bg-[#070708] text-white">
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#c8ff3d]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[#ff2d6a]/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-end gap-10 px-6 pb-16 pt-16 lg:grid-cols-12 lg:pt-20">
          <div className="lg:col-span-7">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold tracking-[0.22em] uppercase text-[#c8ff3d]">
              {c.businessName} · same-week money
            </p>
            <h1 className="text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-8xl">
              <span className="text-[#c8ff3d]">{lead}</span>
              {restTitle ? <span className="block text-white">{restTitle}</span> : null}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/65">{c.heroSubtext}</p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to={ctaHref}
                className="rounded-full px-8 py-3.5 text-sm font-black tracking-wide text-black"
                style={{ backgroundColor: LIME }}
              >
                {c.ctaText}
              </Link>
              <Link to={servicesHref} className="text-sm font-bold text-white/70 hover:text-white">
                See the products →
              </Link>
            </div>
          </div>
          <div className="relative lg:col-span-5">
            {c.heroImage && (
              <img
                src={c.heroImage}
                alt=""
                className="h-[380px] w-full rounded-[2rem] object-cover ring-2 ring-[#c8ff3d] md:h-[480px]"
              />
            )}
            <div
              className="absolute -left-4 -bottom-5 rotate-[-6deg] rounded-2xl px-5 py-3 font-black text-black shadow-2xl md:-left-8"
              style={{ backgroundColor: MAGENTA, color: '#fff' }}
            >
              up to $7,500 · this week
            </div>
          </div>
        </div>
        {stats.length > 0 && (
          <div className="border-y border-white/10 bg-black">
            <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
              {stats.map((s, i) => (
                <div key={s.label} className={`px-6 py-8 ${i > 0 ? 'md:border-l border-white/10' : ''}`}>
                  <p className="text-3xl font-black tracking-tight text-[#c8ff3d] md:text-4xl">{s.value}</p>
                  <p className="mt-2 text-xs font-bold tracking-[0.2em] text-white/45 uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {services.length > 0 && (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-black tracking-[0.24em] uppercase text-[#ff2d6a]">The menu</p>
                <h2 className="text-4xl font-black tracking-tight md:text-5xl">{c.servicesSectionTitle}</h2>
              </div>
              <p className="hidden max-w-xs text-right text-sm text-white/50 md:block">{c.servicesSectionSubtitle}</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-5">
              {services[0] && (
                <Link
                  to={servicesHref}
                  className="group relative overflow-hidden rounded-[1.75rem] lg:col-span-3 min-h-[320px]"
                  style={{ backgroundColor: LIME }}
                >
                  {c.galleryImages[0] && (
                    <img
                      src={c.galleryImages[0]}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-multiply"
                    />
                  )}
                  <div className="relative flex h-full flex-col justify-end p-8 text-black">
                    <p className="text-xs font-black tracking-[0.2em] uppercase">01</p>
                    <h3 className="mt-3 text-3xl font-black leading-tight md:text-4xl">{services[0].title}</h3>
                    <p className="mt-3 max-w-md text-sm font-medium text-black/70">{services[0].description}</p>
                  </div>
                </Link>
              )}
              <div className="grid gap-4 lg:col-span-2">
                {services.slice(1).map((service, i) => (
                  <Link
                    key={service.title}
                    to={servicesHref}
                    className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7 transition hover:border-[#c8ff3d]"
                  >
                    <p className="text-xs font-black tracking-[0.2em] uppercase text-[#c8ff3d]">0{i + 2}</p>
                    <h3 className="mt-3 text-2xl font-black">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{service.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#c8ff3d] px-6 py-16 text-black md:px-12">
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">{c.stepsSectionTitle}</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.title} className="border-t-4 border-black pt-5">
                  <p className="text-5xl font-black">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-4 text-xl font-black">{step.title}</h3>
                  <p className="mt-2 text-sm font-medium text-black/70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-black tracking-[0.24em] uppercase text-[#ff2d6a]">Why Flux</p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">{c.aboutTitle}</h2>
            <p className="mt-6 text-lg leading-relaxed text-white/60">{c.about}</p>
            {c.missionStatement && (
              <p className="mt-8 border-l-4 pl-5 text-xl font-black leading-snug text-[#c8ff3d]" style={{ borderColor: MAGENTA }}>
                {c.missionStatement}
              </p>
            )}
            <Link to={aboutHref} className="mt-8 inline-block text-sm font-black text-[#c8ff3d]">
              The full story →
            </Link>
          </div>
          {c.aboutImage && (
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-[#ff2d6a]" />
              <img src={c.aboutImage} alt="" className="relative h-[420px] w-full rounded-[1.75rem] object-cover" />
            </div>
          )}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-10 text-4xl font-black tracking-tight">{c.testimonialsSectionTitle}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.map((review) => (
                <figure key={review.author} className="rounded-[1.5rem] bg-white p-7 text-black">
                  <p className="text-5xl font-black leading-none text-[#ff2d6a]">“</p>
                  <p className="mt-2 text-lg font-bold leading-snug">{review.quote}</p>
                  <figcaption className="mt-6 text-sm font-black">
                    {review.author}
                    <span className="mt-1 block font-medium text-black/50">{review.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {locations.length > 0 && (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-4xl font-black tracking-tight">{c.showcaseSectionTitle}</h2>
              <Link to={locationsHref} className="text-sm font-black text-[#c8ff3d]">
                Map it →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              {locations.map((loc, i) => (
                <Link
                  key={loc.title}
                  to={locationsHref}
                  className={`group relative overflow-hidden rounded-3xl ${i === 0 ? 'md:col-span-3 md:row-span-2 min-h-[280px]' : 'md:col-span-3 min-h-[160px]'}`}
                >
                  {loc.image ? (
                    <img src={loc.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="h-full bg-white/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-xl font-black">{loc.title}</p>
                    {loc.tag && <p className="text-xs font-bold uppercase tracking-wider text-[#c8ff3d]">{loc.tag}</p>}
                  </div>
                </Link>
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
                <details key={faq.question} className="rounded-2xl border border-white/10 bg-white/5 px-5">
                  <summary className="cursor-pointer py-4 font-black">{faq.question}</summary>
                  <p className="border-t border-white/10 py-4 text-sm leading-relaxed text-white/60">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-8 py-16 md:px-14" style={{ backgroundColor: MAGENTA }}>
          <p className="text-xs font-black tracking-[0.24em] uppercase text-white/80">Ready</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl">{c.ctaBannerTitle}</h2>
          <p className="mt-4 max-w-xl text-lg text-white/85">{c.ctaBannerText}</p>
          <Link
            to={ctaHref}
            className="mt-8 inline-block rounded-full bg-black px-8 py-3.5 text-sm font-black text-[#c8ff3d]"
          >
            {c.ctaText}
          </Link>
        </div>
      </section>
    </div>
  )
}
