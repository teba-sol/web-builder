import { useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { LenisContext } from './lenisContext'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const root = document.documentElement
    const previousBehavior = root.style.scrollBehavior
    root.classList.add('landing-active')
    root.style.scrollBehavior = 'auto'

    const refresh = () => ScrollTrigger.refresh()
    const refreshTimer = window.setTimeout(refresh, 250)
    window.addEventListener('load', refresh)

    if (reduced) {
      return () => {
        window.clearTimeout(refreshTimer)
        window.removeEventListener('load', refresh)
        root.classList.remove('landing-active')
        root.style.scrollBehavior = previousBehavior
      }
    }

    const instance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    })
    instance.on('scroll', ScrollTrigger.update)
    const ticker = (time: number) => {
      instance.raf(time * 1000)
    }
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)
    setLenis(instance)
    requestAnimationFrame(refresh)

    const hash = window.location.hash
    const hashTimer = hash
      ? window.setTimeout(() => {
          refresh()
          const target = document.querySelector(hash)
          if (target) instance.scrollTo(target as HTMLElement, { offset: 0, immediate: true })
        }, 280)
      : 0

    return () => {
      window.clearTimeout(refreshTimer)
      window.clearTimeout(hashTimer)
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(ticker)
      instance.destroy()
      setLenis(null)
      root.classList.remove('landing-active')
      root.style.scrollBehavior = previousBehavior
    }
  }, [reduced])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
