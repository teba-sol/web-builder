import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { AuraArtwork, AuraExperience } from './landing/AuraExperience'

export const authFieldClass =
  'mt-1.5 h-12 w-full rounded-lg border border-[#c6bfb8] bg-white/60 px-3.5 text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#775888] focus:ring-2 focus:ring-[#775888]/20 disabled:bg-slate-50 disabled:text-slate-500'
export const authButtonClass =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#19151d] px-5 py-3 text-sm font-semibold text-[#eeeae3] hover:bg-[#3c2c46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60'

export function AuthShell({ title, subtitle, children }: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} — Buildoura`
    return () => { document.title = previous }
  }, [title])

  const adminOrigin = import.meta.env.VITE_ADMIN_ORIGIN || 'http://localhost:5174'
  return (
    <AuraExperience>
      {({ paused }) => <main id="aura-inner-main" className="aura-auth-layout">
        <aside className="aura-auth-editorial">
          <Link to="/" className="aura-auth-back"><ArrowLeft size={14} /> Back to the studio</Link>
          <div className="aura-auth-statement" data-aura-intro>
            <p className="aura-kicker">A little imagination. A new dimension.</p>
            <h2>Good things<br />start with<br /><em>you.</em></h2>
          </div>
          <AuraArtwork paused={paused} />
          <div className="aura-auth-caption"><span>YOUR IDEAS. YOUR SPACE.</span><p>A starting point for the next<br />version of your online world.</p></div>
        </aside>
        <div className="aura-auth-panel">
          <section className="aura-auth-card" aria-labelledby="auth-title">
            <p className="aura-auth-eyebrow">THE NEXT CHAPTER</p>
            <h1 id="auth-title">{title}</h1>
            <p className="aura-auth-subtitle">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </section>
          <p className="aura-auth-portal">Managing an agency? <a href={adminOrigin}>Agency portal <ExternalLink size={12} /></a></p>
        </div>
      </main>}
    </AuraExperience>
  )
}
