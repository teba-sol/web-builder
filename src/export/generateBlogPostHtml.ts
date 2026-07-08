import type { BlogPostItem, SiteContent } from '../types'
import { escapeHtml, resolveImageForExport, type ImageAsset } from './imageUtils'
import { tailwindHead } from './htmlShared'

function formatBlogDate(date: string): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function generateBlogPostHtml(
  content: SiteContent,
  post: BlogPostItem,
  accent: string,
  assets: ImageAsset[],
): string {
  const image = post.image ? resolveImageForExport(post.image, `blog-${post.slug}`, assets) : ''
  const bodyHtml = escapeHtml(post.body)
    .split('\n\n')
    .map((p) => `<p class="text-lg leading-relaxed text-slate-600 mb-6">${p.replace(/\n/g, '<br />')}</p>`)
    .join('')

  return `${tailwindHead(`${post.title} — ${content.businessName}`)}
<body class="bg-white text-slate-800">
<nav class="border-b px-6 py-4 max-w-3xl mx-auto w-full">
  <a href="../index.html" class="text-sm font-medium hover:underline opacity-70">← Back to ${escapeHtml(content.businessName)}</a>
</nav>
<article class="py-16">
  <div class="max-w-3xl mx-auto px-6">
    ${post.date ? `<p class="text-sm uppercase tracking-wider text-slate-400 mb-4">${escapeHtml(formatBlogDate(post.date))}</p>` : ''}
    <h1 class="text-4xl font-bold mb-4">${escapeHtml(post.title)}</h1>
    ${post.author ? `<p class="text-slate-500 mb-8">By ${escapeHtml(post.author)}</p>` : ''}
    ${image ? `<img src="../${image}" alt="" class="w-full rounded-2xl mb-10 aspect-[16/9] object-cover" />` : ''}
    ${post.excerpt ? `<p class="text-xl text-slate-700 mb-10 border-l-4 pl-6 italic" style="border-color:${accent}">${escapeHtml(post.excerpt)}</p>` : ''}
    <div>${bodyHtml}</div>
  </div>
</article>
<footer class="border-t py-8 text-center text-sm text-slate-500">
  <p>© ${new Date().getFullYear()} ${escapeHtml(content.businessName)}</p>
</footer>
</body></html>`
}