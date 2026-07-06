import type { ReactNode } from 'react'
import { getTemplateMeta } from '../data/defaults'
import type { ContactFieldKey, SiteContent, TemplateId } from '../types'
import { getTheme } from './getTheme'
import { sectionOrders, type SectionId, type TemplateTheme } from './themes'

interface Props {
  variant: TemplateId
  content: SiteContent
  colorSchemeId?: string
}

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#testimonials', label: 'Reviews' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

export function RichTemplateLayout({ variant, content: c, colorSchemeId }: Props) {
  const t = getTheme(variant, colorSchemeId)
  const order = sectionOrders[variant]
  const meta = getTemplateMeta(variant)

  const sections: Record<SectionId, ReactNode> = {
    nav: <NavSection c={c} t={t} variant={variant} />,
    hero: <HeroSection c={c} t={t} variant={variant} />,
    stats: <StatsSection c={c} t={t} />,
    about: <AboutSection c={c} t={t} />,
    services: <ServicesSection c={c} t={t} meta={meta?.servicesLabel} />,
    steps: <StepsSection c={c} t={t} />,
    gallery: <GallerySection c={c} t={t} />,
    testimonials: <TestimonialsSection c={c} t={t} />,
    team: <TeamSection c={c} t={t} />,
    faq: <FaqSection c={c} t={t} />,
    cta: <CtaBannerSection c={c} t={t} />,
    contact: <ContactSection c={c} t={t} variant={variant} />,
    footer: <FooterSection c={c} t={t} />,
  }

  return (
    <div className={`min-h-screen ${t.page}`}>
      {order.map((id) => (
        <div key={id}>{sections[id]}</div>
      ))}
    </div>
  )
}

function NavSection({ c, t, variant }: { c: SiteContent; t: TemplateTheme; variant: TemplateId }) {
  const darkNav = ['creative', 'realtor', 'photography'].includes(variant)
  return (
    <nav className={t.nav}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className={`text-xl font-bold ${darkNav ? 'text-white' : ''}`}>{c.businessName}</span>
        <div className="hidden gap-6 text-sm font-medium lg:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className={t.navLink}>{l.label}</a>
          ))}
        </div>
        <a href={c.ctaLink} className={t.navCta}>{c.ctaText}</a>
      </div>
    </nav>
  )
}

function HeroSection({ c, t, variant }: { c: SiteContent; t: TemplateTheme; variant: TemplateId }) {
  const hasOverlay = ['creative', 'restaurant', 'fitness', 'realtor', 'photography'].includes(variant)

  return (
    <header className={`relative ${t.hero}`}>
      {hasOverlay && c.heroImage && (
        <>
          <img src={c.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className={`absolute inset-0 ${variant === 'creative' ? 'bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent' : variant === 'restaurant' ? 'bg-gradient-to-t from-black/70 via-black/30 to-transparent' : variant === 'fitness' ? 'bg-gradient-to-r from-black via-black/80 to-transparent' : variant === 'realtor' ? 'bg-black/40' : 'bg-black/30'}`} />
        </>
      )}
      <div className={`relative mx-auto max-w-6xl px-6 ${variant === 'boutique' ? '' : variant === 'saas' ? 'grid lg:grid-cols-2 gap-12 items-center' : variant === 'medical' ? 'grid lg:grid-cols-2 gap-12 items-center' : variant === 'business' ? 'grid lg:grid-cols-2 gap-12 items-center py-24' : variant === 'restaurant' ? 'pb-16 pt-32' : variant === 'realtor' ? 'absolute bottom-12 left-0 right-0' : variant === 'photography' ? 'absolute bottom-16 left-8 right-8' : 'py-32'}`}>
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
  return (
    <section className={t.stats}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4 text-center">
        {c.stats.map((s, i) => (
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
  return (
    <section id="services" className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className={t.sectionTitle}>{c.servicesSectionTitle || meta}</h2>
          <p className={t.sectionSubtitle}>{c.servicesSectionSubtitle}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {c.services.map((s, i) => (
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
  return (
    <section className={t.section}>
      <div className="mx-auto max-w-6xl px-6">
        <h2 className={`mb-14 text-center ${t.sectionTitle}`}>{c.stepsSectionTitle}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {c.steps.map((step, i) => (
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

function TestimonialsSection({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  return (
    <section id="testimonials" className={t.section}>
      <div className="mx-auto max-w-6xl px-6">
        <h2 className={`mb-14 text-center ${t.sectionTitle}`}>{c.testimonialsSectionTitle}</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {c.testimonials.map((item, i) => (
            <div key={i} className={t.testimonial}>
              <p className={`mb-6 text-lg leading-relaxed ${t.cardText}`}>"{item.quote}"</p>
              <p className={`font-semibold ${t.cardTitle}`}>{item.author}</p>
              <p className={`text-sm ${t.cardText}`}>{item.role}</p>
            </div>
          ))}
        </div>
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
  return (
    <section id="faq" className={t.section}>
      <div className="mx-auto max-w-3xl px-6">
        <h2 className={`mb-14 text-center ${t.sectionTitle}`}>{c.faqSectionTitle}</h2>
        <div>
          {c.faqs.map((faq, i) => (
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

function ContactSection({ c, t, variant }: { c: SiteContent; t: TemplateTheme; variant: TemplateId }) {
  const meta = getTemplateMeta(variant)
  if (!meta) return null

  return (
    <section id="contact" className={t.contact}>
      <div className="mx-auto max-w-6xl px-6">
        <h2 className={`mb-10 text-3xl font-bold ${variant === 'boutique' || variant === 'restaurant' ? 'text-center' : ''}`}>
          Get in Touch
        </h2>
        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${variant === 'boutique' || variant === 'restaurant' ? 'text-center max-w-3xl mx-auto' : ''}`}>
          {meta.contactFields.map((field) => {
            const value = c[field.key as ContactFieldKey]
            if (!value) return null
            return (
              <div key={field.key}>
                <p className={`mb-1 ${t.contactLabel}`}>{field.label}</p>
                <p className="break-all">{value}</p>
              </div>
            )
          })}
        </div>
        <div className={`mt-10 ${variant === 'boutique' || variant === 'restaurant' ? 'text-center' : ''}`}>
          <a href={c.ctaLink} className={t.navCta}>{c.ctaText}</a>
        </div>
      </div>
    </section>
  )
}

function FooterSection({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  return (
    <footer className={t.footer}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 flex flex-wrap justify-center gap-6 text-sm">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:underline opacity-70">{l.label}</a>
          ))}
        </div>
        <p>© {new Date().getFullYear()} {c.businessName}. All rights reserved.</p>
      </div>
    </footer>
  )
}