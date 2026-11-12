import { getShowcaseConfig } from '../data/sectionConfig'
import { canLinkToPage, resolveStaticHref, staticSitePath } from '../data/siteNav'
import type { SiteContent, TemplateId } from '../types'
import { contactButtonLabel } from '../data/footer'
import { escapeHtml } from './imageUtils'
import { isHospitalityTemplate } from '../data/hospitality'
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

function financeContactForm(ctx: HomeExportContext, inputCls: string, btnStyle: string): string {
  if (ctx.contactFormHtml) return ctx.contactFormHtml
  return `<form class="space-y-4" action="#" method="post">
    <input name="name" required placeholder="Your name" class="${inputCls}" />
    <input name="email" type="email" placeholder="Email" class="${inputCls}" />
    <input name="phone" type="tel" placeholder="Phone" class="${inputCls}" />
    <textarea name="message" rows="4" placeholder="Message" class="${inputCls}"></textarea>
    <button type="submit" class="rounded-xl px-8 py-3.5 font-bold text-white" style="${btnStyle}">${escapeHtml(contactButtonLabel(ctx.content.contactFormButtonText))}</button>
  </form>`
}

interface FinanceTheme {
  section: string
  alt: string
  accent: string
  accentText: string
  heading: string
  muted: string
  card: string
}

