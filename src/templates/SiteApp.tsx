import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { isHospitalityTemplate } from '../data/hospitality'
import { canLinkToPage } from '../data/siteNav'
import type { SitePageId } from '../data/siteNav'
import type { SiteContent, TemplateId } from '../types'
import { RichTemplateLayout } from './RichTemplateLayout'

interface Props {
  templateId: TemplateId
  content: SiteContent
  basePath: string
  colorSchemeId?: string
  layoutVariantId?: string
}

const PAGE_ROUTE_GUARD: Partial<Record<SitePageId, keyof SiteContent['pageVisibility']>> = {
  about: 'about',
  services: 'services',
  portfolio: 'portfolio',
  gallery: 'gallery',
  blog: 'blog',
  news: 'news',
  contact: 'contact',
  rooms: 'rooms',
  'room-detail': 'rooms',
  book: 'rooms',
  'booking-confirm': 'rooms',
}

function SitePage({
  page,
  postSlug,
  ...rest
}: Props & { page: SitePageId; postSlug?: string }) {
  const guardKey = PAGE_ROUTE_GUARD[page]
  if (guardKey && !canLinkToPage(guardKey, rest.content)) {
    return <Navigate to={rest.basePath} replace />
  }
  if (page === 'blog-post' && !canLinkToPage('blog', rest.content)) {
    return <Navigate to={rest.basePath} replace />
  }
  if (page === 'news-post' && !canLinkToPage('news', rest.content)) {
    return <Navigate to={rest.basePath} replace />
  }

  return (
    <RichTemplateLayout
      variant={rest.templateId}
      content={rest.content}
      colorSchemeId={rest.colorSchemeId}
      layoutVariantId={rest.layoutVariantId}
      page={page}
      basePath={rest.basePath}
      postSlug={postSlug}
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
      {isHospitalityTemplate(templateId) ? null : <Route path="portfolio" element={<SitePage page="portfolio" {...shared} />} />}
      <Route path="gallery" element={<SitePage page="gallery" {...shared} />} />
      <Route path="rooms" element={<SitePage page="rooms" {...shared} />} />
      <Route path="rooms/:slug" element={<SitePage page="room-detail" {...shared} />} />
      <Route path="book" element={<SitePage page="book" {...shared} />} />
      <Route path="book/confirm/:code" element={<SitePage page="booking-confirm" {...shared} />} />
      <Route path="blog" element={<SitePage page="blog" {...shared} />} />
      <Route path="blog/:slug" element={<PostRoute page="blog-post" {...shared} />} />
      <Route path="news" element={<SitePage page="news" {...shared} />} />
      <Route path="news/:slug" element={<PostRoute page="news-post" {...shared} />} />
      <Route path="contact" element={<SitePage page="contact" {...shared} />} />
      <Route path="*" element={<Navigate to={basePath} replace />} />
    </Routes>
  )
}

function PostRoute({ page, ...props }: Props & { page: SitePageId }) {
  const { slug = '' } = useParams<{ slug: string }>()
  return <SitePage page={page} postSlug={slug} {...props} />
}