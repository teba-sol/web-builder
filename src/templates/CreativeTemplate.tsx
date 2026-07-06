import type { SiteContent } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

export function CreativeTemplate({ content }: { content: SiteContent }) {
  return <RichTemplateLayout variant="creative" content={content} />
}