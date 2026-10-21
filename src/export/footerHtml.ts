import { footerBlurb, footerNote } from '../data/footer'
import type { SiteContent } from '../types'
import { escapeHtml } from './imageUtils'

export function staticFooterHtml(content: SiteContent, linksHtml: string): string {
  const blurb = footerBlurb(content)
  const note = footerNote(content)
  const contact = [content.phone, content.email, content.reservationEmail, content.supportEmail, content.whatsapp, content.address]
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => escapeHtml(value))
    .join('<br/>')
  return `<footer class="border-t py-12 text-sm text-slate-600"><div class="max-w-6xl mx-auto px-6 grid gap-8 md:grid-cols-4"><div><p class="text-base font-semibold text-slate-900">${escapeHtml(content.businessName)}</p>${blurb ? `<p class="mt-3 leading-relaxed">${escapeHtml(blurb)}</p>` : ''}</div><div><p class="mb-3 text-xs font-semibold uppercase tracking-wider">Pages</p><div class="flex flex-col gap-2">${linksHtml}</div></div><div><p class="mb-3 text-xs font-semibold uppercase tracking-wider">Hours</p><p>${escapeHtml(content.hours)}</p></div><div><p class="mb-3 text-xs font-semibold uppercase tracking-wider">Contact</p><p>${contact}</p></div></div><p class="mt-8 text-center">© ${new Date().getFullYear()} ${escapeHtml(content.businessName)}. ${escapeHtml(note)}</p></footer>`
}
