import { AuraThemeToggle } from './AuraThemeToggle'
import { useAuraTheme } from '../../hooks/useAuraTheme'
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { useAuth } from '../../auth/AuthContext'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { AppHeader } from '../AppHeader'
import { SmoothScroll } from './SmoothScroll'
import { AuraHeader } from './AuraHeader'
import '../../pages/LandingPage.css'
import './AuraExperience.css'

const Sculpture = lazy(() => import('./AuraSculpture'))

export function AuraArtwork({ paused }: { paused: boolean }) {
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow('(max-width: 767px)')
  return <div className="aura-inner-art" aria-hidden="true"><div className="aura-orbit-fallback" />{!reduced && !narrow && <Suspense fallback={null}><Sculpture paused={paused} /></Suspense>}</div>
}

export function AuraExperience({ children, smooth = false, workspaceHeader = false }: {
  children: (state: { paused: boolean }) => ReactNode
  smooth?: boolean
  workspaceHeader?: boolean
}) {
  const { theme } = useAuraTheme()
  const { user, loading } = useAuth()
  const root = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow('(max-width: 767px)')
  const [paused, setPaused] = useState(false)
  const motion = !reduced && !paused
  const signedInHeader = workspaceHeader && (Boolean(user) || loading)

  useEffect(() => {
    if (!motion) return
    const context = gsap.context(() => {
      gsap.fromTo('[data-aura-intro]', { y: 24, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out' })
    }, root)
    return () => context.revert()
  }, [motion])

  return (
    <SmoothScroll enabled={smooth && motion && !narrow}>
      <div ref={root} className={`aura-page aura-inner-page ${signedInHeader ? 'aura-with-workspace-header' : ''}`} data-theme={theme} data-motion={motion ? 'on' : 'off'}>
        <a href="#aura-inner-main" className="aura-skip">Skip to content</a>
        {signedInHeader ? <AppHeader /> : <AuraHeader motion={motion} reduced={reduced} onToggleMotion={() => setPaused((value) => !value)} />}
        {signedInHeader && <div className="aura-workspace-motion"><AuraThemeToggle /><button type="button" disabled={reduced} aria-pressed={!motion} onClick={() => setPaused((value) => !value)}>{motion ? 'Pause motion' : 'Motion off'}</button></div>}
        {children({ paused: !motion })}
        <footer className="aura-footer aura-inner-footer"><Link to="/" className="aura-logo"><span>B</span>buildoura</Link><span>Made for what’s next.</span><nav aria-label="Footer navigation"><Link to="/templates">Templates</Link><Link to="/pricing">Pricing</Link><Link to={user ? '/account' : '/login'}>{user ? 'My profile' : 'Sign in'}</Link></nav><Link to={user ? '/' : '/signup'} aria-label={user ? 'Open workspace' : 'Create account'}><ArrowUpRight size={20} /></Link></footer>
      </div>
    </SmoothScroll>
  )
}
