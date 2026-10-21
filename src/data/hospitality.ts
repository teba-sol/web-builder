import { listManifests, templateHasFeature } from '../catalog/catalog'
import type { RoomTypeItem, TemplateId } from '../types'

/** Templates that ship with full room inventory + booking. */
export const HOSPITALITY_TEMPLATE_IDS: TemplateId[] = listManifests()
  .filter((manifest) => manifest.features.includes('hospitality'))
  .map((manifest) => manifest.id)

export function isHospitalityTemplate(id: TemplateId | null | undefined): boolean {
  return templateHasFeature(id, 'hospitality')
}

export function emptyRoomType(): RoomTypeItem {
  return {
    name: '',
    slug: '',
    parentSlug: '',
    description: '',
    shortDescription: '',
    basePrice: '100',
    currency: 'ETB',
    maxAdults: '2',
    maxChildren: '1',
    maxOccupancy: '3',
    bedConfiguration: '1 King',
    sizeSqm: '28',
    amenities: 'Wi-Fi, Air conditioning',
    image: '',
    unitCount: '2',
    unitPrefix: 'RM-',
    isActive: true,
  }
}

export function parseRoomPrice(price: string): number {
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function parseRoomInt(value: string, fallback = 0): number {
  const n = parseInt(String(value), 10)
  return Number.isFinite(n) ? n : fallback
}

export function parseAmenities(amenities: string): string[] {
  return amenities
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
}

export function formatMoney(amount: number, currency = 'ETB'): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'ETB',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(0)}`
  }
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + 'T12:00:00')
  const b = new Date(checkOut + 'T12:00:00')
  const ms = b.getTime() - a.getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

export function stayNights(checkIn: string, checkOut: string): number {
  return nightsBetween(checkIn, checkOut)
}

/** Default room catalogue shared across hospitality properties (override per template). */
export function defaultRoomTypesFor(templateId: TemplateId): RoomTypeItem[] {
  if (templateId === 'hotel') {
    return [
      {
        name: 'Deluxe Room',
        slug: 'deluxe-room',
        parentSlug: '',
        description:
          'Spacious city-view rooms with king beds, work desk, and marble bathrooms. Ideal for business and leisure travelers seeking comfort without compromise.',
        shortDescription: 'King bed · City view · 32 m²',
        basePrice: '8500',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        maxOccupancy: '3',
        bedConfiguration: '1 King',
        sizeSqm: '32',
        amenities: 'Wi-Fi, Mini bar, Smart TV, Rain shower, Ethiopian coffee, Safe',
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=80',
        unitCount: '8',
        unitPrefix: 'DLX-',
        isActive: true,
      },
      {
        name: 'Deluxe High Floor',
        slug: 'deluxe-high-floor',
        parentSlug: 'deluxe-room',
        description:
          'Same refined Deluxe layout on floors 18–24 with panoramic skyline views and complimentary club lounge access.',
        shortDescription: 'Skyline view · Club lounge · 32 m²',
        basePrice: '10500',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        maxOccupancy: '3',
        bedConfiguration: '1 King',
        sizeSqm: '32',
        amenities: 'Wi-Fi, Mini bar, Smart TV, Rain shower, Ethiopian coffee, Safe, Club lounge',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80',
        unitCount: '4',
        unitPrefix: 'DLX-H-',
        isActive: true,
      },
      {
        name: 'Executive Suite',
        slug: 'executive-suite',
        parentSlug: '',
        description:
          'Separate living area, dining nook, and spa-inspired bathroom. Perfect for extended stays and VIP guests.',
        shortDescription: 'Living room · 58 m² · Butler on request',
        basePrice: '18500',
        currency: 'ETB',
        maxAdults: '3',
        maxChildren: '2',
        maxOccupancy: '4',
        bedConfiguration: '1 King + sofa bed',
        sizeSqm: '58',
        amenities: 'Wi-Fi, Mini bar, Smart TV, Bathtub, Ethiopian coffee, Safe, Living room, Robes',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80',
        unitCount: '4',
        unitPrefix: 'EXE-',
        isActive: true,
      },
      {
        name: 'Presidential Suite',
        slug: 'presidential-suite',
        parentSlug: 'executive-suite',
        description:
          'Our signature residence: two bedrooms, private dining for eight, and a wraparound terrace overlooking the skyline.',
        shortDescription: '2 bedrooms · Terrace · 120 m²',
        basePrice: '42000',
        currency: 'ETB',
        maxAdults: '4',
        maxChildren: '2',
        maxOccupancy: '6',
        bedConfiguration: '2 Kings',
        sizeSqm: '120',
        amenities: 'Wi-Fi, Full bar, Smart TV, Jacuzzi, Private terrace, Butler, Dining room',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80',
        unitCount: '1',
        unitPrefix: 'PRES-',
        isActive: true,
      },
      {
        name: 'Twin Classic',
        slug: 'twin-classic',
        parentSlug: '',
        description: 'Two twin beds, efficient layout, and everything you need for a productive city stay.',
        shortDescription: '2 Twins · 28 m²',
        basePrice: '7200',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '0',
        maxOccupancy: '2',
        bedConfiguration: '2 Twins',
        sizeSqm: '28',
        amenities: 'Wi-Fi, Smart TV, Rain shower, Safe, Desk',
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&q=80',
        unitCount: '6',
        unitPrefix: 'TWN-',
        isActive: true,
      },
    ]
  }

  if (templateId === 'guesthouse') {
    return [
      {
        name: 'Garden Room',
        slug: 'garden-room',
        parentSlug: '',
        description:
          'Ground-floor rooms opening onto a private patio and herb garden. Handwoven linens and local ceramics throughout.',
        shortDescription: 'Patio · Garden view · 24 m²',
        basePrice: '4500',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        maxOccupancy: '3',
        bedConfiguration: '1 Queen',
        sizeSqm: '24',
        amenities: 'Wi-Fi, Garden patio, Breakfast included, Heated floors, Organic toiletries',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&q=80',
        unitCount: '3',
        unitPrefix: 'GRD-',
        isActive: true,
      },
      {
        name: 'Attic Nest',
        slug: 'attic-nest',
        parentSlug: '',
        description:
          'A cozy loft under timber beams with skylights and a reading nook. Ideal for couples seeking quiet.',
        shortDescription: 'Skylight loft · 20 m²',
        basePrice: '3800',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '0',
        maxOccupancy: '2',
        bedConfiguration: '1 Double',
        sizeSqm: '20',
        amenities: 'Wi-Fi, Skylight, Breakfast included, Reading nook, Organic toiletries',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80',
        unitCount: '2',
        unitPrefix: 'ATC-',
        isActive: true,
      },
      {
        name: 'Family Cottage',
        slug: 'family-cottage',
        parentSlug: 'garden-room',
        description:
          'A freestanding cottage with two bedrooms, kitchenette, and a fenced garden — perfect for families or longer stays.',
        shortDescription: '2 bedrooms · Kitchenette · 45 m²',
        basePrice: '7200',
        currency: 'ETB',
        maxAdults: '4',
        maxChildren: '2',
        maxOccupancy: '5',
        bedConfiguration: '1 Queen + 2 Twins',
        sizeSqm: '45',
        amenities: 'Wi-Fi, Kitchenette, Private garden, Breakfast included, Washer, Parking',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
        unitCount: '1',
        unitPrefix: 'COT-',
        isActive: true,
      },
    ]
  }

  if (templateId === 'alpine') {
    return [
      {
        name: 'Alpine Room',
        slug: 'alpine-room',
        parentSlug: '',
        description:
          'Timber-lined rooms with mountain views, heated floors, and a deep soaking tub for after the trek recovery.',
        shortDescription: 'Mountain view · Heated floors · 30 m²',
        basePrice: '9800',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        maxOccupancy: '3',
        bedConfiguration: '1 King',
        sizeSqm: '30',
        amenities: 'Wi-Fi, Heated floors, Soaking tub, Fireplace nook, Trek storage',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80',
        unitCount: '8',
        unitPrefix: 'ALP-',
        isActive: true,
      },
      {
        name: 'Alpine Room · Summit View',
        slug: 'alpine-summit-view',
        parentSlug: 'alpine-room',
        description: 'Corner alpine rooms with floor-to-ceiling glass framing the peak and a private sauna.',
        shortDescription: 'Peak view · Private sauna · 36 m²',
        basePrice: '12500',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        maxOccupancy: '3',
        bedConfiguration: '1 King',
        sizeSqm: '36',
        amenities: 'Wi-Fi, Private sauna, Heated floors, Mini bar, Robes',
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80',
        unitCount: '4',
        unitPrefix: 'SUM-',
        isActive: true,
      },
      {
        name: 'Chalet Suite',
        slug: 'chalet-suite',
        parentSlug: '',
        description: 'Two-level suite with living room fireplace, boot room, and balcony over the valley.',
        shortDescription: 'Fireplace · Balcony · 68 m²',
        basePrice: '18600',
        currency: 'ETB',
        maxAdults: '4',
        maxChildren: '2',
        maxOccupancy: '5',
        bedConfiguration: '1 King + sofa bed',
        sizeSqm: '68',
        amenities: 'Wi-Fi, Fireplace, Kitchenette, Boot room, Balcony, Trek desk',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80',
        unitCount: '3',
        unitPrefix: 'CHA-',
        isActive: true,
      },
    ]
  }

  if (templateId === 'ryokan') {
    return [
      {
        name: 'Courtyard Room',
        slug: 'washitsu',
        parentSlug: '',
        description:
          'A quiet courtyard room with a timber screen, garden view, and Seasonal dinner if you want it.',
        shortDescription: 'Woven · Garden view · 22 m²',
        basePrice: '6200',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        maxOccupancy: '3',
        bedConfiguration: 'Futon (2)',
        sizeSqm: '22',
        amenities: 'Cotton robe, Hot spring access, Tea set, Garden view, Seasonal dinner optional',
        image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=900&q=80',
        unitCount: '6',
        unitPrefix: 'WA-',
        isActive: true,
      },
      {
        name: 'Courtyard Room · Private Spring',
        slug: 'washitsu-private-onsen',
        parentSlug: 'washitsu',
        description: 'Courtyard suite with a private open-air bath and cedar interiors.',
        shortDescription: 'Private hot spring · Cedar bath · 28 m²',
        basePrice: '9800',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '0',
        maxOccupancy: '2',
        bedConfiguration: 'Futon (2)',
        sizeSqm: '28',
        amenities: 'Private open-air bath, Cotton robe, Tea set, Seasonal dinner, Garden',
        image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=80',
        unitCount: '3',
        unitPrefix: 'ON-',
        isActive: true,
      },
      {
        name: 'Main House Suite',
        slug: 'honkan-suite',
        parentSlug: '',
        description: 'Main-building suite combining woven living with a western bed and veranda over the pond.',
        shortDescription: 'Veranda · Pond · 40 m²',
        basePrice: '14500',
        currency: 'ETB',
        maxAdults: '3',
        maxChildren: '1',
        maxOccupancy: '4',
        bedConfiguration: '1 King + futon',
        sizeSqm: '40',
        amenities: 'Hot spring access, Veranda, Tea ceremony set, Seasonal dinner, Concierge',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&q=80',
        unitCount: '2',
        unitPrefix: 'HN-',
        isActive: true,
      },
    ]
  }

  if (templateId === 'jungle') {
    return [
      {
        name: 'Canopy Cabin',
        slug: 'canopy-cabin',
        parentSlug: '',
        description: 'Elevated timber cabin among the trees with mosquito netting, outdoor shower, and bird song.',
        shortDescription: 'Treehouse · Outdoor shower · 26 m²',
        basePrice: '6800',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        maxOccupancy: '3',
        bedConfiguration: '1 Queen',
        sizeSqm: '26',
        amenities: 'Wi-Fi, Outdoor shower, Fan, Mosquito net, Nature guide',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80',
        unitCount: '6',
        unitPrefix: 'CAB-',
        isActive: true,
      },
      {
        name: 'Canopy Cabin · River View',
        slug: 'canopy-river-view',
        parentSlug: 'canopy-cabin',
        description: 'River-facing cabin with wraparound deck and hammock.',
        shortDescription: 'River · Deck · 30 m²',
        basePrice: '8600',
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        maxOccupancy: '3',
        bedConfiguration: '1 Queen',
        sizeSqm: '30',
        amenities: 'River view, Deck, Outdoor shower, Hammock, Fan',
        image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=900&q=80',
        unitCount: '3',
        unitPrefix: 'RIV-',
        isActive: true,
      },
      {
        name: 'Treehouse Villa',
        slug: 'treehouse-villa',
        parentSlug: '',
        description: 'Multi-level villa in the canopy with living lounge, outdoor bath, and private guide.',
        shortDescription: 'Multi-level · 70 m²',
        basePrice: '16800',
        currency: 'ETB',
        maxAdults: '4',
        maxChildren: '2',
        maxOccupancy: '5',
        bedConfiguration: '1 King + loft twins',
        sizeSqm: '70',
        amenities: 'Outdoor bath, Lounge, Private guide, Solar power, Deck',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80',
        unitCount: '2',
        unitPrefix: 'TRE-',
        isActive: true,
      },
    ]
  }

  // coastal / resort default
  return [
    {
      name: 'Lake View Suite',
      slug: 'sea-view-suite',
      parentSlug: '',
      description:
        'Whitewashed suite with floor-to-ceiling windows, private terrace, and an open view of the harbor.',
      shortDescription: 'Sea view · Terrace · 42 m²',
      basePrice: '9200',
      currency: 'ETB',
      maxAdults: '2',
      maxChildren: '1',
      maxOccupancy: '3',
      bedConfiguration: '1 King',
      sizeSqm: '42',
      amenities: 'Wi-Fi, Private terrace, Mini bar, Rain shower, Safe, Daily housekeeping',
      image: 'https://images.unsplash.com/photo-1582719508461-905c994771df?w=900&q=80',
      unitCount: '6',
      unitPrefix: 'SEA-',
      isActive: true,
    },
    {
      name: 'Sea View Suite · Plunge Pool',
      slug: 'sea-view-plunge-pool',
      parentSlug: 'sea-view-suite',
      description:
        'All the Sea View Suite comforts plus a private heated plunge pool on your terrace.',
      shortDescription: 'Plunge pool · Sea view · 48 m²',
      basePrice: '12800',
      currency: 'ETB',
      maxAdults: '2',
      maxChildren: '1',
      maxOccupancy: '3',
      bedConfiguration: '1 King',
      sizeSqm: '48',
      amenities: 'Wi-Fi, Plunge pool, Private terrace, Mini bar, Rain shower, Safe, Robes',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80',
      unitCount: '3',
      unitPrefix: 'SEA-P-',
      isActive: true,
    },
    {
      name: 'Cliff Villa',
      slug: 'cliff-villa',
      parentSlug: '',
      description:
        'Standalone villa carved into the cliff with infinity edge pool, outdoor dining, and concierge butler.',
      shortDescription: 'Private villa · Infinity pool · 95 m²',
      basePrice: '980',
      currency: 'ETB',
      maxAdults: '4',
      maxChildren: '2',
      maxOccupancy: '6',
      bedConfiguration: '2 Kings',
      sizeSqm: '95',
      amenities: 'Wi-Fi, Infinity pool, Full kitchen, Butler, Outdoor dining, Safe, Parking',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
      unitCount: '2',
      unitPrefix: 'VIL-',
      isActive: true,
    },
    {
      name: 'Garden Junior Suite',
      slug: 'garden-junior-suite',
      parentSlug: '',
      description: 'Quiet courtyard-facing junior suite with olive trees and morning sun.',
      shortDescription: 'Garden · 36 m²',
      basePrice: '310',
      currency: 'ETB',
      maxAdults: '2',
      maxChildren: '2',
      maxOccupancy: '3',
      bedConfiguration: '1 King or 2 Twins',
      sizeSqm: '36',
      amenities: 'Wi-Fi, Garden patio, Mini bar, Rain shower, Safe',
      image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=900&q=80',
      unitCount: '4',
      unitPrefix: 'GRN-',
      isActive: true,
    },
  ]
}
