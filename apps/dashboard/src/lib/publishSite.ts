import { renderSiteDocument } from '@uidesired/site-render'
import type { SiteChromeContent } from '@uidesired/site-render'
import type { Menu, PublicPage, ResolvedSite } from '@uidesired/site-render'
import { http } from './api'
import { funnelsApi, sitesApi } from './endpoints'

type RenderPayload = {
  site: ResolvedSite
  menus: Menu[]
  pages: Array<{ page_id: number; revision_id: number | null; path: string; page: PublicPage }>
  chrome?: SiteChromeContent
}

export type PublishResult = {
  /** How many pages were rendered and stored. */
  rendered: number
  /**
   * Set when publishing succeeded but the HTML could not be produced or
   * uploaded. The site is published either way; its pages just still serve the
   * previous render until the next publish.
   */
  renderError?: string
}

/**
 * Publishes a site and rebuilds the HTML its visitors receive.
 *
 * Block components are React and are shared with the editor, so the browser
 * that already has them loaded renders each published page here and uploads the
 * result. The server then serves stored HTML instead of rendering per request,
 * which is what lets the whole product run as one Laravel application.
 */
export async function publishSiteWithRenders(siteId: string | number): Promise<PublishResult> {
  await sitesApi.publish(siteId)

  try {
    // http.get already unwraps the API's { data: ... } envelope.
    const { site, menus, pages, chrome } = await http.get<RenderPayload>(`/sites/${siteId}/render-payload`)

    if (!pages.length) return { rendered: 0 }

    const renders = pages.map((entry) => ({
      path: entry.path,
      page_id: entry.page_id,
      revision_id: entry.revision_id,
      html: renderSiteDocument({
        site,
        page: entry.page,
        menus,
        path: entry.path,
        host: site.primary_hostname || site.host,
        // Every page is rendered with the same header and footer, which is what
        // makes one edit reach all of them.
        chrome,
      }),
    }))

    await http.post(`/sites/${siteId}/renders`, { renders, prune: true })

    return { rendered: renders.length }
  } catch (error) {
    // Never fail the publish because the render failed. The publish itself is
    // the durable act - the content is saved and the site is marked published.
    // Reporting the render problem separately keeps the two distinguishable.
    // It is logged rather than only returned: a silent render failure looks
    // exactly like a successful publish, and the pages quietly serve stale HTML.
    console.error('[publish] rendering the site HTML failed', error)
    return { rendered: 0, renderError: error instanceof Error ? error.message : String(error) }
  }
}

type FunnelRenderPayload = RenderPayload & { site_id: number }

/**
 * Publishes a funnel and rebuilds the HTML of its steps.
 *
 * Funnel steps are rendered by the same code path as site pages and stored
 * against the funnel's owning site under /f/{public_id}/{step}. Pruning is off:
 * these rows share a site with ordinary pages, which are published separately.
 */
export async function publishFunnelWithRenders(funnelId: string | number): Promise<PublishResult> {
  await funnelsApi.publish(funnelId)

  try {
    const payload = await http.get<FunnelRenderPayload>(`/funnels/${funnelId}/render-payload`)
    const { site, menus, pages, site_id: siteId } = payload

    if (!pages.length) return { rendered: 0 }

    const renders = pages.map((entry) => ({
      path: entry.path,
      html: renderSiteDocument({
        site,
        page: entry.page,
        menus,
        path: entry.path,
        host: window.location.host,
      }),
    }))

    await http.post(`/sites/${siteId}/renders`, { renders, prune: false })

    return { rendered: renders.length }
  } catch (error) {
    console.error('[publish] rendering the funnel HTML failed', error)
    return { rendered: 0, renderError: error instanceof Error ? error.message : String(error) }
  }
}
