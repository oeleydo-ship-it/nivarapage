import { renderToString } from "react-dom/server";
import { fontStacksFromContent, googleFontHref, themeTokensToStyle } from "@uidesired/blocks/theme";
import { PublishedPage } from "./document";
import { attr, pageSeoTags, text } from "./seo";
import type { Menu, PublicPage, ResolvedSite } from "./types";

export type RenderSiteInput = {
  site: ResolvedSite;
  page: PublicPage;
  menus: Menu[];
  /** Public path this document answers on, e.g. "/" or "/about". */
  path: string;
  /** Hostname used for canonical URLs when the site has no primary hostname. */
  host: string;
  /** Where the published-site runtime (hydration + styles) is served from. */
  runtimeBase?: string;
};

/** Turns a style object into an inline style attribute value. */
function styleAttribute(style: Record<string, unknown>): string {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const prop = key.startsWith("--") ? key : key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
      return `${prop}:${value}`;
    })
    .join(";");
}

/**
 * Renders one published page to a complete HTML document.
 *
 * Called when a site is published, not when a visitor arrives: the result is
 * stored and served as a string. The same component tree is hydrated in the
 * browser by the site runtime, so interactive blocks keep working.
 */
export function renderSiteDocument(input: RenderSiteInput): string {
  const { site, page, menus, path, host, runtimeBase = "/site" } = input;
  const tokens = (site.theme ?? {}) as Record<string, unknown>;
  const { title, tags } = pageSeoTags(site, page, path, host);

  // Fonts come from two places: the site theme, and any block that overrides
  // the font for its own section. Both must be requested or the published page
  // falls back to a system font.
  const fontHref = googleFontHref(
    ...(fontStacksFromContent(page.content) as string[]),
    typeof tokens.headingFont === "string" ? tokens.headingFont : "Inter",
    typeof tokens.bodyFont === "string" ? tokens.bodyFont : "Inter",
    typeof tokens.monoFont === "string" ? tokens.monoFont : null,
    typeof tokens.serifFont === "string" ? tokens.serifFont : null,
  );

  const body = renderToString(<PublishedPage site={site} page={page} menus={menus} />);
  const themeStyle = styleAttribute(themeTokensToStyle(tokens) as Record<string, unknown>);

  // The data the client needs to hydrate the identical tree. Serialised with
  // "<" escaped so a string inside the content cannot close the script tag.
  // Built from char codes rather than written as escapes: the replacement
  // must be the six characters that spell a JSON unicode escape, and a
  // literal "<" in this file would be the "<" character itself.
  const BS = String.fromCharCode(92);
  const hydrationData = JSON.stringify({ site, page, menus })
    .split("<")
    .join(BS + "u003c")
    .split(String.fromCharCode(0x2028))
    .join(BS + "u2028")
    .split(String.fromCharCode(0x2029))
    .join(BS + "u2029");

  const head = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${text(title)}</title>`,
    ...tags,
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    fontHref ? `<link rel="stylesheet" href="${attr(fontHref)}">` : "",
    `<link rel="stylesheet" href="${attr(runtimeBase)}/site.css">`,
  ]
    .filter(Boolean)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${attr(site.settings?.locale || "en")}"${themeStyle ? ` style="${attr(themeStyle)}"` : ""}>
<head>
${head}
</head>
<body class="min-h-full antialiased">
<div id="site-root">${body}</div>
<script id="site-data" type="application/json">${hydrationData}</script>
<script src="${attr(runtimeBase)}/site.js" defer></script>
</body>
</html>
`;
}
