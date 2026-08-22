import type { Envelope, Menu, PublicBlogIndex, PublicBlogPost, PublicPage, ResolvedSite, SitemapEntry } from "./types";

const API_URL = (process.env.API_URL || "http://laravel-api:8000").replace(/\/$/, "");

function headers(): HeadersInit {
  const secret = process.env.INTERNAL_RENDERER_SECRET;
  const result: Record<string, string> = {
    Accept: "application/json",
  };
  if (secret) {
    result["X-Internal-Secret"] = secret;
  }
  return result;
}

type FetchOptions = {
  revalidate?: number | false;
  method?: string;
  tags?: string[];
};

async function apiFetch<T>(
  path: string,
  { revalidate = 60, method = "GET", tags }: FetchOptions = {},
): Promise<{ ok: true; data: T; status: number } | { ok: false; data: null; status: number }> {
  const cache =
    revalidate === false
      ? ({ cache: "no-store" } as const)
      : ({ next: { revalidate, tags: tags?.length ? tags : undefined } } as const);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: headers(),
      ...cache,
    });

    if (!response.ok) {
      return { ok: false, data: null, status: response.status };
    }

    const json = (await response.json()) as Envelope<T>;
    return { ok: true, data: json.data, status: response.status };
  } catch {
    return { ok: false, data: null, status: 502 };
  }
}

function hostTags(host: string, siteId?: number | string | null): string[] {
  const tags = [`host:${host}`];
  if (siteId !== undefined && siteId !== null && String(siteId) !== "") {
    tags.push(`site:${siteId}`);
  }
  return tags;
}

export async function resolveSite(host: string, revalidate: number | false = 60) {
  if (!host) {
    return { ok: false as const, data: null, status: 404 };
  }
  return apiFetch<ResolvedSite>(`/api/v1/public/resolve?host=${encodeURIComponent(host)}`, {
    revalidate,
    tags: revalidate === false ? undefined : hostTags(host),
  });
}

export async function fetchPage(
  host: string,
  path: string,
  revalidate: number | false = 60,
  siteId?: number | string | null,
) {
  const normalized = path === "/" ? "/" : path.replace(/\/$/, "");
  return apiFetch<{ page: PublicPage }>(
    `/api/v1/public/page?host=${encodeURIComponent(host)}&path=${encodeURIComponent(normalized)}`,
    { revalidate, tags: revalidate === false ? undefined : hostTags(host, siteId) },
  );
}

export async function fetchFunnelPage(host: string, funnel: string, step: string, revalidate: number | false = 60) {
  return apiFetch<{ page: PublicPage; standalone?: { name: string; theme?: Record<string, unknown>; branding_removed?: boolean }; context: { funnel_id: number; funnel_slug: string; step_id: number; step_slug: string; next_step?: string | null; tracking_enabled: boolean } }>(
    `/api/v1/public/funnels/resolve?host=${encodeURIComponent(host)}&funnel=${encodeURIComponent(funnel)}&step=${encodeURIComponent(step)}`,
    { revalidate, tags: revalidate === false ? undefined : hostTags(host) },
  );
}

export async function fetchTheme(host: string, revalidate: number | false = 60, siteId?: number | string | null) {
  return apiFetch<Record<string, unknown>>(`/api/v1/public/theme?host=${encodeURIComponent(host)}`, {
    revalidate,
    tags: revalidate === false ? undefined : hostTags(host, siteId),
  });
}

export async function fetchNavigation(host: string, revalidate: number | false = 60, siteId?: number | string | null) {
  return apiFetch<Menu[]>(`/api/v1/public/navigation?host=${encodeURIComponent(host)}`, {
    revalidate,
    tags: revalidate === false ? undefined : hostTags(host, siteId),
  });
}

export async function fetchSitemap(host: string, revalidate: number | false = 60, siteId?: number | string | null) {
  return apiFetch<SitemapEntry[]>(`/api/v1/public/sitemap?host=${encodeURIComponent(host)}`, {
    revalidate,
    tags: revalidate === false ? undefined : hostTags(host, siteId),
  });
}

export async function fetchBlogPosts(host: string, revalidate: number | false = 60, siteId?: number | string | null) {
  return apiFetch<PublicBlogIndex>(`/api/v1/public/blog?host=${encodeURIComponent(host)}`, {
    revalidate,
    tags: revalidate === false ? undefined : hostTags(host, siteId),
  });
}

export async function fetchBlogPost(
  host: string,
  slug: string,
  revalidate: number | false = 60,
  siteId?: number | string | null,
) {
  return apiFetch<PublicBlogPost>(
    `/api/v1/public/blog-post?host=${encodeURIComponent(host)}&slug=${encodeURIComponent(slug)}`,
    { revalidate, tags: revalidate === false ? undefined : hostTags(host, siteId) },
  );
}

export async function fetchPreview(search: string) {
  const query = search.startsWith("?") ? search : `?${search}`;
  return apiFetch<Record<string, unknown>>(`/api/v1/public/preview${query}`, {
    method: "POST",
    revalidate: false,
  });
}

export function apiBaseUrl() {
  return API_URL;
}
