import type { Metadata } from "next";
import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import { fontStacksFromContent, googleFontHref } from "@uidesired/blocks/theme";
import { fetchBlogPost, fetchBlogPosts, fetchFunnelPage, fetchNavigation, fetchPage, resolveSite } from "@/lib/api";
import { blogArticlePage, blogIndexPage, parseBlogPath } from "@/lib/blog";
import { publicOrigin, requestHost, requestPath } from "@/lib/host";
import { pageMetadata } from "@/lib/seo";
import { PageRenderer } from "@/lib/page-renderer";
import { SiteChrome, menusToNavItems } from "@/lib/site-chrome";
import { LivechatWidget } from "@/lib/livechat-widget";
import { PageMissing, SiteUnavailable, WebsiteNotFound } from "@/lib/status-pages";
import { FunnelTracker } from "@/lib/funnel-tracker";
import type { Menu, PublicPage, ResolvedSite } from "@/lib/types";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function canonicalPath(slug?: string[]) {
  return requestPath(slug);
}

function searchString(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (typeof value === "string") {
      params.set(key, value);
    }
  }
  const result = params.toString();
  return result ? `?${result}` : "";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const host = requestHost(await headers());
  const { slug } = await params;
  const path = canonicalPath(slug);
  const funnelPath = parseFunnelPath(slug);
  if (funnelPath) {
    const funnelResult = await fetchFunnelPage(host, funnelPath.funnel, funnelPath.step, false);
    if (funnelResult.ok) return pageMetadata(standaloneSite(host, funnelResult.data.standalone), funnelResult.data.page, path, host);
    return { title: "Funnel Not Found", robots: { index: false, follow: false } };
  }
  const resolved = await resolveSite(host);

  if (!resolved.ok || !resolved.data) {
    return { title: "Website Not Found", robots: { index: false, follow: false } };
  }

  const site = resolved.data;
  if (site.status === "disabled") {
    return { title: site.business_name || site.name, robots: { index: false, follow: false } };
  }

  const blogPath = parseBlogPath(path);
  if (blogPath?.kind === "post") {
    const [postResult, blog] = await Promise.all([
      fetchBlogPost(host, blogPath.slug, 60, site.site_id),
      fetchBlogPosts(host, 60, site.site_id),
    ]);
    const allowedPrefix = blog.ok ? blog.data.index_path : "/blog";
    if (postResult.ok && postResult.data && blogPath.prefix === allowedPrefix) {
      return pageMetadata(site, blogArticlePage(postResult.data), path, host);
    }
  }

  const pageResult = await fetchPage(host, path, 60, site.site_id);
  const page = pageResult.ok ? pageResult.data.page : null;
  if (page) {
    return pageMetadata(site, page, path, host);
  }

  if (blogPath?.kind === "index") {
    const blog = await fetchBlogPosts(host, 60, site.site_id);
    if (blog.ok && blog.data?.posts?.length && blogPath.prefix === (blog.data.index_path || "/blog")) {
      return pageMetadata(site, blogIndexPage(blog.data), path, host);
    }
  }

  return pageMetadata(site, page, path, host);
}

