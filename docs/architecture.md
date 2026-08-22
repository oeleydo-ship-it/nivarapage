# Architecture

UiDesired is a multi-tenant website builder. The MVP ships three apps and a reverse proxy:

```
Browser
  │
  ├─ app.localhost        → React dashboard (Vite)
  ├─ api.localhost        → Laravel 13 JSON API
  └─ *.sites.localhost    → Next.js renderer
        │
        └─ GET /api/v1/public/*  (host query, optional X-Internal-Secret)
```

## Apps

| App | Path | Role |
| --- | --- | --- |
| API | `apps/api` | Auth, workspaces, sites, pages, domains, forms, billing, public tenant resolve |
| Dashboard | `apps/dashboard` | Logged-in builder UI |
| Renderer | `apps/renderer` | Anonymous multi-tenant site delivery |
| Blocks | `packages/blocks` | Shared `PageRenderer` for published JSON |

## Tenant resolution

1. Caddy preserves `Host` and `X-Forwarded-Host` for the renderer.
2. The renderer normalizes the host (lowercase, strip port, strip trailing dot).
3. Laravel `GET /api/v1/public/resolve?host=` returns the site, theme, and whether to 301 to the primary hostname.
4. Unknown hosts return `{ message: "Not found." }` with no tenant identifiers.
5. Published pages are `GET /api/v1/public/page?host=&path=`.

## Background work

- **Horizon** (`laravel-worker`) processes queued jobs (form notifications, domain work).
- **Scheduler** (`laravel-scheduler`) runs `php artisan schedule:work`.
- **Reverb** (`laravel-reverb`) handles WebSocket broadcasts for the dashboard.

AI, blog, and ecommerce features are out of scope for this MVP.
