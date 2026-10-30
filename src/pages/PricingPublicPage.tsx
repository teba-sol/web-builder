import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Building2, Check, Cloud, Download, Palette, UserRound } from 'lucide-react'
import { fetchPricing } from '../api/billing'
import type { PriceTier } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { AppHeader } from '../components/AppHeader'
import { PublicHeader } from '../components/landing/PublicHeader'
import { MarketingFooter } from '../components/MarketingFooter'

export function PricingPublicPage() {
  const { user, loading: authLoading } = useAuth()
  const [pricing, setPricing] = useState<PriceTier[] | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const previous = document.title
    document.title = 'Pricing — Buildoura'
    return () => { document.title = previous }
  }, [])

  useEffect(() => {
    let active = true
    setError(false)
    setPricing(null)
    fetchPricing()
      .then((settings) => { if (active) setPricing(settings.prices) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [attempt])

  const personal = pricing?.find((tier) => tier.userType === 'USER')
  const personalPrice = personal?.contactUs ? 'Contact us' : personal?.displayPrice
  const personalFeatures = ['Cloud save for this website', 'Full-stack website export', 'Your content and branding']
  const agencyFeatures = ['Client websites in one workspace', 'Agency and salesperson accounts', 'Export when the website is unlocked']

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {user || authLoading ? <AppHeader /> : <PublicHeader />}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {user && <Link to="/account" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-navy"><ArrowLeft size={15} /> Back to profile</Link>}
        <div className="mb-10 max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Website pricing</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-navy sm:text-5xl">A clear next step<br className="hidden sm:block" /> for your website.</h1>
          <p className="mt-5 text-base leading-7 text-slate-500">Choose a template and make it yours. Unlock cloud save and export for each website when you’re ready.</p>
        </div>

        {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"><p>We couldn’t load the current personal website price.</p><button type="button" onClick={() => setAttempt((value) => value + 1)} className="rounded-lg border border-amber-300 px-3 py-2 font-semibold hover:bg-amber-100">Try again</button></div>}
        <div className="grid items-stretch gap-6 md:grid-cols-2">
          <section aria-labelledby="personal-price-heading" className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-navy"><UserRound size={21} strokeWidth={1.5} /></span>
            <h2 id="personal-price-heading" className="text-xl font-semibold text-navy">Personal websites</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">For your business, portfolio, or next idea.</p>
            <div className="my-7" aria-live="polite">
              {!pricing && !error ? <p role="status" className="text-sm text-slate-500">Loading current price…</p> : <p className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{personalPrice || 'Price unavailable'}</p>}
              <p className="mt-2 text-sm text-slate-500">One-time payment per website.</p>
            </div>
            <ul className="mb-8 space-y-3 text-sm text-slate-600">{personalFeatures.map((item) => <li key={item} className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-navy" />{item}</li>)}</ul>
            <Link to={user ? '/' : '/signup'} className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-dark">{user ? 'Go to workspace' : 'Create a personal account'}<ArrowRight size={16} /></Link>
          </section>
          <section aria-labelledby="agency-price-heading" className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-navy"><Building2 size={21} strokeWidth={1.5} /></span>
            <h2 id="agency-price-heading" className="text-xl font-semibold text-navy">Agencies & salespeople</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">For teams creating websites for their clients.</p>
            <div className="my-7"><p className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">Contact us</p><p className="mt-2 text-sm text-slate-500">Agency pricing is arranged directly.</p></div>
            <ul className="mb-8 space-y-3 text-sm text-slate-600">{agencyFeatures.map((item) => <li key={item} className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-navy" />{item}</li>)}</ul>
            {user ? <p className="mt-auto rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">Work with your agency admin to arrange pricing and unlock client websites.</p> : <Link to="/signup?type=agency" className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-navy hover:bg-slate-50">Register an agency <ArrowRight size={16} /></Link>}
          </section>
        </div>

        <section className="py-12 sm:py-16" aria-labelledby="pricing-included-heading">
          <h2 id="pricing-included-heading" className="mb-7 text-2xl font-semibold tracking-tight text-navy">What unlocking a website includes</h2>
          <div className="grid gap-7 sm:grid-cols-3">{[
            { icon: Cloud, title: 'Save and return', text: 'Keep your website draft in the cloud and continue editing later.' },
            { icon: Palette, title: 'Make it yours', text: 'Customize your copy, images, fonts, colors, and available sections.' },
            { icon: Download, title: 'Export your website', text: 'Download a full-stack website for your own hosting.' },
          ].map(({ icon: Icon, title, text }) => <div key={title}><Icon size={22} strokeWidth={1.5} className="mb-4 text-navy" /><h3 className="font-semibold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>)}</div>
        </section>
        <div className="flex justify-end border-t border-slate-200 pt-6"><Link to={user ? '/' : '/templates'} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy hover:underline">{user ? 'Back to workspace' : 'Explore templates'}<ArrowRight size={16} /></Link></div>
      </main>
      <MarketingFooter />
    </div>
  )
}
