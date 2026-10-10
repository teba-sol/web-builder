import { Link } from 'react-router-dom'

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold">Buildoura</p>
          <p className="mt-1 text-sm text-white/70">Websites for agencies and personal brands.</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm text-white/80">
          <Link to="/" className="hover:text-white">Home</Link>
          <a href="/#templates" className="hover:text-white">Templates</a>
          <Link to="/about" className="hover:text-white">About</Link>
          <Link to="/pricing" className="hover:text-white">Pricing</Link>
          <Link to="/login" className="hover:text-white">Sign in</Link>
        </nav>
      </div>
    </footer>
  )
}
