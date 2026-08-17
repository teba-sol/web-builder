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

function buildTaxFightersHomeBody(ctx: HomeExportContext): string {
  const { content: c, fromNested } = ctx
  const parts: string[] = []
  const steps = c.steps.filter((s) => s.title)
  if (steps.length) {
    const img1 = c.galleryImages[0] ? ctx.resolveImage(c.galleryImages[0], 'tf-step-1') : ''
    const img2 = c.galleryImages[1] ? ctx.resolveImage(c.galleryImages[1], 'tf-step-2') : ''
    parts.push(`<section class="w-full bg-[#6b1f34] text-white py-24 px-6"><div class="max-w-7xl mx-auto">
      <div class="text-center mb-20"><h2 class="text-6xl md:text-7xl font-bold tracking-tight mb-4">${escapeHtml(c.stepsSectionTitle || 'How It Works')}</h2><div class="flex justify-center"><div class="w-20 h-1 bg-white"></div></div></div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16 items-start">
        <div class="space-y-12">${steps.slice(0, 3).map((step, i) => `<div class="border-l-4 border-white pl-6"><h3 class="text-2xl font-bold mb-3 tracking-wide">${i < 2 ? `Step ${i + 1}` : escapeHtml(step.title)}</h3><p class="text-lg leading-relaxed text-white/90">${escapeHtml(step.description)}</p></div>`).join('')}</div>
        ${img1 ? `<div class="w-full h-96 rounded-lg overflow-hidden shadow-2xl"><img src="${img1}" class="w-full h-full object-cover" alt="" /></div>` : ''}
      </div>
      ${steps[3] ? `<div class="h-px bg-white/20 mb-16"></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">${img2 ? `<div class="lg:order-2 w-full h-96 rounded-lg overflow-hidden shadow-2xl"><img src="${img2}" class="w-full h-full object-cover" alt="" /></div>` : ''}<div class="lg:order-1"><h2 class="text-5xl md:text-6xl font-bold mb-8 tracking-tight">${escapeHtml(steps[3].title)}</h2><p class="text-lg leading-relaxed text-white/90">${escapeHtml(steps[3].description)}</p></div></div>` : ''}
    </div></section>`)
  }
  const services = c.services.filter((s) => s.title).slice(0, 3)
  if (services.length) {
    parts.push(`<section class="py-20 px-4" style="background-color:#f9f9f9"><div class="max-w-7xl mx-auto"><div class="text-center mb-16"><h2 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">${escapeHtml(c.servicesSectionTitle)}</h2><p class="text-xl text-gray-600">${escapeHtml(c.servicesSectionSubtitle)}</p></div><div class="grid md:grid-cols-3 gap-8">${services.map((s) => `<a href="${resolveStaticHref('services', c, fromNested)}" class="bg-white p-8 rounded-xl border border-gray-200 shadow-lg"><div class="w-12 h-12 rounded-lg mb-4" style="background-color:#800020"></div><h3 class="text-2xl font-bold mb-4">${escapeHtml(s.title)}</h3><p class="text-gray-600 leading-relaxed">${escapeHtml(s.description)}</p></a>`).join('')}</div></div></section>`)
  }
  if (c.about?.trim()) {
    const aboutImg = c.aboutImage ? ctx.resolveImage(c.aboutImage, 'tf-about') : ''
    parts.push(`<section class="w-full bg-white"><div class="max-w-7xl mx-auto px-6 py-16 lg:py-24"><div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"><div class="space-y-8"><p class="text-4xl lg:text-5xl font-bold leading-tight" style="color:#800020">${escapeHtml(c.aboutTitle)}</p><p class="text-lg leading-relaxed" style="color:#800020">${escapeHtml(c.about)}</p><a href="${resolveStaticHref('contact', c, fromNested)}" class="inline-block px-8 py-3 rounded-lg font-semibold text-white" style="background-color:#800020">Book Now<br><span class="text-sm font-medium">Receive 20% Off</span></a></div>${aboutImg ? `<div class="rounded-xl overflow-hidden shadow-lg"><img src="${aboutImg}" class="w-full h-[550px] object-cover" alt="" /></div>` : ''}</div></div></section>`)
  }
  const testimonials = c.testimonials.filter((t) => t.quote)
  if (testimonials.length) {
    parts.push(`<section class="bg-black py-16 px-4"><div class="max-w-7xl mx-auto"><p class="text-5xl sm:text-6xl font-bold text-white italic mb-2">${escapeHtml(c.teamSectionTitle || 'Meet Your Team')}</p><div class="w-16 h-1 bg-red-500 mb-12"></div><div class="grid md:grid-cols-3 gap-4">${testimonials.slice(0, 3).map((t) => `<div class="bg-white rounded-lg p-4 shadow-lg"><p class="font-semibold text-black">${escapeHtml(t.author)}</p><p class="text-yellow-400 text-sm">★★★★★</p><p class="text-sm text-gray-700 mt-2">${escapeHtml(t.quote)}</p></div>`).join('')}</div></div></section>`)
  }
  const locations = c.showcaseItems.filter((i) => i.title).slice(0, 5)
  if (locations.length) {
    parts.push(`<section class="bg-white py-20 px-4"><h2 class="text-4xl font-bold text-center text-black mb-12">${escapeHtml(c.showcaseSectionTitle)}</h2><div class="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-7xl mx-auto">${locations.map((item, i) => {
      const img = item.image ? ctx.resolveImage(item.image, `tf-loc-${i}`) : ''
      return `<a href="${resolveStaticHref('portfolio', c, fromNested)}" class="block">${img ? `<img src="${img}" class="w-full h-40 object-cover rounded-xl shadow-lg mb-3" />` : ''}<p class="text-center text-sm font-semibold">${escapeHtml(item.title)}</p></a>`
    }).join('')}</div></section>`)
  }
  parts.push(`<section class="py-20 px-4" style="background-color:#800020"><div class="max-w-4xl mx-auto text-center"><h2 class="text-4xl sm:text-5xl font-bold text-white mb-6">${escapeHtml(c.ctaBannerTitle)}</h2><p class="text-xl text-gray-100 mb-8">${escapeHtml(c.ctaBannerText)}</p><a href="${resolveStaticHref('contact', c, fromNested)}" class="inline-block bg-white text-[#800020] px-10 py-4 rounded-lg font-semibold text-lg shadow-lg">Contact Us</a></div></section>`)
  return parts.join('\n')
}

function buildAureumHomeBody(ctx: HomeExportContext): string {
  const { content: c, fromNested } = ctx
  const parts: string[] = []
  const services = c.services.filter((s) => s.title).slice(0, 3)
  if (services.length) {
    parts.push(`<section class="px-6 pt-24 pb-8 bg-[#f4efe6]"><div class="max-w-7xl mx-auto"><p class="mb-3 text-xs font-semibold tracking-[0.28em] uppercase text-[#b8956a]">What we do</p><h2 class="font-serif text-4xl md:text-5xl">${escapeHtml(c.servicesSectionTitle)}</h2><p class="mt-4 text-lg text-[#5c5148] max-w-2xl">${escapeHtml(c.servicesSectionSubtitle)}</p><div class="mt-14 grid md:grid-cols-3 gap-6">${services
      .map((s, i) => {
        const img = c.galleryImages[i] ? ctx.resolveImage(c.galleryImages[i], `au-svc-${i}`) : ''
        return `<a href="${resolveStaticHref('services', c, fromNested)}" class="bg-white rounded-[1.5rem] overflow-hidden shadow-sm ring-1 ring-[#eadfce]">${img ? `<img src="${img}" class="h-48 w-full object-cover" alt="" />` : ''}<div class="p-8"><p class="font-serif text-4xl text-[#b8956a] mb-4">0${i + 1}</p><h3 class="font-serif text-2xl">${escapeHtml(s.title)}</h3><p class="mt-3 text-[#5c5148] leading-relaxed">${escapeHtml(s.description)}</p></div></a>`
      })
      .join('')}</div></div></section>`)
  }
  const steps = c.steps.filter((s) => s.title)
  if (steps.length) {
    parts.push(`<section class="px-6 py-24 bg-[#f4efe6]"><div class="max-w-7xl mx-auto rounded-[2rem] bg-[#2a211c] text-white px-6 md:px-14 py-16"><p class="text-xs font-semibold tracking-[0.28em] uppercase text-[#b8956a] mb-3">The engagement</p><h2 class="font-serif text-4xl md:text-5xl mb-14">${escapeHtml(c.stepsSectionTitle)}</h2><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-10">${steps
      .map(
        (step, i) =>
          `<div><p class="font-serif text-3xl text-[#b8956a]">${String(i + 1).padStart(2, '0')}</p><h3 class="mt-4 font-serif text-xl">${escapeHtml(step.title)}</h3><p class="mt-3 text-sm text-white/70 leading-relaxed">${escapeHtml(step.description)}</p></div>`,
      )
      .join('')}</div></div></section>`)
  }
  if (c.about?.trim()) {
    const aboutImg = c.aboutImage ? ctx.resolveImage(c.aboutImage, 'au-about') : ''
    parts.push(`<section class="px-6 pb-8 bg-[#f4efe6]"><div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center"><div><h2 class="font-serif text-4xl md:text-5xl">${escapeHtml(c.aboutTitle)}</h2><p class="mt-6 text-lg text-[#5c5148] leading-relaxed">${escapeHtml(c.about)}</p></div>${aboutImg ? `<img src="${aboutImg}" class="h-[460px] w-full object-cover rounded-[1.75rem]" alt="" />` : ''}</div></section>`)
  }
  const reviews = c.testimonials.filter((t) => t.quote).slice(0, 3)
  if (reviews.length) {
    parts.push(`<section class="px-6 py-24 bg-[#f4efe6]"><div class="max-w-7xl mx-auto"><h2 class="font-serif text-4xl md:text-5xl text-center mb-12">${escapeHtml(c.testimonialsSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-6">${reviews
      .map(
        (t) =>
          `<figure class="bg-white rounded-[1.5rem] p-8 ring-1 ring-[#eadfce]"><p class="font-serif text-2xl leading-snug">“${escapeHtml(t.quote)}”</p><figcaption class="mt-8 text-sm font-semibold">${escapeHtml(t.author)}<span class="block font-normal text-[#8a7d72] mt-1">${escapeHtml(t.role)}</span></figcaption></figure>`,
      )
      .join('')}</div></div></section>`)
  }
  const locations = c.showcaseItems.filter((i) => i.title).slice(0, 6)
  if (locations.length) {
    parts.push(`<section class="px-6 pb-8 bg-[#f4efe6]"><div class="max-w-7xl mx-auto"><h2 class="font-serif text-4xl md:text-5xl mb-10">${escapeHtml(c.showcaseSectionTitle)}</h2><div class="grid grid-cols-2 md:grid-cols-3 gap-4">${locations
      .map((item, i) => {
        const img = item.image ? ctx.resolveImage(item.image, `au-loc-${i}`) : ''
        return `<a href="${resolveStaticHref('portfolio', c, fromNested)}" class="relative overflow-hidden rounded-[1.25rem] block">${img ? `<img src="${img}" class="h-52 md:h-64 w-full object-cover" alt="" />` : ''}<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div><p class="absolute bottom-4 left-4 font-serif text-xl text-white">${escapeHtml(item.title)}</p></a>`
      })
      .join('')}</div></div></section>`)
  }
  parts.push(`<section class="px-6 pb-24 bg-[#f4efe6]"><div class="max-w-7xl mx-auto rounded-[2rem] px-8 md:px-14 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8" style="background-color:#7a2e38"><div class="text-white max-w-xl"><h2 class="font-serif text-4xl md:text-5xl">${escapeHtml(c.ctaBannerTitle)}</h2><p class="mt-4 text-white/80">${escapeHtml(c.ctaBannerText)}</p></div><a href="${resolveStaticHref('contact', c, fromNested)}" class="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#7a2e38]">${escapeHtml(c.ctaText)}</a></div></section>`)
  return parts.join('\n')
}

function buildFluxHomeBody(ctx: HomeExportContext): string {
  const { content: c, fromNested } = ctx
  const parts: string[] = []
  const services = c.services.filter((s) => s.title).slice(0, 3)
  if (services.length) {
    const img0 = c.galleryImages[0] ? ctx.resolveImage(c.galleryImages[0], 'fx-svc-0') : ''
    const lead = services[0]
    const rest = services.slice(1)
    parts.push(`<section class="px-6 py-24 bg-[#070708] text-white"><div class="max-w-7xl mx-auto"><p class="text-xs font-black tracking-[0.24em] uppercase text-[#ff2d6a] mb-2">The menu</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">${escapeHtml(c.servicesSectionTitle)}</h2><div class="mt-10 grid lg:grid-cols-5 gap-4">
      <a href="${resolveStaticHref('services', c, fromNested)}" class="relative overflow-hidden rounded-[1.75rem] lg:col-span-3 min-h-[320px] bg-[#c8ff3d] text-black">${img0 ? `<img src="${img0}" class="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-multiply" alt="" />` : ''}<div class="relative p-8 flex flex-col justify-end h-full"><p class="text-xs font-black tracking-[0.2em] uppercase">01</p><h3 class="mt-3 text-3xl md:text-4xl font-black">${escapeHtml(lead.title)}</h3><p class="mt-3 max-w-md text-sm font-medium text-black/70">${escapeHtml(lead.description)}</p></div></a>
      <div class="lg:col-span-2 grid gap-4">${rest
        .map(
          (s, i) =>
            `<a href="${resolveStaticHref('services', c, fromNested)}" class="rounded-[1.75rem] border border-white/10 bg-white/5 p-7"><p class="text-xs font-black tracking-[0.2em] uppercase text-[#c8ff3d]">0${i + 2}</p><h3 class="mt-3 text-2xl font-black">${escapeHtml(s.title)}</h3><p class="mt-2 text-sm text-white/55">${escapeHtml(s.description)}</p></a>`,
        )
        .join('')}</div>
    </div></div></section>`)
  }
  const steps = c.steps.filter((s) => s.title)
  if (steps.length) {
    parts.push(`<section class="px-6 pb-8 bg-[#070708]"><div class="max-w-7xl mx-auto rounded-[2rem] bg-[#c8ff3d] text-black px-6 md:px-12 py-16"><h2 class="text-4xl md:text-6xl font-black tracking-tight">${escapeHtml(c.stepsSectionTitle)}</h2><div class="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">${steps
      .map(
        (step, i) =>
          `<div class="border-t-4 border-black pt-5"><p class="text-5xl font-black">${String(i + 1).padStart(2, '0')}</p><h3 class="mt-4 text-xl font-black">${escapeHtml(step.title)}</h3><p class="mt-2 text-sm font-medium text-black/70">${escapeHtml(step.description)}</p></div>`,
      )
      .join('')}</div></div></section>`)
  }
  if (c.about?.trim()) {
    const aboutImg = c.aboutImage ? ctx.resolveImage(c.aboutImage, 'fx-about') : ''
    parts.push(`<section class="px-6 py-24 bg-[#070708] text-white"><div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"><div><p class="text-xs font-black tracking-[0.24em] uppercase text-[#ff2d6a] mb-3">Why Flux</p><h2 class="text-4xl md:text-5xl font-black tracking-tight">${escapeHtml(c.aboutTitle)}</h2><p class="mt-6 text-lg text-white/60 leading-relaxed">${escapeHtml(c.about)}</p></div>${aboutImg ? `<img src="${aboutImg}" class="h-[420px] w-full object-cover rounded-[1.75rem]" alt="" />` : ''}</div></section>`)
  }
  const reviews = c.testimonials.filter((t) => t.quote).slice(0, 3)
  if (reviews.length) {
    parts.push(`<section class="px-6 pb-8 bg-[#070708] text-white"><div class="max-w-7xl mx-auto"><h2 class="text-4xl font-black tracking-tight mb-10">${escapeHtml(c.testimonialsSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-4">${reviews
      .map(
        (t) =>
          `<figure class="rounded-[1.5rem] bg-white text-black p-7"><p class="text-5xl font-black text-[#ff2d6a] leading-none">“</p><p class="mt-2 text-lg font-bold leading-snug">${escapeHtml(t.quote)}</p><figcaption class="mt-6 text-sm font-black">${escapeHtml(t.author)}<span class="block font-medium text-black/50 mt-1">${escapeHtml(t.role)}</span></figcaption></figure>`,
      )
      .join('')}</div></div></section>`)
  }
  parts.push(`<section class="px-6 py-24 bg-[#070708]"><div class="max-w-7xl mx-auto rounded-[2rem] px-8 md:px-14 py-16" style="background-color:#ff2d6a"><h2 class="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl">${escapeHtml(c.ctaBannerTitle)}</h2><p class="mt-4 text-lg text-white/85 max-w-xl">${escapeHtml(c.ctaBannerText)}</p><a href="${resolveStaticHref('contact', c, fromNested)}" class="inline-block mt-8 rounded-full bg-black px-8 py-3.5 text-sm font-black text-[#c8ff3d]">${escapeHtml(c.ctaText)}</a></div></section>`)
  return parts.join('\n')
}

function buildAxiomHomeBody(ctx: HomeExportContext): string {
  const { content: c, fromNested } = ctx
  const parts: string[] = []
  const services = c.services.filter((s) => s.title).slice(0, 4)
  if (services.length) {
    parts.push(`<section class="px-6 py-24 bg-white text-[#0a1628]"><div class="max-w-7xl mx-auto"><p class="text-xs font-bold tracking-[0.28em] uppercase text-[#c41e3a]">Practice</p><h2 class="mt-3 font-serif text-4xl md:text-5xl">${escapeHtml(c.servicesSectionTitle)}</h2><div class="mt-12 divide-y divide-[#0a1628]/10 border-y border-[#0a1628]/10">${services
      .map(
        (s, i) =>
          `<a href="${resolveStaticHref('services', c, fromNested)}" class="grid md:grid-cols-12 gap-4 py-8 items-center"><p class="font-serif text-3xl text-[#c41e3a] md:col-span-2">${String(i + 1).padStart(2, '0')}</p><h3 class="font-serif text-2xl md:col-span-4">${escapeHtml(s.title)}</h3><p class="text-[#3d4a5c] md:col-span-6">${escapeHtml(s.description)}</p></a>`,
      )
      .join('')}</div></div></section>`)
  }
  const steps = c.steps.filter((s) => s.title)
  if (steps.length) {
    parts.push(`<section class="px-6 pb-8 bg-white"><div class="max-w-7xl mx-auto bg-[#0a1628] text-white px-8 md:px-14 py-16"><h2 class="font-serif text-4xl md:text-5xl">${escapeHtml(c.stepsSectionTitle)}</h2><div class="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-10">${steps
      .map(
        (step, i) =>
          `<div><p class="text-xs font-bold tracking-[0.24em] uppercase text-[#c41e3a]">0${i + 1}</p><h3 class="mt-3 font-serif text-xl">${escapeHtml(step.title)}</h3><p class="mt-3 text-sm text-white/65">${escapeHtml(step.description)}</p></div>`,
      )
      .join('')}</div></div></section>`)
  }
  if (c.about?.trim()) {
    const aboutImg = c.aboutImage ? ctx.resolveImage(c.aboutImage, 'ax-about') : ''
    parts.push(`<section class="px-6 py-24 bg-white"><div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center"><div><h2 class="font-serif text-4xl md:text-5xl">${escapeHtml(c.aboutTitle)}</h2><p class="mt-6 text-lg text-[#3d4a5c] leading-relaxed">${escapeHtml(c.about)}</p></div>${aboutImg ? `<img src="${aboutImg}" class="h-[440px] w-full object-cover" alt="" />` : ''}</div></section>`)
  }
  parts.push(`<section class="px-6 pb-24 bg-white"><div class="max-w-7xl mx-auto px-10 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-white" style="background-color:#c41e3a"><div class="max-w-xl"><h2 class="font-serif text-4xl md:text-5xl">${escapeHtml(c.ctaBannerTitle)}</h2><p class="mt-4 text-white/85">${escapeHtml(c.ctaBannerText)}</p></div><a href="${resolveStaticHref('contact', c, fromNested)}" class="bg-white px-8 py-3.5 text-sm font-bold text-[#0a1628]">${escapeHtml(c.ctaText)}</a></div></section>`)
  return parts.join('\n')
}

function buildHelixHomeBody(ctx: HomeExportContext): string {
  const { content: c, fromNested } = ctx
  const parts: string[] = []
  const services = c.services.filter((s) => s.title).slice(0, 4)
  if (services.length) {
    parts.push(`<section class="px-6 py-24 bg-[#f8fafc]"><div class="max-w-7xl mx-auto"><p class="text-xs font-bold tracking-[0.24em] uppercase text-[#155dfc]">Engagements</p><h2 class="mt-3 text-4xl md:text-5xl font-black tracking-tight">${escapeHtml(c.servicesSectionTitle)}</h2><div class="mt-12 grid md:grid-cols-2 gap-4">${services
      .map((s, i) => {
        const featured = i === 0
        return `<a href="${resolveStaticHref('services', c, fromNested)}" class="rounded-2xl p-8 ${featured ? 'md:col-span-2 text-white bg-[#155dfc]' : 'bg-white ring-1 ring-slate-200'}"><p class="text-xs font-black tracking-[0.2em] uppercase ${featured ? 'text-white/70' : 'text-[#155dfc]'}">0${i + 1}</p><h3 class="mt-3 text-2xl font-black">${escapeHtml(s.title)}</h3><p class="mt-3 leading-relaxed ${featured ? 'text-white/80' : 'text-slate-600'}">${escapeHtml(s.description)}</p></a>`
      })
      .join('')}</div></div></section>`)
  }
  const steps = c.steps.filter((s) => s.title)
  if (steps.length) {
    parts.push(`<section class="px-6 pb-8 bg-[#f8fafc]"><div class="max-w-7xl mx-auto rounded-3xl bg-white p-8 md:p-12 ring-1 ring-slate-200"><h2 class="text-4xl font-black tracking-tight">${escapeHtml(c.stepsSectionTitle)}</h2><div class="mt-10 grid md:grid-cols-4 gap-8">${steps
      .map(
        (step, i) =>
          `<div><p class="text-5xl font-black text-[#155dfc]">${i + 1}</p><h3 class="mt-3 text-lg font-black">${escapeHtml(step.title)}</h3><p class="mt-2 text-sm text-slate-600">${escapeHtml(step.description)}</p></div>`,
      )
      .join('')}</div></div></section>`)
  }
  if (c.about?.trim()) {
    const aboutImg = c.aboutImage ? ctx.resolveImage(c.aboutImage, 'hx-about') : ''
    parts.push(`<section class="px-6 py-24 bg-[#f8fafc]"><div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"><div><h2 class="text-4xl md:text-5xl font-black tracking-tight">${escapeHtml(c.aboutTitle)}</h2><p class="mt-6 text-lg text-slate-600 leading-relaxed">${escapeHtml(c.about)}</p></div>${aboutImg ? `<img src="${aboutImg}" class="h-[420px] w-full object-cover rounded-2xl" alt="" />` : ''}</div></section>`)
  }
  parts.push(`<section class="px-6 py-24 bg-[#f8fafc]"><div class="max-w-7xl mx-auto rounded-3xl px-8 md:px-14 py-14 text-white bg-[#155dfc]"><h2 class="max-w-3xl text-4xl md:text-5xl font-black tracking-tight">${escapeHtml(c.ctaBannerTitle)}</h2><p class="mt-4 max-w-xl text-white/85">${escapeHtml(c.ctaBannerText)}</p><a href="${resolveStaticHref('contact', c, fromNested)}" class="inline-block mt-8 rounded-md bg-white px-8 py-3.5 text-sm font-black text-[#155dfc]">${escapeHtml(c.ctaText)}</a></div></section>`)
  return parts.join('\n')
}

export function buildStaticHomePageBody(ctx: HomeExportContext): string {
  if (ctx.templateId === 'taxfighters') return buildTaxFightersHomeBody(ctx)
  if (ctx.templateId === 'aureum') return buildAureumHomeBody(ctx)
  if (ctx.templateId === 'flux') return buildFluxHomeBody(ctx)
  if (ctx.templateId === 'axiom') return buildAxiomHomeBody(ctx)
  if (ctx.templateId === 'helix') return buildHelixHomeBody(ctx)
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