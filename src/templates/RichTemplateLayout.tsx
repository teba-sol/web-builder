import { actionBackground } from '../utils/accentInk'
import { lazy, Suspense, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getColorSchemes } from '../data/colorSchemes'
import { getTemplateMeta } from '../data/defaults'
import { getLayoutVariant, type HeroLayout, type TestimonialLayout } from '../data/layoutVariants'

import { getManifest } from '../catalog/catalog'
import { blockHideAttrs, blockWrapperClass, getBlockDesign } from '../catalog/blockDesign'
import { DEFAULT_HOME_SECTIONS } from '../data/homePageConfig'

import { getSiteNavItems, resolveSiteHref, sitePath, type SiteNavItem, type SitePageId } from '../data/siteNav'
import { TemplateNav } from './navLayouts'
import './templateShells.css'
import type { SiteContent, TemplateId } from '../types'
import { ContactSectionView, ExploreSectionView, FaqSectionView } from './sectionLayouts'
import { brandCss, brandCtaStyle, brandFontHref, resolveBrandAccent } from '../data/brand'
import { footerBlurb, footerNote } from '../data/footer'
import { CUSTOM_COLOR_SCHEME_ID } from '../data/pickTemplate'
import { getTheme } from './getTheme'
import {
  BlogListPage,
  BlogPostPage,
  AboutTeaser,
  BlogTeaser,
  GalleryPage,
  NewsListPage,
  NewsPostPage,
  NewsTeaser,
  PortfolioPage,
  PortfolioTeaser,
  ServicesTeaser,
  PricingSection,
} from './PageLayoutSections'
import {
  BookPage,
  BookingConfirmPage,
  HeroStaySearch,
  RoomDetailPage,
  RoomsPage,
} from './booking/BookingPages'
import { staySkin } from './booking/hospitalitySkin'
import { isHospitalityTemplate } from '../data/hospitality'
import { type TemplateTheme } from './themes'
import { catalogueRoomTypes } from '../data/bookingPreview'
import { coverPhoto, discountPercentOf, formatMoney, parseRoomPrice, sellingAmount, stayCurrency } from '../data/hospitality'
import { TaxFightersHome } from './TaxFightersHome'
import { AureumHome } from './AureumHome'
import { FluxHome } from './FluxHome'
import { AxiomHome } from './AxiomHome'
import { HelixHome } from './HelixHome'
import { CpaHome } from './CpaHome'
import { clonePaletteCss, cloneWrapperClass, isCloneTemplate, resolveClonePalette, type CloneTemplateId } from './cloneTheme'

const CloneInnerPage = lazy(() =>
  import('./clones/CloneInnerPages').then((mod) => ({ default: mod.CloneInnerPage })),
)

interface Props {
  variant: TemplateId
  content: SiteContent
  basePath?: string
  page?: SitePageId
  postSlug?: string
  colorSchemeId?: string
  layoutVariantId?: string
}

type PageSectionId =
  | 'nav' | 'hero' | 'stats' | 'about' | 'services' | 'steps' | 'team' | 'testimonials' | 'faq' | 'cta' | 'contact' | 'footer'
  | 'blog-teaser' | 'news-teaser' | 'portfolio-teaser' | 'services-teaser' | 'about-teaser' | 'rooms-teaser' | 'explore'
  | 'blog-page' | 'blog-post-page'
  | 'news-page' | 'news-post-page'
  | 'gallery-page' | 'portfolio-page'
  | 'rooms-page' | 'room-detail-page' | 'book-page' | 'booking-confirm-page'
  | 'pricing'

function homeSectionsFor(templateId: string): PageSectionId[] {
  const fromManifest = getManifest(templateId)?.homeSections
  const order = [...(fromManifest ?? DEFAULT_HOME_SECTIONS)] as PageSectionId[]
  insertHomeSection(order, 'steps', 'testimonials')
  insertHomeSection(order, 'pricing', 'faq')
  insertHomeSection(order, 'team', 'faq')
  insertHomeSection(order, 'cta', 'contact')
  return order
}

