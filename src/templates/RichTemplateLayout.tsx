import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getTemplateMeta } from '../data/defaults'
import { getLayoutVariant, type ContactLayout, type HeroLayout, type TestimonialLayout } from '../data/layoutVariants'
import { getShowcaseConfig } from '../data/sectionConfig'
import { getSiteNavItems, resolveSiteHref, sitePath, type SiteNavItem, type SitePageId } from '../data/siteNav'
import type { BlogPostItem, ContactFieldKey, SiteContent, TemplateId } from '../types'
import { ContactFormBlock } from './ContactFormBlock'
import { getTheme } from './getTheme'
import { type SectionId, type TemplateTheme } from './themes'

interface Props {
  variant: TemplateId
  content: SiteContent
  basePath?: string
  page?: SitePageId
  blogSlug?: string
  colorSchemeId?: string
  layoutVariantId?: string
}

type PageSectionId = SectionId | 'blog-teaser' | 'blog-post'

const PAGE_SECTIONS: Record<SitePageId, PageSectionId[]> = {
  home: ['nav', 'hero', 'stats', 'blog-teaser', 'cta', 'footer'],
  about: ['nav', 'about', 'team', 'footer'],
  services: ['nav', 'services', 'steps', 'showcase', 'footer'],
  gallery: ['nav', 'gallery', 'footer'],
  reviews: ['nav', 'testimonials', 'footer'],
  blog: ['nav', 'blog', 'footer'],
  'blog-post': ['nav', 'blog-post', 'footer'],
  faq: ['nav', 'faq', 'footer'],
  contact: ['nav', 'contact', 'footer'],
}

export function RichTemplateLayout({
  variant,
  content: c,
  basePath = '/',
  page = 'home',
  blogSlug,
  colorSchemeId,
  layoutVariantId,
}: Props) {
  const t = getTheme(variant, colorSchemeId)
  const layout = getLayoutVariant(variant, layoutVariantId)
  const meta = getTemplateMeta(variant)
  const visibility = c.sectionVisibility
  const navItems = getSiteNavItems(variant, visibility)
  const order = PAGE_SECTIONS[page]

  const sections: Record<PageSectionId, ReactNode> = {
    nav: <NavSection c={c} t={t} variant={variant} navItems={navItems} basePath={basePath} />,
    hero: <HeroSection c={c} t={t} variant={variant} heroLayout={layout.heroLayout} basePath={basePath} />,
    stats: visibility.stats ? <StatsSection c={c} t={t} /> : null,
    about: <AboutSection c={c} t={t} />,
    services: visibility.services ? <ServicesSection c={c} t={t} meta={meta?.servicesLabel} /> : null,
    steps: visibility.steps ? <StepsSection c={c} t={t} /> : null,
    showcase: visibility.showcase ? <ShowcaseSection c={c} t={t} variant={variant} basePath={basePath} /> : null,
    gallery: <GallerySection c={c} t={t} />,
    testimonials: <TestimonialsSection c={c} t={t} layout={layout.testimonialLayout} />,
    blog: <BlogSection c={c} t={t} basePath={basePath} />,
    'blog-teaser': visibility.blog ? <BlogTeaserSection c={c} t={t} basePath={basePath} /> : null,
    'blog-post': <BlogPostSection c={c} t={t} basePath={basePath} slug={blogSlug ?? ''} />,
    team: visibility.team ? <TeamSection c={c} t={t} /> : null,
    faq: <FaqSection c={c} t={t} />,
    cta: visibility.cta ? <CtaBannerSection c={c} t={t} basePath={basePath} /> : null,
    contact: <ContactSection c={c} t={t} variant={variant} layout={layout.contactLayout} basePath={basePath} />,
    footer: <FooterSection c={c} t={t} navItems={navItems} basePath={basePath} />,
  }

  return (
    <div className={`min-h-screen ${t.page}`}>
      {order.map((id) => {
        const node = sections[id]
        if (node === null) return null
        return <div key={id}>{node}</div>
      })}
    </div>
  )
}

function NavSection({
  c, t, variant, navItems, basePath,
}: {
  c: SiteContent
  t: TemplateTheme
  variant: TemplateId
  navItems: SiteNavItem[]
  basePath: string
}) {
  const darkNav = ['creative', 'realtor', 'photography', 'fitness', 'saas', 'noir', 'arcade', 'vineyard'].includes(variant)
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact')
  return (
    <nav className={t.nav}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to={basePath} className={`text-xl font-bold ${darkNav ? 'text-white' : ''}`}>{c.businessName}</Link>
        <div className="hidden gap-6 text-sm font-medium lg:flex">
          {navItems.map((item) => (
            <Link key={item.page} to={sitePath(basePath, item.segment)} className={t.navLink}>{item.label}</Link>
          ))}
        </div>
        <Link to={ctaHref} className={t.navCta}>{c.ctaText}</Link>
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
    case 'noir':
    case 'coastal':
    case 'vineyard':
    case 'arcade':
      return `${base} pb-20 pt-28`
    case 'terra':
      return `${base} grid lg:grid-cols-2 gap-12 items-center py-24`
    default:
      return `${base} py-32`
  }
}

