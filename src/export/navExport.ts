import { getNavShellId } from '../catalog/catalog'
import { showBrandName } from '../data/brand'
import type { SiteContent, TemplateId } from '../types'
import { getSiteNavItems, resolveStaticHref, staticSitePath, type SiteNavItem } from '../data/siteNav'
import { escapeHtml } from './imageUtils'

function navHref(item: SiteNavItem, fromNested?: boolean): string {
  return item.page === 'home' ? staticSitePath('home', fromNested) : staticSitePath(item.page, fromNested)
}

function brandImageSrc(src: string, fromNested?: boolean): string {
  if (!src) return ''
  if (/^(https?:|data:|\/)/i.test(src)) return src
  return `${fromNested ? '../' : ''}${src}`
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
  const logoSrc = brandImageSrc(content.logo, fromNested)
  const logo = logoSrc
    ? `<img src="${escapeHtml(logoSrc)}" alt="" class="h-8 w-auto max-h-9 max-w-[10rem] object-contain" />`
    : ''
  const nameSpan = showBrandName(content)
    ? `<span>${name}</span>`
    : `<span class="sr-only">${name || 'Home'}</span>`
  const brand = `<span class="inline-flex items-center gap-2">${logo}${nameSpan}</span>`
  const cta = escapeHtml(content.ctaText)
  const ctaBtn = `<a href="${ctaHref}" data-brand-cta class="text-white px-5 py-2 rounded-lg text-sm font-semibold shrink-0" style="background-color:${accent}">${cta}</a>`
  const linkClass = 'hover:underline opacity-80'
  const half = Math.ceil(pageLinks.length / 2)
  const left = pageLinks.slice(0, half)
  const right = pageLinks.slice(half)
  const allLinks = linkHtml(pageLinks, fromNested, linkClass)
  const leftLinks = linkHtml(left, fromNested, linkClass)
  const rightLinks = linkHtml(right, fromNested, linkClass)
  const mobileLinks = linkHtml(pageLinks, fromNested, 'block rounded-lg px-3 py-2.5 text-base font-medium hover:bg-slate-100')
  const mobileNav = `<nav class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 text-slate-900 backdrop-blur lg:hidden">
  <div class="flex items-center justify-between gap-3 px-4 py-3">
    <a href="${homeHref}" class="min-w-0 truncate font-semibold">${brand}</a>
    <details class="relative">
      <summary class="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300 [&::-webkit-details-marker]:hidden">
        <span class="sr-only">Menu</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </summary>
      <div class="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
        ${mobileLinks}
        <div class="mt-3">${ctaBtn}</div>
      </div>
    </details>
  </div>
</nav>`

  const dotLinks = pageLinks
    .map((item, i) => `${i > 0 ? '<span class="opacity-30">·</span>' : ''}<a href="${navHref(item, fromNested)}" class="${linkClass}">${escapeHtml(item.label)}</a>`)
    .join('')

  const shells: Record<string, string> = {
    business: `<nav class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-xl font-bold">${brand}</a><div class="hidden lg:flex gap-6 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    creative: `<nav class="fixed top-0 z-50 w-full bg-zinc-950/85 backdrop-blur-lg text-white px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-black uppercase tracking-widest">${brand}</a><div class="hidden lg:flex gap-8 text-xs font-semibold uppercase tracking-wider">${allLinks}</div>${ctaBtn}</div></nav>`,

    restaurant: `<nav class="sticky top-0 z-50 bg-black/80 text-white px-6 py-5 backdrop-blur"><div class="max-w-6xl mx-auto flex items-center justify-between border-b border-white/10 pb-4 gap-4"><div class="hidden lg:flex flex-1 gap-6 text-sm">${leftLinks}</div><a href="${homeHref}" class="px-4 text-center font-serif text-2xl font-semibold">${brand}</a><div class="flex flex-1 justify-end items-center gap-6 text-sm"><div class="hidden lg:flex gap-6">${rightLinks}</div>${ctaBtn}</div></div></nav>`,

    saas: `<nav class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-bold">${brand}</a><div class="hidden lg:flex items-center gap-2 text-sm">${dotLinks}</div>${ctaBtn}</div></nav>`,

    fitness: `<nav class="sticky top-0 z-50 bg-black/70 text-white backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-xl font-bold uppercase tracking-wide">${brand}</a><div class="hidden lg:flex gap-7 text-sm font-medium uppercase tracking-wide">${allLinks}</div>${ctaBtn}</div></nav>`,

    boutique: `<nav class="relative border-b bg-white/95 px-6 py-6 text-center"><a href="${homeHref}" class="font-serif text-2xl font-light tracking-wide">${brand}</a><div class="mt-4 hidden lg:flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">${allLinks}</div><div class="mt-4 lg:absolute lg:right-6 lg:top-6 lg:mt-0">${ctaBtn}</div></nav>`,

    realtor: `<nav class="sticky top-0 z-50 bg-black/75 text-white backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto border-b border-amber-600/30 pb-3 flex items-center justify-between gap-4"><div><a href="${homeHref}" class="text-lg font-bold uppercase tracking-wide">${brand}</a><p class="mt-0.5 text-xs uppercase tracking-widest text-amber-400/80">Luxury Real Estate</p></div><div class="hidden lg:flex gap-8 text-sm">${allLinks}</div>${ctaBtn}</div></nav>`,

    photography: `<nav class="sticky top-0 z-50 bg-black/50 text-white backdrop-blur border-b border-white/10 px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-sm font-light uppercase tracking-[0.3em]">${brand}</a><div class="hidden lg:flex gap-10 text-xs uppercase tracking-widest">${allLinks}</div>${ctaBtn}</div></nav>`,

    medical: `<nav class="sticky top-0 z-50 border-b bg-white/95 backdrop-blur"><div class="border-b border-teal-100 bg-teal-50/80 px-6 py-1.5 text-center text-xs font-medium text-teal-800">Compassionate care · Same-week appointments</div><div class="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-4"><a href="${homeHref}" class="text-lg font-semibold text-teal-900">${brand}</a><div class="hidden lg:flex gap-6 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    lawfirm: `<nav class="sticky top-0 z-50 border-b bg-white/95 backdrop-blur px-6 py-5"><div class="max-w-6xl mx-auto flex items-center gap-8"><a href="${homeHref}" class="shrink-0 font-serif text-xl font-semibold">${brand}</a><div class="hidden h-8 w-px bg-stone-300 lg:block"></div><div class="hidden lg:flex flex-1 items-center justify-between"><div class="flex gap-8 text-sm">${allLinks}</div>${ctaBtn}</div></div></nav>`,

    cpa: `<div><div class="text-xs text-[#DDEBD0]" style="background-color:#0F211C"><div class="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">${content.phone ? `<a href="tel:${escapeHtml(content.phone)}">${escapeHtml(content.phone)}</a>` : ''}${content.hours ? `<span>${escapeHtml(content.hours)}</span>` : ''}</div></div><nav class="sticky top-0 z-50 border-b border-white/10 shadow-lg" style="background-color:#16302A"><div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between"><a href="${homeHref}" class="text-xl font-black text-white">${brand}</a><div class="hidden lg:flex gap-1">${allLinks}</div><a href="${ctaHref}" class="rounded-full px-6 py-2 text-sm font-bold" style="background-color:#A8D93F;color:#16302A">${cta}</a></div></nav></div>`,

    axiom: `<nav class="sticky top-0 z-50 border-b bg-white shadow-sm"><div class="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between"><a href="${homeHref}" class="text-lg font-black text-[#0A1628]">${brand}</a><div class="hidden lg:flex gap-1 text-sm font-semibold">${allLinks}</div><a href="${ctaHref}" class="rounded-lg px-6 py-2.5 text-sm font-bold text-white" style="background-color:#0B4F8A">${cta}</a></div></nav>`,

    helix: `<div><div class="bg-black text-white py-3 px-4"><div class="max-w-7xl mx-auto flex items-center justify-between">${content.email ? `<a href="mailto:${escapeHtml(content.email)}" class="font-medium hover:underline">Email</a>` : ''}${content.phone ? `<a href="tel:${escapeHtml(content.phone)}" class="font-medium text-sm md:text-2xl">${escapeHtml(content.phone)}</a>` : ''}</div></div><nav class="sticky top-0 z-50 bg-[#800020] text-white shadow-lg rounded-b-3xl"><div class="max-w-7xl mx-auto px-4"><div class="flex items-center justify-between h-20"><a href="${homeHref}" class="shrink-0 font-bold text-xl">${logoSrc ? `<img src="${escapeHtml(logoSrc)}" alt="" class="h-16 w-16 object-contain" />` : brand}</a><div class="hidden md:flex items-center gap-1">${allLinks}</div><a href="${ctaHref}" class="hidden md:block bg-white text-[#800020] px-6 py-2 rounded-lg font-semibold">Book now</a></div></div></nav></div>`,

    flux: `<div><div class="text-xs text-[#FFF3E7]" style="background-color:#241C15"><div class="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-6">${content.phone ? `<a href="tel:${escapeHtml(content.phone)}">${escapeHtml(content.phone)}</a>` : ''}${content.email ? `<span>${escapeHtml(content.email)}</span>` : ''}</div></div><nav class="sticky top-0 z-50 border-b border-[#EEDFCF] bg-[#FFF9F4]/95"><div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between"><a href="${homeHref}" class="text-xl font-black text-[#241C15]">${brand}</a><div class="hidden lg:flex gap-1">${allLinks}</div><a href="${ctaHref}" class="rounded-xl px-6 py-3 text-sm font-bold text-white" style="background-color:#FA6B34">${cta}</a></div></nav></div>`,

    aureum: `<div><div class="border-b border-purple-200 text-xs" style="background-color:#eee4e6"><div class="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-6 text-purple-700">${content.phone ? `<a href="tel:${escapeHtml(content.phone)}">${escapeHtml(content.phone)}</a>` : ''}${content.email ? `<span>${escapeHtml(content.email)}</span>` : ''}</div></div><nav class="sticky top-0 z-50 border-b border-slate-300 bg-slate-50/95"><div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between"><a href="${homeHref}" class="text-xl font-black">${brand}</a><div class="hidden lg:flex gap-1">${allLinks}</div><a href="${ctaHref}" class="rounded-xl px-6 py-3 text-sm font-bold text-white" style="background-color:#9333ea">${cta}</a></div></nav></div>`,

    taxfighters: `<div><div class="border-b border-rose-200 text-xs" style="background-color:#eee4e6"><div class="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-6 text-rose-700">${content.phone ? `<a href="tel:${escapeHtml(content.phone)}">${escapeHtml(content.phone)}</a>` : ''}${content.email ? `<span>${escapeHtml(content.email)}</span>` : ''}</div></div><nav class="sticky top-0 z-50 border-b border-slate-300 bg-slate-50/95"><div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between"><a href="${homeHref}" class="text-xl font-black">${logoSrc ? `<img src="${escapeHtml(logoSrc)}" alt="" class="h-10 w-auto object-contain" />` : brand}</a><div class="hidden lg:flex gap-1">${allLinks}</div><a href="${ctaHref}" class="rounded-xl px-6 py-3 text-sm font-bold text-white" style="background-color:#e60039">${cta}</a></div></nav></div>`,

    salon: `<nav class="sticky top-0 z-50 border-b bg-pink-50/90 backdrop-blur px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><div class="hidden lg:flex flex-1 justify-end gap-6 text-sm">${leftLinks}</div><a href="${homeHref}" class="font-serif text-2xl font-light tracking-wide text-pink-900">${brand}</a><div class="flex flex-1 justify-end items-center gap-6 text-sm"><div class="hidden lg:flex gap-6">${rightLinks}</div>${ctaBtn}</div></div></nav>`,

    noir: `<nav class="fixed top-0 z-50 w-full bg-neutral-950/90 backdrop-blur text-amber-100 border-b border-amber-500/40 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="font-serif text-lg font-semibold uppercase tracking-[0.2em]">${brand}</a><div class="hidden lg:flex gap-8 text-xs font-semibold uppercase tracking-widest">${allLinks}</div>${ctaBtn}</div></nav>`,

    terra: `<nav class="sticky top-0 z-50 bg-orange-50/95 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4 rounded-full border border-orange-200 bg-orange-50/90 px-6 py-3 shadow-sm"><a href="${homeHref}" class="text-lg font-bold text-orange-950">${brand}</a><div class="hidden lg:flex gap-6 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    coastal: `<nav class="sticky top-0 z-50 bg-sky-50/95 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto border-b-2 border-sky-300/50 pb-3 flex items-center justify-between gap-4"><a href="${homeHref}" class="text-xl font-bold text-sky-950"><span class="border-b-2 border-sky-400 pb-0.5">${brand}</span></a><div class="hidden lg:flex gap-7 text-sm font-medium text-sky-900">${allLinks}</div>${ctaBtn}</div></nav>`,

    hotel: `<nav class="sticky top-0 z-50 border-b bg-stone-950/95 text-amber-50 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-semibold tracking-[0.15em] uppercase">${brand}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    guesthouse: `<nav class="sticky top-0 z-50 border-b border-stone-200 bg-[#f7f3ec]/95 backdrop-blur px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="font-serif text-2xl text-stone-900">${brand}</a><div class="hidden lg:flex gap-6 text-sm">${allLinks}</div>${ctaBtn}</div></nav>`,

    alpine: `<nav class="sticky top-0 z-50 bg-slate-950/90 text-sky-50 backdrop-blur border-b border-sky-400/20 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-light tracking-[0.2em] uppercase">${brand}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    ryokan: `<nav class="sticky top-0 z-50 bg-[#f3efe6]/95 backdrop-blur border-b border-stone-300 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="font-serif text-xl tracking-wide text-stone-900">${brand}</a><div class="hidden lg:flex gap-8 text-sm">${allLinks}</div>${ctaBtn}</div></nav>`,

    jungle: `<nav class="sticky top-0 z-50 bg-[#0a120c]/90 backdrop-blur border-b border-lime-700/30 text-lime-50 px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-medium tracking-wide">${brand}</a><div class="hidden lg:flex gap-7 text-sm font-medium">${allLinks}</div>${ctaBtn}</div></nav>`,

    vineyard: `<nav class="sticky top-0 z-50 bg-rose-50/95 backdrop-blur px-6 py-5"><div class="max-w-6xl mx-auto flex items-center justify-between border-b border-rose-900/20 pb-4"><a href="${homeHref}" class="font-serif text-2xl font-semibold text-rose-950">${brand}</a><div class="hidden lg:flex items-center gap-8 text-sm">${allLinks}${ctaBtn}</div></div></nav>`,

    arcade: `<nav class="sticky top-0 z-50 bg-black text-lime-300 border-b-2 border-lime-400/60 shadow-[0_4px_24px_rgba(163,230,53,0.15)] px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="text-lg font-black uppercase tracking-wider">${brand}</a><div class="hidden lg:flex gap-6 text-xs font-bold uppercase tracking-widest">${allLinks}</div>${ctaBtn}</div></nav>`,

    coffee: `<nav class="sticky top-0 z-50 border-b border-amber-900/10 bg-[#faf6f0]/85 backdrop-blur-xl px-6 py-4"><div class="max-w-6xl mx-auto flex items-center justify-between gap-4"><a href="${homeHref}" class="font-serif text-2xl font-semibold text-[#2d1810]">${brand}</a><div class="hidden lg:flex gap-8 text-sm">${allLinks}</div>${ctaBtn}</div></nav>`,
  }

  const desktop = shells[getNavShellId(templateId)] ?? shells.business
  return `${mobileNav}<div class="hidden lg:block">${desktop}</div>`
}