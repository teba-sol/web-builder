import type { SiteContent } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

export function BoutiqueTemplate({ content }: { content: SiteContent }) {
  return <RichTemplateLayout variant="boutique" content={content} />
}