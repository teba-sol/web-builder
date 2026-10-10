import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  amenitiesList,
  buildPreviewUnits,
  computeStayTotal,
  createPreviewReservation,
  guestCapacityOk,
  loadPreviewReservations,
  roomTypeBySlug,
  subtypesOf,
  topLevelRoomTypes,
  unitsOfType,
  type PreviewReservation,
} from '../../data/bookingPreview'
import { formatMoney, parseRoomPrice } from '../../data/hospitality'
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

function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function siteKey(templateId: TemplateId, businessName: string): string {
  return `${templateId}:${businessName || 'site'}`
}

function StaySearch({
  checkIn,
  checkOut,
  adults,
  children,
  onCheckIn,
  onCheckOut,
  onAdults,
  onChildren,
  onSubmit,
  accent,
  label,
}: {
  checkIn: string
  checkOut: string
  adults: number
  children: number
  onCheckIn: (value: string) => void
  onCheckOut: (value: string) => void
  onAdults: (value: number) => void
  onChildren: (value: number) => void
  onSubmit: (event: FormEvent) => void
  accent: string
  label: string
}) {
  return (
    <form onSubmit={onSubmit} className="grid items-end gap-4 rounded-2xl border bg-white p-5 shadow-sm cmd:grid-cols-5">
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-in</span>
        <input type="date" required value={checkIn} onChange={(event) => onCheckIn(event.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-out</span>
        <input type="date" required value={checkOut} onChange={(event) => onCheckOut(event.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Adults</span>
        <input type="number" min={1} max={20} value={adults} onChange={(event) => onAdults(Number(event.target.value))} className="w-full rounded-lg border px-3 py-2.5" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Children</span>
        <input type="number" min={0} max={20} value={children} onChange={(event) => onChildren(Number(event.target.value))} className="w-full rounded-lg border px-3 py-2.5" />
      </label>
      <button type="submit" className="rounded-lg px-5 py-3 font-semibold text-white" style={{ backgroundColor: accent }}>
        {label}
      </button>
    </form>
  )
}

function useStayDraft() {
  const [params] = useSearchParams()
  const [checkIn, setCheckIn] = useState(params.get('check_in') || todayPlus(1))
  const [checkOut, setCheckOut] = useState(params.get('check_out') || todayPlus(3))
  const [adults, setAdults] = useState(Number(params.get('adults') || 2))
  const [children, setChildren] = useState(Number(params.get('children') || 0))
  return { params, checkIn, setCheckIn, checkOut, setCheckOut, adults, setAdults, children, setChildren }
}

export function RoomsPage({ content: c, basePath, theme: t, templateId, accent }: BookingProps) {
  const navigate = useNavigate()
  const draft = useStayDraft()
  const searched = draft.params.has('check_in')
  const checkIn = draft.params.get('check_in') || draft.checkIn
  const checkOut = draft.params.get('check_out') || draft.checkOut
  const adults = Number(draft.params.get('adults') || draft.adults)
  const children = Number(draft.params.get('children') || draft.children)
  const units = useMemo(() => buildPreviewUnits(c.roomTypes), [c.roomTypes])
  const [reservations] = useState(() => loadPreviewReservations(siteKey(templateId, c.businessName)))
  const [error, setError] = useState('')
  const cards = useMemo(() => {
    const active = c.roomTypes.filter((room) => room.isActive && room.name)
    if (!searched || checkIn >= checkOut) return topLevelRoomTypes(c.roomTypes).map((room) => ({ room, units: [] as ReturnType<typeof unitsOfType> }))
    return active
      .filter((room) => guestCapacityOk(room, adults, children))
      .map((room) => ({ room, units: unitsOfType(room.slug, checkIn, checkOut, units, reservations) }))
      .filter((card) => card.units.length > 0)
  }, [searched, checkIn, checkOut, adults, children, c.roomTypes, units, reservations])

  const query = searched ? `?check_in=${checkIn}&check_out=${checkOut}&adults=${adults}&children=${children}` : ''

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
          onCheckIn={draft.setCheckIn}
          onCheckOut={draft.setCheckOut}
          onAdults={draft.setAdults}
          onChildren={draft.setChildren}
          accent={accent}
          label="Search"
          onSubmit={(event) => {
            event.preventDefault()
            if (draft.checkIn >= draft.checkOut) {
              setError('Check-out must be after check-in.')
              return
            }
            setError('')
            navigate(`${sitePath(basePath, 'rooms')}?check_in=${draft.checkIn}&check_out=${draft.checkOut}&adults=${draft.adults}&children=${draft.children}`)
          }}
        />
        {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</p> : null}
        <div className="mt-8 space-y-6">
          {cards.map(({ room, units: free }) => {
            const pricing = searched ? computeStayTotal(room, checkIn, checkOut) : null
            const amenities = amenitiesList(room).slice(0, 6)
            const kids = searched ? [] : subtypesOf(c.roomTypes, room.slug)
            return (
              <article key={room.slug} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="grid cmd:grid-cols-[320px_1fr]">
                  {room.image ? (
                    <Link to={sitePath(basePath, `rooms/${room.slug}${query}`)}>
                      <img src={room.image} alt="" className="h-56 w-full object-cover cmd:h-full" />
                    </Link>
                  ) : null}
                  <div className="flex flex-col p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          <Link to={sitePath(basePath, `rooms/${room.slug}${query}`)} className="hover:underline">{room.name}</Link>
                        </h2>
                        {room.shortDescription ? <p className="mt-1 text-sm text-slate-500">{room.shortDescription}</p> : null}
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
                    {kids.length ? (
                      <ul className="mt-4 space-y-1 border-t pt-4 text-sm">
                        {kids.map((child) => (
                          <li key={child.slug} className="flex justify-between gap-3">
                            <Link to={sitePath(basePath, `rooms/${child.slug}`)} className="font-medium hover:underline">{child.name}</Link>
                            <span className="text-slate-500">from {formatMoney(parseRoomPrice(child.basePrice), child.currency)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
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
  const searched = draft.params.has('check_in')
  const checkIn = draft.params.get('check_in') || ''
  const checkOut = draft.params.get('check_out') || ''
  const adults = Number(draft.params.get('adults') || 2)
  const children = Number(draft.params.get('children') || 0)
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
  const query = searched ? `?check_in=${checkIn}&check_out=${checkOut}&adults=${adults}&children=${children}` : ''

  return (
    <section className={`${t.section} py-12`}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <Link to={sitePath(basePath, `rooms${query}`)} className="text-sm text-slate-500 hover:underline">← All rooms</Link>
        <div className="mt-6 grid items-start gap-10 clg:grid-cols-2">
          <div>{type.image ? <img src={type.image} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg" /> : null}</div>
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
            onCheckIn={draft.setCheckIn}
            onCheckOut={draft.setCheckOut}
            onAdults={draft.setAdults}
            onChildren={draft.setChildren}
            accent={accent}
            label="Show available rooms"
            onSubmit={(event) => {
              event.preventDefault()
              if (draft.checkIn >= draft.checkOut) {
                setError('Check-out must be after check-in.')
                return
              }
              setError('')
              navigate(`${sitePath(basePath, `rooms/${type.slug}`)}?check_in=${draft.checkIn}&check_out=${draft.checkOut}&adults=${draft.adults}&children=${draft.children}`)
            }}
          />
          {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</p> : null}
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
                        to={sitePath(basePath, `book?room=${type.slug}&unit=${unit.id}&check_in=${checkIn}&check_out=${checkOut}&adults=${adults}&children=${children}`)}
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
  const type = roomTypeBySlug(c.roomTypes, slug)
  const key = siteKey(templateId, c.businessName)
  const units = useMemo(() => buildPreviewUnits(c.roomTypes), [c.roomTypes])
  const [reservations, setReservations] = useState(() => loadPreviewReservations(key))
  const [error, setError] = useState('')
  const ready = Boolean(type && checkIn && checkOut && checkIn < checkOut)
  const free = ready && type ? unitsOfType(type.slug, checkIn, checkOut, units, reservations) : []
  const unit = free.find((item) => item.id === unitId) || free[0]
  const pricing = ready && type ? computeStayTotal(type, checkIn, checkOut) : null
  const capacityOk = type ? guestCapacityOk(type, adults, children) : false

  if (!ready || !type || !pricing || !capacityOk || !unit) {
    return (
      <section className="py-20 text-center">
        <p className="text-slate-600">Choose a room and dates before checkout.</p>
        <Link to={sitePath(basePath, 'rooms')} className="mt-4 inline-block text-sm font-semibold" style={{ color: accent }}>Browse rooms</Link>
      </section>
    )
  }

  return (
    <section className={`${t.sectionAlt || t.section} py-12`}>
      <div className="mx-auto max-w-5xl px-4 csm:px-6">
        <Link to={sitePath(basePath, `rooms/${type.slug}?check_in=${checkIn}&check_out=${checkOut}&adults=${adults}&children=${children}`)} className="text-sm text-slate-500 hover:underline">← Back to {type.name}</Link>
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
            {type.image ? <img src={type.image} alt="" className="mb-4 aspect-[16/10] w-full rounded-xl object-cover" /> : null}
            <h2 className="text-xl font-semibold">{type.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Room {unit.code}</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Check-in</dt><dd>{checkIn}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Check-out</dt><dd>{checkOut}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Guests</dt><dd>{adults} adults · {children} children</dd></div>
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
              {reservation.children ? `, ${reservation.children} child${reservation.children === 1 ? '' : 'ren'}` : ''}
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
