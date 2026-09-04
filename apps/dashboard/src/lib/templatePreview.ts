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

/**
 * Public, shareable demo URL for a template. No session needed, which is what
 * separates it from templatePreviewPath: that one lives behind the dashboard.
 */
export function templateDemoPath(slug: string, pageSlug?: string | null): string {
  const base = `/demo/${encodeURIComponent(slug)}`
  const page = (pageSlug || '').replace(/^\//, '')
  if (!page || page === 'home') return base
  return `${base}/${encodeURIComponent(page)}`
}
