import type { ReactNode } from 'react'
import { getTemplateMeta } from '../data/defaults'
import { getLayoutVariant, type ContactLayout, type HeroLayout, type TestimonialLayout } from '../data/layoutVariants'
import { getShowcaseConfig } from '../data/sectionConfig'
import type { ContactFieldKey, SectionVisibility, SiteContent, TemplateId } from '../types'
import { ContactFormBlock } from './ContactFormBlock'
import { getTheme } from './getTheme'
import { type SectionId, type TemplateTheme } from './themes'

interface Props {
  variant: TemplateId
  content: SiteContent
  colorSchemeId?: string
  layoutVariantId?: string
}

interface NavLink {
  href: string
  label: string
  section: SectionId
}

function getNavLinks(variant: TemplateId, visibility: SectionVisibility): NavLink[] {
  const showcaseCfg = getShowcaseConfig(variant)
  const links: NavLink[] = []

  if (visibility.showcase) links.push({ href: '#showcase', label: showcaseCfg.navLabel, section: 'showcase' })
  if (visibility.about) links.push({ href: '#about', label: 'About', section: 'about' })
  if (visibility.services) links.push({ href: '#services', label: 'Services', section: 'services' })
  if (visibility.gallery) links.push({ href: '#gallery', label: 'Gallery', section: 'gallery' })
  links.push({ href: '#testimonials', label: 'Reviews', section: 'testimonials' })
  if (visibility.faq) links.push({ href: '#faq', label: 'FAQ', section: 'faq' })
  links.push({ href: '#contact', label: 'Contact', section: 'contact' })

  return links
}

function isSectionVisible(id: SectionId, visibility: SectionVisibility): boolean {
  const map: Partial<Record<SectionId, keyof SectionVisibility>> = {
    stats: 'stats',
    about: 'about',
    services: 'services',
    steps: 'steps',
    showcase: 'showcase',
    gallery: 'gallery',
    team: 'team',
    faq: 'faq',
    cta: 'cta',
  }
  const key = map[id]
  if (!key) return true
  return visibility[key]
}

export function RichTemplateLayout({ variant, content: c, colorSchemeId, layoutVariantId }: Props) {
  const t = getTheme(variant, colorSchemeId)
  const layout = getLayoutVariant(variant, layoutVariantId)
  const order = layout.sectionOrder
  const meta = getTemplateMeta(variant)
  const visibility = c.sectionVisibility
  const navLinks = getNavLinks(variant, visibility)

  const sections: Record<SectionId, ReactNode> = {
    nav: <NavSection c={c} t={t} variant={variant} navLinks={navLinks} />,
    hero: <HeroSection c={c} t={t} variant={variant} heroLayout={layout.heroLayout} />,
    stats: <StatsSection c={c} t={t} />,
    about: <AboutSection c={c} t={t} />,
    services: <ServicesSection c={c} t={t} meta={meta?.servicesLabel} />,
    steps: <StepsSection c={c} t={t} />,
    showcase: <ShowcaseSection c={c} t={t} variant={variant} />,
    gallery: <GallerySection c={c} t={t} />,
    testimonials: <TestimonialsSection c={c} t={t} layout={layout.testimonialLayout} />,
    team: <TeamSection c={c} t={t} />,
    faq: <FaqSection c={c} t={t} />,
    cta: <CtaBannerSection c={c} t={t} />,
    contact: <ContactSection c={c} t={t} variant={variant} layout={layout.contactLayout} />,
    footer: <FooterSection c={c} t={t} navLinks={navLinks} />,
  }

  return (
    <div className={`min-h-screen ${t.page}`}>
      {order.map((id) => {
        if (!isSectionVisible(id, visibility)) return null
        const node = sections[id]
        if (node === null) return null
        return <div key={id}>{node}</div>
      })}
    </div>
  )
}

function NavSection({
  c, t, variant, navLinks,
}: {
  c: SiteContent
  t: TemplateTheme
  variant: TemplateId
  navLinks: NavLink[]
}) {
  const darkNav = ['creative', 'realtor', 'photography', 'fitness', 'saas'].includes(variant)
  return (
    <nav className={t.nav}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className={`text-xl font-bold ${darkNav ? 'text-white' : ''}`}>{c.businessName}</span>
        <div className="hidden gap-6 text-sm font-medium lg:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className={t.navLink}>{l.label}</a>
          ))}
        </div>
        <a href={c.ctaLink} className={t.navCta}>{c.ctaText}</a>
      </div>
    </nav>
  )
}

function heroContentClass(variant: TemplateId, heroLayout: HeroLayout): string {
  const base = 'relative mx-auto max-w-6xl px-6 w-full'
  if (heroLayout === 'centered') {
    return `${base} text-center py-24 flex flex-col items-center`
  }
  switch (variant) {
    case 'boutique':
      return heroLayout === 'immersive' ? `${base} py-32` : base
    case 'saas':
    case 'medical':
    case 'business':
      return heroLayout === 'immersive'
        ? `${base} py-32 text-center`
        : `${base} grid lg:grid-cols-2 gap-12 items-center py-24`
    case 'restaurant':
      return `${base} pb-16 pt-28`
    case 'realtor':
    case 'photography':
      return `${base} pb-16 pt-28`
    case 'creative':
      return base
    case 'fitness':
      return `${base} py-28`
    default:
      return `${base} py-32`
  }
}

