export interface ImageAsset {
  zipPath: string
  htmlPath: string
  data: Uint8Array
}

export function parseDataUrl(dataUrl: string): { mime: string; ext: string; data: Uint8Array } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null

  const mime = match[1]
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png'
  const binary = atob(match[2])
  const data = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i)
  return { mime, ext, data }
}

export function resolveImageForExport(
  imageUrl: string,
  assetName: string,
  assets: ImageAsset[],
): string {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('data:')) {
    const parsed = parseDataUrl(imageUrl)
    if (!parsed) return ''
    const zipPath = `assets/${assetName}.${parsed.ext}`
    assets.push({ zipPath, htmlPath: zipPath, data: parsed.data })
    return zipPath
  }
  return imageUrl
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}