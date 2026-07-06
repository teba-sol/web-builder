export function getEmbedFormUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.includes('docs.google.com/forms')) {
    const match = trimmed.match(/(https:\/\/docs\.google\.com\/forms\/d\/e?\/[a-zA-Z0-9_-]+)/)
    if (match) return `${match[1]}/viewform?embedded=true`
    const base = trimmed.split('/viewform')[0].split('/edit')[0]
    if (base.includes('/forms/d/')) return `${base}/viewform?embedded=true`
  }

  if (trimmed.includes('typeform.com/to/')) {
    const id = trimmed.match(/typeform\.com\/to\/([a-zA-Z0-9]+)/)?.[1]
    if (id) return `https://form.typeform.com/to/${id}`
  }

  if (trimmed.includes('form.typeform.com/to/')) {
    return trimmed.split('?')[0]
  }

  if (trimmed.includes('forms.office.com')) {
    return trimmed.includes('?') ? trimmed : `${trimmed}?embed=true`
  }

  return trimmed
}

export function canEmbedForm(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.includes('forms.gle/')) return false
  if (trimmed.includes('docs.google.com/forms')) return true
  if (trimmed.includes('typeform.com/to/') || trimmed.includes('form.typeform.com/to/')) return true
  if (trimmed.includes('forms.office.com')) return true
  return false
}

export const EMBED_FORM_HEIGHT = 720