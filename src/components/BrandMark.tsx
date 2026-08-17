import { showBrandName } from '../data/brand'
import type { SiteContent } from '../types'

export function BrandMark({ c }: { c: SiteContent }) {
  const name = showBrandName(c)
  return (
    <>
      {c.logo ? (
        <img src={c.logo} alt="" className="h-8 w-auto max-h-9 max-w-[10rem] object-contain" />
      ) : null}
      {name ? <span>{c.businessName}</span> : <span className="sr-only">{c.businessName || 'Home'}</span>}
    </>
  )
}
