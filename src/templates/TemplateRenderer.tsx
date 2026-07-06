import type { SiteContent, TemplateId } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

interface Props {
  templateId: TemplateId
  content: SiteContent
  colorSchemeId?: string
}

export function TemplateRenderer({ templateId, content, colorSchemeId }: Props) {
  return (
    <RichTemplateLayout
      variant={templateId}
      content={content}
      colorSchemeId={colorSchemeId}
    />
  )
}