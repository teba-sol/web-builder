import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { resolveSiteHref, sitePath } from '../../data/siteNav'
import type { SiteContent } from '../../types'
import { CloneMap, CloneNav, ClonePricingSection, CloneTeamSection } from './CloneChrome'
import { getMapOpenUrl } from '../../utils/mapEmbed'
import { buildCloneHomeData } from './cloneHomeData'

const MAROON = 'var(--clone-accent)'
const WINE = 'var(--clone-ink)'
const SIGNAL = 'var(--clone-highlight)'

interface Props {
  c: SiteContent
  basePath: string
}

export function Template6({ c, basePath }: Props) {
  const d = buildCloneHomeData(c, basePath, 'helix')
  const [formOpen, setFormOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact', c)
  const servicesHref = sitePath(basePath, 'services')
  const locationsHref = sitePath(basePath, 'portfolio')
  const stats = c.stats.filter((s) => s.value).slice(0, 3)
  const steps = c.steps.filter((s) => s.title)
  const services = c.services.filter((s) => s.title).slice(0, 3)
  const locations = c.showcaseItems.filter((s) => s.title).slice(0, 6)
  const reviews = c.testimonials.filter((t) => t.quote).slice(0, 3)
  const faqs = c.faqs.filter((f) => f.question)
  const mapsHref = getMapOpenUrl(c.mapUrl, c.address)
  const specialize = services.map((s, i) => ({
    title: i === 0 ? 'Advances' : i === 1 ? 'Referrals' : 'Business Tax',
    description: s.description,
    image: locations[i]?.image || c.galleryImages[i] || '',
  }))

  const onPrequalify = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }


  return (
    <div className="bg-[var(--clone-surface)] font-sans text-[var(--clone-ink)]">
      <CloneNav templateId="helix" d={d} onBook={() => { setFormOpen(true); setSubmitted(false) }} />

      <header className="relative z-0 isolate min-h-[70vh] overflow-hidden csm:h-screen csm:min-h-[640px]">
        {c.heroImage ? (
          <img src={c.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-6 text-4xl font-bold text-white csm:text-5xl clg:text-6xl">{c.tagline}</h1>
          <p className="mb-8 text-lg leading-relaxed text-gray-200 csm:text-xl">{c.heroSubtext}</p>
          <Link
            to={ctaHref}
            className="rounded-full border-2 px-8 py-3 text-lg font-semibold text-white transition hover:bg-white hover:text-[var(--clone-accent)]"
            style={{ borderColor: MAROON }}
          >
            Learn More
          </Link>
        </div>
        {c.sectionVisibility.stats && stats.length > 0 && (
          <div className="absolute right-0 bottom-10 left-0 z-10 flex flex-wrap justify-center gap-8 px-4 csm:gap-16">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white csm:text-3xl">{s.value}</div>
                <div className="text-sm text-gray-300 csm:text-base">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </header>

      {c.sectionVisibility.steps && steps.length > 0 && (
        <section className="w-full px-6 py-24 text-white" style={{ backgroundColor: WINE }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight csm:text-6xl cmd:text-7xl">{c.stepsSectionTitle || 'How It Works'}</h2>
              <div className="flex justify-center">
                <div className="h-1 w-20 bg-white" />
              </div>
            </div>
            <div className="mb-28 grid items-start gap-16 clg:grid-cols-2">
              <div className="space-y-12">
                {steps.slice(0, 2).map((step, i) => (
                  <div key={step.title} className="border-l-4 border-white pl-6">
                    <h3 className="mb-3 text-2xl font-bold tracking-wide">Step {i + 1}</h3>
                    <p className="text-lg leading-relaxed text-white/90">{step.description}</p>
                  </div>
                ))}
                {steps[2] && (
                  <div className="border-l-4 border-white pt-6 pl-6">
                    <h3 className="mb-4 text-2xl font-bold tracking-wide">{steps[2].title}</h3>
                    <p className="text-lg leading-relaxed text-white/90">{steps[2].description}</p>
                  </div>
                )}
              </div>
              <div className="flex h-full items-center justify-center">
                <div className="h-96 w-full overflow-hidden rounded-lg shadow-2xl">
                  <img src={c.galleryImages[0] || c.aboutImage} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
            {steps[3] && (
              <>
                <div className="mb-24 h-px bg-white/20" />
                <div className="grid items-center gap-16 clg:grid-cols-2">
                  <div className="flex items-center justify-center clg:order-2">
                    <div className="h-96 w-full overflow-hidden rounded-lg shadow-2xl">
                      <img src={c.galleryImages[1] || c.aboutImage} alt="" className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="clg:order-1">
                    <h2 className="mb-8 text-3xl font-bold leading-tight tracking-tight csm:text-5xl cmd:text-6xl">{steps[3].title}</h2>
                    <p className="text-lg leading-relaxed text-white/90">{steps[3].description}</p>
                  </div>
                </div>
              </>
            )}
            <div className="mt-20 flex justify-center">
              <Link
                to={servicesHref}
                className="border-2 border-white px-10 py-4 text-lg font-bold tracking-wide text-white uppercase transition hover:bg-white hover:text-[#6b1f34]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      )}

      {c.sectionVisibility.testimonials && reviews.length > 0 && (
        <section className="relative min-h-[70vh] bg-black px-4 py-12 csm:px-6 clg:px-8">
          <div className="mx-auto grid max-w-7xl gap-16 clg:grid-cols-2">
            <div>
              <p className="mb-2 text-3xl font-bold text-white italic csm:text-5xl cmd:text-6xl">{c.teamSectionTitle || 'Meet Your Team'}</p>
              <div className="mb-12 h-1 w-16 bg-red-500" />
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.author} className="rounded-lg bg-white p-4 shadow-lg">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A04DB7] text-xl font-semibold text-white">
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">{review.author}</h3>
                        <p className="text-xs text-gray-600">{review.role}</p>
                      </div>
                    </div>
                    <div className="mb-2 text-sm text-yellow-400">★★★★★</div>
                    <p className="text-sm text-gray-700">{review.quote}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              {c.aboutImage ? <img src={c.aboutImage} alt="" className="mb-6 w-full rounded-lg object-cover shadow-2xl" /> : null}
              <p className="mt-8 text-lg text-white italic">{c.missionStatement}</p>
            </div>
          </div>
        </section>
      )}

      {c.pageVisibility.services && services.length > 0 && (
        <section className="px-4 py-20 csm:px-6 clg:px-8" style={{ backgroundColor: '#f9f9f9' }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900 csm:text-5xl">{c.servicesSectionTitle || 'Our Services'}</h2>
              <p className="text-xl text-gray-600">{c.servicesSectionSubtitle}</p>
            </div>
            <div className="grid gap-8 cmd:grid-cols-3">
              {services.map((service) => (
                <Link
                  key={service.title}
                  to={servicesHref}
                  className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mb-4 h-12 w-12 rounded-lg" style={{ backgroundColor: MAROON }} />
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">{service.title}</h3>
                  <p className="leading-relaxed text-gray-600">{service.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 clg:py-24">
          <div className="grid items-center gap-12 clg:grid-cols-2 clg:gap-16">
            <div className="flex flex-col justify-center space-y-8">
              <p className="text-4xl font-bold leading-tight clg:text-5xl" style={{ color: MAROON }}>
                {c.aboutTitle}
              </p>
              <p className="text-lg leading-relaxed" style={{ color: MAROON }}>
                {c.about}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="inline-block rounded-lg px-8 py-3 font-semibold text-white shadow-lg"
                  style={{ backgroundColor: MAROON }}
                >
                  <div>Book Now</div>
                  <div className="mt-1 text-sm font-medium">Receive 20% Off</div>
                </button>
              </div>
            </div>
            {c.aboutImage ? (
              <div className="flex justify-center clg:justify-end">
                <div className="w-full overflow-hidden rounded-xl shadow-lg">
                  <img src={c.aboutImage} alt="" className="h-[550px] w-full object-cover" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {specialize.some((s) => s.title) && (
        <section className="relative w-full bg-gradient-to-b from-[var(--clone-accent)] via-[var(--clone-ink)] to-[var(--clone-ink)] px-4 py-20 csm:px-6 clg:px-8">
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-white italic cmd:text-5xl clg:text-6xl">The Tax Fighters Specializes In:</h2>
              <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-[var(--clone-ink)] to-[var(--clone-accent)]" />
            </div>
            <div className="grid gap-8 cmd:grid-cols-3 clg:gap-12">
              {specialize.map((item) => (
                <Link key={item.title} to={servicesHref} className="group text-center">
                  {item.image ? (
                    <div className="overflow-hidden rounded-2xl border-4 border-white/20 shadow-lg">
                      <img src={item.image} alt="" className="h-64 w-full object-cover transition group-hover:scale-105" />
                    </div>
                  ) : null}
                  <h3 className="mt-6 text-center text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/80">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {c.pageVisibility.portfolio && locations.length > 0 && (
        <section className="bg-white px-4 py-20">
          <h2 className="mb-12 pt-6 text-center text-4xl font-bold text-black">{c.showcaseSectionTitle}</h2>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 csm:grid-cols-3 cmd:grid-cols-5">
            {locations.slice(0, 5).map((loc) => (
              <Link key={loc.title} to={locationsHref} className="group">
                {loc.image ? (
                  <img src={loc.image} alt="" className="mb-3 h-40 w-full rounded-xl object-cover shadow-lg transition group-hover:scale-105" />
                ) : null}
                <p className="text-center text-sm font-semibold text-black">{loc.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ClonePricingSection d={d} onBook={() => { setFormOpen(true); setSubmitted(false) }} />
      <CloneTeamSection templateId="helix" d={d} />

      {c.sectionVisibility.faq && faqs.length > 0 && (
        <section className="bg-[#f9f9f9] px-4 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">{c.faqSectionTitle}</h2>
              <p className="text-xl text-gray-600">Find answers to common questions about our services</p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <summary className="cursor-pointer px-6 py-4 text-left text-lg font-semibold text-gray-900">{faq.question}</summary>
                  <p className="border-t border-gray-200 bg-white px-6 py-4 leading-relaxed text-gray-700">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {d.show.cta && (
      <section className="px-4 py-20 csm:px-6 clg:px-8" style={{ backgroundColor: MAROON }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-white csm:text-5xl">{c.ctaBannerTitle}</h2>
          <p className="mb-8 text-xl leading-relaxed text-gray-100">{c.ctaBannerText}</p>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-block rounded-lg bg-white px-10 py-4 text-lg font-semibold shadow-lg transition hover:scale-105"
            style={{ color: MAROON }}
          >
            Contact Us
          </button>
        </div>
      </section>
      )}

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-3xl font-bold text-black">{c.contactSectionTitle || 'Contact Us'}</h2>
          <div className="grid gap-12 clg:grid-cols-2">
            <div className="grid gap-6 text-sm csm:grid-cols-2">
              {c.phone ? (
                <div>
                  <p className="mb-1 text-xs font-bold tracking-wider uppercase" style={{ color: MAROON }}>
                    Call / Text
                  </p>
                  <a href={`tel:${c.phone}`} className="text-lg font-semibold">
                    {c.phone}
                  </a>
                </div>
              ) : null}
              {c.email ? (
                <div>
                  <p className="mb-1 text-xs font-bold tracking-wider uppercase" style={{ color: MAROON }}>
                    Email
                  </p>
                  <p>{c.email}</p>
                </div>
              ) : null}
              {c.address ? (
                <div>
                  <p className="mb-1 text-xs font-bold tracking-wider uppercase" style={{ color: MAROON }}>
                    Office
                  </p>
                  <p>{c.address}</p>
                </div>
              ) : null}
              {c.hours ? (
                <div>
                  <p className="mb-1 text-xs font-bold tracking-wider uppercase" style={{ color: MAROON }}>
                    Hours
                  </p>
                  <p>{c.hours}</p>
                </div>
              ) : null}
            </div>
            <CloneMap d={d} className="h-72 overflow-hidden rounded-xl shadow-lg" title="Office map" />
          </div>
        </div>
      </section>

      <footer className="bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-center text-sm font-semibold tracking-widest uppercase cmd:text-left">Social Media</p>
          <div className="mb-8 flex justify-center gap-6 cmd:justify-start">
            <a href="https://web.facebook.com/people/The-Tax-Fighters/61554192368133/" className="p-2" target="_blank" rel="noreferrer">
              Facebook
            </a>
            {c.instagram ? (
              <a href={c.instagram} className="p-2" target="_blank" rel="noreferrer">
                Instagram
              </a>
            ) : null}
            {mapsHref ? (
              <a href={mapsHref} className="p-2" target="_blank" rel="noreferrer">
                Google
              </a>
            ) : null}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-600 pt-8 cmd:flex-row">
            {c.logo ? <img src={c.logo} alt="" className="h-16 w-auto" /> : <span className="font-bold">{c.businessName}</span>}
            <p className="font-semibold">© {new Date().getFullYear()} {c.businessName}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 csm:items-center">
          <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFormOpen(false)} aria-label="Close" />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg shadow-2xl" style={{ backgroundColor: SIGNAL }}>
            {submitted ? (
              <div className="bg-white p-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-800">Success!</h2>
                <p className="mb-6 text-gray-600">Your information has been submitted successfully. Our team will get back to you shortly!</p>
                <button type="button" onClick={() => setFormOpen(false)} className="rounded-md bg-green-500 px-8 py-3 font-bold text-white hover:bg-green-600">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="px-6 pt-6 pb-4">
                  <div className="mb-4 flex justify-end">
                    <button type="button" onClick={() => setFormOpen(false)} className="rounded p-1 text-white hover:bg-white/10">
                      ✕
                    </button>
                  </div>
                  <h2 className="mb-2 text-center text-xl font-bold text-white">Leave Your Info For a Quick Response From Our Team</h2>
                  <p className="text-center text-sm font-semibold text-white">Leave Your Info For a Quick Response From Our Team</p>
                </div>
                <div className="bg-white px-6 py-6">
                  <div className="mb-6 text-center">
                    <p className="mb-1 text-lg font-bold text-gray-700">Pre-qualify Today!</p>
                    <p className="text-sm text-gray-600">---- Fill out form below ----</p>
                  </div>
                  <form onSubmit={onPrequalify} className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Name
                      <input required name="first_name" placeholder="First Name" className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#E63946] focus:outline-none" />
                    </label>
                    <label className="block text-sm font-semibold text-gray-700">
                      Last Name
                      <input required name="last_name" placeholder="Last Name" className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#E63946] focus:outline-none" />
                    </label>
                    <label className="block text-sm font-semibold text-gray-700">
                      Phone <span className="text-[#E63946]">*</span>
                      <input required type="tel" name="phone" placeholder="Phone" className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#E63946] focus:outline-none" />
                    </label>
                    <label className="block text-sm font-semibold text-gray-700">
                      Email <span className="text-[#E63946]">*</span>
                      <input required type="email" name="email" placeholder="Email" className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#E63946] focus:outline-none" />
                    </label>
                    <label className="my-4 flex items-start gap-3 text-xs leading-tight text-gray-700">
                      <input type="checkbox" name="smsConsent" className="mt-1 accent-[#E63946]" />
                      I Consent to Receive SMS Notifications, Alerts & Occasional Marketing Communication from company. Message frequency varies. Message & data rates may apply. Text HELP to {c.phone || '(678) 679-1040'} for assistance. You can reply STOP to unsubscribe at any time.
                    </label>
                    <button type="submit" className="mt-6 w-full rounded-md bg-green-500 py-3 font-bold text-white hover:bg-green-600">
                      Submit
                    </button>
                    <div className="mt-4 space-x-2 text-center text-xs text-gray-600">
                      <a href="#" className="underline">
                        Privacy Policy
                      </a>
                      <span>|</span>
                      <a href="#" className="underline">
                        Terms of Service
                      </a>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
