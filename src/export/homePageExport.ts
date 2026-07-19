import { getShowcaseConfig } from '../data/sectionConfig'
import { canLinkToPage, resolveStaticHref, staticSitePath } from '../data/siteNav'
import type { SiteContent, TemplateId } from '../types'
import { escapeHtml } from './imageUtils'
import { buildContactSectionHtml, buildExploreSectionHtml, buildFaqSectionHtml } from './sectionExport'

export interface HomeExportContext {
  templateId: TemplateId
  content: SiteContent
  accent: string
  accentDark: string
  fromNested?: boolean
  buildBlogCards: (limit: number) => string
  buildNewsCards: (limit: number) => string
  resolveImage: (url: string, name: string) => string
  contactFormHtml?: string
}

function sectionHeader(title: string, subtitle: string, exploreHref: string, exploreLabel: string, accent: string): string {
  return `<div class="flex flex-wrap justify-between items-end gap-4 mb-10">
    <div><h2 class="text-3xl font-bold">${escapeHtml(title)}</h2>${subtitle ? `<p class="text-slate-600 mt-2">${escapeHtml(subtitle)}</p>` : ''}</div>
    <a href="${exploreHref}" class="text-sm font-semibold" style="color:${accent}">${escapeHtml(exploreLabel)}</a>
  </div>`
}

export function buildStaticHomePageBody(ctx: HomeExportContext): string {
  const { content: c, accent, fromNested } = ctx
  const pv = c.pageVisibility
  const sv = c.sectionVisibility
  const showcaseCfg = getShowcaseConfig(ctx.templateId)
  const parts: string[] = []

  const stats = c.stats.filter((s) => s.value)
  if (sv.stats && stats.length) {
    parts.push(`<section class="py-16 text-white" style="background-color:${accent}">
  <div class="max-w-6xl mx-auto px-6 pb-2 text-center"><p class="text-sm font-semibold uppercase tracking-widest opacity-80">Trust signals</p></div>
  <div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">${stats.map((s) => `<div class="text-center"><p class="text-3xl font-bold">${escapeHtml(s.value)}</p><p class="text-sm opacity-70 mt-1">${escapeHtml(s.label)}</p></div>`).join('')}</div>
</section>`)
  }

  const services = c.services.filter((s) => s.title)
  if (pv.services && services.length && canLinkToPage('services', c)) {
    const href = resolveStaticHref('services', c, fromNested)
    parts.push(`<section class="py-20"><div class="max-w-6xl mx-auto px-6">${sectionHeader(c.servicesSectionTitle, c.servicesSectionSubtitle, href, 'Explore all →', accent)}<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">${services.slice(0, 4).map((s, i) => `<a href="${href}" class="block rounded-xl border p-6 hover:shadow-md"><span class="text-sm font-bold opacity-40">0${i + 1}</span><h3 class="font-semibold text-lg mt-2 mb-2">${escapeHtml(s.title)}</h3><p class="opacity-80 line-clamp-3">${escapeHtml(s.description)}</p></a>`).join('')}</div></div></section>`)
  }

  const showcaseItems = c.showcaseItems.filter((i) => i.title)
  if (pv.portfolio && showcaseItems.length && canLinkToPage('portfolio', c)) {
    const href = resolveStaticHref('portfolio', c, fromNested)
    parts.push(`<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6">${sectionHeader(c.showcaseSectionTitle || showcaseCfg.sectionTitle, c.showcaseSectionSubtitle || showcaseCfg.sectionSubtitle, href, 'Explore all →', accent)}<div class="grid sm:grid-cols-3 gap-8">${showcaseItems.slice(0, 3).map((item, i) => {
      const img = item.image ? ctx.resolveImage(item.image, `showcase-teaser-${i}`) : ''
      return `<a href="${href}" class="block rounded-xl border overflow-hidden bg-white hover:shadow-lg">${img ? `<img src="${img}" class="w-full aspect-[4/3] object-cover" />` : ''}<div class="p-6"><h3 class="font-semibold">${escapeHtml(item.title)}</h3><p class="opacity-80 line-clamp-2 mt-2">${escapeHtml(item.description)}</p></div></a>`
    }).join('')}</div></div></section>`)
  }

  const blogPosts = c.blogPosts.filter((p) => p.title)
  if (pv.blog && blogPosts.length) {
    parts.push(`<section class="py-20"><div class="max-w-6xl mx-auto px-6">${sectionHeader(c.blogSectionTitle, c.blogSectionSubtitle, staticSitePath('blog', fromNested), 'Explore all posts →', accent)}<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">${ctx.buildBlogCards(3)}</div></div></section>`)
  }

  const newsPosts = c.newsPosts.filter((p) => p.title)
  if (pv.news && newsPosts.length) {
    parts.push(`<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6">${sectionHeader(c.newsSectionTitle, c.newsSectionSubtitle, staticSitePath('news', fromNested), 'Explore all news →', accent)}<div class="grid sm:grid-cols-3 gap-8">${ctx.buildNewsCards(3)}</div></div></section>`)
  }

  const testimonials = c.testimonials.filter((t) => t.quote)
  if (sv.testimonials) {
    const cards = testimonials.length
      ? testimonials.slice(0, 3).map((t) => `<div class="rounded-xl border bg-white p-8"><p class="text-lg mb-6">"${escapeHtml(t.quote)}"</p><p class="font-semibold">${escapeHtml(t.author)}</p><p class="text-sm opacity-70">${escapeHtml(t.role)}</p></div>`).join('')
      : '<p class="text-center text-slate-500 col-span-full">Client reviews</p>'
    parts.push(`<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-4">${escapeHtml(c.testimonialsSectionTitle)}</h2><p class="text-center text-slate-600 mb-12">What our clients say about us</p><div class="grid md:grid-cols-3 gap-6">${cards}</div></div></section>`)
  }

  if (pv.about && c.about?.trim() && canLinkToPage('about', c)) {
    const aboutImg = c.aboutImage ? ctx.resolveImage(c.aboutImage, 'about-teaser') : ''
    const excerpt = c.about.length > 280 ? `${c.about.slice(0, 280).trim()}…` : c.about
    parts.push(`<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center"><div><h2 class="text-3xl font-bold mb-6">${escapeHtml(c.aboutTitle)}</h2><p class="text-lg leading-relaxed text-slate-600 mb-6">${escapeHtml(excerpt)}</p>${c.missionStatement ? `<p class="border-l-4 pl-6 italic text-slate-600" style="border-color:${accent}">${escapeHtml(c.missionStatement)}</p>` : ''}<a href="${resolveStaticHref('about', c, fromNested)}" class="inline-block mt-8 text-sm font-semibold" style="color:${accent}">Learn more about us →</a></div>${aboutImg ? `<img src="${aboutImg}" class="rounded-2xl w-full" />` : ''}</div></section>`)
  }

  if (sv.faq) {
    const faqHtml = buildFaqSectionHtml(c, ctx.templateId)
    if (faqHtml) parts.push(faqHtml)
  }

  if (pv.contact && ctx.contactFormHtml) {
    parts.push(buildContactSectionHtml(ctx.templateId, c, ctx.contactFormHtml))
  }

  const exploreHtml = buildExploreSectionHtml(ctx.templateId, c, accent, fromNested)
  if (exploreHtml) parts.push(exploreHtml)

  return parts.join('\n')
}