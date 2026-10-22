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
    description: '',
    basePrice: '100',
    discountPercent: '0',
    freeCancellation: false,
    freeBreakfast: false,
    currency: 'ETB',
    maxAdults: '2',
    maxChildren: '1',
    bedConfiguration: '1 King',
    sizeSqm: '28',
    amenities: 'Wi-Fi, Air conditioning',
    photos: [],
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

export function coverPhoto(room: { photos?: string[] }): string {
  return room.photos?.find((photo) => photo.trim()) ?? ''
}

export function discountPercentOf(room: { discountPercent?: string }): number {
  const value = parseRoomPrice(room.discountPercent || '0')
  return Math.min(100, Math.max(0, value))
}

export function sellingAmount(base: number, percent: number): number {
  const bounded = Math.min(100, Math.max(0, percent))
  return Math.round(base * (100 - bounded)) / 100
}

export function stayCurrency(value: string | undefined | null): 'ETB' | 'USD' {
  const code = (value ?? '').toUpperCase().replace(/[^A-Z]/g, '')
  if (code === 'USD' || code === 'USDT' || code === 'US') return 'USD'
  return 'ETB'
}

export function otherCurrencyLabel(amount: number, currency: string, rate: number): string | null {
  if (rate <= 0 || amount <= 0) return null
  if (stayCurrency(currency) === 'USD') return formatMoney(amount * rate, 'ETB')
  return formatMoney(amount / rate, 'USD')
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
        description:
          'Spacious city-view rooms with king beds, work desk, and marble bathrooms. Ideal for business and leisure travelers seeking comfort without compromise.',
        basePrice: '8500',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        bedConfiguration: '1 King',
        sizeSqm: '32',
        amenities: 'Wi-Fi, Mini bar, Smart TV, Rain shower, Coffee, Safe',
        photos: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=80'],
        unitCount: '8',
        unitPrefix: 'DLX-',
        isActive: true,
      },
      {
        name: 'Deluxe High Floor',
        slug: 'deluxe-high-floor',
        description:
          'Same refined Deluxe layout on floors 18–24 with panoramic skyline views and complimentary club lounge access.',
        basePrice: '10500',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        bedConfiguration: '1 King',
        sizeSqm: '32',
        amenities: 'Wi-Fi, Mini bar, Smart TV, Rain shower, Coffee, Safe, Lounge',
        photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80'],
        unitCount: '4',
        unitPrefix: 'DLX-H-',
        isActive: true,
      },
      {
        name: 'Executive Suite',
        slug: 'executive-suite',
        description:
          'Separate living area, dining nook, and spa-inspired bathroom. Perfect for extended stays and VIP guests.',
        basePrice: '18500',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '3',
        maxChildren: '2',
        bedConfiguration: '1 King + sofa bed',
        sizeSqm: '58',
        amenities: 'Wi-Fi, Mini bar, Smart TV, Bathtub, Coffee, Safe, Robes',
        photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80'],
        unitCount: '4',
        unitPrefix: 'EXE-',
        isActive: true,
      },
      {
        name: 'Presidential Suite',
        slug: 'presidential-suite',
        description:
          'Our signature residence: two bedrooms, private dining for eight, and a wraparound terrace overlooking the skyline.',
        basePrice: '42000',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '4',
        maxChildren: '2',
        bedConfiguration: '2 Kings',
        sizeSqm: '120',
        amenities: 'Wi-Fi, Full bar, Smart TV, Private terrace, Dining room',
        photos: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80'],
        unitCount: '1',
        unitPrefix: 'PRES-',
        isActive: true,
      },
      {
        name: 'Twin Classic',
        slug: 'twin-classic',
        description: 'Two twin beds, efficient layout, and everything you need for a productive city stay.',
        basePrice: '7200',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '0',
        bedConfiguration: '2 Twins',
        sizeSqm: '28',
        amenities: 'Wi-Fi, Smart TV, Rain shower, Safe, Desk',
        photos: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&q=80'],
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
        description:
          'Ground-floor rooms opening onto a private patio and herb garden. Handwoven linens and local ceramics throughout.',
        basePrice: '4500',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        bedConfiguration: '1 Queen',
        sizeSqm: '24',
        amenities: 'Wi-Fi, Heated floors, Garden view',
        photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&q=80'],
        unitCount: '3',
        unitPrefix: 'GRD-',
        isActive: true,
      },
      {
        name: 'Attic Nest',
        slug: 'attic-nest',
        description:
          'A cozy loft under timber beams with skylights and a reading nook. Ideal for couples seeking quiet.',
        basePrice: '3800',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '0',
        bedConfiguration: '1 Double',
        sizeSqm: '20',
        amenities: 'Wi-Fi, Garden view',
        photos: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80'],
        unitCount: '2',
        unitPrefix: 'ATC-',
        isActive: true,
      },
      {
        name: 'Family Cottage',
        slug: 'family-cottage',
        description:
          'A freestanding cottage with two bedrooms, kitchenette, and a fenced garden — perfect for families or longer stays.',
        basePrice: '7200',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '4',
        maxChildren: '2',
        bedConfiguration: '1 Queen + 2 Twins',
        sizeSqm: '45',
        amenities: 'Wi-Fi, Kitchenette, Washer',
        photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80'],
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
        description:
          'Timber-lined rooms with mountain views, heated floors, and a deep soaking tub for after the trek recovery.',
        basePrice: '9800',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        bedConfiguration: '1 King',
        sizeSqm: '30',
        amenities: 'Wi-Fi, Heated floors, Fireplace, Mountain view',
        photos: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80'],
        unitCount: '8',
        unitPrefix: 'ALP-',
        isActive: true,
      },
      {
        name: 'Alpine Room · Summit View',
        slug: 'alpine-summit-view',
        description: 'Corner alpine rooms with floor-to-ceiling glass framing the peak and a private sauna.',
        basePrice: '12500',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        bedConfiguration: '1 King',
        sizeSqm: '36',
        amenities: 'Wi-Fi, Heated floors, Mini bar, Robes, Mountain view',
        photos: ['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80'],
        unitCount: '4',
        unitPrefix: 'SUM-',
        isActive: true,
      },
      {
        name: 'Chalet Suite',
        slug: 'chalet-suite',
        description: 'Two-level suite with living room fireplace, boot room, and balcony over the valley.',
        basePrice: '18600',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '4',
        maxChildren: '2',
        bedConfiguration: '1 King + sofa bed',
        sizeSqm: '68',
        amenities: 'Wi-Fi, Fireplace, Kitchenette, Balcony',
        photos: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80'],
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
        description:
          'A quiet courtyard room with a timber screen, garden view, and Seasonal dinner if you want it.',
        basePrice: '6200',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        bedConfiguration: 'Futon (2)',
        sizeSqm: '22',
        amenities: 'Garden view, Robes',
        photos: ['https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=900&q=80'],
        unitCount: '6',
        unitPrefix: 'WA-',
        isActive: true,
      },
      {
        name: 'Courtyard Room · Private Spring',
        slug: 'washitsu-private-onsen',
        description: 'Courtyard suite with a private open-air bath and cedar interiors.',
        basePrice: '9800',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '0',
        bedConfiguration: 'Futon (2)',
        sizeSqm: '28',
        amenities: 'Garden view, Robes',
        photos: ['https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=80'],
        unitCount: '3',
        unitPrefix: 'ON-',
        isActive: true,
      },
      {
        name: 'Main House Suite',
        slug: 'honkan-suite',
        description: 'Main-building suite combining woven living with a western bed and veranda over the pond.',
        basePrice: '14500',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '3',
        maxChildren: '1',
        bedConfiguration: '1 King + futon',
        sizeSqm: '40',
        amenities: 'Garden view, Balcony',
        photos: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&q=80'],
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
        description: 'Elevated timber cabin among the trees with mosquito netting, outdoor shower, and bird song.',
        basePrice: '6800',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        bedConfiguration: '1 Queen',
        sizeSqm: '26',
        amenities: 'Wi-Fi, Garden view',
        photos: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80'],
        unitCount: '6',
        unitPrefix: 'CAB-',
        isActive: true,
      },
      {
        name: 'Canopy Cabin · River View',
        slug: 'canopy-river-view',
        description: 'River-facing cabin with wraparound deck and hammock.',
        basePrice: '8600',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '2',
        maxChildren: '1',
        bedConfiguration: '1 Queen',
        sizeSqm: '30',
        amenities: 'Wi-Fi, Balcony',
        photos: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=900&q=80'],
        unitCount: '3',
        unitPrefix: 'RIV-',
        isActive: true,
      },
      {
        name: 'Treehouse Villa',
        slug: 'treehouse-villa',
        description: 'Multi-level villa in the canopy with living lounge, outdoor bath, and private guide.',
        basePrice: '16800',
        discountPercent: '0',
        freeCancellation: false,
        freeBreakfast: false,
        currency: 'ETB',
        maxAdults: '4',
        maxChildren: '2',
        bedConfiguration: '1 King + loft twins',
        sizeSqm: '70',
        amenities: 'Wi-Fi, Lounge, Balcony',
        photos: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80'],
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
      description:
        'Whitewashed suite with floor-to-ceiling windows, private terrace, and an open view of the harbor.',
      basePrice: '9200',
      discountPercent: '0',
      freeCancellation: false,
      freeBreakfast: false,
      currency: 'ETB',
      maxAdults: '2',
      maxChildren: '1',
      bedConfiguration: '1 King',
      sizeSqm: '42',
      amenities: 'Wi-Fi, Private terrace, Mini bar, Rain shower, Safe',
      photos: ['https://images.unsplash.com/photo-1582719508461-905c994771df?w=900&q=80'],
      unitCount: '6',
      unitPrefix: 'SEA-',
      isActive: true,
    },
    {
      name: 'Sea View Suite · Plunge Pool',
      slug: 'sea-view-plunge-pool',
      description:
        'All the Sea View Suite comforts plus a private heated plunge pool on your terrace.',
      basePrice: '12800',
      discountPercent: '0',
      freeCancellation: false,
      freeBreakfast: false,
      currency: 'ETB',
      maxAdults: '2',
      maxChildren: '1',
      bedConfiguration: '1 King',
      sizeSqm: '48',
      amenities: 'Wi-Fi, Private terrace, Mini bar, Rain shower, Safe, Robes',
      photos: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80'],
      unitCount: '3',
      unitPrefix: 'SEA-P-',
      isActive: true,
    },
    {
      name: 'Cliff Villa',
      slug: 'cliff-villa',
      description:
        'Standalone villa carved into the cliff with infinity edge pool, outdoor dining, and concierge butler.',
      basePrice: '980',
      discountPercent: '0',
      freeCancellation: false,
      freeBreakfast: false,
      currency: 'ETB',
      maxAdults: '4',
      maxChildren: '2',
      bedConfiguration: '2 Kings',
      sizeSqm: '95',
      amenities: 'Wi-Fi, Full bar, Safe',
      photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80'],
      unitCount: '2',
      unitPrefix: 'VIL-',
      isActive: true,
    },
    {
      name: 'Garden Junior Suite',
      slug: 'garden-junior-suite',
      description: 'Quiet courtyard-facing junior suite with olive trees and morning sun.',
      basePrice: '310',
      discountPercent: '0',
      freeCancellation: false,
      freeBreakfast: false,
      currency: 'ETB',
      maxAdults: '2',
      maxChildren: '2',
      bedConfiguration: '1 King or 2 Twins',
      sizeSqm: '36',
      amenities: 'Wi-Fi, Mini bar, Rain shower, Safe, Garden view',
      photos: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=900&q=80'],
      unitCount: '4',
      unitPrefix: 'GRN-',
      isActive: true,
    },
  ]
}
