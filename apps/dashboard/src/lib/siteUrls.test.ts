import { describe, expect, it } from 'vitest'
import type { Site } from '@uidesired/types'
import { pagePath, previewUrl } from './siteUrls'

const site = {
  domains: [{ hostname: 'aitools.sites.localhost', is_primary: true, status: 'active' }],
} as Site

describe('previewUrl', () => {
  it('reuses the signed query on the renderer origin, including relative token URLs', () => {
    const absolute =
      'http://localhost:8000/api/v1/public/preview?expires=111&site=5&signature=abc'
    const relative = '/api/v1/public/preview?expires=111&site=5&signature=abc'

    expect(previewUrl(site, absolute, '/')).toBe(
      'http://aitools.sites.localhost:3100/preview?expires=111&site=5&signature=abc&path=%2F',
    )
    expect(previewUrl(site, relative, '/about')).toBe(
      'http://aitools.sites.localhost:3100/preview?expires=111&site=5&signature=abc&path=%2Fabout',
    )
  })

  it('uses the homepage path for homepage pages', () => {
    expect(pagePath({ slug: 'home', is_homepage: true })).toBe('/')
    expect(pagePath({ slug: 'about' })).toBe('/about')
  })
})
