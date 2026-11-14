import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUpRight, MoveUpRight, Plus } from 'lucide-react'
import { getTemplateThumbnail } from '../../catalog/thumbnails'
import type { TemplateMeta } from '../../types'

export function MarketingHero({ templates }: { templates: TemplateMeta[] }) {
  const lead = templates[0]
  const supporting = templates.slice(1, 3)
  const leadThumbnail = lead ? getTemplateThumbnail(lead.id) : undefined

  return (
    <section className="marketing-hero" aria-labelledby="marketing-hero-title">
      <div className="marketing-hero-grain" aria-hidden="true" />
      <div className="marketing-hero-orbit marketing-hero-orbit-one" aria-hidden="true" />
      <div className="marketing-hero-orbit marketing-hero-orbit-two" aria-hidden="true" />
      <div className="marketing-hero-copy">
        <p className="marketing-eyebrow" data-hero-line><span className="marketing-eyebrow-dot" /> YOUR NEXT IDEA, ONLINE</p>
        <h1 id="marketing-hero-title">
          <span className="hero-line-wrap"><span data-hero-line>DON&apos;T JUST</span></span>
          <span className="hero-line-wrap hero-line-indent"><span data-hero-line>IMAGINE <em>IT.</em></span></span>
          <span className="hero-line-wrap hero-line-last"><span data-hero-line>BUILD <i>IT.</i></span></span>
        </h1>
        <div className="marketing-hero-bottom" data-hero-line>
          <p>Your ideas deserve more than a template. Create, customize, and launch beautiful websites with BUILDoura.</p>
          <div className="marketing-hero-actions">
            <Link to="/signup" className="marketing-button marketing-button-primary">Start building <ArrowUpRight size={17} /></Link>
            <a href="#templates" className="marketing-quiet-link">Explore the possibilities <ArrowRight size={16} /></a>
          </div>
        </div>
      </div>

      <div className="marketing-hero-art" aria-label="A collection of real BUILDoura website previews">
        <span className="hero-art-caption" aria-hidden="true">A canvas for every kind of idea <Plus size={12} /></span>
        {supporting.map((template, index) => {
          const thumbnail = getTemplateThumbnail(template.id)
          return thumbnail ? (
            <Link key={template.id} to={`/demo/${template.id}`} target="_blank" rel="noopener noreferrer"
              className={`marketing-float-window marketing-float-window-${index}`} data-float={index} data-depth
              aria-label={`Open the ${template.name} website preview in a new tab`}>
              <span className="marketing-window-bar"><span className="marketing-window-dots" aria-hidden="true"><i /><i /><i /></span><span>{template.name}</span><ArrowUpRight size={12} /></span>
              <img src={thumbnail} alt={`${template.name} website design`} loading="lazy" />
            </Link>
          ) : null
        })}
        {lead && leadThumbnail ? (
          <Link to={`/demo/${lead.id}`} target="_blank" rel="noopener noreferrer" className="marketing-hero-window" data-hero-window data-depth
            aria-label={`Open the ${lead.name} website preview in a new tab`}>
            <span className="marketing-window-bar"><span className="marketing-window-dots" aria-hidden="true"><i /><i /><i /></span><span>{lead.name} / live preview</span><MoveUpRight size={13} /></span>
            <img src={leadThumbnail} alt={`${lead.name} website preview`} fetchPriority="high" />
            <span className="marketing-preview-label"><span /> REAL WEBSITE DESIGN <b>OPEN PREVIEW <ArrowUpRight size={12} /></b></span>
          </Link>
        ) : <div className="marketing-hero-empty">Your idea starts here.<Link to="/templates">Explore designs <ArrowRight size={15} /></Link></div>}
        <span className="hero-orbit-object hero-orbit-object-orange" data-hero-object data-depth aria-hidden="true" />
        <span className="hero-orbit-object hero-orbit-object-blue" data-hero-object data-depth aria-hidden="true" />
        <span className="hero-object-label" data-hero-object aria-hidden="true">01 / MAKE IT YOURS</span>
      </div>

      <div className="marketing-hero-foot"><a className="marketing-scroll-cue" href="#proof"><ArrowDown size={14} /> Scroll to explore</a><span>IDEAS, MEET THE INTERNET <b>↘</b></span></div>
    </section>
  )
}
