export type TemplateCategory =
  | 'business'
  | 'creative'
  | 'food'
  | 'health'
  | 'tech'
  | 'retail'
  | 'realestate'
  | 'hospitality'
  | 'finance'

/** Stable catalog id. New templates are JSON documents, not members of a union. */
export type TemplateId = string

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
  | 'team'
  | 'steps'
  | 'faq'
  | 'cta'
  | 'testimonials'
  | 'pricing'

export interface SectionVisibility {
  stats: boolean
  team: boolean
  steps: boolean
  faq: boolean
  cta: boolean
  testimonials: boolean
  pricing: boolean
}

export interface PageVisibility {
  about: boolean
  services: boolean
  portfolio: boolean
  blog: boolean
  news: boolean
  gallery: boolean
  contact: boolean
  /** Rooms catalogue + online booking (hospitality) */
  rooms: boolean
}

/**
 * Hospitality room catalogue entry.
 * slug is generated from the name. unitCount seeds physical rooms on export.
 */
export interface RoomTypeItem {
  name: string
  slug: string
  description: string
  /** Price as a number string, e.g. "250". The discount is a percent off this price. */
  basePrice: string
  discountPercent: string
  currency: string
  maxAdults: string
  maxChildren: string
  bedConfiguration: string
  sizeSqm: string
  /** Comma-separated catalog amenity names */
  amenities: string
  photos: string[]
  /** How many bookable room units to create for this type */
  unitCount: string
  /** Prefix for unit codes, e.g. "DLX-" → DLX-101 */
  unitPrefix: string
  isActive: boolean
  freeCancellation: boolean
  freeBreakfast: boolean
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

export interface NewsItem {
  title: string
  slug: string
  excerpt: string
  body: string
  image: string
  author: string
  date: string
}

export interface PricingItem {
  title: string
  description: string
  price: string
  tag: string
  featured: boolean
}

export interface SiteContent {
  businessName: string
  tagline: string
  heroSubtext: string
  heroImage: string
  logo: string
  logoShowName: boolean
  brandPrimary: string
  brandSecondary: string
  brandAccent: string
  fontHeading: string
  fontBody: string
  aboutTitle: string
  about: string
  aboutImage: string
  missionStatement: string
  footerBlurb: string
  footerNote: string
  pageVisibility: PageVisibility
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
  newsSectionTitle: string
  newsSectionSubtitle: string
  newsPosts: NewsItem[]
  pricingSectionTitle: string
  pricing: PricingItem[]
  roomsSectionTitle: string
  roomsSectionSubtitle: string
  bookingSectionTitle: string
  bookingSectionSubtitle: string
  roomTypes: RoomTypeItem[]
  starRating: string
  city: string
  country: string
  checkInTime: string
  checkOutTime: string
  propertyAmenities: string
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
  mapUrl: string
  seoEnabled: boolean
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  seoSiteUrl: string
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
  blurb?: string
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
  premium?: boolean
}