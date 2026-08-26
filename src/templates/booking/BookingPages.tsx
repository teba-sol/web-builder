import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  amenitiesList,
  buildPreviewUnits,
  computeStayTotal,
  countAvailableUnits,
  createPreviewReservation,
  findAvailableUnit,
  guestCapacityOk,
  loadPreviewReservations,
  roomTypeBySlug,
  subtypesOf,
  topLevelRoomTypes,
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

export function RoomsPage({ content: c, basePath, theme: t, accent }: BookingProps) {
  const types = topLevelRoomTypes(c.roomTypes)
  return (
    <section className={`${t.sectionAlt || t.section} py-16`}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <div className="mb-12 text-center">
          <h1 className={`${t.sectionTitle} text-4xl`}>{c.roomsSectionTitle || 'Rooms & Suites'}</h1>
          <p className={`${t.sectionSubtitle} mt-2`}>{c.roomsSectionSubtitle}</p>
          <Link
            to={sitePath(basePath, 'book')}
            className="mt-6 inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: accent }}
          >
            Check availability
          </Link>
        </div>
        <div className="grid gap-8 cmd:grid-cols-2">
          {types.map((type) => {
            const kids = subtypesOf(c.roomTypes, type.slug)
            return (
              <article key={type.slug} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                {type.image ? (
                  <Link to={sitePath(basePath, `rooms/${type.slug}`)}>
                    <img src={type.image} alt="" className="aspect-[16/10] w-full object-cover" />
                  </Link>
                ) : null}
                <div className="p-6">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        <Link to={sitePath(basePath, `rooms/${type.slug}`)} className="hover:underline">
                          {type.name}
                        </Link>
                      </h2>
                      {type.shortDescription ? (
                        <p className="mt-1 text-sm text-slate-500">{type.shortDescription}</p>
                      ) : null}
                    </div>
                    <p className="text-lg font-bold" style={{ color: accent }}>
                      {formatMoney(parseRoomPrice(type.basePrice), type.currency)}{' '}
                      <span className="text-sm font-normal text-slate-500">/ night</span>
                    </p>
                  </div>
                  <p className="mb-4 line-clamp-3 text-slate-600">{type.description}</p>
                  <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Up to {type.maxOccupancy} guests</span>
                    {type.bedConfiguration ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1">{type.bedConfiguration}</span>
                    ) : null}
                    {type.sizeSqm ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1">{type.sizeSqm} m²</span>
                    ) : null}
                  </div>
                  {kids.length > 0 ? (
                    <div className="mb-4 border-t pt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Options</p>
                      <ul className="space-y-2">
                        {kids.map((child) => (
                          <li key={child.slug} className="flex justify-between gap-3 text-sm">
                            <Link to={sitePath(basePath, `rooms/${child.slug}`)} className="font-medium hover:underline">
                              {child.name}
                            </Link>
                            <span className="shrink-0 text-slate-500">
                              from {formatMoney(parseRoomPrice(child.basePrice), child.currency)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <Link to={sitePath(basePath, `rooms/${type.slug}`)} className="text-sm font-semibold" style={{ color: accent }}>
                      View details →
                    </Link>
                    <Link to={sitePath(basePath, `book?room=${type.slug}`)} className="text-sm font-semibold text-slate-700">
                      Book this room →
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        {types.length === 0 ? (
          <p className="text-center text-slate-500">Add room types in the editor to showcase your inventory.</p>
        ) : null}
        <p className="mt-10 text-center text-xs text-slate-400">
          Preview mode — reservations are stored in this browser session only. Full booking + admin management is included in the Laravel export.
        </p>
      </div>
    </section>
  )
}

export function RoomDetailPage({ content: c, basePath, theme: t, accent }: BookingProps) {
  const { slug = '' } = useParams()
  const type = roomTypeBySlug(c.roomTypes, slug)
  if (!type) {
    return (
      <section className="py-20 text-center">
        <p className="text-slate-600">Room not found.</p>
        <Link to={sitePath(basePath, 'rooms')} className="mt-4 inline-block text-sm font-semibold" style={{ color: accent }}>
          ← Back to rooms
        </Link>
      </section>
    )
  }
  const kids = subtypesOf(c.roomTypes, type.slug)
  const parent = type.parentSlug ? roomTypeBySlug(c.roomTypes, type.parentSlug) : undefined
  const amenities = amenitiesList(type)

  return (
    <section className={`${t.section} py-12`}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <Link to={sitePath(basePath, 'rooms')} className="text-sm text-slate-500 hover:underline">
          ← All rooms
        </Link>
        <div className="mt-6 grid items-start gap-10 clg:grid-cols-2">
          <div>
            {type.image ? (
              <img src={type.image} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg" />
            ) : null}
          </div>
          <div>
            {parent ? <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">{parent.name}</p> : null}
            <h1 className="mb-2 text-4xl font-bold">{type.name}</h1>
            {type.shortDescription ? <p className="mb-4 text-slate-500">{type.shortDescription}</p> : null}
            <p className="mb-6 text-2xl font-bold" style={{ color: accent }}>
              {formatMoney(parseRoomPrice(type.basePrice), type.currency)}{' '}
              <span className="text-base font-normal text-slate-500">/ night</span>
            </p>
            <p className="mb-6 leading-relaxed text-slate-700">{type.description}</p>
            <dl className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-400">Occupancy</dt>
                <dd className="font-medium">
                  {type.maxAdults} adults · {type.maxChildren} children (max {type.maxOccupancy})
                </dd>
              </div>
              {type.bedConfiguration ? (
                <div>
                  <dt className="text-slate-400">Beds</dt>
                  <dd className="font-medium">{type.bedConfiguration}</dd>
                </div>
              ) : null}
              {type.sizeSqm ? (
                <div>
                  <dt className="text-slate-400">Size</dt>
                  <dd className="font-medium">{type.sizeSqm} m²</dd>
                </div>
              ) : null}
            </dl>
            {amenities.length ? (
              <div className="mb-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Amenities</h2>
                <ul className="flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <li key={a} className="rounded-full border px-3 py-1 text-sm">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {kids.length ? (
              <div className="mb-8 rounded-xl border p-4">
                <h2 className="mb-3 font-semibold">Available options</h2>
                <ul className="space-y-3">
                  {kids.map((child) => (
                    <li key={child.slug} className="flex justify-between gap-3 text-sm">
                      <Link to={sitePath(basePath, `rooms/${child.slug}`)} className="font-medium hover:underline">
                        {child.name}
                      </Link>
                      <span>
                        {formatMoney(parseRoomPrice(child.basePrice), child.currency)}/night
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Link
              to={sitePath(basePath, `book?room=${type.slug}`)}
              className="inline-block rounded-lg px-8 py-3 font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              Check availability & book
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function BookPage({ content: c, basePath, theme: t, templateId, accent }: BookingProps) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const key = siteKey(templateId, c.businessName)
  const units = useMemo(() => buildPreviewUnits(c.roomTypes), [c.roomTypes])
  const [reservations, setReservations] = useState(() => loadPreviewReservations(key))

  const [checkIn, setCheckIn] = useState(params.get('check_in') || todayPlus(1))
  const [checkOut, setCheckOut] = useState(params.get('check_out') || todayPlus(3))
  const [adults, setAdults] = useState(Number(params.get('adults') || 2))
  const [children, setChildren] = useState(Number(params.get('children') || 0))
  const [roomFilter, setRoomFilter] = useState(params.get('room') || '')
  const [searched, setSearched] = useState(Boolean(params.get('check_in') || params.get('room')))
  const [error, setError] = useState('')
  const results = useMemo(() => {
    if (!searched || !checkIn || !checkOut || checkIn >= checkOut) return []
    return c.roomTypes
      .filter((rt) => rt.isActive && rt.name)
      .filter((rt) => !roomFilter || rt.slug === roomFilter || rt.parentSlug === roomFilter)
      .filter((rt) => guestCapacityOk(rt, adults, children))
      .map((rt) => {
        const available = countAvailableUnits(rt.slug, checkIn, checkOut, c.roomTypes, units, reservations)
        const pricing = computeStayTotal(rt, checkIn, checkOut)
        return { rt, available, pricing }
      })
      .filter((r) => r.available > 0)
  }, [searched, checkIn, checkOut, adults, children, roomFilter, c.roomTypes, units, reservations])

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (checkIn >= checkOut) {
      setError('Check-out must be after check-in.')
      return
    }
    setSearched(true)
  }

  return (
    <section className={`${t.sectionAlt || t.section} py-16`}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <div className="mb-10 text-center">
          <h1 className={`${t.sectionTitle} text-4xl`}>{c.bookingSectionTitle || 'Book Your Stay'}</h1>
          <p className={`${t.sectionSubtitle} mt-2`}>{c.bookingSectionSubtitle}</p>
        </div>

        <form
          onSubmit={onSearch}
          className="mb-10 grid items-end gap-4 rounded-2xl border bg-white p-6 shadow-sm cmd:grid-cols-5"
        >
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-in</span>
            <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-out</span>
            <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Adults</span>
            <input type="number" min={1} max={20} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Children</span>
            <input type="number" min={0} max={20} value={children} onChange={(e) => setChildren(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Room type</span>
            <select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} className="w-full rounded-lg border px-3 py-2">
              <option value="">Any</option>
              {c.roomTypes.filter((r) => r.name).map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <div className="cmd:col-span-5">
            <button type="submit" className="rounded-lg px-6 py-3 font-semibold text-white" style={{ backgroundColor: accent }}>
              Search availability
            </button>
          </div>
        </form>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</div>
        ) : null}

        {searched ? (
          results.length ? (
            <div className="space-y-6">
              {results.map(({ rt, available, pricing }) => (
                <div key={rt.slug} className="flex flex-col gap-6 rounded-2xl border bg-white p-6 cmd:flex-row">
                  {rt.image ? (
                    <img src={rt.image} alt="" className="h-36 w-full shrink-0 rounded-xl object-cover cmd:w-48" />
                  ) : null}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{rt.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{rt.shortDescription}</p>
                    <p className="mt-2 text-sm font-medium text-emerald-700">
                      {available} room{available === 1 ? '' : 's'} available
                    </p>
                    <p className="mt-2 font-bold" style={{ color: accent }}>
                      {formatMoney(pricing.total, pricing.currency)}{' '}
                      <span className="text-sm font-normal text-slate-500">
                        total · {pricing.nights} night{pricing.nights === 1 ? '' : 's'}
                      </span>
                    </p>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const data = new FormData(e.currentTarget)
                      const guestName = String(data.get('guestName') || '')
                      const guestEmail = String(data.get('guestEmail') || '')
                      const guestPhone = String(data.get('guestPhone') || '')
                      const specialRequests = String(data.get('specialRequests') || '')
                      setError('')
                      if (!guestName || !guestEmail) {
                        setError('Name and email are required.')
                        return
                      }
                      const unit = findAvailableUnit(rt.slug, checkIn, checkOut, c.roomTypes, units, reservations)
                      if (!unit) {
                        setError('No rooms available for those dates.')
                        return
                      }
                      const reservation = createPreviewReservation({
                        siteKey: key,
                        roomType: rt,
                        unit,
                        checkIn,
                        checkOut,
                        adults,
                        children,
                        guestName,
                        guestEmail,
                        guestPhone,
                        specialRequests,
                      })
                      setReservations(loadPreviewReservations(key))
                      navigate(sitePath(basePath, `book/confirm/${reservation.confirmationCode}`))
                    }}
                    className="w-full shrink-0 space-y-3 border-t pt-4 cmd:w-80 cmd:border-l cmd:border-t-0 cmd:pl-6 cmd:pt-0"
                  >
                    <label className="block text-xs">
                      <span className="mb-1 block font-semibold text-slate-500">Full name</span>
                      <input name="guestName" required className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1 block font-semibold text-slate-500">Email</span>
                      <input type="email" name="guestEmail" required className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1 block font-semibold text-slate-500">Phone</span>
                      <input name="guestPhone" className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1 block font-semibold text-slate-500">Special requests</span>
                      <textarea name="specialRequests" rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </label>
                    <button type="submit" className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>
                      Reserve now
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border bg-white p-10 text-center text-slate-600">
              No rooms available for those dates and guest counts. Try different dates or fewer guests.
            </p>
          )
        ) : null}

        <p className="mt-10 text-center text-xs text-slate-400">
          Preview reservations block availability for this session. Export includes full admin control over types, units, rates, and stays.
        </p>
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
        <Link to={sitePath(basePath, 'book')} className="mt-4 inline-block text-sm font-semibold" style={{ color: accent }}>
          Book again →
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
