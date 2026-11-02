import { useAuraTheme } from '../hooks/useAuraTheme'
import { AuraHeader } from '../components/landing/AuraHeader'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Layers3, MoveUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SmoothScroll } from '../components/landing/SmoothScroll'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useIsNarrow } from '../hooks/useIsNarrow'
import { useTemplateCatalog } from '../catalog/useTemplateCatalog'
import { getTemplateThumbnail } from '../catalog/thumbnails'
import { templatesForPersonalAccount } from '../data/hospitalityAccess'
import './LandingPage.css'

const AuraSculpture = lazy(() => import('../components/landing/AuraSculpture'))
gsap.registerPlugin(ScrollTrigger)

export function LandingPage() {
  const { theme } = useAuraTheme()
  const root = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow('(max-width: 767px)')
  const [paused, setPaused] = useState(false)
  const motion = !reduced && !paused
  const immersive = motion && !narrow
  const templates = templatesForPersonalAccount(useTemplateCatalog())
  const picks = ['restaurant', 'creative', 'photography', 'realtor'].flatMap((id) => {
    const match = templates.find((template) => template.id === id)
    return match ? [match] : []
  })

  useEffect(() => {
    const previous = document.title
    document.title = 'Buildoura — Give your ideas a new dimension'
    return () => { document.title = previous }
  }, [])

  useEffect(() => {
    if (!motion || !root.current) return
    const context = gsap.context(() => {
      gsap.fromTo('[data-hero-line]', { y: 65, opacity: 0 }, { y: 0, opacity: 1, duration: 1.15, stagger: 0.12, ease: 'power3.out' })
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.fromTo(element, { y: 35, opacity: 0.35 }, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.85, scrollTrigger: { trigger: element, start: 'top 92%', once: true } })
      })
      if (!narrow) {
        const hero = gsap.timeline({ scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: 1 } })
        hero.to('[data-hero-copy]', { yPercent: -20, opacity: 0.2, ease: 'none' }, 0)
          .to('[data-float="0"]', { y: -150, rotation: -12, ease: 'none' }, 0)
          .to('[data-float="1"]', { y: -250, rotation: 13, ease: 'none' }, 0)
          .to('[data-float="2"]', { y: -95, rotation: -4, ease: 'none' }, 0)
          .to('[data-orbit]', { y: 100, scale: 1.1, ease: 'none' }, 0)
        gsap.utils.toArray<HTMLElement>('[data-project-image]').forEach((element) => {
          gsap.fromTo(element, { yPercent: -5, scale: 1.13 }, { yPercent: 5, scale: 1.13, ease: 'none', scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } })
        })
        gsap.to('[data-manifesto-word]', { xPercent: -12, ease: 'none', scrollTrigger: { trigger: '[data-manifesto]', start: 'top bottom', end: 'bottom top', scrub: 1 } })
      }
    }, root)
    return () => context.revert()
  }, [motion, narrow])

  return (
    <SmoothScroll enabled={immersive}>
      <div ref={root} className="aura-page" data-theme={theme} data-motion={motion ? 'on' : 'off'} data-immersive={immersive ? 'true' : 'false'}>
        <a href="#main-content" className="aura-skip">Skip to content</a>
        <AuraHeader motion={motion} reduced={reduced} onToggleMotion={() => setPaused((value) => !value)} />

        <main id="main-content">
          <section className="aura-hero" data-hero>
            <div className="aura-hero-stage">
              <div className="aura-hero-grid" aria-hidden="true" />
              <div className="aura-orbit" data-orbit aria-hidden="true">
                <div className="aura-orbit-fallback" />
                {!reduced && !narrow && <Suspense fallback={null}><AuraSculpture paused={paused} /></Suspense>}
              </div>
              <div className="aura-hero-copy" data-hero-copy>
                <p className="aura-kicker" data-hero-line><span className="aura-live-dot" /> A new dimension of website building</p>
                <h1><span data-hero-line>Ideas deserve</span><span data-hero-line>more <em>space.</em></span></h1>
                <p className="aura-hero-description" data-hero-line>For the businesses, the makers, the next big things.<br className="aura-desktop-break" /> Turn a starting point into a presence that’s unmistakably you.</p>
                <div className="aura-hero-actions" data-hero-line><Link to="/signup" className="aura-button aura-button-orange">Make your mark <ArrowUpRight size={19} /></Link><Link to="/templates" className="aura-text-link">Explore the possibilities <ArrowRight size={17} /></Link></div>
              </div>
              <div className="aura-floating-previews">
                {picks.slice(0, 3).map((template, index) => {
                  const thumbnail = getTemplateThumbnail(template.id)
                  return thumbnail && <Link key={template.id} to={`/demo/${template.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${template.name} in a new tab`} className={`aura-float aura-float-${index}`} data-float={index}>
                    <div className="aura-window-bar"><span>● ● ●</span><span>{template.name}</span><ArrowUpRight size={11} /></div><img src={thumbnail} alt={`${template.name} template`} loading={index === 0 ? 'eager' : 'lazy'} />
                  </Link>
                })}
              </div>
              <div className="aura-hero-bottom"><a href="#templates"><ArrowDown size={15} /> Scroll to discover</a><span>Designed to be yours. Built to go beyond.</span><span className="aura-coordinates">TEMPLATES / EXPRESSION / EXPORT</span></div>
            </div>
          </section>

          <section className="aura-manifesto" data-manifesto>
            <div className="aura-section-marker"><span>01 / THE POSSIBILITIES</span><span>YOUR VISION. A DIFFERENT PERSPECTIVE.</span></div>
            <p className="aura-manifesto-copy" data-reveal>Not another blank canvas.<br />A <em>head start</em> for something<br />that hasn’t existed before.</p>
            <div className="aura-running-type" aria-hidden="true"><span data-manifesto-word>MAKE IT YOURS. MAKE IT YOURS.</span></div>
            <div className="aura-manifesto-footer"><Layers3 size={24} strokeWidth={1} /><p>Thoughtful templates. An intuitive editor.<br />The freedom to take your website with you.</p><Link to="/templates" className="aura-round-link" aria-label="Explore template library"><ArrowUpRight size={24} /></Link></div>
          </section>

          <section id="templates" className="aura-work">
            <div className="aura-section-marker"><span>02 / SELECTED DIRECTIONS</span><Link to="/templates">View the whole collection <ArrowUpRight size={14} /></Link></div>
            <div className="aura-work-heading" data-reveal><h2>Different worlds.<br /><em>One starting point.</em></h2><p>A few possibilities from the studio.<br />Find your direction. Then make it your own.</p></div>
            <div className="aura-project-grid">{picks.map((template, index) => {
              const thumbnail = getTemplateThumbnail(template.id)
              return <article key={template.id} className={`aura-project aura-project-${index}`} data-reveal>
                <Link to={`/demo/${template.id}`} target="_blank" rel="noopener noreferrer" className="aura-project-visual" aria-label={`Preview ${template.name} in a new tab`}>
                  {thumbnail ? <img data-project-image src={thumbnail} alt={`${template.name} website preview`} loading="lazy" /> : <div className={`h-full bg-gradient-to-br ${template.previewGradient}`} />}
                  <span className="aura-project-open"><ArrowUpRight size={24} /></span><span className="aura-project-index">0{index + 1}</span>
                </Link>
                <div className="aura-project-meta"><div><h3>{template.name}</h3><p>{template.category === 'food' ? 'Food & dining' : template.category === 'realestate' ? 'Real estate' : 'Creative & portfolio'}</p></div><Link to={`/login?return=${encodeURIComponent(`/editor/${template.id}`)}`} className="aura-project-use">Make it yours <ArrowUpRight size={16} /></Link></div>
              </article>
            })}</div>
            <Link to="/templates" className="aura-library-link">Your starting point is in here.<span>Explore all templates <ArrowUpRight size={24} /></span></Link>
          </section>

          <section id="features" className="aura-experience">
            <div className="aura-section-marker"><span>03 / FROM IDEA TO OUT THERE</span><span>LESS FRICTION. MORE EXPRESSION.</span></div>
            <div className="aura-experience-layout"><div className="aura-experience-intro" data-reveal><p className="aura-kicker">Build without the blank-page feeling.</p><h2>In your hands.<br /><em>Out of the ordinary.</em></h2><Link to="/signup" className="aura-button aura-button-light">Find your flow <ArrowUpRight size={18} /></Link></div><div className="aura-steps">{[
              { n: '01', title: 'Choose a direction.', body: 'A restaurant. A creative studio. Your next venture. Explore complete designs built around the way you work.', tag: 'A foundation, not a formula' },
              { n: '02', title: 'Change the frequency.', body: 'Your words, your images, your own visual language. Shape the fonts, colors, and sections, with a live preview as you go.', tag: 'Every detail, a little more you' },
              { n: '03', title: 'Go beyond the builder.', body: 'Unlock cloud save and export for your website. Download the full-stack files and take the next step on your own hosting.', tag: 'Your website has somewhere to go' },
            ].map((step) => <article key={step.n} data-reveal><span className="aura-step-number">{step.n}</span><div><h3>{step.title}</h3><p>{step.body}</p><span className="aura-step-tag"><Check size={12} />{step.tag}</span></div></article>)}</div></div>
          </section>

          <section className="aura-finale"><div className="aura-section-marker"><span>NEXT / YOUR MOVE</span><span>THE INTERNET HAS ROOM FOR YOU.</span></div><p className="aura-kicker" data-reveal>Something good starts here.</p><h2 data-reveal>Take up<br /><em>space.</em><MoveUpRight aria-hidden="true" /></h2><div className="aura-finale-bottom"><p>It’s your idea.<br />Let’s give it an address.</p><Link to="/signup" className="aura-button aura-button-dark">Start your next chapter <ArrowUpRight size={20} /></Link></div></section>
        </main>
        <footer className="aura-footer"><Link to="/" className="aura-logo"><span>B</span>buildoura</Link><span>Made for what’s next.</span><nav aria-label="Footer navigation"><Link to="/templates">Templates</Link><Link to="/pricing">Pricing</Link><Link to="/login">Sign in</Link></nav><a href="#main-content" aria-label="Back to top"><ArrowUpRight size={20} /></a></footer>
      </div>
    </SmoothScroll>
  )
}
