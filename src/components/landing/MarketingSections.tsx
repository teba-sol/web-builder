import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, MoveUpRight, Sparkles } from 'lucide-react'
import { getTemplateThumbnail } from '../../catalog/thumbnails'
import type { TemplateMeta } from '../../types'

export function ProofStrip() {
  return (
    <section className="marketing-proof" id="proof" aria-label="What BUILDoura helps you do">
      <p>From first idea to a website you can call your own.</p>
      <div className="marketing-proof-items">
        <span><i>01</i> Designed starting points</span>
        <span><i>02</i> A live editing canvas</span>
        <span><i>03</i> Your website, ready to export</span>
      </div>
    </section>
  )
}

export function TemplateShowcase({ templates }: { templates: TemplateMeta[] }) {
  const featured = templates.slice(0, 7)

  return (
    <section className="marketing-showcase" id="templates" aria-labelledby="showcase-title" data-showcase>
      <div className="marketing-showcase-stage">
        <header className="marketing-section-head" data-reveal>
          <div>
            <p className="marketing-eyebrow"><span className="marketing-section-number">01</span> THE TEMPLATE COLLECTION</p>
            <h2 id="showcase-title">A strong start.<br /><em>A world of directions.</em></h2>
          </div>
          <div className="marketing-showcase-intro">
            <p>Explore complete website designs for different kinds of ideas. Pick one to preview, then make it your own.</p>
            <Link to="/templates" className="marketing-inline-link">Explore all templates <ArrowUpRight size={15} /></Link>
          </div>
        </header>
        <div className="marketing-showcase-viewport">
          <div className="marketing-showcase-track" data-showcase-track data-stagger>
            {featured.map((template, index) => {
              const thumbnail = getTemplateThumbnail(template.id)
              return (
                <article className={`marketing-template-card marketing-template-card-${index % 3}`} key={template.id}>
                  <Link to={`/demo/${template.id}`} target="_blank" rel="noopener noreferrer" className="marketing-template-image" aria-label={`Open ${template.name} website preview in a new tab`}>
                    {thumbnail ? <img src={thumbnail} alt={`${template.name} website design`} loading="lazy" /> : <div className="marketing-template-fallback" />}
                    <span className="marketing-template-open"><ArrowUpRight size={19} /></span>
                    <span className="marketing-template-count">0{index + 1}</span>
                  </Link>
                  <div className="marketing-template-meta">
                    <div><h3>{template.name}</h3><p>{template.category.replace(/([a-z])([A-Z])/g, '$1 $2')}</p></div>
                    <Link to={`/demo/${template.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${template.name}`}><MoveUpRight size={16} /></Link>
                  </div>
                </article>
              )
            })}
            <Link to="/templates" className="marketing-showcase-more">
              <span className="marketing-showcase-more-icon"><ArrowUpRight size={25} /></span>
              <span>There&apos;s a starting point for your idea.</span>
              <b>See the full library <ArrowRight size={15} /></b>
            </Link>
          </div>
        </div>
        <div className="marketing-showcase-foot"><span>DRAG YOUR IDEA INTO VIEW</span><span>REAL DESIGNS / REAL PREVIEWS</span></div>
      </div>
    </section>
  )
}

