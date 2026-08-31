# UiDesired

Multi-tenant website builder. One Laravel application serves the builder
dashboard, the API, and every published customer site.

## Product

Customers create a workspace, pick a template, edit pages as JSON blocks,
publish, and serve the site on `*.sites.localhost` (or a custom domain). Forms
post to the public API with a honeypot. Billing, domains, and an admin surface
exist on the API.

## Architecture

```
                     one Laravel app (apps/api)
   ┌───────────────────────────┴───────────────────────────┐
   │  app.example.com   │  /api/*  │  *.sites.example.com   │
   │        ▼           │     ▼    │           ▼            │
   │  dashboard SPA     │ Laravel  │  HTML stored at        │
   │  public/dashboard  │  routes  │  publish time          │
   └───────────────────────────┬───────────────────────────┘
                         MySQL  ·  Redis (optional)
```

Requests are routed by **hostname**: `APP_URL` and `FRONTEND_URL` are the
dashboard, and every other hostname is looked up in the `domains` table and
served its published HTML.

Published pages are not rendered per request. Pressing Publish renders each
page in the browser - using the same React block components the editor draws
with - and uploads the HTML, which Laravel then serves as a string. There is
no Node process at runtime.

Details: [docs/architecture.md](docs/architecture.md).

## Local development

Laravel (SQLite is fine):

```bash
cd apps/api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed --class=PlanSeeder
php artisan db:seed --class=SuperAdminSeeder
php artisan storage:link
php artisan serve            # http://localhost:8000
```

Front end, from the repository root:

```bash
pnpm install
pnpm build                   # builds into apps/api/public/{dashboard,site}
```

That is enough to use the whole app on <http://localhost:8000>. For iterating
on the dashboard, `pnpm --filter dashboard dev` runs Vite on **5174** with
`/api` proxied to port 8000; `pnpm --filter site-runtime dev` rebuilds the
published-site runtime on change.

Requires **PHP 8.4+** (locked Symfony packages need `>=8.4.1`) and Node 22.12+.

| URL | What |
| --- | --- |
| http://localhost:8000 | Dashboard, API, and published sites |
| http://localhost:8000/api/v1/health | Health check |
| http://{subdomain}.sites.localhost:8000 | A published site |
| http://localhost:5174 | Dashboard dev server (optional) |
## MVP workflow

1. Sign in on the dashboard (`admin@uidesired.test` / `password` when seeded).
2. Create a site (subdomain becomes `{name}.sites.localhost`).
3. Edit pages, save draft, publish.
4. Open `http://{subdomain}.sites.localhost:8000`.
5. Optional: attach a custom hostname; secondary hosts 301 to the primary when that setting is on.
6. Collect leads via contact forms (`website` honeypot stays empty).

## Docs

- [Deploy](DEPLOY.md)
- [Architecture](docs/architecture.md)
- [Environment](docs/environment.md)
- [Ports](docs/ports.md)
- [Uplary deployment](docs/deployment-uplary.md)
- [Scaling](docs/scaling.md)
- [Security](docs/security.md)
