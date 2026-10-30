import { LayoutGrid, BriefcaseBusiness, Palette, UtensilsCrossed, Hotel, HeartPulse, Cpu, ShoppingBag, House, ChartNoAxesCombined } from 'lucide-react'
import type { CategoryMeta } from '../types'

export const categories: CategoryMeta[] = [
  { id: 'all', label: 'All Templates', icon: LayoutGrid, blurb: 'Every live design in the catalog.' },
  { id: 'business', label: 'Business & Professional', icon: BriefcaseBusiness, blurb: 'Consultancies, firms, and B2B brands.' },
  { id: 'creative', label: 'Creative & Design', icon: Palette, blurb: 'Studios, agencies, and portfolios.' },
  { id: 'food', label: 'Food & Dining', icon: UtensilsCrossed, blurb: 'Restaurants, cafes, and catering.' },
  { id: 'hospitality', label: 'Hotels & Hospitality', icon: Hotel, blurb: 'Hotels and guest houses.' },
  { id: 'health', label: 'Health & Wellness', icon: HeartPulse, blurb: 'Clinics, gyms, and wellness brands.' },
  { id: 'tech', label: 'Technology', icon: Cpu, blurb: 'SaaS, startups, and product sites.' },
  { id: 'retail', label: 'Retail & Shop', icon: ShoppingBag, blurb: 'Stores, boutiques, and product catalogs.' },
  { id: 'realestate', label: 'Real Estate', icon: House, blurb: 'Agencies, listings, and property brands.' },
  { id: 'finance', label: 'Finance & Tax', icon: ChartNoAxesCombined, blurb: 'Accountants, advisors, and tax firms.' },
]

export const businessTypes = categories.filter((item) => item.id !== 'all')