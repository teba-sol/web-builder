import JSZip from 'jszip'
import { buildSiteDocument, stringifySiteDocument } from '../siteDocument/io'
import type { SiteContent, TemplateId } from '../types'
import { generateBackend, mapAssetsForBackend } from './backend/generateBackend'
import type { CrsExportSecrets } from './backend/exportPayload'
import { buildAllSitePages } from './buildSitePages'

function slugify(name: string): string {
  return (name || 'my-website')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function downloadWebsiteZip(
  templateId: TemplateId,
  content: SiteContent,
  colorSchemeId?: string,
  layoutVariantId?: string,
  crs?: CrsExportSecrets,
) {
  const { pages, assets, seoFiles } = buildAllSitePages(templateId, content, colorSchemeId, layoutVariantId)
  const zip = new JSZip()

  // Static frontend (works without PHP) — multi-page site
  for (const [path, html] of Object.entries(pages)) {
    zip.file(`frontend/${path}`, html)
  }
  for (const [path, file] of Object.entries(seoFiles)) {
    zip.file(`frontend/${path}`, file)
  }
  for (const asset of assets) {
    zip.file(`frontend/${asset.zipPath}`, asset.data)
  }

  // Laravel + Filament backend
  const backendFiles = generateBackend(templateId, content, colorSchemeId, layoutVariantId, assets, crs)
  for (const [path, fileContent] of Object.entries(backendFiles)) {
    zip.file(`backend/${path}`, fileContent)
  }

  const backendAssets = mapAssetsForBackend(assets)
  for (const [path, data] of Object.entries(backendAssets)) {
    zip.file(`backend/${path}`, data)
  }

  const siteDocument = buildSiteDocument(templateId, content, colorSchemeId, layoutVariantId)
  zip.file('site.json', stringifySiteDocument(siteDocument))

  zip.file(
    'README.txt',
    `Your Full-Stack Website — ${content.businessName}
=============================================

This export includes a static frontend, a Laravel + Filament backend, and site.json.

FOLDERS / FILES:
----------------
site.json     Checkpoint of this exact edit (template + content + colors).
              Import it in WebBuilder to restore your work. Same schema every time.
frontend/     Multi-page static site (index.html, about.html, blog/, etc.)
              When SEO is enabled: robots.txt + sitemap.xml included
backend/      Laravel 11 + Filament 3 admin — dynamic content, contact form, deploy-ready

STATIC FRONTEND (quick preview):
1. Unzip this folder
2. Open frontend/index.html in any web browser
3. Upload frontend/ to Netlify, Vercel, GitHub Pages, etc.

DYNAMIC BACKEND (recommended for production):

Option A — Browser setup (great for cPanel, no terminal):
1. Upload backend/ to your host, run composer install once
2. Copy .env.example to .env
3. Visit /doctor?token=YOUR_DOCTOR_TOKEN (token is in .env)
4. Click "Run All Recommended Steps"

Option B — Terminal:
1. cd backend && chmod +x setup.sh && ./setup.sh
2. php artisan serve

Then visit:
- Website:  http://localhost:8000
- Admin:    http://localhost:8000/admin
  Login:    see ADMIN_EMAIL in .env (default: admin@yourbusiness.local)
  Password: see ADMIN_PASSWORD in .env (default: password)

Website images live in storage/ — run Storage Link from Site Doctor (included in Run All).

See backend/README.md for full deployment instructions.

Built with WebBuilder
`,
  )

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slugify(content.businessName)}-fullstack.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}