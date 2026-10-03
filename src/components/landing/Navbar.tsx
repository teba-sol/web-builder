import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useLenis } from './lenisContext'

const links = [
  { href: '/#templates', hash: '#templates', label: 'Templates' },
  { href: '/#features', hash: '#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing', route: true },
]

export function Navbar() {
  const lenis = useLenis()
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    if (!href.startsWith('#')) return
    const target = document.querySelector(href)
    if (target && lenis) lenis.scrollTo(target as HTMLElement, { offset: 0 })
    else if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 mix-blend-difference transition-colors ${
          solid ? 'bg-transparent' : ''
        }`}
      >
        <nav className="flex items-center justify-between px-4 py-4 text-white md:px-8 pt-[max(1rem,env(safe-area-inset-top))]">
          <Link to="/" className="text-[13px] font-semibold tracking-[0.18em] uppercase">
            BuildAura
          </Link>
          <div className="hidden items-center gap-8 text-[11px] font-medium uppercase tracking-[0.22em] md:flex">
            {links.map((link) => (
              <NavItem
                key={link.href}
                link={link}
                onHome={onHome}
                active={Boolean(link.route && pathname === link.href)}
                onHash={go}
              />
            ))}
          </div>
          <div className="flex items-center gap-5 text-[11px] font-medium uppercase tracking-[0.22em]">
            <Link to="/login" className="hidden opacity-80 hover:opacity-100 sm:inline">
              Sign In
            </Link>
            <Link to="/signup" className="opacity-100">
              Start Building
            </Link>
            <button
              type="button"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] bg-navy px-6 pt-6 text-white md:hidden">
          <div className="mb-12 flex items-center justify-between">
            <p className="text-[13px] font-semibold tracking-[0.18em] uppercase">BuildAura</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-6 text-3xl font-medium tracking-tight">
            {links.map((link) => (
              <NavItem
                key={link.href}
                link={link}
                onHome={onHome}
                active={Boolean(link.route && pathname === link.href)}
                onHash={go}
                onNavigate={() => setOpen(false)}
                className="text-left"
              />
            ))}
            <Link to="/login" onClick={() => setOpen(false)}>
              Sign In
            </Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="text-accent">
              Start Building
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

type NavLinkDef = (typeof links)[number]

function NavItem({
  link,
  onHome,
  active,
  onHash,
  onNavigate,
  className = '',
}: {
  link: NavLinkDef
  onHome: boolean
  active?: boolean
  onHash: (href: string) => void
  onNavigate?: () => void
  className?: string
}) {
  const tone = active ? 'opacity-100' : 'opacity-80 hover:opacity-100'
  if (link.route) {
    return (
      <Link to={link.href} onClick={onNavigate} className={`${tone} ${className}`}>
        {link.label}
      </Link>
    )
  }
  if (onHome && link.hash) {
    return (
      <button type="button" onClick={() => onHash(link.hash)} className={`${tone} ${className}`}>
        {link.label}
      </button>
    )
  }
  return (
    <Link to={link.href} onClick={onNavigate} className={`${tone} ${className}`}>
      {link.label}
    </Link>
  )
}
