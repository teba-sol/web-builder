import { canLinkToPage, resolveStaticHref } from '../data/siteNav'
import type { SiteContent } from '../types'
import { brandCss, logoImageStyleAttr, showBrandName } from '../data/brand'
import { footerBlurb, footerNote } from '../data/footer'
import { escapeHtml } from './imageUtils'
import { mapEmbedHtml } from '../utils/mapEmbed'
import { LAYOUT_SHELL_CSS, rewriteContainerVariantsForExport } from './htmlShared'
import {
  clonePaletteCss,
  cloneWrapperClass,
  isCloneTemplate,
  resolveClonePalette,
  type CloneTemplateId,
} from '../templates/cloneTheme'

export { isCloneTemplate }
export type { CloneTemplateId }

export type CloneMode = 'html' | 'blade'

export interface CloneExportCtx {
  mode: CloneMode
  templateId: CloneTemplateId
  content: SiteContent
  fromNested?: boolean
  resolveImage?: (url: string, name: string) => string
  colorSchemeId?: string
  layoutVariantId?: string
}

interface CloneTheme {
  page: string
  topbar: string
  topbarText: string
  header: string
  accent: string
  accentFg: string
  muted: string
  card: string
  input: string
  hover: string
}

const THEMES: Record<CloneTemplateId, CloneTheme> = {
  taxfighters: {
    page: 'min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans relative',
    topbar: 'border-b border-rose-200 text-xs py-2 px-4',
    topbarText: 'text-rose-700',
    header: 'sticky top-0 z-50 overflow-visible bg-slate-50/95 border-b border-slate-300 shadow-xl',
    accent: 'var(--clone-accent)',
    accentFg: '#ffffff',
    muted: 'text-slate-600',
    card: 'bg-slate-50 border border-slate-300',
    input: 'w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-rose-500',
    hover: 'hover:text-rose-600 hover:bg-slate-100',
  },
  aureum: {
    page: 'min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans relative',
    topbar: 'border-b border-purple-200 text-xs py-2 px-4',
    topbarText: 'text-purple-700',
    header: 'sticky top-0 z-50 overflow-visible bg-slate-50/95 border-b border-slate-300 shadow-xl',
    accent: 'var(--clone-accent)',
    accentFg: '#ffffff',
    muted: 'text-slate-600',
    card: 'bg-slate-50 border border-slate-300',
    input: 'w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-purple-500',
    hover: 'hover:text-purple-600 hover:bg-slate-100',
  },
  flux: {
    page: 'min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans relative',
    topbar: 'border-b border-[#241C15]/10 text-xs py-2 px-4 text-[#FFF3E7]',
    topbarText: 'text-[#FFDCC4]',
    header: 'sticky top-0 z-50 overflow-visible bg-[var(--clone-surface)]/95 border-b border-[#EEDFCF] shadow-sm',
    accent: 'var(--clone-accent)',
    accentFg: '#ffffff',
    muted: 'text-[#4A3B2C]',
    card: 'bg-white border border-[#EEDFCF]',
    input: 'w-full bg-[var(--clone-surface)] border border-[#EEDFCF] rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-[var(--clone-accent)]',
    hover: 'hover:text-[#FA6B34] hover:bg-[#FFEDE1]',
  },
  cpa: {
    page: 'min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans relative',
    topbar: 'text-xs py-2.5 px-4 text-[#DDEBD0]',
    topbarText: 'text-[#DDEBD0]',
    header: 'sticky top-0 z-50 overflow-visible border-b border-white/10 shadow-lg',
    accent: 'var(--clone-accent)',
    accentFg: 'var(--clone-accent-fg)',
    muted: 'text-[#6B7A70]',
    card: 'bg-white border border-[#E4E0D4]',
    input: 'w-full bg-[var(--clone-surface)] border border-[#E4E0D4] rounded-xl py-2.5 px-3.5 text-sm focus:outline-none',
    hover: 'hover:text-[var(--clone-ink)] hover:bg-[var(--clone-accent)]',
  },
  axiom: {
    page: 'min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans relative',
    topbar: 'hidden',
    topbarText: '',
    header: 'sticky top-0 z-50 overflow-visible bg-white border-b shadow-sm',
    accent: 'var(--clone-accent)',
    accentFg: '#ffffff',
    muted: 'text-[#546E8A]',
    card: 'bg-white border border-[#D6E4F0]',
    input: 'w-full rounded-lg border border-[#D6E4F0] px-4 py-3 text-sm focus:outline-none',
    hover: 'hover:text-blue-600',
  },
  helix: {
    page: 'bg-[var(--clone-surface)] font-sans text-[var(--clone-ink)]',
    topbar: 'bg-black text-white py-3 px-4',
    topbarText: 'text-white',
    header: 'sticky top-0 z-50 overflow-visible rounded-b-3xl bg-[var(--clone-accent)] text-white shadow-lg',
    accent: 'var(--clone-accent)',
    accentFg: '#ffffff',
    muted: 'text-gray-600',
    card: 'bg-white border border-gray-200',
    input: 'w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--clone-highlight)]',
    hover: 'hover:bg-white/10',
  },
}

function txt(ctx: CloneExportCtx, value: string, bladeExpr: string): string {
  return ctx.mode === 'blade' ? bladeExpr : escapeHtml(value)
}

function formAction(ctx: CloneExportCtx): string {
  if (ctx.mode === 'blade') return `{{ route('contact.store') }}`
  const mail = ctx.content.email || ctx.content.supportEmail || ctx.content.reservationEmail
  return mail ? `mailto:${escapeHtml(mail)}` : '#'
}

function formAttrs(ctx: CloneExportCtx): string {
  const action = formAction(ctx)
  if (ctx.mode === 'blade') {
    return `class="js-clone-form space-y-4" action="${action}" method="POST" data-mode="blade"`
  }
  return `class="js-clone-form space-y-4" action="${action}" method="post" data-mode="html"`
}

function csrf(ctx: CloneExportCtx): string {
  return ctx.mode === 'blade' ? '@csrf' : ''
}

function successBanner(ctx: CloneExportCtx): string {
  if (ctx.mode === 'blade') {
    return `@if(session('contact_success'))<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800 mb-3">{{ session('contact_success') }}</div>@endif`
  }
  return `<div class="js-form-success hidden rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800">Request received. We will contact you shortly.</div>`
}

function img(ctx: CloneExportCtx, url: string, name: string, className: string): string {
  if (ctx.mode === 'blade') {
    const field = name.startsWith('about') ? 'about_image' : name.startsWith('hero') ? 'hero_image' : ''
    if (field) {
      return `@if($settings->${field})<img src="{{ \\App\\Support\\PublicAsset::url($settings->${field}) }}" class="${className}" alt="" />@endif`
    }
  }
  if (!url) return ''
  const src = ctx.resolveImage ? ctx.resolveImage(url, name) : url
  return src ? `<img src="${escapeHtml(src)}" class="${className}" alt="" />` : ''
}

function footerPageLinks(ctx: CloneExportCtx): string {
  const pages: Array<{ key: keyof SiteContent['pageVisibility']; label: string; route: string; staticPage: string }> = [
    { key: 'about', label: 'About', route: 'about', staticPage: 'about' },
    { key: 'services', label: 'Services', route: 'services', staticPage: 'services' },
    { key: 'portfolio', label: 'Portfolio', route: 'portfolio', staticPage: 'portfolio' },
    { key: 'rooms', label: 'Rooms', route: 'rooms.index', staticPage: 'rooms' },
    { key: 'blog', label: 'Blog', route: 'blog.index', staticPage: 'blog' },
    { key: 'news', label: 'News', route: 'news.index', staticPage: 'news' },
    { key: 'gallery', label: 'Gallery', route: 'gallery', staticPage: 'gallery' },
    { key: 'contact', label: 'Contact', route: 'contact', staticPage: 'contact' },
  ]
  if (ctx.mode === 'blade') {
    return pages
      .map((page) => `@if($settings->page_visibility['${page.key}'] ?? false)<li><a href="{{ route('${page.route}') }}">${page.label}</a></li>@endif`)
      .join('\n')
  }
  return pages
    .filter((page) => ctx.content.pageVisibility[page.key])
    .map((page) => `<li><a href="${resolveStaticHref(page.staticPage, ctx.content, ctx.fromNested)}">${escapeHtml(page.label)}</a></li>`)
    .join('')
}

function href(ctx: CloneExportCtx, page: string): string {
  if (ctx.mode === 'blade') {
    const map: Record<string, string> = {
      home: "{{ route('home') }}",
      about: "{{ route('about') }}",
      services: "{{ route('services') }}",
      contact: "{{ route('contact') }}",
      blog: "{{ route('blog.index') }}",
      portfolio: "{{ route('portfolio') }}",
    }
    return map[page] || "{{ route('home') }}"
  }
  if (page === 'home') return '#hero'
  return resolveStaticHref(page, ctx.content, ctx.fromNested)
}

