import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, ChevronDown, Clock, Mail, Menu, Phone, Shield, X } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { CloneTemplateId } from '../cloneTheme'
import { getMapEmbedUrl } from '../../utils/mapEmbed'
import type { CloneHomeData } from './cloneHomeData'

interface ChromeProps {
  templateId: CloneTemplateId
  d: CloneHomeData
  onBook?: () => void
}

interface VariantChrome {
  topbar: string
  topbarStyle?: CSSProperties
  topbarText: string
  nav: string
  navStyle?: CSSProperties
  navBlur?: boolean
  link: string
  dropdown: string
  dropdownItem: string
  cta: string
  ctaStyle?: CSSProperties
  mobile: string
  logoOnDark?: boolean
  rounded?: boolean
  pill?: boolean
  skipTopbar?: boolean
  skipDropdowns?: boolean
  locationsLabel: string
}

const VARIANTS: Record<CloneTemplateId, VariantChrome> = {
  taxfighters: {
    topbar: 'border-b border-rose-200 text-xs py-2 px-4',
    topbarStyle: { backgroundColor: '#eee4e6' },
    topbarText: 'text-rose-700 font-semibold',
    nav: 'sticky top-0 z-50 overflow-visible border-b border-slate-300 bg-slate-50/95 shadow-xl',
    navBlur: true,
    link: 'rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-rose-600',
    dropdown: 'bg-slate-100 border border-slate-300',
    dropdownItem: 'hover:bg-rose-100/40',
    cta: 'hidden sm:inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-xl',
    ctaStyle: { backgroundColor: 'var(--clone-accent)' },
    mobile: 'bg-slate-50 border-b border-slate-300 text-slate-900',
    locationsLabel: 'Locations',
  },
  aureum: {
    topbar: 'border-b border-purple-200 text-xs py-2 px-4',
    topbarStyle: { backgroundColor: '#eee4e6' },
    topbarText: 'text-purple-700 font-semibold',
    nav: 'sticky top-0 z-50 overflow-visible border-b border-slate-300 bg-slate-50/95 shadow-xl',
    navBlur: true,
    link: 'rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-purple-600',
    dropdown: 'bg-white border border-purple-200',
    dropdownItem: 'hover:bg-purple-100/40',
    cta: 'hidden sm:inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-xl',
    ctaStyle: { backgroundColor: 'var(--clone-accent)' },
    mobile: 'bg-slate-50 border-b border-slate-300 text-slate-900',
    locationsLabel: 'Locations',
  },
  flux: {
    topbar: 'border-b border-[#241C15]/10 text-xs py-2 px-4 text-[#FFF3E7]',
    topbarStyle: { backgroundColor: '#241C15' },
    topbarText: 'text-[#FFDCC4] font-semibold',
    nav: 'sticky top-0 z-50 overflow-visible border-b border-[#EEDFCF] bg-[#FFF9F4]/95 shadow-sm',
    navBlur: true,
    link: 'rounded-lg px-3.5 py-2 text-sm font-semibold text-[#3A2E22] hover:bg-[#FFEDE1] hover:text-[#FA6B34]',
    dropdown: 'bg-white border border-[#EEDFCF]',
    dropdownItem: 'hover:bg-[#FFEDE1]',
    cta: 'hidden sm:inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg',
    ctaStyle: { backgroundColor: 'var(--clone-accent)' },
    mobile: 'bg-[#FFF9F4] border-b border-[#EEDFCF] text-[#241C15]',
    locationsLabel: 'Locations',
  },
  cpa: {
    topbar: 'text-xs py-2.5 px-4 text-[#DDEBD0]',
    topbarStyle: { backgroundColor: 'var(--clone-ink)' },
    topbarText: 'text-[#DDEBD0] font-semibold',
    nav: 'sticky top-0 z-50 overflow-visible border-b border-white/10 shadow-lg',
    navStyle: { backgroundColor: 'var(--clone-ink)' },
    navBlur: true,
    link: 'rounded-full px-3.5 py-2 text-sm font-semibold text-white/90 hover:bg-[var(--clone-accent)] hover:text-[var(--clone-ink)]',
    dropdown: 'bg-white border border-[#E4E0D4]',
    dropdownItem: 'hover:bg-[#F0F8E0]',
    cta: 'hidden sm:inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold shadow-lg',
    ctaStyle: { backgroundColor: 'var(--clone-accent)', color: 'var(--clone-ink)' },
    mobile: 'text-white border-t border-white/10',
    logoOnDark: true,
    pill: true,
    locationsLabel: 'Who We Help',
  },
  axiom: {
    topbar: '',
    topbarText: '',
    nav: 'sticky top-0 z-50 overflow-visible border-b bg-white shadow-sm',
    navStyle: { borderColor: '#E8EFF7' },
    link: 'px-3.5 py-2 text-sm font-semibold hover:text-blue-600',
    dropdown: 'bg-white border',
    dropdownItem: 'hover:bg-blue-50',
    cta: 'hidden sm:inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-md',
    ctaStyle: { backgroundColor: 'var(--clone-accent)' },
    mobile: 'bg-white border-t text-[var(--clone-ink)]',
    skipTopbar: true,
    locationsLabel: 'Solutions',
  },
  helix: {
    topbar: 'bg-black px-4 py-3 text-white',
    topbarText: 'text-white',
    nav: 'sticky top-0 z-50 overflow-visible rounded-b-3xl text-white shadow-lg',
    navStyle: { backgroundColor: 'var(--clone-accent)' },
    link: 'rounded-lg px-4 py-2 font-medium text-white hover:bg-white/10',
    dropdown: 'bg-[var(--clone-ink)] border border-white/10',
    dropdownItem: 'hover:bg-white/10',
    cta: 'hidden sm:inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2 font-semibold',
    ctaStyle: { color: 'var(--clone-accent)' },
    mobile: 'text-white',
    logoOnDark: true,
    rounded: true,
    skipDropdowns: true,
    locationsLabel: 'Locations',
  },
}

