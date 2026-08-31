import { describe, expect, it } from 'vitest'
import type { Site } from '@uidesired/types'
import { liveUrl, pagePath, previewTokenUrl, previewUrl } from './siteUrls'

const site = {
  domains: [{ hostname: 'aitools.sites.localhost', is_primary: true, status: 'active' }],
} as Site

describe('previewUrl', () => {
  it('reuses the signed query on the dashboard origin, including relative token URLs', () => {
    const absolute = 'http://localhost:8000/api/v1/public/preview?expires=111&site=5&signature=abc'
    const relative = '/api/v1/public/preview?expires=111&site=5&signature=abc'
    const origin = window.location.origin

    // Preview is a route in this application now, so the link stays here
    // rather than pointing at a separate renderer.
    expect(previewUrl(site, absolute, '/')).toBe(
      `${origin}/preview?expires=111&site=5&signature=abc&path=%2F`,
    )
    expect(previewUrl(site, relative, '/about')).toBe(
      `${origin}/preview?expires=111&site=5&signature=abc&path=%2Fabout`,
    )
  })

  it('rebuilds the signed API url from the link it produced', () => {
    const tokenUrl = '/api/v1/public/preview?expires=111&site=5&signature=abc'
    const link = previewUrl(site, tokenUrl, '/about') as string
    const search = new URL(link).search

    // Round trip: what the preview page replays must be byte-identical to the
    // token the API minted. Laravel validates the raw query string, so a
    // re-ordered or re-encoded replay is a 403 rather than a preview.
    expect(previewTokenUrl(search)).toBe(tokenUrl)
  })

  it('keeps the signed parameters in their original order', () => {
    expect(previewTokenUrl('?site=5&expires=111&signature=abc&path=%2F')).toBe(
      '/api/v1/public/preview?site=5&expires=111&signature=abc',
    )
  })

  it('honours a configured api base', () => {
    expect(previewTokenUrl('?expires=111&site=5&signature=abc', 'http://127.0.0.1:8000/api/v1')).toBe(
      'http://127.0.0.1:8000/api/v1/public/preview?expires=111&site=5&signature=abc',
    )
  })

  it('reports a link that carries no signature', () => {
    expect(previewTokenUrl('?path=%2F')).toBeNull()
    expect(previewTokenUrl('?expires=111&site=5')).toBeNull()
  })

  it('links live pages at the hostname Laravel serves the site on', () => {
    expect(liveUrl(site, '/about')).toBe('http://aitools.sites.localhost:8000/about')
    expect(liveUrl({ domains: [{ hostname: 'acme.com', is_primary: true }] } as Site)).toBe('https://acme.com/')
  })

  it('uses the homepage path for homepage pages', () => {
    expect(pagePath({ slug: 'home', is_homepage: true })).toBe('/')
    expect(pagePath({ slug: 'about' })).toBe('/about')
  })
})
