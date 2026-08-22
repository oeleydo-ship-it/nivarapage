# Security

## Tenant isolation

- Dashboard routes require Sanctum plus `X-Workspace-Id`. Membership is checked in middleware; route bindings only load rows in that workspace.
- Public routes never return another tenant’s IDs on a miss. Unknown or invalid hosts are `{ message: "Not found." }`.
- The renderer shows a generic “Website Not Found” page and does not print site IDs, workspace names, or debug stacks to visitors.
- Disabled sites render an unavailable page instead of leaking draft content.

## Hosts and domains

- Public resolve/page/theme/navigation only run when `host` is a valid hostname (no schemes, paths, or userinfo) **and** that hostname is an **active** domain.
- Custom domains must look like `www.example.com`. Invalid values return 422.
- The renderer prefers the `Host` header. `X-Forwarded-Host` is used only when `Host` matches the Cloudflare fallback origin (`CLOUDFLARE_FALLBACK_ORIGIN`).
- Laravel `TrustHosts` is armed in staging/production (not local/tests) from `APP_URL`, `FRONTEND_URL`, `localhost`, and `TRUSTED_HOSTS`.
- Proxies are trusted so Cloudflare `X-Forwarded-*` and HTTPS detection work. Terminate TLS at the edge.

## Renderer ↔ API

- If `INTERNAL_RENDERER_SECRET` is empty, public resolve/page/theme/navigation/sitemap are open (local default). Set the secret in production.
- If the secret is set, the API requires header `X-Internal-Secret` (constant-time compare).
- Form posts from the browser go through the renderer (`/api/forms/{id}/submit`) so the Docker-internal API URL is not exposed. The honeypot field is `website` and must stay empty.

## Preview

- Preview is a **relative** signed Laravel URL (`POST /api/v1/public/preview?...`, 30 minutes). The host is not part of the signature, so the renderer can call `API_URL` even when it differs from `APP_URL`. Unsigned requests are forbidden.
- The renderer `/preview` route forwards `expires`, `site`, and `signature`, does not resolve the public hostname, does not cache, and sends `X-Frame-Options: DENY`.

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

- Published pages are block JSON, not customer PHP or arbitrary React. The renderer never `eval`s user input.
- Rich text is sanitized in `@uidesired/blocks` (no script/iframe/event handlers/`javascript:` URLs).

## Headers and cookies

- API responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and `X-Request-Id`.
- Session cookies are HTTP-only, SameSite=lax. Set `SESSION_SECURE_COOKIE=true` and `SESSION_ENCRYPT=true` in production.

## Platform

- Sanctum authenticates the dashboard. Never trust a client-supplied `workspace_id` in the body.
- Do not commit `.env` or `.env.docker`. Rotate `APP_KEY`, DB passwords, renderer secret, and Cloudflare tokens on production.
- Super-admin routes sit under `/api/v1/admin` and require `is_super_admin`.
- Cloudflare API tokens stay on Laravel only.
