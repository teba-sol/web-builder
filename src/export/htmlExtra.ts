import type { SiteContent } from '../types'
import { escapeHtml } from './imageUtils'
import { tailwindHead, servicesGrid } from './htmlShared'

export function saasHtml(c: SiteContent, hero: string) {
  return `${tailwindHead(c.businessName)}
<body class="bg-slate-950 text-white">
  <nav class="border-b border-white/10 px-6 py-4 flex justify-between max-w-6xl mx-auto">
    <span class="text-xl font-bold text-indigo-400">${escapeHtml(c.businessName)}</span>
    <a href="${escapeHtml(c.ctaLink)}" class="bg-indigo-600 px-5 py-2 rounded-lg text-sm font-semibold">${escapeHtml(c.ctaText)}</a>
  </nav>
  <header class="max-w-6xl mx-auto px-6 py-28 grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <h1 class="text-5xl font-bold mb-6">${escapeHtml(c.tagline)}</h1>
      <p class="text-slate-400 mb-8">${escapeHtml(c.about)}</p>
      <a href="${escapeHtml(c.ctaLink)}" class="bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-3 rounded-lg font-semibold">${escapeHtml(c.ctaText)}</a>
    </div>
    ${hero ? `<img src="${hero}" class="rounded-2xl border border-white/10" />` : ''}
  </header>
  <section class="max-w-6xl mx-auto px-6 py-20"><h2 class="text-3xl font-bold text-center mb-12">Features</h2>${servicesGrid(c, 'border border-white/10 rounded-2xl p-8')}</section>
  <section id="contact" class="border-t border-white/10 py-20"><div class="max-w-6xl mx-auto px-6 rounded-3xl border border-white/10 bg-indigo-950 p-12">
    <h2 class="text-3xl font-bold mb-8">Get in touch</h2>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-slate-300">
      ${c.email ? `<div><p class="text-indigo-400 text-xs uppercase mb-1">Sales</p>${escapeHtml(c.email)}</div>` : ''}
      ${c.supportEmail ? `<div><p class="text-indigo-400 text-xs uppercase mb-1">Support</p>${escapeHtml(c.supportEmail)}</div>` : ''}
      ${c.linkedin ? `<div><p class="text-indigo-400 text-xs uppercase mb-1">LinkedIn</p>${escapeHtml(c.linkedin)}</div>` : ''}
      ${c.bookingUrl ? `<div><p class="text-indigo-400 text-xs uppercase mb-1">Sign Up</p>${escapeHtml(c.bookingUrl)}</div>` : ''}
    </div>
  </div></section>
  <footer class="text-center py-8 text-slate-500 text-sm">© ${escapeHtml(c.businessName)}</footer>
</body></html>`
}

export function fitnessHtml(c: SiteContent, hero: string) {
  return `${tailwindHead(c.businessName)}
<body class="bg-black text-white">
  <nav class="px-6 py-4 flex justify-between max-w-6xl mx-auto border-b border-orange-500/20">
    <span class="text-2xl font-black italic text-orange-500">${escapeHtml(c.businessName)}</span>
    <a href="${escapeHtml(c.ctaLink)}" class="bg-orange-600 px-6 py-2 font-bold uppercase">${escapeHtml(c.ctaText)}</a>
  </nav>
  <header class="relative min-h-[70vh] flex items-center">
    ${hero ? `<img src="${hero}" class="absolute inset-0 w-full h-full object-cover opacity-40" />` : ''}
    <div class="relative max-w-6xl mx-auto px-6 py-20">
      <h1 class="text-6xl font-black uppercase max-w-3xl">${escapeHtml(c.tagline)}</h1>
      <p class="text-gray-400 mt-6 max-w-xl">${escapeHtml(c.about)}</p>
    </div>
  </header>
  <section class="bg-orange-600 py-16">${servicesGrid(c, 'text-center px-6')}</section>
  <section id="contact" class="py-20 max-w-6xl mx-auto px-6">
    <h2 class="text-3xl font-black uppercase text-orange-500 mb-10">Find Us</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${c.phone ? `<div class="border border-gray-800 bg-gray-900 p-6 rounded-lg"><p class="text-orange-500 text-xs uppercase">Phone</p><p class="mt-2">${escapeHtml(c.phone)}</p></div>` : ''}
      ${c.address ? `<div class="border border-gray-800 bg-gray-900 p-6 rounded-lg"><p class="text-orange-500 text-xs uppercase">Location</p><p class="mt-2">${escapeHtml(c.address)}</p></div>` : ''}
      ${c.hours ? `<div class="border border-gray-800 bg-gray-900 p-6 rounded-lg"><p class="text-orange-500 text-xs uppercase">Hours</p><p class="mt-2">${escapeHtml(c.hours)}</p></div>` : ''}
      ${c.instagram ? `<div class="border border-gray-800 bg-gray-900 p-6 rounded-lg"><p class="text-orange-500 text-xs uppercase">Instagram</p><p class="mt-2">${escapeHtml(c.instagram)}</p></div>` : ''}
    </div>
  </section>
</body></html>`
}

