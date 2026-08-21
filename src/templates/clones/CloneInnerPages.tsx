import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { SitePageId } from '../../data/pageConfig'
import type { SiteContent } from '../../types'
import type { CloneTemplateId } from '../cloneTheme'
import { formatPostDate, postSlug } from '../PageLayoutSections'
import { CloneFooter, CloneMap, CloneNav, ClonePricingSection, CloneTeamSection } from './CloneChrome'
import { buildCloneHomeData, type CloneHomeData } from './cloneHomeData'

interface Props {
  templateId: CloneTemplateId
  c: SiteContent
  basePath: string
  page: SitePageId
  postSlugParam?: string
  onBook?: () => void
}

function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative z-0 isolate overflow-hidden py-16 sm:py-20" style={{ backgroundColor: 'var(--clone-ink)' }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-1 w-16 rounded-full" style={{ backgroundColor: 'var(--clone-accent)' }} />
        <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">{subtitle}</p> : null}
      </div>
    </section>
  )
}

function Card({ children, to }: { children: ReactNode; to?: string }) {
  const cls = 'block overflow-hidden rounded-2xl border bg-[var(--clone-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl'
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  return <div className={cls}>{children}</div>
}

function BlogList({ d }: { d: CloneHomeData }) {
  const posts = d.blogPosts
  if (!posts.length) {
    return (
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center opacity-60">Add blog posts in the editor to populate this page.</div>
      </section>
    )
  }
  const [featured, ...rest] = posts
  const featuredTo = featured.slug ? d.hrefs.blogPost(featured.slug) : d.hrefs.blog
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-10">
        <Card to={featuredTo}>
          <div className="grid lg:grid-cols-2">
            {featured.image ? <img src={featured.image} alt="" className="h-72 w-full object-cover lg:h-full" /> : <div className="h-72 bg-[var(--clone-accent-soft)]" />}
            <div className="space-y-4 p-8 lg:p-10">
              {featured.date ? (
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--clone-accent)' }}>
                  {formatPostDate(featured.date)}
                </p>
              ) : null}
              <h2 className="text-3xl font-black">{featured.title}</h2>
              <p className="leading-relaxed opacity-70">{featured.excerpt}</p>
              <span className="inline-flex font-bold" style={{ color: 'var(--clone-accent)' }}>
                Read article →
              </span>
            </div>
          </div>
        </Card>
        {rest.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Card key={post.slug || post.title} to={post.slug ? d.hrefs.blogPost(post.slug) : d.hrefs.blog}>
                {post.image ? <img src={post.image} alt="" className="h-44 w-full object-cover" /> : null}
                <div className="space-y-3 p-6">
                  {post.date ? <p className="text-xs uppercase tracking-wider opacity-50">{formatPostDate(post.date)}</p> : null}
                  <h3 className="text-lg font-bold">{post.title}</h3>
                  <p className="line-clamp-3 text-sm opacity-70">{post.excerpt}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function BlogPost({ d, slug }: { d: CloneHomeData; slug: string }) {
  const post = d.c.blogPosts.find((item) => item.title && postSlug(item.title, item.slug) === slug)
  if (!post) {
    return (
      <section className="px-4 py-20 text-center sm:px-6">
        <p>That article was not found.</p>
        <Link to={d.hrefs.blog} className="mt-4 inline-block font-bold" style={{ color: 'var(--clone-accent)' }}>
          ← Back to blog
        </Link>
      </section>
    )
  }
  return (
    <>
      <PageHero title={post.title} subtitle={post.excerpt} />
      <article className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link to={d.hrefs.blog} className="text-sm font-semibold" style={{ color: 'var(--clone-accent)' }}>
            ← All articles
          </Link>
          <div className="mt-4 flex gap-3 text-sm opacity-60">
            {post.date ? <span>{formatPostDate(post.date)}</span> : null}
            {post.author ? <span>· {post.author}</span> : null}
          </div>
          {post.image ? <img src={post.image} alt="" className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" /> : null}
          <div className="mt-10 space-y-5 text-lg leading-relaxed opacity-80">
            {post.body.split(/\n{2,}/).map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
        </div>
      </article>
    </>
  )
}

function ServicesPage({ d }: { d: CloneHomeData }) {
  return (
    <>
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {d.services.map((service, i) => (
              <Card key={service.title}>
                <div className="space-y-4 p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-bold">{service.title}</h3>
                  <p className="text-sm leading-relaxed opacity-70">{service.description}</p>
                </div>
              </Card>
            ))}
          </div>
          {d.show.steps && d.steps.length ? (
            <div>
              <h2 className="mb-8 text-3xl font-black">{d.c.stepsSectionTitle || 'How it works'}</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {d.steps.map((step, i) => (
                  <div key={step.title} className="rounded-2xl border p-6">
                    <div className="text-2xl font-black opacity-30">0{i + 1}</div>
                    <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm opacity-70">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <ClonePricingSection d={d} />
    </>
  )
}

function AboutPage({ d }: { d: CloneHomeData }) {
  const { c } = d
  return (
    <>
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <h2 className="text-3xl font-black sm:text-4xl">{c.aboutTitle}</h2>
            <p className="text-lg leading-relaxed opacity-75">{c.about}</p>
            {c.missionStatement ? (
              <p className="border-l-4 pl-5 text-lg italic" style={{ borderColor: 'var(--clone-accent)' }}>
                {c.missionStatement}
              </p>
            ) : null}
          </div>
          {c.aboutImage ? <img src={c.aboutImage} alt="" className="w-full rounded-3xl object-cover shadow-2xl" /> : null}
        </div>
      </section>
      <CloneTeamSection d={d} />
    </>
  )
}

function PortfolioPage({ d }: { d: CloneHomeData }) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {d.locations.map((item) => (
          <Card key={item.title}>
            {item.image ? <img src={item.image} alt="" className="h-48 w-full object-cover" /> : null}
            <div className="p-6">
              {item.tag ? (
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--clone-accent)' }}>
                  {item.tag}
                </p>
              ) : null}
              <h3 className="mt-1 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm opacity-70">{item.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

function ContactPage({ d }: { d: CloneHomeData }) {
  const { c } = d
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          {[
            ['Phone', c.phone],
            ['Email', c.email],
            ['Office', c.address],
            ['Hours', c.hours],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="rounded-2xl border p-5">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--clone-accent)' }}>
                  {label}
                </p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          <CloneMap d={d} className="h-56 overflow-hidden rounded-2xl border" />
        </div>
        <div className="rounded-3xl border p-8 lg:col-span-7">
          <h2 className="text-2xl font-black">{c.contactFormTitle || 'Send a message'}</h2>
          <p className="mt-2 text-sm opacity-60">The live site form is included when you export. This preview shows the layout.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="h-11 rounded-xl border bg-[var(--clone-surface-alt)]" />
            <div className="h-11 rounded-xl border bg-[var(--clone-surface-alt)]" />
            <div className="h-11 rounded-xl border bg-[var(--clone-surface-alt)] sm:col-span-2" />
            <div className="h-28 rounded-xl border bg-[var(--clone-surface-alt)] sm:col-span-2" />
          </div>
          <div className="mt-4 inline-flex rounded-xl px-6 py-3 text-sm font-bold text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
            {c.contactFormButtonText || 'Send inquiry'}
          </div>
        </div>
      </div>
    </section>
  )
}

export function CloneInnerPage({ templateId, c, basePath, page, postSlugParam, onBook }: Props) {
  const d = buildCloneHomeData(c, basePath, templateId)
  const titles: Partial<Record<SitePageId, [string, string | undefined]>> = {
    about: [c.aboutTitle || 'About', c.missionStatement],
    services: [c.servicesSectionTitle || 'Services', c.servicesSectionSubtitle],
    portfolio: [c.showcaseSectionTitle || 'Locations', c.showcaseSectionSubtitle],
    blog: [c.blogSectionTitle || 'Blog', c.blogSectionSubtitle],
    contact: [c.contactSectionTitle || 'Contact', undefined],
  }

  const showHero = page !== 'blog-post'
  const heading = titles[page]

  return (
    <div>
      <CloneNav templateId={templateId} d={d} onBook={onBook} />
      {showHero && heading ? <PageHero title={heading[0]} subtitle={heading[1]} /> : null}
      {page === 'blog' ? <BlogList d={d} /> : null}
      {page === 'blog-post' ? <BlogPost d={d} slug={postSlugParam ?? ''} /> : null}
      {page === 'services' ? <ServicesPage d={d} /> : null}
      {page === 'about' ? <AboutPage d={d} /> : null}
      {page === 'portfolio' ? <PortfolioPage d={d} /> : null}
      {page === 'contact' ? <ContactPage d={d} /> : null}
      <CloneFooter templateId={templateId} d={d} />
    </div>
  )
}
