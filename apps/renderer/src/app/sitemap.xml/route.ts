import { headers } from "next/headers";
import { fetchSitemap, resolveSite } from "@/lib/api";
import { publicOrigin, requestHost } from "@/lib/host";
import { canonicalHost } from "@/lib/seo";

export const revalidate = 60;

function pagePath(entry: { slug: string; is_homepage?: boolean; path?: string }) {
  if (entry.path) {
    return entry.path;
  }
  if (entry.is_homepage || entry.slug === "home" || entry.slug === "") {
    return "/";
  }
  return `/${entry.slug.replace(/^\/+/, "")}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  const host = requestHost(await headers());
  const resolved = await resolveSite(host);
  if (!resolved.ok || !resolved.data || resolved.data.status === "disabled") {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 404,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }

  const sitemap = await fetchSitemap(host);
  const hostname = canonicalHost(resolved.data, host);
  const origin = publicOrigin(hostname);
  const urls = sitemap.ok ? sitemap.data : [];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((entry) => {
    const loc = escapeXml(entry.loc || `${origin}${pagePath(entry)}`);
    const lastmod = entry.lastmod || entry.updated_at;
    const lastmodTag = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : "";
    return `  <url><loc>${loc}</loc>${lastmodTag}</url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
