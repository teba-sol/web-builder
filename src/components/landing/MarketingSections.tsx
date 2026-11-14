import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, MoveUpRight, Sparkles } from 'lucide-react'
import { getTemplateThumbnail } from '../../catalog/thumbnails'
import type { TemplateMeta } from '../../types'

export function ProofStrip() {
  return (
    <section className="marketing-proof" id="proof" aria-label="What BUILDoura helps you do">
      <p>One idea. <em>A thousand directions.</em></p>
      <div className="marketing-proof-items"><span><i>01</i> Find your starting point</span><span><i>02</i> Shape it in the editor</span><span><i>03</i> Make it yours</span></div>
      <span className="proof-mark" aria-hidden="true">B/</span>
    </section>
  )
}

export function TemplateShowcase({ templates }: { templates: TemplateMeta[] }) {
  const featured = templates.slice(0, 7)
  return (
    <section className="marketing-showcase" id="templates" aria-labelledby="showcase-title" data-showcase>
      <div className="marketing-showcase-stage">
        <header className="marketing-section-head" data-reveal>
          <div><p className="marketing-eyebrow"><span className="marketing-section-number">01</span> THE DESIGN INDEX</p><h2 id="showcase-title">Start somewhere.<br /><em>Go everywhere.</em></h2></div>
          <div className="marketing-showcase-intro"><p>Real, ready-to-explore website designs. Each one is a starting point—not a box to stay inside.</p><Link to="/templates" className="marketing-inline-link">Explore all designs <ArrowUpRight size={15} /></Link></div>
        </header>
        <div className="marketing-showcase-viewport"><div className="marketing-showcase-track" data-showcase-track data-stagger>
          {featured.map((template, index) => {
            const thumbnail = getTemplateThumbnail(template.id)
            return <article className={`marketing-template-card marketing-template-card-${index % 3}`} data-gallery-card key={template.id}>
              <Link to={`/demo/${template.id}`} target="_blank" rel="noopener noreferrer" className="marketing-template-image" aria-label={`Open ${template.name} website preview in a new tab`}>
                {thumbnail ? <img src={thumbnail} alt={`${template.name} website design`} loading="lazy" /> : <div className="marketing-template-fallback" />}
                <span className="marketing-template-open"><ArrowUpRight size={19} /></span><span className="marketing-template-count">0{index + 1} / 07</span>
              </Link>
              <div className="marketing-template-meta"><div><h3>{template.name}</h3><p>{template.category.replace(/([a-z])([A-Z])/g, '$1 $2')} / WEBSITE DESIGN</p></div><Link to={`/demo/${template.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${template.name}`}><MoveUpRight size={16} /></Link></div>
            </article>
          })}
          <Link to="/templates" className="marketing-showcase-more"><span className="marketing-showcase-more-icon"><ArrowUpRight size={25} /></span><span>Find your own kind of different.</span><b>See the full library <ArrowRight size={15} /></b></Link>
        </div></div>
        <div className="marketing-showcase-foot"><span>SCROLL TO MOVE THROUGH THE COLLECTION</span><span>REAL DESIGNS / OPEN TO EXPLORE</span></div>
      </div>
    </section>
  )
}

const creationTypes = [
  { id: 'business', label: 'Business', title: 'Make a good first impression.', number: '01', className: 'type-business' },
  { id: 'photography', label: 'Portfolio', title: 'Put your work in the frame.', number: '02', className: 'type-portfolio' },
  { id: 'creative', label: 'Creative studio', title: 'Give your ideas a home.', number: '03', className: 'type-studio' },
  { id: 'boutique', label: 'Fashion & retail', title: 'Make every detail count.', number: '04', className: 'type-fashion' },
  { id: 'restaurant', label: 'Food & hospitality', title: 'Bring people to your table.', number: '05', className: 'type-food' },
  { id: 'realtor', label: 'Property', title: 'Help them picture what’s next.', number: '06', className: 'type-property' },
]

