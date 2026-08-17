import { brandCss, brandFontHref } from '../data/brand'
import type { SiteContent } from '../types'
import { escapeHtml } from './imageUtils'
import { buildSeoMetaTags, resolveDocumentTitle, type PageSeoInput } from './seoExport'

/** Shared CSS for classic / modern / luxury look-and-feel (exports + Blade). */
export const LAYOUT_SHELL_CSS = `
.layout-classic { --layout-radius: 0.75rem; --layout-shadow: 0 1px 3px rgba(15,23,42,.08); --layout-title-weight: 700; --layout-title-tracking: 0; --layout-title-transform: none; }
.layout-modern { --layout-radius: .25rem; --layout-shadow: none; --layout-title-weight: 800; --layout-title-tracking: -.03em; --layout-title-transform: none; }
.layout-luxury { --layout-radius: 1.25rem; --layout-shadow: 0 25px 50px -12px rgba(15,23,42,.18); --layout-title-weight: 300; --layout-title-tracking: .08em; --layout-title-transform: uppercase; }
.layout-modern h1,.layout-modern h2,.layout-modern h3 { letter-spacing: var(--layout-title-tracking); font-weight: var(--layout-title-weight) !important; }
.layout-luxury h1,.layout-luxury h2 { letter-spacing: var(--layout-title-tracking); font-weight: var(--layout-title-weight) !important; text-transform: var(--layout-title-transform); }
.layout-modern [class*="rounded-xl"],.layout-modern [class*="rounded-2xl"],.layout-modern [class*="rounded-lg"] { border-radius: var(--layout-radius) !important; }
.layout-luxury [class*="rounded-xl"],.layout-luxury [class*="rounded-2xl"],.layout-luxury [class*="rounded-lg"] { border-radius: var(--layout-radius) !important; }
.layout-classic [class*="rounded-xl"],.layout-classic [class*="rounded-2xl"] { border-radius: var(--layout-radius) !important; }
.layout-modern [class*="shadow"] { box-shadow: none !important; }
.layout-luxury img { box-shadow: var(--layout-shadow); }
.layout-modern section,.layout-modern header { padding-top: 3.5rem; padding-bottom: 3.5rem; }
.layout-luxury section,.layout-luxury header { padding-top: 6rem; padding-bottom: 6rem; }
`.trim()

export function tailwindHead(title: string, seo?: PageSeoInput, content?: SiteContent): string {
  const docTitle = seo ? resolveDocumentTitle(seo) : title
  const seoTags = seo ? buildSeoMetaTags(seo) : ''
  const fontHref = content ? brandFontHref(content) : 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
  const extraCss = content ? brandCss(content) : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(docTitle)}</title>
  ${seoTags ? `${seoTags}\n  ` : ''}<script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="${fontHref || 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'}" rel="stylesheet" />
  <style>body { font-family: Inter, system-ui, sans-serif; }
${LAYOUT_SHELL_CSS}
${extraCss}
</style>
</head>`
}

export function servicesGrid(c: SiteContent, itemClass: string): string {
  const items = c.services
    .map(
      (s) => `
      <div class="${itemClass}">
        <h3 class="text-xl font-semibold mb-2">${escapeHtml(s.title)}</h3>
        <p class="opacity-80">${escapeHtml(s.description)}</p>
      </div>`,
    )
    .join('')
  return `<div class="grid gap-8 md:grid-cols-3">${items}</div>`
}