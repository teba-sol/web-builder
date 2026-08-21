/** Turn a pasted Maps link, embed code, or office address into an iframe src. */

function ensureHttps(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

function searchEmbed(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}

function convertGoogleMapsToEmbed(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  if (/google\.[^/\s]+\/maps\/embed/i.test(trimmed) || /\/maps\/embed\?/i.test(trimmed)) {
    return trimmed
  }

  if (/[?&]output=embed\b/i.test(trimmed) && /google\.[^/\s]+\/maps/i.test(trimmed)) {
    return trimmed
  }

  const at = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,(\d+(?:\.\d+)?)z?)?/)
  if (at && /google\.[^/\s]+\/maps/i.test(trimmed)) {
    const zoom = at[3] ? String(Math.round(Number(at[3]))) : '16'
    return `https://www.google.com/maps?q=${at[1]},${at[2]}&z=${zoom}&output=embed`
  }

  const place = trimmed.match(/\/maps\/place\/([^/@?#]+)/i)
  if (place) {
    const name = decodeURIComponent(place[1].replace(/\+/g, ' '))
    return searchEmbed(name)
  }

  try {
    const url = new URL(ensureHttps(trimmed))
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'maps.app.goo.gl' || host === 'goo.gl' || host === 'g.page') {
      return ''
    }

    if (host.includes('google.') && url.pathname.includes('/maps')) {
      const q = url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('daddr')
      if (q) return searchEmbed(q)
      const ll = url.searchParams.get('ll') || url.searchParams.get('center')
      if (ll) return searchEmbed(ll)
    }

    if (host === 'maps.apple.com') {
      const q = url.searchParams.get('q') || url.searchParams.get('ll') || url.searchParams.get('address')
      if (q) return searchEmbed(q)
    }
  } catch {
    /* not a URL — treat as a location name below */
  }

  if (!/^https?:\/\//i.test(trimmed) && !trimmed.includes('<iframe')) {
    return searchEmbed(trimmed)
  }

  return ''
}

export function getMapEmbedUrl(mapUrl: string, address = ''): string {
  const raw = mapUrl.trim()
  if (raw) {
    const fromIframe = raw.match(/\bsrc=["']([^"']+)["']/i)
    const candidate = (fromIframe?.[1] || raw).trim()
    const converted = convertGoogleMapsToEmbed(candidate)
    if (converted) return converted
  }
  const fallback = address.trim()
  return fallback ? searchEmbed(fallback) : ''
}

export function getMapOpenUrl(mapUrl: string, address = ''): string {
  const raw = mapUrl.trim()
  if (raw) {
    const fromIframe = raw.match(/\bsrc=["']([^"']+)["']/i)
    const candidate = (fromIframe?.[1] || raw).trim()
    if (/^https?:\/\//i.test(candidate)) {
      if (/\/maps\/embed/i.test(candidate)) {
        return candidate.replace('/maps/embed', '/maps').replace(/[?&]output=embed/, '')
      }
      return candidate
    }
    if (candidate) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(candidate)}`
  }
  const fallback = address.trim()
  return fallback ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallback)}` : ''
}

export function isShortMapLink(mapUrl: string): boolean {
  return /maps\.app\.goo\.gl|goo\.gl\/maps|g\.page\//i.test(mapUrl)
}