export function CreationTypes({ templates }: { templates: TemplateMeta[] }) {
  const cards = creationTypes.flatMap((item) => {
    const template = templates.find((candidate) => candidate.id === item.id)
    return template ? [{ ...item, template, image: getTemplateThumbnail(template.id) }] : []
  })
  return (
    <section className="marketing-types" aria-labelledby="types-title">
      <header className="marketing-types-header" data-reveal><div><p className="marketing-eyebrow"><span className="marketing-section-number">02</span> ONE BUILDER, MANY WORLDS</p><h2 id="types-title">What will you<br /><em>make yours?</em></h2></div><p>Different ambitions call for different canvases. Find a real design made for the kind of thing you have in mind.</p></header>
      <div className="marketing-types-grid" data-stagger>{cards.map((card) => <Link to={`/demo/${card.template.id}`} target="_blank" rel="noopener noreferrer" className={`marketing-type-card ${card.className}`} key={card.template.id} aria-label={`Explore the ${card.label} website design`}>
        <span className="marketing-type-image">{card.image && <img src={card.image} alt="" loading="lazy" />}<i>{card.number}</i><span className="type-open"><ArrowUpRight size={18} /></span></span>
        <span className="marketing-type-meta"><span><small>{card.label}</small><b>{card.title}</b></span><span className="type-arrow"><ArrowUpRight size={16} /></span></span>
      </Link>)}</div>
      <div className="marketing-types-bottom"><span>THE FORMAT IS YOURS TO DECIDE</span><Link to="/templates" className="marketing-inline-link">Browse every design <ArrowRight size={15} /></Link></div>
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
      <div className="marketing-story-topline"><span>03 / THE DETAILS ARE YOURS</span><span>KEEP THE CRAFT. CHANGE THE STORY.</span></div>
      <div className="marketing-story-layout">
        <div className="marketing-story-copy" data-reveal><p className="marketing-eyebrow">A DESIGN IS JUST THE BEGINNING</p><h2 id="story-title">Keep the craft.<br /><em>Change the story.</em></h2><p>Bring in your words and images. Tune the color, typography, and sections. See your changes on a real site preview as your idea takes shape.</p><Link to="/signup" className="marketing-button marketing-button-dark">Make it your own <ArrowUpRight size={16} /></Link><span className="marketing-story-note"><Sparkles size={14} /> YOUR CONTENT. YOUR POINT OF VIEW.</span></div>
        <div className="marketing-story-art" aria-label="Website designs with different visual identities">{first && firstImage && <Link to={`/demo/${first.id}`} target="_blank" rel="noopener noreferrer" className="marketing-story-image marketing-story-image-back" data-story-card><img src={firstImage} alt={`${first.name} website design`} loading="lazy" /><span>{first.name} / A DIFFERENT DIRECTION</span></Link>}{second && secondImage && <Link to={`/demo/${second.id}`} target="_blank" rel="noopener noreferrer" className="marketing-story-image marketing-story-image-front" data-story-card><img src={secondImage} alt={`${second.name} website design`} loading="lazy" /><span>{second.name} / MAKE IT YOURS</span></Link>}<span className="marketing-story-stamp">MADE<br />BY <em>YOU</em></span><span className="story-asterisk" aria-hidden="true">✳</span></div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  const steps = [
    { number: '01', title: 'Choose a direction.', body: 'Find a designed template that feels close to the website you want to make.' },
    { number: '02', title: 'Make it yours.', body: 'Edit the content and adjust the colors, typography, images, and sections in the builder.' },
    { number: '03', title: 'Take it further.', body: 'Preview your work and, when export is available for your account, take the website files with you.' },
  ]
  return <section className="marketing-process" id="how-it-works" aria-labelledby="process-title"><div className="marketing-process-aside" data-reveal><p className="marketing-eyebrow">04 / FROM IDEA TO ONLINE</p><h2 id="process-title">A little less<br />blank page.<br /><em>A lot more you.</em></h2><span className="marketing-process-mark" aria-hidden="true">B.</span></div><div className="marketing-process-steps" data-stagger>{steps.map((step) => <article className="marketing-process-step" key={step.number}><span className="marketing-step-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.body}</p></div><ArrowDownRight size={18} aria-hidden="true" /></article>)}</div><span className="process-side-note" aria-hidden="true">BUILD / YOUR / WAY</span></section>
}

export function LivePreview({ template }: { template?: TemplateMeta }) {
  if (!template) return null
  return <section className="marketing-live" aria-labelledby="live-title"><div className="marketing-live-copy" data-reveal><p className="marketing-eyebrow"><span className="marketing-section-number">05</span> STEP INSIDE THE WORK</p><h2 id="live-title">Not a mockup.<br />A real <em>preview.</em></h2><p>Explore a working template in the browser. Follow the page and see a real starting point before you choose it.</p><Link to={`/demo/${template.id}`} target="_blank" rel="noopener noreferrer" className="marketing-inline-link">Open the {template.name} preview <ArrowUpRight size={15} /></Link><span className="marketing-live-note">ILLUSTRATIVE PRODUCT WALKTHROUGH / REAL TEMPLATE PREVIEW</span></div><div className="marketing-live-window" data-reveal><div className="marketing-live-chrome"><span className="marketing-window-dots" aria-hidden="true"><i /><i /><i /></span><span>buildoura.com / demo / {template.id}</span><span className="marketing-live-indicator"><i /> LIVE PREVIEW</span></div><iframe src={`/demo/${template.id}`} title={`${template.name} interactive website template preview`} loading="lazy" /></div></section>
}

export function Benefits() {
  return <section className="marketing-benefits" aria-labelledby="benefits-title"><div className="marketing-benefits-heading" data-reveal><p className="marketing-eyebrow">06 / BUILT FOR THE FIRST STEP</p><h2 id="benefits-title">A real website.<br /><em>Not a dead end.</em></h2><span>Make room for the idea you haven’t had yet.</span></div><div className="marketing-benefits-list" data-stagger><p><b>01</b> Start with a finished design, not an empty canvas.</p><p><b>02</b> Work on your actual site content with a live preview.</p><p><b>03</b> Shape the details without losing the design’s point of view.</p><p><b>04</b> Keep going with export options available through your account.</p><Link to="/pricing" className="marketing-inline-link">See plans and options <ArrowUpRight size={15} /></Link></div><span className="marketing-benefits-sheen" aria-hidden="true" /><span className="marketing-benefits-check" aria-hidden="true"><Check size={18} /></span></section>
}

export function FinalCallToAction() {
  return <section className="marketing-finale" aria-labelledby="finale-title"><div className="marketing-finale-topline"><span>07 / YOUR NEXT MOVE</span><span>THE INTERNET HAS ROOM FOR YOUR IDEA</span></div><div className="marketing-finale-content" data-reveal><p className="marketing-eyebrow">THE FIRST STEP IS YOURS</p><h2 id="finale-title">YOUR IDEAS.<br /><em>YOUR DESIGN.</em><br />YOUR WEBSITE.</h2><div className="marketing-finale-bottom"><p>Start with a spark.<br />See where it takes you.</p><Link to="/signup" className="marketing-button marketing-button-primary">Start building <ArrowUpRight size={17} /></Link></div></div><div className="marketing-finale-orbit" aria-hidden="true"><span /><span /><span /></div><span className="finale-coordinate" aria-hidden="true">B / OURA — EST. FOR WHAT&apos;S NEXT</span></section>
}

export function MarketingFooter() {
  return <footer className="marketing-footer"><Link to="/" className="marketing-brand" aria-label="Buildoura home"><span className="marketing-brand-mark">B</span><span>BUILDoura</span></Link><span className="marketing-footer-line">A good idea deserves a great website.</span><nav aria-label="Footer navigation"><Link to="/templates">Templates</Link><Link to="/pricing">Pricing</Link><Link to="/login">Sign in</Link></nav><a href="#main-content" className="marketing-back-top" aria-label="Back to top"><ArrowUpRight size={18} /></a></footer>
}
