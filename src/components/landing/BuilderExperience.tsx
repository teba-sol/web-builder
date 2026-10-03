import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { BrowserFrame } from './BrowserFrame'
import { showcaseSites } from './sites'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function BuilderExperience() {
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow()
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const site = showcaseSites().find((s) => s.id === 'restaurant') ?? showcaseSites()[0]

  useGSAP(
    () => {
      if (reduced || narrow || !root.current || !stage.current) return
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          pin: stage.current,
          anticipatePin: 1,
        },
      })
      tl.fromTo(q('[data-piece="typo"]'), { x: -160, y: -80, rotate: -10, opacity: 0.3 }, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 1 }, 0)
        .fromTo(q('[data-piece="color"]'), { x: 180, y: -60, rotate: 8, opacity: 0.3 }, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 1 }, 0)
        .fromTo(q('[data-piece="pages"]'), { x: -140, y: 90, rotate: 6, opacity: 0.3 }, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 1 }, 0)
        .fromTo(q('[data-piece="images"]'), { x: 150, y: 100, rotate: -6, opacity: 0.3 }, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 1 }, 0)
        .fromTo(q('[data-piece="canvas"]'), { scale: 0.86, y: 40 }, { scale: 1, y: 0, duration: 1 }, 0)
        .to(q('[data-live="heading"]'), { opacity: 1, duration: 0.4 }, 1)
        .to(q('[data-live="swatch"]'), { scale: 1.15, duration: 0.4 }, 1.15)
        .to(q('[data-live="row"]'), { y: -12, duration: 0.4 }, 1.3)
    },
    { dependencies: [reduced, narrow], scope: root },
  )

  return (
    <section ref={root} className={reduced || narrow ? 'relative px-4 py-24' : 'relative h-[260vh]'}>
      <div ref={stage} className={reduced || narrow ? '' : 'flex h-[100svh] flex-col justify-center overflow-hidden px-4 md:px-8'}>
        <p className="text-center text-[10px] uppercase tracking-[0.32em] text-accent">The builder</p>
        <h2 className="font-display mx-auto mt-3 max-w-4xl text-center text-[clamp(2rem,5vw,4.4rem)] text-navy">
          Edit the website,
          <br />
          not a mockup.
        </h2>
        <div className="relative mx-auto mt-12 grid w-full max-w-5xl items-center gap-4 md:grid-cols-[170px_1fr_170px]">
          <div className="hidden flex-col gap-4 md:flex">
            <Tool data="typo" title="Typography" body="Editorial serif · 64/72" />
            <Tool data="pages" title="Pages" body="Home · Menu · Reserve" live="row" />
          </div>
          <div data-piece="canvas" className="relative">
            {site && <BrowserFrame src={site.src} alt={site.label} />}
            <p data-live="heading" className="pointer-events-none absolute left-8 top-16 font-display text-4xl text-white opacity-0">
              Maison
            </p>
          </div>
          <div className="hidden flex-col gap-4 md:flex">
            <Tool data="color" title="Color" body="#111 · #F4EFE6 · accent" live="swatch" />
            <Tool data="images" title="Images" body="Replace any frame" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Tool({ data, title, body, live }: { data: string; title: string; body: string; live?: string }) {
  return (
    <div data-piece={data} className="border border-navy/10 bg-white/90 p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-accent">{title}</p>
      <p className="mt-2 text-sm text-navy">{body}</p>
      {live === 'swatch' && (
        <div data-live="swatch" className="mt-3 flex gap-2">
          <span className="h-5 w-5 bg-navy" />
          <span className="h-5 w-5 bg-[#f6f7fb] ring-1 ring-navy/10" />
          <span className="h-5 w-5 bg-accent" />
        </div>
      )}
    </div>
  )
}
