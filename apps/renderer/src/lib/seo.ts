import type { Metadata } from "next";
import type { PublicPage, ResolvedSite } from "./types";
import { publicOrigin } from "./host";

export function canonicalHost(site: ResolvedSite, fallbackHost: string) {
  return site.primary_hostname || fallbackHost;
}

export function pageMetadata(site: ResolvedSite, page: PublicPage | null, path: string, host: string): Metadata {
  const hostname = canonicalHost(site, host);
  const origin = publicOrigin(hostname);
  const pathPart = path === "/" ? "/" : path;
  const canonical = page?.canonical || `${origin}${pathPart}`;
  const title = page?.seo_title || page?.og_title || page?.name || site.business_name || site.name;
  const description =
    page?.seo_description || page?.og_description || site.settings?.default_description || undefined;
  const image = page?.og_image || page?.seo_image || site.settings?.social_image || undefined;
  const robots = page?.robots || {
    index: site.settings?.robots !== "noindex" && site.settings?.robots !== "none",
    follow: site.settings?.robots !== "none",
  };

  return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: { canonical },
    robots: { index: robots.index, follow: robots.follow },
    openGraph: {
      type: "website",
      title: page?.og_title || title,
      description: page?.og_description || description,
      url: canonical,
      siteName: site.business_name || site.name,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: page?.og_title || title,
      description: page?.og_description || description,
      images: image ? [image] : undefined,
    },
    icons: site.settings?.favicon ? [{ url: site.settings.favicon }] : undefined,
  };
}
