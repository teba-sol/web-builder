import type {
  BlogPostItem,
  FaqItem,
  NewsItem,
  PricingItem,
  ServiceItem,
  ShowcaseItem,
  StatItem,
  StepItem,
  TeamMember,
  TestimonialItem,
} from '../types'


export type ContentListKey =
  | 'stats'
  | 'services'
  | 'steps'
  | 'testimonials'
  | 'blogPosts'
  | 'newsPosts'
  | 'pricing'
  | 'faqs'
  | 'team'
  | 'galleryImages'
  | 'showcaseItems'

export const LIST_MIN_COUNT: Record<ContentListKey, number> = {
  stats: 1,
  services: 1,
  steps: 1,
  testimonials: 1,
  blogPosts: 0,
  newsPosts: 0,
  pricing: 0,
  faqs: 1,
  team: 0,
  galleryImages: 0,
  showcaseItems: 0,
}

export const LIST_MAX_COUNT = 24

export const emptyStat = (): StatItem => ({ value: '', label: '' })
export const emptyService = (): ServiceItem => ({ title: '', description: '' })
export const emptyStep = (): StepItem => ({ title: '', description: '' })
export const emptyShowcase = (): ShowcaseItem => ({
  title: '',
  description: '',
  image: '',
  price: '',
  tag: '',
  link: 'contact',
})
export const emptyTestimonial = (): TestimonialItem => ({ quote: '', author: '', role: '' })
export const emptyBlogPost = (): BlogPostItem => ({
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  image: '',
  author: '',
  date: '',
})
export const emptyNewsPost = (): NewsItem => ({
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  image: '',
  author: '',
  date: '',
})
export const emptyPricing = (): PricingItem => ({
  title: '',
  description: '',
  price: '',
  tag: '',
  featured: false,
})
export const emptyFaq = (): FaqItem => ({ question: '', answer: '' })
export const emptyTeamMember = (): TeamMember => ({ name: '', role: '', image: '' })

export function createEmptyListItem(list: ContentListKey): unknown {
  switch (list) {
    case 'stats': return emptyStat()
    case 'services': return emptyService()
    case 'steps': return emptyStep()
    case 'showcaseItems': return emptyShowcase()
    case 'testimonials': return emptyTestimonial()
    case 'blogPosts': return emptyBlogPost()
    case 'newsPosts': return emptyNewsPost()
    case 'pricing': return emptyPricing()
    case 'faqs': return emptyFaq()
    case 'team': return emptyTeamMember()
    case 'galleryImages': return ''
  }
}

export const listAddLabels: Record<ContentListKey, string> = {
  stats: 'Add Stat',
  services: 'Add Service',
  steps: 'Add Step',
  showcaseItems: 'Add Item',
  testimonials: 'Add Review',
  blogPosts: 'Add Post',
  newsPosts: 'Add News Item',
  pricing: 'Add Plan',
  faqs: 'Add Question',
  team: 'Add Member',
  galleryImages: 'Add Image',
}