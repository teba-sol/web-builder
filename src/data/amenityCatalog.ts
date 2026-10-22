/** Default catalogs. The platform admin can add or remove names in BuildAura. */
export const HOTEL_AMENITIES = [
  'Wi-Fi',
  'Breakfast',
  'Restaurant',
  'Parking',
  'Pool',
  'Spa',
  'Gym',
  'Airport shuttle',
  'Generator backup',
  'Air conditioning',
  'Room service',
  'Bar',
  'Garden',
  'Laundry',
  'Concierge',
  'Pet friendly',
  'Business center',
  'Beach access',
] as const

export const ROOM_TYPE_AMENITIES = [
  'Wi-Fi',
  'Air conditioning',
  'Mini bar',
  'Smart TV',
  'Safe',
  'Balcony',
  'Sea view',
  'City view',
  'Bathtub',
  'Work desk',
  'Coffee maker',
  'Blackout curtains',
  'Rain shower',
  'Coffee',
  'Lounge',
  'Full bar',
  'Private terrace',
  'Dining room',
  'Sitting room',
  'Desk',
  'Robes',
  'Kitchenette',
  'Fireplace',
  'Heated floors',
  'Garden view',
  'Mountain view',
  'Washer',
  'Hair dryer',
  'Iron',
  'Soundproofing',
] as const

const ROOM_TYPE_SET = new Set<string>(ROOM_TYPE_AMENITIES)
const HOTEL_SET = new Set<string>(HOTEL_AMENITIES)

export function knownRoomAmenities(names: string[]): string[] {
  const seen = new Set<string>()
  const kept: string[] = []
  for (const name of names) {
    const trimmed = name.trim()
    if (!trimmed || !ROOM_TYPE_SET.has(trimmed) || seen.has(trimmed)) continue
    seen.add(trimmed)
    kept.push(trimmed)
  }
  return kept
}

export function knownHotelAmenities(names: string[]): string[] {
  const seen = new Set<string>()
  const kept: string[] = []
  for (const name of names) {
    const trimmed = name.trim()
    if (!trimmed || !HOTEL_SET.has(trimmed) || seen.has(trimmed)) continue
    seen.add(trimmed)
    kept.push(trimmed)
  }
  return kept
}
