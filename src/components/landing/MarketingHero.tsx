import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react'
import { getTemplateThumbnail } from '../../catalog/thumbnails'
import type { TemplateMeta } from '../../types'

export function MarketingHero({ templates }: { templates: TemplateMeta[] }) {
  const lead = templates[0]
  const supporting = templates.slice(1, 3)
  const leadThumbnail = lead ? getTemplateThumbnail(lead.id) : undefined

  return (
    <section className="marketing-hero" aria-labelledby="marketing-hero-title">
      <div className="marketing-hero-glow" aria-hidden="true" />
      <div className="marketing-hero-grid" aria-hidden="true" />
      <div className="marketing-hero-copy">
        <p className="marketing-eyebrow" data-hero-line>
          <span className="marketing-eyebrow-dot" /> YOUR IDEA, WITH ROOM TO GROW
        </p>
        <h1 id="marketing-hero-title">
          <span data-hero-line>Your vision.</span>
          <span data-hero-line><em>Your website.</em></span>
          <span data-hero-line>Your way.</span>
        </h1>
        <div className="marketing-hero-bottom" data-hero-line>
          <p>Start with a design that gets you. Make it yours in a live editor, then take your website further.</p>
          <div className="marketing-hero-actions">
            <Link to="/signup" className="marketing-button marketing-button-primary">
              Start building <ArrowUpRight size={17} />
            </Link>
            <a href="#templates" className="marketing-quiet-link">
              Explore templates <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="marketing-hero-art" aria-label="A selection of BUILDoura website designs">
        {supporting.map((template, index) => {
          const thumbnail = getTemplateThumbnail(template.id)
          return thumbnail ? (
            <Link
              key={template.id}
              to={`/demo/${template.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`marketing-float-window marketing-float-window-${index}`}
              data-float={index}
              aria-label={`Open the ${template.name} website preview in a new tab`}
            >
              <span className="marketing-window-bar">
                <span className="marketing-window-dots" aria-hidden="true"><i /><i /><i /></span>
                <span>{template.name}</span>
                <ArrowUpRight size={12} />
              </span>
              <img src={thumbnail} alt={`${template.name} website design`} loading="lazy" />
            </Link>
          ) : null
        })}
        {lead && leadThumbnail ? (
          <Link
            to={`/demo/${lead.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="marketing-hero-window"
            data-hero-window
            aria-label={`Open the ${lead.name} website preview in a new tab`}
          >
            <span className="marketing-window-bar">
              <span className="marketing-window-dots" aria-hidden="true"><i /><i /><i /></span>
              <span>{lead.name} / website preview</span>
              <MoveUpRight size={13} />
            </span>
            <img src={leadThumbnail} alt={`${lead.name} template preview`} fetchPriority="high" />
            <span className="marketing-preview-label"><span /> REAL TEMPLATE <b>OPEN PREVIEW <ArrowUpRight size={12} /></b></span>
          </Link>
        ) : (
          <div className="marketing-hero-empty">Find a design that feels like you.<Link to="/templates">Explore templates <ArrowRight size={15} /></Link></div>
        )}
      </div>

      <a className="marketing-scroll-cue" href="#proof"><ArrowDown size={14} /> Scroll to see what you can make</a>
      <span className="marketing-hero-index" aria-hidden="true">B / 01—10</span>
    </section>
  )
}
