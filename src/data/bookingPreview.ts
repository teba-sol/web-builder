import {
  formatMoney,
  parseAmenities,
  parseRoomInt,
  parseRoomPrice,
  stayNights,
} from './hospitality'
import type { RoomTypeItem } from '../types'

export type PreviewReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'

export interface PreviewRoomUnit {
  id: string
  roomTypeSlug: string
  code: string
  status: 'available' | 'maintenance' | 'out_of_service'
}

export interface PreviewReservation {
  id: string
  confirmationCode: string
  roomTypeSlug: string
  roomUnitId: string | null
  checkIn: string
  checkOut: string
  adults: number
  children: number
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests: string
  status: PreviewReservationStatus
  nightlyRate: number
  totalPrice: number
  currency: string
  createdAt: string
}

const BLOCKING: PreviewReservationStatus[] = ['pending', 'confirmed', 'checked_in']

function storageKey(siteKey: string): string {
  return `webbuilder-preview-reservations:${siteKey}`
}

export function loadPreviewReservations(siteKey: string): PreviewReservation[] {
  try {
    const raw = sessionStorage.getItem(storageKey(siteKey))
    if (!raw) return []
    return JSON.parse(raw) as PreviewReservation[]
  } catch {
    return []
  }
}

export function savePreviewReservations(siteKey: string, items: PreviewReservation[]): void {
  sessionStorage.setItem(storageKey(siteKey), JSON.stringify(items))
}

export function buildPreviewUnits(roomTypes: RoomTypeItem[]): PreviewRoomUnit[] {
  const units: PreviewRoomUnit[] = []
  for (const rt of roomTypes.filter((r) => r.isActive && r.name)) {
    const count = Math.max(1, parseRoomInt(rt.unitCount, 1))
    const prefix = rt.unitPrefix || 'RM-'
    for (let i = 1; i <= count; i++) {
      units.push({
        id: `${rt.slug}-${i}`,
        roomTypeSlug: rt.slug,
        code: `${prefix}${100 + i}`,
        status: 'available',
      })
    }
  }
  return units
}

function datesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return aIn < bOut && aOut > bIn
}

export function isUnitAvailable(
  unitId: string,
  checkIn: string,
  checkOut: string,
  reservations: PreviewReservation[],
  ignoreReservationId?: string,
): boolean {
  return !reservations.some(
    (r) =>
      r.roomUnitId === unitId &&
      r.id !== ignoreReservationId &&
      BLOCKING.includes(r.status) &&
      datesOverlap(checkIn, checkOut, r.checkIn, r.checkOut),
  )
}

/** Leaf types bookable directly; parent types also count subtype inventory. */
export function getBookableTypeSlugs(roomTypes: RoomTypeItem[], selectedSlug: string): string[] {
  const children = roomTypes
    .filter((r) => r.parentSlug === selectedSlug && r.isActive)
    .map((r) => r.slug)
  return [selectedSlug, ...children]
}

export function countAvailableUnits(
  roomTypeSlug: string,
  checkIn: string,
  checkOut: string,
  roomTypes: RoomTypeItem[],
  units: PreviewRoomUnit[],
  reservations: PreviewReservation[],
): number {
  const slugs = new Set(getBookableTypeSlugs(roomTypes, roomTypeSlug))
  return units.filter(
    (u) =>
      slugs.has(u.roomTypeSlug) &&
      u.status === 'available' &&
      isUnitAvailable(u.id, checkIn, checkOut, reservations),
  ).length
}

export function findAvailableUnit(
  roomTypeSlug: string,
  checkIn: string,
  checkOut: string,
  roomTypes: RoomTypeItem[],
  units: PreviewRoomUnit[],
  reservations: PreviewReservation[],
): PreviewRoomUnit | null {
  const slugs = getBookableTypeSlugs(roomTypes, roomTypeSlug)
  for (const slug of slugs) {
    const match = units.find(
      (u) =>
        u.roomTypeSlug === slug &&
        u.status === 'available' &&
        isUnitAvailable(u.id, checkIn, checkOut, reservations),
    )
    if (match) return match
  }
  return null
}

export function roomTypeBySlug(roomTypes: RoomTypeItem[], slug: string): RoomTypeItem | undefined {
  return roomTypes.find((r) => r.slug === slug)
}

export function subtypesOf(roomTypes: RoomTypeItem[], parentSlug: string): RoomTypeItem[] {
  return roomTypes.filter((r) => r.parentSlug === parentSlug && r.isActive && r.name)
}

export function topLevelRoomTypes(roomTypes: RoomTypeItem[]): RoomTypeItem[] {
  return roomTypes.filter((r) => !r.parentSlug && r.isActive && r.name)
}

export function computeStayTotal(roomType: RoomTypeItem, checkIn: string, checkOut: string): {
  nights: number
  nightlyRate: number
  total: number
  currency: string
  label: string
} {
  const nights = stayNights(checkIn, checkOut)
  const nightlyRate = parseRoomPrice(roomType.basePrice)
  const total = nights * nightlyRate
  const currency = roomType.currency || 'USD'
  return {
    nights,
    nightlyRate,
    total,
    currency,
    label: nights
      ? `${formatMoney(total, currency)} (${nights} night${nights === 1 ? '' : 's'} × ${formatMoney(nightlyRate, currency)})`
      : formatMoney(nightlyRate, currency),
  }
}

export function guestCapacityOk(roomType: RoomTypeItem, adults: number, children: number): boolean {
  const maxA = parseRoomInt(roomType.maxAdults, 99)
  const maxC = parseRoomInt(roomType.maxChildren, 99)
  const maxO = parseRoomInt(roomType.maxOccupancy, maxA + maxC)
  if (adults < 1) return false
  if (adults > maxA) return false
  if (children > maxC) return false
  return adults + children <= maxO
}

export function amenitiesList(roomType: RoomTypeItem): string[] {
  return parseAmenities(roomType.amenities)
}

export function makeConfirmationCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

export function createPreviewReservation(input: {
  siteKey: string
  roomType: RoomTypeItem
  unit: PreviewRoomUnit
  checkIn: string
  checkOut: string
  adults: number
  children: number
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests: string
}): PreviewReservation {
  const pricing = computeStayTotal(input.roomType, input.checkIn, input.checkOut)
  const reservation: PreviewReservation = {
    id: `prv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    confirmationCode: makeConfirmationCode(),
    roomTypeSlug: input.roomType.slug,
    roomUnitId: input.unit.id,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    children: input.children,
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    guestPhone: input.guestPhone,
    specialRequests: input.specialRequests,
    status: 'confirmed',
    nightlyRate: pricing.nightlyRate,
    totalPrice: pricing.total,
    currency: pricing.currency,
    createdAt: new Date().toISOString(),
  }
  const all = loadPreviewReservations(input.siteKey)
  all.push(reservation)
  savePreviewReservations(input.siteKey, all)
  return reservation
}
