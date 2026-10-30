import { actionBackground } from '../utils/accentInk'
import { resolveBrandAccent } from '../data/brand'
import { getColorSchemes } from '../data/colorSchemes'
import { getShowcaseConfig } from '../data/sectionConfig'
import { canLinkToPage, getSiteNavItems, resolveStaticHref, staticPostPath, staticSitePath } from '../data/siteNav'
import { getPageLayouts } from '../templates/pageLayouts'
import type { BlogPostItem, NewsItem, SiteContent, TemplateId } from '../types'
import { slugify } from '../utils/slugify'
import { buildStaticHeroHtml } from './heroExport'
import { buildStaticHomePageBody } from './homePageExport'
import { buildCloneChromeNav, buildCloneHomeDocument, cloneInteractiveScript, isCloneTemplate, type CloneExportCtx } from './cloneHomeExport'
import { clonePaletteCss, resolveClonePalette } from '../templates/cloneTheme'
import { buildExportNavHtml } from './navExport'
import { staticFooterHtml } from './footerHtml'
import { escapeHtml, resolveImageForExport, type ImageAsset } from './imageUtils'
import { rewriteContainerVariantsForExport, tailwindHead } from './htmlShared'
import { buildContactSectionHtml, buildFaqSectionHtml, buildStyledContactFormHtml } from './sectionExport'
import { getLayoutVariant } from '../data/layoutVariants'

function formatPostDate(date: string): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function postSlug(post: { title: string; slug?: string }): string {
  return post.slug || slugify(post.title)
}

interface SiteHtmlContext {
  templateId: TemplateId
  content: SiteContent
  accent: string
  accentDark: string
  assets: ImageAsset[]
  fromNested?: boolean
  /** classic | modern | luxury shell class */
  layoutShellClass?: string
  colorSchemeId?: string
}

function buildNav(ctx: SiteHtmlContext): string {
  return buildExportNavHtml(ctx.templateId, ctx.content, ctx.accent, ctx.fromNested)
}

function buildFooter(ctx: SiteHtmlContext): string {
  const { content, fromNested } = ctx
  const navItems = getSiteNavItems(ctx.templateId, content)
  const links = navItems.map((item) => {
    const href = item.page === 'home' ? staticSitePath('home', fromNested) : staticSitePath(item.page, fromNested)
    return `<a href="${href}" class="hover:underline opacity-70">${escapeHtml(item.label)}</a>`
  }).join('')
  return staticFooterHtml(content, links)
}



function wrapPage(ctx: SiteHtmlContext, title: string, body: string): string {
  const shell = ctx.layoutShellClass ?? 'layout-classic'
  const cloneCss = isCloneTemplate(ctx.templateId)
    ? clonePaletteCss(ctx.templateId, resolveClonePalette(ctx.templateId, ctx.content, ctx.colorSchemeId))
    : ''
  const head = cloneCss
    ? tailwindHead(title, ctx.content).replace('</style>', `${cloneCss}\n</style>`)
    : tailwindHead(title, ctx.content)
  const clone = isCloneTemplate(ctx.templateId)
  const cloneNav = clone
    ? buildCloneChromeNav({
        mode: 'html',
        templateId: ctx.templateId,
        content: ctx.content,
        fromNested: ctx.fromNested,
        colorSchemeId: ctx.colorSchemeId,
        layoutVariantId: undefined,
      } as CloneExportCtx)
    : buildNav(ctx)
  return rewriteContainerVariantsForExport(`${head}
<body data-site-brand class="${clone ? 'bg-[var(--clone-surface)] text-[var(--clone-ink)]' : 'bg-white text-slate-800'} ${shell} ${clone ? 'webtemplate-clone' : ''}">
${cloneNav}
${body}
${buildFooter(ctx)}
${clone ? cloneInteractiveScript() : ''}
</body></html>`)
}

function buildContactFormHtml(content: SiteContent, accent: string, templateId: TemplateId): string {
  return buildStyledContactFormHtml(content, accent, templateId)
}

