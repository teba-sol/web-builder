export const CHILD_AGE_MAX = 17
export const CHILDREN_MAX = 10

export function localToday(): string {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, (month || 1) - 1, day || 1)
  date.setDate(date.getDate() + days)
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`
}

export function readChildAges(params: URLSearchParams, children: number): string[] {
  const fromList = params.getAll('child_ages')
  const raw = fromList.length > 0 ? fromList : (params.get('child_ages') || '').split(',')
  const count = Math.max(0, Math.min(CHILDREN_MAX, children))
  return Array.from({ length: count }, (_, index) => (raw[index] ?? '').trim())
}

export function staySearchErrors(input: {
  checkIn: string
  checkOut: string
  adults: number
  children: number
  childAges: string[]
}): string[] {
  const today = localToday()
  const errors: string[] = []
  if (!input.checkIn || input.checkIn < today) {
    errors.push('Check-in cannot be before today.')
  }
  if (!input.checkOut || input.checkOut <= input.checkIn) {
    errors.push('Check-out must be after check-in.')
  } else if (input.checkOut < today) {
    errors.push('Check-out cannot be before today.')
  }
  if (!Number.isInteger(input.adults) || input.adults < 1 || input.adults > 20) {
    errors.push('Adults must be between 1 and 20.')
  }
  if (!Number.isInteger(input.children) || input.children < 0 || input.children > CHILDREN_MAX) {
    errors.push('Children must be between 0 and 10.')
  }
  if (input.children > 0 && input.children <= CHILDREN_MAX) {
    const ages = input.childAges.slice(0, input.children)
    if (ages.length < input.children || ages.some((age) => age === '')) {
      errors.push('Enter the age of each child.')
    }
    if (ages.some((age) => age !== '' && Number(age) > CHILD_AGE_MAX)) {
      errors.push('A child must be 17 or younger. Guests 18 and older count as adults.')
    }
    if (ages.some((age) => age !== '' && (!Number.isInteger(Number(age)) || Number(age) < 0))) {
      errors.push('Enter each child age as a whole number from 0 to 17.')
    }
  }
  return errors
}

export function stayQueryString(input: {
  checkIn: string
  checkOut: string
  adults: number
  children: number
  childAges: string[]
}): string {
  const params = new URLSearchParams()
  params.set('check_in', input.checkIn)
  params.set('check_out', input.checkOut)
  params.set('adults', String(input.adults))
  params.set('children', String(input.children))
  input.childAges.slice(0, input.children).forEach((age) => params.append('child_ages', age))
  return params.toString()
}
