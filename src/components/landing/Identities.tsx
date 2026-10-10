import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { BrowserFrame } from './BrowserFrame'
import { showcaseSites } from './sites'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const IDENTITIES = [
  { id: 'hotel', name: 'Luxury brand', rotate: -18, x: -42, y: -8 },
  { id: 'coffee', name: 'Coffee shop', rotate: -8, x: -22, y: 10 },
  { id: 'axiom', name: 'Architecture studio', rotate: 0, x: 0, y: 0 },
  { id: 'creative', name: 'Creative agency', rotate: 9, x: 24, y: 8 },
  { id: 'restaurant', name: 'Restaurant', rotate: 18, x: 44, y: -6 },
]

export function Identities() {
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow()
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const sites = showcaseSites()

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
      IDENTITIES.forEach((item, i) => {
        tl.fromTo(
          q(`[data-id-card="${item.id}"]`),
          { xPercent: 0, rotate: 0, yPercent: 0, scale: 0.92 },
          { xPercent: item.x, rotate: item.rotate, yPercent: item.y, scale: i === 2 ? 1 : 0.82, duration: 1 },
          0,
        )
      })
      tl.to(q('[data-id-card]'), { xPercent: 0, rotate: 0, yPercent: 0, scale: 0.9, duration: 0.9 }, 1.15)
    },
    { dependencies: [reduced, narrow], scope: root },
  )

  return (
    <section ref={root} className={reduced || narrow ? 'relative px-4 py-24' : 'relative h-[260vh]'}>
      <div ref={stage} className={reduced || narrow ? '' : 'flex h-[100svh] flex-col justify-center overflow-hidden'}>
        <div className="px-2 text-center md:px-8">
          <p className="text-[10px] uppercase tracking-[0.32em] text-accent">The idea</p>
          <h2 className="font-display mt-3 text-[clamp(2.2rem,7vw,6rem)] text-navy">
            One template.
            <br />
            Endless identities.
          </h2>
        </div>
        <div className={`relative mx-auto mt-12 ${reduced || narrow ? 'grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3' : 'h-[58vh] w-full max-w-5xl'}`}>
          {IDENTITIES.map((item, i) => {
            const site = sites.find((s) => s.id === item.id)
            if (!site) return null
            return (
              <div
                key={item.id}
                data-id-card={item.id}
                className={reduced || narrow ? '' : 'absolute left-1/2 top-0 w-[54%] -translate-x-1/2'}
                style={reduced || narrow ? undefined : { zIndex: 10 - Math.abs(i - 2) }}
              >
                <BrowserFrame src={site.src} alt={item.name} compact />
                <p className="mt-2 text-center text-[10px] uppercase tracking-[0.22em] text-navy/55">{item.name}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
