const modules = import.meta.glob('../assets/hero-sections/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const byId = new Map<string, string>()
for (const [path, url] of Object.entries(modules)) {
  const id = path.split('/').pop()?.replace(/\.png$/i, '')
  if (id) byId.set(id, url)
}

export function getTemplateThumbnail(id: string): string | undefined {
  return byId.get(id)
}
