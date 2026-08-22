import { headers } from "next/headers";
import { resolveSite } from "@/lib/api";
import { publicOrigin, requestHost } from "@/lib/host";
import { canonicalHost } from "@/lib/seo";

export const revalidate = 60;

export async function GET() {
  const host = requestHost(await headers());
  const resolved = await resolveSite(host);

  if (!resolved.ok || !resolved.data || resolved.data.status === "disabled") {
    return new Response("User-agent: *\nDisallow: /\n", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const robots = resolved.data.settings?.robots || "index";
  const hostname = canonicalHost(resolved.data, host);
  const origin = publicOrigin(hostname);

  if (robots === "noindex" || robots === "none") {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const body = `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
