import type { SiteContent } from '../types'
import { escapeHtml } from './imageUtils'

export function tailwindHead(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>body { font-family: Inter, system-ui, sans-serif; }</style>
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