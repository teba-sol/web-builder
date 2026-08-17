import { Link } from 'react-router-dom'
import { getShowcaseConfig } from '../data/sectionConfig'
import { canLinkToPage, resolveSiteHref } from '../data/siteNav'
import type { BlogPostItem, NewsItem, SiteContent, TemplateId } from '../types'
import { getPageLayouts } from './pageLayouts'
import type { TemplateTheme } from './themes'

export function formatPostDate(date: string): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function postSlug(title: string, slug?: string): string {
  return slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

interface LayoutProps {
  c: SiteContent
  t: TemplateTheme
  variant: TemplateId
  basePath: string
}

// ─── Blog listing ───────────────────────────────────────────────────────────

function BlogCard({ post, t, basePath, c, featured }: { post: BlogPostItem; t: TemplateTheme; basePath: string; c: SiteContent; featured?: boolean }) {
  const slug = postSlug(post.title, post.slug)
  const cls = featured ? `lg:col-span-2 ${t.showcaseCard} block` : `${t.showcaseCard} block`
  return (
    <Link to={resolveSiteHref(basePath, `blog/${slug}`, c)} className={cls}>
      {post.image && <img src={post.image} alt="" className={t.showcaseImage} />}
      <div className={featured ? 'p-8' : 'p-6'}>
        {post.date && <p className={`mb-2 text-xs uppercase tracking-wider ${t.showcaseTag}`}>{formatPostDate(post.date)}</p>}
        <h3 className={`mb-2 font-semibold ${featured ? 'text-2xl' : 'text-lg'} ${t.cardTitle}`}>{post.title}</h3>
        <p className={`mb-4 line-clamp-3 ${t.cardText}`}>{post.excerpt}</p>
        {post.author && <p className={`text-sm font-medium ${t.cardTitle}`}>By {post.author}</p>}
        <span className={`mt-3 inline-block text-sm font-semibold ${t.showcasePrice}`}>Read more →</span>
      </div>
    </Link>
  )
}

export function BlogListPage({ c, t, variant, basePath }: LayoutProps) {
  const posts = c.blogPosts.filter((p) => p.title)
  if (posts.length === 0) return <EmptyPage t={t} title={c.blogSectionTitle} message="Add blog posts in the editor to populate this page." />
  const layout = getPageLayouts(variant).blog

  return (
    <section className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <PageHeader title={c.blogSectionTitle} subtitle={c.blogSectionSubtitle} t={t} />
        {layout === 'magazine' ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <BlogCard post={posts[0]} t={t} basePath={basePath} c={c} featured />
            <div className="grid gap-8 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
              {posts.slice(1).map((post, i) => <BlogCard key={i} post={post} t={t} basePath={basePath} c={c} />)}
            </div>
          </div>
        ) : layout === 'minimal' ? (
          <div className="mx-auto max-w-2xl divide-y">
            {posts.map((post, i) => {
              const slug = postSlug(post.title, post.slug)
              return (
                <Link key={i} to={resolveSiteHref(basePath, `blog/${slug}`, c)} className="block py-8 group">
                  {post.date && <p className={`mb-2 text-xs uppercase tracking-wider ${t.showcaseTag}`}>{formatPostDate(post.date)}</p>}
                  <h3 className={`mb-2 text-xl font-semibold group-hover:underline ${t.cardTitle}`}>{post.title}</h3>
                  <p className={`line-clamp-2 ${t.cardText}`}>{post.excerpt}</p>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => <BlogCard key={i} post={post} t={t} basePath={basePath} c={c} />)}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Blog post detail ───────────────────────────────────────────────────────

export function BlogPostPage({ c, t, variant, basePath, slug }: LayoutProps & { slug: string }) {
  const post = c.blogPosts.find((p) => p.title && postSlug(p.title, p.slug) === slug)
  if (!post) return <NotFoundPage t={t} backLabel="← Back to blog" backTo={resolveSiteHref(basePath, 'blog', c)} />
  const layout = getPageLayouts(variant).blogPost

  if (layout === 'split') {
    return (
      <section className={t.section}>
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-2 lg:items-start">
          <div>
            <BackLink to={resolveSiteHref(basePath, 'blog', c)} />
            {post.date && <p className={`mb-3 text-sm uppercase tracking-wider ${t.showcaseTag}`}>{formatPostDate(post.date)}</p>}
            <h1 className={`mb-4 text-4xl font-bold ${t.cardTitle}`}>{post.title}</h1>
            {post.author && <p className={`mb-6 ${t.cardText}`}>By {post.author}</p>}
            {post.excerpt && <p className={`border-l-4 pl-6 text-lg italic ${t.cardText}`}>{post.excerpt}</p>}
          </div>
          <div>
            {post.image && <img src={post.image} alt="" className="mb-8 w-full rounded-2xl object-cover" />}
            <PostBody body={post.body} t={t} />
          </div>
        </div>
      </section>
    )
  }

  if (layout === 'editorial') {
    return (
      <section className={t.section}>
        {post.image && (
          <div className="relative mb-12 h-72 md:h-96">
            <img src={post.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-4xl px-6 pb-10">
              <h1 className="text-4xl font-bold text-white md:text-5xl">{post.title}</h1>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-3xl px-6 pb-16">
          <BackLink to={resolveSiteHref(basePath, 'blog', c)} />
          {!post.image && <h1 className={`mb-4 text-4xl font-bold ${t.cardTitle}`}>{post.title}</h1>}
          <div className={`mb-10 flex gap-4 text-sm ${t.cardText}`}>
            {post.date && <span>{formatPostDate(post.date)}</span>}
            {post.author && <span>· By {post.author}</span>}
          </div>
          {post.excerpt && <p className={`mb-10 text-2xl leading-relaxed ${t.cardText}`}>{post.excerpt}</p>}
          <PostBody body={post.body} t={t} large />
        </div>
      </section>
    )
  }

  return (
    <section className={t.section}>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <BackLink to={resolveSiteHref(basePath, 'blog', c)} />
        {post.date && <p className={`mb-3 text-sm uppercase tracking-wider ${t.showcaseTag}`}>{formatPostDate(post.date)}</p>}
        <h1 className={`mb-4 text-4xl font-bold ${t.cardTitle}`}>{post.title}</h1>
        {post.author && <p className={`mb-8 ${t.cardText}`}>By {post.author}</p>}
        {post.image && <img src={post.image} alt="" className="mb-10 aspect-[16/9] w-full rounded-2xl object-cover" />}
        {post.excerpt && <p className={`mb-8 border-l-4 pl-6 text-lg italic ${t.cardText}`}>{post.excerpt}</p>}
        <PostBody body={post.body} t={t} />
      </div>
    </section>
  )
}

// ─── News listing ───────────────────────────────────────────────────────────

function NewsCard({ post, t, basePath, c }: { post: NewsItem; t: TemplateTheme; basePath: string; c: SiteContent }) {
  const slug = postSlug(post.title, post.slug)
  return (
    <Link to={resolveSiteHref(basePath, `news/${slug}`, c)} className={`${t.showcaseCard} block`}>
      {post.image && <img src={post.image} alt="" className={t.showcaseImage} />}
      <div className="p-6">
        {post.date && <p className={`mb-2 text-xs uppercase tracking-wider ${t.showcaseTag}`}>{formatPostDate(post.date)}</p>}
        <h3 className={`mb-2 text-lg font-semibold ${t.cardTitle}`}>{post.title}</h3>
        <p className={`line-clamp-2 ${t.cardText}`}>{post.excerpt}</p>
      </div>
    </Link>
  )
}

export function NewsListPage({ c, t, variant, basePath }: LayoutProps) {
  const posts = c.newsPosts.filter((p) => p.title)
  if (posts.length === 0) return <EmptyPage t={t} title={c.newsSectionTitle} message="Add news items in the editor to populate this page." />
  const layout = getPageLayouts(variant).news

  return (
    <section className={t.section}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <PageHeader title={c.newsSectionTitle} subtitle={c.newsSectionSubtitle} t={t} />
        {layout === 'timeline' ? (
          <div className="mx-auto max-w-3xl space-y-0">
            {posts.map((post, i) => {
              const slug = postSlug(post.title, post.slug)
              return (
                <Link key={i} to={resolveSiteHref(basePath, `news/${slug}`, c)} className="group flex gap-8 border-l-2 py-8 pl-8 hover:border-current">
                  <div className="w-28 shrink-0">
                    {post.date && <p className={`text-sm font-semibold ${t.showcaseTag}`}>{formatPostDate(post.date)}</p>}
                  </div>
                  <div>
                    <h3 className={`mb-2 text-xl font-semibold group-hover:underline ${t.cardTitle}`}>{post.title}</h3>
                    <p className={t.cardText}>{post.excerpt}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : layout === 'compact' ? (
          <div className="mx-auto max-w-2xl divide-y">
            {posts.map((post, i) => {
              const slug = postSlug(post.title, post.slug)
              return (
                <Link key={i} to={resolveSiteHref(basePath, `news/${slug}`, c)} className="flex items-baseline justify-between gap-4 py-5 group">
                  <h3 className={`font-semibold group-hover:underline ${t.cardTitle}`}>{post.title}</h3>
                  {post.date && <span className={`shrink-0 text-xs ${t.showcaseTag}`}>{formatPostDate(post.date)}</span>}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => <NewsCard key={i} post={post} t={t} basePath={basePath} c={c} />)}
          </div>
        )}
      </div>
    </section>
  )
}

export function NewsPostPage({ c, t, variant, basePath, slug }: LayoutProps & { slug: string }) {
  const post = c.newsPosts.find((p) => p.title && postSlug(p.title, p.slug) === slug)
  if (!post) return <NotFoundPage t={t} backLabel="← Back to news" backTo={resolveSiteHref(basePath, 'news', c)} />
  const layout = getPageLayouts(variant).newsPost

  if (layout === 'press') {
    return (
      <section className={t.sectionAlt}>
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className={`mb-4 text-xs font-bold uppercase tracking-widest ${t.showcaseTag}`}>Press Release</p>
          <h1 className={`mb-6 text-4xl font-bold ${t.cardTitle}`}>{post.title}</h1>
          <div className={`mb-10 flex gap-6 border-b pb-6 text-sm ${t.cardText}`}>
            {post.date && <span>{formatPostDate(post.date)}</span>}
            {post.author && <span>{post.author}</span>}
          </div>
          {post.image && <img src={post.image} alt="" className="mb-10 w-full rounded-xl object-cover" />}
          <PostBody body={post.body} t={t} />
          <div className="mt-12"><BackLink to={resolveSiteHref(basePath, 'news', c)} label="← All news" /></div>
        </div>
      </section>
    )
  }

  if (layout === 'split') {
    return (
      <section className={t.section}>
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <BackLink to={resolveSiteHref(basePath, 'news', c)} />
            <h1 className={`mb-4 text-3xl font-bold ${t.cardTitle}`}>{post.title}</h1>
            {post.date && <p className={`text-sm ${t.showcaseTag}`}>{formatPostDate(post.date)}</p>}
          </div>
          <div>
            {post.image && <img src={post.image} alt="" className="mb-8 w-full rounded-xl object-cover" />}
            <PostBody body={post.body} t={t} />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={t.section}>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <BackLink to={resolveSiteHref(basePath, 'news', c)} />
        {post.date && <p className={`mb-3 text-sm uppercase tracking-wider ${t.showcaseTag}`}>{formatPostDate(post.date)}</p>}
        <h1 className={`mb-6 text-4xl font-bold ${t.cardTitle}`}>{post.title}</h1>
        {post.image && <img src={post.image} alt="" className="mb-10 w-full rounded-2xl object-cover" />}
        <PostBody body={post.body} t={t} />
      </div>
    </section>
  )
}

// ─── Gallery ────────────────────────────────────────────────────────────────

export function GalleryPage({ c, t, variant }: Omit<LayoutProps, 'basePath'>) {
  const images = c.galleryImages.filter(Boolean)
  if (images.length === 0) return <EmptyPage t={t} title={c.gallerySectionTitle} message="Add gallery images in the editor to populate this page." />
  const layout = getPageLayouts(variant).gallery

  return (
    <section className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <PageHeader title={c.gallerySectionTitle} t={t} centered />
        {layout === 'masonry' ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {images.map((img, i) => (
              <img key={i} src={img} alt="" className={`mb-4 w-full break-inside-avoid ${t.gallery}`} />
            ))}
          </div>
        ) : layout === 'rows' ? (
          <div className="space-y-6">
            {images.map((img, i) => (
              <img key={i} src={img} alt="" className={`w-full ${t.gallery} ${i % 2 === 0 ? 'max-h-[480px] object-cover' : 'max-h-72 object-cover'}`} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {images.map((img, i) => <img key={i} src={img} alt="" className={t.gallery} />)}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export function PortfolioPage({ c, t, variant, basePath }: LayoutProps) {
  const cfg = getShowcaseConfig(variant)
  const items = c.showcaseItems.filter((i) => i.title)
  if (items.length === 0) return <EmptyPage t={t} title={c.showcaseSectionTitle || cfg.sectionTitle} message="Add portfolio items in the editor to populate this page." />
  const layout = getPageLayouts(variant).portfolio

  const ItemCard = ({ item, i, large }: { item: typeof items[0]; i: number; large?: boolean }) => {
    const inner = (
      <>
        {item.image && <img src={item.image} alt="" className={large ? 'aspect-[21/9] w-full object-cover' : t.showcaseImage} />}
        <div className={large ? 'p-10' : 'p-6'}>
          {cfg.showTag && item.tag && <p className={`mb-2 ${t.showcaseTag}`}>{item.tag}</p>}
          <h3 className={`mb-2 font-semibold ${large ? 'text-2xl' : ''} ${t.cardTitle}`}>{item.title}</h3>
          <p className={`${large ? 'text-lg' : ''} ${t.cardText}`}>{item.description}</p>
          {cfg.showPrice && item.price && <p className={`mt-3 ${t.showcasePrice}`}>{item.price}</p>}
        </div>
      </>
    )
    const cls = `block ${t.showcaseCard}`
    return item.link?.startsWith('http')
      ? <a key={i} href={item.link} className={cls}>{inner}</a>
      : <Link key={i} to={resolveSiteHref(basePath, item.link || 'contact', c)} className={cls}>{inner}</Link>
  }

  return (
    <section className={t.showcase}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <PageHeader title={c.showcaseSectionTitle || cfg.sectionTitle} subtitle={c.showcaseSectionSubtitle || cfg.sectionSubtitle} t={t} />
        {layout === 'case-study' ? (
          <div className="space-y-16">
            {items.map((item, i) => <ItemCard key={i} item={item} i={i} large />)}
          </div>
        ) : layout === 'showcase' ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {items.map((item, i) => (
              <div key={i} className={i === 0 ? 'sm:col-span-2' : ''}>
                <ItemCard item={item} i={i} large={i === 0} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => <ItemCard key={i} item={item} i={i} />)}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Teasers (home page) ────────────────────────────────────────────────────

export function BlogTeaser({ c, t, basePath }: Omit<LayoutProps, 'variant'>) {
  const posts = c.blogPosts.filter((p) => p.title).slice(0, 3)
  if (posts.length === 0 || !canLinkToPage('blog', c)) return null
  return (
    <section className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className={`tpl-teaser-heading ${t.sectionTitle}`}>{c.blogSectionTitle}</h2>
            {c.blogSectionSubtitle && <p className={`mt-2 ${t.sectionSubtitle}`}>{c.blogSectionSubtitle}</p>}
          </div>
          <Link to={resolveSiteHref(basePath, 'blog', c)} className={`text-sm font-semibold ${t.showcasePrice}`}>View all posts →</Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => <BlogCard key={i} post={post} t={t} basePath={basePath} c={c} />)}
        </div>
      </div>
    </section>
  )
}

export function NewsTeaser({ c, t, basePath }: Omit<LayoutProps, 'variant'>) {
  const posts = c.newsPosts.filter((p) => p.title).slice(0, 3)
  if (posts.length === 0 || !canLinkToPage('news', c)) return null
  return (
    <section className={t.section}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className={`tpl-teaser-heading ${t.sectionTitle}`}>{c.newsSectionTitle}</h2>
            {c.newsSectionSubtitle && <p className={`mt-2 ${t.sectionSubtitle}`}>{c.newsSectionSubtitle}</p>}
          </div>
          <Link to={resolveSiteHref(basePath, 'news', c)} className={`text-sm font-semibold ${t.showcasePrice}`}>All news →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => <NewsCard key={i} post={post} t={t} basePath={basePath} c={c} />)}
        </div>
      </div>
    </section>
  )
}

export function ServicesTeaser({ c, t, basePath }: LayoutProps) {
  const services = c.services.filter((s) => s.title).slice(0, 4)
  if (services.length === 0 || !canLinkToPage('services', c)) return null
  const servicesHref = resolveSiteHref(basePath, 'services', c)
  return (
    <section className={t.section}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className={`tpl-teaser-heading ${t.sectionTitle}`}>{c.servicesSectionTitle}</h2>
            {c.servicesSectionSubtitle && <p className={`mt-2 ${t.sectionSubtitle}`}>{c.servicesSectionSubtitle}</p>}
          </div>
          <Link to={servicesHref} className={`text-sm font-semibold ${t.showcasePrice}`}>Explore all →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <Link key={i} to={servicesHref} className={`block ${t.card}`}>
              <div className={`mb-3 ${t.stepNum}`}>{i + 1}</div>
              <h3 className={`mb-2 ${t.cardTitle}`}>{service.title}</h3>
              <p className={`line-clamp-3 ${t.cardText}`}>{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutTeaser({ c, t, basePath }: Omit<LayoutProps, 'variant'>) {
  if (!canLinkToPage('about', c) || !c.about?.trim()) return null
  const aboutHref = resolveSiteHref(basePath, 'about', c)
  const excerpt = c.about.length > 280 ? `${c.about.slice(0, 280).trim()}…` : c.about
  return (
    <section className={t.section}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className={`tpl-teaser-heading ${t.sectionTitle}`}>{c.aboutTitle}</h2>
            <p className={`mt-6 text-lg leading-relaxed ${t.cardText}`}>{excerpt}</p>
            {c.missionStatement && <p className={`mt-6 ${t.mission}`}>{c.missionStatement}</p>}
            <Link to={aboutHref} className={`mt-8 inline-block text-sm font-semibold ${t.showcasePrice}`}>Learn more about us →</Link>
          </div>
          {c.aboutImage && <img src={c.aboutImage} alt="" className={t.aboutImage} />}
        </div>
      </div>
    </section>
  )
}

export { ExploreSectionView as ExploreSection } from './sectionLayouts'

export function PortfolioTeaser({ c, t, variant, basePath }: LayoutProps) {
  const cfg = getShowcaseConfig(variant)
  const items = c.showcaseItems.filter((i) => i.title).slice(0, 3)
  if (items.length === 0 || !canLinkToPage('portfolio', c)) return null
  const portfolioHref = resolveSiteHref(basePath, 'portfolio', c)
  return (
    <section className={t.showcase}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className={`tpl-teaser-heading ${t.sectionTitle}`}>{c.showcaseSectionTitle || cfg.sectionTitle}</h2>
            <p className={`mt-2 ${t.sectionSubtitle}`}>{c.showcaseSectionSubtitle || cfg.sectionSubtitle}</p>
          </div>
          <Link to={portfolioHref} className={`text-sm font-semibold ${t.showcasePrice}`}>Explore all →</Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const inner = (
              <>
                {item.image && <img src={item.image} alt="" className={t.showcaseImage} />}
                <div className="p-6">
                  <h3 className={`mb-2 ${t.cardTitle}`}>{item.title}</h3>
                  <p className={`line-clamp-2 ${t.cardText}`}>{item.description}</p>
                </div>
              </>
            )
            return <Link key={i} to={portfolioHref} className={`block ${t.showcaseCard}`}>{inner}</Link>
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ────────────────────────────────────────────────────────────────

export function PricingSection({ c, t }: { c: SiteContent; t: TemplateTheme }) {
  const plans = c.pricing.filter((p) => p.title)
  if (plans.length === 0) return null
  return (
    <section className={t.sectionAlt}>
      <div className="mx-auto max-w-6xl px-6">
        <h2 className={`mb-14 text-center ${t.sectionTitle}`}>{c.pricingSectionTitle}</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, i) => (
            <div key={i} className={`${t.card} ${plan.featured ? 'ring-2 ring-current scale-105' : ''}`}>
              {plan.tag && <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${t.showcaseTag}`}>{plan.tag}</p>}
              <h3 className={`mb-2 text-xl font-bold ${t.cardTitle}`}>{plan.title}</h3>
              <p className={`mb-4 text-3xl font-bold ${t.showcasePrice}`}>{plan.price}</p>
              <p className={t.cardText}>{plan.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function PageHeader({ title, subtitle, t, centered }: { title: string; subtitle?: string; t: TemplateTheme; centered?: boolean }) {
  return (
    <div className={`mb-14 ${centered ? 'text-center' : ''}`}>
      <h1 className={t.sectionTitle}>{title}</h1>
      {subtitle && <p className={`mx-auto mt-3 max-w-2xl ${t.sectionSubtitle}`}>{subtitle}</p>}
    </div>
  )
}

function BackLink({ to, label = '← Back to blog' }: { to: string; label?: string }) {
  return <Link to={to} className="mb-8 inline-block text-sm opacity-70 hover:underline">{label}</Link>
}

function PostBody({ body, t, large }: { body: string; t: TemplateTheme; large?: boolean }) {
  return (
    <div className={`space-y-6 leading-relaxed ${large ? 'text-xl' : 'text-lg'} ${t.cardText}`}>
      {body.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
    </div>
  )
}

function EmptyPage({ t, title, message }: { t: TemplateTheme; title: string; message: string }) {
  return (
    <section className={t.section}>
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className={`mb-4 ${t.sectionTitle}`}>{title}</h1>
        <p className={t.cardText}>{message}</p>
      </div>
    </section>
  )
}

function NotFoundPage({ t, backLabel, backTo }: { t: TemplateTheme; backLabel: string; backTo: string }) {
  return (
    <section className={t.section}>
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className={`mb-4 ${t.sectionTitle}`}>Not found</h1>
        <Link to={backTo} className={t.showcasePrice}>{backLabel}</Link>
      </div>
    </section>
  )
}