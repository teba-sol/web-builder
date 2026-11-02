import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Building2, Check, Cloud, Download, Palette, UserRound } from 'lucide-react'
import { fetchPricing } from '../api/billing'
import type { PriceTier } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { AuraArtwork, AuraExperience } from '../components/landing/AuraExperience'

export function PricingPublicPage() {
  const { user } = useAuth()
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
    <AuraExperience smooth workspaceHeader>
      {({ paused }) => <main id="aura-inner-main" className="aura-pricing-main">
        <section className="aura-pricing-hero">
          {user && <Link to="/account" className="aura-pricing-back"><ArrowLeft size={14} /> Back to profile</Link>}
          <div className="aura-pricing-hero-copy" data-aura-intro>
            <p className="aura-kicker">AN INVESTMENT IN WHAT’S NEXT</p>
            <h1>Big ideas.<br /><em>Clear next steps.</em></h1>
            <p>Your vision deserves a place of its own.<br />Find the right path from starting point to your next chapter.</p>
          </div>
          <div className="aura-pricing-art"><AuraArtwork paused={paused} /></div>
          <div className="aura-pricing-hero-caption"><span>YOUR PRESENCE STARTS HERE.</span><span>PERSONAL / AGENCY</span></div>
        </section>

        <section className="aura-pricing-plans" aria-label="Website pricing options">
          <div className="aura-section-marker"><span>01 / CHOOSE YOUR DIRECTION</span><span>MADE FOR INDIVIDUALS. BUILT FOR TEAMS.</span></div>
          {error && <div role="alert" className="aura-price-error"><p>We couldn’t load the current personal website price.</p><button type="button" onClick={() => setAttempt((value) => value + 1)}>Try again <ArrowUpRight size={14} /></button></div>}
          <div className="aura-price-grid">
            <section aria-labelledby="personal-price-heading" className="aura-price-card aura-price-personal">
              <div className="aura-price-card-top"><span>01 / PERSONAL WEBSITES</span><UserRound size={22} strokeWidth={1.2} /></div>
              <h2 id="personal-price-heading">Go <em>personal.</em></h2>
              <p className="aura-price-description">Your business. Your portfolio. Your next big thing.</p>
              <div className="aura-price-amount" aria-live="polite">
                {!pricing && !error ? <p role="status" className="aura-price-loading">Loading current price…</p> : <p>{personalPrice || 'Price unavailable'}</p>}
                <span>{personal?.contactUs ? 'Let’s find the right fit.' : 'One-time payment per website.'}</span>
              </div>
              <ul>{personalFeatures.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
              <Link to={user ? '/' : '/signup'} className="aura-button aura-button-dark">{user ? 'Go to workspace' : 'Create a personal account'}<ArrowUpRight size={18} /></Link>
            </section>
            <section aria-labelledby="agency-price-heading" className="aura-price-card aura-price-agency">
              <div className="aura-price-card-top"><span>02 / AGENCIES & SALESPEOPLE</span><Building2 size={22} strokeWidth={1.2} /></div>
              <h2 id="agency-price-heading">Think <em>together.</em></h2>
              <p className="aura-price-description">For the teams building their clients’ next chapters.</p>
              <div className="aura-price-amount"><p>Contact us</p><span>Agency pricing, arranged directly.</span></div>
              <ul>{agencyFeatures.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
              {user ? <p className="aura-price-agency-note">Work with your agency admin to arrange pricing and unlock client websites.</p> : <Link to="/signup?type=agency" className="aura-button aura-button-orange">Register an agency <ArrowUpRight size={18} /></Link>}
            </section>
          </div>
        </section>

        <section className="aura-price-included" aria-labelledby="pricing-included-heading">
          <div className="aura-section-marker"><span>02 / BEYOND THE STARTING POINT</span><span>THE TOOLS TO MAKE IT YOURS.</span></div>
          <h2 id="pricing-included-heading">A little less friction.<br /><em>A lot more possibility.</em></h2>
          <div className="aura-price-features">{[
            { icon: Cloud, title: 'Save your momentum.', text: 'Keep your website draft in the cloud and continue editing later.' },
            { icon: Palette, title: 'Find your signature.', text: 'Customize your copy, images, fonts, colors, and available sections.' },
            { icon: Download, title: 'Go your own way.', text: 'Download a full-stack website for your own hosting.' },
          ].map(({ icon: Icon, title, text }, index) => <article key={title}><div><span>0{index + 1}</span><Icon size={24} strokeWidth={1.2} /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>
        <section className="aura-price-outro"><div><p className="aura-kicker">NO NEED TO START FROM NOTHING.</p><h2>Find a little <em>inspiration.</em></h2></div><Link to={user ? '/' : '/templates'} className="aura-button aura-button-dark">{user ? 'Back to workspace' : 'Explore templates'}<ArrowUpRight size={19} /></Link></section>
      </main>}
    </AuraExperience>
  )
}
