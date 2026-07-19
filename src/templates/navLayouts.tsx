import { Link } from 'react-router-dom'
import type { SiteNavItem } from '../data/siteNav'
import { resolveSiteHref, sitePath } from '../data/siteNav'
import type { SiteContent, TemplateId } from '../types'
import type { TemplateTheme } from './themes'

/** @deprecated Use template id directly — kept for older export call sites */
export type NavLayoutId = TemplateId

export function getNavLayoutId(templateId: TemplateId): NavLayoutId {
  return templateId
}

interface NavProps {
  c: SiteContent
  t: TemplateTheme
  variant: TemplateId
  navItems: SiteNavItem[]
  basePath: string
}

function NavLinks({ items, t, basePath, className = '' }: { items: SiteNavItem[]; t: TemplateTheme; basePath: string; className?: string }) {
  return (
    <>
      {items.map((item) => (
        <Link key={item.page} to={sitePath(basePath, item.segment)} className={`${t.navLink} ${className}`}>
          {item.label}
        </Link>
      ))}
    </>
  )
}

export function TemplateNav({ c, t, variant, navItems, basePath }: NavProps) {
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact', c)
  const pageLinks = navItems.filter((i) => i.page !== 'home')
  const half = Math.ceil(pageLinks.length / 2)
  const leftLinks = pageLinks.slice(0, half)
  const rightLinks = pageLinks.slice(half)

  switch (variant) {
    case 'creative':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link to={basePath} className="text-lg font-black uppercase tracking-widest text-white">{c.businessName}</Link>
            <div className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    case 'restaurant':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 px-6 py-5">
            <div className="hidden flex-1 gap-6 text-sm lg:flex">
              <NavLinks items={leftLinks} t={t} basePath={basePath} />
            </div>
            <Link to={basePath} className="px-6 text-center font-serif text-2xl font-semibold text-white">{c.businessName}</Link>
            <div className="flex flex-1 items-center justify-end gap-6 text-sm">
              <div className="hidden gap-6 lg:flex">
                <NavLinks items={rightLinks} t={t} basePath={basePath} />
              </div>
              <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
            </div>
          </div>
        </nav>
      )

    case 'saas':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="text-lg font-bold">{c.businessName}</Link>
            <div className="hidden items-center gap-1 text-sm lg:flex">
              {pageLinks.map((item, i) => (
                <span key={item.page} className="flex items-center gap-1">
                  {i > 0 && <span className="mx-2 opacity-30">·</span>}
                  <Link to={sitePath(basePath, item.segment)} className={t.navLink}>{item.label}</Link>
                </span>
              ))}
            </div>
            <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    case 'fitness':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="text-xl font-bold uppercase tracking-wide text-white">{c.businessName}</Link>
            <div className="hidden gap-7 text-sm font-medium uppercase tracking-wide lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} className={t.navCta}>{c.ctaText} →</Link>
          </div>
        </nav>
      )

    case 'boutique':
      return (
        <nav className={`${t.nav} relative`}>
          <div className="mx-auto max-w-6xl px-6 py-6 text-center">
            <Link to={basePath} className="font-serif text-2xl font-light tracking-wide">{c.businessName}</Link>
            <div className="mt-4 hidden flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <div className="mt-4 lg:absolute lg:right-6 lg:top-6 lg:mt-0">
              <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
            </div>
          </div>
        </nav>
      )

    case 'realtor':
      return (
        <nav className={t.nav}>
          <div className="mx-auto max-w-6xl border-b border-amber-600/30 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Link to={basePath} className="text-lg font-bold uppercase tracking-wide text-white">{c.businessName}</Link>
                <p className="mt-0.5 text-xs uppercase tracking-widest text-amber-400/80">Luxury Real Estate</p>
              </div>
              <div className="hidden items-center gap-8 text-sm lg:flex">
                <NavLinks items={pageLinks} t={t} basePath={basePath} />
              </div>
              <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
            </div>
          </div>
        </nav>
      )

    case 'photography':
      return (
        <nav className={`${t.nav} border-b border-white/10`}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link to={basePath} className="text-sm font-light uppercase tracking-[0.3em] text-white">{c.businessName}</Link>
            <div className="hidden gap-10 text-xs uppercase tracking-widest lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} className={`${t.navCta} text-xs uppercase tracking-wider`}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    case 'medical':
      return (
        <nav className={t.nav}>
          <div className="border-b border-teal-100 bg-teal-50/80 px-6 py-1.5 text-center text-xs font-medium text-teal-800">
            Compassionate care · Same-week appointments
          </div>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="text-lg font-semibold text-teal-900">{c.businessName}</Link>
            <div className="hidden gap-6 text-sm font-medium lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    case 'lawfirm':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-5">
            <Link to={basePath} className="shrink-0 font-serif text-xl font-semibold">{c.businessName}</Link>
            <div className="hidden h-8 w-px bg-stone-300 lg:block" aria-hidden />
            <div className="hidden flex-1 items-center justify-between lg:flex">
              <div className="flex gap-8 text-sm">
                <NavLinks items={pageLinks} t={t} basePath={basePath} />
              </div>
              <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
            </div>
          </div>
        </nav>
      )

    case 'salon':
      return (
        <nav className={t.nav}>
          <div className="mx-auto max-w-6xl px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="hidden flex-1 justify-end gap-6 text-sm lg:flex">
                <NavLinks items={leftLinks} t={t} basePath={basePath} />
              </div>
              <Link to={basePath} className="font-serif text-2xl font-light tracking-wide text-pink-900">{c.businessName}</Link>
              <div className="flex flex-1 items-center justify-end gap-6 text-sm">
                <div className="hidden gap-6 lg:flex">
                  <NavLinks items={rightLinks} t={t} basePath={basePath} />
                </div>
                <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
              </div>
            </div>
          </div>
        </nav>
      )

    case 'noir':
      return (
        <nav className={`${t.nav} border-b border-amber-500/40`}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="font-serif text-lg font-semibold uppercase tracking-[0.2em] text-amber-100">{c.businessName}</Link>
            <div className="hidden gap-8 text-xs font-semibold uppercase tracking-widest lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    case 'terra':
      return (
        <nav className={t.nav}>
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center justify-between gap-4 rounded-full border border-orange-200 bg-orange-50/90 px-6 py-3 shadow-sm">
              <Link to={basePath} className="text-lg font-bold text-orange-950">{c.businessName}</Link>
              <div className="hidden gap-6 text-sm font-medium lg:flex">
                <NavLinks items={pageLinks} t={t} basePath={basePath} />
              </div>
              <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
            </div>
          </div>
        </nav>
      )

    case 'coastal':
      return (
        <nav className={t.nav}>
          <div className="mx-auto max-w-6xl border-b-2 border-sky-300/50 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <Link to={basePath} className="text-xl font-bold text-sky-950">
                <span className="border-b-2 border-sky-400 pb-0.5">{c.businessName}</span>
              </Link>
              <div className="hidden gap-7 text-sm font-medium text-sky-900 lg:flex">
                <NavLinks items={pageLinks} t={t} basePath={basePath} />
              </div>
              <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
            </div>
          </div>
        </nav>
      )

    case 'vineyard':
      return (
        <nav className={t.nav}>
          <div className="mx-auto max-w-6xl px-6 py-5">
            <div className="flex items-center justify-between border-b border-rose-900/20 pb-4">
              <Link to={basePath} className="font-serif text-2xl font-semibold text-rose-950">{c.businessName}</Link>
              <div className="hidden items-center gap-8 text-sm lg:flex">
                <NavLinks items={pageLinks} t={t} basePath={basePath} />
                <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
              </div>
            </div>
          </div>
        </nav>
      )

    case 'arcade':
      return (
        <nav className={`${t.nav} border-b-2 border-lime-400/60 shadow-[0_4px_24px_rgba(163,230,53,0.15)]`}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="text-lg font-black uppercase tracking-wider text-lime-300">{c.businessName}</Link>
            <div className="hidden gap-6 text-xs font-bold uppercase tracking-widest lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    case 'coffee':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <Link to={basePath} className="font-serif text-2xl font-semibold tracking-tight text-[#2d1810]">{c.businessName}</Link>
            <div className="hidden items-center gap-8 text-sm lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    default:
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="text-xl font-bold">{c.businessName}</Link>
            <div className="hidden gap-6 text-sm font-medium lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
          </div>
        </nav>
      )
  }
}