import type { SiteContent } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

export function MedicalTemplate({ content }: { content: SiteContent }) {
  return <RichTemplateLayout variant="medical" content={content} />
}