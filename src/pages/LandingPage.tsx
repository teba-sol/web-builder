import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Download, LayoutTemplate, Palette, PanelLeftClose } from 'lucide-react'
import { PublicHeader } from '../components/landing/PublicHeader'
import { MarketingFooter } from '../components/MarketingFooter'
import { TemplateCard } from '../components/TemplateCard'
import { useTemplateCatalog } from '../catalog/useTemplateCatalog'
import { getTemplateThumbnail } from '../catalog/thumbnails'
import { templatesForPersonalAccount } from '../data/hospitalityAccess'

export function LandingPage() {
  const templates = templatesForPersonalAccount(useTemplateCatalog())
  const featured = ['realtor', 'restaurant', 'creative'].flatMap((id) => {
    const template = templates.find((item) => item.id === id)
    return template ? [template] : []
  })
  const hero = featured[0] ?? templates[0]
  const thumbnail = hero ? getTemplateThumbnail(hero.id) : undefined

  useEffect(() => {
    const previous = document.title
    document.title = 'Buildoura — Create a website that feels like yours'
    return () => { document.title = previous }
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <a href="#main-content" className="sr-only z-50 rounded-lg bg-navy p-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <PublicHeader />
      <main id="main-content">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Your website, your way</p>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight text-navy sm:text-5xl lg:text-[3.4rem]">A great website.<br />A simpler way to build it.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-500">Start with a thoughtful design. Add your content, make it yours, and export a working website—all in one place.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-dark">Start building <ArrowRight size={16} /></Link>
              <Link to="/templates" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-navy hover:bg-slate-50">Explore templates</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              {['Live previews', 'Your own branding', 'Full-stack export'].map((label) => <span key={label} className="inline-flex items-center gap-1.5"><Check size={14} className="text-navy" />{label}</span>)}
            </div>
          </div>
          {hero && <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-xs text-slate-500"><span className="flex items-center gap-2"><PanelLeftClose size={14} />Website preview</span><span>{hero.name}</span></div>
              <Link to={`/demo/${hero.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${hero.name} in a new tab`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy">
                {thumbnail ? <img src={thumbnail} alt={`${hero.name} website design`} fetchPriority="high" className="aspect-[4/3] w-full object-cover object-top" /> : <div className={`aspect-[4/3] bg-gradient-to-br ${hero.previewGradient}`} />}
              </Link>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3"><span className="text-xs text-slate-500">One design. Your possibilities.</span><Link to={`/demo/${hero.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy">Preview <ArrowRight size={14} /></Link></div>
            </div>
          </div>}
        </section>

        <section id="templates" className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">A head start, by design</p><h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Find a look that fits.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Designs for businesses, creative work, and everything you’re ready to share.</p></div>
              <Link to="/templates" className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-navy hover:underline">View all templates <ArrowRight size={16} /></Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.map((template) => <TemplateCard key={template.id} template={template} />)}</div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-8 max-w-xl"><h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Less setup. More making it yours.</h2><p className="mt-3 text-sm leading-6 text-slate-500">The tools you need to turn a starting point into your own website.</p></div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: LayoutTemplate, title: 'Start with structure', copy: 'Choose a template built around your business, with pages and sections ready to customize.' },
              { icon: Palette, title: 'Make it feel like you', copy: 'Edit your text, images, fonts, and colors. See your changes in the live preview.' },
              { icon: Download, title: 'Take your website with you', copy: 'Export a full-stack website when it’s unlocked, ready for your own hosting.' },
            ].map(({ icon: Icon, title, copy }) => <div key={title}><span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-navy"><Icon size={20} strokeWidth={1.5} /></span><h3 className="font-semibold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></div>)}
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
            <div><h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">From idea to website.</h2><p className="mt-3 text-sm leading-6 text-slate-500">A straightforward process, at your own pace.</p></div>
            <ol className="grid gap-6 sm:grid-cols-3">{[
              { title: 'Choose', copy: 'Explore templates and preview the pages.' },
              { title: 'Customize', copy: 'Add your content and shape your brand.' },
              { title: 'Export', copy: 'Unlock your website and download your files.' },
            ].map(({ title, copy }, index) => <li key={title} className="border-t border-slate-300 pt-4"><span className="text-xs font-semibold text-accent">0{index + 1}</span><h3 className="mt-3 font-semibold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></li>)}</ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-navy p-7 text-white sm:flex-row sm:items-center sm:p-10"><div><h2 className="text-2xl font-semibold tracking-tight">Ready to make it yours?</h2><p className="mt-2 text-sm leading-6 text-white/70">Your next website starts with a design you love.</p></div><Link to="/signup" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-navy hover:bg-slate-100">Get started <ArrowRight size={16} /></Link></div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