export function cloneInteractiveScript(): string {
  return `<script>
(function () {
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  qa('[data-open-booking]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var m = q('#booking-modal');
      if (!m) return;
      m.classList.remove('hidden');
      m.classList.add('flex');
    });
  });
  qa('[data-close-booking]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var m = q('#booking-modal');
      if (!m) return;
      m.classList.add('hidden');
      m.classList.remove('flex');
    });
  });
  qa('[data-toggle-menu]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var m = q('#mobile-menu');
      if (m) m.classList.toggle('hidden');
    });
  });
  qa('.js-clone-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (form.getAttribute('data-mode') === 'blade') return;
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var box = form.querySelector('.js-form-success');
      if (box) box.classList.remove('hidden');
      form.reset();
      var modal = q('#booking-modal');
      if (modal && modal.contains(form)) {
        setTimeout(function () { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 1800);
      }
    });
  });
})();
</script>`
}

function serviceOptions(ctx: CloneExportCtx): string {
  const services = ctx.content.services.filter((s) => s.title)
  if (ctx.mode === 'blade') {
    return `@foreach($services as $service)<option value="{{ $service->title }}">{{ $service->title }}</option>@endforeach`
  }
  if (!services.length) return `<option value="Consultation">Consultation</option>`
  return services.map((s) => `<option value="${escapeHtml(s.title)}">${escapeHtml(s.title)}</option>`).join('')
}

function bookingForm(ctx: CloneExportCtx, theme: CloneTheme, compact = false): string {
  return `<form ${formAttrs(ctx)}>
    ${csrf(ctx)}
    ${successBanner(ctx)}
    <div class="grid ${compact ? 'sm:grid-cols-2' : 'grid-cols-2'} gap-3">
      <label class="block text-xs font-semibold">First name *<input required name="first_name" class="${theme.input} mt-1" /></label>
      <label class="block text-xs font-semibold">Last name *<input required name="last_name" class="${theme.input} mt-1" /></label>
    </div>
    <label class="block text-xs font-semibold">Phone *<input required type="tel" name="phone" class="${theme.input} mt-1" /></label>
    <label class="block text-xs font-semibold">Email<input type="email" name="email" class="${theme.input} mt-1" /></label>
    <label class="block text-xs font-semibold">Service<select name="service_type" class="${theme.input} mt-1">${serviceOptions(ctx)}</select></label>
    <input type="hidden" name="message" value="Booking request" />
    <button type="submit" class="w-full rounded-xl py-3.5 text-sm font-extrabold shadow-xl" style="background-color:${theme.accent};color:${theme.accentFg}">Confirm booking</button>
  </form>`
}

function contactForm(ctx: CloneExportCtx, theme: CloneTheme): string {
  const c = ctx.content
  return `<form ${formAttrs(ctx)}>
    ${csrf(ctx)}
    ${successBanner(ctx)}
    <div class="grid sm:grid-cols-2 gap-4">
      <label class="block text-xs font-semibold">Your name *<input required name="name" class="${theme.input} mt-1" /></label>
      <label class="block text-xs font-semibold">Phone *<input required type="tel" name="phone" class="${theme.input} mt-1" /></label>
    </div>
    <label class="block text-xs font-semibold">Email<input type="email" name="email" class="${theme.input} mt-1" /></label>
    <label class="block text-xs font-semibold">Service<select name="service_type" class="${theme.input} mt-1">${serviceOptions(ctx)}</select></label>
    <label class="block text-xs font-semibold">Message<textarea name="message" rows="4" class="${theme.input} mt-1"></textarea></label>
    <button type="submit" class="rounded-xl px-8 py-3.5 text-sm font-bold shadow-xl" style="background-color:${theme.accent};color:${theme.accentFg}">${txt(ctx, c.contactFormButtonText || 'Send message', "{{ $settings->contact_form_button_text ?: 'Send message' }}")}</button>
  </form>`
}

function bookingModal(ctx: CloneExportCtx, theme: CloneTheme): string {
  return `<div id="booking-modal" class="hidden fixed inset-0 z-[80] items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
    <div class="relative w-full max-w-md space-y-4 rounded-3xl border bg-white p-6 shadow-2xl sm:p-8">
      <button type="button" data-close-booking class="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-600">✕</button>
      <h3 class="text-xl font-bold text-slate-900">Book appointment</h3>
      <p class="text-xs text-slate-600">Leave your details and we will confirm shortly.</p>
      ${bookingForm(ctx, theme)}
    </div>
  </div>`
}

export function buildCloneChromeNav(ctx: CloneExportCtx): string {
  return chromeNav(ctx, THEMES[ctx.templateId])
}

function chromeNav(ctx: CloneExportCtx, theme: CloneTheme): string {
  const c = ctx.content
  const name = txt(ctx, c.businessName, '{{ $settings->business_name }}')
  const phone = txt(ctx, c.phone, '{{ $settings->phone }}')
  const email = txt(ctx, c.email, '{{ $settings->email }}')
  const hours = txt(ctx, c.hours, '{{ $settings->hours }}')
  const cta = txt(ctx, c.ctaText || 'Book now', '{{ $settings->cta_text }}')
  const headerStyle = ctx.templateId === 'cpa' ? ' style="background-color:#16302A"' : ctx.templateId === 'helix' ? '' : ''
  const logoColor = ctx.templateId === 'cpa' || ctx.templateId === 'helix' ? 'text-white' : ''
  const topbarStyle = ctx.templateId === 'cpa' ? ' style="background-color:#0F211C"' : ctx.templateId === 'taxfighters' || ctx.templateId === 'aureum' ? ' style="background-color:#eee4e6"' : ctx.templateId === 'flux' ? ' style="background-color:#241C15"' : ''

  const links = (
    [
      ['Home', href(ctx, 'home'), true],
      ['About', href(ctx, 'about'), c.pageVisibility.about],
      ['Services', href(ctx, 'services'), c.pageVisibility.services],
      ['Blog', href(ctx, 'blog'), c.pageVisibility.blog && canLinkToPage('blog', c)],
      ['Contact', href(ctx, 'contact'), c.pageVisibility.contact],
    ] as Array<[string, string, boolean]>
  ).filter(([, , show]) => show)

  const desktopLinks = links
    .map(([label, url]) => `<a href="${url}" class="px-3.5 py-2 rounded-lg text-sm font-semibold ${logoColor} ${theme.hover}">${label}</a>`)
    .join('')
  const mobileLinks = links
    .map(([label, url]) => `<a href="${url}" class="block py-2 text-base font-bold">${label}</a>`)
    .join('')

  const topbar =
    theme.topbar === 'hidden'
      ? ''
      : `<div class="${theme.topbar}"${topbarStyle}><div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2"><div class="flex items-center gap-6 font-semibold ${theme.topbarText}">${c.phone || ctx.mode === 'blade' ? `<a href="tel:${ctx.mode === 'blade' ? '{{ $settings->phone }}' : escapeHtml(c.phone)}">${phone}</a>` : ''}${c.email || ctx.mode === 'blade' ? `<span class="hidden md:inline">${email}</span>` : ''}${c.hours || ctx.mode === 'blade' ? `<span class="hidden lg:inline">${hours}</span>` : ''}</div></div></div>`

  const logoImgStyle = logoImageStyleAttr(c)
  const logoSrc = c.logo
    ? (/^(https?:|data:|\/)/i.test(c.logo) ? c.logo : `${ctx.fromNested ? '../' : ''}${c.logo}`)
    : ''
  const navBrandMark = ctx.mode === 'blade'
    ? `@if($settings->logo)<img src="{{ \\App\\Support\\PublicAsset::url($settings->logo) }}" alt="" data-brand-logo class="shrink-0 object-contain" style="height:{{ max(20, min(56, (int) ($settings->logo_size ?? 32))) }}px;width:auto;max-height:56px;max-width:min(100%,14rem);object-fit:contain;" />@else<div class="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shrink-0" style="background-color:${theme.accent}"></div>@endif`
    : logoSrc
      ? `<img src="${escapeHtml(logoSrc)}" alt="" data-brand-logo class="shrink-0 object-contain" style="${logoImgStyle}" />`
      : `<div class="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shrink-0" style="background-color:${theme.accent}"></div>`
  const navNameCls = ctx.mode === 'blade'
    ? `@if($settings->logo && !($settings->logo_show_name ?? true)) sr-only @endif`
    : showBrandName(c) ? '' : 'sr-only'

  return `<div class="relative z-50">${topbar}
  <header class="${theme.header}"${headerStyle}>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <a href="${href(ctx, 'home')}" class="flex min-w-0 items-center gap-3">
        ${navBrandMark}
        <div class="min-w-0 ${navNameCls}">
          <div class="truncate text-xl font-black tracking-tight ${logoColor}">${name}</div>
          <div class="truncate text-[10px] ${theme.muted} font-semibold uppercase tracking-widest">${txt(ctx, c.tagline, '{{ $settings->tagline }}')}</div>
        </div>
      </a>
      <nav class="hidden lg:flex items-center gap-1">${desktopLinks}</nav>
      <button type="button" data-open-booking class="hidden sm:inline-flex px-6 py-3 rounded-xl text-sm font-bold shadow-lg" style="background-color:${theme.accent};color:${theme.accentFg}">${cta}</button>
      <button type="button" data-toggle-menu class="lg:hidden p-2 rounded-xl border">☰</button>
    </div>
    <div id="mobile-menu" class="hidden lg:hidden border-t px-6 py-6 space-y-4 bg-white">
      ${mobileLinks}
      <button type="button" data-open-booking class="w-full py-3.5 rounded-xl font-bold" style="background-color:${theme.accent};color:${theme.accentFg}">${cta}</button>
    </div>
  </header></div>`
}