export function boutiqueHtml(c: SiteContent, hero: string) {
  return `${tailwindHead(c.businessName)}
<body class="bg-rose-50 text-stone-800" style="font-family: Georgia, serif">
  <nav class="border-b border-rose-200 px-6 py-6 flex justify-between max-w-5xl mx-auto">
    <span class="text-2xl uppercase tracking-widest">${escapeHtml(c.businessName)}</span>
    <a href="${escapeHtml(c.ctaLink)}" class="border border-stone-800 px-6 py-2 text-xs uppercase tracking-widest">${escapeHtml(c.ctaText)}</a>
  </nav>
  <header class="text-center py-20 px-6">
    <h1 class="text-5xl font-light italic mb-8">${escapeHtml(c.tagline)}</h1>
    ${hero ? `<img src="${hero}" class="mx-auto max-w-4xl w-full object-cover" />` : ''}
  </header>
  <section class="bg-white py-20 text-center max-w-2xl mx-auto px-6"><p class="text-lg italic text-stone-600">${escapeHtml(c.about)}</p></section>
  <section class="py-20 max-w-5xl mx-auto px-6">${servicesGrid(c, 'text-center')}</section>
  <section id="contact" class="bg-stone-800 text-rose-50 py-20 text-center">
    <div class="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto px-6 text-sm">
      ${c.email ? `<div><p class="text-rose-300 text-xs uppercase mb-1">Email</p>${escapeHtml(c.email)}</div>` : ''}
      ${c.phone ? `<div><p class="text-rose-300 text-xs uppercase mb-1">Phone</p>${escapeHtml(c.phone)}</div>` : ''}
      ${c.address ? `<div><p class="text-rose-300 text-xs uppercase mb-1">Address</p>${escapeHtml(c.address)}</div>` : ''}
      ${c.hours ? `<div><p class="text-rose-300 text-xs uppercase mb-1">Hours</p>${escapeHtml(c.hours)}</div>` : ''}
    </div>
    ${c.instagram ? `<p class="mt-8 text-rose-300">Follow ${escapeHtml(c.instagram)}</p>` : ''}
  </section>
</body></html>`
}

export function realtorHtml(c: SiteContent, hero: string) {
  return `${tailwindHead(c.businessName)}
<body class="bg-stone-100 text-stone-800">
  <header class="relative h-screen min-h-[500px]">
    ${hero ? `<img src="${hero}" class="absolute inset-0 w-full h-full object-cover" />` : '<div class="absolute inset-0 bg-stone-700"></div>'}
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="absolute bottom-12 left-0 right-0 max-w-6xl mx-auto px-6 text-white">
      <p class="text-amber-400 uppercase tracking-widest text-sm mb-3">Luxury Real Estate</p>
      <h1 class="text-5xl font-light max-w-3xl">${escapeHtml(c.tagline)}</h1>
    </div>
  </header>
  <section class="py-24 max-w-6xl mx-auto px-6"><p class="text-lg text-stone-600 leading-relaxed">${escapeHtml(c.about)}</p></section>
  <section class="bg-stone-800 text-white py-24">${servicesGrid(c, 'border-t border-amber-400/30 pt-8')}</section>
  <section id="contact" class="py-24 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
    <div class="space-y-4">
      ${c.phone ? `<p><span class="text-amber-700 uppercase text-xs w-24 inline-block">Phone</span> ${escapeHtml(c.phone)}</p>` : ''}
      ${c.email ? `<p><span class="text-amber-700 uppercase text-xs w-24 inline-block">Email</span> ${escapeHtml(c.email)}</p>` : ''}
      ${c.licenseNumber ? `<p><span class="text-amber-700 uppercase text-xs w-24 inline-block">License</span> ${escapeHtml(c.licenseNumber)}</p>` : ''}
      ${c.address ? `<p><span class="text-amber-700 uppercase text-xs w-24 inline-block">Office</span> ${escapeHtml(c.address)}</p>` : ''}
      ${c.website ? `<p><span class="text-amber-700 uppercase text-xs w-24 inline-block">Listings</span> ${escapeHtml(c.website)}</p>` : ''}
    </div>
    <div class="flex items-center justify-center bg-amber-50 p-12">
      <a href="${escapeHtml(c.ctaLink)}" class="bg-amber-700 text-white px-10 py-4 uppercase">${escapeHtml(c.ctaText)}</a>
    </div>
  </section>
</body></html>`
}

