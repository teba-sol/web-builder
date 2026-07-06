import JSZip from 'jszip'
import type { SiteContent, TemplateId } from '../types'
import { generateHtml } from './generateHtml'

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
) {
  const { html, assets } = generateHtml(templateId, content, colorSchemeId, layoutVariantId)
  const zip = new JSZip()

  zip.file('index.html', html)

  for (const asset of assets) {
    zip.file(asset.zipPath, asset.data)
  }

  zip.file(
    'README.txt',
    `Your Website — ${content.businessName}
================================

HOW TO USE:
1. Unzip this folder
2. Open index.html in any web browser
3. To publish online, upload all files to any web host
   (Netlify, Vercel, GitHub Pages, or your own server)

FILES:
- index.html  → Your website homepage
- assets/     → Your uploaded images (if any)

Built with WebBuilder
`,
  )

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slugify(content.businessName)}-website.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}