function HeroSection({ c, t, variant, heroLayout, basePath }: { c: SiteContent; t: TemplateTheme; variant: TemplateId; heroLayout: HeroLayout; basePath: string }) {
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact')
  const hasOverlay = ['creative', 'restaurant', 'fitness', 'realtor', 'photography', 'noir', 'coastal', 'vineyard', 'arcade'].includes(variant)
    || heroLayout === 'immersive'

  return (
    <header className={`relative ${t.hero} ${heroLayout === 'immersive' && !['restaurant', 'realtor', 'photography', 'creative', 'fitness', 'noir', 'coastal', 'vineyard', 'arcade'].includes(variant) ? 'min-h-[85vh] flex flex-col justify-center' : ''}`}>
      {hasOverlay && c.heroImage && (
        <>
          <img src={c.heroImage} alt="" className={`absolute inset-0 h-full w-full object-cover ${variant === 'noir' ? 'grayscale contrast-125' : ''}`} />
          <div className={`absolute inset-0 ${
            variant === 'creative' ? 'bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent'
              : variant === 'restaurant' ? 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
                : variant === 'fitness' ? 'bg-gradient-to-r from-black via-black/80 to-transparent'
                  : variant === 'realtor' ? 'bg-black/40'
                    : variant === 'noir' ? 'bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/30'
                      : variant === 'coastal' ? 'bg-gradient-to-t from-sky-950/90 via-sky-900/40 to-transparent'
                        : variant === 'vineyard' ? 'bg-gradient-to-r from-rose-950/90 via-rose-900/50 to-transparent'
                          : variant === 'arcade' ? 'bg-gradient-to-br from-fuchsia-950/80 via-black/70 to-lime-950/40'
                            : 'bg-black/30'
          }`} />
        </>
      )}
      <div className={heroContentClass(variant, heroLayout)}>
        {variant !== 'restaurant' && variant !== 'photography' && variant !== 'coastal' && (
          <p className={`mb-4 ${t.heroBadge}`}>{c.businessName}</p>
        )}
        {variant === 'coastal' && (
          <p className={`mb-4 ${t.heroBadge}`}>{c.businessName}</p>
        )}
        {variant === 'restaurant' && <p className={`mb-3 ${t.heroBadge}`}>Est. 2010</p>}
        <h1 className={`mb-6 ${t.heroTitle}`}>{c.tagline}</h1>
        <p className={`mb-8 ${t.heroText}`}>{c.heroSubtext || c.about.slice(0, 160)}</p>
        <Link to={ctaHref} className={`inline-block ${t.heroCta}`}>{c.ctaText} →</Link>
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

function ShowcaseSection({ c, t, variant, basePath }: { c: SiteContent; t: TemplateTheme; variant: TemplateId; basePath: string }) {
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
          {items.map((item, i) => {
            const card = (
              <>
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
              </>
            )
            const cls = `block ${t.showcaseCard}`
            if (item.link?.startsWith('http')) {
              return <a key={i} href={item.link} className={cls}>{card}</a>
            }
            return (
              <Link key={i} to={resolveSiteHref(basePath, item.link || 'contact')} className={cls}>
                {card}
              </Link>
            )
          })}
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

function formatBlogDate(date: string): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function blogPostSlug(post: BlogPostItem): string {
  return post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function BlogCard({ post, t, basePath }: { post: BlogPostItem; t: TemplateTheme; basePath: string }) {
  const slug = blogPostSlug(post)
  return (
    <Link to={sitePath(basePath, `blog/${slug}`)} className={`${t.showcaseCard} block`}>
      {post.image && (
        <img src={post.image} alt="" className={t.showcaseImage} />
      )}
      <div className="p-6">
        {post.date && (
          <p className={`mb-2 text-xs uppercase tracking-wider ${t.showcaseTag}`}>
            {formatBlogDate(post.date)}
          </p>
        )}
        <h3 className={`mb-2 text-lg font-semibold ${t.cardTitle}`}>{post.title}</h3>
        <p className={`mb-4 line-clamp-3 ${t.cardText}`}>{post.excerpt}</p>
        {post.author && (
          <p className={`text-sm font-medium ${t.cardTitle}`}>By {post.author}</p>
        )}
        <span className={`mt-3 inline-block text-sm font-semibold ${t.showcasePrice}`}>
          Read more →
        </span>
      </div>
    </Link>
  )
}

function BlogSection({ c, t, basePath }: { c: SiteContent; t: TemplateTheme; basePath: string }) {
  const posts = c.blogPosts.filter((post) => post.title)
  if (posts.length === 0) return null
  return (
    <section className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className={t.sectionTitle}>{c.blogSectionTitle}</h2>
          {c.blogSectionSubtitle && (
            <p className={`mx-auto mt-3 max-w-2xl ${t.sectionSubtitle}`}>{c.blogSectionSubtitle}</p>
          )}
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <BlogCard key={i} post={post} t={t} basePath={basePath} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BlogTeaserSection({ c, t, basePath }: { c: SiteContent; t: TemplateTheme; basePath: string }) {
  const posts = c.blogPosts.filter((post) => post.title).slice(0, 3)
  if (posts.length === 0) return null
  return (
    <section className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className={t.sectionTitle}>{c.blogSectionTitle}</h2>
            {c.blogSectionSubtitle && (
              <p className={`mt-2 ${t.sectionSubtitle}`}>{c.blogSectionSubtitle}</p>
            )}
          </div>
          <Link to={sitePath(basePath, 'blog')} className={`text-sm font-semibold ${t.showcasePrice}`}>
            View all posts →
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <BlogCard key={i} post={post} t={t} basePath={basePath} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BlogPostSection({ c, t, basePath, slug }: { c: SiteContent; t: TemplateTheme; basePath: string; slug: string }) {
  const post = c.blogPosts.find((p) => p.title && blogPostSlug(p) === slug)
  if (!post) {
    return (
      <section className={t.section}>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className={`mb-4 ${t.sectionTitle}`}>Post not found</h1>
          <Link to={sitePath(basePath, 'blog')} className={t.showcasePrice}>← Back to blog</Link>
        </div>
      </section>
    )
  }
  return (
    <section className={t.section}>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to={sitePath(basePath, 'blog')} className={`mb-8 inline-block text-sm opacity-70 hover:underline`}>
          ← Back to blog
        </Link>
        {post.date && (
          <p className={`mb-3 text-sm uppercase tracking-wider ${t.showcaseTag}`}>{formatBlogDate(post.date)}</p>
        )}
        <h1 className={`mb-4 text-4xl font-bold ${t.cardTitle}`}>{post.title}</h1>
        {post.author && <p className={`mb-8 ${t.cardText}`}>By {post.author}</p>}
        {post.image && (
          <img src={post.image} alt="" className="mb-10 w-full rounded-2xl aspect-[16/9] object-cover" />
        )}
        {post.excerpt && (
          <p className={`mb-8 border-l-4 pl-6 text-lg italic ${t.cardText}`}>{post.excerpt}</p>
        )}
        <div className={`space-y-6 text-lg leading-relaxed ${t.cardText}`}>
          {post.body.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
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

function CtaBannerSection({ c, t, basePath }: { c: SiteContent; t: TemplateTheme; basePath: string }) {
  const ctaHref = resolveSiteHref(basePath, c.ctaLink || 'contact')
  return (
    <section className={t.ctaBanner}>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">{c.ctaBannerTitle}</h2>
        <p className="mb-8 opacity-80 text-lg">{c.ctaBannerText}</p>
        <Link to={ctaHref} className={`inline-block ${t.ctaBannerBtn}`}>{c.ctaText}</Link>
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

function ContactSection({ c, t, variant, layout, basePath = '/' }: { c: SiteContent; t: TemplateTheme; variant: TemplateId; layout: ContactLayout; basePath?: string }) {
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
                <Link to={resolveSiteHref(basePath, c.ctaLink || 'contact')} className={t.navCta}>{c.ctaText}</Link>
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
          {basePath && <Link to={resolveSiteHref(basePath, c.ctaLink || 'contact')} className={t.navCta}>{c.ctaText}</Link>}
        </div>
      </div>
    </section>
  )
}

function FooterSection({ c, t, navItems, basePath }: { c: SiteContent; t: TemplateTheme; navItems: SiteNavItem[]; basePath: string }) {
  return (
    <footer className={t.footer}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 flex flex-wrap justify-center gap-6 text-sm">
          {navItems.map((item) => (
            <Link key={item.page} to={sitePath(basePath, item.segment)} className="hover:underline opacity-70">{item.label}</Link>
          ))}
        </div>
        <p>© {new Date().getFullYear()} {c.businessName}. All rights reserved.</p>
      </div>
    </footer>
  )
}