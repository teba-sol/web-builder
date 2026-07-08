import type { SiteContent, TemplateId } from '../types'
import { SiteApp } from './SiteApp'

interface Props {
  templateId: TemplateId
  content: SiteContent
  basePath: string
  colorSchemeId?: string
  layoutVariantId?: string
}

export function TemplateRenderer({ templateId, content, basePath, colorSchemeId, layoutVariantId }: Props) {
  return (
    <SiteApp
      templateId={templateId}
      content={content}
      basePath={basePath}
      colorSchemeId={colorSchemeId}
      layoutVariantId={layoutVariantId}
    />
  )
}