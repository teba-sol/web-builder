import type { ReactNode } from 'react'
import { AppHeader } from './AppHeader'
import type { ProjectStatus } from '../api/types'

export function PageShell({
  children,
  width = 'default',
}: {
  children: ReactNode
  width?: 'default' | 'wide'
}) {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <AppHeader />
      <main className={`mx-auto px-6 py-10 ${width === 'wide' ? 'max-w-7xl' : 'max-w-6xl'}`}>{children}</main>
    </div>
  )
}

export function Initials({
  name,
  size = 'sm',
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  const box =
    size === 'lg'
      ? 'h-20 w-20 text-2xl'
      : size === 'md'
        ? 'h-11 w-11 text-sm'
        : 'h-8 w-8 text-xs'
  return (
    <span className={`inline-flex ${box} items-center justify-center rounded-full bg-navy text-white font-semibold`}>
      {letters || 'U'}
    </span>
  )
}

export function StatusBadge({ status }: { status: ProjectStatus | string }) {
  const label = status === 'IN_PROGRESS' ? 'In progress' : status === 'EXPORTED' ? 'Exported' : 'Draft'
  const tone =
    status === 'EXPORTED'
      ? 'bg-emerald-50 text-emerald-800'
      : status === 'IN_PROGRESS'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-slate-100 text-slate-600'
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>{label}</span>
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}
