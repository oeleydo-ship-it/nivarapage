# Architecture

UiDesired is a multi-tenant website builder. It ships as **one Laravel
application** that serves three kinds of request, told apart by hostname.

```
Browser
  │
  ├─ app.example.com      → dashboard SPA        (public/dashboard/index.html)
  ├─ .../api/*            → Laravel JSON API
  └─ *.sites.example.com  → published site HTML  (page_renders lookup)
     and custom domains
```

`App\Support\HostRole` makes that decision: `APP_URL` and `FRONTEND_URL` (plus
`DASHBOARD_HOSTS`) are the dashboard, `PREVIEW_DOMAIN` is preview, and every
other hostname is a published site.

## Source layout

| Path | Role |
| --- | --- |
| `apps/api` | The application: auth, workspaces, sites, pages, domains, forms, billing, and the routes that serve published sites |
| `apps/dashboard` | Builder UI. Built into `apps/api/public/dashboard` |
| `apps/site-runtime` | Stylesheet and hydration script for published pages. Built into `apps/api/public/site` |
| `packages/blocks` | The block components. Used by the editor **and** the published render, so there is one implementation of each block |
| `packages/site-render` | Composes a block tree into a complete HTML document |

## How a page reaches a visitor

1. Someone presses Publish. Laravel promotes the draft revision as before.
2. The browser fetches `GET /api/v1/sites/{site}/render-payload` and renders
   every published page to HTML with the same React components the editor uses.
3. It uploads them to `POST /api/v1/sites/{site}/renders`, which stores one row
   per path in `page_renders`.
4. A visitor request resolves the hostname to a site, looks up the path, and
   returns the stored string with an ETag. Nothing is rendered per request.

Interactive blocks - mobile menus, pricing toggles, carousels, forms - are
brought to life by `public/site/site.js`, which hydrates the same component
tree over the delivered markup.

## Tenant resolution

1. `PublicSiteResolver` normalizes the host (lowercase, strip port and trailing
   dot) and looks it up in `domains`.
2. A hostname with no active row gets a 404 that reveals no tenant identifiers.
3. `TrustHosts` is deliberately not armed: valid hostnames are a database
   table, not a config list.

## Background work

- **Queue worker** processes jobs (form notifications, domain work). Horizon is
  available when Redis is.
- **Scheduler** runs via `schedule:run` from cron.
- **Reverb** handles WebSocket broadcasts for the dashboard.
