export type TemplateCategory =
  | 'business'
  | 'creative'
  | 'food'
  | 'health'
  | 'tech'
  | 'retail'
  | 'realestate'

export type TemplateId =
  | 'business'
  | 'creative'
  | 'restaurant'
  | 'saas'
  | 'fitness'
  | 'boutique'
  | 'realtor'
  | 'photography'
  | 'medical'
  | 'lawfirm'
  | 'salon'
  | 'noir'
  | 'terra'
  | 'coastal'
  | 'vineyard'
  | 'arcade'

export type ContactFieldKey =
  | 'email'
  | 'phone'
  | 'address'
  | 'hours'
  | 'instagram'
  | 'website'
  | 'linkedin'
  | 'whatsapp'
  | 'supportEmail'
  | 'reservationEmail'
  | 'licenseNumber'
  | 'bookingUrl'

export type ToggleableSection =
  | 'stats'
  | 'about'
  | 'services'
  | 'steps'
  | 'showcase'
  | 'gallery'
  | 'team'
  | 'blog'
  | 'faq'
  | 'cta'

export interface SectionVisibility {
  stats: boolean
  about: boolean
  services: boolean
  steps: boolean
  showcase: boolean
  gallery: boolean
  team: boolean
  blog: boolean
  faq: boolean
  cta: boolean
}

export interface ServiceItem {
  title: string
  description: string
}

export interface StatItem {
  value: string
  label: string
}

export interface StepItem {
  title: string
  description: string
}

export interface TestimonialItem {
  quote: string
  author: string
  role: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface TeamMember {
  name: string
  role: string
  image: string
}

export interface ShowcaseItem {
  title: string
  description: string
  image: string
  price: string
  tag: string
  link: string
}

export interface BlogPostItem {
  title: string
  slug: string
  excerpt: string
  body: string
  image: string
  author: string
  date: string
}

export interface SiteContent {
  businessName: string
  tagline: string
  heroSubtext: string
  heroImage: string
  aboutTitle: string
  about: string
  aboutImage: string
  missionStatement: string
  sectionVisibility: SectionVisibility
  stats: StatItem[]
  servicesSectionTitle: string
  servicesSectionSubtitle: string
  services: ServiceItem[]
  stepsSectionTitle: string
  steps: StepItem[]
  showcaseSectionTitle: string
  showcaseSectionSubtitle: string
  showcaseItems: ShowcaseItem[]
  gallerySectionTitle: string
  galleryImages: string[]
  testimonialsSectionTitle: string
  testimonials: TestimonialItem[]
  faqSectionTitle: string
  faqs: FaqItem[]
  teamSectionTitle: string
  team: TeamMember[]
  blogSectionTitle: string
  blogSectionSubtitle: string
  blogPosts: BlogPostItem[]
  ctaBannerTitle: string
  ctaBannerText: string
  ctaText: string
  ctaLink: string
  email: string
  phone: string
  address: string
  hours: string
  instagram: string
  website: string
  linkedin: string
  whatsapp: string
  supportEmail: string
  reservationEmail: string
  licenseNumber: string
  bookingUrl: string
  contactSectionTitle: string
  contactFormTitle: string
  contactFormUrl: string
  contactFormButtonText: string
}

export interface ContactFieldDef {
  key: ContactFieldKey
  label: string
  placeholder: string
}

export interface CategoryMeta {
  id: TemplateCategory | 'all'
  label: string
  icon: string
}

export interface TemplateMeta {
  id: TemplateId
  name: string
  description: string
  category: TemplateCategory
  previewGradient: string
  accentColor: string
  contactFields: ContactFieldDef[]
  servicesLabel: string
}