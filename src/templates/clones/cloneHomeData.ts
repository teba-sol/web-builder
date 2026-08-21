import { getSiteNavItems, resolveSiteHref, sitePath } from '../../data/siteNav'
import type { SiteContent, TemplateId } from '../../types'

export interface CloneHomeData {
  c: SiteContent
  basePath: string
  hrefs: {
    home: string
    about: string
    services: string
    portfolio: string
    blog: string
    blogPost: (slug: string) => string
    contact: string
    cta: string
  }
  show: {
    about: boolean
    services: boolean
    portfolio: boolean
    blog: boolean
    contact: boolean
    stats: boolean
    steps: boolean
    faq: boolean
    testimonials: boolean
    team: boolean
    cta: boolean
    pricing: boolean
  }
  services: SiteContent['services']
  stats: SiteContent['stats']
  steps: SiteContent['steps']
  testimonials: SiteContent['testimonials']
  faqs: SiteContent['faqs']
  team: SiteContent['team']
  locations: SiteContent['showcaseItems']
  blogPosts: SiteContent['blogPosts']
  pricing: SiteContent['pricing']
  navItems: { page: string; label: string; to: string }[]
}

export function buildCloneHomeData(c: SiteContent, basePath: string, templateId: TemplateId): CloneHomeData {
  const pv = c.pageVisibility
  const sv = c.sectionVisibility

  return {
    c,
    basePath,
    hrefs: {
      home: basePath,
      about: sitePath(basePath, 'about'),
      services: sitePath(basePath, 'services'),
      portfolio: sitePath(basePath, 'portfolio'),
      blog: sitePath(basePath, 'blog'),
      blogPost: (slug: string) => sitePath(basePath, `blog/${slug}`),
      contact: sitePath(basePath, 'contact'),
      cta: resolveSiteHref(basePath, c.ctaLink || 'contact', c),
    },
    show: {
      about: pv.about,
      services: pv.services,
      portfolio: pv.portfolio,
      blog: pv.blog,
      contact: pv.contact,
      stats: sv.stats,
      steps: sv.steps,
      faq: sv.faq,
      testimonials: sv.testimonials,
      team: sv.team,
      cta: sv.cta,
      pricing: sv.pricing,
    },
    services: c.services.filter((item) => item.title),
    stats: c.stats.filter((item) => item.value),
    steps: c.steps.filter((item) => item.title),
    testimonials: c.testimonials.filter((item) => item.quote),
    faqs: c.faqs.filter((item) => item.question),
    team: c.team.filter((item) => item.name),
    locations: c.showcaseItems.filter((item) => item.title),
    blogPosts: c.blogPosts.filter((item) => item.title),
    pricing: c.pricing.filter((item) => item.title),
    navItems: getSiteNavItems(templateId, c).map((item) => ({
      page: item.page,
      label: item.label,
      to: sitePath(basePath, item.segment),
    })),
  }
}

export function postPath(posts: SiteContent['blogPosts'], index: number, fallback: string): string {
  const post = posts[index]
  if (!post?.title) return fallback
  return post.slug ? `blog/${post.slug}` : fallback
}
