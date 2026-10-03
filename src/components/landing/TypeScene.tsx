import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { BrowserFrame } from './BrowserFrame'
import { showcaseSites } from './sites'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function TypeScene() {
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow()
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const site = showcaseSites().find((s) => s.id === 'photography') ?? showcaseSites()[0]

  useGSAP(
    () => {
      if (reduced || narrow || !root.current || !stage.current) return
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
          pin: stage.current,
          anticipatePin: 1,
        },
      })
      tl.to(q('[data-a]'), { xPercent: -40, duration: 1 }, 0)
        .to(q('[data-b]'), { xPercent: 35, duration: 1 }, 0)
        .to(q('[data-c]'), { xPercent: -18, yPercent: 20, duration: 1 }, 0)
        .to(q('[data-d]'), { xPercent: 24, duration: 1 }, 0)
        .fromTo(q('[data-next]'), { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1 }, 0.35)
        .to(q('[data-frame]'), { xPercent: 20, rotate: 8, scale: 1.1, duration: 1 }, 0)
    },
    { dependencies: [reduced, narrow], scope: root },
  )

  return (
    <section data-landing-dark ref={root} className={reduced || narrow ? 'relative bg-navy px-4 py-24 text-white' : 'relative h-[240vh] bg-navy text-white'}>
      <div ref={stage} className={reduced || narrow ? '' : 'h-[100svh] overflow-hidden'}>
        <div className="relative flex h-full flex-col justify-center px-2 pt-20 md:px-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">The point</p>
          <h2 className="font-display mt-4">
            <span data-a className="block text-[clamp(3.4rem,14vw,12rem)]">
              Start
            </span>
            <span data-b className="block text-[clamp(3.4rem,14vw,12rem)]">
              with
            </span>
            <span data-c className="block text-[clamp(3.4rem,14vw,12rem)]">
              good
            </span>
            <span data-d className="block text-[clamp(3.4rem,14vw,12rem)] text-accent">
              design.
            </span>
          </h2>
          <p data-next className="font-display mt-10 text-[clamp(2.4rem,8vw,6.5rem)] text-white/90">
            Make
            <br />
            it yours.
          </p>
          {site && (
            <div data-frame className="pointer-events-none absolute right-[-10%] top-[18%] w-[42%] opacity-70">
              <BrowserFrame src={site.src} alt="" compact />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
