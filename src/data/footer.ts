import type { SiteContent } from '../types'

export const DEFAULT_FOOTER_NOTE = 'All rights reserved.'
export const DEFAULT_CONTACT_BUTTON = 'Send message'

export function footerBlurb(content: Pick<SiteContent, 'footerBlurb' | 'missionStatement' | 'heroSubtext'>): string {
  return (content.footerBlurb || content.missionStatement || content.heroSubtext || '').trim()
}

export function footerNote(content: Pick<SiteContent, 'footerNote'>): string {
  return (content.footerNote || '').trim() || DEFAULT_FOOTER_NOTE
}

export function contactButtonLabel(value: string | undefined): string {
  const text = (value || '').trim()
  if (!text || text.toLowerCase() === 'open contact form') return DEFAULT_CONTACT_BUTTON
  return text
}