function themedFinanceHome(ctx: HomeExportContext, theme: FinanceTheme): string {
  const { content: c, fromNested } = ctx
  const sv = c.sectionVisibility
  const parts: string[] = []
  const stats = sv.stats ? c.stats.filter((s) => s.value) : []
  const services = c.services.filter((s) => s.title)
  const steps = sv.steps ? c.steps.filter((s) => s.title) : []
  const reviews = sv.testimonials ? c.testimonials.filter((t) => t.quote) : []
  const faqs = sv.faq ? c.faqs.filter((f) => f.question) : []
  const locations = c.showcaseItems.filter((i) => i.title)
  const plans = sv.pricing ? c.pricing.filter((p) => p.title) : []
  const aboutImg = c.aboutImage ? ctx.resolveImage(c.aboutImage, 'fin-about') : ''

  if (stats.length) {
    parts.push(`<section class="${theme.alt} py-12"><div class="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6 text-center">${stats
      .slice(0, 4)
      .map((s) => `<div class="${theme.card} p-6 rounded-2xl"><p class="text-4xl font-extrabold ${theme.heading}">${escapeHtml(s.value)}</p><p class="mt-1 text-sm font-semibold" style="color:${theme.accent}">${escapeHtml(s.label)}</p></div>`)
      .join('')}</div></section>`)
  }
  if (c.about?.trim()) {
    parts.push(`<section class="${theme.section} py-24 px-4"><div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">${aboutImg ? `<img src="${aboutImg}" class="w-full h-[480px] object-cover rounded-3xl" alt="" />` : ''}<div><p class="text-xs font-bold uppercase tracking-widest" style="color:${theme.accent}">About</p><h2 class="text-3xl sm:text-4xl font-extrabold mt-3 ${theme.heading}">${escapeHtml(c.aboutTitle)}</h2><p class="mt-6 leading-relaxed ${theme.muted}">${escapeHtml(c.about)}</p><a href="${resolveStaticHref('contact', c, fromNested)}" class="inline-block mt-8 rounded-xl px-7 py-3.5 text-sm font-bold text-white" style="background-color:${theme.accent}">${escapeHtml(c.ctaText)}</a></div></div></section>`)
  }
  if (services.length) {
    parts.push(`<section class="${theme.alt} py-24 px-4"><div class="max-w-7xl mx-auto"><div class="text-center max-w-3xl mx-auto mb-12"><h2 class="text-3xl font-extrabold ${theme.heading}">${escapeHtml(c.servicesSectionTitle)}</h2><p class="mt-3 ${theme.muted}">${escapeHtml(c.servicesSectionSubtitle)}</p></div><div class="grid md:grid-cols-3 gap-8">${services
      .slice(0, 4)
      .map((s) => `<a href="${resolveStaticHref('services', c, fromNested)}" class="${theme.card} p-8 rounded-3xl block"><div class="w-14 h-14 rounded-2xl mb-4" style="background-color:${theme.accent}"></div><h3 class="text-xl font-bold ${theme.heading}">${escapeHtml(s.title)}</h3><p class="mt-3 text-sm ${theme.muted}">${escapeHtml(s.description)}</p></a>`)
      .join('')}</div></div></section>`)
  }
  if (steps.length) {
    parts.push(`<section class="${theme.section} py-24 px-4"><div class="max-w-7xl mx-auto"><h2 class="text-3xl font-extrabold text-center mb-12 ${theme.heading}">${escapeHtml(c.stepsSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-8">${steps
      .slice(0, 4)
      .map((step, i) => `<div class="${theme.card} p-8 rounded-3xl text-center"><div class="w-12 h-12 rounded-full mx-auto flex items-center justify-center font-black text-white" style="background-color:${theme.accent}">${i + 1}</div><h3 class="mt-4 text-xl font-bold ${theme.heading}">${escapeHtml(step.title)}</h3><p class="mt-2 text-xs ${theme.muted}">${escapeHtml(step.description)}</p></div>`)
      .join('')}</div></div></section>`)
  }
  if (sv.pricing) {
    const pricingPlans = plans.length
      ? plans
      : [{ title: 'Custom quote', description: 'Tell us what you need and we will price the work clearly before we start.', price: 'Contact us', tag: '', featured: true }]
    parts.push(`<section id="pricing" class="${theme.alt} py-24 px-4"><div class="max-w-7xl mx-auto"><div class="text-center mb-12"><p class="text-xs font-bold uppercase tracking-widest" style="color:${theme.accent}">Pricing</p><h2 class="text-3xl font-extrabold mt-2 ${theme.heading}">${escapeHtml(c.pricingSectionTitle)}</h2></div><div class="grid md:grid-cols-3 gap-6">${pricingPlans
      .map((p) => `<div class="${theme.card} p-8 rounded-3xl"${p.featured ? ` style="border-color:${theme.accent};box-shadow:0 0 0 1px ${theme.accent}"` : ''}><p class="text-xs font-bold uppercase tracking-wider" style="color:${theme.accent}">${escapeHtml(p.tag)}</p><h3 class="text-xl font-bold ${theme.heading}">${escapeHtml(p.title)}</h3><p class="my-3 text-3xl font-black" style="color:${theme.accent}">${escapeHtml(p.price)}</p><p class="text-sm ${theme.muted}">${escapeHtml(p.description)}</p></div>`)
      .join('')}</div></div></section>`)
  }
  if (reviews.length) {
    parts.push(`<section class="${theme.alt} py-24 px-4"><div class="max-w-7xl mx-auto"><h2 class="text-3xl font-extrabold text-center mb-12 ${theme.heading}">${escapeHtml(c.testimonialsSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-8">${reviews
      .slice(0, 3)
      .map((t) => `<figure class="${theme.card} p-6 rounded-2xl"><p class="${theme.muted} text-sm">“${escapeHtml(t.quote)}”</p><figcaption class="mt-4 text-xs font-bold ${theme.heading}">${escapeHtml(t.author)} <span class="font-normal">${escapeHtml(t.role)}</span></figcaption></figure>`)
      .join('')}</div></div></section>`)
  }
  if (locations.length) {
    parts.push(`<section class="${theme.section} py-20 px-4"><h2 class="text-3xl font-extrabold text-center mb-12 ${theme.heading}">${escapeHtml(c.showcaseSectionTitle)}</h2><div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">${locations
      .slice(0, 4)
      .map((item, i) => {
        const img = item.image ? ctx.resolveImage(item.image, `fin-loc-${i}`) : ''
        return `<a href="${resolveStaticHref('portfolio', c, fromNested)}" class="block">${img ? `<img src="${img}" class="w-full h-40 object-cover rounded-xl mb-3" alt="" />` : ''}<p class="text-center text-sm font-semibold ${theme.heading}">${escapeHtml(item.title)}</p></a>`
      })
      .join('')}</div></section>`)
  }
  if (faqs.length) {
    parts.push(`<section class="${theme.section} py-24 px-4"><div class="max-w-4xl mx-auto"><h2 class="text-3xl font-extrabold text-center mb-10 ${theme.heading}">${escapeHtml(c.faqSectionTitle)}</h2>${faqs
      .map((f) => `<details class="${theme.card} rounded-2xl mb-3"><summary class="cursor-pointer p-5 font-bold ${theme.heading}">${escapeHtml(f.question)}</summary><p class="px-5 pb-5 text-sm ${theme.muted}">${escapeHtml(f.answer)}</p></details>`)
      .join('')}</div></section>`)
  }
  parts.push(`<section class="${theme.alt} py-24 px-4"><div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12"><div><h2 class="text-3xl font-extrabold ${theme.heading}">${escapeHtml(c.contactSectionTitle)}</h2><p class="mt-4 ${theme.muted}">${escapeHtml(c.phone)}</p><p class="${theme.muted}">${escapeHtml(c.email)}</p><p class="${theme.muted}">${escapeHtml(c.address)}</p></div><div class="${theme.card} p-8 rounded-3xl">${financeContactForm(ctx, 'w-full rounded-xl border px-4 py-3 text-sm', `background-color:${theme.accent}`)}</div></div></section>`)
  if (sv.cta) {
    parts.push(`<section class="py-20 px-4" style="background-color:${theme.accent}"><div class="max-w-4xl mx-auto text-center text-white"><h2 class="text-4xl font-bold mb-4">${escapeHtml(c.ctaBannerTitle)}</h2><p class="text-white/85 mb-8">${escapeHtml(c.ctaBannerText)}</p><a href="${resolveStaticHref('contact', c, fromNested)}" class="inline-block bg-white px-10 py-4 rounded-lg font-semibold" style="color:${theme.accent}">${escapeHtml(c.ctaText)}</a></div></section>`)
  }
  return parts.join('\n')
}

