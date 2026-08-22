import type { Site } from '@uidesired/types'

/**
 * Public sites are served by the Next renderer, which runs on its own port in
 * development (see docs/ports.md). Site hostnames are stored without a port, so
 * the dashboard has to add it back when linking to a live or preview page.
 */
const DEFAULT_RENDERER_PORT = '3100'

function isLocalHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.test') ||
    hostname.endsWith('.local') ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  )
}

export function primaryHostname(site?: Site | null): string | null {
  const domains = site?.domains || []
  const primary = domains.find((domain) => domain.is_primary) || domains[0]
  return primary?.hostname || null
}

export function siteOrigin(hostname?: string | null): string | null {
  if (!hostname) return null
  if (hostname.includes('://')) return hostname.replace(/\/$/, '')
  if (!isLocalHost(hostname)) return `https://${hostname}`
  const port = import.meta.env.VITE_RENDERER_PORT || DEFAULT_RENDERER_PORT
  return `http://${hostname}${port ? `:${port}` : ''}`
}

export function liveUrl(site?: Site | null, path = '/'): string | null {
  const origin = siteOrigin(primaryHostname(site))
  if (!origin) return null
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Turns the API's signed preview token into a renderer URL. The token URL points
 * at the API's POST-only, renderer-secret-protected endpoint, so it cannot be
 * opened in a browser; only its signed query string is reusable.
 */
export function previewUrl(site: Site | null | undefined, tokenUrl: string, path = '/'): string | null {
  const origin = siteOrigin(primaryHostname(site))
  if (!origin) return null
  let query = ''
  try {
    query = new URL(tokenUrl).search.replace(/^\?/, '')
  } catch {
    query = tokenUrl.split('?')[1] || ''
  }
  const params = new URLSearchParams(query)
  params.set('path', path.startsWith('/') ? path : `/${path}`)
  return `${origin}/preview?${params.toString()}`
}

export function pagePath(page?: { slug?: string; is_homepage?: boolean } | null): string {
  if (!page) return '/'
  if (page.is_homepage) return '/'
  return `/${String(page.slug || '').replace(/^\//, '')}`
}

export function standaloneFunnelUrl(publicId?: string | null, step = 'start'): string | null {
  if (!publicId) return null
  const configured = String(import.meta.env.VITE_RENDERER_URL || '').replace(/\/$/, '')
  const origin = configured || `${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_RENDERER_PORT || DEFAULT_RENDERER_PORT}`
  return `${origin}/f/${publicId}/${step}`
}
