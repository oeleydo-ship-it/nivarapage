/** Dashboard URL for a full-page template preview (opens in a new tab). */
export function templatePreviewPath(slug: string, pageSlug?: string | null): string {
  const base = `/templates/${encodeURIComponent(slug)}/preview`
  const page = (pageSlug || '').replace(/^\//, '')
  if (!page || page === 'home') return base
  return `${base}/${encodeURIComponent(page)}`
}

export function isTemplateInternalPath(href: string): boolean {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) return false
  return href.startsWith('/')
}
