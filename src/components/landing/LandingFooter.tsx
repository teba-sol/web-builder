import { Link } from 'react-router-dom'

export function LandingFooter() {
  return (
    <footer className="relative mx-auto mt-28 flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-[10px] uppercase tracking-[0.22em] text-white/40 sm:flex-row sm:items-center">
      <p>BuildAura</p>
      <div className="flex flex-wrap gap-6">
        <Link to="/#templates" className="hover:text-white">
          Templates
        </Link>
        <Link to="/pricing" className="hover:text-white">
          Pricing
        </Link>
        <Link to="/login" className="hover:text-white">
          Sign in
        </Link>
      </div>
    </footer>
  )
}
