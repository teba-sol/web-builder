import { getColorSchemes } from '../data/colorSchemes'
import { getTemplateMeta } from '../data/defaults'
import { getLayoutVariant } from '../data/layoutVariants'
import { getShowcaseConfig } from '../data/sectionConfig'
import { resolveStaticHref } from '../data/siteNav'
import type { BlogPostItem, PageVisibility, SectionVisibility, SiteContent, TemplateId } from '../types'
import { type SectionId } from '../templates/themes'
import { canEmbedForm, EMBED_FORM_HEIGHT, getEmbedFormUrl } from '../utils/formEmbed'
import { buildStaticHeroHtml } from './heroExport'
import { escapeHtml, resolveImageForExport, type ImageAsset } from './imageUtils'
import { staticFooterHtml } from './footerHtml'
import { tailwindHead } from './htmlShared'

function formatBlogDate(date: string): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function blogPostHref(post: BlogPostItem): string {
  const slug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `blog/${slug}.html`
}

function isVisible(id: SectionId, sv: SectionVisibility, pv: PageVisibility): boolean {
  const pageMap: Partial<Record<SectionId, keyof PageVisibility>> = {
    about: 'about', services: 'services', showcase: 'portfolio', gallery: 'gallery', blog: 'blog',
  }
  const sectionMap: Partial<Record<SectionId, keyof SectionVisibility>> = {
    stats: 'stats', steps: 'steps', team: 'team', faq: 'faq', cta: 'cta', testimonials: 'testimonials',
  }
  const pageKey = pageMap[id]
  if (pageKey && !pv[pageKey]) return false
  const sectionKey = sectionMap[id]
  return !sectionKey || sv[sectionKey]
}

function buildContactFormHtml(content: SiteContent, accent: string): string {
  const formUrl = content.contactFormUrl.trim()
  const embedUrl = getEmbedFormUrl(formUrl)
  const mailTarget = content.email || content.reservationEmail || content.supportEmail
  const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

  const nativeForm = `<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <form class="space-y-4" action="${formUrl ? escapeHtml(formUrl) : mailTarget ? `mailto:${escapeHtml(mailTarget)}` : '#'}" method="${formUrl ? 'get' : 'post'}"${formUrl ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
        <input name="name" type="text" required class="${inputCls}" placeholder="John Smith" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
        <input name="email" type="email" required class="${inputCls}" placeholder="you@example.com" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
        <textarea name="message" required rows="5" class="${inputCls}" placeholder="How can we help you?"></textarea>
      </div>
      <button type="submit" class="w-full text-white px-6 py-3 rounded-lg font-semibold" style="background-color:${accent}">${escapeHtml(content.contactFormButtonText || 'Send message')}</button>
    </form>
    ${formUrl ? `<p class="mt-4 text-center text-sm text-slate-500">Or <a href="${escapeHtml(formUrl)}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-medium">open the full form directly</a></p>` : ''}
  </div>`

  if (canEmbedForm(formUrl) && embedUrl) {
    return `<div class="space-y-4">
      <div class="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm" style="height:${EMBED_FORM_HEIGHT}px">
        <iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(content.contactFormTitle)}" width="100%" height="${EMBED_FORM_HEIGHT}" style="height:${EMBED_FORM_HEIGHT}px;border:0;display:block" loading="lazy" allow="fullscreen"></iframe>
      </div>
      <p class="text-center text-xs text-slate-500">Form not loading? <a href="${escapeHtml(formUrl)}" target="_blank" rel="noopener noreferrer" class="underline">Open in a new tab</a></p>
    </div>`
  }

  return nativeForm
}

