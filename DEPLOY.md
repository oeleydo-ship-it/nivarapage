# Deploy UiDesired

This guide covers deploying the multi-tenant website builder: **Laravel API**, **React dashboard**, **Next.js renderer**, plus **MySQL**, **Redis**, **Horizon**, **Reverb**, and **Caddy**.

For a short single-VM checklist aimed at Uplary-style hosts, see also [docs/deployment-uplary.md](docs/deployment-uplary.md).

---

## Architecture (production)

```
Internet
   │
   ▼
Caddy (80/443) ──► api.example.com      → Laravel API (:8000)
               ──► app.example.com      → Dashboard (nginx)
               ──► *.sites.example.com  → Next.js renderer
               │
               ├── MySQL 8 (internal)
               └── Redis (cache, queue, sessions)
                        │
                        ├── Horizon (worker)
                        ├── Scheduler
                        └── Reverb (websockets)
```

Published tenant sites are served at `{subdomain}.{PLATFORM_DOMAIN}` (for example `studio.sites.example.com`).

---

## Prerequisites

- Docker + Docker Compose v2
- A Linux host with enough RAM for API + renderer + MySQL + Redis (4 GB+ recommended)
- DNS control for:
  - `api.example.com`
  - `app.example.com`
  - `*.sites.example.com` (wildcard)
  - optional `fallback.sites.example.com` (Cloudflare custom-hostname fallback)
- Outbound HTTPS for Stripe / Cloudflare / object storage (S3, Wasabi, R2, etc.) if used

---

## 1. Production deploy with Docker (recommended)

### 1.1 Clone and configure env

```bash
git clone <your-repo-url> Uidesired
cd Uidesired

cp .env.docker.example .env.docker
```

Edit `.env.docker` before the first boot:

| Variable | Production value |
| --- | --- |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | Generate once: `docker run --rm php:8.4-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)), PHP_EOL;"` or run `php artisan key:generate --show` locally |
| `APP_URL` | `https://api.example.com` |
| `FRONTEND_URL` | `https://app.example.com` |
| `RENDERER_URL` | `https://sites.example.com` |
| `PLATFORM_DOMAIN` | `sites.example.com` |
| `PREVIEW_DOMAIN` | `preview.sites.example.com` (or your preview host) |
| `INTERNAL_RENDERER_SECRET` | Long random string (shared by API + renderer) |
| `SEED_DEMO` | `false` |
| `SESSION_SECURE_COOKIE` | `true` |
| `SANCTUM_STATEFUL_DOMAINS` | `app.example.com` |
| `MYSQL_*` / `DB_*` | Strong unique passwords |
| `MEDIA_DISK` | `public` initially, or configure object storage later in Admin → Storage |
| `DOMAIN_PROVIDER` | `cloudflare` when SaaS custom hostnames are enabled |
| `CLOUDFLARE_*` / `STRIPE_*` / `WASABI_*` / `AWS_*` / `R2_*` | As needed |

`API_URL` for the renderer inside Compose should stay the internal service name, for example:

```env
API_URL=http://laravel-api:8000
```

### 1.2 Point Caddy at production hostnames

Edit `infrastructure/docker/Caddyfile` and replace `*.localhost` with your domains, for example:

```caddy
https://api.example.com {
	reverse_proxy laravel-api:8000
}

https://app.example.com {
	reverse_proxy react-dashboard:5173 {
		header_up Host {host}
		header_up X-Forwarded-Host {host}
	}
}

https://preview.sites.example.com, https://fallback.sites.example.com, https://*.sites.example.com, https://sites.example.com {
	reverse_proxy next-renderer:3000 {
		header_up Host {host}
		header_up X-Forwarded-Host {host}
		header_up X-Forwarded-Proto {scheme}
	}
}
```

Also update the `reverse-proxy` network aliases in `docker-compose.prod.yml` to match those hostnames if you rely on Compose DNS aliases.

### 1.2b Uplary Cloud Custom Docker

If the host is already an Uplary Cloud Docker server (Traefik on 80/443), do **not** start this repo’s Caddy on those ports. Build the single Custom Docker image and pull it from Uplary:

```bash
docker build -f infrastructure/docker/Dockerfile.uplary -t YOUR_DOCKERHUB_USER/uidesired:uplary .
docker push YOUR_DOCKERHUB_USER/uidesired:uplary
```

In Uplary: **Applications → Custom Docker**, image `YOUR_DOCKERHUB_USER/uidesired`, tag `uplary`, **port 8080**, and a **persistent volume mounted at `/data`**. Start from `infrastructure/docker/uplary-custom-docker.env.example`. Details: [docs/deployment-uplary.md](docs/deployment-uplary.md). Updates: [docs/update-uplary-custom-docker.md](docs/update-uplary-custom-docker.md).

