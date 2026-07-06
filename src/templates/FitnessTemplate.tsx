import type { SiteContent } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

export function FitnessTemplate({ content }: { content: SiteContent }) {
  return <RichTemplateLayout variant="fitness" content={content} />
}