function buildTaxFightersHomeBody(ctx: HomeExportContext): string {
  return themedFinanceHome(ctx, {
    section: 'bg-slate-50',
    alt: 'bg-slate-100/60',
    accent: '#e60039',
    accentText: 'text-rose-600',
    heading: 'text-slate-900',
    muted: 'text-slate-600',
    card: 'bg-white border border-slate-300',
  })
}

function buildAureumHomeBody(ctx: HomeExportContext): string {
  return themedFinanceHome(ctx, {
    section: 'bg-slate-50',
    alt: 'bg-slate-100/60',
    accent: '#9333ea',
    accentText: 'text-purple-600',
    heading: 'text-slate-900',
    muted: 'text-slate-600',
    card: 'bg-white border border-slate-300',
  })
}

function buildFluxHomeBody(ctx: HomeExportContext): string {
  return themedFinanceHome(ctx, {
    section: 'bg-[#FFF9F4]',
    alt: 'bg-[#FFF3E7]',
    accent: '#FA6B34',
    accentText: 'text-[#FA6B34]',
    heading: 'text-[#241C15]',
    muted: 'text-[#4A3B2C]',
    card: 'bg-white border border-[#EEDFCF]',
  })
}

function buildAxiomHomeBody(ctx: HomeExportContext): string {
  return themedFinanceHome(ctx, {
    section: 'bg-[#F7F9FC]',
    alt: 'bg-white',
    accent: '#0B4F8A',
    accentText: 'text-[#2196F3]',
    heading: 'text-[#0A1628]',
    muted: 'text-[#546E8A]',
    card: 'bg-white border border-[#D6E4F0]',
  })
}

function buildHelixHomeBody(ctx: HomeExportContext): string {
  return themedFinanceHome(ctx, {
    section: 'bg-black',
    alt: 'bg-neutral-950',
    accent: '#e11d48',
    accentText: 'text-rose-400',
    heading: 'text-white',
    muted: 'text-neutral-400',
    card: 'bg-neutral-900/60 border border-neutral-800',
  })
}

function buildCpaHomeBody(ctx: HomeExportContext): string {
  return themedFinanceHome(ctx, {
    section: 'bg-[#F6F3EA]',
    alt: 'bg-[#EFEBDD]',
    accent: '#16302A',
    accentText: 'text-[#7FB821]',
    heading: 'text-[#16211C]',
    muted: 'text-[#6B7A70]',
    card: 'bg-white border border-[#E4E0D4]',
  })
}


