import type { SiteContent, TemplateId } from '../types'
import { getSiteNavItems, resolveStaticHref, staticSitePath, type SiteNavItem } from '../data/siteNav'
import { escapeHtml } from './imageUtils'

function navHref(item: SiteNavItem, fromNested?: boolean): string {
  return item.page === 'home' ? staticSitePath('home', fromNested) : staticSitePath(item.page, fromNested)
}

function linkHtml(items: SiteNavItem[], fromNested: boolean | undefined, linkClass: string): string {
  return items
    .map((item) => `<a href="${navHref(item, fromNested)}" class="${linkClass}">${escapeHtml(item.label)}</a>`)
    .join('')
}

export function buildExportNavHtml(
  templateId: TemplateId,
  content: SiteContent,
  accent: string,
  fromNested?: boolean,
): string {
  const navItems = getSiteNavItems(templateId, content)
  const pageLinks = navItems.filter((i) => i.page !== 'home')
  const homeHref = staticSitePath('home', fromNested)
  const ctaHref = resolveStaticHref(content.ctaLink || 'contact', content, fromNested)
  const name = escapeHtml(content.businessName)
  const cta = escapeHtml(content.ctaText)
  const ctaBtn = `<a href="${ctaHref}" class="text-white px-5 py-2 rounded-lg text-sm font-semibold shrink-0" style="background-color:${accent}">${cta}</a>`
  const linkClass = 'hover:underline opacity-80'
  const half = Math.ceil(pageLinks.length / 2)
  const left = pageLinks.slice(0, half)
  const right = pageLinks.slice(half)
  const allLinks = linkHtml(pageLinks, fromNested, linkClass)
  const leftLinks = linkHtml(left, fromNested, linkClass)
  const rightLinks = linkHtml(right, fromNested, linkClass)

  const dotLinks = pageLinks
    .map((item, i) => `${i > 0 ? '<span class="opacity-30">·</span>' : ''}<a href="${navHref(item, fromNested)}" class="${linkClass}">${escapeHtml(item.label)}</a>`)
    .join('')

  const shells: Record<TemplateId, string> = {
    business: `<nav class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-xl font-bold">${name}</a><div class="hidden lg:flex gap-6 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    creative: `<nav class="fixed top-0 z-50 w-full bg-zinc-950/85 backdrop-blur-lg text-white px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-black uppercase tracking-widest">${name}</a><div class="hidden lg:flex gap-8 text-xs font-semibold uppercase tracking-wider">${allLinks}</div>${ctaBtn}</div></nav>`,

    restaurant: `<nav class="sticky top-0 z-50 bg-black/80 text-white px-6 py-5 backdrop-blur"><div class="max-w-6xl mx-auto flex items-center justify-between border-b border-white/10 pb-4 gap-4"><div class="hidden lg:flex flex-1 gap-6 text-sm">${leftLinks}</div><a href="${homeHref}" class="px-4 text-center font-serif text-2xl font-semibold">${name}</a><div class="flex flex-1 justify-end items-center gap-6 text-sm"><div class="hidden lg:flex gap-6">${rightLinks}</div>${ctaBtn}</div></div></nav>`,

    saas: `<nav class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-bold">${name}</a><div class="hidden lg:flex items-center gap-2 text-sm">${dotLinks}</div>${ctaBtn}</div></nav>`,

    fitness: `<nav class="sticky top-0 z-50 bg-black/70 text-white backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-xl font-bold uppercase tracking-wide">${name}</a><div class="hidden lg:flex gap-7 text-sm font-medium uppercase tracking-wide">${allLinks}</div>${ctaBtn}</div></nav>`,

    boutique: `<nav class="relative border-b bg-white/95 px-6 py-6 text-center"><a href="${homeHref}" class="font-serif text-2xl font-light tracking-wide">${name}</a><div class="mt-4 hidden lg:flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">${allLinks}</div><div class="mt-4 lg:absolute lg:right-6 lg:top-6 lg:mt-0">${ctaBtn}</div></nav>`,

    realtor: `<nav class="sticky top-0 z-50 bg-black/75 text-white backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto border-b border-amber-600/30 pb-3 flex items-center justify-between gap-4"><div><a href="${homeHref}" class="text-lg font-bold uppercase tracking-wide">${name}</a><p class="mt-0.5 text-xs uppercase tracking-widest text-amber-400/80">Luxury Real Estate</p></div><div class="hidden lg:flex gap-8 text-sm">${allLinks}</div>${ctaBtn}</div></nav>`,

    photography: `<nav class="sticky top-0 z-50 bg-black/50 text-white backdrop-blur border-b border-white/10 px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-sm font-light uppercase tracking-[0.3em]">${name}</a><div class="hidden lg:flex gap-10 text-xs uppercase tracking-widest">${allLinks}</div>${ctaBtn}</div></nav>`,

    medical: `<nav class="sticky top-0 z-50 border-b bg-white/95 backdrop-blur"><div class="border-b border-teal-100 bg-teal-50/80 px-6 py-1.5 text-center text-xs font-medium text-teal-800">Compassionate care · Same-week appointments</div><div class="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-4"><a href="${homeHref}" class="text-lg font-semibold text-teal-900">${name}</a><div class="hidden lg:flex gap-6 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    lawfirm: `<nav class="sticky top-0 z-50 border-b bg-white/95 backdrop-blur px-6 py-5"><div class="max-w-6xl mx-auto flex items-center gap-8"><a href="${homeHref}" class="shrink-0 font-serif text-xl font-semibold">${name}</a><div class="hidden h-8 w-px bg-stone-300 lg:block"></div><div class="hidden lg:flex flex-1 items-center justify-between"><div class="flex gap-8 text-sm">${allLinks}</div>${ctaBtn}</div></div></nav>`,

    salon: `<nav class="sticky top-0 z-50 border-b bg-pink-50/90 backdrop-blur px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><div class="hidden lg:flex flex-1 justify-end gap-6 text-sm">${leftLinks}</div><a href="${homeHref}" class="font-serif text-2xl font-light tracking-wide text-pink-900">${name}</a><div class="flex flex-1 justify-end items-center gap-6 text-sm"><div class="hidden lg:flex gap-6">${rightLinks}</div>${ctaBtn}</div></div></nav>`,

    noir: `<nav class="fixed top-0 z-50 w-full bg-neutral-950/90 backdrop-blur text-amber-100 border-b border-amber-500/40 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="font-serif text-lg font-semibold uppercase tracking-[0.2em]">${name}</a><div class="hidden lg:flex gap-8 text-xs font-semibold uppercase tracking-widest">${allLinks}</div>${ctaBtn}</div></nav>`,

    terra: `<nav class="sticky top-0 z-50 bg-orange-50/95 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4 rounded-full border border-orange-200 bg-orange-50/90 px-6 py-3 shadow-sm"><a href="${homeHref}" class="text-lg font-bold text-orange-950">${name}</a><div class="hidden lg:flex gap-6 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    coastal: `<nav class="sticky top-0 z-50 bg-sky-50/95 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto border-b-2 border-sky-300/50 pb-3 flex items-center justify-between gap-4"><a href="${homeHref}" class="text-xl font-bold text-sky-950"><span class="border-b-2 border-sky-400 pb-0.5">${name}</span></a><div class="hidden lg:flex gap-7 text-sm font-medium text-sky-900">${allLinks}</div>${ctaBtn}</div></nav>`,

    hotel: `<nav class="sticky top-0 z-50 border-b bg-stone-950/95 text-amber-50 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-semibold tracking-[0.15em] uppercase">${name}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    guesthouse: `<nav class="sticky top-0 z-50 border-b border-stone-200 bg-[#f7f3ec]/95 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="font-serif text-2xl text-stone-900">${name}</a><div class="hidden lg:flex gap-6 text-sm">${allLinks}</div>${ctaBtn}</div></nav>`,

    alpine: `<nav class="sticky top-0 z-50 bg-slate-950/90 text-sky-50 backdrop-blur border-b border-sky-400/20 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-light tracking-[0.2em] uppercase">${name}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    ryokan: `<nav class="sticky top-0 z-50 bg-[#f3efe6]/95 backdrop-blur border-b border-stone-300 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="font-serif text-xl tracking-wide text-stone-900">${name}</a><div class="hidden lg:flex gap-8 text-sm">${allLinks}</div>${ctaBtn}</div></nav>`,

    desert: `<nav class="sticky top-0 z-50 bg-[#1c1410]/95 text-amber-50 backdrop-blur border-b border-amber-700/40 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-light tracking-wide">${name}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    nordic: `<nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-light tracking-wide text-slate-800">${name}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    jungle: `<nav class="sticky top-0 z-50 bg-[#0a120c]/90 backdrop-blur border-b border-lime-700/30 text-lime-50 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-medium tracking-wide">${name}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    vineyard: `<nav class="sticky top-0 z-50 bg-rose-50/95 backdrop-blur px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between border-b border-rose-900/20 pb-4"><a href="${homeHref}" class="font-serif text-2xl font-semibold text-rose-950">${name}</a><div class="hidden lg:flex items-center gap-8 text-sm">${allLinks}${ctaBtn}</div></div></nav>`,

    arcade: `<nav class="sticky top-0 z-50 bg-black text-lime-300 border-b-2 border-lime-400/60 shadow-[0_4px_24px_rgba(163,230,53,0.15)] px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-black uppercase tracking-wider">${name}</a><div class="hidden lg:flex gap-6 text-xs font-bold uppercase tracking-widest">${allLinks}</div>${ctaBtn}</div></nav>`,

    coffee: `<nav class="sticky top-0 z-50 border-b border-amber-900/10 bg-[#faf6f0]/85 backdrop-blur-xl px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="font-serif text-2xl font-semibold text-[#2d1810]">${name}</a><div class="hidden lg:flex gap-8 text-sm">${allLinks}</div>${ctaBtn}</div></nav>`,
  }

  return shells[templateId]
}