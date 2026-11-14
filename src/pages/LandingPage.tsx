import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useAuraTheme } from '../hooks/useAuraTheme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useIsNarrow } from '../hooks/useIsNarrow'
import { useTemplateCatalog } from '../catalog/useTemplateCatalog'
import { templatesForPersonalAccount } from '../data/hospitalityAccess'
import { SmoothScroll } from '../components/landing/SmoothScroll'
import { MarketingNavigation } from '../components/landing/MarketingNavigation'
import { MarketingHero } from '../components/landing/MarketingHero'
import {
  Benefits,
  CreationTypes,
  FeatureStory,
  FinalCallToAction,
  HowItWorks,
  LivePreview,
  MarketingFooter,
  ProofStrip,
  TemplateShowcase,
} from '../components/landing/MarketingSections'
import './LandingPage.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function LandingPage() {
  const { theme } = useAuraTheme()
  const root = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow('(max-width: 767px)')
  const [paused, setPaused] = useState(false)
  const motion = !reduced && !paused
  const templates = templatesForPersonalAccount(useTemplateCatalog())
  const picks = ['restaurant', 'creative', 'boutique', 'realtor'].flatMap((id) => {
    const match = templates.find((template) => template.id === id)
    return match ? [match] : []
  })
  const showcaseTemplates = templates.filter((template) => !picks.some((pick) => pick.id === template.id))
  const curated = [...picks, ...showcaseTemplates].slice(0, 7)

  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = description?.content
    document.title = "BUILDoura — Don’t just imagine it. Build it."
    if (description) description.content = 'Start with a beautifully designed website, make it yours in a live editor, and explore real website previews with BUILDoura.'
    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
    }
  }, [])

  useGSAP(() => {
    if (!root.current) return
    const select = gsap.utils.selector(root)

    if (!motion) return

    const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } })
    entrance
      .fromTo(select('[data-hero-line]'),
        { yPercent: 115, opacity: 0, rotate: 2 },
        { yPercent: 0, opacity: 1, rotate: 0, duration: 1, stagger: 0.11, clearProps: 'transform' },
      )
      .fromTo(select('[data-hero-window]'),
        { y: 100, opacity: 0, rotateX: 18, rotateY: -18, scale: 0.9 },
        { y: 0, opacity: 1, rotateX: 0, rotateY: 0, scale: 1, duration: 1.35, clearProps: 'transform' },
        '-=0.55',
      )
      .fromTo(select('[data-hero-object]'),
        { scale: 0.6, opacity: 0, rotate: -18 },
        { scale: 1, opacity: 1, rotate: 0, duration: 1.1, stagger: 0.08 },
        '-=1',
      )

    gsap.utils.toArray<HTMLElement>(select('[data-reveal]')).forEach((element) => {
      gsap.fromTo(element, { y: 44, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 86%', once: true },
      })
    })

    gsap.utils.toArray<HTMLElement>(select('[data-stagger]')).forEach((group) => {
      gsap.fromTo(group.children, { y: 32, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.75, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 82%', once: true },
      })
    })

    gsap.to(select('[data-float]'), {
      y: (index) => index % 2 ? -26 : 20,
      rotate: (index) => index % 2 ? 3 : -2,
      ease: 'none',
      scrollTrigger: { trigger: select('.marketing-hero'), start: 'top top', end: 'bottom top', scrub: 0.8 },
    })

    const hero = select('.marketing-hero')[0] as HTMLElement | undefined
    const heroObjects = gsap.utils.toArray<HTMLElement>(select('[data-depth]'))
    const quickX = heroObjects.map((object) => gsap.quickTo(object, 'rotateY', { duration: 0.65, ease: 'power3.out' }))
    const quickY = heroObjects.map((object) => gsap.quickTo(object, 'rotateX', { duration: 0.65, ease: 'power3.out' }))
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || narrow) return
      const bounds = hero?.getBoundingClientRect()
      if (!bounds) return
      const x = (event.clientX - bounds.left) / bounds.width - 0.5
      const y = (event.clientY - bounds.top) / bounds.height - 0.5
      heroObjects.forEach((_, index) => {
        quickX[index](x * (index + 1) * 2.6)
        quickY[index](-y * (index + 1) * 2.2)
      })
    }
    hero?.addEventListener('pointermove', onPointerMove, { passive: true })

    const showcase = select('[data-showcase]')[0] as HTMLElement | undefined
    const track = select('[data-showcase-track]')[0] as HTMLElement | undefined
    if (!narrow && showcase && track) {
      const cards = gsap.utils.toArray<HTMLElement>(select('[data-gallery-card]'))
      const gallery = gsap.timeline({
        scrollTrigger: {
          trigger: showcase,
          start: 'top top',
          end: () => `+=${Math.max(1000, track.scrollWidth - window.innerWidth + 180)}`,
          scrub: 0.7,
          pin: select('.marketing-showcase-stage')[0] as HTMLElement,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      gallery.to(track, { x: () => Math.min(0, window.innerWidth - track.scrollWidth - 96), ease: 'none' }, 0)
      cards.forEach((card, index) => {
        gallery.fromTo(card, { rotateY: index % 2 ? 8 : -8, z: -60 }, { rotateY: 0, z: 0, ease: 'none' }, 0)
      })
    }

    return () => hero?.removeEventListener('pointermove', onPointerMove)
  }, { dependencies: [motion, narrow], scope: root })

  return (
    <SmoothScroll enabled={motion && !narrow}>
      <div ref={root} className="buildoura-landing" data-theme={theme} data-motion={motion ? 'on' : 'off'}>
        <a className="marketing-skip" href="#main-content">Skip to content</a>
        <MarketingNavigation motion={motion} reduced={reduced} onToggleMotion={() => setPaused((value) => !value)} />
        <main id="main-content">
          <MarketingHero templates={picks} />
          <ProofStrip />
          <TemplateShowcase templates={curated} />
          <CreationTypes templates={templates} />
          <FeatureStory templates={picks} />
          <HowItWorks />
          <LivePreview template={picks[0]} />
          <Benefits />
          <FinalCallToAction />
        </main>
        <MarketingFooter />
      </div>
    </SmoothScroll>
  )
}
