import type { PublicPage, ResolvedSite } from "./types";

export function publicOrigin(hostname: string): string {
  const bare = hostname.split(":")[0];
  const local =
    bare === "localhost" ||
    bare === "127.0.0.1" ||
    bare.endsWith(".localhost") ||
    bare.endsWith(".test") ||
    bare.endsWith(".local");
  return `${local ? "http" : "https"}://${hostname}`;
}

export function canonicalHost(site: ResolvedSite, fallbackHost: string) {
  return site.primary_hostname || fallbackHost;
}

/** Escapes a value for use inside a double-quoted HTML attribute. */
export function attr(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escapes a value for use as HTML text content. */
export function text(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type SeoTags = {
  title: string;
  tags: string[];
};

/**
 * The head tags for one published page.
 *
 * This replaces the Next `Metadata` object the renderer used to return. Next
 * turned that object into tags itself; here the tags are the output, because
 * the HTML is written once at publish time and served as a string.
 */
export function pageSeoTags(
  site: ResolvedSite,
  page: PublicPage | null,
  path: string,
  host: string,
): SeoTags {
  const hostname = canonicalHost(site, host);
  const origin = publicOrigin(hostname);
  const canonical = page?.canonical || `${origin}${path === "/" ? "/" : path}`;
  const title = page?.seo_title || page?.og_title || page?.name || site.business_name || site.name;
  const description =
    page?.seo_description || page?.og_description || site.settings?.default_description || undefined;
  const image = page?.og_image || page?.seo_image || site.settings?.social_image || undefined;
  const robots = page?.robots || {
    index: site.settings?.robots !== "noindex" && site.settings?.robots !== "none",
    follow: site.settings?.robots !== "none",
  };

  const ogTitle = page?.og_title || title;
  const ogDescription = page?.og_description || description;
  const siteName = site.business_name || site.name;

  const tags: string[] = [
    `<link rel="canonical" href="${attr(canonical)}">`,
    `<meta name="robots" content="${robots.index ? "index" : "noindex"}, ${robots.follow ? "follow" : "nofollow"}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${attr(ogTitle)}">`,
    `<meta property="og:url" content="${attr(canonical)}">`,
    `<meta property="og:site_name" content="${attr(siteName)}">`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`,
    `<meta name="twitter:title" content="${attr(ogTitle)}">`,
  ];

  if (description) {
    tags.push(`<meta name="description" content="${attr(description)}">`);
    tags.push(`<meta name="twitter:description" content="${attr(description)}">`);
  }
  if (ogDescription) tags.push(`<meta property="og:description" content="${attr(ogDescription)}">`);
  if (image) {
    tags.push(`<meta property="og:image" content="${attr(image)}">`);
    tags.push(`<meta name="twitter:image" content="${attr(image)}">`);
  }
  if (site.settings?.favicon) {
    tags.push(`<link rel="icon" href="${attr(site.settings.favicon)}">`);
  }

  return { title, tags };
}
