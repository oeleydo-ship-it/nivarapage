import { describe, expect, it } from 'vitest'
import type { Site } from '@uidesired/types'
import { liveUrl, pagePath, previewUrl } from './siteUrls'

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

  it('links live pages at the hostname Laravel serves the site on', () => {
    expect(liveUrl(site, '/about')).toBe('http://aitools.sites.localhost:8000/about')
    expect(liveUrl({ domains: [{ hostname: 'acme.com', is_primary: true }] } as Site)).toBe('https://acme.com/')
  })

  it('uses the homepage path for homepage pages', () => {
    expect(pagePath({ slug: 'home', is_homepage: true })).toBe('/')
    expect(pagePath({ slug: 'about' })).toBe('/about')
  })
})
