import type { CategoryMeta } from '../types'

export const categories: CategoryMeta[] = [
  { id: 'all', label: 'All Templates', icon: '✦', blurb: 'Every live design in the catalog.' },
  { id: 'business', label: 'Business & Professional', icon: '💼', blurb: 'Consultancies, firms, and B2B brands.' },
  { id: 'creative', label: 'Creative & Design', icon: '🎨', blurb: 'Studios, agencies, and portfolios.' },
  { id: 'food', label: 'Food & Dining', icon: '🍽️', blurb: 'Restaurants, cafes, and catering.' },
  { id: 'hospitality', label: 'Hotels & Hospitality', icon: '🏨', blurb: 'Hotels, lodges, and guest houses.' },
  { id: 'health', label: 'Health & Wellness', icon: '💚', blurb: 'Clinics, gyms, and wellness brands.' },
  { id: 'tech', label: 'Technology', icon: '⚡', blurb: 'SaaS, startups, and product sites.' },
  { id: 'retail', label: 'Retail & Shop', icon: '🛍️', blurb: 'Stores, boutiques, and product catalogs.' },
  { id: 'realestate', label: 'Real Estate', icon: '🏠', blurb: 'Agencies, listings, and property brands.' },
  { id: 'finance', label: 'Finance & Tax', icon: '📊', blurb: 'Accountants, advisors, and tax firms.' },
]

export const businessTypes = categories.filter((item) => item.id !== 'all')