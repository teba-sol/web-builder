import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  amenitiesList,
  buildPreviewUnits,
  computeStayTotal,
  createPreviewReservation,
  guestCapacityOk,
  loadPreviewReservations,
  catalogueRoomTypes,
  roomTypeBySlug,
  unitsOfType,
  type PreviewReservation,
} from '../../data/bookingPreview'
import { formatMoney, parseRoomPrice } from '../../data/hospitality'
import { addDays, localToday, readChildAges, stayQueryString, staySearchErrors } from '../../data/staySearch'
import { sitePath } from '../../data/siteNav'
import type { SiteContent, TemplateId } from '../../types'
import type { TemplateTheme } from '../themes'

interface BookingProps {
  content: SiteContent
  basePath: string
  theme: TemplateTheme
  templateId: TemplateId
  accent: string
}

function siteKey(templateId: TemplateId, businessName: string): string {
  return `${templateId}:${businessName || 'site'}`
}

function StaySearch({
  checkIn,
  checkOut,
  adults,
  children,
  childAges,
  onCheckIn,
  onCheckOut,
  onAdults,
  onChildren,
  onChildAge,
  onSubmit,
  accent,
  label,
}: {
  checkIn: string
  checkOut: string
  adults: number
  children: number
  childAges: string[]
  onCheckIn: (value: string) => void
  onCheckOut: (value: string) => void
  onAdults: (value: number) => void
  onChildren: (value: number) => void
  onChildAge: (index: number, value: string) => void
  onSubmit: (event: FormEvent) => void
  accent: string
  label: string
}) {
  const today = localToday()
  const minOut = checkIn >= today ? addDays(checkIn, 1) : addDays(today, 1)
  const ageCount = Math.max(0, Math.min(10, children))
  return (
    <form onSubmit={onSubmit} className="grid items-end gap-4 rounded-2xl border bg-white p-5 shadow-sm cmd:grid-cols-2 clg:grid-cols-6">
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-in</span>
        <input type="date" required min={today} value={checkIn} onChange={(event) => onCheckIn(event.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-out</span>
        <input type="date" required min={minOut} value={checkOut} onChange={(event) => onCheckOut(event.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Adults</span>
        <input type="number" min={1} max={20} required value={adults} onChange={(event) => onAdults(Number(event.target.value))} className="w-full rounded-lg border px-3 py-2.5" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Children</span>
        <input type="number" min={0} max={10} required value={children} onChange={(event) => onChildren(Number(event.target.value))} className="w-full rounded-lg border px-3 py-2.5" />
      </label>
      <button type="submit" className="rounded-lg px-5 py-3 font-semibold text-white" style={{ backgroundColor: accent }}>
        {label}
      </button>
      <p className="text-xs text-slate-500 clg:col-span-6">Children are 17 or younger. Guests 18 and older count as adults.</p>
      {Array.from({ length: ageCount }, (_, index) => (
        <label key={index} className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Child {index + 1} age</span>
          <input
            type="number"
            min={0}
            max={17}
            required
            value={childAges[index] ?? ''}
            onChange={(event) => onChildAge(index, event.target.value)}
            className="w-full rounded-lg border px-3 py-2.5"
          />
        </label>
      ))}
    </form>
  )
}

function useStayDraft() {
  const [params] = useSearchParams()
  const initialChildren = Number(params.get('children') || 0)
  const [checkIn, setCheckIn] = useState(params.get('check_in') || addDays(localToday(), 1))
  const [checkOut, setCheckOut] = useState(params.get('check_out') || addDays(localToday(), 3))
  const [adults, setAdults] = useState(Number(params.get('adults') || 2))
  const [children, setChildCount] = useState(Number.isFinite(initialChildren) ? initialChildren : 0)
  const [childAges, setChildAges] = useState(() => readChildAges(params, Number.isFinite(initialChildren) ? initialChildren : 0))
  function setChildren(count: number) {
    const next = Number.isFinite(count) ? count : 0
    setChildCount(next)
    setChildAges((current) => Array.from({ length: Math.max(0, Math.min(10, next)) }, (_, index) => current[index] ?? ''))
  }
  function setChildAge(index: number, value: string) {
    setChildAges((current) => {
      const next = current.slice()
      next[index] = value
      return next
    })
  }
  return { params, checkIn, setCheckIn, checkOut, setCheckOut, adults, setAdults, children, setChildren, childAges, setChildAge }
}

export function RoomsPage({ content: c, basePath, theme: t, templateId, accent }: BookingProps) {
  const navigate = useNavigate()
  const draft = useStayDraft()
  const submitted = draft.params.has('check_in')
  const checkIn = draft.params.get('check_in') || draft.checkIn
  const checkOut = draft.params.get('check_out') || draft.checkOut
  const adults = Number(draft.params.get('adults') || draft.adults)
  const children = Number(draft.params.get('children') || draft.children)
  const childAges = submitted ? readChildAges(draft.params, children) : draft.childAges
  const searchErrors = submitted ? staySearchErrors({ checkIn, checkOut, adults, children, childAges }) : []
  const searched = submitted && searchErrors.length === 0
  const units = useMemo(() => buildPreviewUnits(c.roomTypes), [c.roomTypes])
  const [reservations] = useState(() => loadPreviewReservations(siteKey(templateId, c.businessName)))
  const [error, setError] = useState('')
  const cards = useMemo(() => {
    const active = catalogueRoomTypes(c.roomTypes)
    if (!searched || checkIn >= checkOut) return active.map((room) => ({ room, units: [] as ReturnType<typeof unitsOfType> }))
    return active
      .filter((room) => guestCapacityOk(room, adults, children))
      .map((room) => ({ room, units: unitsOfType(room.slug, checkIn, checkOut, units, reservations) }))
      .filter((card) => card.units.length > 0)
  }, [searched, checkIn, checkOut, adults, children, c.roomTypes, units, reservations])

  const query = searched ? `?${stayQueryString({ checkIn, checkOut, adults, children, childAges })}` : ''

  return (
    <section className={`${t.sectionAlt || t.section} py-12`}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <div className="mb-8 max-w-3xl">
          <h1 className={`${t.sectionTitle} text-4xl`}>{c.roomsSectionTitle || 'Rooms & Suites'}</h1>
          <p className={`${t.sectionSubtitle} mt-3 text-lg`}>{c.roomsSectionSubtitle || 'Choose dates and guests, then open a room to see what is free.'}</p>
        </div>
        <StaySearch
          checkIn={draft.checkIn}
          checkOut={draft.checkOut}
          adults={draft.adults}
          children={draft.children}
          childAges={draft.childAges}
          onCheckIn={draft.setCheckIn}
          onCheckOut={draft.setCheckOut}
          onAdults={draft.setAdults}
          onChildren={draft.setChildren}
          onChildAge={draft.setChildAge}
          accent={accent}
          label="Search"
          onSubmit={(event) => {
            event.preventDefault()
            const messages = staySearchErrors({
              checkIn: draft.checkIn,
              checkOut: draft.checkOut,
              adults: draft.adults,
              children: draft.children,
              childAges: draft.childAges,
            })
            if (messages.length) {
              setError(messages[0])
              return
            }
            setError('')
            navigate(`${sitePath(basePath, 'rooms')}?${stayQueryString({
              checkIn: draft.checkIn,
              checkOut: draft.checkOut,
              adults: draft.adults,
              children: draft.children,
              childAges: draft.childAges,
            })}`)
          }}
        />
        {error || searchErrors.length ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error || searchErrors[0]}</p> : null}
        <div className="mt-8 space-y-6">
          {cards.map(({ room, units: free }) => {
            const pricing = searched ? computeStayTotal(room, checkIn, checkOut) : null
            const amenities = amenitiesList(room).slice(0, 6)
            const parent = room.parentSlug ? roomTypeBySlug(c.roomTypes, room.parentSlug) : undefined
            return (
              <article key={room.slug} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="grid cmd:grid-cols-[320px_1fr]">
                  {room.image ? (
                    <Link to={sitePath(basePath, `rooms/${room.slug}${query}`)}>
                      <img src={room.image} alt="" className="h-56 w-full object-cover cmd:h-full" />
                    </Link>
                  ) : (
                    <div className="h-56 w-full bg-slate-100 cmd:h-full" />
                  )}
                  <div className="flex flex-col p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          <Link to={sitePath(basePath, `rooms/${room.slug}${query}`)} className="hover:underline">{room.name}</Link>
                        </h2>
                        {room.shortDescription ? <p className="mt-1 text-sm text-slate-500">{room.shortDescription}</p> : null}
                        {parent?.name ? <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">{parent.name}</p> : null}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold" style={{ color: accent }}>
                          {pricing ? formatMoney(pricing.total, pricing.currency) : formatMoney(parseRoomPrice(room.basePrice), room.currency)}
                        </p>
                        <p className="text-xs text-slate-500">{pricing ? `${pricing.nights} nights` : 'per night'}</p>
                      </div>
                    </div>
                    {room.description ? <p className="mt-4 leading-relaxed text-slate-600">{room.description}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
                      <span className="rounded-full bg-slate-100 px-3 py-1">Up to {room.maxAdults} adults</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">{room.maxChildren} children</span>
                      {room.bedConfiguration ? <span className="rounded-full bg-slate-100 px-3 py-1">{room.bedConfiguration}</span> : null}
                      {room.sizeSqm ? <span className="rounded-full bg-slate-100 px-3 py-1">{room.sizeSqm} m²</span> : null}
                      {amenities.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1">{item}</span>)}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className={searched ? 'text-sm font-medium text-emerald-700' : 'text-sm text-slate-500'}>
                        {searched ? `${free.length} room${free.length === 1 ? '' : 's'} available` : 'Search dates to see which rooms are free.'}
                      </p>
                      <Link to={sitePath(basePath, `rooms/${room.slug}${query}`)} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>
                        View room
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        {cards.length === 0 ? (
          <p className="mt-8 rounded-2xl border bg-white p-10 text-center text-slate-600">
            {searched ? 'No rooms are free for those dates and guests.' : 'Add room types in the editor to showcase your inventory.'}
          </p>
        ) : null}
      </div>
    </section>
  )
}

export function RoomDetailPage({ content: c, basePath, theme: t, templateId, accent }: BookingProps) {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const draft = useStayDraft()
  const type = roomTypeBySlug(c.roomTypes, slug)
  const submitted = draft.params.has('check_in')
  const checkIn = draft.params.get('check_in') || ''
  const checkOut = draft.params.get('check_out') || ''
  const adults = Number(draft.params.get('adults') || 2)
  const children = Number(draft.params.get('children') || 0)
  const childAges = submitted ? readChildAges(draft.params, children) : []
  const searchErrors = submitted ? staySearchErrors({ checkIn, checkOut, adults, children, childAges }) : []
  const searched = submitted && searchErrors.length === 0
  const units = useMemo(() => buildPreviewUnits(c.roomTypes), [c.roomTypes])
  const [reservations] = useState(() => loadPreviewReservations(siteKey(templateId, c.businessName)))
  const [error, setError] = useState('')
  if (!type) {
    return (
      <section className="py-20 text-center">
        <p className="text-slate-600">Room not found.</p>
        <Link to={sitePath(basePath, 'rooms')} className="mt-4 inline-block text-sm font-semibold" style={{ color: accent }}>← Back to rooms</Link>
      </section>
    )
  }
  const free = searched && checkIn < checkOut && guestCapacityOk(type, adults, children)
    ? unitsOfType(type.slug, checkIn, checkOut, units, reservations)
    : []
  const pricing = searched && checkIn < checkOut ? computeStayTotal(type, checkIn, checkOut) : null
  const amenities = amenitiesList(type)
  const parent = type.parentSlug ? roomTypeBySlug(c.roomTypes, type.parentSlug) : undefined
  const query = searched ? `?${stayQueryString({ checkIn, checkOut, adults, children, childAges })}` : ''

  return (
    <section className={`${t.section} py-12`}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <Link to={sitePath(basePath, `rooms${query}`)} className="text-sm text-slate-500 hover:underline">← All rooms</Link>
        <div className="mt-6 grid items-start gap-10 clg:grid-cols-2">
          <div>{type.image ? <img src={type.image} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg" /> : <div className="aspect-[4/3] w-full rounded-2xl bg-slate-100" />}</div>
          <div>
            {parent ? <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">{parent.name}</p> : null}
            <h1 className="text-4xl font-bold">{type.name}</h1>
            {type.shortDescription ? <p className="mt-2 text-slate-500">{type.shortDescription}</p> : null}
            <p className="mt-4 text-2xl font-bold" style={{ color: accent }}>
              {formatMoney(parseRoomPrice(type.basePrice), type.currency)} <span className="text-base font-normal text-slate-500">/ night</span>
            </p>
            {type.description ? <p className="mt-5 leading-relaxed text-slate-700">{type.description}</p> : null}
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-400">Sleeps</dt><dd className="font-medium">{type.maxAdults} adults · {type.maxChildren} children</dd></div>
              <div><dt className="text-slate-400">Maximum</dt><dd className="font-medium">{type.maxOccupancy} guests</dd></div>
              {type.bedConfiguration ? <div><dt className="text-slate-400">Beds</dt><dd className="font-medium">{type.bedConfiguration}</dd></div> : null}
              {type.sizeSqm ? <div><dt className="text-slate-400">Size</dt><dd className="font-medium">{type.sizeSqm} m²</dd></div> : null}
            </dl>
            {amenities.length ? (
              <ul className="mt-6 flex flex-wrap gap-2">{amenities.map((item) => <li key={item} className="rounded-full border px-3 py-1 text-sm">{item}</li>)}</ul>
            ) : null}
          </div>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-semibold">Check this room</h2>
          <p className="mb-4 mt-1 text-slate-600">Enter your dates and guests. Free rooms for this type are listed below.</p>
          <StaySearch
            checkIn={draft.checkIn}
            checkOut={draft.checkOut}
            adults={draft.adults}
            children={draft.children}
            childAges={draft.childAges}
            onCheckIn={draft.setCheckIn}
            onCheckOut={draft.setCheckOut}
            onAdults={draft.setAdults}
            onChildren={draft.setChildren}
            onChildAge={draft.setChildAge}
            accent={accent}
            label="Show available rooms"
            onSubmit={(event) => {
              event.preventDefault()
              const messages = staySearchErrors({
                checkIn: draft.checkIn,
                checkOut: draft.checkOut,
                adults: draft.adults,
                children: draft.children,
                childAges: draft.childAges,
              })
              if (messages.length) {
                setError(messages[0])
                return
              }
              setError('')
              navigate(`${sitePath(basePath, `rooms/${type.slug}`)}?${stayQueryString({
                checkIn: draft.checkIn,
                checkOut: draft.checkOut,
                adults: draft.adults,
                children: draft.children,
                childAges: draft.childAges,
              })}`)
            }}
          />
          {error || searchErrors.length ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error || searchErrors[0]}</p> : null}
        </div>
        <div className="mt-8">
          {searched ? (
            free.length && pricing ? (
              <div>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <h2 className="text-2xl font-semibold">Available rooms</h2>
                  <p className="text-sm text-slate-600">{free.length} free · {formatMoney(pricing.total, pricing.currency)} for {pricing.nights} night{pricing.nights === 1 ? '' : 's'}</p>
                </div>
                <ul className="space-y-3">
                  {free.map((unit) => (
                    <li key={unit.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-5">
                      <p className="text-lg font-semibold">Room {unit.code}</p>
                      <Link
                        to={sitePath(basePath, `book?room=${type.slug}&unit=${unit.id}&${stayQueryString({ checkIn, checkOut, adults, children, childAges })}`)}
                        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: accent }}
                      >
                        Reserve this room
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="rounded-2xl border bg-white p-8 text-slate-600">No rooms of this type are free for those dates and guests.</p>
            )
          ) : (
            <p className="rounded-2xl border bg-white p-8 text-slate-600">Search above to see the rooms that are free, then continue to checkout.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export function BookPage({ content: c, basePath, theme: t, templateId, accent }: BookingProps) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const slug = params.get('room') || ''
  const unitId = params.get('unit') || ''
  const checkIn = params.get('check_in') || ''
  const checkOut = params.get('check_out') || ''
  const adults = Number(params.get('adults') || 2)
  const children = Number(params.get('children') || 0)
  const childAges = readChildAges(params, children)
  const searchErrors = staySearchErrors({ checkIn, checkOut, adults, children, childAges })
  const type = roomTypeBySlug(c.roomTypes, slug)
  const key = siteKey(templateId, c.businessName)
  const units = useMemo(() => buildPreviewUnits(c.roomTypes), [c.roomTypes])
  const [reservations, setReservations] = useState(() => loadPreviewReservations(key))
  const [error, setError] = useState('')
  const ready = Boolean(type && searchErrors.length === 0)
  const free = ready && type ? unitsOfType(type.slug, checkIn, checkOut, units, reservations) : []
  const unit = free.find((item) => item.id === unitId) || free[0]
  const pricing = ready && type ? computeStayTotal(type, checkIn, checkOut) : null
  const capacityOk = type ? guestCapacityOk(type, adults, children) : false

  if (!ready || !type || !pricing || !capacityOk || !unit) {
    return (
      <section className="py-20 text-center">
        <p className="text-slate-600">{searchErrors[0] || 'Choose a room and dates before checkout.'}</p>
        <Link to={sitePath(basePath, 'rooms')} className="mt-4 inline-block text-sm font-semibold" style={{ color: accent }}>Browse rooms</Link>
      </section>
    )
  }

  return (
    <section className={`${t.sectionAlt || t.section} py-12`}>
      <div className="mx-auto max-w-5xl px-4 csm:px-6">
        <Link to={sitePath(basePath, `rooms/${type.slug}?${stayQueryString({ checkIn, checkOut, adults, children, childAges })}`)} className="text-sm text-slate-500 hover:underline">← Back to {type.name}</Link>
        <h1 className="mt-4 text-3xl font-bold">Checkout</h1>
        <p className="mt-2 text-slate-600">Guest details stay in this browser preview. The exported site saves them in its own database.</p>
        {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</p> : null}
        <div className="mt-8 grid items-start gap-8 clg:grid-cols-[1fr_320px]">
          <form
            className="space-y-4 rounded-2xl border bg-white p-6"
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              const guestName = String(data.get('guestName') || '')
              const guestEmail = String(data.get('guestEmail') || '')
              if (!guestName || !guestEmail) {
                setError('Name and email are required.')
                return
              }
              const reservation = createPreviewReservation({
                siteKey: key,
                roomType: type,
                unit,
                checkIn,
                checkOut,
                adults,
                children,
                childAges: childAges.map((age) => Number(age)),
                guestName,
                guestEmail,
                guestPhone: String(data.get('guestPhone') || ''),
                specialRequests: String(data.get('specialRequests') || ''),
              })
              setReservations(loadPreviewReservations(key))
              navigate(sitePath(basePath, `book/confirm/${reservation.confirmationCode}`))
            }}
          >
            <h2 className="text-lg font-semibold">Guest</h2>
            <label className="block text-sm"><span className="mb-1 block text-slate-500">Full name</span><input name="guestName" required className="w-full rounded-lg border px-3 py-2.5" /></label>
            <label className="block text-sm"><span className="mb-1 block text-slate-500">Email</span><input type="email" name="guestEmail" required className="w-full rounded-lg border px-3 py-2.5" /></label>
            <label className="block text-sm"><span className="mb-1 block text-slate-500">Phone</span><input name="guestPhone" className="w-full rounded-lg border px-3 py-2.5" /></label>
            <label className="block text-sm"><span className="mb-1 block text-slate-500">Special requests</span><textarea name="specialRequests" rows={3} className="w-full rounded-lg border px-3 py-2.5" /></label>
            <button type="submit" className="w-full rounded-lg px-4 py-3 font-semibold text-white" style={{ backgroundColor: accent }}>
              Confirm stay · {formatMoney(pricing.total, pricing.currency)}
            </button>
          </form>
          <aside className="rounded-2xl border bg-white p-6">
            {type.image ? <img src={type.image} alt="" className="mb-4 aspect-[16/10] w-full rounded-xl object-cover" /> : <div className="mb-4 aspect-[16/10] w-full rounded-xl bg-slate-100" />}
            <h2 className="text-xl font-semibold">{type.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Room {unit.code}</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Check-in</dt><dd>{checkIn}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Check-out</dt><dd>{checkOut}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Guests</dt><dd>{adults} adults · {children} children{children > 0 ? ` (${childAges.map((age) => `${age}y`).join(', ')})` : ''}</dd></div>
              <div className="flex justify-between gap-4 border-t pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="font-bold" style={{ color: accent }}>{formatMoney(pricing.total, pricing.currency)}</dd></div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function BookingConfirmPage({ content: c, basePath, theme: t, templateId, accent }: BookingProps) {
  const { code = '' } = useParams()
  const key = siteKey(templateId, c.businessName)
  const reservation = loadPreviewReservations(key).find((r) => r.confirmationCode === code) as
    | PreviewReservation
    | undefined
  const room = reservation ? roomTypeBySlug(c.roomTypes, reservation.roomTypeSlug) : undefined

  if (!reservation) {
    return (
      <section className="py-20 text-center">
        <p className="text-slate-600">Reservation not found in this preview session.</p>
        <Link to={sitePath(basePath, 'rooms')} className="mt-4 inline-block text-sm font-semibold" style={{ color: accent }}>
          Back to rooms
        </Link>
      </section>
    )
  }

  return (
    <section className={`${t.section} py-20`}>
      <div className="mx-auto max-w-xl px-6 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
          ✓
        </div>
        <h1 className="mb-2 text-3xl font-bold">You&apos;re booked</h1>
        <p className="mb-8 text-slate-600">Your reservation is confirmed (preview session).</p>
        <div className="space-y-3 rounded-2xl border bg-slate-50 p-6 text-left">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Confirmation</span>
            <span className="font-mono font-bold tracking-wider">{reservation.confirmationCode}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Room</span>
            <span className="font-medium">{room?.name || reservation.roomTypeSlug}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Check-in</span>
            <span>{reservation.checkIn}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Check-out</span>
            <span>{reservation.checkOut}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Guests</span>
            <span>
              {reservation.adults} adult{reservation.adults === 1 ? '' : 's'}
              {reservation.children ? `, ${reservation.children} child${reservation.children === 1 ? '' : 'ren'}${reservation.childAges?.length ? ` (${reservation.childAges.map((age) => `${age}y`).join(', ')})` : ''}` : ''}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Guest</span>
            <span>{reservation.guestName}</span>
          </div>
          <div className="flex justify-between gap-4 border-t pt-3">
            <span className="text-slate-500">Total</span>
            <span className="font-bold" style={{ color: accent }}>
              {formatMoney(reservation.totalPrice, reservation.currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Status</span>
            <span className="capitalize">{reservation.status.replace('_', ' ')}</span>
          </div>
        </div>
        <Link to={basePath} className="mt-8 inline-block text-sm font-semibold" style={{ color: accent }}>
          Back to home →
        </Link>
      </div>
    </section>
  )
}