function buildPostCards(ctx: SiteHtmlContext, kind: 'blog' | 'news', posts: Array<BlogPostItem | NewsItem>, limit?: number): string {
  const list = limit ? posts.slice(0, limit) : posts
  const prefix = ctx.fromNested ? '../' : ''
  return list.map((post) => {
    const img = post.image ? resolveImageForExport(post.image, `${kind}-${postSlug(post)}`, ctx.assets) : ''
    const href = staticPostPath(kind, postSlug(post), ctx.fromNested)
    const date = post.date ? `<p class="text-xs uppercase tracking-wider opacity-60 mb-2">${escapeHtml(formatPostDate(post.date))}</p>` : ''
    return `<a href="${href}" class="block rounded-xl border overflow-hidden hover:shadow-lg transition-shadow bg-white">
      ${img ? `<img src="${prefix}${img}" alt="" class="w-full aspect-[4/3] object-cover" />` : ''}
      <div class="p-6">${date}<h3 class="font-semibold text-lg mb-2">${escapeHtml(post.title)}</h3><p class="opacity-80 line-clamp-3">${escapeHtml(post.excerpt)}</p>${post.author ? `<p class="text-sm font-medium mt-3">By ${escapeHtml(post.author)}</p>` : ''}<span class="inline-block mt-3 text-sm font-semibold" style="color:${ctx.accent}">Read more →</span></div>
    </a>`
  }).join('')
}

function buildPostArticle(ctx: SiteHtmlContext, kind: 'blog' | 'news', post: BlogPostItem | NewsItem): string {
  const slug = postSlug(post)
  const img = post.image ? resolveImageForExport(post.image, `${kind}-${slug}`, ctx.assets) : ''
  const bodyHtml = escapeHtml(post.body).split('\n\n').map((p) => `<p class="text-lg leading-relaxed text-slate-600 mb-6">${p}</p>`).join('')
  const backHref = staticSitePath(kind, true)
  const layouts = getPageLayouts(ctx.templateId)
  const isPress = kind === 'news' && layouts.newsPost === 'press'
  const isSplit = (kind === 'blog' && layouts.blogPost === 'split') || (kind === 'news' && layouts.newsPost === 'split')

  if (isSplit) {
    return `<article class="py-16"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
<a href="${backHref}" class="lg:col-span-2 text-sm opacity-70 hover:underline">← Back</a>
<div><h1 class="text-4xl font-bold mb-4">${escapeHtml(post.title)}</h1>${post.date ? `<p class="text-sm text-slate-400 mb-4">${escapeHtml(formatPostDate(post.date))}</p>` : ''}${post.excerpt ? `<p class="border-l-4 pl-6 italic text-lg text-slate-600" style="border-color:${ctx.accent}">${escapeHtml(post.excerpt)}</p>` : ''}</div>
<div>${img ? `<img src="../${img}" class="w-full rounded-2xl mb-8" />` : ''}${bodyHtml}</div>
</div></article>`
  }

  if (isPress) {
    return `<article class="py-16 bg-slate-50"><div class="max-w-4xl mx-auto px-6">
<p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Press Release</p>
<h1 class="text-4xl font-bold mb-6">${escapeHtml(post.title)}</h1>
<div class="flex gap-6 border-b pb-6 mb-10 text-sm text-slate-500">${post.date ? `<span>${escapeHtml(formatPostDate(post.date))}</span>` : ''}${post.author ? `<span>${escapeHtml(post.author)}</span>` : ''}</div>
${img ? `<img src="../${img}" class="w-full rounded-xl mb-10" />` : ''}${bodyHtml}
<a href="${backHref}" class="inline-block mt-12 text-sm font-semibold" style="color:${ctx.accent}">← All news</a>
</div></article>`
  }

  return `<article class="py-16"><div class="max-w-3xl mx-auto px-6">
<a href="${backHref}" class="text-sm opacity-70 hover:underline mb-8 inline-block">← Back</a>
${post.date ? `<p class="text-sm uppercase tracking-wider text-slate-400 mb-4">${escapeHtml(formatPostDate(post.date))}</p>` : ''}
<h1 class="text-4xl font-bold mb-4">${escapeHtml(post.title)}</h1>
${post.author ? `<p class="text-slate-500 mb-8">By ${escapeHtml(post.author)}</p>` : ''}
${img ? `<img src="../${img}" class="w-full rounded-2xl mb-10 aspect-[16/9] object-cover" />` : ''}
${post.excerpt ? `<p class="text-xl text-slate-700 mb-10 border-l-4 pl-6 italic" style="border-color:${ctx.accent}">${escapeHtml(post.excerpt)}</p>` : ''}
<div>${bodyHtml}</div>
</div></article>`
}

