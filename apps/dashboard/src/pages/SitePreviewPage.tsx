import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PublishedPage } from '@uidesired/site-render'
import type { Menu, PublicPage, ResolvedSite } from '@uidesired/site-render'
import { apiBaseUrl } from '../lib/api'
import { previewTokenUrl } from '../lib/siteUrls'

type PreviewPayload = {
  site: { id: number; name: string; status: string }
  pages: Array<{
    id: number
    name: string
    slug: string
    is_homepage: boolean
    draft_revision?: { content_json?: unknown } | null
  }>
  theme: Record<string, unknown>
  menus: Menu[]
}

/**
 * Renders a site's unpublished draft.
 *
 * Preview is signed-in and explicitly not indexed, so unlike a published page
 * it has no reason to exist as pre-rendered HTML. Rendering it here means the
 * draft is drawn by exactly the components the editor and the published page
 * use, with no third implementation to keep in step.
 */
export default function SitePreviewPage() {
  const [params, setParams] = useSearchParams()
  const wanted = params.get('path') || '/'
  // `previewUrl` forwards the minted token's signed query on this origin rather
  // than a single `token` parameter, so the signed API URL is rebuilt from it.
  const search = params.toString()
  const tokenUrl = useMemo(() => previewTokenUrl(search, apiBaseUrl()), [search])

  const [payload, setPayload] = useState<PreviewPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenUrl) {
      setError('This preview link is missing its token.')
      return
    }

    let cancelled = false
    setError(null)
    // Posting to the signed URL is what proves the link is genuine and unexpired.
    fetch(tokenUrl, { method: 'POST', headers: { Accept: 'application/json' } })
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 403 ? 'This preview link has expired.' : `Preview unavailable (${res.status}).`)
        return res.json()
      })
      .then((body) => {
        if (!cancelled) setPayload(body.data as PreviewPayload)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })

    return () => {
      cancelled = true
    }
  }, [tokenUrl])

  /** Moves the preview to another page of the same site, keeping the signature. */
  const goTo = useCallback(
    (path: string) => {
      const next = new URLSearchParams(params)
      next.set('path', path.startsWith('/') ? path : `/${path}`)
      setParams(next)
      window.scrollTo({ top: 0 })
    },
    [params, setParams],
  )

  /**
   * Keeps in-site navigation inside the preview.
   *
   * A published page links to its own pages with site-relative hrefs, which is
   * right on the site's own hostname. The preview is served from the dashboard
   * origin, so following one leaves the preview and lands on a dashboard route
   * that does not exist - a blank page. Rewrite those to move the signed
   * `path` parameter instead, and leave everything else to the browser:
   * external links, mail and tel, downloads, new-tab targets, in-page anchors,
   * and any click carrying a modifier key.
   */
  const interceptNavigation = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as HTMLElement | null)?.closest?.('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      // An in-page anchor should still scroll rather than reload the preview.
      if (!href || href.startsWith('#') || anchor.hasAttribute('download')) return

      const target = anchor.getAttribute('target')
      if (target && target !== '_self') return

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }

      // mailto:, tel: and anything off this origin resolve to a different
      // origin and are left alone.
      if (url.origin !== window.location.origin) return

      event.preventDefault()
      goTo(url.pathname)
    },
    [goTo],
  )

  const page = useMemo(() => {
    if (!payload) return undefined

    const normalized = wanted === '/' ? '' : wanted.replace(/^\/+/, '').replace(/\/+$/, '')
    if (normalized === '') {
      return payload.pages.find((p) => p.is_homepage) ?? payload.pages[0]
    }

    // Deliberately no fall back to the homepage: quietly rendering a different
    // page than the link asked for reads as though the preview is broken.
    return payload.pages.find((p) => p.slug === normalized)
  }, [payload, wanted])

  const view = useMemo(() => {
    if (!payload || !page) return null

    const site = {
      site_id: payload.site.id,
      name: payload.site.name,
      business_name: payload.site.name,
      status: payload.site.status,
      host: window.location.host,
      redirect_to_primary: false,
      branding_removed: true,
      theme: payload.theme,
      settings: { robots: 'noindex' },
    } as unknown as ResolvedSite

    const publicPage = {
      id: page.id,
      name: page.name,
      slug: page.slug,
      content: page.draft_revision?.content_json ?? { sections: [] },
    } as unknown as PublicPage

    return <PublishedPage site={site} page={publicPage} menus={payload.menus ?? []} />
  }, [payload, page])

  useEffect(() => {
    document.title = payload ? `Preview - ${payload.site.name}` : 'Preview'
  }, [payload])

  if (error) {
    return (
      <main style={{ maxWidth: '36rem', margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '.05em', fontSize: 14, opacity: 0.7 }}>Preview unavailable</p>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600 }}>{error}</h1>
      </main>
    )
  }

  if (!payload) {
    return <main style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>Loading preview...</main>
  }

  if (!page) {
    return (
      <main style={{ maxWidth: '36rem', margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '.05em', fontSize: 14, opacity: 0.7 }}>Preview</p>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600 }}>No page at {wanted}</h1>
        <p style={{ marginTop: '0.75rem', opacity: 0.75 }}>
          This site has no page with that address. A template&rsquo;s menu can link to pages that have not been created
          yet - add the page, or point the link somewhere else in Nav.
        </p>
        <button
          type="button"
          onClick={() => goTo('/')}
          style={{ marginTop: '1.5rem', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 0 }}
        >
          Back to the homepage
        </button>
      </main>
    )
  }

  return <div onClick={interceptNavigation}>{view}</div>
}