#### Where the database comes from

The image bundles MariaDB, so it can run with no external database at all. `DB_EMBEDDED` picks which one is used:

| `DB_EMBEDDED` | Behaviour |
| --- | --- |
| `true` | Always use the bundled MariaDB. Data goes to `/data/mysql`. Nothing external required. |
| `auto` (image default) | Try `DB_HOST` first, fall back to the bundled MariaDB if nothing answers within `DB_WAIT_SECONDS`. Once the bundled database holds data it keeps being used. |
| `false` | External only. The container serves the dashboard and health check while it waits, and restarts itself once the database answers. |

On every boot the entrypoint creates the database and application account if they are missing, runs `php artisan migrate --force`, and seeds plans, templates and the super admin. All of it is idempotent, so redeploys are safe.

**Standalone (no external database)** — set `DB_EMBEDDED=true` and leave `DB_PASSWORD` blank; a password is generated on first boot and kept at `/data/db-password`.

**Uplary-provisioned MariaDB** — set `DB_EMBEDDED=false`, `DB_HOST=db` and a real `DB_PASSWORD`, and let Uplary add the sidecar. The entrypoint issues `CREATE DATABASE IF NOT EXISTS` when the server is up but the schema has not been created, and probes the usual renamed hostnames (`{slug}-db`, `mariadb`, `mysql`) when the panel rewrites `DB_HOST` without telling you.

> **`/data` must be a persistent volume.** The database, uploads, `APP_KEY`, the Reverb secret and the generated database password all live there. Without it, every redeploy comes up as a brand new install.

#### Minimum variables to change

Everything else in the example file has a working default:

```bash
APP_URL=https://app.example.com
FRONTEND_URL=https://app.example.com
SANCTUM_STATEFUL_DOMAINS=app.example.com   # login fails without this
SESSION_SECURE_COOKIE=true
PLATFORM_DOMAIN=sites.example.com          # must match the *.sites DNS record
REVERB_HOST=app.example.com
INTERNAL_RENDERER_SECRET=<long random string>
SUPER_ADMIN_EMAIL=you@example.com          # image default is a public one
SUPER_ADMIN_PASSWORD=<strong password>
DB_EMBEDDED=true                           # or false with a real DB_PASSWORD
```

### 1.3 Build and start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.docker up -d --build
```

On first start the API entrypoint:

1. Waits for MySQL
2. Runs `php artisan migrate --force` (when `RUN_MIGRATIONS=true` on `laravel-api`)
3. Runs `php artisan storage:link`
4. Seeds plans/templates (demo user only when `SEED_DEMO=true` **and** `APP_ENV=local`)

### 1.4 Verify

```bash
curl -fsS https://api.example.com/api/v1/health
curl -fsS https://sites.example.com/api/health
```

Open:

- Dashboard: `https://app.example.com`
- API health: `https://api.example.com/api/v1/health`
- A published site: `https://{subdomain}.sites.example.com`

### 1.5 Create the first admin

