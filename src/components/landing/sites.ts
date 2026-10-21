import { getTemplateThumbnail } from '../../catalog/thumbnails'

export interface ShowcaseSite {
  id: string
  label: string
  category: string
  src: string
}

const picks: Array<Omit<ShowcaseSite, 'src'>> = [
  { id: 'restaurant', label: 'Hearth Table', category: 'Restaurant' },
  { id: 'creative', label: 'Studio North', category: 'Agency' },
  { id: 'photography', label: 'Lens Studio', category: 'Portfolio' },
  { id: 'realtor', label: 'Harbor Homes', category: 'Real Estate' },
  { id: 'boutique', label: 'Maison Atelier', category: 'Fashion' },
  { id: 'medical', label: 'Harmony Clinic', category: 'Healthcare' },
  { id: 'lawfirm', label: 'Hale & Mercer', category: 'Consulting' },
  { id: 'business', label: 'Meridian Consulting', category: 'Local Business' },
  { id: 'coffee', label: 'Origin Coffee House', category: 'Cafe' },
  { id: 'hotel', label: 'Skyline Hotel', category: 'Hospitality' },
  { id: 'axiom', label: 'Northline Audit', category: 'Architecture' },
  { id: 'fitness', label: 'Pulse House', category: 'Wellness' },
  { id: 'salon', label: 'Lumen Salon', category: 'Beauty' },
  { id: 'noir', label: 'Noir Atelier', category: 'Editorial' },
]

export function showcaseSites(): ShowcaseSite[] {
  return picks
    .map((item) => {
      const src = getTemplateThumbnail(item.id)
      return src ? { ...item, src } : null
    })
    .filter((item): item is ShowcaseSite => Boolean(item))
}

export function siteByCategory(category: string) {
  return showcaseSites().find((site) => site.category === category) ?? showcaseSites()[0]
}

export const SHOWCASE_CATEGORIES = [
  'Restaurant',
  'Agency',
  'Portfolio',
  'Real Estate',
  'Fashion',
  'Healthcare',
  'Consulting',
  'Local Business',
]