export function photographyHtml(c: SiteContent, hero: string) {
  return `${tailwindHead(c.businessName)}
<body class="bg-neutral-950 text-neutral-100">
  <header class="h-screen relative">
    ${hero ? `<img src="${hero}" class="w-full h-full object-cover" />` : ''}
    <div class="absolute inset-0 bg-black/30"></div>
    <div class="absolute bottom-16 left-8 right-8"><h1 class="text-5xl font-light max-w-4xl">${escapeHtml(c.tagline)}</h1></div>
  </header>
  <section class="p-12 md:p-20 max-w-3xl"><p class="text-neutral-400 text-lg font-light leading-relaxed">${escapeHtml(c.about)}</p></section>
  <section class="max-w-4xl mx-auto px-6 pb-20">${servicesGrid(c, 'border-t border-neutral-800 py-6')}</section>
  <section id="contact" class="py-20 px-8 grid md:grid-cols-2 gap-px bg-neutral-800 max-w-4xl mx-auto">
    ${c.email ? `<div class="bg-neutral-950 p-10 text-center"><p class="text-xs uppercase text-neutral-600 mb-2">Email</p>${escapeHtml(c.email)}</div>` : ''}
    ${c.phone ? `<div class="bg-neutral-950 p-10 text-center"><p class="text-xs uppercase text-neutral-600 mb-2">Phone</p>${escapeHtml(c.phone)}</div>` : ''}
    ${c.instagram ? `<div class="bg-neutral-950 p-10 text-center"><p class="text-xs uppercase text-neutral-600 mb-2">Instagram</p>${escapeHtml(c.instagram)}</div>` : ''}
    ${c.address ? `<div class="bg-neutral-950 p-10 text-center"><p class="text-xs uppercase text-neutral-600 mb-2">Based in</p>${escapeHtml(c.address)}</div>` : ''}
  </section>
</body></html>`
}

export function medicalHtml(c: SiteContent, hero: string) {
  return `${tailwindHead(c.businessName)}
<body class="bg-white text-slate-700">
  <nav class="border-b border-teal-100 px-6 py-4 flex justify-between max-w-6xl mx-auto">
    <span class="text-lg font-semibold text-teal-900">${escapeHtml(c.businessName)}</span>
    <a href="${escapeHtml(c.bookingUrl || c.ctaLink)}" class="bg-teal-600 text-white rounded-full px-6 py-2 text-sm font-semibold">${escapeHtml(c.ctaText)}</a>
  </nav>
  <header class="bg-gradient-to-br from-teal-50 to-emerald-50 py-20">
    <div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h1 class="text-4xl font-bold text-teal-900 mb-6">${escapeHtml(c.tagline)}</h1>
        <p class="text-slate-600 mb-8">${escapeHtml(c.about)}</p>
        <a href="${escapeHtml(c.bookingUrl || c.ctaLink)}" class="bg-teal-600 text-white rounded-full px-8 py-3 font-semibold">${escapeHtml(c.ctaText)}</a>
      </div>
      ${hero ? `<img src="${hero}" class="rounded-3xl shadow-xl" />` : ''}
    </div>
  </header>
  <section class="py-20 max-w-6xl mx-auto px-6">${servicesGrid(c, 'rounded-2xl border border-teal-100 bg-teal-50/50 p-8')}</section>
  <section id="contact" class="py-20 max-w-6xl mx-auto px-6">
    <div class="bg-teal-900 text-white rounded-3xl p-12">
      <h2 class="text-2xl font-bold mb-10">Contact & Hours</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        ${c.phone ? `<div><p class="text-teal-300 text-xs uppercase mb-1">Appointments</p>${escapeHtml(c.phone)}</div>` : ''}
        ${c.email ? `<div><p class="text-teal-300 text-xs uppercase mb-1">Email</p>${escapeHtml(c.email)}</div>` : ''}
        ${c.address ? `<div><p class="text-teal-300 text-xs uppercase mb-1">Address</p>${escapeHtml(c.address)}</div>` : ''}
        ${c.hours ? `<div><p class="text-teal-300 text-xs uppercase mb-1">Hours</p>${escapeHtml(c.hours)}</div>` : ''}
      </div>
    </div>
  </section>
</body></html>`
}