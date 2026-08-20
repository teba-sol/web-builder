import { getTemplateMeta } from '../data/defaults'
import { getSectionVariants } from '../data/sectionVariants'
import { getSiteNavItems, staticSitePath } from '../data/siteNav'
import type { SiteContent, TemplateId } from '../types'
import { canEmbedForm, EMBED_FORM_HEIGHT, getEmbedFormUrl } from '../utils/formEmbed'
import { escapeHtml } from './imageUtils'

function contactFieldsHtml(c: SiteContent, templateId: TemplateId): string {
  const meta = getTemplateMeta(templateId)
  if (!meta) return ''
  return meta.contactFields
    .filter((f) => c[f.key])
    .map((f) => `<div><p class="opacity-60 mb-1 text-sm">${escapeHtml(f.label)}</p><p>${escapeHtml(c[f.key])}</p></div>`)
    .join('')
}

function formInputClasses(templateId: TemplateId): { input: string; wrap: string } {
  const style = getSectionVariants(templateId).contactForm
  switch (style) {
    case 'underline':
      return { input: 'w-full border-0 border-b-2 border-zinc-300 bg-transparent py-3 text-sm focus:outline-none focus:border-zinc-900', wrap: 'p-0 border-0 shadow-none bg-transparent' }
    case 'dark-filled':
      return { input: 'w-full rounded-lg border border-amber-500/20 bg-neutral-900 px-4 py-3 text-sm text-amber-50 focus:outline-none', wrap: 'rounded-xl border border-amber-500/30 bg-neutral-950 p-6' }
    case 'soft-rounded':
      return { input: 'w-full rounded-2xl border border-stone-200 bg-stone-50 px-5 py-3 text-sm focus:outline-none', wrap: 'rounded-3xl border border-stone-200 bg-white p-8 shadow-sm' }
    case 'minimal-border':
      return { input: 'w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none', wrap: 'rounded-lg border border-slate-200 bg-slate-50/50 p-6' }
    case 'bold-outline':
      return { input: 'w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium uppercase focus:outline-none', wrap: 'border-4 border-black bg-white p-6 shadow-[8px_8px_0_#000]' }
    case 'elegant-serif':
      return { input: 'w-full border-0 border-b border-stone-300 bg-transparent py-3 font-serif text-sm focus:outline-none', wrap: 'p-0 border-0 bg-transparent' }
    case 'neon-glow':
      return { input: 'w-full rounded-lg border-2 border-lime-400/40 bg-black px-4 py-3 text-sm text-lime-100 focus:outline-none focus:border-lime-400', wrap: 'rounded-xl border-2 border-lime-400/30 bg-black/90 p-6' }
    default:
      return { input: 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none', wrap: 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm' }
  }
}

export function buildStyledContactFormHtml(content: SiteContent, accent: string, templateId: TemplateId): string {
  const formUrl = content.contactFormUrl.trim()
  const embedUrl = getEmbedFormUrl(formUrl)
  const mailTarget = content.email || content.reservationEmail || content.supportEmail
  const { input, wrap } = formInputClasses(templateId)

  if (canEmbedForm(formUrl) && embedUrl) {
    return `<div class="${wrap}" style="height:${EMBED_FORM_HEIGHT}px;overflow:hidden"><iframe src="${escapeHtml(embedUrl)}" width="100%" height="${EMBED_FORM_HEIGHT}" style="border:0"></iframe></div>`
  }

  return `<div class="${wrap}">
    <form class="js-clone-form space-y-4" data-mode="html" action="${formUrl ? escapeHtml(formUrl) : mailTarget ? `mailto:${escapeHtml(mailTarget)}` : '#'}" method="${formUrl ? 'get' : 'post'}"${formUrl ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      <div><label class="block text-sm font-medium mb-1.5">Your Name</label><input name="name" type="text" required class="${input}" /></div>
      <div><label class="block text-sm font-medium mb-1.5">Email</label><input name="email" type="email" required class="${input}" /></div>
      <div><label class="block text-sm font-medium mb-1.5">Phone</label><input name="phone" type="tel" class="${input}" /></div>
      <div><label class="block text-sm font-medium mb-1.5">Message</label><textarea name="message" required rows="5" class="${input}"></textarea></div>
      <button type="submit" class="w-full text-white px-6 py-3 rounded-lg font-semibold" style="background-color:${accent}">${escapeHtml(content.contactFormButtonText || 'Send Message')}</button>
      <div class="js-form-success hidden rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800">Message sent. We will follow up shortly.</div>
    </form>
  </div>`
}