function footerContactLines(ctx: CloneExportCtx): string {
  if (ctx.mode === 'blade') {
    return `@if($settings->phone){{ $settings->phone }}<br/>@endif
@if($settings->email){{ $settings->email }}<br/>@endif
@if($settings->reservation_email){{ $settings->reservation_email }}<br/>@endif
@if($settings->support_email){{ $settings->support_email }}<br/>@endif
@if($settings->whatsapp){{ $settings->whatsapp }}<br/>@endif
@if($settings->address){{ $settings->address }}@endif`
  }
  const c = ctx.content
  return [c.phone, c.email, c.reservationEmail, c.supportEmail, c.whatsapp, c.address]
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => escapeHtml(value))
    .join('<br/>')
}

function gateSection(ctx: CloneExportCtx, show: boolean, bladeCondition: string, html: string): string {
  if (ctx.mode === 'blade') return `@if(${bladeCondition})\n${html}\n@endif\n`
  return show ? html : ''
}

function mapBlock(ctx: CloneExportCtx): string {
  if (ctx.mode === 'blade') return `@include('partials.map')`
  return mapEmbedHtml(ctx.content.mapUrl, ctx.content.address)
}

function standardSections(ctx: CloneExportCtx, theme: CloneTheme): string {
  const c = ctx.content
  const pv = c.pageVisibility
  const sv = c.sectionVisibility
  const stats = sv.stats ? c.stats.filter((s) => s.value) : []
  const services = pv.services ? c.services.filter((s) => s.title) : []
  const steps = sv.steps ? c.steps.filter((s) => s.title) : []
  const reviews = sv.testimonials ? c.testimonials.filter((t) => t.quote) : []
  const faqs = sv.faq ? c.faqs.filter((f) => f.question) : []
  const locations = pv.portfolio ? c.showcaseItems.filter((i) => i.title) : []
  const plans = sv.pricing ? c.pricing.filter((p) => p.title) : []

  const statsHtml = gateSection(
    ctx,
    stats.length > 0,
    "($settings->section_visibility['stats'] ?? false) && $stats->isNotEmpty()",
    `<section class="py-12 border-y"><div class="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6 text-center">${
      ctx.mode === 'blade'
        ? `@foreach($stats->take(4) as $stat)<div class="${theme.card} p-6 rounded-2xl"><div class="text-4xl font-extrabold">{{ $stat->value }}</div><div class="mt-1 text-sm font-semibold" style="color:${theme.accent}">{{ $stat->label }}</div></div>@endforeach`
        : stats
            .slice(0, 4)
            .map((s) => `<div class="${theme.card} p-6 rounded-2xl"><div class="text-4xl font-extrabold">${escapeHtml(s.value)}</div><div class="mt-1 text-sm font-semibold" style="color:${theme.accent}">${escapeHtml(s.label)}</div></div>`)
            .join('')
    }</div></section>`,
  )

  const aboutHtml = gateSection(
    ctx,
    pv.about,
    "$settings->page_visibility['about'] ?? false",
    `<section id="about" class="py-24 px-4 sm:px-6 lg:px-8"><div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center"><div class="lg:col-span-6">${img(ctx, c.aboutImage, 'about', 'w-full h-[640px] object-cover rounded-3xl shadow-2xl')}</div><div class="lg:col-span-6 space-y-6"><div class="text-xs font-bold uppercase tracking-widest" style="color:${theme.accent}">Who we are</div><h2 class="text-3xl sm:text-4xl font-extrabold">${txt(ctx, c.aboutTitle, '{{ $settings->about_title }}')}</h2><p class="${theme.muted} leading-relaxed">${txt(ctx, c.about, '{{ $settings->about }}')}</p><button type="button" data-open-booking class="px-7 py-3.5 rounded-xl font-bold text-sm shadow-xl" style="background-color:${theme.accent};color:${theme.accentFg}">Schedule appointment</button></div></div></section>`,
  )

  const servicesHtml = gateSection(
    ctx,
    pv.services && services.length > 0,
    "($settings->page_visibility['services'] ?? false) && $services->isNotEmpty()",
    `<section id="services" class="py-24 px-4 sm:px-6 lg:px-8"><div class="max-w-7xl mx-auto space-y-12"><div class="text-center max-w-3xl mx-auto space-y-3"><div class="text-xs font-bold uppercase tracking-widest" style="color:${theme.accent}">Our expertise</div><h2 class="text-3xl sm:text-4xl font-extrabold">${txt(ctx, c.servicesSectionTitle, '{{ $settings->services_section_title }}')}</h2><p class="${theme.muted} text-sm">${txt(ctx, c.servicesSectionSubtitle, '{{ $settings->services_section_subtitle }}')}</p></div><div class="grid md:grid-cols-3 gap-8">${
      ctx.mode === 'blade'
        ? `@foreach($services->take(3) as $service)<div class="${theme.card} p-8 rounded-3xl space-y-4"><div class="w-14 h-14 rounded-2xl" style="background-color:${theme.accent}"></div><h3 class="text-xl font-bold">{{ $service->title }}</h3><p class="text-sm ${theme.muted}">{{ $service->description }}</p><button type="button" data-open-booking class="text-xs font-bold" style="color:${theme.accent}">Apply now →</button></div>@endforeach`
        : services
            .slice(0, 3)
            .map((s) => `<div class="${theme.card} p-8 rounded-3xl space-y-4"><div class="w-14 h-14 rounded-2xl" style="background-color:${theme.accent}"></div><h3 class="text-xl font-bold">${escapeHtml(s.title)}</h3><p class="text-sm ${theme.muted}">${escapeHtml(s.description)}</p><button type="button" data-open-booking class="text-xs font-bold" style="color:${theme.accent}">Apply now →</button></div>`)
            .join('')
    }</div></div></section>`,
  )

  const stepsHtml = gateSection(
    ctx,
    steps.length > 0,
    "($settings->section_visibility['steps'] ?? false) && $steps->isNotEmpty()",
    `<section id="process" class="py-24 px-4"><div class="max-w-7xl mx-auto space-y-16"><div class="text-center"><div class="text-xs font-bold uppercase tracking-widest" style="color:${theme.accent}">Process</div><h2 class="text-3xl font-extrabold mt-2">${txt(ctx, c.stepsSectionTitle, '{{ $settings->steps_section_title }}')}</h2></div><div class="grid md:grid-cols-3 gap-8">${
      ctx.mode === 'blade'
        ? `@foreach($steps->take(4) as $step)<div class="${theme.card} p-8 rounded-3xl text-center space-y-4"><div class="w-12 h-12 rounded-full mx-auto flex items-center justify-center font-black" style="background-color:${theme.accent};color:${theme.accentFg}">{{ $loop->iteration }}</div><h3 class="text-xl font-bold">{{ $step->title }}</h3><p class="text-xs ${theme.muted}">{{ $step->description }}</p></div>@endforeach`
        : steps
            .slice(0, 4)
            .map((s, i) => `<div class="${theme.card} p-8 rounded-3xl text-center space-y-4"><div class="w-12 h-12 rounded-full mx-auto flex items-center justify-center font-black" style="background-color:${theme.accent};color:${theme.accentFg}">${i + 1}</div><h3 class="text-xl font-bold">${escapeHtml(s.title)}</h3><p class="text-xs ${theme.muted}">${escapeHtml(s.description)}</p></div>`)
            .join('')
    }</div></div></section>`,
  )

  const reviewsHtml = gateSection(
    ctx,
    reviews.length > 0,
    "($settings->section_visibility['testimonials'] ?? false) && $testimonials->isNotEmpty()",
    `<section id="reviews" class="py-24 px-4"><div class="max-w-7xl mx-auto space-y-12"><h2 class="text-3xl font-extrabold text-center">${txt(ctx, c.testimonialsSectionTitle, '{{ $settings->testimonials_section_title }}')}</h2><div class="grid md:grid-cols-3 gap-8">${
      ctx.mode === 'blade'
        ? `@foreach($testimonials->take(3) as $item)<div class="${theme.card} p-6 rounded-2xl space-y-4"><p class="text-xs ${theme.muted}">“{{ $item->quote }}”</p><div class="flex justify-between text-xs font-bold"><span>{{ $item->author }}</span><span class="font-normal ${theme.muted}">{{ $item->role }}</span></div></div>@endforeach`
        : reviews
            .slice(0, 3)
            .map((r) => `<div class="${theme.card} p-6 rounded-2xl space-y-4"><p class="text-xs ${theme.muted}">“${escapeHtml(r.quote)}”</p><div class="flex justify-between text-xs font-bold"><span>${escapeHtml(r.author)}</span><span class="font-normal ${theme.muted}">${escapeHtml(r.role)}</span></div></div>`)
            .join('')
    }</div></div></section>`,
  )

  const faqHtml = gateSection(
    ctx,
    faqs.length > 0,
    "($settings->section_visibility['faq'] ?? false) && $faqs->isNotEmpty()",
    `<section id="faq" class="py-24 px-4"><div class="max-w-4xl mx-auto space-y-8"><h2 class="text-3xl font-extrabold text-center">${txt(ctx, c.faqSectionTitle, '{{ $settings->faq_section_title }}')}</h2><div class="space-y-4">${
      ctx.mode === 'blade'
        ? `@foreach($faqs as $faq)<details class="${theme.card} rounded-2xl overflow-hidden"><summary class="cursor-pointer p-5 font-bold">{{ $faq->question }}</summary><p class="px-5 pb-5 text-xs ${theme.muted}">{{ $faq->answer }}</p></details>@endforeach`
        : faqs
            .map((f) => `<details class="${theme.card} rounded-2xl overflow-hidden"><summary class="cursor-pointer p-5 font-bold">${escapeHtml(f.question)}</summary><p class="px-5 pb-5 text-xs ${theme.muted}">${escapeHtml(f.answer)}</p></details>`)
            .join('')
    }</div></div></section>`,
  )

  const pricingPlans = plans.length
    ? plans
    : [{ title: 'Custom quote', description: 'Tell us what you need and we will price the work clearly before we start.', price: 'Contact us', tag: '', featured: true }]
  const pricingCards = ctx.mode === 'blade'
    ? `@forelse(($pricingPlans ?? collect()) as $plan)<div class="${theme.card} p-8 rounded-3xl" @if($plan->featured) style="border-color:${theme.accent};box-shadow:0 0 0 1px ${theme.accent}" @endif><p class="text-xs font-bold uppercase tracking-wider" style="color:${theme.accent}">{{ $plan->tag }}</p><h3 class="text-xl font-bold">{{ $plan->title }}</h3><p class="my-3 text-3xl font-black" style="color:${theme.accent}">{{ $plan->price }}</p><p class="text-sm ${theme.muted}">{{ $plan->description }}</p></div>@empty<div class="${theme.card} p-8 rounded-3xl" style="border-color:${theme.accent};box-shadow:0 0 0 1px ${theme.accent}"><h3 class="text-xl font-bold">Custom quote</h3><p class="my-3 text-3xl font-black" style="color:${theme.accent}">Contact us</p><p class="text-sm ${theme.muted}">Tell us what you need and we will price the work clearly before we start.</p></div>@endforelse`
    : pricingPlans
        .map((p) => `<div class="${theme.card} p-8 rounded-3xl"${p.featured ? ` style="border-color:${theme.accent};box-shadow:0 0 0 1px ${theme.accent}"` : ''}><p class="text-xs font-bold uppercase tracking-wider" style="color:${theme.accent}">${escapeHtml(p.tag)}</p><h3 class="text-xl font-bold">${escapeHtml(p.title)}</h3><p class="my-3 text-3xl font-black" style="color:${theme.accent}">${escapeHtml(p.price)}</p><p class="text-sm ${theme.muted}">${escapeHtml(p.description)}</p></div>`)
        .join('')
  const pricingHtml = gateSection(
    ctx,
    sv.pricing,
    "$settings->section_visibility['pricing'] ?? false",
    `<section id="pricing" class="py-24 px-4"><div class="max-w-7xl mx-auto space-y-12"><div class="text-center"><div class="text-xs font-bold uppercase tracking-widest" style="color:${theme.accent}">Pricing</div><h2 class="text-3xl font-extrabold mt-2">${txt(ctx, c.pricingSectionTitle, '{{ $settings->pricing_section_title }}')}</h2></div><div class="grid md:grid-cols-3 gap-6">${pricingCards}</div></div></section>`,
  )

  const team = sv.team ? c.team.filter((member) => member.name) : []
  const teamHtml = gateSection(
    ctx,
    team.length > 0,
    "($settings->section_visibility['team'] ?? false) && ($team ?? collect())->isNotEmpty()",
    `<section id="team" class="py-24 px-4"><div class="max-w-7xl mx-auto space-y-12"><h2 class="text-3xl font-extrabold text-center">${txt(ctx, c.teamSectionTitle, '{{ $settings->team_section_title }}')}</h2><div class="grid md:grid-cols-3 gap-8">${
      ctx.mode === 'blade'
        ? `@foreach($team as $member)<div class="${theme.card} p-6 rounded-3xl text-center">@if($member->image)<img src="{{ \\App\\Support\\PublicAsset::url($member->image) }}" class="w-28 h-28 rounded-full mx-auto mb-4 object-cover" alt="" />@endif<h3 class="text-xl font-bold">{{ $member->name }}</h3><p class="text-sm ${theme.muted}">{{ $member->role }}</p></div>@endforeach`
        : team
            .map((member, i) => {
              const src = member.image && ctx.resolveImage ? ctx.resolveImage(member.image, `team-${i}`) : member.image
              return `<div class="${theme.card} p-6 rounded-3xl text-center">${src ? `<img src="${escapeHtml(src)}" class="w-28 h-28 rounded-full mx-auto mb-4 object-cover" alt="" />` : ''}<h3 class="text-xl font-bold">${escapeHtml(member.name)}</h3><p class="text-sm ${theme.muted}">${escapeHtml(member.role)}</p></div>`
            })
            .join('')
    }</div></div></section>`,
  )

  const ctaHtml = gateSection(
    ctx,
    sv.cta,
    "$settings->section_visibility['cta'] ?? false",
    `<section id="cta" class="py-20 px-4" style="background-color:var(--clone-ink,#16302A)"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl sm:text-4xl font-black text-white">${txt(ctx, c.ctaBannerTitle, '{{ $settings->cta_banner_title }}')}</h2><p class="mt-4 text-lg text-white/75">${txt(ctx, c.ctaBannerText, '{{ $settings->cta_banner_text }}')}</p><button type="button" data-open-booking class="mt-8 inline-flex rounded-xl px-8 py-3.5 text-sm font-bold shadow-xl" style="background-color:${theme.accent};color:${theme.accentFg}">${txt(ctx, c.ctaText, '{{ $settings->cta_text }}')}</button></div></section>`,
  )

  const locHtml = gateSection(
    ctx,
    locations.length > 0,
    "($settings->page_visibility['portfolio'] ?? false) && $showcaseItems->isNotEmpty()",
    `<section class="py-20 px-4"><h2 class="text-3xl font-extrabold text-center mb-12">${txt(ctx, c.showcaseSectionTitle, '{{ $settings->showcase_section_title }}')}</h2><div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">${
      ctx.mode === 'blade'
        ? `@foreach($showcaseItems->take(4) as $item)<a href="${href(ctx, 'portfolio')}" class="block">@if($item->image)<img src="{{ \\App\\Support\\PublicAsset::url($item->image) }}" class="w-full h-40 object-cover rounded-xl mb-3" alt="" />@endif<p class="text-center text-sm font-semibold">{{ $item->title }}</p></a>@endforeach`
        : locations
            .slice(0, 4)
            .map((item, i) => {
              const src = item.image && ctx.resolveImage ? ctx.resolveImage(item.image, `loc-${i}`) : item.image
              return `<a href="${href(ctx, 'portfolio')}" class="block">${src ? `<img src="${escapeHtml(src)}" class="w-full h-40 object-cover rounded-xl mb-3" alt="" />` : ''}<p class="text-center text-sm font-semibold">${escapeHtml(item.title)}</p></a>`
            })
            .join('')
    }</div></section>`,
  )

  const mapHtml = mapBlock(ctx)
  const contactHtml = gateSection(
    ctx,
    pv.contact,
    "$settings->page_visibility['contact'] ?? false",
    `<section id="contact" class="py-24 px-4 sm:px-6 lg:px-8"><div class="max-w-7xl mx-auto space-y-12"><div class="text-center max-w-2xl mx-auto"><div class="text-xs font-bold uppercase tracking-widest" style="color:${theme.accent}">Connect with us</div><h2 class="text-3xl font-extrabold mt-2">${txt(ctx, c.contactSectionTitle, '{{ $settings->contact_section_title }}')}</h2></div><div class="grid lg:grid-cols-12 gap-12"><div class="lg:col-span-5 space-y-6"><div class="${theme.card} p-6 rounded-2xl"><h4 class="font-bold text-sm">Phone</h4><p class="text-xs ${theme.muted} mt-1">${txt(ctx, c.phone, '{{ $settings->phone }}')}</p></div><div class="${theme.card} p-6 rounded-2xl"><h4 class="font-bold text-sm">Email</h4><p class="text-xs ${theme.muted} mt-1">${txt(ctx, c.email, '{{ $settings->email }}')}</p></div><div class="${theme.card} p-6 rounded-2xl"><h4 class="font-bold text-sm">Office</h4><p class="text-xs ${theme.muted} mt-1">${txt(ctx, c.address, '{{ $settings->address }}')}</p></div>${mapHtml}</div><div class="lg:col-span-7 ${theme.card} p-8 rounded-3xl space-y-6"><h3 class="text-xl font-bold">${txt(ctx, c.contactFormTitle, '{{ $settings->contact_form_title }}')}</h3>${contactForm(ctx, theme)}</div></div></div></section>`,
  )

  const footer = `<footer class="border-t py-12 px-4 text-xs ${theme.muted}"><div class="max-w-7xl mx-auto grid md:grid-cols-4 gap-8"><div><div class="font-bold text-base mb-3">${txt(ctx, c.businessName, '{{ $settings->business_name }}')}</div><p>${txt(ctx, footerBlurb(c), '{{ filled($settings->footer_blurb) ? $settings->footer_blurb : ($settings->mission_statement ?: $settings->hero_subtext) }}')}</p></div><div><h4 class="font-bold mb-3 uppercase tracking-wider">Pages</h4><ul class="space-y-2">${footerPageLinks(ctx)}</ul></div><div><h4 class="font-bold mb-3 uppercase tracking-wider">Hours</h4><p>${txt(ctx, c.hours, '{{ $settings->hours }}')}</p></div><div><h4 class="font-bold mb-3 uppercase tracking-wider">Contact</h4><p>${footerContactLines(ctx)}</p></div></div><div class="max-w-7xl mx-auto mt-8 pt-8 border-t text-center">© ${new Date().getFullYear()} ${txt(ctx, c.businessName, '{{ $settings->business_name }}')}. ${txt(ctx, footerNote(c), "{{ $settings->footer_note ?: 'All rights reserved.' }}")}</div></footer>`

  return [statsHtml, aboutHtml, servicesHtml, stepsHtml, pricingHtml, teamHtml, reviewsHtml, locHtml, faqHtml, ctaHtml, contactHtml, footer].join('\n')
}

