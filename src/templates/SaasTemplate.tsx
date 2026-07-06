import type { SiteContent } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

export function SaasTemplate({ content }: { content: SiteContent }) {
  return <RichTemplateLayout variant="saas" content={content} />
}