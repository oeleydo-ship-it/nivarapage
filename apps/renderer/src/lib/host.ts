export function normalizeHost(raw: string | null | undefined): string {
  if (!raw) {
    return "";
  }

  const first = raw.split(",")[0]?.trim() ?? "";
  let host = first.toLowerCase();
  host = host.replace(/^https?:\/\//, "");
  host = host.split("/")[0] ?? "";
  host = host.split("?")[0] ?? "";
  host = host.split("#")[0] ?? "";
  const at = host.lastIndexOf("@");
  if (at >= 0) host = host.slice(at + 1);
  host = host.replace(/:\d+$/, "");
  host = host.replace(/\.$/, "");
  return host;
}

const HOST_PATTERN =
  /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;

export function isValidHost(host: string): boolean {
  if (!host || host.length > 253) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) {
    return host === "127.0.0.1" || host.startsWith("127.") || host === "::1" || host === "0.0.0.0";
  }
  return HOST_PATTERN.test(host);
}

export function isLocalHost(host: string): boolean {
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host.startsWith("127.") ||
    host === "0.0.0.0"
  );
}

export function publicOrigin(hostname: string): string {
  const protocol = isLocalHost(hostname) ? "http" : "https";
  return `${protocol}://${hostname}`;
}

export function requestHost(headersList: Headers): string {
  const host = normalizeHost(headersList.get("host") || "");
  const forwarded = normalizeHost(headersList.get("x-forwarded-host") || "");
  const fallback = normalizeHost(process.env.CLOUDFLARE_FALLBACK_ORIGIN || process.env.FALLBACK_ORIGIN || "");

  if (fallback && host === fallback && isValidHost(forwarded)) {
    return forwarded;
  }

  return isValidHost(host) ? host : "";
}

export function requestPath(slug?: string[]): string {
  if (!slug?.length) {
    return "/";
  }
  return `/${slug.join("/")}`;
}
