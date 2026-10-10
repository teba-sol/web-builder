import { getTemplateThumbnail } from '../../catalog/thumbnails'

export interface ShowcaseSite {
  id: string
  label: string
  category: string
  src: string
}

const picks: Array<Omit<ShowcaseSite, 'src'>> = [
  { id: 'restaurant', label: 'Kategna', category: 'Restaurant' },
  { id: 'creative', label: 'Studio Abay', category: 'Agency' },
  { id: 'photography', label: 'Lens Addis', category: 'Portfolio' },
  { id: 'realtor', label: 'Addis Homes', category: 'Real Estate' },
  { id: 'boutique', label: 'Sheba Atelier', category: 'Fashion' },
  { id: 'medical', label: 'Harmony Clinic', category: 'Healthcare' },
  { id: 'lawfirm', label: 'Haile & Bekele', category: 'Consulting' },
  { id: 'business', label: 'Abay Consulting', category: 'Local Business' },
  { id: 'coffee', label: 'Yirgacheffe House', category: 'Cafe' },
  { id: 'hotel', label: 'Bole Skyline Hotel', category: 'Hospitality' },
  { id: 'axiom', label: 'Abay Audit', category: 'Architecture' },
  { id: 'fitness', label: 'Bole Fit House', category: 'Wellness' },
  { id: 'salon', label: 'Lideta Salon', category: 'Beauty' },
  { id: 'noir', label: 'Saba Atelier', category: 'Editorial' },
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
