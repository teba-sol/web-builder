import { getTemplateMeta } from '../data/defaults'
import type { SiteContent, TemplateId } from '../types'
import { escapeHtml, resolveImageForExport, type ImageAsset } from './imageUtils'
import { tailwindHead } from './htmlShared'

export function generateHtml(
  templateId: TemplateId,
  content: SiteContent,
): { html: string; assets: ImageAsset[] } {
  const assets: ImageAsset[] = []
  const hero = resolveImageForExport(content.heroImage, 'hero', assets)
  const aboutImg = content.aboutImage
    ? resolveImageForExport(content.aboutImage, 'about', assets)
    : ''
  const gallery = content.galleryImages
    .map((img, i) => (img ? resolveImageForExport(img, `gallery-${i + 1}`, assets) : ''))
    .filter(Boolean)

  const meta = getTemplateMeta(templateId)
  const contactHtml = meta?.contactFields
    .map((f) => {
      const val = content[f.key]
      return val ? `<div><p class="text-sm opacity-60 mb-1">${escapeHtml(f.label)}</p><p>${escapeHtml(val)}</p></div>` : ''
    })
    .filter(Boolean)
    .join('') ?? ''

  const statsHtml = content.stats.map((s) =>
    `<div class="text-center"><p class="text-3xl font-bold">${escapeHtml(s.value)}</p><p class="text-sm opacity-70 mt-1">${escapeHtml(s.label)}</p></div>`
  ).join('')

  const servicesHtml = content.services.map((s) =>
    `<div class="rounded-xl border p-6"><h3 class="font-semibold text-lg mb-2">${escapeHtml(s.title)}</h3><p class="opacity-80">${escapeHtml(s.description)}</p></div>`
  ).join('')

  const stepsHtml = content.steps.map((s, i) =>
    `<div><span class="text-2xl font-bold opacity-40">0${i + 1}</span><h3 class="font-semibold mt-2">${escapeHtml(s.title)}</h3><p class="opacity-80 mt-1">${escapeHtml(s.description)}</p></div>`
  ).join('')

  const galleryHtml = gallery.map((g) =>
    `<img src="${g}" alt="" class="w-full rounded-xl aspect-[4/3] object-cover" />`
  ).join('')

  const testimonialsHtml = content.testimonials.map((t) =>
    `<div class="border rounded-xl p-6"><p class="italic mb-4">"${escapeHtml(t.quote)}"</p><p class="font-semibold">${escapeHtml(t.author)}</p><p class="text-sm opacity-70">${escapeHtml(t.role)}</p></div>`
  ).join('')

  const teamHtml = content.team.filter((m) => m.name).map((m) => {
    const img = m.image ? resolveImageForExport(m.image, `team-${m.name}`, assets) : ''
    return `<div class="text-center">${img ? `<img src="${img}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />` : ''}<h3 class="font-semibold">${escapeHtml(m.name)}</h3><p class="opacity-70">${escapeHtml(m.role)}</p></div>`
  }).join('')

  const faqHtml = content.faqs.map((f) =>
    `<div class="border-b py-5"><h3 class="font-semibold mb-2">${escapeHtml(f.question)}</h3><p class="opacity-80">${escapeHtml(f.answer)}</p></div>`
  ).join('')

  const html = `${tailwindHead(content.businessName)}
<body class="bg-white text-slate-800">
  <nav class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur px-6 py-4 flex justify-between items-center max-w-6xl mx-auto w-full">
    <span class="text-xl font-bold">${escapeHtml(content.businessName)}</span>
    <a href="${escapeHtml(content.ctaLink)}" class="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold">${escapeHtml(content.ctaText)}</a>
  </nav>

  <header class="bg-slate-900 text-white py-24">
    <div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold mb-6">${escapeHtml(content.tagline)}</h1>
        <p class="text-slate-300 text-lg mb-8">${escapeHtml(content.heroSubtext)}</p>
        <a href="${escapeHtml(content.ctaLink)}" class="inline-block bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold">${escapeHtml(content.ctaText)}</a>
      </div>
      ${hero ? `<img src="${hero}" class="rounded-2xl w-full" />` : ''}
    </div>
  </header>

  <section class="py-16 bg-indigo-600 text-white">
    <div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">${statsHtml}</div>
  </section>

  <section id="about" class="py-20">
    <div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-3xl font-bold mb-6">${escapeHtml(content.aboutTitle)}</h2>
        <p class="text-lg leading-relaxed text-slate-600 mb-6">${escapeHtml(content.about)}</p>
        ${content.missionStatement ? `<p class="border-l-4 border-indigo-600 pl-6 italic text-slate-600">${escapeHtml(content.missionStatement)}</p>` : ''}
      </div>
      ${aboutImg ? `<img src="${aboutImg}" class="rounded-2xl w-full" />` : ''}
    </div>
  </section>

  <section id="services" class="bg-slate-50 py-20">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-3xl font-bold text-center mb-4">${escapeHtml(content.servicesSectionTitle)}</h2>
      <p class="text-center text-slate-600 mb-12">${escapeHtml(content.servicesSectionSubtitle)}</p>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">${servicesHtml}</div>
    </div>
  </section>

  <section class="py-20">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.stepsSectionTitle)}</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">${stepsHtml}</div>
    </div>
  </section>

  ${gallery.length ? `<section id="gallery" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.gallerySectionTitle)}</h2><div class="grid md:grid-cols-3 gap-4">${galleryHtml}</div></div></section>` : ''}

  <section id="testimonials" class="py-20">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.testimonialsSectionTitle)}</h2>
      <div class="grid md:grid-cols-3 gap-6">${testimonialsHtml}</div>
    </div>
  </section>

  ${teamHtml ? `<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.teamSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-8">${teamHtml}</div></div></section>` : ''}

  <section id="faq" class="py-20">
    <div class="max-w-3xl mx-auto px-6">
      <h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.faqSectionTitle)}</h2>
      ${faqHtml}
    </div>
  </section>

  <section class="bg-indigo-600 text-white py-20 text-center">
    <div class="max-w-3xl mx-auto px-6">
      <h2 class="text-3xl font-bold mb-4">${escapeHtml(content.ctaBannerTitle)}</h2>
      <p class="text-indigo-100 mb-8 text-lg">${escapeHtml(content.ctaBannerText)}</p>
      <a href="${escapeHtml(content.ctaLink)}" class="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold">${escapeHtml(content.ctaText)}</a>
    </div>
  </section>

  <section id="contact" class="py-20">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-3xl font-bold mb-10">Get in Touch</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">${contactHtml}</div>
    </div>
  </section>

  <footer class="border-t py-8 text-center text-sm text-slate-500">
    © ${new Date().getFullYear()} ${escapeHtml(content.businessName)}
  </footer>
</body></html>`

  return { html, assets }
}