function t1Hero(ctx: CloneExportCtx, theme: CloneTheme): string {
  const c = ctx.content
  return `<section id="hero" class="relative z-0 isolate py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
    <div class="absolute inset-0 z-0">${img(ctx, c.heroImage, 'hero', 'w-full h-full object-cover opacity-15 contrast-125 brightness-75')}<div class="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70"></div></div>
    <div class="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-8">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider" style="background-color:${theme.accent}">${txt(ctx, c.businessName, '{{ $settings->business_name }}')}</div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight">${txt(ctx, c.tagline, '{{ $settings->tagline }}')}</h1>
        <p class="${theme.muted} text-base sm:text-lg max-w-2xl">${txt(ctx, c.heroSubtext, '{{ $settings->hero_subtext }}')}</p>
        <div class="flex flex-wrap gap-4">
          <button type="button" data-open-booking class="px-8 py-4 rounded-xl font-extrabold text-white shadow-2xl" style="background-color:${theme.accent}">${txt(ctx, c.ctaText, '{{ $settings->cta_text }}')}</button>
          <a href="#about" class="px-7 py-4 rounded-xl ${theme.card} font-bold">Learn more</a>
        </div>
      </div>
      <div class="lg:col-span-5"><div class="${theme.card} p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6"><span class="px-3 py-1 rounded-full text-xs font-bold" style="color:${theme.accent}">Instant calculation</span><h3 class="text-2xl font-bold">Apply for a consultation</h3>${bookingForm(ctx, theme, true)}</div></div>
    </div>
  </section>`
}