export default async function CatchAllPage({ params, searchParams }: PageProps) {
  const host = requestHost(await headers());
  const { slug } = await params;
  const path = canonicalPath(slug);
  const query = searchString(await searchParams);
  const funnelPath = parseFunnelPath(slug);
  if (funnelPath) {
    const funnelResult = await fetchFunnelPage(host, funnelPath.funnel, funnelPath.step, false);
    if (!funnelResult.ok) return <PageMissing />;
    const standalone = standaloneSite(host, funnelResult.data.standalone);
    return <>{renderPublishedPage(standalone, funnelPageWithNext(funnelResult.data.page, funnelResult.data.context), [])}<FunnelTracker context={funnelResult.data.context} /></>;
  }
  const resolved = await resolveSite(host);

  if (!resolved.ok || !resolved.data) {
    return <WebsiteNotFound />;
  }

  const site = resolved.data;

  if (site.redirect_to_primary && site.primary_hostname) {
    permanentRedirect(`${publicOrigin(site.primary_hostname)}${path}${query}`);
  }

  if (site.status === "disabled") {
    return <SiteUnavailable />;
  }

  const blogPath = parseBlogPath(path);
  const [pageResult, navResult] = await Promise.all([
    fetchPage(host, path, 60, site.site_id),
    fetchNavigation(host, 60, site.site_id),
  ]);

  let page: PublicPage | null = pageResult.ok ? pageResult.data.page : null;


  if (blogPath?.kind === "post") {
    const [postResult, blog] = await Promise.all([
      fetchBlogPost(host, blogPath.slug, 60, site.site_id),
      fetchBlogPosts(host, 60, site.site_id),
    ]);
    const allowedPrefix = blog.ok ? blog.data.index_path : "/blog";
    if (postResult.ok && postResult.data && blogPath.prefix === allowedPrefix) {
      page = blogArticlePage(postResult.data);
    }
  } else if (!page && blogPath?.kind === "index") {
    const blog = await fetchBlogPosts(host, 60, site.site_id);
    const allowedPrefix = blog.ok ? blog.data.index_path : "/blog";
    if (blog.ok && blog.data?.posts?.length && blogPath.prefix === allowedPrefix) {
      page = blogIndexPage(blog.data);
    }
  }

  if (!page) {
    return <PageMissing />;
  }

  return renderPublishedPage(site, page, navResult.ok ? navResult.data : []);
}

function parseFunnelPath(slug?: string[]) {
  if (slug?.[0] !== "f" || !slug[1]) return null;
  return { funnel: slug[1], step: slug[2] || "start" };
}

function standaloneSite(host: string, standalone?: { name: string; theme?: Record<string, unknown>; branding_removed?: boolean }): ResolvedSite {
  return { site_id: 0, name: standalone?.name || "Funnel", business_name: standalone?.name || "Funnel", status: "published", host, redirect_to_primary: false, theme: standalone?.theme || {}, branding_removed: standalone?.branding_removed ?? false, settings: { robots: "noindex" } };
}

function funnelPageWithNext(page: PublicPage, context: { funnel_slug: string; next_step?: string | null }): PublicPage {
  if (!context.next_step) return page;
  const nextUrl = `/f/${context.funnel_slug}/${context.next_step}`;
  return {
    ...page,
    content: {
      ...(page.content || {}),
      sections: (page.content?.sections || []).map((section) => ({
        ...section,
        props: section.props?.buttonUrl === '#' ? { ...section.props, buttonUrl: nextUrl } : section.props,
      })),
    },
  };
}

function renderPublishedPage(site: ResolvedSite, page: PublicPage, menus: Menu[]) {
  const sections = page.content?.sections ?? [];
  const hasOwnNav = sections.some((section) => {
    const family = section.type.split(".")[0];
    return family === "navbar" || family === "nav" || family === "header";
  });

  const navigation = menusToNavItems(menus);
  const showBranding = !site.branding_removed;
  const sectionFontHref = googleFontHref(
    ...(fontStacksFromContent(page.content) as string[]),
    typeof site.theme?.headingFont === "string" ? site.theme.headingFont : null,
    typeof site.theme?.bodyFont === "string" ? site.theme.bodyFont : null,
    typeof site.theme?.monoFont === "string" ? site.theme.monoFont : null,
    typeof site.theme?.serifFont === "string" ? site.theme.serifFont : null,
  );
  const rendered = (
    <PageRenderer
      content={page.content}
      theme={(site.theme as Parameters<typeof PageRenderer>[0]["theme"] | null | undefined) ?? undefined}
      navigation={navigation}
      pageId={page.id}
      formApiBase={site.site_id === 0 ? "funnel" : undefined}
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
      {sectionFontHref ? <link rel="stylesheet" href={sectionFontHref} /> : null}
      {framed}
      {showBranding ? (
        <div
          style={{
            textAlign: "center",
            padding: "0.75rem 1rem 1.25rem",
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          Made with UiDesired
        </div>
      ) : null}
      {site.livechat?.enabled && site.livechat.public_key ? <LivechatWidget publicKey={site.livechat.public_key} /> : null}
    </>
  );
}
