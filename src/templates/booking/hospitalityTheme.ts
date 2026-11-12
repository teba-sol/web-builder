import type { TemplateTheme } from '../themes'

// Public hotel pages use the exported light surfaces. Brand colors belong to
// accents and actions, never to the page background or body text.
export const HOSPITALITY_PAGE = 'bg-white text-slate-800'

export function applyHospitalitySurfaces(theme: TemplateTheme, original: TemplateTheme = theme): TemplateTheme {
  return {
    ...theme,
    page: HOSPITALITY_PAGE,
    nav: original.nav,
    navLink: original.navLink,
    stats: 'bg-slate-50 text-slate-900 py-16',
    statValue: 'text-3xl font-bold text-slate-900',
    statLabel: 'text-slate-600 text-sm mt-1',
    section: 'py-20',
    sectionAlt: 'bg-slate-50 text-slate-900 py-20',
    sectionTitle: theme.sectionTitle.replace(/\btext-(?:[a-z]+-\d{2,3}|\[[^\]]+\])/g, '').trim() + ' text-slate-900',
    sectionSubtitle: 'text-slate-600 mt-2',
    cardTitle: theme.cardTitle.replace(/\btext-(?:[a-z]+-\d{2,3}|\[[^\]]+\])/g, '').trim() + ' text-slate-900',
    cardText: 'text-slate-600 leading-relaxed',
    ctaBanner: 'py-20 text-center',
    ctaBannerBtn: 'bg-white px-8 py-3 rounded-lg font-semibold',
    contact: 'bg-white text-slate-800 py-20',
    contactLabel: 'text-slate-600 text-xs uppercase tracking-wider font-semibold',
    footer: 'border-t border-slate-200 bg-white py-12 text-sm text-slate-600',
  }
}

/** The same explicit surfaces also cover the independently rendered export sections. */
export const HOSPITALITY_CSS = `
[data-hospitality-site] { background: #fff; color: #1e293b; color-scheme: light; }
[data-hospitality-site] .stay-hero { background-color: #0f172a; }
[data-hospitality-site] .stay-trust { background: #f8fafc !important; color: #0f172a; }
[data-hospitality-site] .stay-trust p { color: inherit; }
[data-hospitality-site] #contact { background: #fff; color: #1e293b; }
[data-hospitality-site] footer { background: #fff; color: #475569; border-color: #e2e8f0; text-align: left; }
[data-hospitality-site] footer a,[data-hospitality-site] footer p { color: inherit; opacity: 1; }
`.trim()
