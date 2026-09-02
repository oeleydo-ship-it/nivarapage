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
  platform_name: 'Acme Platform',
  platform_url: 'https://app.example.com',
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
    expect(render()).toContain('Made with Acme Platform')
    const removed = { ...(site as object), branding_removed: true }
    expect(render({ site: removed })).not.toContain('Made with Acme Platform')
  })
})

describe('site header and footer', () => {
  const chrome = {
    header: { schemaVersion: 1, sections: [{ id: 'h1', type: 'navbar.simple', version: 1, props: { logo: 'AcmeNav' } }] },
    footer: { schemaVersion: 1, sections: [{ id: 'f1', type: 'footer.simple', version: 1, props: { brand: 'AcmeFoot' } }] },
  } as never

  /** The sections actually rendered into the markup, in document order. */
  function renderedSectionIds(html: string): string[] {
    const body = html.slice(0, html.indexOf('id="site-data"'))
    return [...body.matchAll(/data-section-id="([^"]*)"/g)].map((match) => match[1])
  }

  it('wraps a page in the site header and footer, in that order', () => {
    expect(renderedSectionIds(render({ chrome }))).toEqual(['h1', 's1', 'f1'])
  })

  it('leaves a page alone when the site has no chrome', () => {
    // The feature has to be invisible until a site actually defines a header.
    expect(renderedSectionIds(render())).toEqual(['s1'])
  })

  it('does not add a second navbar to a page that already has one', () => {
    // Sites built before this existed carry a navbar on every page. Adding the
    // shared one above it would render two. The footer is a separate slot and
    // still applies.
    const withOwnNav = {
      ...(page as Record<string, unknown>),
      content: {
        schemaVersion: 1,
        sections: [
          { id: 'own', type: 'navbar.simple', version: 1, props: { logo: 'PageOwnNav' } },
          { id: 's1', type: 'heroes.centered', version: 1, props: { heading: 'Welcome to Acme' } },
        ],
      },
    } as never

    expect(renderedSectionIds(render({ page: withOwnNav, chrome }))).toEqual(['own', 's1', 'f1'])
  })

  it('ships the chrome in the hydration payload so the client builds the same tree', () => {
    // A mismatch between the rendered markup and the hydrated tree is a
    // hydration error on every published page.
    const html = render({ chrome })
    const payload = html.slice(html.indexOf('id="site-data"'))

    expect(payload).toContain('navbar.simple')
    expect(payload).toContain('footer.simple')
  })
})

describe('livechat widget', () => {
  const scriptUrl = 'https://app.example.com/api/v1/public/livechat/pk_live_abc/widget.js'

  /** Script tags in the document, so the hydration JSON is not mistaken for one. */
  function scriptSrcs(html: string): string[] {
    return [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((match) => match[1])
  }

  function withLivechat(enabled: boolean) {
    return render({
      site: {
        ...(site as Record<string, unknown>),
        livechat: { public_key: 'pk_live_abc', enabled, script_url: scriptUrl },
      } as never,
    })
  }

  it('writes the widget script into the page when the site has one enabled', () => {
    const html = withLivechat(true)

    expect(scriptSrcs(html)).toContain(scriptUrl)
    // Async so the widget cannot hold up the page it is bolted onto.
    expect(html).toContain(`<script src="${scriptUrl}" async></script>`)
  })

  it('writes no script tag when the widget is off', () => {
    // The URL still travels in the hydration payload, which is why this looks
    // for a tag rather than the string.
    expect(scriptSrcs(withLivechat(false))).not.toContain(scriptUrl)
  })

  it('writes nothing when the site has no widget at all', () => {
    expect(scriptSrcs(render()).some((src) => src.includes('livechat'))).toBe(false)
  })
})
