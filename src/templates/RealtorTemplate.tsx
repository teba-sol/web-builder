import type { SiteContent } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

export function RealtorTemplate({ content }: { content: SiteContent }) {
  return <RichTemplateLayout variant="realtor" content={content} />
}