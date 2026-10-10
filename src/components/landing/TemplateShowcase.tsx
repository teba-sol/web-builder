import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { BrowserFrame } from './BrowserFrame'
import { SHOWCASE_CATEGORIES, showcaseSites, type ShowcaseSite } from './sites'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function TemplateShowcase() {
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow()
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const sites = SHOWCASE_CATEGORIES.map((cat) => showcaseSites().find((s) => s.category === cat)).filter(
    (site): site is ShowcaseSite => Boolean(site),
  )

  useGSAP(
    () => {
      if (reduced || narrow || !root.current || !stage.current || !track.current) return
      gsap.to(track.current, {
        x: () => -(track.current!.scrollWidth - window.innerWidth * 0.92),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35,
          pin: stage.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    },
    { dependencies: [reduced, narrow], scope: root },
  )

  return (
    <section id="templates" ref={root} className={reduced || narrow ? 'relative py-20' : 'relative h-[360vh]'}>
      <div ref={stage} className={reduced || narrow ? '' : 'flex h-[100svh] flex-col justify-center overflow-hidden'}>
        <div className="mb-8 flex items-end justify-between px-4 md:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Templates</p>
            <h2 className="font-display mt-3 text-[clamp(2.2rem,6vw,5.5rem)] text-navy">
              Start
              <br />
              from designed.
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm text-navy/55 md:block">
            Scroll to move through the library. Each frame is a finished website, ready to reshape.
          </p>
        </div>
        <div
          ref={track}
          className={
            reduced || narrow
              ? 'flex gap-4 overflow-x-auto px-4 pb-4'
              : 'flex w-max items-center gap-8 px-8 will-change-transform'
          }
        >
          {sites.map((site) => (
            <Link key={site.id} to={`/demo/${site.id}`} className="w-[78vw] shrink-0 md:w-[68vw]">
              <BrowserFrame src={site.src} alt={site.label} />
              <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-navy/55">
                {site.category}
                <span className="ml-3 text-navy">{site.label}</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