function Dropdown({
  label,
  to,
  items,
  v,
}: {
  label: string
  to: string
  items: { title: string; desc: string; to: string }[]
  v: VariantChrome
}) {
  return (
    <div className="relative z-50 group">
      <Link to={to} className={`flex items-center gap-1 ${v.link}`}>
        {label} <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
      </Link>
      <div className="pointer-events-none absolute top-full left-0 z-50 w-80 pt-2 translate-y-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        <div className={`space-y-1 rounded-2xl border p-2 shadow-2xl ${v.dropdown}`}>
          {items.map((item) => (
            <Link key={item.title} to={item.to} className={`block rounded-xl p-3 ${v.dropdownItem}`}>
              <div className="flex items-center justify-between text-sm font-bold">
                {item.title}
                <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--clone-accent)' }} />
              </div>
              {item.desc ? <div className="mt-0.5 text-xs opacity-60">{item.desc}</div> : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CloneNav({ templateId, d, onBook }: ChromeProps) {
  const [open, setOpen] = useState(false)
  const v = VARIANTS[templateId]
  const { c } = d
  const cta = c.ctaText || 'Book now'
  const services = d.services.map((s) => ({ title: s.title, desc: s.description, to: d.hrefs.services }))
  const locations = d.locations.map((loc) => ({ title: loc.title, desc: loc.description, to: d.hrefs.portfolio }))
  const posts = d.blogPosts.map((post) => ({
    title: post.title,
    desc: post.excerpt,
    to: post.slug ? d.hrefs.blogPost(post.slug) : d.hrefs.blog,
  }))

  return (
    <div className="clone-site-nav relative z-50">
      {!v.skipTopbar ? (
        <div className={v.topbar} style={v.topbarStyle}>
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
            <div className={`flex flex-wrap items-center gap-6 ${v.topbarText}`}>
              {c.phone ? (
                <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {c.phone}
                </a>
              ) : null}
              {c.email ? (
                <span className="hidden items-center gap-1.5 md:inline-flex">
                  <Mail className="h-3.5 w-3.5" /> {c.email}
                </span>
              ) : null}
              {c.hours ? (
                <span className="hidden items-center gap-1.5 lg:inline-flex">
                  <Clock className="h-3.5 w-3.5" /> {c.hours}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <nav className={v.nav} style={v.navStyle}>
        {v.navBlur ? (
          <div
            className={`pointer-events-none absolute inset-0 -z-10 backdrop-blur-md ${v.rounded ? 'rounded-b-3xl' : ''}`}
            aria-hidden
          />
        ) : null}
        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between overflow-visible px-4 sm:px-6">
          <Link to={d.hrefs.home} className="flex items-center gap-3">
            {c.logo ? (
              <img src={c.logo} alt="" className={`object-contain ${v.rounded ? 'h-14 w-14' : 'h-11 w-auto max-w-[10rem]'}`} />
            ) : (
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg"
                style={{ backgroundColor: v.logoOnDark && templateId !== 'helix' ? 'var(--clone-accent)' : 'var(--clone-accent)' }}
              >
                <Shield className="h-6 w-6 text-white" />
              </div>
            )}
            <div className={c.logo && v.rounded ? 'hidden' : ''}>
              <div className={`text-xl font-black tracking-tight ${v.logoOnDark ? 'text-white' : ''}`}>{c.businessName}</div>
              <div className={`text-[10px] font-semibold uppercase tracking-widest opacity-60 ${v.logoOnDark ? 'text-white' : ''}`}>
                {c.tagline}
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <Link to={d.hrefs.home} className={v.link}>
              Home
            </Link>
            {v.skipDropdowns ? (
              d.navItems
                .filter((item) => item.page !== 'home')
                .map((item) => (
                  <Link key={item.page} to={item.to} className={v.link}>
                    {item.label}
                  </Link>
                ))
            ) : (
              <>
                {d.show.services ? <Dropdown label="Services" to={d.hrefs.services} items={services} v={v} /> : null}
                {d.show.portfolio ? <Dropdown label={v.locationsLabel} to={d.hrefs.portfolio} items={locations} v={v} /> : null}
                {d.show.blog ? (
                  <Dropdown
                    label={templateId === 'axiom' ? 'Resources' : 'Blog'}
                    to={d.hrefs.blog}
                    items={[...posts, { title: 'View all articles →', desc: '', to: d.hrefs.blog }]}
                    v={v}
                  />
                ) : null}
                {d.show.about ? (
                  <Link to={d.hrefs.about} className={v.link}>
                    About
                  </Link>
                ) : null}
                {d.show.contact ? (
                  <Link to={d.hrefs.contact} className={v.link}>
                    Contact
                  </Link>
                ) : null}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onBook ? (
              <button type="button" onClick={onBook} className={v.cta} style={v.ctaStyle}>
                <Calendar className="h-4 w-4" /> {cta}
              </button>
            ) : (
              <Link to={d.hrefs.cta} className={v.cta} style={v.ctaStyle}>
                {cta}
              </Link>
            )}
            <button type="button" className="rounded-xl border p-2 lg:hidden" onClick={() => setOpen((value) => !value)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className={`space-y-2 px-6 py-6 lg:hidden ${v.mobile}`}>
            {d.navItems.map((item) => (
              <Link key={item.page} to={item.to} className="block py-2 text-base font-bold" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            {onBook ? (
              <button
                type="button"
                className="w-full rounded-xl px-6 py-3 font-bold"
                style={{ backgroundColor: 'var(--clone-accent)', color: v.ctaStyle?.color ?? '#fff' }}
                onClick={() => {
                  setOpen(false)
                  onBook()
                }}
              >
                {cta}
              </button>
            ) : null}
          </div>
        ) : null}
      </nav>
    </div>
  )
}

export function CloneFooter({ templateId, d }: ChromeProps) {
  const { c } = d
  const dark = templateId === 'helix' || templateId === 'cpa'
  return (
    <footer
      className={`border-t px-4 py-12 text-xs sm:px-6 ${dark ? 'bg-black text-white/70' : 'bg-[var(--clone-surface)] text-[var(--clone-ink)]'}`}
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <div className={`text-base font-bold ${dark ? 'text-white' : ''}`}>{c.businessName}</div>
          <p className="leading-relaxed opacity-70">{c.missionStatement || c.heroSubtext}</p>
        </div>
        <div>
          <h4 className={`mb-3 font-bold uppercase tracking-wider ${dark ? 'text-white' : ''}`}>Pages</h4>
          <ul className="space-y-2">
            {d.navItems
              .filter((item) => item.page !== 'home')
              .map((item) => (
                <li key={item.page}>
                  <Link to={item.to} className="hover:opacity-100" style={{ color: 'var(--clone-accent)' }}>
                    {item.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div>
          <h4 className={`mb-3 font-bold uppercase tracking-wider ${dark ? 'text-white' : ''}`}>Hours</h4>
          <p>{c.hours}</p>
        </div>
        <div>
          <h4 className={`mb-3 font-bold uppercase tracking-wider ${dark ? 'text-white' : ''}`}>Contact</h4>
          <p>
            {c.phone}
            <br />
            {c.email}
            <br />
            {c.address}
          </p>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t pt-6 text-center opacity-50">
        © {new Date().getFullYear()} {c.businessName}. All rights reserved.
      </div>
    </footer>
  )
}

export function CloneStatsSection({ d }: { d: CloneHomeData }) {
  if (!d.show.stats || d.stats.length === 0) return null
  return (
    <section className="border-y py-12" style={{ backgroundColor: 'var(--clone-surface-alt)' }}>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4 sm:px-6">
        {d.stats.slice(0, 4).map((stat) => (
          <div key={stat.label}>
            <div className="text-3xl font-black sm:text-4xl" style={{ color: 'var(--clone-accent)' }}>
              {stat.value}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-60">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CloneTeamSection({ d }: { d: CloneHomeData }) {
  if (!d.show.team || d.team.length === 0) return null
  return (
    <section className="px-4 py-24 sm:px-6" style={{ backgroundColor: 'var(--clone-surface-alt)' }}>
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--clone-accent)' }}>
            Our experts
          </div>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">{d.c.teamSectionTitle || 'Meet the team'}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {d.team.map((member) => (
            <div key={member.name} className="overflow-hidden rounded-2xl border bg-[var(--clone-surface)]">
              {member.image ? <img src={member.image} alt="" className="h-56 w-full object-cover" /> : <div className="h-56 bg-[var(--clone-accent-soft)]" />}
              <div className="p-5 text-center">
                <h3 className="text-sm font-bold">{member.name}</h3>
                <p className="mt-1 text-xs opacity-60">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ClonePricingSection({ d, onBook }: { d: CloneHomeData; onBook?: () => void }) {
  if (!d.show.pricing) return null
  const plans = d.pricing.length
    ? d.pricing
    : [
        {
          title: 'Custom quote',
          description: 'Tell us what you need and we will price the work clearly before we start.',
          price: 'Contact us',
          tag: '',
          featured: true,
        },
      ]
  return (
    <section id="pricing" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--clone-accent)' }}>
            Pricing
          </div>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">{d.c.pricingSectionTitle || 'Pricing plans'}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.title}
              className="rounded-3xl border bg-[var(--clone-surface)] p-8"
              style={
                plan.featured
                  ? { borderColor: 'var(--clone-accent)', boxShadow: '0 0 0 1px var(--clone-accent)' }
                  : undefined
              }
            >
              {plan.tag ? (
                <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--clone-accent)' }}>
                  {plan.tag}
                </p>
              ) : null}
              <h3 className="text-xl font-bold">{plan.title}</h3>
              <p className="my-3 text-3xl font-black" style={{ color: 'var(--clone-accent)' }}>
                {plan.price}
              </p>
              <p className="text-sm leading-relaxed opacity-70">{plan.description}</p>
              {onBook ? (
                <button
                  type="button"
                  onClick={onBook}
                  className="mt-6 text-sm font-bold hover:underline"
                  style={{ color: 'var(--clone-accent)' }}
                >
                  Get started →
                </button>
              ) : (
                <Link to={d.hrefs.cta} className="mt-6 inline-block text-sm font-bold hover:underline" style={{ color: 'var(--clone-accent)' }}>
                  Get started →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CloneCtaSection({ d, onBook }: { d: CloneHomeData; onBook?: () => void }) {
  if (!d.show.cta) return null
  const { c } = d
  return (
    <section id="cta" className="px-4 py-20 sm:px-6" style={{ backgroundColor: 'var(--clone-ink)' }}>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-black text-white sm:text-4xl">{c.ctaBannerTitle || 'Ready to get started?'}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/75">{c.ctaBannerText || c.heroSubtext}</p>
        {onBook ? (
          <button
            type="button"
            onClick={onBook}
            className="mt-8 inline-flex rounded-xl px-8 py-3.5 text-sm font-bold shadow-xl"
            style={{ backgroundColor: 'var(--clone-accent)', color: 'var(--clone-ink)' }}
          >
            {c.ctaText || 'Book now'}
          </button>
        ) : (
          <Link
            to={d.hrefs.cta}
            className="mt-8 inline-flex rounded-xl px-8 py-3.5 text-sm font-bold shadow-xl"
            style={{ backgroundColor: 'var(--clone-accent)', color: 'var(--clone-ink)' }}
          >
            {c.ctaText || 'Book now'}
          </Link>
        )}
      </div>
    </section>
  )
}

export function CloneMap({
  d,
  className = 'h-56 overflow-hidden rounded-2xl border',
  title = 'Office location',
}: {
  d: CloneHomeData
  className?: string
  title?: string
}) {
  const src = getMapEmbedUrl(d.c.mapUrl, d.c.address)
  if (!src) return null
  return (
    <div className={className}>
      <iframe
        title={title}
        src={src}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  )
}