function insertHomeSection(order: PageSectionId[], id: PageSectionId, before: PageSectionId) {
  if (order.includes(id)) return
  const idx = order.indexOf(before)
  if (idx >= 0) order.splice(idx, 0, id)
  else order.splice(Math.max(order.length - 1, 0), 0, id)
}

const PAGE_SECTIONS: Record<SitePageId, PageSectionId[]> = {
  home: [...DEFAULT_HOME_SECTIONS] as PageSectionId[],
  about: ['nav', 'about', 'team', 'testimonials', 'footer'],
  services: ['nav', 'services', 'steps', 'pricing', 'footer'],
  portfolio: ['nav', 'portfolio-page', 'footer'],
  gallery: ['nav', 'gallery-page', 'footer'],
  blog: ['nav', 'blog-page', 'footer'],
  'blog-post': ['nav', 'blog-post-page', 'footer'],
  news: ['nav', 'news-page', 'footer'],
  'news-post': ['nav', 'news-post-page', 'footer'],
  contact: ['nav', 'contact', 'faq', 'footer'],
  rooms: ['nav', 'rooms-page', 'footer'],
  'room-detail': ['nav', 'room-detail-page', 'footer'],
  book: ['nav', 'book-page', 'footer'],
  'booking-confirm': ['nav', 'booking-confirm-page', 'footer'],
}