export function buildFaqSectionHtml(content: SiteContent, templateId: TemplateId): string {
  const faqs = content.faqs.filter((f) => f.question)
  if (!faqs.length) return ''
  const { faq: layout } = getSectionVariants(templateId)
  const title = escapeHtml(content.faqSectionTitle)
  const items = faqs.map((faq) => {
    const q = escapeHtml(faq.question)
    const a = escapeHtml(faq.answer)
    return { q, a }
  })

  switch (layout) {
    case 'accordion':
      return `<section id="faq" class="py-20"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-10">${title}</h2><div class="space-y-3">${items.map((f) => `<details class="rounded-xl border bg-white"><summary class="cursor-pointer px-5 py-4 font-semibold">${f.q}</summary><p class="border-t px-5 py-4 text-slate-600">${f.a}</p></details>`).join('')}</div></div></section>`
    case 'cards':
      return `<section id="faq" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-10">${title}</h2><div class="grid md:grid-cols-2 gap-6">${items.map((f) => `<div class="rounded-2xl border bg-white p-6"><h3 class="font-semibold text-lg mb-3">${f.q}</h3><p class="text-slate-600">${f.a}</p></div>`).join('')}</div></div></section>`
    case 'two-column':
      return `<section id="faq" class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-10">${title}</h2><div class="columns-1 md:columns-2 gap-10">${items.map((f) => `<div class="mb-8 break-inside-avoid border-b pb-6"><h3 class="font-semibold mb-2">${f.q}</h3><p class="text-slate-600">${f.a}</p></div>`).join('')}</div></div></section>`
    case 'numbered':
      return `<section id="faq" class="py-20"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-10">${title}</h2><div class="space-y-8">${items.map((f, i) => `<div class="flex gap-6"><span class="text-3xl font-black opacity-20">${String(i + 1).padStart(2, '0')}</span><div><h3 class="font-bold uppercase tracking-wide mb-2">${f.q}</h3><p class="text-slate-600">${f.a}</p></div></div>`).join('')}</div></div></section>`
    case 'sidebar':
      return `<section id="faq" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_2fr] gap-12"><div><h2 class="text-3xl font-bold">${title}</h2><p class="mt-4 text-slate-600">Common questions from clients</p></div><div class="space-y-6">${items.map((f) => `<div class="grid md:grid-cols-[35%_1fr] gap-4 border-b pb-6"><h3 class="font-semibold">${f.q}</h3><p class="text-slate-600">${f.a}</p></div>`).join('')}</div></div></section>`
    case 'minimal':
      return `<section id="faq" class="py-20"><div class="max-w-2xl mx-auto px-6"><h2 class="font-serif text-3xl font-light text-center mb-12">${title}</h2><div class="space-y-10 text-center">${items.map((f) => `<div><h3 class="font-serif text-lg mb-3">${f.q}</h3><p class="text-sm text-slate-600 max-w-lg mx-auto">${f.a}</p></div>`).join('')}</div></div></section>`
    case 'boxed':
      return `<section id="faq" class="py-20"><div class="max-w-4xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-10">${title}</h2><div class="rounded-2xl border-2 p-8 md:p-10">${items.map((f) => `<div class="border-b py-5"><h3 class="font-semibold mb-2">${f.q}</h3><p class="text-slate-600">${f.a}</p></div>`).join('')}</div></div></section>`
    default:
      return `<section id="faq" class="py-20"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${title}</h2>${items.map((f) => `<div class="border-b border-slate-200 py-6"><h3 class="font-semibold text-lg mb-3">${f.q}</h3><p class="text-slate-600">${f.a}</p></div>`).join('')}</div></section>`
  }
}

