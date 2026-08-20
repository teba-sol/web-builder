import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { brandCtaStyle } from '../data/brand'
import { getNavShellId } from '../catalog/catalog'
import type { SiteNavItem } from '../data/siteNav'
import { resolveSiteHref, sitePath } from '../data/siteNav'
import type { SiteContent, TemplateId } from '../types'
import type { TemplateTheme } from './themes'

/** @deprecated Use getNavShellId — kept for older export call sites */
export type NavLayoutId = string

export function getNavLayoutId(templateId: TemplateId): NavLayoutId {
  return getNavShellId(templateId)
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
  const ctaStyle = brandCtaStyle(c)
  const pageLinks = navItems.filter((i) => i.page !== 'home')
  const half = Math.ceil(pageLinks.length / 2)
  const leftLinks = pageLinks.slice(0, half)
  const rightLinks = pageLinks.slice(half)

  switch (getNavShellId(variant)) {
    case 'creative':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link to={basePath} className="text-lg font-black uppercase tracking-widest text-white"><BrandMark c={c} /></Link>
            <div className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
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
            <Link to={basePath} className="px-6 text-center font-serif text-2xl font-semibold text-white"><BrandMark c={c} /></Link>
            <div className="flex flex-1 items-center justify-end gap-6 text-sm">
              <div className="hidden gap-6 lg:flex">
                <NavLinks items={rightLinks} t={t} basePath={basePath} />
              </div>
              <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
            </div>
          </div>
        </nav>
      )

    case 'saas':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="text-lg font-bold"><BrandMark c={c} /></Link>
            <div className="hidden items-center gap-1 text-sm lg:flex">
              {pageLinks.map((item, i) => (
                <span key={item.page} className="flex items-center gap-1">
                  {i > 0 && <span className="mx-2 opacity-30">·</span>}
                  <Link to={sitePath(basePath, item.segment)} className={t.navLink}>{item.label}</Link>
                </span>
              ))}
            </div>
            <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    case 'fitness':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="text-xl font-bold uppercase tracking-wide text-white"><BrandMark c={c} /></Link>
            <div className="hidden gap-7 text-sm font-medium uppercase tracking-wide lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText} →</Link>
          </div>
        </nav>
      )

    case 'boutique':
      return (
        <nav className={`${t.nav} relative`}>
          <div className="mx-auto max-w-6xl px-6 py-6 text-center">
            <Link to={basePath} className="font-serif text-2xl font-light tracking-wide"><BrandMark c={c} /></Link>
            <div className="mt-4 hidden flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <div className="mt-4 lg:absolute lg:right-6 lg:top-6 lg:mt-0">
              <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
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
                <Link to={basePath} className="text-lg font-bold uppercase tracking-wide text-white"><BrandMark c={c} /></Link>
                <p className="mt-0.5 text-xs uppercase tracking-widest text-amber-400/80">Luxury Real Estate</p>
              </div>
              <div className="hidden items-center gap-8 text-sm lg:flex">
                <NavLinks items={pageLinks} t={t} basePath={basePath} />
              </div>
              <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
            </div>
          </div>
        </nav>
      )

    case 'photography':
      return (
        <nav className={`${t.nav} border-b border-white/10`}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link to={basePath} className="text-sm font-light uppercase tracking-[0.3em] text-white"><BrandMark c={c} /></Link>
            <div className="hidden gap-10 text-xs uppercase tracking-widest lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} data-brand-cta className={`${t.navCta} text-xs uppercase tracking-wider`} style={ctaStyle}>{c.ctaText}</Link>
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
            <Link to={basePath} className="text-lg font-semibold text-teal-900"><BrandMark c={c} /></Link>
            <div className="hidden gap-6 text-sm font-medium lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    case 'lawfirm':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-5">
            <Link to={basePath} className="shrink-0 font-serif text-xl font-semibold"><BrandMark c={c} /></Link>
            <div className="hidden h-8 w-px bg-stone-300 lg:block" aria-hidden />
            <div className="hidden flex-1 items-center justify-between lg:flex">
              <div className="flex gap-8 text-sm">
                <NavLinks items={pageLinks} t={t} basePath={basePath} />
              </div>
              <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
            </div>
          </div>
        </nav>
      )

    case 'cpa':
      return (
        <div>
          <div className="text-xs text-[#DDEBD0]" style={{ backgroundColor: 'var(--clone-ink, #0F211C)' }}>
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2.5 sm:flex-row">
              <div className="flex items-center gap-6">
                {c.phone ? <a href={`tel:${c.phone}`} className="hover:text-[#A8D93F]">{c.phone}</a> : null}
                {c.email ? <span className="hidden md:inline">{c.email}</span> : null}
                {c.hours ? <span className="hidden lg:inline">{c.hours}</span> : null}
              </div>
            </div>
          </div>
          <nav className="sticky top-0 z-40 border-b border-white/10 shadow-lg backdrop-blur-md" style={{ backgroundColor: 'var(--clone-ink, #16302A)' }}>
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
              <Link to={basePath} className="text-xl font-black text-white"><BrandMark c={c} /></Link>
              <div className="hidden items-center gap-1 lg:flex">
                {pageLinks.map((item) => (
                  <Link key={item.page} to={sitePath(basePath, item.segment)} className="rounded-full px-3.5 py-2 text-sm font-semibold text-white/90 hover:bg-[#A8D93F] hover:text-[#16302A]">
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link to={ctaHref} className="hidden items-center gap-3 rounded-full py-2 pr-2 pl-6 text-sm font-bold sm:flex" style={{ backgroundColor: 'var(--clone-accent, #A8D93F)', color: 'var(--clone-ink, #16302A)', ...ctaStyle }}>
                {c.ctaText}
              </Link>
            </div>
          </nav>
        </div>
      )

    case 'axiom':
      return (
        <nav className="sticky top-0 z-40 border-b bg-white shadow-sm" style={{ borderColor: '#E8EFF7' }}>
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link to={basePath} className="text-lg font-black tracking-tight text-[#0A1628]"><BrandMark c={c} /></Link>
            <div className="hidden items-center gap-1 lg:flex">
              {pageLinks.map((item) => (
                <Link key={item.page} to={sitePath(basePath, item.segment)} className="px-3.5 py-2 text-sm font-semibold text-[#0A1628] hover:text-blue-600">
                  {item.label}
                </Link>
              ))}
            </div>
            <Link to={ctaHref} className="hidden rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-md sm:inline" style={{ backgroundColor: 'var(--clone-accent, #0B4F8A)', ...ctaStyle }}>
              {c.ctaText}
            </Link>
          </div>
        </nav>
      )

    case 'helix':
      return (
        <div>
          <div className="bg-black px-4 py-3 text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              {c.email ? <a href={`mailto:${c.email}`} className="font-medium hover:underline">Email</a> : <span />}
              {c.phone ? <a href={`tel:${c.phone}`} className="text-sm font-medium md:text-2xl">{c.phone}</a> : null}
            </div>
          </div>
          <nav className="sticky top-0 z-40 rounded-b-3xl text-white shadow-lg" style={{ backgroundColor: 'var(--clone-accent, #800020)' }}>
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex h-20 items-center justify-between">
                <Link to={basePath} className="shrink-0 text-xl font-bold">
                  {c.logo ? <img src={c.logo} alt={c.businessName} className="h-16 w-16 object-contain" /> : <BrandMark c={c} />}
                </Link>
                <div className="hidden items-center gap-1 md:flex">
                  {pageLinks.map((item) => (
                    <Link key={item.page} to={sitePath(basePath, item.segment)} className="rounded-lg px-4 py-2 font-medium text-white transition-all hover:bg-white/10">
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  {c.phone ? <a href={`tel:${c.phone}`} className="hidden font-medium md:inline">{c.phone}</a> : null}
                  <Link to={ctaHref} className="hidden rounded-lg bg-white px-6 py-2 font-semibold md:block" style={{ color: 'var(--clone-accent, #800020)' }}>
                    Book now
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )

    case 'flux':
      return (
        <div>
          <div className="border-b border-[#241C15]/10 text-xs text-[#FFF3E7]" style={{ backgroundColor: '#241C15' }}>
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
              <div className="flex items-center gap-6 font-semibold text-[#FFDCC4]">
                {c.phone ? <a href={`tel:${c.phone}`} className="hover:text-[#FA6B34]">{c.phone}</a> : null}
                {c.email ? <span className="hidden md:inline">{c.email}</span> : null}
                {c.hours ? <span className="hidden lg:inline">{c.hours}</span> : null}
              </div>
            </div>
          </div>
          <nav className="sticky top-0 z-40 border-b border-[#EEDFCF] bg-[#FFF9F4]/95 shadow-sm backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
              <Link to={basePath} className="text-xl font-black tracking-tight text-[#241C15]"><BrandMark c={c} /></Link>
              <div className="hidden items-center gap-1 lg:flex">
                {pageLinks.map((item) => (
                  <Link key={item.page} to={sitePath(basePath, item.segment)} className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#3A2E22] hover:bg-[#FFEDE1] hover:text-[#FA6B34]">
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link to={ctaHref} className="hidden rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg sm:inline" style={{ backgroundColor: 'var(--clone-accent, #FA6B34)', ...ctaStyle }}>
                {c.ctaText}
              </Link>
            </div>
          </nav>
        </div>
      )

    case 'aureum':
      return (
        <div>
          <div className="border-b border-purple-200 text-xs text-slate-900" style={{ backgroundColor: '#eee4e6ff' }}>
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
              <div className="flex items-center gap-6 font-semibold text-purple-700">
                {c.phone ? <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a> : null}
                {c.email ? <span className="hidden md:inline">{c.email}</span> : null}
                {c.hours ? <span className="hidden lg:inline">{c.hours}</span> : null}
              </div>
            </div>
          </div>
          <nav className="sticky top-0 z-40 border-b border-slate-300 bg-slate-50/95 shadow-xl backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
              <Link to={basePath} className="text-xl font-black tracking-tight text-slate-900"><BrandMark c={c} /></Link>
              <div className="hidden items-center gap-1 lg:flex">
                {pageLinks.map((item) => (
                  <Link key={item.page} to={sitePath(basePath, item.segment)} className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-purple-600">
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link to={ctaHref} className="hidden rounded-xl px-6 py-3 text-sm font-bold text-white shadow-xl sm:inline" style={{ backgroundColor: 'var(--clone-accent, #9333ea)', ...ctaStyle }}>
                {c.ctaText}
              </Link>
            </div>
          </nav>
        </div>
      )

    case 'taxfighters':
      return (
        <div>
          <div className="border-b border-rose-200 text-xs text-slate-900" style={{ backgroundColor: '#eee4e6ff' }}>
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
              <div className="flex items-center gap-6 font-semibold text-rose-700">
                {c.phone ? <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a> : null}
                {c.email ? <span className="hidden md:inline">{c.email}</span> : null}
                {c.hours ? <span className="hidden lg:inline">{c.hours}</span> : null}
              </div>
            </div>
          </div>
          <nav className="sticky top-0 z-40 border-b border-slate-300 bg-slate-50/95 shadow-xl backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
              <Link to={basePath} className="text-xl font-black tracking-tight text-slate-900">
                {c.logo ? <img src={c.logo} alt="" className="h-10 w-auto object-contain" /> : <BrandMark c={c} />}
              </Link>
              <div className="hidden items-center gap-1 lg:flex">
                {pageLinks.map((item) => (
                  <Link key={item.page} to={sitePath(basePath, item.segment)} className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-rose-600">
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link to={ctaHref} className="hidden rounded-xl px-6 py-3 text-sm font-bold text-white shadow-xl sm:inline" style={{ backgroundColor: 'var(--clone-accent, #e60039)', ...ctaStyle }}>
                {c.ctaText}
              </Link>
            </div>
          </nav>
        </div>
      )

    case 'salon':
      return (
        <nav className={t.nav}>
          <div className="mx-auto max-w-6xl px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="hidden flex-1 justify-end gap-6 text-sm lg:flex">
                <NavLinks items={leftLinks} t={t} basePath={basePath} />
              </div>
              <Link to={basePath} className="font-serif text-2xl font-light tracking-wide text-pink-900"><BrandMark c={c} /></Link>
              <div className="flex flex-1 items-center justify-end gap-6 text-sm">
                <div className="hidden gap-6 lg:flex">
                  <NavLinks items={rightLinks} t={t} basePath={basePath} />
                </div>
                <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
              </div>
            </div>
          </div>
        </nav>
      )

    case 'noir':
      return (
        <nav className={`${t.nav} border-b border-amber-500/40`}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="font-serif text-lg font-semibold uppercase tracking-[0.2em] text-amber-100"><BrandMark c={c} /></Link>
            <div className="hidden gap-8 text-xs font-semibold uppercase tracking-widest lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    case 'terra':
      return (
        <nav className={t.nav}>
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center justify-between gap-4 rounded-full border border-orange-200 bg-orange-50/90 px-6 py-3 shadow-sm">
              <Link to={basePath} className="text-lg font-bold text-orange-950"><BrandMark c={c} /></Link>
              <div className="hidden gap-6 text-sm font-medium lg:flex">
                <NavLinks items={pageLinks} t={t} basePath={basePath} />
              </div>
              <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
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
                <span className="border-b-2 border-sky-400 pb-0.5"><BrandMark c={c} /></span>
              </Link>
              <div className="hidden gap-7 text-sm font-medium text-sky-900 lg:flex">
                <NavLinks items={pageLinks} t={t} basePath={basePath} />
              </div>
              <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
            </div>
          </div>
        </nav>
      )

    case 'vineyard':
      return (
        <nav className={t.nav}>
          <div className="mx-auto max-w-6xl px-6 py-5">
            <div className="flex items-center justify-between border-b border-rose-900/20 pb-4">
              <Link to={basePath} className="font-serif text-2xl font-semibold text-rose-950"><BrandMark c={c} /></Link>
              <div className="hidden items-center gap-8 text-sm lg:flex">
                <NavLinks items={pageLinks} t={t} basePath={basePath} />
                <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
              </div>
            </div>
          </div>
        </nav>
      )

    case 'arcade':
      return (
        <nav className={`${t.nav} border-b-2 border-lime-400/60 shadow-[0_4px_24px_rgba(163,230,53,0.15)]`}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="text-lg font-black uppercase tracking-wider text-lime-300"><BrandMark c={c} /></Link>
            <div className="hidden gap-6 text-xs font-bold uppercase tracking-widest lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    case 'coffee':
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <Link to={basePath} className="font-serif text-2xl font-semibold tracking-tight text-[#2d1810]"><BrandMark c={c} /></Link>
            <div className="hidden items-center gap-8 text-sm lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
          </div>
        </nav>
      )

    default:
      return (
        <nav className={t.nav}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to={basePath} className="text-xl font-bold"><BrandMark c={c} /></Link>
            <div className="hidden gap-6 text-sm font-medium lg:flex">
              <NavLinks items={pageLinks} t={t} basePath={basePath} />
            </div>
            <Link to={ctaHref} data-brand-cta className={t.navCta} style={ctaStyle}>{c.ctaText}</Link>
          </div>
        </nav>
      )
  }
}