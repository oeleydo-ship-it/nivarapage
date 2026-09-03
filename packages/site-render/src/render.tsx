import { renderToString } from "react-dom/server";
import { fontStacksFromContent, googleFontHref, themeTokensToStyle } from "@uidesired/blocks/theme";
import { PublishedPage } from "./document";
import type { SiteChromeContent } from "./document";
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
  /** The site-wide header and footer this page is wrapped in. */
  chrome?: SiteChromeContent;
  /**
   * Set when this document is a funnel step.
   *
   * A published step is static HTML served from /f/{public_id}/{slug}, and the
   * events API is addressed by numeric ids, so a block on the page cannot work
   * out which funnel it belongs to from the URL. Writing it in at publish time
   * is what lets an opt-in form record its lead and move the visitor on.
   */
  funnel?: FunnelStepContext;
};

/** Identifies the funnel step a published document is, and where it leads. */
export type FunnelStepContext = {
  funnel_id: number | string;
  funnel_slug: string;
  step_id: number | string;
  step_slug: string;
  next_step?: string | null;
  /** Which version of the step this HTML is; absent on the control. */
  variant?: string | null;
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
  const { site, page, menus, path, host, runtimeBase = "/site", chrome, funnel } = input;
  const tokens = (site.theme ?? {}) as Record<string, unknown>;
  const { title, tags } = pageSeoTags(site, page, path, host);

  // Fonts come from two places: the site theme, and any block that overrides
  // the font for its own section. Both must be requested or the published page
  // falls back to a system font.
  // The header and footer are part of the document, so a font one of them uses
  // has to be requested as well or it falls back to a system face.
  const fontHref = googleFontHref(
    ...(fontStacksFromContent(page.content) as string[]),
    ...(fontStacksFromContent(chrome?.header as Parameters<typeof fontStacksFromContent>[0]) as string[]),
    ...(fontStacksFromContent(chrome?.footer as Parameters<typeof fontStacksFromContent>[0]) as string[]),
    typeof tokens.headingFont === "string" ? tokens.headingFont : "Inter",
    typeof tokens.bodyFont === "string" ? tokens.bodyFont : "Inter",
    typeof tokens.monoFont === "string" ? tokens.monoFont : null,
    typeof tokens.serifFont === "string" ? tokens.serifFont : null,
  );

  const body = renderToString(<PublishedPage site={site} page={page} menus={menus} chrome={chrome} />);

  /**
   * The livechat widget, when the site has one switched on.
   *
   * It is a tag rather than part of the React tree because the script boots
   * and renders itself, and it is absolute because a published site is served
   * from the customer's own hostname while the widget is answered by the
   * application. Written in at publish time, so switching the widget on takes
   * effect the next time the site is published.
   */
  const livechat = site.livechat;
  const livechatTag =
    livechat?.enabled && livechat.script_url
      ? `\n<script src="${attr(livechat.script_url)}" async></script>`
      : "";
  const themeStyle = styleAttribute(themeTokensToStyle(tokens) as Record<string, unknown>);

  // The data the client needs to hydrate the identical tree. Serialised with
  // "<" escaped so a string inside the content cannot close the script tag.
  // Built from char codes rather than written as escapes: the replacement
  // must be the six characters that spell a JSON unicode escape, and a
  // literal "<" in this file would be the "<" character itself.
  const BS = String.fromCharCode(92);
  // chrome travels with the rest: hydration must build the identical tree.
  const hydrationData = JSON.stringify({ site, page, menus, chrome })
    .split("<")
    .join(BS + "u003c")
    .split(String.fromCharCode(0x2028))
    .join(BS + "u2028")
    .split(String.fromCharCode(0x2029))
    .join(BS + "u2029");

  // Escaped the same way as the hydration payload: a slug is author-supplied
  // and must not be able to close the script tag.
  const funnelTag = funnel
    ? `
<script id="ud-funnel" type="application/json">${JSON.stringify(funnel)
        .split("<")
        .join(BS + "u003c")}</script>`
    : "";

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
<script id="site-data" type="application/json">${hydrationData}</script>${funnelTag}
<script src="${attr(runtimeBase)}/site.js" defer></script>${livechatTag}
</body>
</html>
`;
}