function navHref(item: { page: string }, fromNested?: boolean): string {
  return item.page === 'home' ? staticSitePath('home', fromNested) : staticSitePath(item.page as 'about', fromNested)
}

export function buildExploreSectionHtml(
  templateId: TemplateId,
  content: SiteContent,
  accent: string,
  fromNested?: boolean,
): string {
  const items = getSiteNavItems(templateId, content).filter((i) => i.page !== 'home')
  if (!items.length) return ''
  const cfg = getSectionVariants(templateId)
  const header = `<div class="mb-10"><h2 class="text-3xl font-bold">${escapeHtml(cfg.exploreTitle)}</h2><p class="mt-2 text-slate-600 max-w-2xl">${escapeHtml(cfg.exploreSubtitle)}</p></div>`

  switch (cfg.explore) {
    case 'bento':
      return `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6">${header}<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">${items.map((item, i) => `<a href="${navHref(item, fromNested)}" class="rounded-2xl border bg-white p-6 hover:shadow-lg block ${i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}"><h3 class="text-xl font-bold mb-1">${escapeHtml(item.label)}</h3><p class="text-sm" style="color:${accent}">${escapeHtml(cfg.exploreLinkLabel)} →</p></a>`).join('')}</div></div></section>`
    case 'pills':
      return `<section class="py-20"><div class="max-w-6xl mx-auto px-6">${header}<div class="flex flex-wrap gap-3">${items.map((item) => `<a href="${navHref(item, fromNested)}" class="rounded-full border px-6 py-3 text-sm font-semibold hover:opacity-90" style="border-color:${accent};color:${accent}">${escapeHtml(item.label)}</a>`).join('')}</div></div></section>`
    case 'list-arrows':
      return `<section class="bg-slate-50 py-20"><div class="max-w-3xl mx-auto px-6">${header}<div class="divide-y">${items.map((item) => `<a href="${navHref(item, fromNested)}" class="flex justify-between items-center py-5 group"><span class="text-lg font-semibold group-hover:underline">${escapeHtml(item.label)}</span><span class="text-2xl" style="color:${accent}">→</span></a>`).join('')}</div></div></section>`
    case 'strips':
      return `<section class="py-20"><div class="max-w-6xl mx-auto px-6">${header}<div class="space-y-3">${items.map((item) => `<a href="${navHref(item, fromNested)}" class="flex justify-between items-center rounded-lg px-6 py-5 text-white uppercase tracking-wider font-bold" style="background-color:${accent}"><span>${escapeHtml(item.label)}</span><span class="text-sm">${escapeHtml(cfg.exploreLinkLabel)} →</span></a>`).join('')}</div></div></section>`
    case 'tiles':
      return `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6">${header}<div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200">${items.map((item) => `<a href="${navHref(item, fromNested)}" class="flex aspect-square flex-col items-center justify-center bg-white p-4 text-center hover:bg-slate-50"><span class="text-xs font-medium uppercase tracking-widest mt-3">${escapeHtml(item.label)}</span></a>`).join('')}</div></div></section>`
    case 'magazine':
      return `<section class="py-20"><div class="max-w-6xl mx-auto px-6">${header}<div class="border-t">${items.map((item, i) => `<a href="${navHref(item, fromNested)}" class="grid md:grid-cols-[120px_1fr_auto] gap-8 items-center border-b py-8 group"><span class="font-serif text-4xl opacity-20">${String(i + 1).padStart(2, '0')}</span><h3 class="font-serif text-2xl group-hover:underline">${escapeHtml(item.label)}</h3><span class="text-sm font-semibold" style="color:${accent}">${escapeHtml(cfg.exploreLinkLabel)}</span></a>`).join('')}</div></div></section>`
    case 'compass':
      return `<section class="bg-slate-50 py-20"><div class="max-w-4xl mx-auto px-6 text-center">${header}<div class="flex flex-wrap justify-center gap-4">${items.map((item) => `<a href="${navHref(item, fromNested)}" class="rounded-full border bg-white px-5 py-3 text-sm font-semibold hover:shadow-md">${escapeHtml(item.label)}</a>`).join('')}</div></div></section>`
    default:
      return `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><div class="text-center mb-10"><h2 class="text-3xl font-bold">${escapeHtml(cfg.exploreTitle)}</h2><p class="text-slate-600 mt-2">${escapeHtml(cfg.exploreSubtitle)}</p></div><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${items.map((item) => `<a href="${navHref(item, fromNested)}" class="rounded-xl border bg-white p-6 hover:shadow-md block"><h3 class="font-semibold text-lg mb-2">${escapeHtml(item.label)}</h3><p class="text-sm" style="color:${accent}">${escapeHtml(cfg.exploreLinkLabel)} ${escapeHtml(item.label.toLowerCase())}</p></a>`).join('')}</div></div></section>`
  }
}

