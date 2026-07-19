import type { BlogPostItem, NewsItem, SiteContent, TemplateId } from '../types'
import { slugify } from './slugify'

function truncateAtWord(text: string, maxLen: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLen) return clean
  const slice = clean.slice(0, maxLen)
  const lastSpace = slice.lastIndexOf(' ')
  return `${(lastSpace > 40 ? slice.slice(0, lastSpace) : slice).trim()}…`
}

function buildMetaTitle(businessName: string, tagline: string): string {
  const name = businessName.trim()
  const line = tagline.trim()
  if (!name) return line.slice(0, 60)
  if (!line) return name.slice(0, 60)
  const combined = `${name} | ${line}`
  if (combined.length <= 60) return combined
  const alt = `${name} — ${line}`
  return alt.length <= 60 ? alt : truncateAtWord(alt, 60).replace(/…$/, '')
}

function buildMetaDescription(content: SiteContent): string {
  const parts = [
    content.heroSubtext,
    content.about,
    content.missionStatement,
    ...content.services.map((s) => s.description).filter(Boolean),
    ...content.faqs.map((f) => f.answer).filter(Boolean).slice(0, 2),
  ]
  const source = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (source) return truncateAtWord(source, 155)
  if (content.tagline.trim()) return truncateAtWord(content.tagline, 155)
  return truncateAtWord(content.businessName, 155)
}

function buildKeywords(content: SiteContent, templateId?: TemplateId): string {
  const tokens = [
    content.businessName,
    content.tagline,
    ...content.services.map((s) => s.title),
    ...content.showcaseItems.map((s) => s.title),
    ...content.showcaseItems.map((s) => s.tag),
    templateId,
  ]
    .map((t) => (t || '').trim().toLowerCase())
    .filter((t) => t.length > 2)

  return [...new Set(tokens)].slice(0, 15).join(', ')
}

function optimizePost<T extends BlogPostItem | NewsItem>(post: T): T {
  const slug = post.slug?.trim() || slugify(post.title)
  const excerpt = post.excerpt?.trim() || truncateAtWord(post.body.replace(/\n+/g, ' '), 160)
  return { ...post, slug, excerpt }
}

export function optimizeSiteSeo(content: SiteContent, templateId?: TemplateId): Partial<SiteContent> {
  const seoTitle = buildMetaTitle(content.businessName, content.tagline)
  const seoDescription = buildMetaDescription(content)
  const seoKeywords = buildKeywords(content, templateId)
  const seoSiteUrl = content.seoSiteUrl?.trim() || content.website?.trim() || ''

  const blogPosts = content.blogPosts.map(optimizePost)
  const newsPosts = content.newsPosts.map(optimizePost)

  const updates: Partial<SiteContent> = {
    seoEnabled: true,
    seoTitle,
    seoDescription,
    seoKeywords,
    seoSiteUrl,
    blogPosts,
    newsPosts,
  }

  if (!content.heroSubtext.trim() && content.about.trim()) {
    updates.heroSubtext = truncateAtWord(content.about, 200)
  }

  return updates
}