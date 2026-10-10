import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPricing } from '../api/billing'
import type { PriceTier } from '../api/types'
import { BrowserFrame } from '../components/landing/BrowserFrame'
import { FinalCTA } from '../components/landing/FinalCTA'
import { Navbar } from '../components/landing/Navbar'
import { SmoothScroll } from '../components/landing/SmoothScroll'
import { showcaseSites } from '../components/landing/sites'

function personalLabel(tier: PriceTier | undefined) {
  if (!tier) return '9,000 ETB'
  if (tier.contactUs) return 'Contact us'
  return tier.displayPrice || '9,000 ETB'
}

function splitPrice(label: string) {
  const match = label.trim().match(/^(.*?)(?:\s+)(ETB|USD|EUR|GBP)$/i)
  if (!match) return { amount: label, currency: null as string | null }
  return { amount: match[1], currency: match[2].toUpperCase() }
}

export function PricingPublicPage() {
  const [pricing, setPricing] = useState<PriceTier[] | null>(null)

  useEffect(() => {
    const previous = document.title
    document.title = 'Pricing — BuildAura'
    fetchPricing()
      .then((settings) => setPricing(settings.prices))
      .catch(() => setPricing(null))
    return () => {
      document.title = previous
    }
  }, [])

  const personal = pricing?.find((tier) => tier.userType === 'USER')
  const price = splitPrice(personalLabel(personal))
  const sites = showcaseSites()
  const peek = sites.find((s) => s.id === 'axiom') ?? sites[0]

  return (
    <SmoothScroll>
      <div className="landing min-h-screen bg-[#f6f7fb] text-navy">
        <Navbar />
        <main>
          <section className="relative overflow-hidden px-4 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
            <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Pricing</p>
            <h1 className="font-display mt-4 text-[clamp(2.8rem,9.4vw,7rem)] text-navy">
              One site.
              <br />
              One
              <br />
              payment.
            </h1>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-navy/60 md:text-base">
              Personal websites have a published price. Agency and salesperson work is priced as Contact us — there is no public rate.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.22em]">
              <Link to="/signup" className="text-accent">
                Start Building
              </Link>
              <Link to="/#templates" className="text-navy">
                Explore Templates
              </Link>
            </div>
          </section>

          <section className="relative grid items-end gap-10 border-t border-navy/10 px-4 py-20 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-accent">01 — Personal</p>
              <h2 className="font-display mt-3 text-[clamp(2.4rem,6vw,5rem)]">Yours.</h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy/55">
                One payment unlocks export and cloud save for that website. Pick a template, make it yours, then publish.
              </p>
            </div>
            <div className="relative">
              <p className="font-display text-[clamp(3.4rem,10vw,8rem)] leading-none text-navy">
                {price.amount}
                {price.currency ? (
                  <span className="ml-3 align-top text-[clamp(0.9rem,2vw,1.4rem)] tracking-[0.18em] text-accent">
                    {price.currency}
                  </span>
                ) : null}
              </p>
              <Link
                to="/signup"
                className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-accent"
              >
                Create a personal account
              </Link>
            </div>
          </section>

          <section data-landing-dark className="relative overflow-hidden bg-navy px-4 py-24 text-white md:px-8 md:py-32">
            {peek && (
              <div className="pointer-events-none absolute -right-[12%] top-[18%] w-[42%] rotate-8 opacity-25">
                <BrowserFrame src={peek.src} alt="" compact />
              </div>
            )}
            <div className="relative mx-auto max-w-6xl">
              <p className="text-[10px] uppercase tracking-[0.28em] text-accent">02 — Agency / salesperson</p>
              <h2 className="font-display mt-4 max-w-[18ch] text-[clamp(2.8rem,10vw,7.5rem)]">
                Contact
                <br />
                us.
              </h2>
              <p className="mt-8 max-w-md text-sm leading-relaxed text-white/65">
                No published online price. Talk to us, then add salespeople from the agency portal. Export stays locked until the agency unlocks the site.
              </p>
              <Link
                to="/signup?type=agency"
                className="mt-10 inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-accent"
              >
                Register an agency
              </Link>
            </div>
          </section>

          <section className="px-4 py-24 md:px-8 md:py-32">
            <p className="text-[10px] uppercase tracking-[0.28em] text-accent">03 — Included</p>
            <h2 className="font-display mt-3 text-[clamp(2.4rem,7vw,6rem)]">
              What you
              <br />
              actually get.
            </h2>
            <ul className="mt-16 max-w-4xl divide-y divide-navy/10 border-y border-navy/10">
              {[
                { n: '01', title: 'Export', body: 'A real website — not a mockup, not a prototype.' },
                { n: '02', title: 'Cloud save', body: 'Keep the draft after payment, then come back and finish it.' },
                { n: '03', title: 'Templates', body: 'Every professionally designed starting point in the studio.' },
                { n: '04', title: 'Control', body: 'Copy, color, type, images, sections, and branding on the canvas.' },
              ].map((item) => (
                <li key={item.n} className="grid gap-3 py-8 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:items-start">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-accent">{item.n}</p>
                  <div>
                    <h3 className="font-display text-[clamp(1.6rem,3vw,2.6rem)]">{item.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy/55">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <FinalCTA />
        </main>
      </div>
    </SmoothScroll>
  )
}
