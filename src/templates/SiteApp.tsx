import { Route, Routes, useParams } from 'react-router-dom'
import type { SiteContent, TemplateId } from '../types'
import type { SitePageId } from '../data/siteNav'
import { RichTemplateLayout } from './RichTemplateLayout'

interface Props {
  templateId: TemplateId
  content: SiteContent
  basePath: string
  colorSchemeId?: string
  layoutVariantId?: string
}

function SitePage({
  page,
  blogSlug,
  ...rest
}: Props & { page: SitePageId; blogSlug?: string }) {
  return (
    <RichTemplateLayout
      variant={rest.templateId}
      content={rest.content}
      colorSchemeId={rest.colorSchemeId}
      layoutVariantId={rest.layoutVariantId}
      page={page}
      basePath={rest.basePath}
      blogSlug={blogSlug}
    />
  )
}

export function SiteApp({ templateId, content, basePath, colorSchemeId, layoutVariantId }: Props) {
  const shared = { templateId, content, basePath, colorSchemeId, layoutVariantId }
  return (
    <Routes>
      <Route index element={<SitePage page="home" {...shared} />} />
      <Route path="about" element={<SitePage page="about" {...shared} />} />
      <Route path="services" element={<SitePage page="services" {...shared} />} />
      <Route path="gallery" element={<SitePage page="gallery" {...shared} />} />
      <Route path="reviews" element={<SitePage page="reviews" {...shared} />} />
      <Route path="blog" element={<SitePage page="blog" {...shared} />} />
      <Route path="blog/:slug" element={<BlogPostRoute {...shared} />} />
      <Route path="faq" element={<SitePage page="faq" {...shared} />} />
      <Route path="contact" element={<SitePage page="contact" {...shared} />} />
    </Routes>
  )
}

function BlogPostRoute(props: Props) {
  const { slug = '' } = useParams<{ slug: string }>()
  return <SitePage page="blog-post" blogSlug={slug} {...props} />
}