import { getColorSchemes } from '../data/colorSchemes'
import { getTemplateMeta } from '../data/defaults'

import { getShowcaseConfig } from '../data/sectionConfig'
import { getSiteNavItems, staticSitePath } from '../data/siteNav'
import type { BlogPostItem, SiteContent, TemplateId } from '../types'
import { canEmbedForm, EMBED_FORM_HEIGHT, getEmbedFormUrl } from '../utils/formEmbed'
import { slugify } from '../utils/slugify'
import { escapeHtml, resolveImageForExport, type ImageAsset } from './imageUtils'
import { tailwindHead } from './htmlShared'

function formatBlogDate(date: string): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function blogSlug(post: BlogPostItem): string {
  return post.slug || slugify(post.title)
}

interface SiteHtmlContext {
  templateId: TemplateId
  content: SiteContent
  accent: string
  accentDark: string
  assets: ImageAsset[]
  fromBlogPost?: boolean
}

function buildNav(ctx: SiteHtmlContext): string {
  const { content, accent, fromBlogPost } = ctx
  const navItems = getSiteNavItems(ctx.templateId, content.sectionVisibility)
  const links = navItems.map((item) => {
    const href = item.page === 'home' ? staticSitePath('home', fromBlogPost) : staticSitePath(item.page, fromBlogPost)
    return `<a href="${href}" class="hover:underline opacity-70">${escapeHtml(item.label)}</a>`
  }).join('')
  const homeHref = staticSitePath('home', fromBlogPost)
  const ctaHref = staticSitePath('contact', fromBlogPost)
  return `<nav class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur px-6 py-4 flex justify-between items-center max-w-6xl mx-auto w-full">
    <a href="${homeHref}" class="text-xl font-bold">${escapeHtml(content.businessName)}</a>
    <div class="hidden md:flex gap-6 text-sm">${links}</div>
    <a href="${ctaHref}" class="text-white px-5 py-2 rounded-lg text-sm font-semibold" style="background-color:${accent}">${escapeHtml(content.ctaText)}</a>
  </nav>`
}

function buildFooter(ctx: SiteHtmlContext): string {
  const { content, fromBlogPost } = ctx
  const navItems = getSiteNavItems(ctx.templateId, content.sectionVisibility)
  const links = navItems.map((item) => {
    const href = item.page === 'home' ? staticSitePath('home', fromBlogPost) : staticSitePath(item.page, fromBlogPost)
    return `<a href="${href}" class="hover:underline opacity-70">${escapeHtml(item.label)}</a>`
  }).join('')
  return `<footer class="border-t py-8 text-center text-sm text-slate-500"><div class="mb-4 flex flex-wrap justify-center gap-6">${links}</div>© ${new Date().getFullYear()} ${escapeHtml(content.businessName)}</footer>`
}

function wrapPage(ctx: SiteHtmlContext, title: string, body: string): string {
  return `${tailwindHead(title)}
<body class="bg-white text-slate-800">
${buildNav(ctx)}
${body}
${buildFooter(ctx)}
</body></html>`
}

function buildContactFormHtml(content: SiteContent, accent: string): string {
  const formUrl = content.contactFormUrl.trim()
  const embedUrl = getEmbedFormUrl(formUrl)
  const mailTarget = content.email || content.reservationEmail || content.supportEmail
  const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
  const nativeForm = `<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <form class="space-y-4" action="${formUrl ? escapeHtml(formUrl) : mailTarget ? `mailto:${escapeHtml(mailTarget)}` : '#'}" method="${formUrl ? 'get' : 'post'}"${formUrl ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label><input name="name" type="text" required class="${inputCls}" /></div>
      <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label><input name="email" type="email" required class="${inputCls}" /></div>
      <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Message</label><textarea name="message" required rows="5" class="${inputCls}"></textarea></div>
      <button type="submit" class="w-full text-white px-6 py-3 rounded-lg font-semibold" style="background-color:${accent}">${escapeHtml(content.contactFormButtonText || 'Send Message')}</button>
    </form>
  </div>`
  if (canEmbedForm(formUrl) && embedUrl) {
    return `<div class="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm" style="height:${EMBED_FORM_HEIGHT}px"><iframe src="${escapeHtml(embedUrl)}" width="100%" height="${EMBED_FORM_HEIGHT}" style="border:0"></iframe></div>`
  }
  return nativeForm
}

