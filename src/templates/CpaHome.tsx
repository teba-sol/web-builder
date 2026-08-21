import type { SiteContent } from '../types'
import { Template4 } from './clones/Template4'

export function CpaHome({ c, basePath }: { c: SiteContent; basePath: string }) {
  return <Template4 c={c} basePath={basePath} />
}
