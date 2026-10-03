import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { BrowserFrame } from './BrowserFrame'
import { showcaseSites } from './sites'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function HowItWorks() {
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow()
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const sites = showcaseSites().slice(0, 5)
  const main = sites[0]

  useGSAP(
    () => {
      if (reduced || narrow || !root.current || !stage.current) return
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
          pin: stage.current,
          anticipatePin: 1,
        },
      })
      tl.to(q('[data-step="choose"]'), { opacity: 1, duration: 0.3 }, 0)
        .fromTo(q('[data-orbit]'), { x: (i) => (i - 2) * 220, opacity: 0.4, scale: 0.7 }, { x: (i) => (i - 2) * 40, opacity: 1, scale: 0.85, duration: 1 }, 0)
        .to(q('[data-step="choose"]'), { opacity: 0.18, duration: 0.3 }, 0.9)
        .to(q('[data-step="customize"]'), { opacity: 1, duration: 0.3 }, 0.9)
        .to(q('[data-orbit]'), { opacity: 0, duration: 0.4 }, 1)
        .to(q('[data-main]'), { filter: 'saturate(1.4) contrast(1.08)', scale: 1.02, duration: 0.8 }, 1)
        .to(q('[data-step="customize"]'), { opacity: 0.18, duration: 0.3 }, 1.7)
        .to(q('[data-step="publish"]'), { opacity: 1, duration: 0.3 }, 1.7)
        .to(q('[data-main]'), { scale: 1.18, y: 30, duration: 0.9 }, 1.7)
        .to(q('[data-chrome]'), { opacity: 0, duration: 0.5 }, 1.85)
    },
    { dependencies: [reduced, narrow], scope: root },
  )

  return (
    <section ref={root} className={reduced || narrow ? 'relative px-4 py-24' : 'relative h-[280vh]'}>
      <div ref={stage} className={reduced || narrow ? '' : 'flex h-[100svh] items-center overflow-hidden px-4 md:px-8'}>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className={reduced || narrow ? 'space-y-10' : 'relative h-[260px]'}>
            <Step id="choose" n="01" title="Choose" body="Pick a professionally designed website as your starting point." stacked={!reduced && !narrow} on />
            <Step id="customize" n="02" title="Customize" body="Change copy, color, type, images, and sections on the canvas." stacked={!reduced && !narrow} />
            <Step id="publish" n="03" title="Publish" body="Export a real website — not a mockup, not a prototype." stacked={!reduced && !narrow} />
          </div>
          <div className="relative min-h-[320px]">
            {sites.map((site, i) =>
              i === 0 ? null : (
                <div key={site.id} data-orbit className="absolute left-1/2 top-8 hidden w-[38%] -translate-x-1/2 md:block">
                  <BrowserFrame src={site.src} alt="" compact />
                </div>
              ),
            )}
            {main && (
              <div data-main className="relative z-10 mx-auto w-[86%]">
                <div data-chrome>
                  <BrowserFrame src={main.src} alt={main.label} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Step({
  id,
  n,
  title,
  body,
  on,
  stacked,
}: {
  id: string
  n: string
  title: string
  body: string
  on?: boolean
  stacked?: boolean
}) {
  return (
    <div data-step={id} className={`${stacked ? 'absolute inset-0' : ''} ${stacked && !on ? 'opacity-0' : ''}`}>
      <p className="text-[10px] uppercase tracking-[0.28em] text-accent">{n}</p>
      <h3 className="font-display mt-2 text-[clamp(2.4rem,6vw,5rem)] text-navy">{title}</h3>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-navy/55">{body}</p>
    </div>
  )
}
