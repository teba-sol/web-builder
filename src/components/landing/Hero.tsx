import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useMouseParallax, useParallaxOffset } from '../../hooks/useMouseParallax'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { BrowserFrame } from './BrowserFrame'
import { showcaseSites } from './sites'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const HEADLINE = 'font-display text-[clamp(1.9rem,calc((100vw-2.75rem)/11.8),7rem)] text-navy'

export function Hero() {
  const narrow = useIsNarrow()
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const sites = showcaseSites()
  const main = sites.find((s) => s.id === 'hotel') ?? sites[0]
  const floats = sites.filter((s) => s.id !== main?.id).slice(0, 3)
  const { rotateX, rotateY, onMove, onLeave, mx, my } = useMouseParallax(4)
  const ox = useParallaxOffset(mx, 10)
  const oy = useParallaxOffset(my, 6)

  useGSAP(
    () => {
      if (narrow || !root.current || !stage.current) return
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          pin: stage.current,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      tl.to(q('[data-word="0"]'), { xPercent: -18, yPercent: -22, duration: 1 }, 0)
        .to(q('[data-word="1"]'), { xPercent: 20, duration: 1 }, 0)
        .to(q('[data-word="2"]'), { xPercent: 10, yPercent: 28, duration: 1 }, 0)
        .to(q('[data-copy]'), { opacity: 0, y: -24, duration: 0.45 }, 0)
        .to(q('[data-float]'), { x: 0, y: 48, rotate: 0, scale: 0.7, opacity: 0.35, duration: 0.9 }, 0.12)
        .to(q('[data-main]'), { scale: 1.12, y: 10, duration: 1 }, 0.28)
        .to(q('[data-float]'), { opacity: 0, duration: 0.4 }, 0.72)
        .to(q('[data-word]'), { opacity: 0.18, duration: 0.5 }, 0.7)
    },
    { dependencies: [narrow], scope: root },
  )

  if (narrow) {
    return (
      <section className="relative overflow-hidden px-4 pb-16 pt-24">
        <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Template studio</p>
        <h1 className={`${HEADLINE} mt-4`}>
          Build
          <br />
          your
          <br />
          presence.
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-navy/60">
          BuildAura gives you beautifully designed templates and the tools to make them completely yours.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.22em]">
          <a href="#templates" className="text-navy">
            Explore Templates
          </a>
          <Link to="/signup" className="text-accent">
            Start Building
          </Link>
        </div>
        {main && (
          <div className="mt-10">
            <BrowserFrame src={main.src} alt={main.label} />
          </div>
        )}
      </section>
    )
  }

  return (
    <section ref={root} className="relative h-[280vh]">
      <div ref={stage} className="h-[100svh] overflow-hidden px-4 pt-24 md:px-8">
        <motion.div
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ perspective: 1400, rotateX, rotateY }}
          className="relative h-full"
        >
          {floats[0] && (
            <motion.div
              data-float
              style={{ x: ox, y: oy }}
              className="pointer-events-none absolute right-[-4%] top-[10%] z-0 w-[24%]"
            >
              <BrowserFrame src={floats[0].src} alt={floats[0].label} compact className="rotate-6" />
            </motion.div>
          )}
          {floats[1] && (
            <div data-float className="pointer-events-none absolute right-[-8%] top-[42%] z-0 w-[22%]">
              <BrowserFrame src={floats[1].src} alt={floats[1].label} compact className="-rotate-5" />
            </div>
          )}
          {floats[2] && (
            <div data-float className="pointer-events-none absolute bottom-[6%] left-[28%] z-0 w-[18%]">
              <BrowserFrame src={floats[2].src} alt={floats[2].label} compact className="rotate-3" />
            </div>
          )}
          {main && (
            <motion.div
              data-main
              style={{ x: ox }}
              className="pointer-events-none absolute bottom-[-10%] right-[2%] z-[1] w-[40%]"
            >
              <BrowserFrame src={main.src} alt={main.label} />
            </motion.div>
          )}

          <div className="relative z-20">
            <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Template studio</p>
            <h1 className={`${HEADLINE} mt-2`}>
              <span data-word="0" className="block whitespace-nowrap">
                Build
              </span>
              <span data-word="1" className="block whitespace-nowrap">
                your
              </span>
              <span data-word="2" className="block whitespace-nowrap">
                presence.
              </span>
            </h1>
          </div>

          <div
            data-copy
            className="relative z-30 mt-6 max-w-sm bg-gradient-to-r from-[#f6f7fb] via-[#f6f7fb]/90 to-transparent pr-8"
          >
            <p className="text-sm leading-relaxed text-navy/60 md:text-base">
              BuildAura gives you beautifully designed templates and the tools to make them completely yours.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.22em]">
              <a href="#templates" className="text-navy">
                Explore Templates
              </a>
              <Link to="/signup" className="text-accent">
                Start Building
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
