import type { SiteContent } from '../types'
import { Template1 } from './clones/Template1'

export function TaxFightersHome({ c, basePath }: { c: SiteContent; basePath: string }) {
  return <Template1 c={c} basePath={basePath} />
}
