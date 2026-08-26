import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
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

function Eyebrow({ templateId, children }: { templateId: CloneTemplateId; children: ReactNode }) {
  if (templateId === 'cpa') {
    return (
      <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>
        <span className="h-px w-4" style={{ backgroundColor: 'var(--clone-accent)' }} />
        {children}
      </div>
    )
  }
  if (templateId === 'axiom') {
    return (
      <div className="mb-4 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--clone-accent)' }}>
        {children}
      </div>
    )
  }
  if (templateId === 'flux') {
    return (
      <div className="mb-5 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.2em] text-[#E8D9CB]">
        <span className="inline-block h-2 w-2 rotate-45" style={{ backgroundColor: 'var(--clone-accent)' }} />
        {children}
      </div>
    )
  }
  if (templateId === 'taxfighters') {
    return (
      <div className="mb-5 inline-flex items-center rounded-full border border-rose-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: 'var(--clone-highlight)' }}>
        {children}
      </div>
    )
  }
  if (templateId === 'aureum') {
    return (
      <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">{children}</div>
    )
  }
  return <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/80">{children}</div>
}

function PageHero({
  templateId,
  d,
  title,
  subtitle,
}: {
  templateId: CloneTemplateId
  d: CloneHomeData
  title: string
  subtitle?: string
}) {
  const img = d.c.heroImage || d.c.aboutImage

  if (templateId === 'taxfighters') {
    return (
      <section className="relative z-0 isolate overflow-hidden px-4 py-20 csm:px-6 clg:py-24">
        <div className="absolute inset-0">
          {img ? <img src={img} alt="" className="h-full w-full object-cover opacity-15 contrast-125 brightness-75" /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <Eyebrow templateId={templateId}>{d.c.businessName}</Eyebrow>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-900 csm:text-6xl">{title}</h1>
          {subtitle ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-700">{subtitle}</p> : null}
        </div>
      </section>
    )
  }

  if (templateId === 'aureum') {
    return (
      <section className="relative z-0 isolate overflow-hidden px-6 py-24 text-white clg:px-12" style={{ backgroundColor: 'var(--clone-accent)' }}>
        <div className="pointer-events-none absolute right-0 bottom-0 h-full w-1/2 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative mx-auto max-w-[1400px]">
          <Eyebrow templateId={templateId}>{d.c.businessName}</Eyebrow>
          <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight clg:text-7xl">{title}</h1>
          {subtitle ? <p className="mt-6 max-w-xl text-lg text-white/80">{subtitle}</p> : null}
        </div>
      </section>
    )
  }

  if (templateId === 'flux') {
    return (
      <section className="relative z-0 isolate min-h-[52vh] overflow-hidden bg-[#141110] px-6 py-24 text-white clg:px-12">
        {img ? <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141110] via-[#141110]/80 to-transparent" />
        <div className="relative mx-auto flex min-h-[36vh] max-w-[1400px] flex-col justify-center">
          <Eyebrow templateId={templateId}>{d.c.businessName}</Eyebrow>
          <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight clg:text-[4.5rem]">{title}</h1>
          {subtitle ? (
            <p className="mt-8 max-w-xl border-l-2 pl-4 text-lg text-[#CBBBAC]" style={{ borderColor: 'var(--clone-accent)' }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </section>
    )
  }

  if (templateId === 'cpa') {
    return (
      <section className="relative z-0 isolate overflow-hidden px-4 py-20 text-white csm:px-6" style={{ backgroundColor: 'var(--clone-ink)' }}>
        <div className="absolute -top-24 -right-24 h-[380px] w-[380px] rounded-full opacity-20 blur-3xl" style={{ backgroundColor: 'var(--clone-accent)' }} />
        <div className="relative mx-auto max-w-7xl">
          <Eyebrow templateId={templateId}>{d.c.businessName}</Eyebrow>
          <h1 className="max-w-4xl text-4xl font-black uppercase leading-[1.05] tracking-tight csm:text-6xl">{title}</h1>
          {subtitle ? <p className="mt-5 max-w-xl text-[15px] font-medium text-[#C7D6C9]">{subtitle}</p> : null}
        </div>
      </section>
    )
  }

  if (templateId === 'axiom') {
    return (
      <section className="t5 relative z-0 isolate overflow-hidden">
        {img ? <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-slate-900" />}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061F3A]/92 to-[#0B4F8A]/75" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 csm:px-6">
          <div className="max-w-2xl">
            <Eyebrow templateId={templateId}>{d.c.businessName}</Eyebrow>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white csm:text-6xl">{title}</h1>
            {subtitle ? <p className="mt-5 max-w-lg text-base leading-relaxed text-blue-100/80">{subtitle}</p> : null}
          </div>
        </div>
      </section>
    )
  }

  return (
    <header className="relative z-0 isolate min-h-[52vh] overflow-hidden">
      {img ? <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-neutral-900" />}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative mx-auto flex min-h-[52vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold text-white csm:text-6xl">{title}</h1>
        {subtitle ? <p className="mt-6 max-w-2xl text-lg text-gray-200">{subtitle}</p> : null}
      </div>
    </header>
  )
}

function cardClass(templateId: CloneTemplateId): string {
  switch (templateId) {
    case 'taxfighters':
      return 'overflow-hidden rounded-3xl border border-slate-300 bg-slate-50 shadow-sm transition hover:shadow-xl'
    case 'aureum':
      return 'overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-2xl'
    case 'flux':
      return 'overflow-hidden rounded-3xl border border-[#EEDFCF] bg-white shadow-sm'
    case 'cpa':
      return 'overflow-hidden rounded-3xl border border-[#E4E0D4] bg-white'
    case 'axiom':
      return 'overflow-hidden rounded-2xl border bg-white'
    default:
      return 'overflow-hidden rounded-lg border border-gray-200 bg-white'
  }
}

function Card({
  templateId,
  children,
  to,
}: {
  templateId: CloneTemplateId
  children: ReactNode
  to?: string
}) {
  const cls = `block ${cardClass(templateId)}`
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  return <div className={cls}>{children}</div>
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <section className="px-4 py-20 csm:px-6">
      <div className="mx-auto max-w-3xl text-center opacity-60">{children}</div>
    </section>
  )
}

function BlogList({ templateId, d }: { templateId: CloneTemplateId; d: CloneHomeData }) {
  const posts = d.blogPosts
  if (!posts.length) return <EmptyNote>Add blog posts in the editor to populate this page.</EmptyNote>
  const [featured, ...rest] = posts

  if (templateId === 'aureum') {
    return (
      <section className="px-6 py-20 clg:px-12">
        <div className="mx-auto max-w-[1400px] space-y-10">
          {posts.map((post) => (
            <Link
              key={post.slug || post.title}
              to={post.slug ? d.hrefs.blogPost(post.slug) : d.hrefs.blog}
              className="grid overflow-hidden rounded-[2rem] border border-slate-300 bg-white shadow-sm clg:grid-cols-5"
            >
              {post.image ? (
                <img src={post.image} alt="" className="h-56 w-full object-cover clg:col-span-2 clg:h-full" />
              ) : (
                <div className="h-56 bg-[var(--clone-accent)]/20 clg:col-span-2" />
              )}
              <div className="space-y-4 p-8 clg:col-span-3 clg:p-12">
                {post.date ? <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">{formatPostDate(post.date)}</p> : null}
                <h2 className="text-3xl font-bold tracking-tight">{post.title}</h2>
                <p className="max-w-xl text-[17px] leading-relaxed text-slate-600">{post.excerpt}</p>
                <span className="inline-flex text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--clone-accent)' }}>
                  Read article →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (templateId === 'flux') {
    return (
      <section className="bg-[#FFF9F4] px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-16">
          {posts.map((post) => (
            <article key={post.slug || post.title} className="border-t border-[#EEDFCF] pt-10">
              {post.date ? <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A6A58]">{formatPostDate(post.date)}</p> : null}
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#241C15]">{post.title}</h2>
              {post.image ? <img src={post.image} alt="" className="mt-6 aspect-[16/9] w-full rounded-3xl object-cover" /> : null}
              <p className="mt-6 border-l-2 pl-4 text-lg leading-relaxed text-[#4A3B2C]" style={{ borderColor: 'var(--clone-accent)' }}>
                {post.excerpt}
              </p>
              <Link to={post.slug ? d.hrefs.blogPost(post.slug) : d.hrefs.blog} className="mt-6 inline-flex font-bold" style={{ color: 'var(--clone-accent)' }}>
                Continue reading →
              </Link>
            </article>
          ))}
        </div>
      </section>
    )
  }

  if (templateId === 'axiom') {
    return (
      <section className="t5 px-4 py-20 csm:px-6">
        <div className="mx-auto max-w-5xl divide-y" style={{ borderColor: '#D6E4F0' }}>
          {posts.map((post) => (
            <Link key={post.slug || post.title} to={post.slug ? d.hrefs.blogPost(post.slug) : d.hrefs.blog} className="grid gap-8 py-10 cmd:grid-cols-5">
              {post.image ? <img src={post.image} alt="" className="h-40 w-full rounded-lg object-cover cmd:col-span-2" /> : <div className="h-40 rounded-lg bg-slate-100 cmd:col-span-2" />}
              <div className="cmd:col-span-3">
                {post.date ? <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-50">{formatPostDate(post.date)}</p> : null}
                <h2 className="mt-2 text-2xl font-black tracking-tight">{post.title}</h2>
                <p className="mt-3 text-sm leading-relaxed opacity-70">{post.excerpt}</p>
                <span className="mt-4 inline-block text-sm font-bold" style={{ color: 'var(--clone-accent)' }}>
                  Read more
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (templateId === 'helix') {
    return (
      <section className="bg-black px-4 py-20 text-white csm:px-6">
        <div className="mx-auto max-w-4xl space-y-12">
          {posts.map((post) => (
            <Link key={post.slug || post.title} to={post.slug ? d.hrefs.blogPost(post.slug) : d.hrefs.blog} className="block border-l-4 pl-6" style={{ borderColor: 'var(--clone-accent)' }}>
              {post.date ? <p className="text-sm text-white/50">{formatPostDate(post.date)}</p> : null}
              <h2 className="mt-2 text-4xl font-bold csm:text-5xl">{post.title}</h2>
              <p className="mt-4 max-w-2xl text-lg text-white/70">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  const featuredTo = featured.slug ? d.hrefs.blogPost(featured.slug) : d.hrefs.blog
  const featuredLayout = templateId === 'cpa' ? 'rounded-3xl border border-[#E4E0D4] bg-white' : cardClass(templateId)

  return (
    <section className={`px-4 py-16 csm:px-6 ${templateId === 'cpa' ? 'bg-[var(--clone-surface)]' : ''}`}>
      <div className="mx-auto max-w-7xl space-y-10">
        <Link to={featuredTo} className={`block overflow-hidden ${featuredLayout}`}>
          <div className="grid clg:grid-cols-2">
            {featured.image ? <img src={featured.image} alt="" className="h-72 w-full object-cover clg:h-full" /> : <div className="h-72 bg-[var(--clone-accent-soft)]" />}
            <div className="space-y-4 p-8 clg:p-10">
              {featured.date ? (
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--clone-accent)' }}>
                  {formatPostDate(featured.date)}
                </p>
              ) : null}
              <h2 className={`text-3xl ${templateId === 'cpa' ? 'font-black uppercase' : 'font-black'}`}>{featured.title}</h2>
              <p className="leading-relaxed opacity-70">{featured.excerpt}</p>
              <span className="inline-flex items-center gap-1 font-bold" style={{ color: 'var(--clone-accent)' }}>
                Read article <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
        {rest.length ? (
          <div className={`grid gap-8 ${templateId === 'taxfighters' ? 'csm:grid-cols-2' : 'csm:grid-cols-2 clg:grid-cols-3'}`}>
            {rest.map((post) => (
              <Card key={post.slug || post.title} templateId={templateId} to={post.slug ? d.hrefs.blogPost(post.slug) : d.hrefs.blog}>
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

function BlogPost({ templateId, d, slug }: { templateId: CloneTemplateId; d: CloneHomeData; slug: string }) {
  const post = d.c.blogPosts.find((item) => item.title && postSlug(item.title, item.slug) === slug)
  if (!post) {
    return (
      <section className="px-4 py-20 text-center csm:px-6">
        <p>That article was not found.</p>
        <Link to={d.hrefs.blog} className="mt-4 inline-block font-bold" style={{ color: 'var(--clone-accent)' }}>
          ← Back to blog
        </Link>
      </section>
    )
  }
  const prose =
    templateId === 'helix'
      ? 'text-lg leading-relaxed text-white/80'
      : templateId === 'flux'
        ? 'text-lg leading-relaxed text-[#4A3B2C]'
        : 'text-lg leading-relaxed opacity-80'

  return (
    <>
      <PageHero templateId={templateId} d={d} title={post.title} subtitle={post.excerpt} />
      <article className={`px-4 py-16 csm:px-6 ${templateId === 'helix' ? 'bg-black text-white' : templateId === 'flux' ? 'bg-[#FFF9F4]' : ''}`}>
        <div className={`mx-auto ${templateId === 'aureum' || templateId === 'axiom' ? 'max-w-4xl' : 'max-w-3xl'}`}>
          <Link to={d.hrefs.blog} className="text-sm font-semibold" style={{ color: 'var(--clone-accent)' }}>
            ← All articles
          </Link>
          <div className="mt-4 flex gap-3 text-sm opacity-60">
            {post.date ? <span>{formatPostDate(post.date)}</span> : null}
            {post.author ? <span>· {post.author}</span> : null}
          </div>
          {post.image && templateId !== 'flux' ? (
            <img
              src={post.image}
              alt=""
              className={`mt-8 w-full object-cover ${templateId === 'helix' ? 'rounded-none aspect-[21/9]' : templateId === 'cpa' ? 'rounded-3xl aspect-[16/9]' : 'rounded-2xl aspect-[16/9]'}`}
            />
          ) : null}
          <div className={`mt-10 space-y-5 ${prose}`}>
            {post.body.split(/\n{2,}/).map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
        </div>
      </article>
    </>
  )
}

function ServicesPage({ templateId, d }: { templateId: CloneTemplateId; d: CloneHomeData }) {
  const services = d.services

  if (templateId === 'helix') {
    return (
      <>
        <section className="px-6 py-24 text-white" style={{ backgroundColor: 'var(--clone-ink)' }}>
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-16 text-center text-6xl font-bold">{d.c.servicesSectionTitle || 'Services'}</h2>
            <div className="space-y-10">
              {services.map((service, i) => (
                <div key={service.title} className="border-l-4 pl-6" style={{ borderColor: 'white' }}>
                  <div className="text-sm uppercase tracking-widest text-white/50">0{i + 1}</div>
                  <h3 className="mt-2 text-3xl font-bold">{service.title}</h3>
                  <p className="mt-3 max-w-2xl text-lg text-white/80">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <ClonePricingSection d={d} />
      </>
    )
  }

  if (templateId === 'aureum') {
    return (
      <>
        <section className="px-6 py-20 clg:px-12">
          <div className="mx-auto max-w-[1400px] space-y-6">
            {services.map((service, i) => (
              <div key={service.title} className="grid items-center gap-8 rounded-[2rem] border border-slate-300 bg-white p-8 clg:grid-cols-12">
                <div className="text-6xl font-black text-slate-200 clg:col-span-2">{String(i + 1).padStart(2, '0')}</div>
                <div className="clg:col-span-10">
                  <h3 className="text-3xl font-bold tracking-tight">{service.title}</h3>
                  <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-slate-600">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <ClonePricingSection d={d} />
      </>
    )
  }

  if (templateId === 'axiom') {
    return (
      <>
        <section className="t5 px-4 py-24 csm:px-6">
          <div className="mx-auto grid max-w-7xl gap-6 csm:grid-cols-2 clg:grid-cols-4">
            {services.map((service) => (
              <div key={service.title} className="rounded-2xl border bg-white p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--clone-accent-soft)', color: 'var(--clone-accent)' }}>
                  <ArrowUpRight className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold">{service.title}</h3>
                <p className="mt-2 text-xs leading-relaxed opacity-70">{service.description}</p>
              </div>
            ))}
          </div>
        </section>
        <ClonePricingSection d={d} />
      </>
    )
  }

  if (templateId === 'flux') {
    return (
      <>
        <section className="bg-[#FFF3E7] px-4 py-24 csm:px-6">
          <div className="mx-auto grid max-w-7xl gap-8 cmd:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="rounded-3xl border border-[#EEDFCF] bg-white p-8 shadow-sm">
                <div className="mb-5 h-14 w-14 rounded-2xl" style={{ backgroundColor: 'var(--clone-accent)' }} />
                <h3 className="text-xl font-bold text-[#241C15]">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#7A6A58]">{service.description}</p>
              </div>
            ))}
          </div>
        </section>
        <ClonePricingSection d={d} />
      </>
    )
  }

  return (
    <>
      <section className="px-4 py-16 csm:px-6">
        <div className={`mx-auto max-w-7xl ${templateId === 'cpa' ? 'grid gap-8 cmd:grid-cols-3' : 'grid gap-6 cmd:grid-cols-2 clg:grid-cols-3'}`}>
          {services.map((service, i) => (
            <Card key={service.title} templateId={templateId}>
              <div className="space-y-4 p-8">
                <div
                  className={`flex h-12 w-12 items-center justify-center text-lg font-black ${templateId === 'cpa' ? 'rounded-2xl text-[var(--clone-ink)]' : 'rounded-2xl text-white'}`}
                  style={{ backgroundColor: templateId === 'cpa' && i === 1 ? 'var(--clone-accent)' : templateId === 'cpa' ? 'var(--clone-ink)' : 'var(--clone-accent)', color: templateId === 'cpa' && i !== 1 ? 'var(--clone-accent)' : undefined }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl font-bold">{service.title}</h3>
                <p className="text-sm leading-relaxed opacity-70">{service.description}</p>
              </div>
            </Card>
          ))}
        </div>
        {d.show.steps && d.steps.length ? (
          <div className="mx-auto mt-16 max-w-7xl">
            <h2 className="mb-8 text-3xl font-black">{d.c.stepsSectionTitle || 'How it works'}</h2>
            <div className="grid gap-6 cmd:grid-cols-3">
              {d.steps.map((step, i) => (
                <div key={step.title} className={cardClass(templateId) + ' p-6'}>
                  <div className="text-2xl font-black opacity-30">0{i + 1}</div>
                  <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm opacity-70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
      <ClonePricingSection d={d} />
    </>
  )
}

function AboutPage({ templateId, d }: { templateId: CloneTemplateId; d: CloneHomeData }) {
  const { c } = d
  const extras = [c.aboutImage, c.heroImage, ...d.locations.map((item) => item.image)].filter(Boolean)

  if (templateId === 'cpa') {
    return (
      <>
        <section className="px-4 py-24 csm:px-6" style={{ backgroundColor: 'var(--clone-surface-alt)' }}>
          <div className="mx-auto grid max-w-7xl items-start gap-12 clg:grid-cols-12">
            <div className="grid grid-cols-5 gap-4 clg:col-span-6">
              <div className="col-span-3 overflow-hidden rounded-3xl shadow-xl">
                {extras[0] ? <img src={extras[0]} alt="" className="h-[340px] w-full object-cover" /> : <div className="h-[340px] bg-[var(--clone-ink)]" />}
              </div>
              <div className="col-span-2 flex flex-col gap-4">
                <div className="flex flex-1 flex-col justify-center rounded-3xl p-5" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <div className="text-2xl font-black" style={{ color: 'var(--clone-ink)' }}>
                    {d.stats[0]?.value || '10K+'}
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: '#1F3A2E' }}>
                    {d.stats[0]?.label || 'Returns completed'}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden rounded-3xl">
                  {extras[1] ? <img src={extras[1]} alt="" className="h-full w-full object-cover" /> : null}
                </div>
              </div>
            </div>
            <div className="space-y-5 clg:col-span-6">
              <Eyebrow templateId="cpa">Who we are</Eyebrow>
              <h2 className="text-3xl font-black csm:text-4xl">{c.aboutTitle}</h2>
              <p className="text-lg leading-relaxed opacity-75">{c.about}</p>
              {c.missionStatement ? (
                <p className="border-l-4 pl-5 text-lg italic" style={{ borderColor: 'var(--clone-accent)' }}>
                  {c.missionStatement}
                </p>
              ) : null}
              <div className="flex items-center gap-2 text-[var(--clone-accent)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" style={{ fill: 'var(--clone-accent)' }} />
                ))}
              </div>
            </div>
          </div>
        </section>
        <CloneTeamSection templateId={templateId} d={d} />
      </>
    )
  }

  if (templateId === 'helix') {
    return (
      <>
        <section className="px-6 py-24 text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-5xl font-bold csm:text-6xl">{c.aboutTitle}</h2>
            <p className="mt-8 text-xl leading-relaxed text-white/90">{c.about}</p>
          </div>
        </section>
        {c.aboutImage ? (
          <img src={c.aboutImage} alt="" className="h-[420px] w-full object-cover" />
        ) : null}
        {c.missionStatement ? (
          <section className="bg-black px-6 py-20 text-white">
            <p className="mx-auto max-w-3xl text-center text-2xl italic">{c.missionStatement}</p>
          </section>
        ) : null}
        <CloneTeamSection templateId={templateId} d={d} />
      </>
    )
  }

  if (templateId === 'flux') {
    return (
      <>
        <section className="px-4 py-24 csm:px-6">
          <div className="mx-auto grid max-w-7xl items-center gap-12 clg:grid-cols-12">
            <div className="relative clg:col-span-6">
              <div className="overflow-hidden rounded-3xl border border-[#EEDFCF] shadow-2xl">
                {c.aboutImage ? <img src={c.aboutImage} alt="" className="h-[520px] w-full object-cover" /> : null}
              </div>
            </div>
            <div className="space-y-6 clg:col-span-6">
              <Eyebrow templateId="flux">Who we are</Eyebrow>
              <h2 className="text-4xl font-bold tracking-tight text-[#241C15]">{c.aboutTitle}</h2>
              <p className="text-lg leading-relaxed text-[#4A3B2C]">{c.about}</p>
              {c.missionStatement ? (
                <p className="border-l-2 pl-4 text-lg text-[#7A6A58]" style={{ borderColor: 'var(--clone-accent)' }}>
                  {c.missionStatement}
                </p>
              ) : null}
            </div>
          </div>
        </section>
        <CloneTeamSection templateId={templateId} d={d} />
      </>
    )
  }

  if (templateId === 'axiom') {
    return (
      <>
        <section className="t5 px-4 py-24 csm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow templateId="axiom">About us</Eyebrow>
            <h2 className="text-4xl font-black tracking-tight">
              {c.aboutTitle.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="italic" style={{ color: 'var(--clone-accent)' }}>
                {c.aboutTitle.split(' ').slice(-1)}
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed opacity-70">{c.about}</p>
          </div>
          {c.aboutImage ? <img src={c.aboutImage} alt="" className="mx-auto mt-12 max-w-5xl rounded-2xl object-cover" /> : null}
        </section>
        <CloneTeamSection templateId={templateId} d={d} />
      </>
    )
  }

  return (
    <>
      <section className="px-4 py-16 csm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-12 clg:grid-cols-2">
          <div className="space-y-5">
            <h2 className={`text-3xl csm:text-4xl ${templateId === 'aureum' ? 'font-bold tracking-tight' : 'font-black'}`}>{c.aboutTitle}</h2>
            <p className="text-lg leading-relaxed opacity-75">{c.about}</p>
            {c.missionStatement ? (
              <p className="border-l-4 pl-5 text-lg italic" style={{ borderColor: 'var(--clone-accent)' }}>
                {c.missionStatement}
              </p>
            ) : null}
          </div>
          {c.aboutImage ? (
            <div className={templateId === 'aureum' ? 'relative' : ''}>
              {templateId === 'aureum' ? (
                <div className="absolute -bottom-4 -left-4 h-2/3 w-2/3 rounded-tl-[80px] csm:-bottom-6 csm:-left-6" style={{ backgroundColor: 'var(--clone-highlight)' }} />
              ) : null}
              <img
                src={c.aboutImage}
                alt=""
                className={`relative w-full object-cover shadow-2xl ${templateId === 'taxfighters' ? 'rounded-3xl' : templateId === 'aureum' ? 'rounded-t-full border-[6px]' : 'rounded-3xl'}`}
              />
            </div>
          ) : null}
        </div>
      </section>
      <CloneTeamSection templateId={templateId} d={d} />
    </>
  )
}

function PortfolioPage({ templateId, d }: { templateId: CloneTemplateId; d: CloneHomeData }) {
  if (templateId === 'helix') {
    return (
      <section className="bg-[#f9f9f9] px-4 py-20 csm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 cmd:grid-cols-2">
          {d.locations.map((item) => (
            <div key={item.title} className="overflow-hidden rounded-xl bg-white shadow-lg">
              {item.image ? <img src={item.image} alt="" className="h-64 w-full object-cover" /> : null}
              <div className="p-6">
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }
  if (templateId === 'flux') {
    return (
      <section className="bg-[#FFF9F4] px-4 py-20 csm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 cmd:grid-cols-4">
          {d.locations.map((item) => (
            <div key={item.title} className="text-center">
              {item.image ? <img src={item.image} alt="" className="mb-3 h-40 w-full rounded-2xl object-cover" /> : <div className="mb-3 h-40 rounded-2xl bg-[#EEDFCF]" />}
              <p className="text-sm font-semibold text-[#241C15]">{item.title}</p>
            </div>
          ))}
        </div>
      </section>
    )
  }
  if (templateId === 'axiom') {
    return (
      <section className="t5 px-4 py-20 csm:px-6">
        <div className="mx-auto max-w-7xl space-y-0 divide-y">
          {d.locations.map((item) => (
            <div key={item.title} className="grid items-center gap-8 py-10 cmd:grid-cols-3">
              {item.image ? <img src={item.image} alt="" className="h-44 w-full rounded-lg object-cover" /> : <div className="h-44 rounded-lg bg-slate-100" />}
              <div className="cmd:col-span-2">
                {item.tag ? <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--clone-accent)' }}>{item.tag}</p> : null}
                <h3 className="mt-1 text-2xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm opacity-70">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }
  return (
    <section className="px-4 py-16 csm:px-6">
      <div className={`mx-auto grid max-w-7xl gap-8 ${templateId === 'taxfighters' || templateId === 'aureum' ? 'csm:grid-cols-2' : 'csm:grid-cols-2 clg:grid-cols-3'}`}>
        {d.locations.map((item) => (
          <Card key={item.title} templateId={templateId}>
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

function ContactPage({ templateId, d }: { templateId: CloneTemplateId; d: CloneHomeData }) {
  const { c } = d
  const fields = [
    ['Phone', c.phone],
    ['Email', c.email],
    ['Office', c.address],
    ['Hours', c.hours],
  ].filter(([, value]) => value) as Array<[string, string]>

  const formBox =
    templateId === 'cpa' ? 'rounded-3xl border border-[#E4E0D4] bg-white p-8' :
    templateId === 'flux' ? 'rounded-3xl border border-[#EEDFCF] bg-white p-8 shadow-sm' :
    templateId === 'helix' ? 'rounded-lg border border-gray-200 bg-white p-8' :
    templateId === 'axiom' ? 'rounded-2xl border bg-white p-8' :
    templateId === 'aureum' ? 'rounded-[2rem] border border-slate-300 bg-white p-8' :
    'rounded-3xl border border-slate-300 bg-slate-50 p-8'

  const infoBox =
    templateId === 'cpa' ? 'rounded-2xl border border-[#E4E0D4] bg-white p-5' :
    templateId === 'flux' ? 'rounded-2xl border border-[#EEDFCF] bg-white p-5' :
    templateId === 'helix' ? 'border-b border-gray-200 py-4' :
    templateId === 'axiom' ? 'rounded-xl border bg-white p-5' :
    'rounded-2xl border border-slate-300 bg-slate-50 p-5'

  return (
    <section className={`px-4 py-16 csm:px-6 ${templateId === 'flux' ? 'bg-[#FFF3E7]' : templateId === 'helix' ? 'bg-white' : ''}`}>
      <div className="mx-auto grid max-w-7xl gap-12 clg:grid-cols-12">
        <div className={`space-y-4 clg:col-span-5 ${templateId === 'helix' ? '' : ''}`}>
          {fields.map(([label, value]) => (
            <div key={label} className={infoBox}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--clone-accent)' }}>
                {label}
              </p>
              <p className="mt-1 text-lg font-semibold">{value}</p>
            </div>
          ))}
          <CloneMap
            d={d}
            className={
              templateId === 'helix'
                ? 'h-72 overflow-hidden rounded-xl shadow-lg'
                : templateId === 'axiom'
                  ? 'h-56 overflow-hidden rounded-xl border'
                  : 'h-56 overflow-hidden rounded-2xl border'
            }
          />
        </div>
        <div className={`${formBox} clg:col-span-7`}>
          <h2 className={`text-2xl ${templateId === 'cpa' ? 'font-black' : templateId === 'helix' ? 'font-bold' : 'font-black'}`}>
            {c.contactFormTitle || 'Send a message'}
          </h2>
          <p className="mt-2 text-sm opacity-60">The live site form is included when you export. This preview shows the layout.</p>
          <div className="mt-6 grid gap-4 csm:grid-cols-2">
            <div className={`h-11 border bg-[var(--clone-surface-alt)] ${templateId === 'cpa' ? 'rounded-full' : templateId === 'helix' ? 'rounded-md' : 'rounded-xl'}`} />
            <div className={`h-11 border bg-[var(--clone-surface-alt)] ${templateId === 'cpa' ? 'rounded-full' : templateId === 'helix' ? 'rounded-md' : 'rounded-xl'}`} />
            <div className={`h-11 border bg-[var(--clone-surface-alt)] csm:col-span-2 ${templateId === 'cpa' ? 'rounded-full' : templateId === 'helix' ? 'rounded-md' : 'rounded-xl'}`} />
            <div className={`h-28 border bg-[var(--clone-surface-alt)] csm:col-span-2 ${templateId === 'helix' ? 'rounded-md' : 'rounded-xl'}`} />
          </div>
          <div
            className={`mt-4 inline-flex px-6 py-3 text-sm font-bold ${templateId === 'cpa' ? 'rounded-full' : templateId === 'helix' ? 'rounded-lg' : 'rounded-xl'}`}
            style={{
              backgroundColor: templateId === 'helix' ? 'var(--clone-accent)' : 'var(--clone-accent)',
              color: templateId === 'cpa' ? 'var(--clone-ink)' : '#fff',
            }}
          >
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
  const wrap =
    templateId === 'axiom' ? 't5 min-h-screen' :
    templateId === 'flux' ? 'min-h-screen bg-[var(--clone-surface)] text-[#241C15]' :
    'min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)]'

  return (
    <div className={wrap}>
      <CloneNav templateId={templateId} d={d} onBook={onBook} />
      {showHero && heading ? <PageHero templateId={templateId} d={d} title={heading[0]} subtitle={heading[1]} /> : null}
      {page === 'blog' ? <BlogList templateId={templateId} d={d} /> : null}
      {page === 'blog-post' ? <BlogPost templateId={templateId} d={d} slug={postSlugParam ?? ''} /> : null}
      {page === 'services' ? <ServicesPage templateId={templateId} d={d} /> : null}
      {page === 'about' ? <AboutPage templateId={templateId} d={d} /> : null}
      {page === 'portfolio' ? <PortfolioPage templateId={templateId} d={d} /> : null}
      {page === 'contact' ? <ContactPage templateId={templateId} d={d} /> : null}
      <CloneFooter templateId={templateId} d={d} />
    </div>
  )
}
