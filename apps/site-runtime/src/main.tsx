import { hydrateRoot } from "react-dom/client";
import { PublishedPage } from "@uidesired/site-render";
import type { Menu, PublicPage, ResolvedSite, SiteChromeContent } from "@uidesired/site-render";
import "./site.css";

type SiteData = {
  site: ResolvedSite;
  page: PublicPage;
  menus: Menu[];
  chrome?: SiteChromeContent;
};

/**
 * Brings a published page to life.
 *
 * The HTML was rendered when the site was published, so the markup is already
 * on screen and correct before this runs. Hydration only reattaches behaviour -
 * mobile menus, pricing toggles, carousels, form submission - to the tree that
 * is already there.
 */
function start() {
  const root = document.getElementById("site-root");
  const payload = document.getElementById("site-data");

  if (!root || !payload?.textContent) return;

  let data: SiteData;
  try {
    data = JSON.parse(payload.textContent) as SiteData;
  } catch {
    // A published page that cannot hydrate is still a complete, readable page.
    // Failing silently is correct here: throwing would replace working static
    // content with a blank screen.
    return;
  }

  hydrateRoot(root, <PublishedPage site={data.site} page={data.page} menus={data.menus} chrome={data.chrome} />);
}

start();