export function RichTemplateLayout({
  variant,
  content: c,
  basePath = '/',
  page = 'home',
  postSlug,
  colorSchemeId,
  layoutVariantId,
}: Props) {
  const customPalette = colorSchemeId === CUSTOM_COLOR_SCHEME_ID
  const t = getTheme(variant, colorSchemeId)
  const layout = getLayoutVariant(variant, layoutVariantId)
  const meta = getTemplateMeta(variant)
  const visibility = c.sectionVisibility
  const navItems = getSiteNavItems(variant, c)
  const order = page === 'home' ? homeSectionsFor(variant) : (PAGE_SECTIONS[page] ?? PAGE_SECTIONS.home)
  const layoutProps = { c, t, variant, basePath }
  const scheme =
    getColorSchemes(variant).find((s) => s.id === colorSchemeId) ?? getColorSchemes(variant)[0]
  const accent = resolveBrandAccent(c, scheme?.swatches[1] ?? '#2563eb')
  const brandStyles = brandCss(c)
  const fontHref = brandFontHref(c)
  const bookingAccent = actionBackground(accent, scheme?.swatches[1])
  const bookingProps = { content: c, basePath, theme: t, templateId: variant, accent: bookingAccent }

  const sections: Record<PageSectionId, ReactNode> = {
    nav: <TemplateNav c={c} t={t} variant={variant} navItems={navItems} basePath={basePath} />,
    hero: <HeroSection c={c} t={t} variant={variant} heroLayout={layout.heroLayout} basePath={basePath} accent={bookingAccent} />,
    stats: visibility.stats ? <StatsSection c={c} t={t} variant={variant} /> : null,
    about: <AboutSection c={c} t={t} />,
    services: <ServicesSection c={c} t={t} meta={meta?.servicesLabel} />,
    steps: visibility.steps ? <StepsSection c={c} t={t} /> : null,
    testimonials: visibility.testimonials ? <TestimonialsSection c={c} t={t} layout={layout.testimonialLayout} /> : null,
    'blog-teaser': c.pageVisibility.blog ? <BlogTeaser {...layoutProps} /> : null,
    'news-teaser': c.pageVisibility.news ? <NewsTeaser {...layoutProps} /> : null,
    'services-teaser': c.pageVisibility.services ? <ServicesTeaser {...layoutProps} /> : null,
    'portfolio-teaser': c.pageVisibility.portfolio ? <PortfolioTeaser {...layoutProps} /> : null,
    'about-teaser': c.pageVisibility.about ? <AboutTeaser {...layoutProps} /> : null,
    'rooms-teaser': c.pageVisibility.rooms ? <RoomsTeaser c={c} basePath={basePath} accent={accent} variant={variant} /> : null,
    explore: <ExploreSectionView {...layoutProps} />,
    'blog-page': <BlogListPage {...layoutProps} />,
    'blog-post-page': <BlogPostPage {...layoutProps} slug={postSlug ?? ''} />,
    'news-page': <NewsListPage {...layoutProps} />,
    'news-post-page': <NewsPostPage {...layoutProps} slug={postSlug ?? ''} />,
    'gallery-page': <GalleryPage {...layoutProps} />,
    'portfolio-page': <PortfolioPage {...layoutProps} />,
    'rooms-page': <RoomsPage {...bookingProps} />,
    'room-detail-page': <RoomDetailPage {...bookingProps} />,
    'book-page': <BookPage {...bookingProps} />,
    'booking-confirm-page': <BookingConfirmPage {...bookingProps} />,
    pricing: visibility.pricing ? <PricingSection c={c} t={t} /> : null,
    team: visibility.team ? <TeamSection c={c} t={t} /> : null,
    faq: visibility.faq ? <FaqSectionView c={c} t={t} variant={variant} /> : null,
    cta: visibility.cta ? <CtaBannerSection c={c} t={t} basePath={basePath} /> : null,
    contact: <ContactSectionView c={c} t={t} variant={variant} layout={layout.contactLayout} basePath={basePath} />,
    footer: <FooterSection c={c} t={t} navItems={navItems} basePath={basePath} />,
  }

  const customHome: Record<string, ReactNode> = {
    axiom: <AxiomHome c={c} basePath={basePath} />,
    helix: <HelixHome c={c} basePath={basePath} />,
    flux: <FluxHome c={c} basePath={basePath} />,
    aureum: <AureumHome c={c} basePath={basePath} />,
    taxfighters: <TaxFightersHome c={c} basePath={basePath} />,
    cpa: <CpaHome c={c} basePath={basePath} />,
  }
  const custom = page === 'home' ? customHome[variant] : undefined
  const clonePalette = isCloneTemplate(variant) ? resolveClonePalette(variant, c, colorSchemeId) : null
  const cloneCss = clonePalette ? clonePaletteCss(variant, clonePalette) : ''
  const cloneClass = isCloneTemplate(variant) ? cloneWrapperClass(variant, layoutVariantId) : ''

  if (custom || (isCloneTemplate(variant) && page !== 'home')) {
    return (
      <div data-site-brand {...(customPalette ? { 'data-custom-palette': '' } : {})} className={`@container ${cloneClass}`}>
        {fontHref ? <link rel="stylesheet" href={fontHref} /> : null}
        {brandStyles ? <style>{brandStyles}</style> : null}
        {cloneCss ? <style>{cloneCss}</style> : null}
        {custom ?? (
          <Suspense fallback={null}>
            <CloneInnerPage
              templateId={variant as CloneTemplateId}
              c={c}
              basePath={basePath}
              page={page}
              postSlugParam={postSlug}
            />
          </Suspense>
        )}
      </div>
    )
  }

  return (
    <div data-site-brand {...(customPalette ? { 'data-custom-palette': '' } : {})} className={`@container min-h-screen tpl-${variant} ${layout.shellClass} ${t.page} ${isCloneTemplate(variant) ? 'webtemplate-clone' : ''}`}>
      {fontHref ? <link rel="stylesheet" href={fontHref} /> : null}
      {brandStyles ? <style>{brandStyles}</style> : null}
      {cloneCss ? <style>{cloneCss}</style> : null}
      {order.map((id) => {
        const node = sections[id]
        if (node === null) return null
        const design = getBlockDesign(getManifest(variant), id)
        return (
          <div key={id} className={id === 'nav' ? 'contents' : blockWrapperClass(design)} {...blockHideAttrs(design)}>
            {node}
          </div>
        )
      })}
    </div>
  )
}