function t2Hero(ctx: CloneExportCtx, _theme: CloneTheme): string {
  const c = ctx.content
  return `<section class="relative z-0 isolate min-h-screen flex flex-col overflow-hidden bg-[#976DE8] text-white">
    <div class="relative z-10 max-w-[1400px] mx-auto w-full px-6 lg:px-12 py-12 lg:py-16 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h1 class="text-[2.75rem] lg:text-[4rem] font-bold leading-[1.05] mb-6">${txt(ctx, c.tagline, '{{ $settings->tagline }}')}</h1>
        <p class="text-[17px] text-gray-200 mb-10 max-w-[500px]">${txt(ctx, c.heroSubtext, '{{ $settings->hero_subtext }}')}</p>
        <button type="button" data-open-booking class="rounded-full bg-[#6035EE] px-8 py-3 text-xs font-bold uppercase tracking-widest">${txt(ctx, c.ctaText, '{{ $settings->cta_text }}')}</button>
      </div>
      <div class="relative h-[450px] lg:h-[600px]">
        <div class="absolute right-[5%] bottom-0 w-[75%] h-[85%] bg-[#FBD043] rounded-tl-[140px]"></div>
        <div class="relative z-10 w-[70%] h-[95%] ml-auto rounded-t-full overflow-hidden border-[6px] border-[#211543]">${img(ctx, c.heroImage, 'hero', 'w-full h-full object-cover')}</div>
      </div>
    </div>
  </section>`
}

function t3Hero(ctx: CloneExportCtx, theme: CloneTheme): string {
  const c = ctx.content
  return `<section class="relative z-0 isolate min-h-screen flex flex-col bg-[#141110] text-white">
    <div class="absolute inset-0 z-0">${img(ctx, c.heroImage, 'hero', 'w-full h-full object-cover object-center')}<div class="absolute inset-0 bg-gradient-to-r from-[#141110] via-[#141110]/80 to-transparent"></div></div>
    <div class="relative z-10 max-w-[1400px] mx-auto w-full px-6 lg:px-12 pb-24 flex-1 flex flex-col justify-center">
      <p class="text-[13px] font-bold tracking-[0.2em] uppercase text-[#E8D9CB] mb-6">${txt(ctx, c.businessName, '{{ $settings->business_name }}')}</p>
      <h1 class="text-5xl lg:text-[5.5rem] font-bold leading-[1.05] mb-8 max-w-3xl">${txt(ctx, c.tagline, '{{ $settings->tagline }}')}</h1>
      <p class="text-lg text-[#CBBBAC] max-w-[600px] mb-10 border-l-2 pl-4" style="border-color:${theme.accent}">${txt(ctx, c.heroSubtext, '{{ $settings->hero_subtext }}')}</p>
      <button type="button" data-open-booking class="inline-block rounded-lg px-8 py-4 font-bold text-sm text-white w-fit" style="background-color:${theme.accent}">${txt(ctx, c.ctaText, '{{ $settings->cta_text }}')}</button>
    </div>
  </section>`
}

function t4Hero(ctx: CloneExportCtx, theme: CloneTheme): string {
  const c = ctx.content
  return `<section id="hero" class="relative z-0 isolate overflow-hidden text-white" style="background-color:#16302A">
    <div class="max-w-7xl mx-auto px-4 py-16 lg:py-20 grid lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6">
        <p class="text-xs font-semibold text-[#DDEBD0] mb-6">${txt(ctx, c.businessName, '{{ $settings->business_name }}')}</p>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[1.05] mb-6">${txt(ctx, c.tagline, '{{ $settings->tagline }}')}</h1>
        <p class="text-[15px] text-[#C7D6C9] max-w-md mb-8">${txt(ctx, c.heroSubtext, '{{ $settings->hero_subtext }}')}</p>
        <button type="button" data-open-booking class="inline-flex items-center rounded-full pl-6 pr-2 py-2.5 font-bold text-sm" style="background-color:${theme.accent};color:${theme.accentFg}">${txt(ctx, c.ctaText, '{{ $settings->cta_text }}')}</button>
      </div>
      <div class="lg:col-span-6 rounded-[2rem] overflow-hidden border-4 border-white/10">${img(ctx, c.heroImage, 'hero', 'w-full h-[420px] object-cover')}</div>
    </div>
  </section>`
}

