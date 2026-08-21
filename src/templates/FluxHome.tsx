import type { SiteContent } from '../types'
import { Template3 } from './clones/Template3'

export function FluxHome({ c, basePath }: { c: SiteContent; basePath: string }) {
  return <Template3 c={c} basePath={basePath} />
}
