# Security

## Tenant isolation

- Dashboard routes require Sanctum plus `X-Workspace-Id`. Membership is checked in middleware; route bindings only load rows in that workspace.
- Public routes never return another tenant’s IDs on a miss. Unknown or invalid hosts are `{ message: "Not found." }`.
- An unrecognised hostname gets a generic “Website Not Found” page. It prints no site IDs, workspace names, or debug stacks.
- Disabled sites render an unavailable page instead of leaking draft content.

## Hosts and domains

- Public resolve/page/theme/navigation only run when `host` is a valid hostname (no schemes, paths, or userinfo) **and** that hostname is an **active** domain.
- Custom domains must look like `www.example.com`. Invalid values return 422.
- Hostnames are resolved from the request `Host` (lowercased, port and trailing dot stripped) against the `domains` table.
- Laravel `TrustHosts` is deliberately **not** armed. Valid hostnames are a
  database table (every customer's custom domain), not a config list, so an
  allow-list would reject every published site. What it normally protects is
  covered another way: password reset and verification links are built from
  `config('uidesired.frontend_url')` rather than the request host, published
  HTML is rendered at publish time so it contains no host-derived URLs, and a
  hostname with no active `domains` row gets a 404.
- Proxies are trusted so Cloudflare `X-Forwarded-*` and HTTPS detection work. Terminate TLS at the edge.

## Renderer ↔ API

- The public resolve/page/theme/navigation endpoints are readable by anyone; they only return content that is already published.
- If the secret is set, the API requires header `X-Internal-Secret` (constant-time compare).
- Published pages post forms to `/api/v1/public/forms/{id}/submit` on their own hostname, which is the same application. The honeypot field is `website` and must stay empty.

## Preview

- Preview is a **relative** signed Laravel URL (`POST /api/v1/public/preview?...`, 30 minutes). The host is not part of the signature. Unsigned requests are forbidden.
- The `/preview` route lives in the dashboard bundle, replays the signed query to fetch the draft, is marked `noindex`, and is never cached or stored.

## Authentication

- Passwords are hashed (`hashed` cast, bcrypt). Length is 8–72 characters.
- Auth routes are rate-limited (8/min per IP + email).
- API tokens expire after 7 days (`SANCTUM_EXPIRATION`, minutes) unless overridden.
- Logout deletes the current token. Password reset deletes **all** tokens for that user.
- CSRF applies to cookie/session (Sanctum stateful) requests. Bearer tokens are used by the dashboard. Stripe webhooks are excluded from CSRF.

## Uploads

- Allowed types: JPEG, PNG, WebP, AVIF, SVG. Max 10 MB per file, plus workspace storage quota.
- Raster files must decode as images. PHP/HTML payloads are rejected.
- SVG is sanitized (scripts and remote references stripped).
- `site_id` on upload must belong to the current workspace.

## HTML and execution

- Published pages are block JSON, not customer PHP or arbitrary React. Nothing
  `eval`s user input. The HTML is rendered by React, which escapes text, and
  the hydration payload embedded in each page escapes `<` so page content
  cannot close the script tag.
- Rich text is sanitized in `@uidesired/blocks` (no script/iframe/event handlers/`javascript:` URLs).

## Headers and cookies

- API responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and `X-Request-Id`.
- Session cookies are HTTP-only, SameSite=lax. Set `SESSION_SECURE_COOKIE=true` and `SESSION_ENCRYPT=true` in production.

## Platform

- Sanctum authenticates the dashboard. Never trust a client-supplied `workspace_id` in the body.
- Do not commit `.env`. Rotate `APP_KEY`, DB passwords, and Cloudflare tokens on production.
- Super-admin routes sit under `/api/v1/admin` and require `is_super_admin`.
- Cloudflare API tokens stay on Laravel only.
