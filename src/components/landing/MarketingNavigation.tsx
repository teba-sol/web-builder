import { Link } from 'react-router-dom'
import { ArrowUpRight, Menu, Pause, Play } from 'lucide-react'
import { AuraThemeToggle } from './AuraThemeToggle'

interface MarketingNavigationProps {
  motion: boolean
  reduced: boolean
  onToggleMotion: () => void
}

export function MarketingNavigation({ motion, reduced, onToggleMotion }: MarketingNavigationProps) {
  return (
    <header className="marketing-nav">
      <Link to="/" className="marketing-brand" aria-label="Buildoura home">
        <span className="marketing-brand-mark">B</span>
        <span>buildoura</span>
      </Link>

      <nav aria-label="Main navigation" className="marketing-nav-links">
        <a href="#templates">Templates</a>
        <a href="#how-it-works">How it works</a>
        <Link to="/pricing">Pricing</Link>
      </nav>

      <div className="marketing-nav-actions">
        <AuraThemeToggle />
        <button
          type="button"
          className="marketing-motion-toggle"
          onClick={onToggleMotion}
          disabled={reduced}
          aria-pressed={!motion}
          aria-label={reduced ? 'Reduced motion enabled' : motion ? 'Pause motion' : 'Enable motion'}
          title={reduced ? 'Reduced motion enabled' : motion ? 'Pause motion' : 'Enable motion'}
        >
          {motion ? <Pause size={14} /> : <Play size={14} />}
          <span>{motion ? 'Motion on' : 'Motion off'}</span>
        </button>
        <Link to="/login" className="marketing-sign-in">Sign in</Link>
        <Link to="/signup" className="marketing-nav-cta">
          Start building <ArrowUpRight size={15} />
        </Link>
        <details className="marketing-menu">
          <summary aria-label="Open navigation menu"><Menu size={20} /></summary>
          <nav aria-label="Mobile navigation">
            <a href="#templates">Templates</a>
            <a href="#how-it-works">How it works</a>
            <Link to="/pricing">Pricing</Link>
            <Link to="/login">Sign in</Link>
            <Link to="/signup">Start building</Link>
          </nav>
        </details>
      </div>
    </header>
  )
}