export function buildAllSitePages(
  templateId: TemplateId,
  content: SiteContent,
  colorSchemeId?: string,
  layoutVariantId?: string,
): { pages: Record<string, string>; assets: ImageAsset[] } {
  const scheme = getColorSchemes(templateId).find((s) => s.id === colorSchemeId) ?? getColorSchemes(templateId)[0]
  const accent = resolveBrandAccent(content, scheme.swatches[1])
  const accentDark = scheme.swatches[0]
  const layout = getLayoutVariant(templateId, layoutVariantId)
  const pv = content.pageVisibility
  const sv = content.sectionVisibility
  const showcaseCfg = getShowcaseConfig(templateId)
  const layouts = getPageLayouts(templateId)
  const assets: ImageAsset[] = []
  const ctx: SiteHtmlContext = {
    templateId,
    content,
    accent,
    accentDark,
    assets,
    layoutShellClass: layout.shellClass,
    colorSchemeId,
  }
  const pages: Record<string, string> = {}

  const hero = resolveImageForExport(content.heroImage, 'hero', assets)
  const logo = resolveImageForExport(content.logo, 'logo', assets)
  const exportContent: SiteContent = { ...content, logo, heroImage: hero || content.heroImage }
  ctx.content = exportContent
  const heroHtml = buildStaticHeroHtml({
    templateId,
    heroLayout: layout.heroLayout,
    accent: actionBackground(accent, scheme.swatches[1]),
    heroImage: hero,
    businessName: content.businessName,
    tagline: content.tagline,
    heroSubtext: content.heroSubtext,
    ctaText: content.ctaText,
    ctaHref: resolveStaticHref(content.ctaLink || 'contact', content),
    stats: content.stats.filter((s) => s.value).slice(0, 3),
  })
  const blogPosts = content.blogPosts.filter((p) => p.title)
  const newsPosts = content.newsPosts.filter((p) => p.title)
  const showcaseItems = content.showcaseItems.filter((i) => i.title)
  const homeBody = buildStaticHomePageBody({
    templateId,
    content,
    accent,
    accentDark,
    buildBlogCards: (limit) => buildPostCards(ctx, 'blog', blogPosts, limit),
    buildNewsCards: (limit) => buildPostCards(ctx, 'news', newsPosts, limit),
    resolveImage: (url, name) => resolveImageForExport(url, name, assets),
    contactFormHtml: buildContactFormHtml(content, accent, templateId),
  })

  if (isCloneTemplate(templateId)) {
    pages['index.html'] = buildCloneHomeDocument(
      {
        mode: 'html',
        templateId,
        content: exportContent,
        colorSchemeId,
        layoutVariantId,
        resolveImage: (url, name) => resolveImageForExport(url, name, assets),
      },
    )
  } else {
    pages['index.html'] = wrapPage(ctx, content.businessName, `
${heroHtml}
${homeBody}`)
  }

  if (pv.about && canLinkToPage('about', content)) {
    const aboutImg = content.aboutImage ? resolveImageForExport(content.aboutImage, 'about', assets) : ''
    const teamHtml = sv.team ? content.team.filter((m) => m.name).map((m) => {
      const img = m.image ? resolveImageForExport(m.image, `team-${m.name}`, assets) : ''
      return `<div class="text-center">${img ? `<img src="${img}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />` : ''}<h3 class="font-semibold">${escapeHtml(m.name)}</h3><p class="opacity-70">${escapeHtml(m.role)}</p></div>`
    }).join('') : ''
    pages['about.html'] = wrapPage(ctx, `About — ${content.businessName}`, `
<section class="py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center"><div><h1 class="text-4xl font-bold mb-6">${escapeHtml(content.aboutTitle)}</h1><p class="text-lg leading-relaxed text-slate-600 mb-6">${escapeHtml(content.about)}</p>${content.missionStatement ? `<p class="border-l-4 pl-6 italic text-slate-600" style="border-color:${accent}">${escapeHtml(content.missionStatement)}</p>` : ''}</div>${aboutImg ? `<img src="${aboutImg}" class="rounded-2xl w-full" alt="${escapeHtml(content.aboutTitle)}" />` : ''}</div></section>
${teamHtml ? `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.teamSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-8">${teamHtml}</div></div></section>` : ''}`)
  }

  if (pv.services && canLinkToPage('services', content)) {
    const services = content.services.filter((s) => s.title)
    const servicesHtml = services.map((s) => `<div class="rounded-xl border p-6"><h3 class="font-semibold text-lg mb-2">${escapeHtml(s.title)}</h3><p class="opacity-80">${escapeHtml(s.description)}</p></div>`).join('')
    const steps = content.steps.filter((s) => s.title)
    const stepsHtml = steps.map((s, i) => `<div><span class="text-2xl font-bold opacity-40">0${i + 1}</span><h3 class="font-semibold mt-2">${escapeHtml(s.title)}</h3><p class="opacity-80 mt-1">${escapeHtml(s.description)}</p></div>`).join('')
    const pricingHtml = sv.pricing ? content.pricing.filter((p) => p.title).map((p) => `<div class="rounded-xl border p-6 ${p.featured ? 'ring-2' : ''}" style="${p.featured ? `border-color:${accent}` : ''}"><h3 class="font-bold text-lg">${escapeHtml(p.title)}</h3><p class="text-3xl font-bold my-3" style="color:${accent}">${escapeHtml(p.price)}</p><p class="opacity-80">${escapeHtml(p.description)}</p></div>`).join('') : ''
    pages['services.html'] = wrapPage(ctx, `Services — ${content.businessName}`, `
${services.length ? `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">${escapeHtml(content.servicesSectionTitle)}</h1><p class="text-center text-slate-600 mb-12">${escapeHtml(content.servicesSectionSubtitle)}</p><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">${servicesHtml}</div></div></section>` : ''}
${sv.steps && steps.length ? `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.stepsSectionTitle)}</h2><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">${stepsHtml}</div></div></section>` : ''}
${pricingHtml ? `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.pricingSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-8">${pricingHtml}</div></div></section>` : ''}`)
  }

  if (pv.portfolio && canLinkToPage('portfolio', content)) {
    const portfolioHtml = showcaseItems.map((item, i) => {
      const img = item.image ? resolveImageForExport(item.image, `portfolio-${i + 1}`, assets) : ''
      const cls = layouts.portfolio === 'case-study' ? 'mb-16 block rounded-xl border overflow-hidden' : 'block rounded-xl border overflow-hidden hover:shadow-lg'
      const itemHref = item.link?.startsWith('http') ? item.link : resolveStaticHref(item.link || 'contact', content)
      return item.link?.startsWith('http')
        ? `<a href="${escapeHtml(item.link)}" class="${cls}">${img ? `<img src="${img}" class="w-full ${layouts.portfolio === 'case-study' ? 'aspect-[21/9]' : 'aspect-[4/3]'} object-cover" />` : ''}<div class="p-6"><h3 class="font-semibold text-lg mb-2">${escapeHtml(item.title)}</h3><p class="opacity-80">${escapeHtml(item.description)}</p>${showcaseCfg.showPrice && item.price ? `<p class="text-lg font-bold mt-2" style="color:${accent}">${escapeHtml(item.price)}</p>` : ''}</div></a>`
        : `<a href="${itemHref}" class="${cls}">${img ? `<img src="${img}" class="w-full ${layouts.portfolio === 'case-study' ? 'aspect-[21/9]' : 'aspect-[4/3]'} object-cover" />` : ''}<div class="p-6"><h3 class="font-semibold text-lg mb-2">${escapeHtml(item.title)}</h3><p class="opacity-80">${escapeHtml(item.description)}</p>${showcaseCfg.showPrice && item.price ? `<p class="text-lg font-bold mt-2" style="color:${accent}">${escapeHtml(item.price)}</p>` : ''}</div></a>`
    }).join('')
    const gridCls = layouts.portfolio === 'case-study' ? 'space-y-0' : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-8'
    pages['portfolio.html'] = wrapPage(ctx, `${showcaseCfg.navLabel} — ${content.businessName}`, `
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">${escapeHtml(content.showcaseSectionTitle || showcaseCfg.sectionTitle)}</h1><p class="text-center text-slate-600 mb-12">${escapeHtml(content.showcaseSectionSubtitle || showcaseCfg.sectionSubtitle)}</p><div class="${gridCls}">${portfolioHtml}</div></div></section>`)
  }

  if (pv.gallery && canLinkToPage('gallery', content)) {
    const gallery = content.galleryImages.map((img, i) => img ? resolveImageForExport(img, `gallery-${i + 1}`, assets) : '').filter(Boolean)
    if (gallery.length) {
      const galleryGrid = layouts.gallery === 'rows'
        ? gallery.map((g) => `<img src="${g}" class="w-full rounded-xl mb-6 object-cover max-h-96" />`).join('')
        : layouts.gallery === 'masonry'
          ? `<div class="columns-1 sm:columns-2 lg:columns-3 gap-4">${gallery.map((g) => `<img src="${g}" class="mb-4 w-full break-inside-avoid rounded-xl" />`).join('')}</div>`
          : `<div class="grid md:grid-cols-3 gap-4">${gallery.map((g) => `<img src="${g}" class="w-full rounded-xl aspect-[4/3] object-cover" />`).join('')}</div>`
      pages['gallery.html'] = wrapPage(ctx, `Gallery — ${content.businessName}`, `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-12">${escapeHtml(content.gallerySectionTitle)}</h1>${galleryGrid}</div></section>`)
    }
  }

  if (pv.blog && canLinkToPage('blog', content)) {
    const blogCtx = { ...ctx, fromNested: true }
    const listLayout = layouts.blog === 'minimal'
      ? blogPosts.map((post) => `<a href="${staticPostPath('blog', postSlug(post), true)}" class="block py-8 border-b"><h3 class="text-xl font-semibold mb-2">${escapeHtml(post.title)}</h3><p class="opacity-80">${escapeHtml(post.excerpt)}</p></a>`).join('')
      : `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">${buildPostCards(blogCtx, 'blog', blogPosts)}</div>`
    pages['blog/index.html'] = wrapPage(blogCtx, `Blog — ${content.businessName}`, `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">${escapeHtml(content.blogSectionTitle)}</h1><p class="text-center text-slate-600 mb-12">${escapeHtml(content.blogSectionSubtitle)}</p>${listLayout}</div></section>`)
    for (const post of blogPosts) {
      const blogPath = `blog/${postSlug(post)}.html`
      pages[blogPath] = wrapPage(blogCtx, `${post.title} — ${content.businessName}`, buildPostArticle(blogCtx, 'blog', post))
    }
  }

  if (pv.news && canLinkToPage('news', content)) {
    const newsCtx = { ...ctx, fromNested: true }
    const listLayout = layouts.news === 'timeline'
      ? `<div class="max-w-3xl mx-auto divide-y">${newsPosts.map((post) => `<a href="${staticPostPath('news', postSlug(post), true)}" class="block py-8"><p class="text-sm font-semibold text-slate-400 mb-2">${escapeHtml(formatPostDate(post.date))}</p><h3 class="text-xl font-semibold mb-2">${escapeHtml(post.title)}</h3><p class="opacity-80">${escapeHtml(post.excerpt)}</p></a>`).join('')}</div>`
      : layouts.news === 'compact'
        ? `<div class="max-w-2xl mx-auto divide-y">${newsPosts.map((post) => `<a href="${staticPostPath('news', postSlug(post), true)}" class="flex justify-between py-5"><span class="font-semibold">${escapeHtml(post.title)}</span><span class="text-xs text-slate-400">${escapeHtml(formatPostDate(post.date))}</span></a>`).join('')}</div>`
        : `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">${buildPostCards(newsCtx, 'news', newsPosts)}</div>`
    pages['news/index.html'] = wrapPage(newsCtx, `News — ${content.businessName}`, `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">${escapeHtml(content.newsSectionTitle)}</h1><p class="text-center text-slate-600 mb-12">${escapeHtml(content.newsSectionSubtitle)}</p>${listLayout}</div></section>`)
    for (const post of newsPosts) {
      const newsPath = `news/${postSlug(post)}.html`
      pages[newsPath] = wrapPage(newsCtx, `${post.title} — ${content.businessName}`, buildPostArticle(newsCtx, 'news', post))
    }
  }

  const contactForm = buildContactFormHtml(content, accent, templateId)
  const faqBlock = sv.faq ? buildFaqSectionHtml(content, templateId) : ''

  if (pv.contact && canLinkToPage('contact', content)) {
    const contactBody = buildContactSectionHtml(templateId, content, contactForm)
    pages['contact.html'] = wrapPage(ctx, `Contact — ${content.businessName}`, `${contactBody}${faqBlock}`)
  }

  return { pages, assets }
}

/** @deprecated Use buildAllSitePages for multi-page export. */
export function generateHtml(
  templateId: TemplateId,
  content: SiteContent,
  colorSchemeId?: string,
  layoutVariantId?: string,
): { html: string; assets: ImageAsset[] } {
  const { pages, assets } = buildAllSitePages(templateId, content, colorSchemeId, layoutVariantId)
  return { html: pages['index.html'] ?? '', assets }
}