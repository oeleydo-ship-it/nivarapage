import type { Site } from '@uidesired/types'

/**
 * Published sites are served by the Laravel application itself, which listens
 * on one port in development. Site hostnames are stored without a port, so the
 * dashboard has to add it back when linking to a live page.
 */
const DEFAULT_SITE_PORT = '8000'

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
  const port = import.meta.env.VITE_SITE_PORT || DEFAULT_SITE_PORT
  return `http://${hostname}${port ? `:${port}` : ''}`
}

export function liveUrl(site?: Site | null, path = '/'): string | null {
  const origin = siteOrigin(primaryHostname(site))
  if (!origin) return null
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Turns the API's signed preview token into a link a person can open.
 *
 * Preview is a route in this application, so the link stays on the dashboard
 * origin. The token URL points at a POST-only API endpoint that cannot be
 * opened in a browser; only its signed query string is reusable, and the
 * preview page replays it to fetch the draft.
 */
export function previewUrl(_site: Site | null | undefined, tokenUrl: string, path = '/'): string | null {
  let query = ''
  try {
    query = new URL(tokenUrl).search.replace(/^\?/, '')
  } catch {
    query = tokenUrl.split('?')[1] || ''
  }
  const params = new URLSearchParams(query)
  params.set('path', path.startsWith('/') ? path : `/${path}`)
  return `${window.location.origin}/preview?${params.toString()}`
}

/**
 * The other half of `previewUrl`: turns the preview page's own query string
 * back into the signed API URL the token was minted from.
 *
 * Laravel signs the query in the exact order it generated it and validates the
 * raw query string, so the parameters are replayed untouched - re-sorting them
 * is a 403. Only `path` is dropped, because the dashboard added that itself for
 * its own routing and it was never part of the signature.
 */
export function previewTokenUrl(search: string, base = '/api/v1'): string | null {
  const params = new URLSearchParams(search)
  params.delete('path')
  if (!params.get('signature') || !params.get('expires') || !params.get('site')) return null
  return `${base.replace(/\/$/, '')}/public/preview?${params.toString()}`
}

export function pagePath(page?: { slug?: string; is_homepage?: boolean } | null): string {
  if (!page) return '/'
  if (page.is_homepage) return '/'
  return `/${String(page.slug || '').replace(/^\//, '')}`
}

export function standaloneFunnelUrl(publicId?: string | null, step = 'start'): string | null {
  if (!publicId) return null
  const configured = String(import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '')
  const origin =
    configured ||
    `${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_SITE_PORT || DEFAULT_SITE_PORT}`
  return `${origin}/f/${publicId}/${step}`
}
