import type { SiteContent } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

export function BusinessTemplate({ content }: { content: SiteContent }) {
  return <RichTemplateLayout variant="business" content={content} />
}