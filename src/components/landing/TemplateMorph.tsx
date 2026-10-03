import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { BrowserFrame } from './BrowserFrame'
import { showcaseSites } from './sites'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STAGES = [
  { id: 'origin', label: 'Origin' },
  { id: 'color', label: 'Color' },
  { id: 'type', label: 'Type' },
  { id: 'content', label: 'Content' },
  { id: 'sections', label: 'Sections' },
  { id: 'yours', label: 'Yours' },
]

export function TemplateMorph() {
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow()
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const origin = showcaseSites().find((s) => s.id === 'restaurant') ?? showcaseSites()[0]
  const next = showcaseSites().find((s) => s.id === 'boutique') ?? showcaseSites()[1]

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
      tl.to(q('[data-wash]'), { opacity: 0.55, duration: 1 }, 0.15)
        .to(q('[data-stage-label="color"]'), { opacity: 1, duration: 0.3 }, 0.15)
        .to(q('[data-type]'), { opacity: 1, y: 0, duration: 0.8 }, 0.55)
        .to(q('[data-stage-label="type"]'), { opacity: 1, duration: 0.3 }, 0.55)
        .to(q('[data-content]'), { opacity: 1, duration: 0.8 }, 1.05)
        .to(q('[data-stage-label="content"]'), { opacity: 1, duration: 0.3 }, 1.05)
        .to(q('[data-sections]'), { opacity: 1, y: 0, duration: 0.7 }, 1.5)
        .to(q('[data-stage-label="sections"]'), { opacity: 1, duration: 0.3 }, 1.5)
        .to(q('[data-final]'), { opacity: 1, duration: 0.9 }, 2)
        .to(q('[data-stage-label="yours"]'), { opacity: 1, duration: 0.3 }, 2)
        .to(q('[data-origin]'), { opacity: 0, duration: 0.6 }, 2)
    },
    { dependencies: [reduced, narrow], scope: root },
  )

  return (
    <section id="features" ref={root} className={reduced || narrow ? 'relative px-4 py-24' : 'relative h-[320vh]'}>
      <div ref={stage} className={reduced || narrow ? '' : 'flex h-[100svh] items-center px-4 md:px-8'}>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Customize</p>
            <h2 className="font-display mt-3 text-[clamp(2.2rem,5vw,4.4rem)] text-navy">
              Same template.
              <br />
              New identity.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy/55">
              You start from a professional template. Color, type, content, and sections become yours — the structure stays designed.
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {STAGES.map((item) => (
                <li
                  key={item.id}
                  data-stage-label={item.id}
                  className={`text-[10px] uppercase tracking-[0.28em] ${item.id === 'origin' ? 'text-navy' : 'text-navy/30'} ${reduced || narrow ? 'text-navy' : ''}`}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            {origin && (
              <div data-origin className="relative">
                <BrowserFrame src={origin.src} alt={origin.label} />
                <div data-wash className="pointer-events-none absolute inset-0 bg-[#04245c] mix-blend-multiply opacity-0" />
                <p
                  data-type
                  className="pointer-events-none absolute left-6 top-16 font-display text-5xl text-white opacity-0 md:text-7xl"
                  style={{ transform: 'translateY(24px)' }}
                >
                  Maison
                </p>
                {next && (
                  <div data-content className="pointer-events-none absolute inset-8 overflow-hidden opacity-0">
                    <img src={next.src} alt="" className="h-full w-full object-cover object-top" />
                  </div>
                )}
                <div
                  data-sections
                  className="absolute bottom-6 left-6 right-6 flex gap-2 opacity-0"
                  style={{ transform: 'translateY(16px)' }}
                >
                  {['Hero', 'Menu', 'Story', 'Reserve'].map((name) => (
                    <span key={name} className="bg-white px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-navy">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {next && (
              <div data-final className={reduced || narrow ? 'relative mt-6' : 'absolute inset-0 opacity-0'}>
                <BrowserFrame src={next.src} alt={next.label} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
