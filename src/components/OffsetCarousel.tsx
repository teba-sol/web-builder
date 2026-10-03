import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

export function OffsetCarousel<T>({
  items,
  index,
  onIndex,
  render,
}: {
  items: T[]
  index: number
  onIndex: (next: number) => void
  render: (item: T, active: boolean) => ReactNode
}) {
  if (items.length === 0) return null
  const safe = Math.min(Math.max(index, 0), items.length - 1)
  const go = (next: number) => onIndex((next + items.length) % items.length)

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Previous"
        onClick={() => go(safe - 1)}
        className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-navy shadow-md hover:bg-slate-50"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => go(safe + 1)}
        className="absolute right-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-navy shadow-md hover:bg-slate-50"
      >
        <ChevronRight size={20} />
      </button>
      <div className="flex items-stretch justify-center gap-3 overflow-hidden px-12 py-4 sm:gap-5">
        {[-1, 0, 1].map((delta) => {
          const i = (safe + delta + items.length) % items.length
          const active = delta === 0
          const item = items[i]
          if (!item || (items.length < 3 && delta !== 0 && i === safe)) {
            return <div key={delta} className="hidden w-[28%] sm:block" />
          }
          return (
            <button
              key={`${i}-${delta}`}
              type="button"
              onClick={() => onIndex(i)}
              className={`text-left transition-all duration-500 ease-out ${
                active
                  ? 'w-[86%] scale-100 opacity-100 sm:w-[48%]'
                  : 'hidden w-[26%] scale-90 opacity-60 sm:block'
              }`}
            >
              {render(item, active)}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to item ${i + 1}`}
            onClick={() => onIndex(i)}
            className={`h-2 rounded-full transition-all ${i === safe ? 'w-6 bg-accent' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
          />
        ))}
      </div>
    </div>
  )
}

export function Stepper({
  steps,
  current,
}: {
  steps: string[]
  current: number
}) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                active || done ? 'bg-accent text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </span>
            <span className={`hidden truncate text-sm font-medium sm:inline ${active ? 'text-navy' : 'text-slate-500'}`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className={`h-px min-w-4 flex-1 ${done ? 'bg-accent' : 'bg-slate-200'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
