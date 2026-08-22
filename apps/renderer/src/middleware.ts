import { NextResponse, type NextRequest } from "next/server";
import { isValidHost, normalizeHost, publicOrigin } from "@/lib/host";

function nextWithPathname(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-uidesired-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/preview" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return nextWithPathname(request);
  }

  const host = normalizeHost(request.headers.get("host"));
  const forwarded = normalizeHost(request.headers.get("x-forwarded-host"));
  const fallback = normalizeHost(process.env.CLOUDFLARE_FALLBACK_ORIGIN || process.env.FALLBACK_ORIGIN || "");
  const resolvedHost = fallback && host === fallback && isValidHost(forwarded) ? forwarded : host;
  if (!resolvedHost || !isValidHost(resolvedHost)) {
    return nextWithPathname(request);
  }

  const apiUrl = (process.env.API_URL || "http://laravel-api:8000").replace(/\/$/, "");
  const secret = process.env.INTERNAL_RENDERER_SECRET;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (secret) {
    headers["X-Internal-Secret"] = secret;
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/public/resolve?host=${encodeURIComponent(resolvedHost)}`, {
      headers,
      next: { revalidate: 60, tags: [`host:${resolvedHost}`] },
    });
    if (!response.ok) {
      return nextWithPathname(request);
    }
    const json = (await response.json()) as {
      data?: { redirect_to_primary?: boolean; primary_hostname?: string | null };
    };
    const data = json.data;
    if (data?.redirect_to_primary && data.primary_hostname && normalizeHost(data.primary_hostname) !== resolvedHost) {
      const origin = publicOrigin(data.primary_hostname);
      const target = `${origin}${request.nextUrl.pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(target, 301);
    }
  } catch {
    return nextWithPathname(request);
  }

  return nextWithPathname(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
