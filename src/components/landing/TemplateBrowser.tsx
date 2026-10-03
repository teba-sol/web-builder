import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { BrowserFrame } from './BrowserFrame'
import { showcaseSites } from './sites'

export function TemplateBrowser() {
  const sites = showcaseSites().slice(0, 8)
  const [index, setIndex] = useState(1)
  const drag = useRef({ start: 0, from: 0, active: false })
  const track = useRef<HTMLDivElement>(null)
  const indexRef = useRef(1)
  const count = sites.length || 1
  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count])
  indexRef.current = index

  useEffect(() => {
    const el = track.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) < 12 && Math.abs(event.deltaY) < 12) return
      event.preventDefault()
      go(indexRef.current + (event.deltaY + event.deltaX > 0 ? 1 : -1))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [go])

  const onPointerDown = (event: PointerEvent) => {
    drag.current = { start: event.clientX, from: index, active: true }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent) => {
    if (!drag.current.active) return
    const delta = event.clientX - drag.current.start
    if (Math.abs(delta) > 56) {
      go(drag.current.from + (delta < 0 ? 1 : -1))
      drag.current.active = false
    }
  }

  if (sites.length === 0) return null
  const active = sites[index]

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mb-10 px-4 md:px-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Browse</p>
        <h2 className="font-display mt-3 max-w-4xl text-[clamp(2rem,5.5vw,4.8rem)] text-navy">
          Closer.
          <br />
          Then closer still.
        </h2>
      </div>
      <div
        ref={track}
        className="relative mx-auto h-[min(70vh,620px)] max-w-[1400px] touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => {
          drag.current.active = false
        }}
        onPointerCancel={() => {
          drag.current.active = false
        }}
      >
        {sites.map((site, i) => {
          let offset = i - index
          if (offset > count / 2) offset -= count
          if (offset < -count / 2) offset += count
          const abs = Math.abs(offset)
          const on = offset === 0
          return (
            <button
              key={site.id}
              type="button"
              onClick={() => go(i)}
              className="absolute left-1/2 top-0 w-[84%] origin-center md:w-[54%]"
              style={{
                transform: `translate3d(calc(-50% + ${offset * 58}%), ${abs * 22}px, 0) rotate(${offset * 3}deg) scale(${on ? 1 : 0.78})`,
                opacity: abs > 1 ? 0 : on ? 1 : 0.45,
                zIndex: 12 - abs,
                filter: on ? 'none' : 'blur(1.5px)',
                transition: 'transform 640ms cubic-bezier(0.16,1,0.3,1), opacity 420ms ease, filter 420ms ease',
                pointerEvents: abs > 1 ? 'none' : 'auto',
              }}
            >
              <BrowserFrame src={site.src} alt={site.label} />
            </button>
          )
        })}
      </div>
      {active && (
        <p className="mt-8 px-4 text-center text-[11px] uppercase tracking-[0.24em] text-navy/55">
          {active.category} · {active.label}{' '}
          <Link to={`/demo/${active.id}`} className="text-navy">
            Preview
          </Link>
        </p>
      )}
    </section>
  )
}