function t5Hero(ctx: CloneExportCtx, _theme: CloneTheme): string {
  const c = ctx.content
  return `<section id="hero" class="relative z-0 isolate w-full overflow-hidden">
    <div class="absolute inset-0">${img(ctx, c.heroImage, 'hero', 'w-full h-full object-cover')}<div class="absolute inset-0" style="background:linear-gradient(135deg, rgba(6,31,58,.92), rgba(11,79,138,.82))"></div></div>
    <div class="relative z-10 max-w-7xl mx-auto px-4 py-20 lg:py-28">
      <p class="text-xs font-bold tracking-[0.25em] uppercase text-[#64B5F6] mb-4">${txt(ctx, c.businessName, '{{ $settings->business_name }}')}</p>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white max-w-2xl">${txt(ctx, c.tagline, '{{ $settings->tagline }}')}</h1>
      <p class="mt-6 max-w-lg text-blue-100/80">${txt(ctx, c.heroSubtext, '{{ $settings->hero_subtext }}')}</p>
      <button type="button" data-open-booking class="mt-8 rounded-lg px-7 py-3.5 text-sm font-bold text-white" style="background-color:#2196F3">${txt(ctx, c.ctaText, '{{ $settings->cta_text }}')}</button>
    </div>
  </section>`
}

