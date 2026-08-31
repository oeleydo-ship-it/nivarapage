import { useEffect, useMemo, useState } from 'react'
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
  const [params] = useSearchParams()
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

  const view = useMemo(() => {
    if (!payload) return null

    const normalized = wanted === '/' ? '' : wanted.replace(/^\/+/, '')
    const page =
      payload.pages.find((p) => (normalized === '' ? p.is_homepage : p.slug === normalized)) ??
      payload.pages.find((p) => p.is_homepage) ??
      payload.pages[0]

    if (!page) return null

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
  }, [payload, wanted])

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

  return view
}