function buildBlogCards(ctx: SiteHtmlContext, posts: BlogPostItem[], limit?: number): string {
  const list = limit ? posts.slice(0, limit) : posts
  return list.map((post) => {
    const img = post.image ? resolveImageForExport(post.image, `blog-${blogSlug(post)}`, ctx.assets) : ''
    const prefix = ctx.fromBlogPost ? '../' : ''
    const href = `${prefix}blog/${blogSlug(post)}.html`
    const date = post.date ? `<p class="text-xs uppercase tracking-wider opacity-60 mb-2">${escapeHtml(formatBlogDate(post.date))}</p>` : ''
    return `<a href="${href}" class="block rounded-xl border overflow-hidden hover:shadow-lg transition-shadow bg-white">
      ${img ? `<img src="${prefix}${img}" alt="" class="w-full aspect-[4/3] object-cover" />` : ''}
      <div class="p-6">${date}<h3 class="font-semibold text-lg mb-2">${escapeHtml(post.title)}</h3><p class="opacity-80 line-clamp-3">${escapeHtml(post.excerpt)}</p>${post.author ? `<p class="text-sm font-medium mt-3">By ${escapeHtml(post.author)}</p>` : ''}<span class="inline-block mt-3 text-sm font-semibold" style="color:${ctx.accent}">Read more →</span></div>
    </a>`
  }).join('')
}