With `SEED_DEMO=false` in production, create a super admin yourself (example):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.docker exec laravel-api php artisan tinker
```

Then create/update a user with `is_super_admin = true`, or add a one-off seeder/command for your ops process.

---

## 2. DNS checklist

| Record | Target |
| --- | --- |
| `A`/`AAAA` `api.example.com` | Your server |
| `A`/`AAAA` `app.example.com` | Your server |
| `A`/`AAAA` `sites.example.com` | Your server |
| `A`/`AAAA` `*.sites.example.com` | Your server (wildcard) |
| `A`/`AAAA` `fallback.sites.example.com` | Same server (if using Cloudflare custom hostnames) |

TLS: Caddy can obtain certificates automatically when ports **80** and **443** are open and DNS already points at the host. The sample Compose file maps host **8088→80** and **8443→443** for local conflicts; for a real public VM, publish `80:80` and `443:443` instead.

---

## 3. Local / staging Docker (dev compose)

For a quick all-in-one stack on a laptop or staging box:

```bash
cp .env.docker.example .env.docker
# set APP_KEY at minimum
docker compose --env-file .env.docker up --build
```

Default URLs (Caddy on host port **8088**):

| URL | App |
| --- | --- |
| http://app.localhost:8088 | Dashboard |
| http://api.localhost:8088 | API |
| http://{sub}.sites.localhost:8088 | Published site |

Demo login when `SEED_DEMO=true`:

- Email: `admin@uidesired.test`
- Password: `password`

---

## 4. Deploy without Docker (manual)

Use this only if you already run PHP, Node, MySQL/SQLite, and Redis yourself.

### API

```bash
cd apps/api
cp .env.example .env
composer install --no-dev --optimize-autoloader
php artisan key:generate
# Set APP_ENV=production, APP_DEBUG=false, MySQL, Redis, URLs…
php artisan migrate --force
php artisan db:seed --class=PlanSeeder
php artisan db:seed --class=TemplateSeeder
php artisan storage:link
php artisan config:cache
php artisan route:cache
```

Run processes (supervisor/systemd recommended):

```bash
php artisan serve --host=0.0.0.0 --port=8000          # or php-fpm + nginx
php artisan horizon
php artisan schedule:work
php artisan reverb:start
```

On Windows local dev (no Horizon `pcntl`), use:

```bash
php artisan queue:work --queue=default,domains,publishing,media,notifications,livechat
# or: composer serve:win
```

### Dashboard

```bash
pnpm install
pnpm --filter dashboard build
# Serve apps/dashboard/dist behind nginx with SPA fallback
# Build-time: VITE_API_URL=https://api.example.com/api/v1
```

### Renderer

```bash
cp apps/renderer/env.example apps/renderer/.env.local
# API_URL=https://api.example.com   (or internal URL)
# INTERNAL_RENDERER_SECRET=same-as-api
pnpm --filter renderer build
pnpm --filter renderer start   # listens on 3100 locally; Docker image uses 3000
```

Put a reverse proxy in front so:

- `app.*` → dashboard static files  
- `api.*` → Laravel  
- `*.sites.*` → renderer (preserve `Host` / `X-Forwarded-Host`)

---

## 5. Post-deploy configuration

### Media / Wasabi / S3

1. Sign in as super admin → **Admin → Storage**
2. Choose **Local**, **Amazon S3**, **DigitalOcean Spaces**, **Cloudflare R2**, **Wasabi**, or **Custom S3-compatible**
3. Set bucket, keys, and **Public / CDN URL**
4. **Test connection** → **Save**

New uploads for all tenants go to that destination. Existing local files stay on the local disk until re-uploaded.

### Custom domains (Cloudflare SaaS)

1. Set `CLOUDFLARE_SAAS_ENABLED=true` and provider tokens on the API
2. Point fallback origin to `fallback.sites.example.com` (renderer)
3. Tenant custom hostnames resolve via Cloudflare; the renderer keys sites by `Host`

### Billing

Set `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, and plan price IDs. Webhook URL:

`https://api.example.com/api/v1/billing/webhook`

Leave `STRIPE_SECRET` empty only for local plan-swap demos.

---

## 6. Updates and rollback

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.docker up -d --build
```

- Migrations run on `laravel-api` when `RUN_MIGRATIONS=true`
- Take a MySQL dump **before** each production deploy
- Rollback = previous image tags / git revision; treat migrations as forward-only

Useful commands:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.docker ps
docker compose -f docker-compose.prod.yml --env-file .env.docker logs -f laravel-api
docker compose -f docker-compose.prod.yml --env-file .env.docker exec laravel-api php artisan horizon:status
```

---

## 7. Health & ports reference

| Check | URL / command |
| --- | --- |
| API | `GET /api/v1/health` |
| Renderer | `GET /api/health` |
| Horizon | `php artisan horizon:status` inside `laravel-api` / worker |

| Service | Typical port |
| --- | --- |
| Caddy HTTP/HTTPS | 80 / 443 (or 8088 / 8443 in sample Compose) |
| Laravel | 8000 (internal) |
| Dashboard | 5173 inside Docker / 5174 local Vite |
| Renderer | 3000 Docker / 3100 local |
| Reverb | 8080 internal (often published as 8090 locally) |
| MySQL / Redis | internal only |

More detail: [docs/ports.md](docs/ports.md), [docs/environment.md](docs/environment.md), [docs/security.md](docs/security.md), [docs/scaling.md](docs/scaling.md).

---

## 8. Security checklist

- [ ] `APP_DEBUG=false`, `APP_ENV=production`
- [ ] Strong unique `APP_KEY`, DB passwords, `INTERNAL_RENDERER_SECRET`
- [ ] `SESSION_SECURE_COOKIE=true` behind HTTPS
- [ ] Secrets only in `.env.docker` / secret manager — never baked into images
- [ ] Object-storage buckets locked down except intentional public media/CDN
- [ ] Stripe webhook signature verified
- [ ] Cloudflare tokens scoped to the minimum required

---

## Quick commands cheat sheet

```bash
# Production
cp .env.docker.example .env.docker   # then edit
# update infrastructure/docker/Caddyfile hostnames
docker compose -f docker-compose.prod.yml --env-file .env.docker up -d --build

# Local Docker
docker compose --env-file .env.docker up --build

# Stop
docker compose -f docker-compose.prod.yml --env-file .env.docker down
```
