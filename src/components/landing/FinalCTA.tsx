import { Link } from 'react-router-dom'
import { BrowserFrame } from './BrowserFrame'
import { LandingFooter } from './LandingFooter'
import { showcaseSites } from './sites'

export function FinalCTA() {
  const sites = showcaseSites().slice(0, 4)

  return (
    <section data-landing-dark className="relative overflow-hidden bg-navy px-4 pb-16 pt-28 text-white md:px-8 md:pt-36">
      <div className="pointer-events-none absolute inset-0 opacity-25">
        {sites[0] && (
          <div className="absolute -left-[8%] top-[12%] w-[36%] -rotate-12">
            <BrowserFrame src={sites[0].src} alt="" compact />
          </div>
        )}
        {sites[1] && (
          <div className="absolute -right-[10%] top-[8%] w-[32%] rotate-8">
            <BrowserFrame src={sites[1].src} alt="" compact />
          </div>
        )}
        {sites[2] && (
          <div className="absolute bottom-[8%] left-[30%] w-[28%] rotate-2">
            <BrowserFrame src={sites[2].src} alt="" compact />
          </div>
        )}
        <div className="absolute inset-0 bg-navy/55" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <h2 className="font-display text-[clamp(3rem,12vw,9rem)]">
          Find your
          <br />
          starting
          <br />
          point.
        </h2>
        <div className="mt-10 flex flex-wrap items-center gap-8 text-[12px] font-semibold uppercase tracking-[0.24em]">
          <Link to="/#templates" className="text-white">
            Explore Templates
          </Link>
          <Link to="/signup" className="text-accent">
            Start Building
          </Link>
        </div>
      </div>

      <LandingFooter />
    </section>
  )
}