function HeroSection({ c, t, variant, heroLayout }: { c: SiteContent; t: TemplateTheme; variant: TemplateId; heroLayout: HeroLayout }) {
  const hasOverlay = ['creative', 'restaurant', 'fitness', 'realtor', 'photography'].includes(variant)
    || heroLayout === 'immersive'

  return (
    <header className={`relative ${t.hero} ${heroLayout === 'immersive' && !['restaurant', 'realtor', 'photography', 'creative', 'fitness'].includes(variant) ? 'min-h-[85vh] flex flex-col justify-center' : ''}`}>
      {hasOverlay && c.heroImage && (
        <>
          <img src={c.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className={`absolute inset-0 ${variant === 'creative' ? 'bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent' : variant === 'restaurant' ? 'bg-gradient-to-t from-black/70 via-black/30 to-transparent' : variant === 'fitness' ? 'bg-gradient-to-r from-black via-black/80 to-transparent' : variant === 'realtor' ? 'bg-black/40' : 'bg-black/30'}`} />
        </>
      )}
      <div className={heroContentClass(variant, heroLayout)}>
        {variant !== 'restaurant' && variant !== 'photography' && (
          <p className={`mb-4 ${t.heroBadge}`}>{c.businessName}</p>
        )}
        {variant === 'restaurant' && <p className={`mb-3 ${t.heroBadge}`}>Est. 2010</p>}
        <h1 className={`mb-6 ${t.heroTitle}`}>{c.tagline}</h1>
        <p className={`mb-8 ${t.heroText}`}>{c.heroSubtext || c.about.slice(0, 160)}</p>
        <a href={c.ctaLink} className={`inline-block ${t.heroCta}`}>{c.ctaText} →</a>
        {!hasOverlay && c.heroImage && variant !== 'boutique' && (
          <img src={c.heroImage} alt="" className="rounded-2xl shadow-2xl w-full mt-8 lg:mt-0" />
        )}
        {variant === 'boutique' && c.heroImage && (
          <img src={c.heroImage} alt="" className="mx-auto mt-10 max-h-[500px] w-full max-w-4xl object-cover" />
        )}
      </div>
    </header>
  )
}

function StatsSection({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  const stats = c.stats.filter((s) => s.value)
  if (stats.length === 0) return null
  return (
    <section className={t.stats}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4 text-center">
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
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
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
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className={t.sectionTitle}>{c.servicesSectionTitle || meta}</h2>
          <p className={t.sectionSubtitle}>{c.servicesSectionSubtitle}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      <div className="mx-auto max-w-6xl px-6">
        <h2 className={`mb-14 text-center ${t.sectionTitle}`}>{c.stepsSectionTitle}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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

function ShowcaseSection({ c, t, variant }: { c: SiteContent; t: TemplateTheme; variant: TemplateId }) {
  const cfg = getShowcaseConfig(variant)
  const items = c.showcaseItems.filter((item) => item.title)
  if (items.length === 0) return null

  return (
    <section id="showcase" className={t.showcase}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className={t.sectionTitle}>{c.showcaseSectionTitle || cfg.sectionTitle}</h2>
          <p className={t.sectionSubtitle}>{c.showcaseSectionSubtitle || cfg.sectionSubtitle}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <a key={i} href={item.link || '#contact'} className={`block ${t.showcaseCard}`}>
              {item.image && (
                <img src={item.image} alt="" className={t.showcaseImage} />
              )}
              <div className="p-6">
                {cfg.showTag && item.tag && (
                  <p className={`mb-2 ${t.showcaseTag}`}>{item.tag}</p>
                )}
                <h3 className={`mb-2 ${t.cardTitle}`}>{item.title}</h3>
                <p className={`mb-4 ${t.cardText}`}>{item.description}</p>
                {cfg.showPrice && item.price && (
                  <p className={t.showcasePrice}>{item.price}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function GallerySection({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  const images = c.galleryImages.filter(Boolean)
  if (images.length === 0) return null
  return (
    <section id="gallery" className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-6">
        <h2 className={`mb-14 text-center ${t.sectionTitle}`}>{c.gallerySectionTitle}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {images.map((img, i) => (
            <img key={i} src={img} alt="" className={t.gallery} />
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
      <div className="mx-auto max-w-6xl px-6">
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.slice(1).map((item, i) => (
                  <ReviewCard key={i} item={item} t={t} />
                ))}
              </div>
            )}
          </div>
        ) : layout === 'list' ? (
          <div className="mx-auto max-w-3xl space-y-6">
            {testimonials.map((item, i) => (
              <div key={i} className={`${t.testimonial} flex flex-col sm:flex-row sm:items-start sm:gap-6`}>
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
          <div className="grid gap-8 md:grid-cols-3">
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
      <div className="mx-auto max-w-6xl px-6">
        <h2 className={`mb-14 text-center ${t.sectionTitle}`}>{c.teamSectionTitle}</h2>
        <div className="grid gap-10 md:grid-cols-3">
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

function FaqSection({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  const faqs = c.faqs.filter((faq) => faq.question)
  if (faqs.length === 0) return null
  return (
    <section id="faq" className={t.section}>
      <div className="mx-auto max-w-3xl px-6">
        <h2 className={`mb-14 text-center ${t.sectionTitle}`}>{c.faqSectionTitle}</h2>
        <div>
          {faqs.map((faq, i) => (
            <div key={i} className={t.faq}>
              <h3 className={`mb-3 font-semibold ${t.cardTitle}`}>{faq.question}</h3>
              <p className={t.cardText}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBannerSection({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  return (
    <section className={t.ctaBanner}>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">{c.ctaBannerTitle}</h2>
        <p className="mb-8 opacity-80 text-lg">{c.ctaBannerText}</p>
        <a href={c.ctaLink} className={`inline-block ${t.ctaBannerBtn}`}>{c.ctaText}</a>
      </div>
    </section>
  )
}

function ContactInfo({ c, t, variant, meta, centered }: {
  c: SiteContent
  t: TemplateTheme
  variant: TemplateId
  meta: NonNullable<ReturnType<typeof getTemplateMeta>>
  centered?: boolean
}) {
  const fields = meta.contactFields.filter((field) => c[field.key as ContactFieldKey])
  if (fields.length === 0) return null
  return (
    <div className={`grid gap-6 sm:grid-cols-2 ${centered ? 'text-center max-w-3xl mx-auto' : ''} ${variant === 'boutique' || variant === 'restaurant' ? 'lg:grid-cols-2' : 'lg:grid-cols-2'}`}>
      {fields.map((field) => (
        <div key={field.key}>
          <p className={`mb-1 ${t.contactLabel}`}>{field.label}</p>
          <p className="break-all">{c[field.key as ContactFieldKey]}</p>
        </div>
      ))}
    </div>
  )
}

function ContactSection({ c, t, variant, layout }: { c: SiteContent; t: TemplateTheme; variant: TemplateId; layout: ContactLayout }) {
  const meta = getTemplateMeta(variant)
  if (!meta) return null

  const centered = variant === 'boutique' || variant === 'restaurant'
  const title = c.contactSectionTitle || 'Get in Touch'

  if (layout === 'split') {
    return (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-6xl px-6">
          <h2 className={`mb-10 text-3xl font-bold ${centered ? 'text-center' : ''}`}>{title}</h2>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <h3 className={`mb-6 text-xl font-semibold ${t.cardTitle}`}>{c.contactFormTitle}</h3>
              <ContactInfo c={c} t={t} variant={variant} meta={meta} />
              <div className="mt-8">
                <a href={c.ctaLink} className={t.navCta}>{c.ctaText}</a>
              </div>
            </div>
            <ContactFormBlock c={c} t={t} layout={layout} />
          </div>
        </div>
      </section>
    )
  }

  if (layout === 'form-focus') {
    return (
      <section id="contact" className={t.contact}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <h2 className={`mb-4 text-3xl font-bold ${centered ? 'text-center lg:text-left' : ''}`}>{title}</h2>
              <p className={`mb-8 ${t.cardText}`}>We would love to hear from you. Reach out using the form or contact details below.</p>
              <ContactInfo c={c} t={t} variant={variant} meta={meta} />
            </div>
            <div>
              <h3 className={`mb-4 text-xl font-semibold ${t.cardTitle}`}>{c.contactFormTitle}</h3>
              <ContactFormBlock c={c} t={t} layout={layout} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className={t.contact}>
      <div className="mx-auto max-w-6xl px-6">
        <h2 className={`mb-10 text-3xl font-bold ${centered ? 'text-center' : ''}`}>{title}</h2>
        <ContactInfo c={c} t={t} variant={variant} meta={meta} centered={centered} />
        <div className={`mt-12 ${centered ? 'max-w-3xl mx-auto' : ''}`}>
          <h3 className={`mb-6 text-xl font-semibold ${t.cardTitle} ${centered ? 'text-center' : ''}`}>{c.contactFormTitle}</h3>
          <ContactFormBlock c={c} t={t} layout={layout} />
        </div>
        <div className={`mt-10 ${centered ? 'text-center' : ''}`}>
          <a href={c.ctaLink} className={t.navCta}>{c.ctaText}</a>
        </div>
      </div>
    </section>
  )
}

function FooterSection({ c, t, navLinks }: { c: SiteContent; t: TemplateTheme; navLinks: NavLink[] }) {
  return (
    <footer className={t.footer}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 flex flex-wrap justify-center gap-6 text-sm">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:underline opacity-70">{l.label}</a>
          ))}
        </div>
        <p>© {new Date().getFullYear()} {c.businessName}. All rights reserved.</p>
      </div>
    </footer>
  )
}