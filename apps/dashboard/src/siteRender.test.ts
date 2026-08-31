import { describe, expect, it } from 'vitest'
import { renderSiteDocument } from '@uidesired/site-render'

const site = {
  site_id: 7,
  name: 'Acme',
  business_name: 'Acme Corp',
  status: 'published',
  host: 'acme.example.com',
  redirect_to_primary: false,
  branding_removed: false,
  theme: { headingFont: 'Inter', bodyFont: 'Inter', colorPrimary: '#123456' },
  settings: { locale: 'en', default_description: 'We make things.' },
} as never

const page = {
  id: 11,
  name: 'Home',
  slug: '',
  content: {
    sections: [
      { id: 's1', type: 'heroes.centered', props: { heading: 'Welcome to Acme', subheading: 'We build things' } },
    ],
  },
} as never

function render(overrides: Record<string, unknown> = {}) {
  return renderSiteDocument({ site, page, menus: [], path: '/', host: 'acme.example.com', ...overrides })
}

describe('renderSiteDocument', () => {
  it('produces a complete HTML document', () => {
    const html = render()
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<html lang="en"')
    expect(html).toContain('</html>')
  })

  it('renders the block content into static markup', () => {
    // The whole point of publish-time rendering: the words are in the HTML
    // before any JavaScript runs, which is what search engines index.
    expect(render()).toContain('Welcome to Acme')
  })

  it('inlines the block stylesheet so a page needs no extra request to look right', () => {
    expect(render()).toContain('data-uidesired-blocks')
  })

  it('emits SEO metadata from the page and site', () => {
    const html = render()
    expect(html).toContain('<title>Home</title>')
    expect(html).toContain('<link rel="canonical" href="https://acme.example.com/">')
    expect(html).toContain('content="index, follow"')
    expect(html).toContain('We make things.')
    expect(html).toContain('property="og:site_name" content="Acme Corp"')
  })

  it('honours a site that opted out of indexing', () => {
    const noindex = { ...(site as object), settings: { robots: 'none' } }
    expect(render({ site: noindex })).toContain('content="noindex, nofollow"')
  })

  it('applies theme tokens as inline custom properties on the document', () => {
    expect(render()).toMatch(/<html lang="en" style="[^"]*--/)
  })

  it('embeds hydration data with < escaped so content cannot break out of the script', () => {
    const nasty = {
      ...(page as object),
      content: { sections: [{ id: 's1', type: 'heroes.centered', props: { heading: '</script><script>alert(1)</script>' } }] },
    }
    const html = render({ page: nasty })
    const payload = html.slice(html.indexOf('<script id="site-data"'))
    expect(payload).not.toContain('</script><script>alert(1)')
    expect(payload).toContain('\u003c')
  })

  it('links the shared runtime that hydrates interactive blocks', () => {
    const html = render()
    expect(html).toContain('<link rel="stylesheet" href="/site/site.css">')
    expect(html).toContain('<script src="/site/site.js" defer></script>')
  })

  it('keeps the branding credit unless the site paid to remove it', () => {
    expect(render()).toContain('Made with UiDesired')
    const removed = { ...(site as object), branding_removed: true }
    expect(render({ site: removed })).not.toContain('Made with UiDesired')
  })
})
