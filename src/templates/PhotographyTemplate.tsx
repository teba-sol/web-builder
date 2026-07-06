import type { SiteContent } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

export function PhotographyTemplate({ content }: { content: SiteContent }) {
  return <RichTemplateLayout variant="photography" content={content} />
}