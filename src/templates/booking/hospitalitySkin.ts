import { accentInk } from '../../utils/accentInk'

export interface StaySkin {
  roomsBeforeTrust: boolean
  page: string
  card: string
  heading: string
  eyebrow: string
  search: string
  input: string
  button: string
  badge: string
  stepper: string
  stepOn: string
  stepOff: string
  tile: string
}

const searchBase = 'grid w-full grid-cols-1 items-end gap-4 text-left text-slate-900 cmd:grid-cols-2 clg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_minmax(0,1.1fr)]'

export function roomsBeforeTrust(templateId: string): boolean {
  return templateId === 'hotel' || templateId === 'coastal' || templateId === 'jungle'
}

export function staySkin(templateId: string): StaySkin {
  switch (templateId) {
    case 'guesthouse':
      return {
        roomsBeforeTrust: false,
        page: 'bg-[#f6f1e8] text-stone-900',
        card: 'overflow-hidden rounded-3xl border border-stone-200 bg-white text-slate-900 shadow-sm',
        heading: 'font-serif',
        eyebrow: 'text-xs font-semibold uppercase tracking-[0.22em] text-stone-500',
        search: `${searchBase} rounded-3xl border border-stone-200 bg-white p-5 shadow-sm`,
        input: 'w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-slate-900',
        button: 'rounded-full px-6 py-3 text-sm font-semibold text-white',
        badge: 'absolute right-3 top-3 rounded-full bg-stone-900 px-2.5 py-1 text-xs font-semibold text-stone-50',
        stepper: 'mb-8 grid grid-cols-3 gap-2',
        stepOn: 'rounded-full border border-stone-800 bg-stone-900 px-3 py-3 text-center text-sm text-stone-50',
        stepOff: 'rounded-full border border-stone-200 bg-white px-3 py-3 text-center text-sm text-stone-700',
        tile: 'overflow-hidden rounded-3xl border border-stone-200 bg-white text-slate-900 shadow-sm',
      }
    case 'alpine':
      return {
        roomsBeforeTrust: false,
        page: 'bg-slate-50 text-slate-900',
        card: 'overflow-hidden rounded-md border border-sky-200 bg-white text-slate-900',
        heading: 'font-light tracking-[0.08em]',
        eyebrow: 'text-xs font-medium uppercase tracking-[0.32em] text-sky-700',
        search: `${searchBase} rounded-md border border-sky-200 bg-white/95 p-4 shadow-sm`,
        input: 'w-full rounded-sm border border-sky-200 bg-white px-3 py-2.5 text-slate-900',
        button: 'rounded-sm px-5 py-3 text-sm font-medium uppercase tracking-wider text-white',
        badge: 'absolute right-3 top-3 bg-slate-950 px-2 py-1 text-[11px] font-medium uppercase tracking-widest text-sky-100',
        stepper: 'mb-8 grid grid-cols-3 gap-px bg-sky-200',
        stepOn: 'bg-slate-950 px-3 py-3 text-center text-sm text-sky-50',
        stepOff: 'bg-white px-3 py-3 text-center text-sm text-slate-700',
        tile: 'overflow-hidden rounded-md border border-sky-200 bg-white text-slate-900',
      }
    case 'coastal':
      return {
        roomsBeforeTrust: true,
        page: 'bg-sky-50 text-slate-900',
        card: 'overflow-hidden rounded-2xl border border-sky-100 bg-white text-slate-900 shadow-md',
        heading: 'font-semibold',
        eyebrow: 'text-xs font-bold uppercase tracking-[0.18em] text-sky-700',
        search: `${searchBase} rounded-2xl border border-white/40 bg-white/95 p-4 shadow-xl`,
        input: 'w-full rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2.5 text-slate-900',
        button: 'rounded-xl px-5 py-3 text-sm font-bold text-white',
        badge: 'absolute right-3 top-3 rounded-full bg-sky-700 px-2.5 py-1 text-xs font-bold text-white',
        stepper: 'mb-8 grid grid-cols-3 gap-3',
        stepOn: 'rounded-2xl bg-sky-700 px-3 py-3 text-center text-sm font-semibold text-white shadow-sm',
        stepOff: 'rounded-2xl bg-white px-3 py-3 text-center text-sm text-sky-950',
        tile: 'overflow-hidden rounded-2xl border border-sky-100 bg-white text-slate-900 shadow-md',
      }
    case 'jungle':
      return {
        roomsBeforeTrust: true,
        page: 'bg-[#f3f7ef] text-slate-900',
        card: 'overflow-hidden rounded-[1.75rem] border border-lime-200 bg-white text-slate-900',
        heading: 'font-semibold',
        eyebrow: 'text-xs font-bold uppercase tracking-[0.2em] text-lime-800',
        search: `${searchBase} rounded-[1.75rem] border border-lime-200 bg-[#fbfdf8] p-5`,
        input: 'w-full rounded-2xl border border-lime-200 bg-white px-3 py-2.5 text-slate-900',
        button: 'rounded-full px-6 py-3 text-sm font-bold text-white',
        badge: 'absolute right-3 top-3 rounded-full bg-lime-800 px-2.5 py-1 text-xs font-bold text-lime-50',
        stepper: 'mb-8 grid grid-cols-3 gap-3',
        stepOn: 'rounded-[1.25rem] bg-lime-800 px-3 py-3 text-center text-sm font-semibold text-lime-50',
        stepOff: 'rounded-[1.25rem] border border-lime-200 bg-white px-3 py-3 text-center text-sm text-lime-950',
        tile: 'overflow-hidden rounded-[1.75rem] border border-lime-200 bg-white text-slate-900',
      }
    case 'ryokan':
      return {
        roomsBeforeTrust: false,
        page: 'bg-[#f4f0e6] text-stone-900',
        card: 'overflow-hidden border border-stone-400 bg-[#fbf8f2] text-stone-900',
        heading: 'font-serif font-normal',
        eyebrow: 'text-xs tracking-[0.35em] text-stone-600',
        search: `${searchBase} border border-stone-400 bg-[#fbf8f2] p-4`,
        input: 'w-full border border-stone-300 bg-white px-3 py-2.5 text-stone-900',
        button: 'border border-stone-900 bg-stone-900 px-5 py-3 text-sm tracking-[0.2em] text-[#f4f0e6]',
        badge: 'absolute right-3 top-3 border border-stone-800 bg-[#f4f0e6] px-2 py-1 text-[11px] tracking-[0.2em] text-stone-900',
        stepper: 'mb-8 grid grid-cols-3',
        stepOn: 'border-t-2 border-red-800 px-3 py-3 text-center font-serif text-sm text-stone-900',
        stepOff: 'border-t border-stone-300 px-3 py-3 text-center font-serif text-sm text-stone-700',
        tile: 'overflow-hidden border border-stone-400 bg-[#fbf8f2] text-stone-900',
      }
    default:
      return {
        roomsBeforeTrust: templateId === 'hotel',
        page: 'bg-stone-100 text-stone-900',
        card: 'overflow-hidden rounded-sm border border-stone-300 bg-white text-slate-900 shadow-sm',
        heading: 'font-serif tracking-wide',
        eyebrow: 'text-xs font-semibold uppercase tracking-[0.28em] text-amber-800',
        search: `${searchBase} rounded-xl border border-stone-300 bg-white/95 p-5 shadow-xl`,
        input: 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-slate-900',
        button: 'rounded-lg px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white',
        badge: 'absolute right-3 top-3 rounded-sm bg-stone-950 px-2.5 py-1 text-xs font-semibold tracking-wider text-amber-100',
        stepper: 'mb-8 grid grid-cols-3 gap-4',
        stepOn: 'border-t-2 border-amber-700 pt-3 text-center text-sm font-semibold uppercase tracking-wider text-stone-900',
        stepOff: 'border-t border-stone-300 pt-3 text-center text-sm uppercase tracking-wider text-stone-700',
        tile: 'overflow-hidden rounded-sm border border-stone-300 bg-white text-slate-900 shadow-sm',
      }
  }
}

export function accentButton(templateId: string, accent: string): string {
  return staySkin(templateId).button.replace(/\btext-white\b/, accentInk(accent))
}

export function exportStaySkin(templateId: string): StaySkin {
  const skin = staySkin(templateId)
  return {
    ...skin,
    search: skin.search.replaceAll('cmd:', 'md:').replaceAll('clg:', 'lg:'),
  }
}
