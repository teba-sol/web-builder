import { getTemplateThumbnail } from '../../catalog/thumbnails'

export interface ShowcaseSite {
  id: string
  label: string
  category: string
  src: string
}

const picks: Array<Omit<ShowcaseSite, 'src'>> = [
  { id: 'restaurant', label: 'Maison Olive', category: 'Restaurant' },
  { id: 'creative', label: 'North Studio', category: 'Agency' },
  { id: 'photography', label: 'Lens Studio', category: 'Portfolio' },
  { id: 'realtor', label: 'Harbor Estates', category: 'Real Estate' },
  { id: 'boutique', label: 'Atelier Noir', category: 'Fashion' },
  { id: 'medical', label: 'Harbor Clinic', category: 'Healthcare' },
  { id: 'lawfirm', label: 'Wright & Co', category: 'Consulting' },
  { id: 'business', label: 'Field & Co', category: 'Local Business' },
  { id: 'coffee', label: 'Sunday Brew', category: 'Cafe' },
  { id: 'hotel', label: 'Grand Luxe', category: 'Hospitality' },
  { id: 'axiom', label: 'Atelier North', category: 'Architecture' },
  { id: 'fitness', label: 'Form Atelier', category: 'Wellness' },
  { id: 'salon', label: 'Orchid Room', category: 'Beauty' },
  { id: 'noir', label: 'Noir House', category: 'Editorial' },
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
