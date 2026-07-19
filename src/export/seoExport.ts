import type { BlogPostItem, NewsItem, SiteContent } from '../types'
import { escapeHtml } from './imageUtils'

export interface PageSeoInput {
  content: SiteContent
  pageTitle: string
  pagePath?: string
  pageType?: 'website' | 'article'
  article?: Pick<BlogPostItem | NewsItem, 'title' | 'date' | 'author' | 'excerpt' | 'image'>
  ogImage?: string
}

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '')
  return trimmed
}

function absoluteUrl(base: string, path: string): string {
  if (!base) return path
  const cleanPath = path.replace(/^\//, '')
  return `${base}/${cleanPath}`
}

function resolveOgImage(content: SiteContent, override?: string): string {
  return override || content.heroImage || content.aboutImage || ''
}

export function resolveDocumentTitle(input: PageSeoInput): string {
  const { content, pageTitle, pagePath } = input
  if (!content.seoEnabled) return pageTitle
  if (!pagePath || pagePath === 'index.html') {
    return content.seoTitle?.trim() || pageTitle
  }
  return pageTitle
}

export function resolvePageDescription(input: PageSeoInput): string {
  const { content, article } = input
  if (article?.excerpt?.trim()) return article.excerpt.trim()
  if (content.seoEnabled && content.seoDescription?.trim()) return content.seoDescription.trim()
  return content.heroSubtext || content.about || content.tagline
}

export function buildJsonLdLocalBusiness(content: SiteContent, pageUrl: string): string {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: content.businessName,
    description: content.seoDescription || content.heroSubtext || content.about,
    url: pageUrl || undefined,
    image: content.heroImage || undefined,
    telephone: content.phone || undefined,
    email: content.email || undefined,
    address: content.address
      ? { '@type': 'PostalAddress', streetAddress: content.address }
      : undefined,
    openingHours: content.hours || undefined,
  }
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k])
  return JSON.stringify(data)
}

export function buildJsonLdArticle(
  content: SiteContent,
  article: NonNullable<PageSeoInput['article']>,
  pageUrl: string,
): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date || undefined,
    author: article.author ? { '@type': 'Person', name: article.author } : undefined,
    image: article.image || content.heroImage || undefined,
    publisher: {
      '@type': 'Organization',
      name: content.businessName,
    },
    mainEntityOfPage: pageUrl || undefined,
  }
  return JSON.stringify(data)
}

export function buildJsonLdFaqPage(content: SiteContent): string | null {
  const faqs = content.faqs.filter((f) => f.question.trim() && f.answer.trim())
  if (faqs.length === 0) return null
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  })
}

export function buildSeoMetaTags(input: PageSeoInput): string {
  const { content, pagePath, pageType = 'website', article } = input
  if (!content.seoEnabled) return ''

  const title = resolveDocumentTitle(input)
  const description = resolvePageDescription(input)
  const keywords = content.seoKeywords?.trim()
  const base = normalizeBaseUrl(content.seoSiteUrl)
  const canonical = pagePath && base ? absoluteUrl(base, pagePath) : ''
  const ogImage = resolveOgImage(content, input.ogImage || article?.image)
  const ogType = pageType === 'article' ? 'article' : 'website'

  const tags: string[] = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
  ]

  if (keywords) {
    tags.push(`<meta name="keywords" content="${escapeHtml(keywords)}" />`)
  }
  if (canonical) {
    tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`)
  }

  tags.push(
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(content.businessName)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  )

  if (ogImage) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
      `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
    )
  }
  if (canonical) {
    tags.push(`<meta property="og:url" content="${escapeHtml(canonical)}" />`)
  }
  if (pageType === 'article' && article?.date) {
    tags.push(`<meta property="article:published_time" content="${escapeHtml(article.date)}" />`)
  }

  const jsonLd: string[] = []
  if (!pagePath || pagePath === 'index.html') {
    jsonLd.push(buildJsonLdLocalBusiness(content, canonical || base))
    const faqLd = buildJsonLdFaqPage(content)
    if (faqLd) jsonLd.push(faqLd)
  }
  if (pageType === 'article' && article) {
    jsonLd.push(buildJsonLdArticle(content, article, canonical))
  }

  for (const ld of jsonLd) {
    tags.push(`<script type="application/ld+json">${ld}</script>`)
  }

  return tags.join('\n  ')
}

export function buildRobotsTxt(baseUrl: string): string {
  const base = normalizeBaseUrl(baseUrl)
  const sitemapLine = base ? `Sitemap: ${base}/sitemap.xml` : 'Sitemap: /sitemap.xml'
  return `User-agent: *
Allow: /

${sitemapLine}
`
}

export function collectSitemapPaths(
  pageKeys: string[],
  content: SiteContent,
): string[] {
  const paths = new Set<string>(['index.html'])
  for (const key of pageKeys) {
    paths.add(key)
  }
  if (!content.pageVisibility.contact) {
    paths.delete('contact.html')
  }
  return [...paths].sort()
}

export function collectLaravelSitemapPaths(content: SiteContent): string[] {
  const pv = content.pageVisibility
  const paths = ['/']
  if (pv.about) paths.push('/about')
  if (pv.services) paths.push('/services')
  if (pv.portfolio) paths.push('/portfolio')
  if (pv.gallery) paths.push('/gallery')
  if (pv.blog) {
    paths.push('/blog')
    for (const post of content.blogPosts.filter((p) => p.title)) {
      paths.push(`/blog/${post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)
    }
  }
  if (pv.news) {
    paths.push('/news')
    for (const post of content.newsPosts.filter((p) => p.title)) {
      paths.push(`/news/${post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)
    }
  }
  if (pv.contact) paths.push('/contact')
  if (pv.rooms) {
    paths.push('/rooms', '/book')
    for (const room of content.roomTypes.filter((r) => r.name && r.isActive)) {
      const slug = room.slug || room.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      paths.push(`/rooms/${slug}`)
    }
  }
  return paths
}

export function buildSitemapXml(baseUrl: string, paths: string[]): string {
  const base = normalizeBaseUrl(baseUrl)
  const today = new Date().toISOString().slice(0, 10)
  const urls = paths.map((path) => {
    const loc = base ? absoluteUrl(base, path) : `/${path}`
    const priority = path === 'index.html' ? '1.0' : path.includes('/') ? '0.6' : '0.8'
    return `  <url>
    <loc>${escapeHtml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path === 'index.html' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${priority}</priority>
  </url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
}