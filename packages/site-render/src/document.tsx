import type { ReactNode } from "react";
import { PageRenderer } from "@uidesired/blocks";
import { SiteChrome, menusToNavItems } from "./site-chrome";
import type { Menu, PublicPage, ResolvedSite } from "./types";

/**
 * The body tree for one published page.
 *
 * This is the same composition the Next renderer used, kept in one place so the
 * publish-time render and the client-side hydration cannot drift apart.
 */
/** A section list, in the shape a page's content stores it. */
type SectionContent = { schemaVersion?: number; sections?: Array<{ type: string }> } | null | undefined;

/** The header and footer a site puts on every page. */
export type SiteChromeContent = { header?: SectionContent; footer?: SectionContent };

const familyOf = (section: { type: string }) => section.type.split(".")[0];

const isNav = (section: { type: string }) => {
  const family = familyOf(section);
  return family === "navbar" || family === "nav" || family === "header";
};

const isFooter = (section: { type: string }) => familyOf(section) === "footer";

export function PublishedPage({
  site,
  page,
  menus,
  chrome,
}: {
  site: ResolvedSite;
  page: PublicPage;
  menus: Menu[];
  chrome?: SiteChromeContent;
}): ReactNode {
  const sections = page.content?.sections ?? [];
  const headerSections = chrome?.header?.sections ?? [];
  const footerSections = chrome?.footer?.sections ?? [];

  /**
   * The site's header and footer wrap every page, but a page that still carries
   * its own navbar keeps it: sites built before this existed have one on each
   * page, and adding the shared header above it would render two. Removing the
   * page's own copy is the editing step that turns the shared one on, and doing
   * that silently here would change published pages nobody asked us to touch.
   */
  const header = sections.some(isNav) ? [] : headerSections;
  const footer = sections.some(isFooter) ? [] : footerSections;

  const composed =
    header.length === 0 && footer.length === 0
      ? page.content
      : { ...(page.content ?? {}), sections: [...header, ...sections, ...footer] };

  // Whatever ends up on the page, the default chrome is only for a page that
  // has no navigation at all from either source.
  const hasOwnNav = header.length > 0 || sections.some(isNav);

  const rendered = (
    <PageRenderer
      content={composed as typeof page.content}
      theme={(site.theme as Parameters<typeof PageRenderer>[0]["theme"] | null | undefined) ?? undefined}
      navigation={menusToNavItems(menus)}
      pageId={page.id}
      // Published pages are served by the same Laravel app that owns the
      // API, so forms post to it directly. Leaving this unset makes the
      // block try the old renderer proxy path first and waste a 404.
      formApiBase={site.site_id === 0 ? "funnel" : "/api/v1/public/forms"}
    />
  );

  const framed = hasOwnNav ? (
    rendered
  ) : (
    <SiteChrome menus={menus} siteName={site.business_name || site.name} showBranding={false}>
      {rendered}
    </SiteChrome>
  );

  return (
    <>
      {framed}
      {site.branding_removed ? null : (
        <div style={{ textAlign: "center", padding: "0.75rem 1rem 1.25rem", fontSize: 12, opacity: 0.7 }}>
          <a href="https://uidesired.com" target="_blank" rel="noopener noreferrer">
            Made with UiDesired
          </a>
        </div>
      )}
    </>
  );
}
