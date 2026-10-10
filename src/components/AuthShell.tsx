import { Link } from 'react-router-dom'
import { BrowserFrame } from './landing/BrowserFrame'
import { showcaseSites } from './landing/sites'

export const authFieldClass =
  'mt-2 w-full border-0 border-b border-navy/20 bg-transparent px-0 py-2.5 text-navy outline-none transition placeholder:text-navy/30 focus:border-accent'
export const authButtonClass =
  'mt-2 text-[12px] font-semibold uppercase tracking-[0.24em] text-accent disabled:opacity-50'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  const peek = showcaseSites().find((s) => s.id === 'hotel') ?? showcaseSites()[0]
  const adminOrigin = import.meta.env.VITE_ADMIN_ORIGIN || 'http://localhost:5174'

  return (
    <div className="landing min-h-screen bg-[#f6f7fb] text-navy lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        {peek && (
          <div className="pointer-events-none absolute -right-[18%] bottom-[8%] w-[72%] rotate-8 opacity-30">
            <BrowserFrame src={peek.src} alt="" compact />
          </div>
        )}
        <Link to="/" className="relative text-[13px] font-semibold uppercase tracking-[0.18em]">
          BuildAura
        </Link>
        <div className="relative max-w-lg">
          <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Template studio</p>
          <h2 className="font-display mt-4 text-[clamp(2.4rem,calc((50vw-5rem)/9.2),4.4rem)]">
            Start
            <br />
            from
            <br />
            designed.
          </h2>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-white/65">
            Pick a template, make it yours, and publish a real website.
          </p>
          <ul className="mt-12 max-w-sm space-y-6 text-[11px] uppercase tracking-[0.22em] text-white/55">
            <li>
              <span className="text-accent">01</span>
              <span className="ml-4 text-white">Personal — one site, one payment</span>
            </li>
            <li>
              <span className="text-accent">02</span>
              <span className="ml-4 text-white">Agency — contact us</span>
            </li>
            <li>
              <span className="text-accent">03</span>
              <span className="ml-4 text-white">Cloud save after unlock</span>
            </li>
          </ul>
        </div>
        <p className="relative text-[10px] uppercase tracking-[0.22em] text-white/40">
          Agency portal · {adminOrigin.replace(/^https?:\/\//, '')}
        </p>
      </div>

      <div className="flex min-h-screen flex-col px-6 py-10 md:px-12 md:py-16">
        <Link
          to="/"
          className="mb-16 text-[13px] font-semibold uppercase tracking-[0.18em] text-navy lg:hidden"
        >
          BuildAura
        </Link>
        <div className="mx-auto w-full max-w-md flex-1">
          <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Account</p>
          <h1 className="font-display mt-3 text-[clamp(2rem,calc(100%/7.6),3.25rem)]">{title}</h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy/55">{subtitle}</p>
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  )
}
