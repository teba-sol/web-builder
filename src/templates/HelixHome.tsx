import type { SiteContent } from '../types'
import { Template6 } from './clones/Template6'

export function HelixHome({ c, basePath }: { c: SiteContent; basePath: string }) {
  return <Template6 c={c} basePath={basePath} />
}