export function buildAllSitePages(
  templateId: TemplateId,
  content: SiteContent,
  colorSchemeId?: string,
  _layoutVariantId?: string,
): { pages: Record<string, string>; assets: ImageAsset[] } {
  const scheme = getColorSchemes(templateId).find((s) => s.id === colorSchemeId) ?? getColorSchemes(templateId)[0]
  const accent = scheme.swatches[1]
  const accentDark = scheme.swatches[0]
  const visibility = content.sectionVisibility
  const showcaseCfg = getShowcaseConfig(templateId)
  const assets: ImageAsset[] = []
  const ctx: SiteHtmlContext = { templateId, content, accent, accentDark, assets }
  const pages: Record<string, string> = {}

  const hero = resolveImageForExport(content.heroImage, 'hero', assets)
  const stats = content.stats.filter((s) => s.value)
  const statsHtml = stats.map((s) => `<div class="text-center"><p class="text-3xl font-bold">${escapeHtml(s.value)}</p><p class="text-sm opacity-70 mt-1">${escapeHtml(s.label)}</p></div>`).join('')
  const blogPosts = content.blogPosts.filter((p) => p.title)

  const homeBody = `
<header class="bg-slate-900 text-white py-24"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center"><div><h1 class="text-4xl md:text-5xl font-bold mb-6">${escapeHtml(content.tagline)}</h1><p class="text-slate-300 text-lg mb-8">${escapeHtml(content.heroSubtext)}</p><a href="${staticSitePath('contact')}" class="inline-block bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold">${escapeHtml(content.ctaText)}</a></div>${hero ? `<img src="${hero}" class="rounded-2xl w-full" />` : ''}</div></header>
${visibility.stats && stats.length ? `<section class="py-16 text-white" style="background-color:${accent}"><div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">${statsHtml}</div></section>` : ''}
${visibility.blog && blogPosts.length ? `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><div class="flex justify-between items-end mb-10 gap-4"><div><h2 class="text-3xl font-bold">${escapeHtml(content.blogSectionTitle)}</h2><p class="text-slate-600 mt-2">${escapeHtml(content.blogSectionSubtitle)}</p></div><a href="${staticSitePath('blog')}" class="text-sm font-semibold" style="color:${accent}">View all posts →</a></div><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">${buildBlogCards(ctx, blogPosts, 3)}</div></div></section>` : ''}
${visibility.cta ? `<section class="text-white py-20 text-center" style="background-color:${accentDark}"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold mb-4">${escapeHtml(content.ctaBannerTitle)}</h2><p class="mb-8 text-lg opacity-80">${escapeHtml(content.ctaBannerText)}</p><a href="${staticSitePath('contact')}" class="inline-block bg-white px-8 py-3 rounded-lg font-semibold" style="color:${accentDark}">${escapeHtml(content.ctaText)}</a></div></section>` : ''}`
  pages['index.html'] = wrapPage(ctx, content.businessName, homeBody)

  if (visibility.about) {
    const aboutImg = content.aboutImage ? resolveImageForExport(content.aboutImage, 'about', assets) : ''
    const teamHtml = visibility.team ? content.team.filter((m) => m.name).map((m) => {
      const img = m.image ? resolveImageForExport(m.image, `team-${m.name}`, assets) : ''
      return `<div class="text-center">${img ? `<img src="${img}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />` : ''}<h3 class="font-semibold">${escapeHtml(m.name)}</h3><p class="opacity-70">${escapeHtml(m.role)}</p></div>`
    }).join('') : ''
    pages['about.html'] = wrapPage(ctx, `About — ${content.businessName}`, `
<section class="py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center"><div><h1 class="text-4xl font-bold mb-6">${escapeHtml(content.aboutTitle)}</h1><p class="text-lg leading-relaxed text-slate-600 mb-6">${escapeHtml(content.about)}</p>${content.missionStatement ? `<p class="border-l-4 pl-6 italic text-slate-600" style="border-color:${accent}">${escapeHtml(content.missionStatement)}</p>` : ''}</div>${aboutImg ? `<img src="${aboutImg}" class="rounded-2xl w-full" />` : ''}</div></section>
${teamHtml ? `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.teamSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-8">${teamHtml}</div></div></section>` : ''}`)
  }

  if (visibility.services || visibility.showcase) {
    const services = content.services.filter((s) => s.title)
    const servicesHtml = services.map((s) => `<div class="rounded-xl border p-6"><h3 class="font-semibold text-lg mb-2">${escapeHtml(s.title)}</h3><p class="opacity-80">${escapeHtml(s.description)}</p></div>`).join('')
    const steps = content.steps.filter((s) => s.title)
    const stepsHtml = steps.map((s, i) => `<div><span class="text-2xl font-bold opacity-40">0${i + 1}</span><h3 class="font-semibold mt-2">${escapeHtml(s.title)}</h3><p class="opacity-80 mt-1">${escapeHtml(s.description)}</p></div>`).join('')
    const showcaseItems = content.showcaseItems.filter((i) => i.title)
    const showcaseHtml = showcaseItems.map((item, i) => {
      const img = item.image ? resolveImageForExport(item.image, `showcase-${i + 1}`, assets) : ''
      return `<a href="${staticSitePath('contact')}" class="block rounded-xl border overflow-hidden hover:shadow-lg">${img ? `<img src="${img}" class="w-full aspect-[4/3] object-cover" />` : ''}<div class="p-6"><h3 class="font-semibold text-lg mb-2">${escapeHtml(item.title)}</h3><p class="opacity-80">${escapeHtml(item.description)}</p>${showcaseCfg.showPrice && item.price ? `<p class="text-lg font-bold mt-2" style="color:${accent}">${escapeHtml(item.price)}</p>` : ''}</div></a>`
    }).join('')
    pages['services.html'] = wrapPage(ctx, `Services — ${content.businessName}`, `
${visibility.services && services.length ? `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">${escapeHtml(content.servicesSectionTitle)}</h1><p class="text-center text-slate-600 mb-12">${escapeHtml(content.servicesSectionSubtitle)}</p><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">${servicesHtml}</div></div></section>` : ''}
${visibility.steps && steps.length ? `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.stepsSectionTitle)}</h2><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">${stepsHtml}</div></div></section>` : ''}
${visibility.showcase && showcaseItems.length ? `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-4">${escapeHtml(content.showcaseSectionTitle || showcaseCfg.sectionTitle)}</h2><p class="text-center text-slate-600 mb-12">${escapeHtml(content.showcaseSectionSubtitle || showcaseCfg.sectionSubtitle)}</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">${showcaseHtml}</div></div></section>` : ''}`)
  }

  if (visibility.gallery) {
    const gallery = content.galleryImages.map((img, i) => img ? resolveImageForExport(img, `gallery-${i + 1}`, assets) : '').filter(Boolean)
    if (gallery.length) {
      pages['gallery.html'] = wrapPage(ctx, `Gallery — ${content.businessName}`, `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-12">${escapeHtml(content.gallerySectionTitle)}</h1><div class="grid md:grid-cols-3 gap-4">${gallery.map((g) => `<img src="${g}" class="w-full rounded-xl aspect-[4/3] object-cover" />`).join('')}</div></div></section>`)
    }
  }

  const testimonials = content.testimonials.filter((t) => t.quote)
  if (testimonials.length) {
    const testimonialsHtml = testimonials.map((t) => `<div class="border rounded-xl p-6"><div class="text-amber-400 mb-3">★★★★★</div><p class="italic mb-4 text-lg">"${escapeHtml(t.quote)}"</p><p class="font-semibold">${escapeHtml(t.author)}</p><p class="text-sm opacity-70">${escapeHtml(t.role)}</p></div>`).join('')
    pages['reviews.html'] = wrapPage(ctx, `Reviews — ${content.businessName}`, `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">${escapeHtml(content.testimonialsSectionTitle)}</h1><p class="text-center text-slate-600 mb-12">What our clients say about us</p><div class="grid md:grid-cols-3 gap-6">${testimonialsHtml}</div></div></section>`)
  }

  if (visibility.blog && blogPosts.length) {
    pages['blog/index.html'] = wrapPage({ ...ctx, fromBlogPost: true }, `Blog — ${content.businessName}`, `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">${escapeHtml(content.blogSectionTitle)}</h1><p class="text-center text-slate-600 mb-12">${escapeHtml(content.blogSectionSubtitle)}</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">${buildBlogCards({ ...ctx, fromBlogPost: true }, blogPosts)}</div></div></section>`)
    for (const post of blogPosts) {
      const slug = blogSlug(post)
      const img = post.image ? resolveImageForExport(post.image, `blog-${slug}`, assets) : ''
      const bodyHtml = escapeHtml(post.body).split('\n\n').map((p) => `<p class="text-lg leading-relaxed text-slate-600 mb-6">${p}</p>`).join('')
      const postCtx = { ...ctx, fromBlogPost: true }
      pages[`blog/${slug}.html`] = wrapPage(postCtx, `${post.title} — ${content.businessName}`, `
<article class="py-16"><div class="max-w-3xl mx-auto px-6">
<a href="${staticSitePath('blog', true)}" class="text-sm opacity-70 hover:underline mb-8 inline-block">← Back to blog</a>
${post.date ? `<p class="text-sm uppercase tracking-wider text-slate-400 mb-4">${escapeHtml(formatBlogDate(post.date))}</p>` : ''}
<h1 class="text-4xl font-bold mb-4">${escapeHtml(post.title)}</h1>
${post.author ? `<p class="text-slate-500 mb-8">By ${escapeHtml(post.author)}</p>` : ''}
${img ? `<img src="../${img}" class="w-full rounded-2xl mb-10 aspect-[16/9] object-cover" />` : ''}
${post.excerpt ? `<p class="text-xl text-slate-700 mb-10 border-l-4 pl-6 italic" style="border-color:${accent}">${escapeHtml(post.excerpt)}</p>` : ''}
<div>${bodyHtml}</div>
</div></article>`)
    }
  }

  if (visibility.faq) {
    const faqs = content.faqs.filter((f) => f.question)
    if (faqs.length) {
      const faqHtml = faqs.map((f) => `<div class="border-b py-5"><h3 class="font-semibold mb-2">${escapeHtml(f.question)}</h3><p class="opacity-80">${escapeHtml(f.answer)}</p></div>`).join('')
      pages['faq.html'] = wrapPage(ctx, `FAQ — ${content.businessName}`, `<section class="py-20"><div class="max-w-3xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-12">${escapeHtml(content.faqSectionTitle)}</h1>${faqHtml}</div></section>`)
    }
  }

  const meta = getTemplateMeta(templateId)
  const contactHtml = meta?.contactFields.map((f) => {
    const val = content[f.key]
    return val ? `<div><p class="text-sm opacity-60 mb-1">${escapeHtml(f.label)}</p><p>${escapeHtml(val)}</p></div>` : ''
  }).filter(Boolean).join('') ?? ''
  const contactForm = buildContactFormHtml(content, accent)
  pages['contact.html'] = wrapPage(ctx, `Contact — ${content.businessName}`, `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold mb-10">${escapeHtml(content.contactSectionTitle || 'Get in Touch')}</h1><div class="grid lg:grid-cols-2 gap-12"><div><h2 class="text-xl font-semibold mb-6">${escapeHtml(content.contactFormTitle)}</h2><div class="grid sm:grid-cols-2 gap-6">${contactHtml}</div></div><div>${contactForm}</div></div></section>`)

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
  return { html: pages['index.html'], assets }
}