function helixTaxFightersBody(ctx: CloneExportCtx): string {
  const theme = THEMES.helix
  const c = ctx.content
  const name = txt(ctx, c.businessName, '{{ $settings->business_name }}')
  const phone = txt(ctx, c.phone, '{{ $settings->phone }}')
  const email = txt(ctx, c.email, '{{ $settings->email }}')
  const logo = ctx.mode === 'blade'
    ? `@if($settings->logo)<img src="{{ \\App\\Support\\PublicAsset::url($settings->logo) }}" alt="" data-brand-logo class="object-contain" style="height:{{ max(20, min(56, (int) ($settings->logo_size ?? 32))) }}px;width:auto;max-height:56px;max-width:min(100%,14rem);object-fit:contain;" />@else<span class="font-bold text-xl">${name}</span>@endif`
    : c.logo
      ? `<img src="${escapeHtml(c.logo)}" alt="" data-brand-logo class="object-contain" style="${logoImageStyleAttr(c)}" />`
      : `<span class="font-bold text-xl">${name}</span>`
  const hero = ctx.mode === 'blade'
    ? `@if($settings->hero_image)<img src="{{ \\App\\Support\\PublicAsset::url($settings->hero_image) }}" class="absolute inset-0 h-full w-full object-cover" alt="" />@endif`
    : img(ctx, c.heroImage, 'hero', 'absolute inset-0 h-full w-full object-cover')
  const aboutImg = img(ctx, c.aboutImage, 'about', 'w-full h-[550px] object-cover')
  const stepImg1 = ctx.mode === 'blade'
    ? `@if($galleryImages->first())<img src="{{ \\App\\Support\\PublicAsset::url($galleryImages->first()->path) }}" class="h-full w-full object-cover" alt="" />@endif`
    : img(ctx, c.galleryImages[0] || c.aboutImage, 'tf-step-1', 'h-full w-full object-cover')
  const stats = c.stats.filter((s) => s.value).slice(0, 3)
  const services = c.services.filter((s) => s.title).slice(0, 3)
  const steps = c.steps.filter((s) => s.title)
  const reviews = c.testimonials.filter((t) => t.quote).slice(0, 3)
  const faqs = c.faqs.filter((f) => f.question)
  const locations = c.showcaseItems.filter((i) => i.title).slice(0, 5)

  const prequalify = `<div id="booking-modal" class="hidden fixed inset-0 z-[80] items-center justify-center p-4">
    <button type="button" data-close-booking class="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-label="Close"></button>
    <div class="relative w-full max-w-md overflow-hidden rounded-lg shadow-2xl bg-[var(--clone-highlight)]">
      <div class="px-6 pt-6 pb-4">
        <div class="mb-4 flex justify-end"><button type="button" data-close-booking class="rounded p-1 text-white">✕</button></div>
        <h2 class="mb-2 text-center text-xl font-bold text-white">Leave Your Info For a Quick Response From Our Team</h2>
      </div>
      <div class="bg-white px-6 py-6">
        <p class="mb-1 text-center text-lg font-bold text-gray-700">Pre-qualify Today!</p>
        <p class="mb-6 text-center text-sm text-gray-600">---- Fill out form below ----</p>
        ${bookingForm(ctx, theme)}
        <button type="submit" form="" class="hidden"></button>
      </div>
    </div>
  </div>`

  return `<div class="${theme.page}">
  <div class="bg-black px-4 py-3 text-white"><div class="mx-auto flex max-w-7xl items-center justify-between"><a href="mailto:${ctx.mode === 'blade' ? '{{ $settings->email }}' : escapeHtml(c.email)}" class="font-medium hover:underline">Email</a><a href="tel:${ctx.mode === 'blade' ? '{{ $settings->phone }}' : escapeHtml(c.phone)}" class="text-sm font-medium md:text-2xl">${phone}</a></div></div>
  <nav class="sticky top-0 z-50 overflow-visible rounded-b-3xl bg-[var(--clone-accent)] text-white shadow-lg"><div class="mx-auto max-w-7xl px-4"><div class="flex h-20 items-center justify-between"><a href="${href(ctx, 'home')}" class="shrink-0">${logo}</a><div class="hidden md:flex items-center gap-1"><a href="${href(ctx, 'home')}" class="rounded-lg px-4 py-2 font-medium hover:bg-white/10">Home</a><a href="${href(ctx, 'services')}" class="rounded-lg px-4 py-2 font-medium hover:bg-white/10">Services</a><a href="${href(ctx, 'portfolio')}" class="rounded-lg px-4 py-2 font-medium hover:bg-white/10">Locations</a><a href="${href(ctx, 'blog')}" class="rounded-lg px-4 py-2 font-medium hover:bg-white/10">Blog</a><a href="${href(ctx, 'about')}" class="rounded-lg px-4 py-2 font-medium hover:bg-white/10">About</a><a href="${href(ctx, 'contact')}" class="rounded-lg px-4 py-2 font-medium hover:bg-white/10">Contact</a></div><button type="button" data-open-booking class="hidden md:block rounded-lg bg-white px-6 py-2 font-semibold text-[var(--clone-accent)]">Book now</button></div></div></nav>
  <header class="relative z-0 isolate h-screen min-h-[640px] overflow-hidden">${hero}<div class="absolute inset-0 bg-black/50"></div><div class="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 text-center"><h1 class="mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">${txt(ctx, c.tagline, '{{ $settings->tagline }}')}</h1><p class="mb-8 text-lg text-gray-200 sm:text-xl">${txt(ctx, c.heroSubtext, '{{ $settings->hero_subtext }}')}</p><a href="${href(ctx, 'about')}" class="rounded-full border-2 border-[var(--clone-accent)] px-8 py-3 text-lg font-semibold text-white">Learn More</a></div>${gateSection(ctx, c.sectionVisibility.stats && stats.length > 0, "($settings->section_visibility['stats'] ?? false) && $stats->isNotEmpty()", `<div class="absolute bottom-10 left-0 right-0 z-10 flex flex-wrap justify-center gap-8 sm:gap-16 px-4">${ctx.mode === 'blade' ? `@foreach($stats->take(3) as $stat)<div class="text-center"><div class="text-2xl sm:text-3xl font-bold text-white">{{ $stat->value }}</div><div class="text-sm text-gray-300">{{ $stat->label }}</div></div>@endforeach` : stats.map((s) => `<div class="text-center"><div class="text-2xl sm:text-3xl font-bold text-white">${escapeHtml(s.value)}</div><div class="text-sm text-gray-300">${escapeHtml(s.label)}</div></div>`).join('')}</div>`)}</header>
  ${gateSection(ctx, c.sectionVisibility.steps && steps.length > 0, "($settings->section_visibility['steps'] ?? false) && $steps->isNotEmpty()", `<section class="w-full px-6 py-24 text-white bg-[var(--clone-ink)]"><div class="mx-auto max-w-7xl"><div class="mb-20 text-center"><h2 class="mb-4 text-6xl md:text-7xl font-bold">${txt(ctx, c.stepsSectionTitle || 'How It Works', "{{ $settings->steps_section_title }}")}</h2><div class="flex justify-center"><div class="h-1 w-20 bg-white"></div></div></div><div class="grid lg:grid-cols-2 gap-16 items-start"><div class="space-y-12">${ctx.mode === 'blade' ? `@foreach($steps->take(3) as $step)<div class="border-l-4 border-white pl-6"><h3 class="mb-3 text-2xl font-bold">{{ $loop->iteration < 3 ? 'Step '.$loop->iteration : $step->title }}</h3><p class="text-lg text-white/90">{{ $step->description }}</p></div>@endforeach` : steps.slice(0, 3).map((s, i) => `<div class="border-l-4 border-white pl-6"><h3 class="mb-3 text-2xl font-bold">${i < 2 ? `Step ${i + 1}` : escapeHtml(s.title)}</h3><p class="text-lg text-white/90">${escapeHtml(s.description)}</p></div>`).join('')}</div><div class="h-96 overflow-hidden rounded-lg shadow-2xl">${stepImg1}</div></div><div class="mt-20 flex justify-center"><a href="${href(ctx, 'services')}" class="border-2 border-white px-10 py-4 text-lg font-bold uppercase">Learn More</a></div></div></section>`)}
  ${gateSection(ctx, c.sectionVisibility.testimonials && reviews.length > 0, "($settings->section_visibility['testimonials'] ?? false) && $testimonials->isNotEmpty()", `<section class="bg-black px-4 py-12"><div class="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16"><div><p class="mb-2 text-5xl font-bold text-white italic">${txt(ctx, c.teamSectionTitle || 'Meet Your Team', "{{ $settings->team_section_title }}")}</p><div class="mb-12 h-1 w-16 bg-red-500"></div><div class="space-y-4">${ctx.mode === 'blade' ? `@foreach($testimonials->take(3) as $item)<div class="rounded-lg bg-white p-4"><h3 class="font-semibold">{{ $item->author }}</h3><p class="text-sm text-gray-700">{{ $item->quote }}</p></div>@endforeach` : reviews.map((r) => `<div class="rounded-lg bg-white p-4"><h3 class="font-semibold">${escapeHtml(r.author)}</h3><p class="text-sm text-gray-700">${escapeHtml(r.quote)}</p></div>`).join('')}</div></div><div>${aboutImg}</div></div></section>`)}
  ${gateSection(ctx, c.pageVisibility.services && services.length > 0, "($settings->page_visibility['services'] ?? false) && $services->isNotEmpty()", `<section class="px-4 py-20 bg-[#f9f9f9]"><div class="mx-auto max-w-7xl"><div class="mb-16 text-center"><h2 class="mb-4 text-4xl sm:text-5xl font-bold">${txt(ctx, c.servicesSectionTitle, '{{ $settings->services_section_title }}')}</h2><p class="text-xl text-gray-600">${txt(ctx, c.servicesSectionSubtitle, '{{ $settings->services_section_subtitle }}')}</p></div><div class="grid md:grid-cols-3 gap-8">${ctx.mode === 'blade' ? `@foreach($services->take(3) as $service)<a href="${href(ctx, 'services')}" class="rounded-xl border bg-white p-8 shadow-lg"><div class="mb-4 h-12 w-12 rounded-lg bg-[var(--clone-accent)]"></div><h3 class="mb-4 text-2xl font-bold">{{ $service->title }}</h3><p class="text-gray-600">{{ $service->description }}</p></a>@endforeach` : services.map((s) => `<a href="${href(ctx, 'services')}" class="rounded-xl border bg-white p-8 shadow-lg"><div class="mb-4 h-12 w-12 rounded-lg bg-[var(--clone-accent)]"></div><h3 class="mb-4 text-2xl font-bold">${escapeHtml(s.title)}</h3><p class="text-gray-600">${escapeHtml(s.description)}</p></a>`).join('')}</div></div></section>`)}
  <section class="bg-white"><div class="mx-auto max-w-7xl px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center"><div><p class="text-4xl lg:text-5xl font-bold text-[var(--clone-accent)]">${txt(ctx, c.aboutTitle, '{{ $settings->about_title }}')}</p><p class="mt-6 text-lg text-[var(--clone-accent)]">${txt(ctx, c.about, '{{ $settings->about }}')}</p><button type="button" data-open-booking class="mt-8 rounded-lg bg-[var(--clone-accent)] px-8 py-3 font-semibold text-white">Book Now<br><span class="text-sm font-medium">Receive 20% Off</span></button></div>${aboutImg}</div></section>
  <section class="bg-gradient-to-b from-[var(--clone-accent)] via-[var(--clone-ink)] to-[var(--clone-ink)] px-4 py-20"><h2 class="mb-16 text-center text-4xl md:text-6xl font-bold italic text-white">${txt(ctx, c.businessName, '{{ $settings->business_name }}')} Specializes In:</h2><div class="mx-auto max-w-7xl grid md:grid-cols-3 gap-8">${ctx.mode === 'blade' ? `@foreach($services->take(3) as $service)<div class="text-center text-white"><h3 class="text-xl font-semibold">{{ $service->title }}</h3><p class="mt-2 text-sm text-white/80">{{ $service->description }}</p></div>@endforeach` : services.map((s) => `<div class="text-center text-white"><h3 class="text-xl font-semibold">${escapeHtml(s.title)}</h3><p class="mt-2 text-sm text-white/80">${escapeHtml(s.description)}</p></div>`).join('')}</div></section>
  ${gateSection(ctx, c.pageVisibility.portfolio && locations.length > 0, "($settings->page_visibility['portfolio'] ?? false) && $showcaseItems->isNotEmpty()", `<section class="bg-white px-4 py-20"><h2 class="mb-12 text-center text-4xl font-bold">${txt(ctx, c.showcaseSectionTitle, '{{ $settings->showcase_section_title }}')}</h2><div class="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-5 gap-6">${ctx.mode === 'blade' ? `@foreach($showcaseItems->take(5) as $item)<a href="${href(ctx, 'portfolio')}" class="block">@if($item->image)<img src="{{ \\App\\Support\\PublicAsset::url($item->image) }}" class="mb-3 h-40 w-full rounded-xl object-cover" alt="" />@endif<p class="text-center text-sm font-semibold">{{ $item->title }}</p></a>@endforeach` : locations.map((item, i) => { const src = item.image && ctx.resolveImage ? ctx.resolveImage(item.image, `loc-${i}`) : item.image; return `<a href="${href(ctx, 'portfolio')}" class="block">${src ? `<img src="${escapeHtml(src)}" class="mb-3 h-40 w-full rounded-xl object-cover" alt="" />` : ''}<p class="text-center text-sm font-semibold">${escapeHtml(item.title)}</p></a>` }).join('')}</div></section>`)}
  ${gateSection(ctx, c.sectionVisibility.pricing, "$settings->section_visibility['pricing'] ?? false", `<section id="pricing" class="px-4 py-24"><div class="mx-auto max-w-7xl space-y-12"><div class="mx-auto max-w-2xl text-center"><div class="text-xs font-bold uppercase tracking-[0.2em]" style="color:var(--clone-accent)">Pricing</div><h2 class="mt-3 text-3xl font-black sm:text-4xl">${txt(ctx, c.pricingSectionTitle || 'Pricing plans', '{{ $settings->pricing_section_title }}')}</h2></div><div class="grid gap-6 md:grid-cols-3">${ctx.mode === 'blade' ? `@forelse(($pricingPlans ?? collect()) as $plan)<div class="rounded-3xl border bg-[var(--clone-surface)] p-8" @if($plan->featured) style="border-color:var(--clone-accent);box-shadow:0 0 0 1px var(--clone-accent)" @endif>@if($plan->tag)<p class="mb-2 text-xs font-bold uppercase tracking-wider" style="color:var(--clone-accent)">{{ $plan->tag }}</p>@endif<h3 class="text-xl font-bold">{{ $plan->title }}</h3><p class="my-3 text-3xl font-black" style="color:var(--clone-accent)">{{ $plan->price }}</p><p class="text-sm leading-relaxed opacity-70">{{ $plan->description }}</p></div>@empty<div class="rounded-3xl border bg-[var(--clone-surface)] p-8" style="border-color:var(--clone-accent);box-shadow:0 0 0 1px var(--clone-accent)"><h3 class="text-xl font-bold">Custom quote</h3><p class="my-3 text-3xl font-black" style="color:var(--clone-accent)">Contact us</p><p class="text-sm leading-relaxed opacity-70">Tell us what you need and we will price the work clearly before we start.</p></div>@endforelse` : ((c.pricing.filter((plan) => plan.title).length ? c.pricing.filter((plan) => plan.title) : [{ title: 'Custom quote', description: 'Tell us what you need and we will price the work clearly before we start.', price: 'Contact us', tag: '', featured: true }]).map((plan) => `<div class="rounded-3xl border bg-[var(--clone-surface)] p-8"${plan.featured ? ' style="border-color:var(--clone-accent);box-shadow:0 0 0 1px var(--clone-accent)"' : ''}>${plan.tag ? `<p class="mb-2 text-xs font-bold uppercase tracking-wider" style="color:var(--clone-accent)">${escapeHtml(plan.tag)}</p>` : ''}<h3 class="text-xl font-bold">${escapeHtml(plan.title)}</h3><p class="my-3 text-3xl font-black" style="color:var(--clone-accent)">${escapeHtml(plan.price)}</p><p class="text-sm leading-relaxed opacity-70">${escapeHtml(plan.description)}</p></div>`).join(''))}</div></div></section>`)}
  ${gateSection(ctx, c.sectionVisibility.team && c.team.some((member) => member.name), "($settings->section_visibility['team'] ?? false) && ($team ?? collect())->isNotEmpty()", `<section class="bg-black px-4 py-24 text-white"><div class="mx-auto max-w-7xl"><h2 class="mb-16 text-center text-5xl font-bold">${txt(ctx, c.teamSectionTitle, '{{ $settings->team_section_title }}')}</h2><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${ctx.mode === 'blade' ? `@foreach($team as $member)<div class="relative min-h-[320px] overflow-hidden">@if($member->image)<img src="{{ \\App\\Support\\PublicAsset::url($member->image) }}" class="absolute inset-0 h-full w-full object-cover" alt="" />@else<div class="absolute inset-0" style="background-color:var(--clone-accent)"></div>@endif<div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div><div class="absolute inset-x-0 bottom-0 p-5"><h3 class="text-xl font-bold">{{ $member->name }}</h3><p class="mt-1 text-sm text-white/70">{{ $member->role }}</p></div></div>@endforeach` : c.team.filter((member) => member.name).map((member, i) => { const src = member.image && ctx.resolveImage ? ctx.resolveImage(member.image, `helix-team-${i}`) : member.image; return `<div class="relative min-h-[320px] overflow-hidden">${src ? `<img src="${escapeHtml(src)}" class="absolute inset-0 h-full w-full object-cover" alt="" />` : `<div class="absolute inset-0" style="background-color:var(--clone-accent)"></div>`}<div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div><div class="absolute inset-x-0 bottom-0 p-5"><h3 class="text-xl font-bold">${escapeHtml(member.name)}</h3><p class="mt-1 text-sm text-white/70">${escapeHtml(member.role)}</p></div></div>` }).join('')}</div></div></section>`)}
  ${gateSection(ctx, c.sectionVisibility.faq && faqs.length > 0, "($settings->section_visibility['faq'] ?? false) && $faqs->isNotEmpty()", `<section class="bg-[#f9f9f9] px-4 py-20"><div class="mx-auto max-w-4xl"><h2 class="mb-16 text-center text-4xl font-bold">${txt(ctx, c.faqSectionTitle, '{{ $settings->faq_section_title }}')}</h2>${ctx.mode === 'blade' ? `@foreach($faqs as $faq)<details class="mb-3 overflow-hidden rounded-lg border bg-white"><summary class="cursor-pointer px-6 py-4 text-lg font-semibold">{{ $faq->question }}</summary><p class="border-t px-6 py-4 text-gray-700">{{ $faq->answer }}</p></details>@endforeach` : faqs.map((f) => `<details class="mb-3 overflow-hidden rounded-lg border bg-white"><summary class="cursor-pointer px-6 py-4 text-lg font-semibold">${escapeHtml(f.question)}</summary><p class="border-t px-6 py-4 text-gray-700">${escapeHtml(f.answer)}</p></details>`).join('')}</div></section>`)}
  ${gateSection(ctx, c.sectionVisibility.cta, "$settings->section_visibility['cta'] ?? false", `<section class="bg-[var(--clone-accent)] px-4 py-20 text-center text-white"><h2 class="mb-6 text-4xl sm:text-5xl font-bold">${txt(ctx, c.ctaBannerTitle, '{{ $settings->cta_banner_title }}')}</h2><p class="mb-8 text-xl">${txt(ctx, c.ctaBannerText, '{{ $settings->cta_banner_text }}')}</p><button type="button" data-open-booking class="rounded-lg bg-white px-10 py-4 text-lg font-semibold text-[var(--clone-accent)]">Contact Us</button></section>`)}
  <section class="bg-white px-6 py-20"><div class="mx-auto max-w-6xl"><h2 class="mb-10 text-3xl font-bold">${txt(ctx, c.contactSectionTitle, '{{ $settings->contact_section_title }}')}</h2><div class="grid lg:grid-cols-2 gap-12"><div class="space-y-6"><div class="grid sm:grid-cols-2 gap-6 text-sm"><div><p class="mb-1 text-xs font-bold uppercase text-[var(--clone-accent)]">Call / Text</p><p class="text-lg font-semibold">${phone}</p></div><div><p class="mb-1 text-xs font-bold uppercase text-[var(--clone-accent)]">Email</p><p>${email}</p></div></div>${mapBlock(ctx)}</div>${contactForm(ctx, theme)}</div></div></section>
  <footer class="bg-black px-6 py-16 text-white"><div class="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4"><div>${logo}<p class="mt-3 max-w-md text-sm text-white/70">${txt(ctx, footerBlurb(c), '{{ filled($settings->footer_blurb) ? $settings->footer_blurb : ($settings->mission_statement ?: $settings->hero_subtext) }}')}</p></div><p class="font-semibold">© ${new Date().getFullYear()} ${name}. ${txt(ctx, footerNote(c), "{{ $settings->footer_note ?: 'All rights reserved.' }}")}</p></div></footer>
  ${prequalify}
</div>
${cloneInteractiveScript()}`
}

