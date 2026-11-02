import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = [
  { to: '/templates', label: 'Templates' },
  { to: '/#features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
]

export function PublicHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white" onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}>
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Buildoura home" className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight text-navy">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-sm text-white">B</span>
          <span>Buildoura</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          {links.map((link) => link.to.includes('#') ? <a key={link.to} href={link.to} className="hover:text-navy">{link.label}</a> : <Link key={link.to} to={link.to} className="hover:text-navy">{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-navy">Sign in</Link>
          <Link to="/signup" className="hidden rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 sm:inline-flex">Get started</Link>
          <button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="public-mobile-nav" onClick={() => setOpen((value) => !value)} className="rounded-lg p-2 text-navy hover:bg-slate-100 md:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && <nav id="public-mobile-nav" aria-label="Mobile navigation" className="border-t border-slate-100 px-4 py-3 md:hidden">
        {[...links, { to: '/signup', label: 'Get started' }].map((link) => link.to.includes('#') ? <a key={link.to} href={link.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">{link.label}</a> : <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">{link.label}</Link>)}
      </nav>}
    </header>
  )
}
