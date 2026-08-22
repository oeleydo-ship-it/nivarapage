# UiDesired

Multi-tenant website builder: Laravel API, React dashboard, and Next.js site renderer.

## Product

Customers create a workspace, pick a template, edit pages as JSON blocks, publish, and serve the site on `*.sites.localhost` (or a custom domain). Forms post to the public API with a honeypot. Billing, domains, and an admin surface exist on the API; AI, blog, and ecommerce are not in this MVP.

## Architecture

```
                    ┌──────── Caddy (host :8088 → :80) ────────┐
                    │                                          │
     app.localhost  │  api.localhost  │  *.sites.localhost      │
            ▼       │        ▼        │          ▼             │
     Vite dashboard │   Laravel API   │   Next.js renderer     │
                    └────────┬────────┴──────────┬─────────────┘
                             │                   │
                      MySQL (internal)     Redis (internal)
```

Details: [docs/architecture.md](docs/architecture.md).

## Local URLs

Without Docker:

| URL | App |
| --- | --- |
| http://localhost:5174 | Dashboard |
| http://localhost:8000 | Laravel API |
| http://localhost:8000/api/v1/health | Health check |
| http://localhost:3100 | Renderer |
| http://localhost:8090 | Reverb (if started) |

Docker Compose (Caddy is on **8088** because host port 80 is already used):

| URL | App |
| --- | --- |
| http://app.localhost:8088 | Dashboard |
| http://api.localhost:8088 | API |
| http://api.localhost:8088/api/v1/health | Health check |
| http://{subdomain}.sites.localhost:8088 | Published tenant site |
| http://localhost:8000 | API (direct) |
| http://localhost:8090 | Reverb |

MySQL and Redis stay on the Docker network only (no host `3306`/`6379`) so they do not clash with AMPPS/Herd.

## Docker

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up --build
```

First boot runs `php artisan migrate --force`. With `SEED_DEMO=true`:

- Email: `admin@uidesired.test`
- Password: `password`

See [docs/environment.md](docs/environment.md). Production-style Compose: `docker compose -f docker-compose.prod.yml --env-file .env.docker up --build`.

## Without Docker

API (SQLite):

```bash
cd apps/api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed   # set SEED_DEMO=true in .env first
php artisan storage:link
php artisan serve
```

JavaScript apps from the repo root:

```bash
pnpm install
pnpm --filter dashboard dev
pnpm --filter renderer dev
```

Point `apps/renderer/.env.local` at `API_URL=http://127.0.0.1:8000`. The dashboard Vite server on **5174** proxies `/api` to `http://localhost:8000`.

## MVP workflow

1. Sign in on the dashboard (`admin@uidesired.test` / `password` when seeded).
2. Create a site (subdomain becomes `{name}.sites.localhost`).
3. Edit pages, save draft, publish.
4. Open `http://{subdomain}.sites.localhost:8088` (Docker) or the renderer on port 3100.
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