export function generateHtml(
  templateId: TemplateId,
  content: SiteContent,
  colorSchemeId?: string,
  layoutVariantId?: string,
): { html: string; assets: ImageAsset[] } {
  const scheme = getColorSchemes(templateId).find((s) => s.id === colorSchemeId)
    ?? getColorSchemes(templateId)[0]
  const accent = scheme.swatches[1]
  const accentDark = scheme.swatches[0]
  const layout = getLayoutVariant(templateId, layoutVariantId)
  const visibility = content.sectionVisibility
  const pageVisibility = content.pageVisibility
  const showcaseCfg = getShowcaseConfig(templateId)
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

  const stats = content.stats.filter((s) => s.value)
  const statsHtml = stats.map((s) =>
    `<div class="text-center"><p class="text-3xl font-bold">${escapeHtml(s.value)}</p><p class="text-sm opacity-70 mt-1">${escapeHtml(s.label)}</p></div>`
  ).join('')

  const services = content.services.filter((s) => s.title)
  const servicesHtml = services.map((s) =>
    `<div class="rounded-xl border p-6"><h3 class="font-semibold text-lg mb-2">${escapeHtml(s.title)}</h3><p class="opacity-80">${escapeHtml(s.description)}</p></div>`
  ).join('')

  const steps = content.steps.filter((s) => s.title)
  const stepsHtml = steps.map((s, i) =>
    `<div><span class="text-2xl font-bold opacity-40">0${i + 1}</span><h3 class="font-semibold mt-2">${escapeHtml(s.title)}</h3><p class="opacity-80 mt-1">${escapeHtml(s.description)}</p></div>`
  ).join('')

  const showcaseItems = content.showcaseItems.filter((item) => item.title)
  const showcaseHtml = showcaseItems.map((item, i) => {
    const img = item.image ? resolveImageForExport(item.image, `showcase-${i + 1}`, assets) : ''
    const tag = showcaseCfg.showTag && item.tag ? `<p class="text-xs uppercase tracking-wider opacity-60 mb-2">${escapeHtml(item.tag)}</p>` : ''
    const price = showcaseCfg.showPrice && item.price ? `<p class="text-lg font-bold mt-2" style="color:${accent}">${escapeHtml(item.price)}</p>` : ''
    const itemHref = item.link?.startsWith('http') ? item.link : resolveStaticHref(item.link || 'contact', content)
    return `<a href="${escapeHtml(itemHref)}" class="block rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
      ${img ? `<img src="${img}" alt="" class="w-full aspect-[4/3] object-cover" />` : ''}
      <div class="p-6">${tag}<h3 class="font-semibold text-lg mb-2">${escapeHtml(item.title)}</h3><p class="opacity-80">${escapeHtml(item.description)}</p>${price}</div>
    </a>`
  }).join('')

  const galleryHtml = gallery.map((g) =>
    `<img src="${g}" alt="" class="w-full rounded-xl aspect-[4/3] object-cover" />`
  ).join('')

  const testimonials = content.testimonials.filter((t) => t.quote)
  const stars = '<div class="text-amber-400 mb-3">★★★★★</div>'
  const testimonialsHtml = testimonials.map((t) =>
    `<div class="border rounded-xl p-6">${stars}<p class="italic mb-4 text-lg">"${escapeHtml(t.quote)}"</p><p class="font-semibold">${escapeHtml(t.author)}</p><p class="text-sm opacity-70">${escapeHtml(t.role)}</p></div>`
  ).join('')

  const teamHtml = content.team.filter((m) => m.name).map((m) => {
    const img = m.image ? resolveImageForExport(m.image, `team-${m.name}`, assets) : ''
    return `<div class="text-center">${img ? `<img src="${img}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />` : ''}<h3 class="font-semibold">${escapeHtml(m.name)}</h3><p class="opacity-70">${escapeHtml(m.role)}</p></div>`
  }).join('')

  const faqs = content.faqs.filter((f) => f.question)
  const faqHtml = faqs.map((f) =>
    `<div class="border-b py-5"><h3 class="font-semibold mb-2">${escapeHtml(f.question)}</h3><p class="opacity-80">${escapeHtml(f.answer)}</p></div>`
  ).join('')

  const blogPosts = content.blogPosts.filter((p) => p.title)
  const blogHtml = blogPosts.map((post, i) => {
    const img = post.image ? resolveImageForExport(post.image, `blog-${post.slug || i + 1}`, assets) : ''
    const date = post.date ? `<p class="text-xs uppercase tracking-wider opacity-60 mb-2">${escapeHtml(formatBlogDate(post.date))}</p>` : ''
    const author = post.author ? `<p class="text-sm font-medium mt-3">By ${escapeHtml(post.author)}</p>` : ''
    return `<a href="${escapeHtml(blogPostHref(post))}" class="block rounded-xl border overflow-hidden hover:shadow-lg transition-shadow bg-white">
      ${img ? `<img src="${img}" alt="" class="w-full aspect-[4/3] object-cover" />` : ''}
      <div class="p-6">${date}<h3 class="font-semibold text-lg mb-2">${escapeHtml(post.title)}</h3><p class="opacity-80 line-clamp-3">${escapeHtml(post.excerpt)}</p>${author}<span class="inline-block mt-3 text-sm font-semibold" style="color:${accent}">Read more →</span></div>
    </a>`
  }).join('')

  const contactFormBlock = buildContactFormHtml(content, accent)
  const contactTitle = escapeHtml(content.contactSectionTitle || 'Get in Touch')
  const ctaHref = resolveStaticHref(content.ctaLink || 'contact', content)

  const navLinks: string[] = []
  if (pageVisibility.portfolio) navLinks.push(`<a href="portfolio.html" class="hover:underline opacity-70">${escapeHtml(showcaseCfg.navLabel)}</a>`)
  if (pageVisibility.about) navLinks.push('<a href="about.html" class="hover:underline opacity-70">About</a>')
  if (pageVisibility.services) navLinks.push('<a href="services.html" class="hover:underline opacity-70">Services</a>')
  if (pageVisibility.gallery && gallery.length) navLinks.push('<a href="gallery.html" class="hover:underline opacity-70">Gallery</a>')
  if (pageVisibility.blog && blogPosts.length) navLinks.push('<a href="blog/index.html" class="hover:underline opacity-70">Blog</a>')
  if (pageVisibility.contact) navLinks.push('<a href="contact.html" class="hover:underline opacity-70">Contact</a>')

  const contactSectionHtml = layout.contactLayout === 'split' || layout.contactLayout === 'form-focus'
    ? `<section id="contact" class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold mb-10">${contactTitle}</h2><div class="grid lg:grid-cols-2 gap-12 items-start"><div><h3 class="text-xl font-semibold mb-6">${escapeHtml(content.contactFormTitle)}</h3><div class="grid sm:grid-cols-2 gap-6">${contactHtml}</div></div><div>${contactFormBlock}</div></div></section>`
    : `<section id="contact" class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold mb-10">${contactTitle}</h2><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">${contactHtml}</div><h3 class="text-xl font-semibold mb-6">${escapeHtml(content.contactFormTitle)}</h3>${contactFormBlock}</section>`

  const sectionHtml: Record<SectionId, string> = {
    nav: `<nav class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur px-6 py-4 flex justify-between items-center max-w-6xl mx-auto w-full">
      <span class="text-xl font-bold">${escapeHtml(content.businessName)}</span>
      <div class="hidden md:flex gap-6 text-sm">${navLinks.join('')}</div>
      <a href="${escapeHtml(ctaHref)}" class="text-white px-5 py-2 rounded-lg text-sm font-semibold" style="background-color:${accent}">${escapeHtml(content.ctaText)}</a>
    </nav>`,
    hero: buildStaticHeroHtml({
      templateId,
      heroLayout: layout.heroLayout,
      heroImage: hero,
      businessName: content.businessName,
      tagline: content.tagline,
      heroSubtext: content.heroSubtext,
      ctaText: content.ctaText,
      ctaHref,
    }),
    stats: stats.length ? `<section class="py-16 text-white" style="background-color:${accent}"><div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">${statsHtml}</div></section>` : '',
    about: `<section id="about" class="py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center"><div><h2 class="text-3xl font-bold mb-6">${escapeHtml(content.aboutTitle)}</h2><p class="text-lg leading-relaxed text-slate-600 mb-6">${escapeHtml(content.about)}</p>${content.missionStatement ? `<p class="border-l-4 pl-6 italic text-slate-600" style="border-color:${accent}">${escapeHtml(content.missionStatement)}</p>` : ''}</div>${aboutImg ? `<img src="${aboutImg}" class="rounded-2xl w-full" />` : ''}</div></section>`,
    services: services.length ? `<section id="services" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-4">${escapeHtml(content.servicesSectionTitle)}</h2><p class="text-center text-slate-600 mb-12">${escapeHtml(content.servicesSectionSubtitle)}</p><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">${servicesHtml}</div></div></section>` : '',
    steps: steps.length ? `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.stepsSectionTitle)}</h2><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">${stepsHtml}</div></div></section>` : '',
    showcase: showcaseItems.length ? `<section id="showcase" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-4">${escapeHtml(content.showcaseSectionTitle || showcaseCfg.sectionTitle)}</h2><p class="text-center text-slate-600 mb-12">${escapeHtml(content.showcaseSectionSubtitle || showcaseCfg.sectionSubtitle)}</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">${showcaseHtml}</div></div></section>` : '',
    gallery: gallery.length ? `<section id="gallery" class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.gallerySectionTitle)}</h2><div class="grid md:grid-cols-3 gap-4">${galleryHtml}</div></div></section>` : '',
    testimonials: `<section id="testimonials" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-4">${escapeHtml(content.testimonialsSectionTitle)}</h2><p class="text-center text-slate-600 mb-12">What our clients say about us</p>${testimonials.length ? `<div class="grid md:grid-cols-3 gap-6">${testimonialsHtml}</div>` : '<p class="text-center text-slate-500">Client reviews</p>'}</div></section>`,
    blog: blogPosts.length ? `<section id="blog" class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-4">${escapeHtml(content.blogSectionTitle)}</h2><p class="text-center text-slate-600 mb-12">${escapeHtml(content.blogSectionSubtitle)}</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">${blogHtml}</div></div></section>` : '',
    team: teamHtml ? `<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.teamSectionTitle)}</h2><div class="grid md:grid-cols-3 gap-8">${teamHtml}</div></div></section>` : '',
    faq: faqs.length ? `<section id="faq" class="py-20"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.faqSectionTitle)}</h2>${faqHtml}</div></section>` : '',
    cta: `<section class="text-white py-20 text-center" style="background-color:${accentDark}"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold mb-4">${escapeHtml(content.ctaBannerTitle)}</h2><p class="mb-8 text-lg opacity-80">${escapeHtml(content.ctaBannerText)}</p><a href="${escapeHtml(ctaHref)}" class="inline-block bg-white px-8 py-3 rounded-lg font-semibold" style="color:${accentDark}">${escapeHtml(content.ctaText)}</a></div></section>`,
    contact: contactSectionHtml,
    footer: staticFooterHtml(content, navLinks.join('')),
  }

  const body = layout.sectionOrder
    .filter((id) => isVisible(id, visibility, pageVisibility))
    .map((id) => sectionHtml[id])
    .filter(Boolean)
    .join('\n')

  const html = `${tailwindHead(content.businessName)}
<body class="bg-white text-slate-800 ${layout.shellClass}">
${body}
</body></html>`

  return { html, assets }
}