function cloneBody(ctx: CloneExportCtx): string {
  if (ctx.templateId === 'helix') return helixTaxFightersBody(ctx)
  const theme = THEMES[ctx.templateId]
  const heroes: Record<Exclude<CloneTemplateId, 'helix'>, string> = {
    taxfighters: t1Hero(ctx, theme),
    aureum: t2Hero(ctx, theme),
    flux: t3Hero(ctx, theme),
    cpa: t4Hero(ctx, theme),
    axiom: t5Hero(ctx, theme),
  }
  return `<div class="${theme.page}">
${chromeNav(ctx, theme)}
${heroes[ctx.templateId]}
${standardSections(ctx, theme)}
${bookingModal(ctx, theme)}
</div>
${cloneInteractiveScript()}`
}

export function buildCloneHomeBody(ctx: CloneExportCtx): string {
  return cloneBody(ctx)
}

export function buildCloneHomeDocument(ctx: CloneExportCtx): string {
  const title = ctx.content.businessName
  const extraCss = brandCss(ctx.content)
  const palette = resolveClonePalette(ctx.templateId, ctx.content, ctx.colorSchemeId)
  const paletteCss = clonePaletteCss(ctx.templateId, palette)
  const wrapper = cloneWrapperClass(ctx.templateId, ctx.layoutVariantId)
  return rewriteContainerVariantsForExport(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>html,body { overflow-x: hidden; max-width: 100%; } body { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; }
iframe { max-width: 100%; }
img:not([data-brand-logo]):not([class*="object-cover"]):not([class*="object-contain"]):not([class*="h-full"]) { max-width: 100%; height: auto; }
@media (max-width: 640px) { h1 { font-size: clamp(1.75rem, 8vw, 2.75rem) !important; line-height: 1.15 !important; } }
${LAYOUT_SHELL_CSS}
${extraCss}
${paletteCss}
</style>
</head>
<body data-site-brand class="${wrapper}">
${cloneBody(ctx)}
</body></html>`)
}

export function buildCloneHomeBlade(
  templateId: CloneTemplateId,
  content: SiteContent,
  colorSchemeId?: string,
  layoutVariantId?: string,
): string {
  const body = cloneBody({ mode: 'blade', templateId, content, colorSchemeId, layoutVariantId })
  const palette = resolveClonePalette(templateId, content, colorSchemeId)
  const paletteCss = clonePaletteCss(templateId, palette)
  return `@extends('layouts.site')
@section('fullpage')
<style>${paletteCss}</style>
<div class="${cloneWrapperClass(templateId, layoutVariantId)}">
${body}
</div>
@endsection`
}
