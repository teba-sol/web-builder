import { logoImageStyle, showBrandName } from '../data/brand'
import type { SiteContent } from '../types'

export function BrandMark({ c }: { c: SiteContent }) {
  const name = showBrandName(c)
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2">
      {c.logo ? (
        <img
          src={c.logo}
          alt=""
          data-brand-logo=""
          className="shrink-0 object-contain"
          style={logoImageStyle(c)}
        />
      ) : null}
      {name ? <span className="truncate">{c.businessName}</span> : <span className="sr-only">{c.businessName || 'Home'}</span>}
    </span>
  )
}
