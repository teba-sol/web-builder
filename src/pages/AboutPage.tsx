import { AppHeader } from '../components/AppHeader'
import { MarketingFooter } from '../components/MarketingFooter'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">About</p>
        <h1 className="mt-3 text-4xl font-semibold text-navy">Built for Ethiopian agencies and personal brands.</h1>
        <p className="mt-6 text-base leading-relaxed text-slate-600">
          Buildoura is a website builder with a live catalog of business templates. Salespeople pick a client, choose a design, and keep editing until the site is ready to export. Agency admins see the pipeline. Personal accounts build for themselves and pay when they unlock a website.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-semibold text-navy">Agencies</p>
            <p className="mt-2 text-sm text-slate-600">Register the company, add salespeople, and keep client sites in one workspace.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-semibold text-navy">Personal use</p>
            <p className="mt-2 text-sm text-slate-600">Start from a template, save your draft in the cloud after payment, and export when you are ready.</p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