export function buildContactSectionHtml(
  templateId: TemplateId,
  content: SiteContent,
  contactFormHtml: string,
): string {
  const shell = getSectionVariants(templateId).contactShell
  const title = escapeHtml(content.contactSectionTitle || 'Get in Touch')
  const info = contactFieldsHtml(content, templateId)
  const formTitle = escapeHtml(content.contactFormTitle)

  const shells: Record<string, string> = {
    'full-bleed': `<section id="contact" class="bg-zinc-950 text-white py-24"><div class="max-w-4xl mx-auto px-6 text-center"><h2 class="text-4xl font-black uppercase mb-4">${title}</h2><p class="mb-10 opacity-70">${formTitle}</p><div class="text-left">${contactFormHtml}</div><div class="mt-10 grid sm:grid-cols-2 gap-6 text-sm text-left">${info}</div></section>`,
    'centered-elegant': `<section id="contact" class="py-24 text-center"><div class="max-w-2xl mx-auto px-6"><h2 class="font-serif text-4xl font-light mb-8">${title}</h2><div class="mb-10 text-left grid sm:grid-cols-2 gap-6">${info}</div><div class="text-left">${contactFormHtml}</div></section>`,
    'sidebar-panel': `<section id="contact" class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold mb-10">${title}</h2><div class="grid lg:grid-cols-[280px_1fr] gap-10"><aside class="space-y-6">${info}</aside><div>${contactFormHtml}</div></div></div></section>`,
    'split-dark': `<section id="contact" class="bg-black text-white py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12"><div><h2 class="text-4xl font-black uppercase mb-6">${title}</h2><div class="grid sm:grid-cols-2 gap-6">${info}</div></div><div>${contactFormHtml}</div></div></section>`,
    'boutique-luxe': `<section id="contact" class="py-24 text-center"><div class="max-w-xl mx-auto px-6"><p class="text-xs uppercase tracking-widest opacity-60 mb-2">Concierge</p><h2 class="font-serif text-4xl mb-10">${title}</h2><div class="mb-10 text-left">${info}</div><div class="text-left">${contactFormHtml}</div></section>`,
    'card-float': `<section id="contact" class="py-20"><div class="max-w-6xl mx-auto px-6"><div class="rounded-2xl border p-8 md:p-12"><div class="grid lg:grid-cols-2 gap-12"><div><h2 class="text-3xl font-bold mb-6">${title}</h2>${info}</div><div class="lg:-mt-8 shadow-2xl rounded-xl">${contactFormHtml}</div></div></div></div></section>`,
    'minimal-split': `<section id="contact" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_1.2fr] gap-16"><div><h2 class="text-sm uppercase tracking-[0.4em] mb-8">${title}</h2>${info}</div><div>${contactFormHtml}</div></div></section>`,
    intake: `<section id="contact" class="py-20"><div class="max-w-3xl mx-auto px-6"><div class="mb-6 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-center text-sm text-teal-800">Secure inquiry — we respond within one business day</div><h2 class="text-3xl font-bold mb-2">${title}</h2><p class="mb-8 text-slate-600">${formTitle}</p>${contactFormHtml}<div class="mt-10 border-t pt-8 grid sm:grid-cols-2 gap-6">${info}</div></div></section>`,
    'formal-columns': `<section id="contact" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="font-serif text-3xl mb-2">${title}</h2><p class="border-b pb-6 mb-10 text-sm text-slate-600">Schedule a confidential consultation</p><div class="grid sm:grid-cols-3 gap-8 mb-12">${info}</div><div class="max-w-2xl">${contactFormHtml}</div></div></section>`,
    'salon-mirror': `<section id="contact" class="bg-pink-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="font-serif text-3xl text-center mb-10">${title}</h2><div class="grid lg:grid-cols-2 gap-10"><div class="order-2 lg:order-1">${contactFormHtml}</div><div class="order-1 lg:order-2 space-y-6">${info}</div></div></div></section>`,
    'noir-gold': `<section id="contact" class="bg-neutral-950 text-amber-100 py-20"><div class="max-w-5xl mx-auto border border-amber-500/30 px-6 py-12 md:px-12"><h2 class="text-center font-serif text-2xl uppercase tracking-widest mb-8">${title}</h2><div class="grid lg:grid-cols-2 gap-12"><div class="grid sm:grid-cols-2 gap-6">${info}</div><div>${contactFormHtml}</div></div></div></section>`,
    'terra-pill': `<section id="contact" class="py-20"><div class="max-w-5xl mx-auto px-6"><div class="rounded-3xl border border-orange-200 bg-orange-50 p-8 md:p-12"><h2 class="text-2xl font-bold text-orange-950 mb-8">${title}</h2><div class="grid lg:grid-cols-2 gap-10"><div class="grid sm:grid-cols-2 gap-6">${info}</div><div>${contactFormHtml}</div></div></div></div></section>`,
    'coastal-wave': `<section id="contact" class="border-b-4 border-sky-400 bg-gradient-to-b from-sky-50 to-white py-16"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-sky-950 mb-10">${title}</h2><div class="grid lg:grid-cols-2 gap-12"><div class="grid sm:grid-cols-2 gap-6">${info}</div><div>${contactFormHtml}</div></div></div></section>`,
    'vineyard-reserve': `<section id="contact" class="bg-stone-900 text-amber-50 py-24 text-center"><div class="max-w-4xl mx-auto px-6"><p class="font-serif text-sm uppercase tracking-widest opacity-70 mb-2">Reservations</p><h2 class="font-serif text-4xl mb-10">${title}</h2><div class="mb-10 text-left grid sm:grid-cols-2 gap-6">${info}</div><div class="text-left">${contactFormHtml}</div></section>`,
    'arcade-neon': `<section id="contact" class="bg-black text-lime-300 py-20"><div class="max-w-4xl mx-auto px-6"><h2 class="text-center text-2xl font-black uppercase tracking-wider mb-8">${title}</h2><div class="rounded-xl border-2 border-lime-400/50 p-6 md:p-10">${contactFormHtml}</div><div class="mt-8 grid sm:grid-cols-2 gap-4">${info}</div></div></section>`,
    'coffee-warm': `<section id="contact" class="bg-[#faf6f0] py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_1.1fr] gap-12"><div><h2 class="font-serif text-3xl text-[#2d1810] mb-4">${title}</h2><p class="text-[#5c3d2e] mb-8">Questions about beans, events, or catering?</p><div class="grid sm:grid-cols-2 gap-6">${info}</div></div><div>${contactFormHtml}</div></div></section>`,
    'split-classic': `<section id="contact" class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold mb-10">${title}</h2><div class="grid lg:grid-cols-2 gap-12"><div><h3 class="text-xl font-semibold mb-6">${formTitle}</h3><div class="grid sm:grid-cols-2 gap-6">${info}</div></div><div>${contactFormHtml}</div></div></div></section>`,
  }

  return shells[shell] ?? shells['split-classic']
}