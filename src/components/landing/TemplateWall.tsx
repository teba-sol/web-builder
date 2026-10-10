import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { BrowserFrame } from './BrowserFrame'
import { showcaseSites } from './sites'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const layout = [
  { w: 'w-[58%] md:w-[38%]', x: '-left-[4%]', y: 'top-0', speed: 1 },
  { w: 'w-[70%] md:w-[28%]', x: 'right-[2%]', y: 'top-[8%]', speed: 1.15 },
  { w: 'w-[48%] md:w-[22%]', x: 'left-[28%]', y: 'top-[34%]', speed: 0.7 },
  { w: 'w-[80%] md:w-[34%]', x: '-right-[6%]', y: 'top-[42%]', speed: 0.9 },
  { w: 'w-[62%] md:w-[26%]', x: 'left-[4%]', y: 'top-[58%]', speed: 1.2 },
  { w: 'w-[55%] md:w-[30%]', x: 'right-[18%]', y: 'top-[68%]', speed: 0.65 },
  { w: 'w-[70%] md:w-[24%]', x: 'left-[36%]', y: 'top-[82%]', speed: 1.05 },
  { w: 'w-[60%] md:w-[32%]', x: 'right-[4%]', y: 'top-[92%]', speed: 0.8 },
]

export function TemplateWall() {
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow()
  const root = useRef<HTMLElement>(null)
  const sites = showcaseSites()

  useGSAP(
    () => {
      if (reduced || narrow || !root.current) return
      root.current.querySelectorAll<HTMLElement>('[data-wall]').forEach((card) => {
        const speed = Number(card.dataset.speed || 1)
        gsap.fromTo(
          card,
          { y: 80 * speed },
          {
            y: -120 * speed,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,
            },
          },
        )
      })
    },
    { dependencies: [reduced, narrow], scope: root },
  )

  return (
    <section ref={root} className="relative overflow-hidden px-3 py-24 md:min-h-[220vh] md:py-32">
      <div className="relative z-10 mb-16 px-2 md:px-5">
        <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Library</p>
        <h2 className="font-display mt-3 max-w-3xl text-[clamp(2.2rem,6vw,5.2rem)] text-navy">
          A wall of
          <br />
          starting points.
        </h2>
      </div>
      <div className={narrow || reduced ? 'grid grid-cols-2 gap-3' : 'relative h-[180vh]'}>
        {sites.slice(0, layout.length).map((site, i) => {
          const slot = layout[i]
          return (
            <Link
              key={site.id}
              to={`/demo/${site.id}`}
              data-wall
              data-speed={slot.speed}
              className={
                narrow || reduced
                  ? 'block'
                  : `absolute ${slot.w} ${slot.x} ${slot.y}`
              }
            >
              <BrowserFrame src={site.src} alt={site.label} compact={i % 3 !== 0} chrome={i % 4 !== 2} />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
