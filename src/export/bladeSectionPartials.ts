import { getSectionVariants } from '../data/sectionVariants'
import type { SiteExportPayload } from './backend/exportPayload'

const EXPLORE_LINKS = `@if($settings->page_visibility['about'] ?? false)<a href="{{ route('about') }}" class="tpl-explore-link">About</a>@endif
@if($settings->page_visibility['services'] ?? false)<a href="{{ route('services') }}" class="tpl-explore-link">Services</a>@endif
@if($settings->page_visibility['portfolio'] ?? false)<a href="{{ route('portfolio') }}" class="tpl-explore-link">Portfolio</a>@endif
@if($settings->page_visibility['blog'] ?? false)<a href="{{ route('blog.index') }}" class="tpl-explore-link">Blog</a>@endif
@if($settings->page_visibility['news'] ?? false)<a href="{{ route('news.index') }}" class="tpl-explore-link">News</a>@endif
@if($settings->page_visibility['gallery'] ?? false)<a href="{{ route('gallery') }}" class="tpl-explore-link">Gallery</a>@endif
@if($settings->page_visibility['contact'] ?? false)<a href="{{ route('contact') }}" class="tpl-explore-link">Contact</a>@endif`

const CONTACT_INFO = `@if($settings->email)<div><p class="opacity-60 mb-1 text-sm">Email</p><p>{{ $settings->email }}</p></div>@endif
@if($settings->phone)<div><p class="opacity-60 mb-1 text-sm">Phone</p><p>{{ $settings->phone }}</p></div>@endif
@if($settings->address)<div><p class="opacity-60 mb-1 text-sm">Address</p><p>{{ $settings->address }}</p></div>@endif
@if($settings->hours)<div><p class="opacity-60 mb-1 text-sm">Hours</p><p>{{ $settings->hours }}</p></div>@endif`

function formWrapClass(templateId: SiteExportPayload['templateId']): string {
  const style = getSectionVariants(templateId).contactForm
  const map: Record<string, string> = {
    underline: 'p-0 border-0 shadow-none bg-transparent',
    'dark-filled': 'rounded-xl border border-amber-500/30 bg-neutral-950 p-6',
    'soft-rounded': 'rounded-3xl border border-stone-200 bg-white p-8 shadow-sm',
    'minimal-border': 'rounded-lg border border-slate-200 bg-slate-50/50 p-6',
    'bold-outline': 'border-4 border-black bg-white p-6 shadow-[8px_8px_0_#000]',
    'elegant-serif': 'p-0 border-0 bg-transparent',
    'neon-glow': 'rounded-xl border-2 border-lime-400/30 bg-black/90 p-6',
  }
  return map[style] ?? 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'
}

function formInputClass(templateId: SiteExportPayload['templateId']): string {
  const style = getSectionVariants(templateId).contactForm
  const map: Record<string, string> = {
    underline: 'w-full border-0 border-b-2 border-zinc-300 bg-transparent py-3 text-sm focus:outline-none',
    'dark-filled': 'w-full rounded-lg border border-amber-500/20 bg-neutral-900 px-4 py-3 text-sm text-amber-50 focus:outline-none',
    'soft-rounded': 'w-full rounded-2xl border border-stone-200 bg-stone-50 px-5 py-3 text-sm focus:outline-none',
    'minimal-border': 'w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none',
    'bold-outline': 'w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium uppercase focus:outline-none',
    'elegant-serif': 'w-full border-0 border-b border-stone-300 bg-transparent py-3 font-serif text-sm focus:outline-none',
    'neon-glow': 'w-full rounded-lg border-2 border-lime-400/40 bg-black px-4 py-3 text-sm text-lime-100 focus:outline-none',
  }
  return map[style] ?? 'w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none'
}

