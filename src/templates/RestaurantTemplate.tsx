import type { SiteContent } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

export function RestaurantTemplate({ content }: { content: SiteContent }) {
  return <RichTemplateLayout variant="restaurant" content={content} />
}