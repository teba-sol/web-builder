import { AuraThemeToggle } from './AuraThemeToggle'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Menu, Pause, Play } from 'lucide-react'

export function AuraHeader({ motion, reduced, onToggleMotion }: {
  motion: boolean
  reduced: boolean
  onToggleMotion: () => void
}) {
  return (
    <header className="aura-nav">
      <Link to="/" aria-label="Buildoura home" className="aura-logo"><span>B</span>buildoura<span className="aura-logo-dot">↗</span></Link>
      <nav aria-label="Main navigation" className="aura-nav-links"><Link to="/templates">Selected designs</Link><a href="/#features">The experience</a><Link to="/pricing">Pricing</Link></nav>
      <div className="aura-nav-actions">
        <AuraThemeToggle />
        <button type="button" onClick={onToggleMotion} disabled={reduced} aria-pressed={!motion} aria-label={reduced ? 'Reduced motion enabled' : motion ? 'Pause motion' : 'Enable motion'} title={reduced ? 'Reduced motion enabled' : motion ? 'Pause motion' : 'Enable motion'} className="aura-motion">{motion ? <Pause size={14} /> : <Play size={14} />}<span>{motion ? 'Motion on' : 'Motion off'}</span></button>
        <Link to="/login" className="aura-sign-in">Sign in</Link>
        <Link to="/signup" className="aura-nav-cta">Let’s build <ArrowUpRight size={16} /></Link>
        <details className="aura-mobile-menu"><summary aria-label="Navigation menu"><Menu size={20} /></summary><nav aria-label="Mobile navigation"><Link to="/templates">Templates</Link><a href="/#features">The experience</a><Link to="/pricing">Pricing</Link><Link to="/login">Sign in</Link></nav></details>
      </div>
    </header>
  )
}
