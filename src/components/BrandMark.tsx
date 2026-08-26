import { showBrandName } from '../data/brand'
import type { SiteContent } from '../types'

export function BrandMark({ c }: { c: SiteContent }) {
  const name = showBrandName(c)
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {c.logo ? (
        <img src={c.logo} alt="" className="h-8 w-auto max-h-9 max-w-[10rem] object-contain" />
      ) : null}
      {name ? <span className="truncate">{c.businessName}</span> : <span className="sr-only">{c.businessName || 'Home'}</span>}
    </span>
  )
}
