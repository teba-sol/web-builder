import type { SiteContent } from '../types'
import { Template2 } from './clones/Template2'

export function AureumHome({ c, basePath }: { c: SiteContent; basePath: string }) {
  return <Template2 c={c} basePath={basePath} />
}
