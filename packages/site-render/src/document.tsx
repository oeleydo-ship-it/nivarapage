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
export function PublishedPage({
  site,
  page,
  menus,
}: {
  site: ResolvedSite;
  page: PublicPage;
  menus: Menu[];
}): ReactNode {
  const sections = page.content?.sections ?? [];
  // A page whose own content starts with a navbar supplies its own header, so
  // wrapping it in the default chrome would render two.
  const hasOwnNav = sections.some((section: { type: string }) => {
    const family = section.type.split(".")[0];
    return family === "navbar" || family === "nav" || family === "header";
  });

  const rendered = (
    <PageRenderer
      content={page.content}
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
