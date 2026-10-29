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
  reservationUnitIds,
  roomTypeBySlug,
  unitsOfType,
  type PreviewReservation,
  type PreviewRoomUnit,
} from '../../data/bookingPreview'
import { coverPhoto, discountPercentOf, formatMoney, parseRoomPrice, sellingAmount, stayCurrency } from '../../data/hospitality'
import type { RoomTypeItem, SiteContent, TemplateId } from '../../types'
import { addDays, localToday, readChildAges, stayQueryString, staySearchErrors } from '../../data/staySearch'
import { sitePath } from '../../data/siteNav'
import type { TemplateTheme } from '../themes'
import { getMapEmbedUrl, getMapOpenUrl } from '../../utils/mapEmbed'
import { accentInk } from '../../utils/accentInk'
import { staySkin } from './hospitalitySkin'

interface BookingProps {
  content: SiteContent
  basePath: string
  theme: TemplateTheme
  templateId: TemplateId
  accent: string
}

function RoomPrice({ room, accent, suffix, rateHint }: { room: RoomTypeItem; accent: string; suffix?: string; rateHint?: boolean }) {
  const base = parseRoomPrice(room.basePrice)
  const percent = discountPercentOf(room)
  const selling = sellingAmount(base, percent)
  const currency = stayCurrency(room.currency)
  return (
    <span className="block">
      {percent > 0 ? (
        <>
          <span className="block text-sm font-normal text-slate-500 line-through">{formatMoney(base, currency)}</span>
          <span className="block text-lg font-bold" style={{ color: accent }}>
            {formatMoney(selling, currency)}
            {suffix ? <span className="text-sm font-normal text-slate-500"> {suffix}</span> : null}
          </span>
          <span className="mt-1 block text-sm font-semibold text-rose-700">{percent}% off</span>
        </>
      ) : (
        <span className="block text-lg font-bold" style={{ color: accent }}>
          {formatMoney(selling, currency)}
          {suffix ? <span className="text-sm font-normal text-slate-500"> {suffix}</span> : null}
        </span>
      )}
      {rateHint ? (
        <span className="mt-1 block text-xs font-normal text-slate-500">ETB and USD both show on the exported site after the hotel sets the USD to ETB rate.</span>
      ) : null}
    </span>
  )
}

function BreakfastChoice({
  included,
  selected,
  onChange,
}: {
  included: boolean
  selected: boolean
  onChange: (value: boolean) => void
}) {
  if (included) {
    return <p className="text-sm font-medium text-emerald-700">Breakfast included</p>
  }
  return (
    <label className="flex items-start gap-2 text-sm text-slate-900">
      <input type="checkbox" checked={selected} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <span className="font-semibold">Add breakfast</span>
        <span className="mt-0.5 block text-slate-600">You can add or skip it. The nightly price is the Hotel Policy breakfast price on the exported site, shown in ETB and USD.</span>
      </span>
    </label>
  )
}

function StayFlags({ room }: { room: RoomTypeItem }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
      <span className={room.freeCancellation ? 'rounded-full bg-emerald-50 px-3 py-1 text-emerald-800' : 'rounded-full bg-slate-100 px-3 py-1 text-slate-600'}>
        {room.freeCancellation ? 'Free cancellation' : 'Non-refundable'}
      </span>
      <span className={room.freeBreakfast ? 'rounded-full bg-emerald-50 px-3 py-1 text-emerald-800' : 'rounded-full bg-slate-100 px-3 py-1 text-slate-600'}>
        {room.freeBreakfast ? 'Breakfast included' : 'Breakfast not included'}
      </span>
    </div>
  )
}

function siteKey(templateId: TemplateId, businessName: string): string {
  return `${templateId}:${businessName || 'site'}`
}

