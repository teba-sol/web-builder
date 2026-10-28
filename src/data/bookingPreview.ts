import {
  discountPercentOf,
  formatMoney,
  parseAmenities,
  parseRoomInt,
  parseRoomPrice,
  sellingAmount,
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

export type PreviewPaymentMethod = 'chapa' | 'sandbox' | 'card'

export interface PreviewRoomUnit {
  id: string
  roomTypeSlug: string
  code: string
  status: 'available' | 'booked' | 'inactive'
  smokingAllowed: boolean
}

export interface PreviewReservation {
  id: string
  confirmationCode: string
  roomTypeSlug: string
  roomUnitId: string | null
  roomUnitIds?: string[]
  roomUnitCodes?: string[]
  checkIn: string
  checkOut: string
  adults: number
  children: number
  childAges?: number[]
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests: string
  paymentMethod?: PreviewPaymentMethod
  paymentLast4?: string
  status: PreviewReservationStatus
  nightlyRate: number
  totalPrice: number
  currency: string
  breakfastSelected?: boolean
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
        smokingAllowed: i % 2 === 0,
      })
    }
  }
  return units
}

function datesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return aIn < bOut && aOut > bIn
}

export function reservationUnitIds(reservation: PreviewReservation): string[] {
  if (reservation.roomUnitIds && reservation.roomUnitIds.length) return reservation.roomUnitIds
  return reservation.roomUnitId ? [reservation.roomUnitId] : []
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
      reservationUnitIds(r).includes(unitId) &&
      r.id !== ignoreReservationId &&
      BLOCKING.includes(r.status) &&
      datesOverlap(checkIn, checkOut, r.checkIn, r.checkOut),
  )
}

export function getBookableTypeSlugs(_roomTypes: RoomTypeItem[], selectedSlug: string): string[] {
  return [selectedSlug]
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

export function unitsOfType(
  roomTypeSlug: string,
  checkIn: string,
  checkOut: string,
  units: PreviewRoomUnit[],
  reservations: PreviewReservation[],
): PreviewRoomUnit[] {
  return units.filter(
    (unit) =>
      unit.roomTypeSlug === roomTypeSlug &&
      unit.status === 'available' &&
      isUnitAvailable(unit.id, checkIn, checkOut, reservations),
  )
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

export function subtypesOf(_roomTypes: RoomTypeItem[], _parentSlug: string): RoomTypeItem[] {
  return []
}

export function topLevelRoomTypes(roomTypes: RoomTypeItem[]): RoomTypeItem[] {
  return roomTypes.filter((r) => r.isActive && r.name)
}

/** Active named types in editor order, including subtypes. */
export function catalogueRoomTypes(roomTypes: RoomTypeItem[]): RoomTypeItem[] {
  return roomTypes.filter((room) => room.isActive && room.name)
}

export function computeStayTotal(roomType: RoomTypeItem, checkIn: string, checkOut: string): {
  nights: number
  nightlyRate: number
  total: number
  currency: string
  label: string
} {
  const nights = stayNights(checkIn, checkOut)
  const nightlyRate = sellingAmount(parseRoomPrice(roomType.basePrice), discountPercentOf(roomType))
  const total = nights * nightlyRate
  const currency = roomType.currency || 'ETB'
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
  if (adults < 1) return false
  if (adults > maxA) return false
  if (children > maxC) return false
  return true
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
  units: PreviewRoomUnit[]
  checkIn: string
  checkOut: string
  adults: number
  children: number
  childAges?: number[]
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests: string
  paymentMethod?: PreviewPaymentMethod
  paymentLast4?: string
  breakfastSelected?: boolean
}): PreviewReservation {
  const pricing = computeStayTotal(input.roomType, input.checkIn, input.checkOut)
  const count = Math.max(1, input.units.length)
  const reservation: PreviewReservation = {
    id: `prv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    confirmationCode: makeConfirmationCode(),
    roomTypeSlug: input.roomType.slug,
    roomUnitId: input.units[0]?.id ?? null,
    roomUnitIds: input.units.map((unit) => unit.id),
    roomUnitCodes: input.units.map((unit) => unit.code),
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    children: input.children,
    childAges: input.childAges,
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    guestPhone: input.guestPhone,
    specialRequests: input.specialRequests,
    paymentMethod: input.paymentMethod,
    paymentLast4: input.paymentLast4,
    status: 'confirmed',
    nightlyRate: pricing.nightlyRate,
    totalPrice: Math.round(pricing.total * count * 100) / 100,
    currency: pricing.currency,
    breakfastSelected: input.roomType.freeBreakfast || Boolean(input.breakfastSelected),
    createdAt: new Date().toISOString(),
  }
  const all = loadPreviewReservations(input.siteKey)
  all.push(reservation)
  savePreviewReservations(input.siteKey, all)
  return reservation
}