export function buildStaticHomePageBody(ctx: HomeExportContext): string {
  if (ctx.templateId === 'taxfighters') return buildTaxFightersHomeBody(ctx)
  if (ctx.templateId === 'aureum') return buildAureumHomeBody(ctx)
  if (ctx.templateId === 'flux') return buildFluxHomeBody(ctx)
  if (ctx.templateId === 'axiom') return buildAxiomHomeBody(ctx)
  if (ctx.templateId === 'helix') return buildHelixHomeBody(ctx)
  if (ctx.templateId === 'cpa') return buildCpaHomeBody(ctx)
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

  const steps = c.steps.filter((s) => s.title)
  if (sv.steps && steps.length) {
    parts.push(`<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(c.stepsSectionTitle)}</h2><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">${steps.map((step, i) => `<div><span class="text-2xl font-bold opacity-40">0${i + 1}</span><h3 class="font-semibold mt-2">${escapeHtml(step.title)}</h3><p class="opacity-80 mt-1">${escapeHtml(step.description)}</p></div>`).join('')}</div></div></section>`)
  }

  const testimonials = c.testimonials.filter((t) => t.quote)
  if (sv.testimonials) {
    const sub = isHospitalityTemplate(ctx.templateId) ? 'What our guests say about their stay' : 'What our clients say about us'
    const cards = testimonials.length
      ? testimonials.slice(0, 3).map((t) => `<div class="rounded-xl border bg-white p-8 flex h-full flex-col items-center justify-between text-center"><div class="flex flex-col items-center"><div class="mb-3 flex justify-center gap-0.5 text-amber-400">★★★★★</div><p class="text-lg mb-6">"${escapeHtml(t.quote)}"</p></div><div class="mt-auto pt-2"><p class="font-semibold">${escapeHtml(t.author)}</p><p class="text-sm opacity-70">${escapeHtml(t.role)}</p></div></div>`).join('')
      : '<p class="text-center text-slate-500 col-span-full">Guest and client reviews</p>'
    parts.push(`<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-4">${escapeHtml(c.testimonialsSectionTitle)}</h2><p class="text-center text-slate-600 mb-12">${sub}</p><div class="grid md:grid-cols-3 gap-6">${cards}</div></div></section>`)
  }

  if (pv.about && c.about?.trim() && canLinkToPage('about', c)) {
    const aboutImg = c.aboutImage ? ctx.resolveImage(c.aboutImage, 'about-teaser') : ''
    const excerpt = c.about.length > 280 ? `${c.about.slice(0, 280).trim()}…` : c.about
    parts.push(`<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center"><div><h2 class="text-3xl font-bold mb-6">${escapeHtml(c.aboutTitle)}</h2><p class="text-lg leading-relaxed text-slate-600 mb-6">${escapeHtml(excerpt)}</p>${c.missionStatement ? `<p class="border-l-4 pl-6 italic text-slate-600" style="border-color:${accent}">${escapeHtml(c.missionStatement)}</p>` : ''}<a href="${resolveStaticHref('about', c, fromNested)}" class="inline-block mt-8 text-sm font-semibold" style="color:${accent}">Learn more about us →</a></div>${aboutImg ? `<img src="${aboutImg}" class="rounded-2xl w-full" />` : ''}</div></section>`)
  }

  const plans = c.pricing.filter((p) => p.title)
  if (sv.pricing && plans.length) {
    parts.push(`<section class="py-20 bg-slate-50"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(c.pricingSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-8">${plans.map((plan) => `<div class="rounded-xl border bg-white p-6 ${plan.featured ? 'ring-2' : ''}" style="${plan.featured ? `border-color:${accent}` : ''}">${plan.tag ? `<p class="text-xs font-bold uppercase tracking-wider mb-2" style="color:${accent}">${escapeHtml(plan.tag)}</p>` : ''}<h3 class="font-bold text-lg">${escapeHtml(plan.title)}</h3><p class="text-3xl font-bold my-3" style="color:${accent}">${escapeHtml(plan.price)}</p><p class="opacity-80">${escapeHtml(plan.description)}</p></div>`).join('')}</div></div></section>`)
  }

  const team = c.team.filter((m) => m.name)
  if (sv.team && team.length) {
    parts.push(`<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(c.teamSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-8">${team.map((member) => {
      const img = member.image ? ctx.resolveImage(member.image, `home-team-${member.name}`) : ''
      return `<div class="text-center">${img ? `<img src="${img}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover" alt="" />` : ''}<h3 class="font-semibold">${escapeHtml(member.name)}</h3><p class="opacity-70">${escapeHtml(member.role)}</p></div>`
    }).join('')}</div></div></section>`)
  }

  if (sv.faq) {
    const faqHtml = buildFaqSectionHtml(c, ctx.templateId)
    if (faqHtml) parts.push(faqHtml)
  }

  if (sv.cta && (c.ctaBannerTitle || c.ctaBannerText || c.ctaText)) {
    parts.push(`<section class="py-20 text-white" style="background-color:${accent}"><div class="max-w-3xl mx-auto px-6 text-center"><h2 class="text-3xl font-bold mb-4">${escapeHtml(c.ctaBannerTitle)}</h2><p class="mb-8 text-lg opacity-80">${escapeHtml(c.ctaBannerText)}</p><a href="${resolveStaticHref(c.ctaLink || 'contact', c, fromNested)}" class="inline-block bg-white px-8 py-3 rounded-lg font-semibold" style="color:${accent}">${escapeHtml(c.ctaText)}</a></div></section>`)
  }

  if (pv.contact && ctx.contactFormHtml) {
    parts.push(buildContactSectionHtml(ctx.templateId, c, ctx.contactFormHtml))
  }

  if (!isHospitalityTemplate(ctx.templateId)) {
    const exploreHtml = buildExploreSectionHtml(ctx.templateId, c, accent, fromNested)
    if (exploreHtml) parts.push(exploreHtml)
  }

  return parts.join('\n')
}