export function StaySearch({
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
  className,
  inputClass,
  buttonClass,
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
  className?: string
  inputClass?: string
  buttonClass?: string
}) {
  const today = localToday()
  const minOut = checkIn >= today ? addDays(checkIn, 1) : addDays(today, 1)
  const ageCount = Math.max(0, Math.min(10, children))
  const field = inputClass || 'w-full rounded-lg border px-3 py-2.5'
  return (
    <form onSubmit={onSubmit} className={className || 'grid items-end gap-4 rounded-2xl border bg-white p-5 shadow-sm cmd:grid-cols-2 clg:grid-cols-6'}>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-in</span>
        <input type="date" required min={today} value={checkIn} onChange={(event) => onCheckIn(event.target.value)} className={field} />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Check-out</span>
        <input type="date" required min={minOut} value={checkOut} onChange={(event) => onCheckOut(event.target.value)} className={field} />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Adults</span>
        <input type="number" min={1} max={20} required value={adults} onChange={(event) => onAdults(Number(event.target.value))} className={field} />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Children</span>
        <input type="number" min={0} max={10} required value={children} onChange={(event) => onChildren(Number(event.target.value))} className={field} />
      </label>
      <button type="submit" className={(buttonClass || 'rounded-lg px-5 py-3 font-semibold text-white').replace(/\btext-white\b/, accentInk(accent))} style={{ backgroundColor: accent }}>
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
            className={field}
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

export function HeroStaySearch({ basePath, accent, templateId }: { basePath: string; accent: string; templateId: TemplateId }) {
  const navigate = useNavigate()
  const draft = useStayDraft()
  const skin = staySkin(templateId)
  const [error, setError] = useState('')
  return (
    <div className="mt-8 w-full clg:col-span-2">
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
        className={skin.search}
        inputClass={skin.input}
        buttonClass={skin.button}
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
      {error ? <p className="mt-3 rounded-xl bg-white/95 px-4 py-3 text-sm text-red-800">{error}</p> : null}
    </div>
  )
}

function BookingStepper({ step, templateId }: { step: 1 | 2 | 3; templateId: TemplateId }) {
  const skin = staySkin(templateId)
  const labels = ['Reservation', 'Guest', 'Confirmation']
  return (
    <ol className={skin.stepper} aria-label="Booking steps">
      {labels.map((label, index) => {
        const current = index + 1 === step
        return (
          <li key={label} className={current ? skin.stepOn : skin.stepOff} aria-current={current ? 'step' : undefined}>
            <span className="mb-1 block text-[11px] opacity-70">{index + 1}</span>
            {label}
          </li>
        )
      })}
    </ol>
  )
}

function PhotoCarousel({ photos, alt, frame }: { photos: string[]; alt: string; frame: string }) {
  const slides = photos.filter((photo) => photo.trim())
  const [index, setIndex] = useState(0)
  if (!slides.length) return <div className={`aspect-[16/9] w-full bg-slate-100 ${frame}`} />
  const current = slides[Math.min(index, slides.length - 1)]
  return (
    <div className="space-y-3">
      <div className={`relative overflow-hidden ${frame}`}>
        <img src={current} alt={alt} className="aspect-[16/9] w-full object-cover" />
        {slides.length > 1 ? (
          <div className="absolute inset-x-0 bottom-3 flex justify-between px-3">
            <button type="button" className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold shadow" onClick={() => setIndex((value) => (value - 1 + slides.length) % slides.length)}>Previous</button>
            <button type="button" className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold shadow" onClick={() => setIndex((value) => (value + 1) % slides.length)}>Next</button>
          </div>
        ) : null}
      </div>
      {slides.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {slides.map((photo, photoIndex) => (
            <button key={photo} type="button" onClick={() => setIndex(photoIndex)} className={`h-16 w-20 shrink-0 overflow-hidden border ${photoIndex === index ? 'border-slate-900' : 'border-transparent'} ${frame}`}>
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function PropertyNotes({ content: c, accent }: { content: SiteContent; accent: string }) {
  const src = getMapEmbedUrl(c.mapUrl, c.address)
  const open = getMapOpenUrl(c.mapUrl, c.address)
  const contacts = [
    c.phone ? { label: 'Phone', value: c.phone } : null,
    c.email ? { label: 'Email', value: c.email } : null,
    c.reservationEmail ? { label: 'Reservations', value: c.reservationEmail } : null,
    c.address ? { label: 'Address', value: c.address } : null,
    c.hours ? { label: 'Hours', value: c.hours } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item))
  return (
    <div className="mt-12 space-y-10">
      <section>
        <h2 className="text-2xl font-semibold">House rules</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
          House rules are published by the hotel as a PDF or Word file. They appear on the live site after the hotel uploads them under Hotel Policy.
        </p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Contact</h2>
        {contacts.length ? (
          <dl className="mt-4 grid gap-4 csm:grid-cols-2">
            {contacts.map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-600">{item.label}</dt>
                <dd className="mt-1 break-words">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-slate-600">Contact details appear here when the hotel adds them.</p>
        )}
        {src ? (
          <div className="mt-6 h-64 overflow-hidden rounded-2xl border">
            <iframe title="Map" src={src} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        ) : null}
        {open ? (
          <a href={open} className="mt-3 inline-block text-sm font-semibold underline" style={{ color: accent }} target="_blank" rel="noreferrer">
            View on Google Maps
          </a>
        ) : null}
      </section>
    </div>
  )
}

export function RoomsPage({ content: c, basePath, templateId, accent }: BookingProps) {
  const navigate = useNavigate()
  const draft = useStayDraft()
  const skin = staySkin(templateId)
  const submitted = draft.params.has('check_in')
  const childAges = submitted ? readChildAges(draft.params, Number(draft.params.get('children') || 0)) : draft.childAges
  const searchErrors = submitted
    ? staySearchErrors({
        checkIn: draft.params.get('check_in') || '',
        checkOut: draft.params.get('check_out') || '',
        adults: Number(draft.params.get('adults') || 2),
        children: Number(draft.params.get('children') || 0),
        childAges,
      })
    : []
  const searched = submitted && searchErrors.length === 0
  const query = searched
    ? `?${stayQueryString({
        checkIn: draft.params.get('check_in') || draft.checkIn,
        checkOut: draft.params.get('check_out') || draft.checkOut,
        adults: Number(draft.params.get('adults') || draft.adults),
        children: Number(draft.params.get('children') || draft.children),
        childAges,
      })}`
    : ''
  const [error, setError] = useState('')
  const cards = catalogueRoomTypes(c.roomTypes)

  return (
    <section className={`${skin.page} py-12`}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <div className="mb-8 max-w-3xl">
          <p className={skin.eyebrow}>Book</p>
          <h1 className={`mt-2 text-4xl ${skin.heading}`}>{c.roomsSectionTitle || 'Rooms'}</h1>
          <p className="mt-3 text-lg text-slate-600">{c.roomsSectionSubtitle || 'Search dates, then open a room type to see which rooms are free.'}</p>
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
          className={skin.search}
          inputClass={skin.input}
          buttonClass={skin.button}
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
        <div className="mt-8 space-y-5">
          {cards.map((room) => {
            const amenities = amenitiesList(room)
            const photo = coverPhoto(room)
            return (
              <article key={room.slug} className={skin.tile}>
                <div className="grid cmd:grid-cols-[280px_1fr]">
                  {photo ? (
                    <Link to={sitePath(basePath, `rooms/${room.slug}${query}`)}>
                      <img src={photo} alt="" className="h-56 w-full object-cover cmd:h-full" />
                    </Link>
                  ) : (
                    <div className="h-56 w-full bg-slate-100 cmd:h-full" />
                  )}
                  <div className="flex flex-col p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className={`text-2xl ${skin.heading}`}>
                          <Link to={sitePath(basePath, `rooms/${room.slug}${query}`)} className="hover:underline">{room.name}</Link>
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">{room.maxAdults} adults · {room.maxChildren} children</p>
                      </div>
                      <div className="text-right">
                        <RoomPrice room={room} accent={accent} suffix="/ night" />
                      </div>
                    </div>
                    <StayFlags room={room} />
                    {room.description ? <p className="mt-4 leading-relaxed text-slate-600">{room.description}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
                      {room.bedConfiguration ? <span className="rounded-full bg-slate-100 px-3 py-1">{room.bedConfiguration}</span> : null}
                      {room.sizeSqm ? <span className="rounded-full bg-slate-100 px-3 py-1">{room.sizeSqm} m²</span> : null}
                      {amenities.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1">{item}</span>)}
                    </div>
                    <div className="mt-5 flex justify-end">
                      <Link to={sitePath(basePath, `rooms/${room.slug}${query}`)} className={skin.button.replace(/\btext-white\b/, accentInk(accent))} style={{ backgroundColor: accent }}>
                        See availability
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        {cards.length === 0 ? (
          <p className={`mt-8 p-10 text-center text-slate-600 ${skin.card}`}>Add room types in the editor to showcase your inventory.</p>
        ) : null}
      </div>
    </section>
  )
}

export function RoomDetailPage({ content: c, basePath, templateId, accent }: BookingProps) {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const draft = useStayDraft()
  const skin = staySkin(templateId)
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
  const [selected, setSelected] = useState<string[]>([])
  const [addBreakfast, setAddBreakfast] = useState(false)
  if (!type) {
    return (
      <section className="py-20 text-center">
        <p className="text-slate-600">Room not found.</p>
        <Link to={sitePath(basePath, 'rooms')} className="mt-4 inline-block text-sm font-semibold" style={{ color: accent }}>Back to Book</Link>
      </section>
    )
  }
  const free = searched && checkIn < checkOut && guestCapacityOk(type, adults, children)
    ? unitsOfType(type.slug, checkIn, checkOut, units, reservations)
    : []
  const pricing = searched && checkIn < checkOut ? computeStayTotal(type, checkIn, checkOut) : null
  const amenities = amenitiesList(type)
  const photos = type.photos.filter((photo) => photo.trim())
  const cover = coverPhoto(type)
  const query = searched ? `?${stayQueryString({ checkIn, checkOut, adults, children, childAges })}` : ''
  const chosen = free.filter((unit) => selected.includes(unit.id))

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  return (
    <section className={`${skin.page} py-12`}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <BookingStepper step={1} templateId={templateId} />
        <Link to={sitePath(basePath, `rooms${query}`)} className="text-sm text-slate-500 hover:underline">Back to Book</Link>
        <div className="mt-6 grid items-start gap-10 clg:grid-cols-[1.2fr_0.8fr]">
          <PhotoCarousel photos={photos.length ? photos : cover ? [cover] : []} alt={type.name} frame={skin.card} />
          <div>
            <p className={skin.eyebrow}>Room type</p>
            <h1 className={`mt-2 text-4xl ${skin.heading}`}>{type.name}</h1>
            <p className="mt-2 text-sm text-slate-500">{type.maxAdults} adults · {type.maxChildren} children</p>
            <div className="mt-4"><RoomPrice room={type} accent={accent} suffix="/ night" rateHint /></div>
            <StayFlags room={type} />
            <div className="mt-3">
              <BreakfastChoice included={type.freeBreakfast} selected={addBreakfast} onChange={setAddBreakfast} />
            </div>
            {type.description ? <p className="mt-5 leading-relaxed text-slate-700">{type.description}</p> : null}
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-600">Sleeps</dt><dd className="font-medium">{type.maxAdults} adults · {type.maxChildren} children</dd></div>
              {type.bedConfiguration ? <div><dt className="text-slate-600">Beds</dt><dd className="font-medium">{type.bedConfiguration}</dd></div> : null}
              {type.sizeSqm ? <div><dt className="text-slate-600">Size</dt><dd className="font-medium">{type.sizeSqm} m²</dd></div> : null}
            </dl>
          </div>
        </div>
        <section className="mt-12">
          <h2 className={`text-2xl ${skin.heading}`}>Amenities</h2>
          {amenities.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {amenities.map((item) => <li key={item} className="rounded-full border bg-white px-3 py-1 text-sm text-slate-900">{item}</li>)}
            </ul>
          ) : (
            <p className="mt-3 text-slate-600">This room type has no listed amenities yet.</p>
          )}
        </section>
        <section className="mt-12">
          <h2 className={`text-2xl ${skin.heading}`}>Find a room</h2>
          <p className="mb-4 mt-1 text-slate-600">Search this room type, then select one or more rooms.</p>
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
            label="Search room"
            className={skin.search}
            inputClass={skin.input}
            buttonClass={skin.button}
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
              setSelected([])
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
        </section>
        <div className="mt-8">
          {searched ? (
            free.length && pricing ? (
              <ul className="space-y-4">
                {free.map((unit) => (
                  <UnitRow
                    key={unit.id}
                    unit={unit}
                    room={type}
                    accent={accent}
                    skinCard={skin.card}
                    badge={skin.badge}
                    nights={pricing.nights}
                    nightly={pricing.nightlyRate}
                    checked={selected.includes(unit.id)}
                    onToggle={() => toggle(unit.id)}
                    photo={cover}
                  />
                ))}
              </ul>
            ) : (
              <p className={`p-8 text-slate-600 ${skin.card}`}>No rooms of this type are free for those dates and guests.</p>
            )
          ) : (
            <p className={`p-8 text-slate-600 ${skin.card}`}>Search room to see which rooms of this type are free.</p>
          )}
          {chosen.length && pricing ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                {chosen.length} room{chosen.length === 1 ? '' : 's'} selected · {formatMoney(pricing.total * chosen.length, stayCurrency(pricing.currency))}
                {discountPercentOf(type) > 0 ? <span className="ml-2 font-semibold text-rose-700">{discountPercentOf(type)}% off</span> : null}
              </p>
              <button
                type="button"
                className={skin.button.replace(/\btext-white\b/, accentInk(accent))}
                style={{ backgroundColor: accent }}
                onClick={() => {
                  const stay = stayQueryString({ checkIn, checkOut, adults, children, childAges })
                  const breakfast = !type.freeBreakfast && addBreakfast ? '&breakfast=1' : ''
                  navigate(sitePath(basePath, `book?room=${type.slug}&units=${chosen.map((unit) => unit.id).join(',')}&${stay}${breakfast}`))
                }}
              >
                Reserve
              </button>
            </div>
          ) : null}
        </div>
        <PropertyNotes content={c} accent={accent} />
      </div>
    </section>
  )
}

function UnitRow({
  unit,
  room,
  accent,
  skinCard,
  badge,
  nights,
  nightly,
  checked,
  onToggle,
  photo,
}: {
  unit: PreviewRoomUnit
  room: RoomTypeItem
  accent: string
  skinCard: string
  badge: string
  nights: number
  nightly: number
  checked: boolean
  onToggle: () => void
  photo: string
}) {
  const total = nightly * nights
  return (
    <li className={`relative grid items-center gap-4 p-4 cmd:grid-cols-[180px_1fr_auto] ${skinCard}`}>
      <span className={badge}>{unit.code}</span>
      {photo ? <img src={photo} alt="" className="h-28 w-full object-cover" /> : <div className="h-28 w-full bg-slate-100" />}
      <div>
        <p className="font-semibold">{room.maxAdults} adults · {room.maxChildren} children</p>
        <p className="mt-2 text-sm text-slate-600">{unit.smokingAllowed ? 'Smoking allowed' : 'No smoking'}</p>
        {room.bedConfiguration ? <p className="text-sm text-slate-600">{room.bedConfiguration}</p> : null}
        {room.sizeSqm ? <p className="text-sm text-slate-600">{room.sizeSqm} m²</p> : null}
      </div>
      <div className="text-right">
        <RoomPrice room={room} accent={accent} suffix="/ night" rateHint />
        <p className="mt-1 text-sm font-semibold" style={{ color: accent }}>{formatMoney(total, stayCurrency(room.currency))}</p>
        <p className="text-xs text-slate-500">{nights} night{nights === 1 ? '' : 's'}</p>
        <label className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={checked} onChange={onToggle} />
          Select
        </label>
      </div>
    </li>
  )
}

export function BookPage({ content: c, basePath, templateId, accent }: BookingProps) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const skin = staySkin(templateId)
  const slug = params.get('room') || ''
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
  const [addBreakfast, setAddBreakfast] = useState(() => params.get('breakfast') === '1')
  const ready = Boolean(type && searchErrors.length === 0)
  const free = ready && type ? unitsOfType(type.slug, checkIn, checkOut, units, reservations) : []
  const requested = (params.get('units') || params.get('unit') || '').split(',').map((id) => id.trim()).filter(Boolean)
  const chosen = free.filter((unit) => requested.includes(unit.id))
  const pricing = ready && type ? computeStayTotal(type, checkIn, checkOut) : null
  const capacityOk = type ? guestCapacityOk(type, adults, children) : false
  const roomTotal = pricing ? pricing.total * chosen.length : 0

  if (!ready || !type || !pricing || !capacityOk || chosen.length === 0) {
    return (
      <section className="py-20 text-center">
        <p className="text-slate-600">{searchErrors[0] || 'Choose one or more rooms and dates before you reserve.'}</p>
        <Link to={sitePath(basePath, 'rooms')} className="mt-4 inline-block text-sm font-semibold" style={{ color: accent }}>Book</Link>
      </section>
    )
  }

  const cover = coverPhoto(type)
  return (
    <section className={`${skin.page} py-12`}>
      <div className="mx-auto max-w-6xl px-4 csm:px-6">
        <BookingStepper step={2} templateId={templateId} />
        <Link to={sitePath(basePath, `rooms/${type.slug}?${stayQueryString({ checkIn, checkOut, adults, children, childAges })}`)} className="text-sm text-slate-500 hover:underline">Back to {type.name}</Link>
        <h1 className={`mt-4 text-3xl ${skin.heading}`}>Reserve</h1>
        {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</p> : null}
        <div className="mt-8 grid items-start gap-6 clg:grid-cols-3">
          <aside className={`p-6 ${skin.card}`}>
            <h2 className="text-lg font-semibold">Price breakdown</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Rooms</dt><dd>{chosen.length}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Nights</dt><dd>{pricing.nights}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Nightly</dt><dd className="text-right"><RoomPrice room={type} accent={accent} suffix="/ night" rateHint /></dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Guests</dt><dd>{adults} adults · {children} children</dd></div>
              <div className="flex justify-between gap-4 border-t pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="text-right font-bold" style={{ color: accent }}>{formatMoney(roomTotal, stayCurrency(pricing.currency))}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">{type.freeCancellation ? 'Free cancellation.' : 'This rate is non-refundable.'}</p>
            <p className="mt-2 text-sm text-slate-700">{type.freeBreakfast ? 'Breakfast included' : addBreakfast ? 'Breakfast added. The exported site charges the Hotel Policy price.' : 'Breakfast not included'}</p>
          </aside>
          <section className={`p-6 ${skin.card}`}>
            <h2 className="text-lg font-semibold">Your stay</h2>
            {cover ? <img src={cover} alt="" className="mt-4 aspect-[16/10] w-full object-cover" /> : <div className="mt-4 aspect-[16/10] w-full bg-slate-100" />}
            <p className={`mt-4 text-xl ${skin.heading}`}>{type.name}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {chosen.map((unit) => (
                <li key={unit.id} className="flex items-center justify-between gap-3">
                  <span>Room {unit.code}</span>
                  <span className="text-slate-500">{unit.smokingAllowed ? 'Smoking allowed' : 'No smoking'}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-600">{checkIn} to {checkOut}</p>
          </section>
          <form
            className={`space-y-4 p-6 ${skin.card}`}
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              const guestName = String(data.get('guestName') || '')
              const guestEmail = String(data.get('guestEmail') || '')
              const guestPhone = String(data.get('guestPhone') || '')
              if (!guestName || !guestEmail || !guestPhone) {
                setError('Name, email, and phone are required.')
                return
              }
              const stillFree = chosen.every((unit) => unitsOfType(type.slug, checkIn, checkOut, units, loadPreviewReservations(key)).some((item) => item.id === unit.id))
              if (!stillFree) {
                setError('One of those rooms was just taken.')
                setReservations(loadPreviewReservations(key))
                return
              }
              const reservation = createPreviewReservation({
                siteKey: key,
                roomType: type,
                units: chosen,
                checkIn,
                checkOut,
                adults,
                children,
                childAges: childAges.map((age) => Number(age)),
                guestName,
                guestEmail,
                guestPhone,
                specialRequests: String(data.get('specialRequests') || ''),
                breakfastSelected: type.freeBreakfast || addBreakfast,
              })
              setReservations(loadPreviewReservations(key))
              navigate(sitePath(basePath, `book/confirm/${reservation.confirmationCode}`))
            }}
          >
            <h2 className="text-lg font-semibold">Guest</h2>
            <label className="block text-sm"><span className="mb-1 block text-slate-500">Full name</span><input name="guestName" required className={skin.input} /></label>
            <label className="block text-sm"><span className="mb-1 block text-slate-500">Email</span><input type="email" name="guestEmail" required className={skin.input} /></label>
            <label className="block text-sm"><span className="mb-1 block text-slate-500">Phone</span><input name="guestPhone" required className={skin.input} /></label>
            <label className="block text-sm"><span className="mb-1 block text-slate-500">Special requests (optional)</span><textarea name="specialRequests" rows={3} className={skin.input} /></label>
            <BreakfastChoice included={type.freeBreakfast} selected={addBreakfast} onChange={setAddBreakfast} />
            <button type="submit" className={`w-full ${skin.button.replace(/\btext-white\b/, accentInk(accent))}`} style={{ backgroundColor: accent }}>Reserve</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export function BookingConfirmPage({ content: c, basePath, templateId, accent }: BookingProps) {
  const { code = '' } = useParams()
  const skin = staySkin(templateId)
  const key = siteKey(templateId, c.businessName)
  const reservation = loadPreviewReservations(key).find((item) => item.confirmationCode === code) as PreviewReservation | undefined
  const room = reservation ? roomTypeBySlug(c.roomTypes, reservation.roomTypeSlug) : undefined
  const codes = reservation?.roomUnitCodes?.length
    ? reservation.roomUnitCodes
    : reservation
      ? reservationUnitIds(reservation)
      : []

  if (!reservation) {
    return (
      <section className="py-20 text-center">
        <p className="text-slate-600">Reservation not found in this preview session.</p>
        <Link to={sitePath(basePath, 'rooms')} className="mt-4 inline-block text-sm font-semibold" style={{ color: accent }}>Book</Link>
      </section>
    )
  }

  return (
    <section className={`${skin.page} py-16`}>
      <div className="mx-auto max-w-xl px-6">
        <BookingStepper step={3} templateId={templateId} />
        <div className={`p-8 text-center ${skin.card}`}>
          <p className={skin.eyebrow}>Confirmed</p>
          <h1 className={`mt-2 text-3xl ${skin.heading}`}>Your stay is confirmed</h1>
          <p className="mt-2 text-slate-600">This confirmation is saved in the preview session.</p>
          <div className="mt-8 space-y-3 text-left text-sm">
            <div className="flex justify-between gap-4"><span className="text-slate-500">Confirmation</span><span className="font-mono font-bold tracking-wider">{reservation.confirmationCode}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-500">Room type</span><span className="font-medium">{room?.name || reservation.roomTypeSlug}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-500">Rooms</span><span>{codes.join(', ')}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-500">Check-in</span><span>{reservation.checkIn}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-500">Check-out</span><span>{reservation.checkOut}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-500">Guests</span><span>{reservation.adults} adults{reservation.children ? ` · ${reservation.children} children` : ''}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-500">Guest</span><span>{reservation.guestName}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-500">Email</span><span>{reservation.guestEmail}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-500">Phone</span><span>{reservation.guestPhone}</span></div>
            {reservation.specialRequests ? <div className="flex justify-between gap-4"><span className="text-slate-500">Special requests</span><span>{reservation.specialRequests}</span></div> : null}
            <div className="flex justify-between gap-4"><span className="text-slate-500">Breakfast</span><span>{room?.freeBreakfast ? 'Breakfast included' : reservation.breakfastSelected ? 'Breakfast added. The exported site charges the Hotel Policy price.' : 'Breakfast not included'}</span></div>
            <div className="flex justify-between gap-4 border-t pt-3"><span className="text-slate-500">Total</span><span className="font-bold" style={{ color: accent }}>{formatMoney(reservation.totalPrice, stayCurrency(reservation.currency))}</span></div>
            <p className="text-xs text-slate-500">ETB and USD both show on the exported site after the hotel sets the USD to ETB rate.</p>
          </div>
          <Link to={basePath} className="mt-8 inline-block text-sm font-semibold" style={{ color: accent }}>Back to home</Link>
        </div>
      </div>
    </section>
  )
}
