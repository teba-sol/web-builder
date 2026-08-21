import type { SiteContent } from '../types'
import { Template5 } from './clones/Template5'

export function AxiomHome({ c, basePath }: { c: SiteContent; basePath: string }) {
  return <Template5 c={c} basePath={basePath} />
}