export function generateBladeSectionPartials(payload: SiteExportPayload): Record<string, string> {
  const { templateId, accent } = payload
  const cfg = getSectionVariants(templateId)
  const inputCls = formInputClass(templateId)
  const wrapCls = formWrapClass(templateId)

  const faqItems = `@foreach($faqs as $i => $faq)`
  const faqEnd = `@endforeach`

  const faqBodies: Record<string, string> = {
    accordion: `${faqItems}<details class="rounded-xl border bg-white mb-3"><summary class="cursor-pointer px-5 py-4 font-semibold">{{ $faq->question }}</summary><p class="border-t px-5 py-4 text-slate-600">{{ $faq->answer }}</p></details>${faqEnd}`,
    cards: `${faqItems}<div class="rounded-2xl border bg-white p-6"><h3 class="font-semibold text-lg mb-3">{{ $faq->question }}</h3><p class="text-slate-600">{{ $faq->answer }}</p></div>${faqEnd}`,
    'two-column': `${faqItems}<div class="mb-8 break-inside-avoid border-b pb-6"><h3 class="font-semibold mb-2">{{ $faq->question }}</h3><p class="text-slate-600">{{ $faq->answer }}</p></div>${faqEnd}`,
    numbered: `${faqItems}<div class="flex gap-6 mb-8"><span class="text-3xl font-black opacity-20">{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }}</span><div><h3 class="font-bold uppercase tracking-wide mb-2">{{ $faq->question }}</h3><p class="text-slate-600">{{ $faq->answer }}</p></div></div>${faqEnd}`,
    sidebar: `${faqItems}<div class="grid md:grid-cols-[35%_1fr] gap-4 border-b pb-6 mb-6"><h3 class="font-semibold">{{ $faq->question }}</h3><p class="text-slate-600">{{ $faq->answer }}</p></div>${faqEnd}`,
    minimal: `${faqItems}<div class="mb-10 text-center"><h3 class="font-serif text-lg mb-3">{{ $faq->question }}</h3><p class="text-sm text-slate-600 max-w-lg mx-auto">{{ $faq->answer }}</p></div>${faqEnd}`,
    boxed: `${faqItems}<div class="border-b py-5"><h3 class="font-semibold mb-2">{{ $faq->question }}</h3><p class="text-slate-600">{{ $faq->answer }}</p></div>${faqEnd}`,
    stacked: `${faqItems}<div class="border-b border-slate-200 py-6"><h3 class="font-semibold text-lg mb-3">{{ $faq->question }}</h3><p class="text-slate-600">{{ $faq->answer }}</p></div>${faqEnd}`,
  }

  const faqShells: Record<string, string> = {
    accordion: `<section id="faq" class="py-20"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-10">{{ $settings->faq_section_title }}</h2><div class="space-y-3">${faqBodies.accordion}</div></div></section>`,
    cards: `<section id="faq" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-10">{{ $settings->faq_section_title }}</h2><div class="grid md:grid-cols-2 gap-6">${faqBodies.cards}</div></div></section>`,
    'two-column': `<section id="faq" class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-10">{{ $settings->faq_section_title }}</h2><div class="columns-1 md:columns-2 gap-10">${faqBodies['two-column']}</div></div></section>`,
    numbered: `<section id="faq" class="py-20"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-10">{{ $settings->faq_section_title }}</h2><div class="space-y-8">${faqBodies.numbered}</div></div></section>`,
    sidebar: `<section id="faq" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_2fr] gap-12"><div><h2 class="text-3xl font-bold">{{ $settings->faq_section_title }}</h2></div><div>${faqBodies.sidebar}</div></div></section>`,
    minimal: `<section id="faq" class="py-20"><div class="max-w-2xl mx-auto px-6"><h2 class="font-serif text-3xl font-light text-center mb-12">{{ $settings->faq_section_title }}</h2>${faqBodies.minimal}</div></section>`,
    boxed: `<section id="faq" class="py-20"><div class="max-w-4xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-10">{{ $settings->faq_section_title }}</h2><div class="rounded-2xl border-2 p-8 md:p-10">${faqBodies.boxed}</div></div></section>`,
    stacked: `<section id="faq" class="py-20"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">{{ $settings->faq_section_title }}</h2>${faqBodies.stacked}</div></section>`,
  }

  const exploreShells: Record<string, string> = {
    bento: `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><div class="mb-10"><h2 class="text-3xl font-bold">${cfg.exploreTitle}</h2><p class="mt-2 text-slate-600">${cfg.exploreSubtitle}</p></div><div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 flex flex-wrap">${EXPLORE_LINKS}</div></div></section>`,
    pills: `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><div class="mb-10"><h2 class="text-3xl font-bold">${cfg.exploreTitle}</h2><p class="mt-2 text-slate-600">${cfg.exploreSubtitle}</p></div><div class="flex flex-wrap gap-3">${EXPLORE_LINKS}</div></div></section>`,
    'list-arrows': `<section class="bg-slate-50 py-20"><div class="max-w-3xl mx-auto px-6"><div class="mb-10"><h2 class="text-3xl font-bold">${cfg.exploreTitle}</h2><p class="mt-2 text-slate-600">${cfg.exploreSubtitle}</p></div><div class="divide-y flex flex-col">${EXPLORE_LINKS}</div></div></section>`,
    strips: `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><div class="mb-10"><h2 class="text-3xl font-bold">${cfg.exploreTitle}</h2><p class="mt-2 text-slate-600">${cfg.exploreSubtitle}</p></div><div class="space-y-3 flex flex-col">${EXPLORE_LINKS}</div></div></section>`,
    tiles: `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><div class="mb-10"><h2 class="text-3xl font-bold">${cfg.exploreTitle}</h2><p class="mt-2 text-slate-600">${cfg.exploreSubtitle}</p></div><div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200">${EXPLORE_LINKS}</div></div></section>`,
    magazine: `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><div class="mb-10"><h2 class="text-3xl font-bold">${cfg.exploreTitle}</h2><p class="mt-2 text-slate-600">${cfg.exploreSubtitle}</p></div><div class="border-t flex flex-col">${EXPLORE_LINKS}</div></div></section>`,
    compass: `<section class="bg-slate-50 py-20"><div class="max-w-4xl mx-auto px-6 text-center"><div class="mb-10"><h2 class="text-3xl font-bold">${cfg.exploreTitle}</h2><p class="mt-2 text-slate-600">${cfg.exploreSubtitle}</p></div><div class="flex flex-wrap justify-center gap-4">${EXPLORE_LINKS}</div></div></section>`,
    'card-grid': `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><div class="text-center mb-10"><h2 class="text-3xl font-bold">${cfg.exploreTitle}</h2><p class="text-slate-600 mt-2">${cfg.exploreSubtitle}</p></div><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${EXPLORE_LINKS}</div></div></section>`,
  }

  const contactForm = `<div class="${wrapCls}">
@if(session('contact_success'))<div class="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 mb-4">{{ session('contact_success') }}</div>@endif
<form class="space-y-4" action="{{ route('contact.store') }}" method="POST">@csrf
<div><label class="block text-sm font-medium mb-1.5">Your Name</label><input name="name" type="text" required class="${inputCls}" /></div>
<div><label class="block text-sm font-medium mb-1.5">Email</label><input name="email" type="email" required class="${inputCls}" /></div>
<div><label class="block text-sm font-medium mb-1.5">Message</label><textarea name="message" required rows="5" class="${inputCls}"></textarea></div>
<button type="submit" class="w-full text-white px-6 py-3 rounded-lg font-semibold" style="background-color:${accent}">{{ $settings->contact_form_button_text }}</button>
</form></div>`

  const contactShells: Record<string, string> = {
    'full-bleed': `<section id="contact" class="bg-zinc-950 text-white py-24"><div class="max-w-4xl mx-auto px-6 text-center"><h2 class="text-4xl font-black uppercase mb-4">{{ $settings->contact_section_title }}</h2><div class="text-left mb-10">${contactForm}</div><div class="grid sm:grid-cols-2 gap-6 text-left text-sm">${CONTACT_INFO}</div></section>`,
    'centered-elegant': `<section id="contact" class="py-24 text-center"><div class="max-w-2xl mx-auto px-6"><h2 class="font-serif text-4xl font-light mb-8">{{ $settings->contact_section_title }}</h2><div class="mb-10 text-left grid sm:grid-cols-2 gap-6">${CONTACT_INFO}</div><div class="text-left">${contactForm}</div></section>`,
    'sidebar-panel': `<section id="contact" class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold mb-10">{{ $settings->contact_section_title }}</h2><div class="grid lg:grid-cols-[280px_1fr] gap-10"><aside class="space-y-6">${CONTACT_INFO}</aside><div>${contactForm}</div></div></div></section>`,
    'split-dark': `<section id="contact" class="bg-black text-white py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12"><div><h2 class="text-4xl font-black uppercase mb-6">{{ $settings->contact_section_title }}</h2><div class="grid sm:grid-cols-2 gap-6">${CONTACT_INFO}</div></div><div>${contactForm}</div></div></section>`,
    'coffee-warm': `<section id="contact" class="bg-[#faf6f0] py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_1.1fr] gap-12"><div><h2 class="font-serif text-3xl text-[#2d1810] mb-4">{{ $settings->contact_section_title }}</h2><div class="grid sm:grid-cols-2 gap-6">${CONTACT_INFO}</div></div><div>${contactForm}</div></div></section>`,
    'split-classic': `<section id="contact" class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold mb-10">{{ $settings->contact_section_title }}</h2><div class="grid lg:grid-cols-2 gap-12"><div class="grid sm:grid-cols-2 gap-6 text-sm">${CONTACT_INFO}</div><div>${contactForm}</div></div></div></section>`,
  }

  const exploreCss = `<style>
.tpl-explore-link{display:block;padding:1rem 1.25rem;border:1px solid #e2e8f0;border-radius:0.75rem;background:#fff;margin-bottom:0.5rem;font-weight:600;text-decoration:none;color:inherit}
.tpl-explore-link:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)}
section[id="contact"] .${wrapCls.split(' ')[0]}{width:100%}
</style>`

  return {
    'resources/views/partials/home-faq.blade.php': faqShells[cfg.faq] ?? faqShells.stacked,
    'resources/views/partials/home-explore.blade.php': `${exploreCss}${exploreShells[cfg.explore] ?? exploreShells['card-grid']}`,
    'resources/views/partials/home-contact.blade.php': contactShells[cfg.contactShell] ?? contactShells['split-classic'],
    'resources/views/partials/contact-form.blade.php': contactForm,
  }
}