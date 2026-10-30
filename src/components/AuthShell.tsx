import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { PublicHeader } from './landing/PublicHeader'

export const authFieldClass =
  'mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy focus:ring-2 focus:ring-navy/15 disabled:bg-slate-50 disabled:text-slate-500'
export const authButtonClass =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60'

export function AuthShell({ title, subtitle, children }: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  const adminOrigin = import.meta.env.VITE_ADMIN_ORIGIN || 'http://localhost:5174'
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />
      <main className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 hover:text-navy"><ArrowLeft size={15} /> Back to home</Link>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="auth-title">
          <h1 id="auth-title" className="text-3xl font-semibold tracking-tight text-navy">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </section>
        <p className="mt-6 text-center text-xs leading-6 text-slate-500">Managing an agency? <a href={adminOrigin} className="inline-flex items-center gap-1 font-semibold text-navy hover:underline">Open the agency portal <ExternalLink size={12} /></a></p>
      </main>
    </div>
  )
}