export function FeatureStory({ templates }: { templates: TemplateMeta[] }) {
  const first = templates[1] ?? templates[0]
  const second = templates[2] ?? templates[0]
  const firstImage = first ? getTemplateThumbnail(first.id) : undefined
  const secondImage = second ? getTemplateThumbnail(second.id) : undefined

  return (
    <section className="marketing-story" aria-labelledby="story-title">
      <div className="marketing-story-topline"><span>02 / MAKE THE DESIGN YOURS</span><span>THE START IS ONLY THE START</span></div>
      <div className="marketing-story-layout">
        <div className="marketing-story-copy marketing-reveal" data-reveal>
          <p className="marketing-eyebrow">A TEMPLATE WITH ROOM TO BECOME</p>
          <h2 id="story-title">Keep the craft.<br /><em>Change the story.</em></h2>
          <p>Bring in your own words and images. Tune the colors, typography, and sections. See the changes on a real site preview as you shape the details.</p>
          <Link to="/signup" className="marketing-button marketing-button-dark">Find your starting point <ArrowUpRight size={16} /></Link>
          <span className="marketing-story-note"><Sparkles size={14} /> YOUR CONTENT. YOUR POINT OF VIEW.</span>
        </div>
        <div className="marketing-story-art" aria-label="Website templates with different visual identities">
          {first && firstImage && <Link to={`/demo/${first.id}`} target="_blank" rel="noopener noreferrer" className="marketing-story-image marketing-story-image-back" data-story-card><img src={firstImage} alt={`${first.name} website template`} loading="lazy" /><span>{first.name} / PREVIEW</span></Link>}
          {second && secondImage && <Link to={`/demo/${second.id}`} target="_blank" rel="noopener noreferrer" className="marketing-story-image marketing-story-image-front" data-story-card><img src={secondImage} alt={`${second.name} website template`} loading="lazy" /><span>{second.name} / PREVIEW</span></Link>}
          <span className="marketing-story-stamp">MAKE<br />IT<br /><em>YOURS</em></span>
        </div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  const steps = [
    { number: '01', title: 'Choose a direction.', body: 'Find a designed template that fits the kind of website you want to make.' },
    { number: '02', title: 'Make it yours.', body: 'Edit your content and adjust the colors, typography, images, and sections in the builder.' },
    { number: '03', title: 'Take it further.', body: 'Preview your work and, when export is available for your account, take the website files with you.' },
  ]

  return (
    <section className="marketing-process" id="how-it-works" aria-labelledby="process-title">
      <div className="marketing-process-aside"><p className="marketing-eyebrow">03 / YOUR IDEA, IN MOTION</p><h2 id="process-title">A little less blank page.<br /><em>A lot more you.</em></h2><span className="marketing-process-mark" aria-hidden="true">B.</span></div>
      <div className="marketing-process-steps">
        {steps.map((step) => <article className="marketing-process-step marketing-reveal" data-reveal key={step.number}>
          <span className="marketing-step-number">{step.number}</span>
          <div><h3>{step.title}</h3><p>{step.body}</p></div>
          <ArrowDownRight size={18} aria-hidden="true" />
        </article>)}
      </div>
    </section>
  )
}

export function LivePreview({ template }: { template?: TemplateMeta }) {
  if (!template) return null

  return (
    <section className="marketing-live" aria-labelledby="live-title">
      <div className="marketing-live-copy" data-reveal>
        <p className="marketing-eyebrow"><span className="marketing-section-number">04</span> NOT A MOCKUP</p>
        <h2 id="live-title">Step inside<br />a real <em>preview.</em></h2>
        <p>Explore a working template in the browser. Follow the page, open its sections, and see the real starting point before you choose it.</p>
        <Link to={`/demo/${template.id}`} target="_blank" rel="noopener noreferrer" className="marketing-inline-link">Open full {template.name} preview <ArrowUpRight size={15} /></Link>
      </div>
      <div className="marketing-live-window">
        <div className="marketing-live-chrome"><span className="marketing-window-dots" aria-hidden="true"><i /><i /><i /></span><span>buildoura.com / demo / {template.id}</span><span className="marketing-live-indicator"><i /> LIVE</span></div>
        <iframe src={`/demo/${template.id}`} title={`${template.name} interactive website template preview`} loading="lazy" />
      </div>
    </section>
  )
}

export function Benefits() {
  return (
    <section className="marketing-benefits" aria-labelledby="benefits-title">
      <div className="marketing-benefits-heading" data-reveal>
        <p className="marketing-eyebrow">05 / ROOM TO MAKE IT YOURS</p>
        <h2 id="benefits-title">A real website.<br /><em>Not a dead end.</em></h2>
      </div>
      <div className="marketing-benefits-list" data-reveal>
        <p>Start with a finished design, not an empty canvas.</p>
        <p>Work on your actual website content with a live preview.</p>
        <p>Shape the visual details without losing the design&apos;s point of view.</p>
        <p>Keep going with export options available through your account.</p>
        <Link to="/pricing" className="marketing-inline-link">See plans and options <ArrowUpRight size={15} /></Link>
      </div>
      <span className="marketing-benefits-sheen" aria-hidden="true" />
      <span className="marketing-benefits-check" aria-hidden="true"><Check size={18} /></span>
    </section>
  )
}

export function FinalCallToAction() {
  return (
    <section className="marketing-finale" aria-labelledby="finale-title">
      <div className="marketing-finale-topline"><span>06 / YOUR NEXT MOVE</span><span>THE INTERNET HAS ROOM FOR YOUR IDEA</span></div>
      <div className="marketing-finale-content" data-reveal>
        <p className="marketing-eyebrow">THE FIRST STEP IS YOURS</p>
        <h2 id="finale-title">Make something<br /><em>that feels like you.</em></h2>
        <div className="marketing-finale-bottom">
          <p>Find a direction. Make it yours.<br />See where your idea takes you.</p>
          <Link to="/signup" className="marketing-button marketing-button-primary">Start building <ArrowUpRight size={17} /></Link>
        </div>
      </div>
      <div className="marketing-finale-orbit" aria-hidden="true"><span /><span /><span /></div>
    </section>
  )
}

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <Link to="/" className="marketing-brand" aria-label="Buildoura home"><span className="marketing-brand-mark">B</span><span>buildoura</span></Link>
      <span className="marketing-footer-line">A good idea deserves a great website.</span>
      <nav aria-label="Footer navigation"><Link to="/templates">Templates</Link><Link to="/pricing">Pricing</Link><Link to="/login">Sign in</Link></nav>
      <a href="#main-content" className="marketing-back-top" aria-label="Back to top"><ArrowUpRight size={18} /></a>
    </footer>
  )
}