function heroContentClass(variant: TemplateId, heroLayout: HeroLayout): string {
  const base = 'relative mx-auto max-w-6xl px-4 csm:px-6 w-full'
  if (heroLayout === 'centered') {
    return `${base} text-center py-16 csm:py-24 flex flex-col items-center`
  }
  switch (variant) {
    case 'boutique':
      return heroLayout === 'immersive' ? `${base} py-32` : base
    case 'saas':
    case 'medical':
    case 'business':
    case 'lawfirm':
    case 'cpa':
    case 'aureum':
    case 'flux':
    case 'axiom':
    case 'helix':
      return heroLayout === 'immersive'
        ? `${base} py-32 text-center`
        : `${base} grid clg:grid-cols-2 gap-12 items-center py-24`
    case 'restaurant':
      return `${base} pb-16 pt-28`
    case 'realtor':
    case 'photography':
      return `${base} pb-16 pt-28`
    case 'creative':
      return base
    case 'fitness':
      return `${base} py-28`
    case 'noir':
    case 'coastal':
    case 'hotel':
    case 'alpine':
    case 'ryokan':
    case 'jungle':
    case 'vineyard':
    case 'arcade':
    case 'coffee':
    case 'taxfighters':
      return `${base} pb-20 pt-28 text-center`
    case 'guesthouse':
    case 'terra':
      return `${base} grid clg:grid-cols-2 gap-12 items-center py-24`
    default:
      return `${base} py-32`
  }
}

function RoomsTeaser({
  c,
  basePath,
  accent,
  variant,
}: {
  c: SiteContent
  basePath: string
  accent: string
  variant: TemplateId
}) {
  const rooms = catalogueRoomTypes(c.roomTypes)
  if (!rooms.length) return null
  const skin = staySkin(variant)
  return (
    <section className={`${skin.page} py-20`}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={skin.eyebrow}>Browse by room type</p>
            <h2 className={`mt-2 text-3xl font-bold ${skin.heading}`}>{c.roomsSectionTitle || 'Rooms'}</h2>
            <p className="mt-2 max-w-2xl text-slate-600">{c.roomsSectionSubtitle}</p>
          </div>
          <Link to={sitePath(basePath, 'rooms')} className="text-sm font-semibold" style={{ color: accent }}>
            Book
          </Link>
        </div>
        <div className="grid gap-6 cmd:grid-cols-3">
          {rooms.map((room) => {
            const photo = coverPhoto(room)
            const base = parseRoomPrice(room.basePrice)
            const percent = discountPercentOf(room)
            const selling = sellingAmount(base, percent)
            const currency = stayCurrency(room.currency)
            return (
              <Link
                key={room.slug}
                to={sitePath(basePath, `rooms/${room.slug}`)}
                className={`block hover:shadow-lg ${skin.card}`}
              >
                {photo ? (
                  <img src={photo} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/3] w-full bg-slate-100" />
                )}
                <div className="p-5">
                  <h3 className={`text-lg ${skin.heading}`}>{room.name}</h3>
                  <p className="mt-1 text-sm opacity-70">{room.maxAdults} adults · {room.maxChildren} children</p>
                  {room.description ? <p className="mt-1 line-clamp-2 text-sm opacity-70">{room.description}</p> : null}
                  <div data-part="price" className="mt-3">
                    {percent > 0 ? (
                      <>
                        <p className="text-sm text-slate-600 line-through">{formatMoney(base, currency)}</p>
                        <p className="font-bold" style={{ color: accent }}>
                          {formatMoney(selling, currency)} <span className="text-sm font-normal text-slate-700">/ night</span>
                        </p>
                        <p className="text-sm font-semibold text-rose-700">{percent}% off</p>
                      </>
                    ) : (
                      <p className="font-bold" style={{ color: accent }}>
                        {formatMoney(selling, currency)} <span className="text-sm font-normal text-slate-700">/ night</span>
                      </p>
                    )}
                  </div>
                  {room.freeBreakfast ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-700">Breakfast included</p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-600">Breakfast not included. Add or skip it when you book. The exported site shows the Hotel Policy price in ETB and USD.</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HeroSection({ c, t, variant, heroLayout, basePath, accent }: { c: SiteContent; t: TemplateTheme; variant: TemplateId; heroLayout: HeroLayout; basePath: string; accent: string }) {
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || (c.pageVisibility.rooms ? 'book' : 'contact'), c)
  const heroCfg = getManifest(variant)?.hero
  const hasOverlay = Boolean(heroCfg?.overlay) || heroLayout === 'immersive'

  return (
    <header className={`relative z-0 isolate ${t.hero} ${heroLayout === 'immersive' && !['restaurant', 'realtor', 'photography', 'creative', 'fitness', 'noir', 'coastal', 'hotel', 'alpine', 'ryokan', 'jungle', 'vineyard', 'arcade'].includes(variant) ? 'min-h-[85vh] flex flex-col justify-center' : ''}`}>
      {hasOverlay && c.heroImage && (
        <>
          <img data-part="image" src={c.heroImage} alt="" className={`absolute inset-0 h-full w-full object-cover ${variant === 'noir' ? 'grayscale contrast-125' : ''}`} />
          <div className={`absolute inset-0 ${heroCfg?.overlayGradient || 'bg-black/30'}`} />
        </>
      )}
      <div className={heroContentClass(variant, heroLayout)}>
        {variant !== 'restaurant' && variant !== 'photography' && (
          <p data-part="badge" className={`mb-4 ${t.heroBadge}`}>{c.businessName}</p>
        )}
        {variant === 'restaurant' && <p data-part="badge" className={`mb-3 ${t.heroBadge}`}>Est. 2010</p>}
        <h1 data-part="title" className={`mb-6 ${t.heroTitle}`}>{c.tagline}</h1>
        <p data-part="subtitle" className={`mb-8 ${t.heroText}`}>{c.heroSubtext || c.about.slice(0, 160)}</p>
        {isHospitalityTemplate(variant) ? (
          <HeroStaySearch basePath={basePath} accent={accent} templateId={variant} />
        ) : (
          <Link data-part="cta" data-brand-cta to={ctaHref} className={`inline-block ${t.heroCta}`} style={brandCtaStyle(c)}>{c.ctaText} →</Link>
        )}
        {!hasOverlay && c.heroImage && variant !== 'boutique' && (
          <img data-part="image" src={c.heroImage} alt="" className="rounded-2xl shadow-2xl w-full mt-8 clg:mt-0" />
        )}
        {variant === 'boutique' && c.heroImage && (
          <img data-part="image" src={c.heroImage} alt="" className="mx-auto mt-10 max-h-[500px] w-full max-w-4xl object-cover" />
        )}
      </div>
    </header>
  )
}

function statsGridClass(variant: TemplateId): string {
  switch (variant) {
    case 'realtor':
    case 'lawfirm':
    case 'cpa':
      return 'grid grid-cols-2 gap-8 cmd:grid-cols-4 text-left'
    case 'photography':
      return 'flex flex-wrap justify-around gap-8 py-4'
    case 'medical':
      return 'grid grid-cols-2 gap-6 cmd:grid-cols-4'
    case 'salon':
      return 'flex flex-wrap justify-center gap-4'
    case 'fitness':
    case 'arcade':
    case 'taxfighters':
      return 'grid grid-cols-2 gap-6 cmd:grid-cols-4 text-center uppercase tracking-wide'
    default:
      return 'grid grid-cols-2 gap-8 cmd:grid-cols-4 text-center'
  }
}

function StatsSection({ c, t, variant }: { c: SiteContent; t: TemplateTheme; variant: TemplateId }) {
  const stats = c.stats.filter((s) => s.value)
  if (stats.length === 0) return null
  return (
    <section className={t.stats}>
      <div data-part="heading" className="mx-auto max-w-6xl px-4 csm:px-6 pb-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80">{isHospitalityTemplate(variant) ? 'Trusted' : 'Trust signals'}</p>
      </div>
      <div className={`tpl-stats-inner mx-auto max-w-6xl px-4 csm:px-6 ${statsGridClass(variant)}`}>
        {stats.map((s, i) => (
          <div key={i}>
            <p className={t.statValue}>{s.value}</p>
            <p className={t.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function AboutSection({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  return (
    <section id="about" className={t.section}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <div className="grid items-center gap-8 clg:grid-cols-2 clg:gap-12">
          <div>
            <h2 className={t.sectionTitle}>{c.aboutTitle}</h2>
            <p className={`mt-6 text-lg leading-relaxed ${t.cardText}`}>{c.about}</p>
            {c.missionStatement && (
              <p className={`mt-8 ${t.mission}`}>{c.missionStatement}</p>
            )}
          </div>
          {c.aboutImage && (
            <img src={c.aboutImage} alt="" className={t.aboutImage} />
          )}
        </div>
      </div>
    </section>
  )
}

function ServicesSection({ c, t, meta }: { c: SiteContent; t: TemplateTheme; meta?: string }) {
  const services = c.services.filter((s) => s.title)
  if (services.length === 0) return null
  return (
    <section id="services" className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <div className="mb-14 text-center">
          <h2 className={t.sectionTitle}>{c.servicesSectionTitle || meta}</h2>
          <p className={t.sectionSubtitle}>{c.servicesSectionSubtitle}</p>
        </div>
        <div className="grid gap-8 cmd:grid-cols-2 clg:grid-cols-3 cxl:grid-cols-4">
          {services.map((s, i) => (
            <div key={i} className={t.card}>
              <div className={`mb-4 ${t.stepNum}`}>{i + 1}</div>
              <h3 className={`mb-3 ${t.cardTitle}`}>{s.title}</h3>
              <p className={t.cardText}>{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StepsSection({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  const steps = c.steps.filter((step) => step.title)
  if (steps.length === 0) return null
  return (
    <section className={t.section}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <h2 className={`mb-14 text-center ${t.sectionTitle}`}>{c.stepsSectionTitle}</h2>
        <div className="grid gap-8 cmd:grid-cols-2 clg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className={`mb-4 ${t.stepNum}`}>{String(i + 1).padStart(2, '0')}</div>
              <h3 className={`mb-2 ${t.cardTitle}`}>{step.title}</h3>
              <p className={t.cardText}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StarRating() {
  return (
    <div className="mb-4 flex gap-0.5 text-amber-400" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  )
}

function ReviewCard({ item, t }: { item: { quote: string; author: string; role: string }; t: TemplateTheme }) {
  return (
    <div className={t.testimonial}>
      <StarRating />
      <p className={`mb-6 text-lg leading-relaxed ${t.cardText}`}>"{item.quote}"</p>
      <p className={`font-semibold ${t.cardTitle}`}>{item.author}</p>
      <p className={`text-sm ${t.cardText}`}>{item.role}</p>
    </div>
  )
}

function TestimonialsSection({ c, t, layout }: { c: SiteContent; t: TemplateTheme; layout: TestimonialLayout }) {
  const testimonials = c.testimonials.filter((item) => item.quote)

  return (
    <section id="testimonials" className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <h2 className={`mb-4 text-center ${t.sectionTitle}`}>{c.testimonialsSectionTitle}</h2>
        <p className={`mb-14 text-center ${t.sectionSubtitle}`}>What our clients say about us</p>
        {testimonials.length === 0 ? (
          <p className={`text-center ${t.cardText}`}>Add client reviews in the editor to showcase social proof.</p>
        ) : layout === 'featured' ? (
          <div className="space-y-8">
            <div className={`mx-auto max-w-3xl text-center ${t.testimonial}`}>
              <StarRating />
              <p className={`mb-6 text-2xl leading-relaxed ${t.cardText}`}>"{testimonials[0].quote}"</p>
              <p className={`text-lg font-semibold ${t.cardTitle}`}>{testimonials[0].author}</p>
              <p className={t.cardText}>{testimonials[0].role}</p>
            </div>
            {testimonials.length > 1 && (
              <div className="grid gap-6 cmd:grid-cols-2 clg:grid-cols-3">
                {testimonials.slice(1).map((item, i) => (
                  <ReviewCard key={i} item={item} t={t} />
                ))}
              </div>
            )}
          </div>
        ) : layout === 'list' ? (
          <div className="mx-auto max-w-3xl space-y-6">
            {testimonials.map((item, i) => (
              <div key={i} className={`${t.testimonial} flex flex-col csm:flex-row csm:items-start csm:gap-6`}>
                <StarRating />
                <div>
                  <p className={`mb-4 text-lg leading-relaxed ${t.cardText}`}>"{item.quote}"</p>
                  <p className={`font-semibold ${t.cardTitle}`}>{item.author}</p>
                  <p className={`text-sm ${t.cardText}`}>{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 cmd:grid-cols-3">
            {testimonials.map((item, i) => (
              <ReviewCard key={i} item={item} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function TeamSection({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  const members = c.team.filter((m) => m.name)
  if (members.length === 0) return null
  return (
    <section className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <h2 className={`mb-14 text-center ${t.sectionTitle}`}>{c.teamSectionTitle}</h2>
        <div className="grid gap-10 cmd:grid-cols-3">
          {members.map((m, i) => (
            <div key={i} className={t.teamCard}>
              {m.image && (
                <img src={m.image} alt="" className="mx-auto mb-4 h-40 w-40 rounded-full object-cover" />
              )}
              <h3 className={`text-lg font-semibold ${t.cardTitle}`}>{m.name}</h3>
              <p className={t.cardText}>{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBannerSection({ c, t, basePath }: { c: SiteContent; t: TemplateTheme; basePath: string }) {
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact', c)
  return (
    <section className={t.ctaBanner}>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">{c.ctaBannerTitle}</h2>
        <p className="mb-8 opacity-80 text-lg">{c.ctaBannerText}</p>
        <Link data-brand-cta to={ctaHref} className={`inline-block ${t.ctaBannerBtn}`} style={brandCtaStyle(c)}>{c.ctaText}</Link>
      </div>
    </section>
  )
}

function FooterSection({ c, t, navItems, basePath }: { c: SiteContent; t: TemplateTheme; navItems: SiteNavItem[]; basePath: string }) {
  const blurb = footerBlurb(c)
  const contact = [c.phone, c.email, c.reservationEmail, c.supportEmail, c.whatsapp, c.address].map((value) => value.trim()).filter(Boolean)
  return (
    <footer className={t.footer}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 text-sm csm:px-6 cmd:grid-cols-4">
        <div>
          <p className="text-base font-semibold">{c.businessName}</p>
          {blurb ? <p className="mt-3 leading-relaxed opacity-80">{blurb}</p> : null}
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider">Pages</p>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.page} to={sitePath(basePath, item.segment)} className="hover:underline opacity-80">{item.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider">Hours</p>
          <p className="opacity-80">{c.hours}</p>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider">Contact</p>
          <p className="opacity-80">{contact.map((line) => <span key={line} className="block">{line}</span>)}</p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-4 text-center csm:px-6">© {new Date().getFullYear()} {c.businessName}. {footerNote(c)}</p>
    </footer>
  )
}
