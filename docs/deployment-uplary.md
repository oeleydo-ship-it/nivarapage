# Deploying on Uplary (single server)

Uplary Cloud **Custom Docker** can run the all-in-one image in `infrastructure/docker/Dockerfile.uplary` (one container, port **8080**). That is the path when you already have a provisioned Docker server in Uplary.

Uplary is treated as one VM. You can also skip Custom Docker and run production Compose on that host.

## Shape

- One server: Caddy (80/443) + Laravel API/worker/scheduler/Reverb + renderer + dashboard + MySQL + Redis.
- No source mounts for the JavaScript apps (`docker-compose.prod.yml`).
- Persist `mysql_data` and `redis_data` volumes.
- Run migrations on deploy (`RUN_MIGRATIONS=true` on `laravel-api` only).

## Uplary Cloud Custom Docker

Custom Docker pulls **one image** and publishes **one port**. Traefik terminates TLS. Do not run UiDesired’s Caddy on 80/443 next to `uplary-traefik`.

1. Build and push from the UiDesired repo (Windows):

   ```powershell
   powershell -File infrastructure/docker/build-uplary-image.ps1 -Registry YOUR_DOCKERHUB_USER
   ```

   Or:

   ```bash
   docker build -f infrastructure/docker/Dockerfile.uplary -t YOUR_DOCKERHUB_USER/uidesired:uplary .
   docker push YOUR_DOCKERHUB_USER/uidesired:uplary
   ```

2. In Uplary: **Applications → Custom Docker**.
   - Image: `YOUR_DOCKERHUB_USER/uidesired`
   - Tag: `uplary`
   - Container port: `8080`
   - Domain: `app.example.com`
   - Memory: **2048 MB** or more
   - Environment: copy [infrastructure/docker/uplary-custom-docker.env.example](../infrastructure/docker/uplary-custom-docker.env.example). Set `APP_KEY`, `DB_PASSWORD`, `INTERNAL_RENDERER_SECRET`, and `REVERB_APP_SECRET`. Keep **`DB_HOST=db`** so Uplary starts MariaDB. First boot seeds templates and the super admin (`admin@uidesired.test` / `password` unless you override `SUPER_ADMIN_*`).

3. DNS: `app.example.com` (and later `sites.example.com` / `*.sites.example.com`) → the server IP.

4. Traefik only forwards the **one** Custom Docker hostname by default. Dashboard and `/api` work on `app.example.com`. For tenant sites, add `sites.example.com` (and the wildcard) as extra domains on the **same** deployment if the UI allows it, or deploy `infrastructure/docker/Dockerfile.renderer` as a second Custom Docker on port **3000** with `API_URL=https://app.example.com` and the same `INTERNAL_RENDERER_SECRET`.

The image ships Redis, Horizon, the scheduler, Reverb, the dashboard, the API, and the renderer. Uploads persist on Uplary’s `{slug}-data` volume mounted at `/data`.

To ship bug fixes later: [update-uplary-custom-docker.md](update-uplary-custom-docker.md).

## Deploy loop (Compose on the VM)

1. Copy `.env.docker.example` to `.env.docker` on the server. Set a real `APP_KEY`, MySQL passwords, and `APP_DEBUG=false`.
2. Point `APP_URL`, `FRONTEND_URL`, `RENDERER_URL`, and `PLATFORM_DOMAIN` at production hostnames.
3. `docker compose -f docker-compose.prod.yml --env-file .env.docker up -d --build`
4. Confirm health:
   - API: `https://api.example.com/api/v1/health`
   - Renderer: `https://sites.example.com/api/health`
5. Rollback = previous image tags + `migrate` is forward-only; take a MySQL dump before each deploy.

## DNS

- `api.example.com` → this server (Laravel).
- `app.example.com` → this server (dashboard).
- Wildcard `*.sites.example.com` → this server (renderer).
- `fallback.sites.example.com` → same renderer origin used as the Cloudflare custom-hostname fallback.

Update the Caddyfile hostnames to match production (replace `*.localhost`).

## Cloudflare custom hostnames

When a tenant maps `www.customer.com`:

1. Create the hostname against the SaaS zone.
2. Fallback origin: `fallback.sites.example.com` (must resolve to the renderer).
3. The renderer still keys tenants by `Host` / `X-Forwarded-Host`.
4. Keep `CLOUDFLARE_SAAS_ENABLED=true` and provider tokens only on the API.

## Secrets

Do not bake secrets into images. Inject `.env.docker` (or the host secret manager) at runtime: `APP_KEY`, DB passwords, `INTERNAL_RENDERER_SECRET`, Cloudflare tokens, Reverb keys.

## Preview says "Preview unavailable"

The preview page is rendered by the renderer, which POSTs the signed link back
to the API. Four different faults used to look identical in the browser, so the
page now names the cause and the renderer logs it. Run the chain end to end from
inside the container:

```
php artisan uidesired:preview-doctor
```

It mints a real token, calls the API the way the renderer does, and prints which
link broke. What each result means:

| Result | Cause | Fix |
| --- | --- | --- |
| `403 Invalid renderer secret.` | `INTERNAL_RENDERER_SECRET` differs between API and renderer | Set the same value for both, restart. Leaving it blank on both is also valid. |
| `403` with any other message | Signature rejected: `APP_KEY` changed after the link was issued, the clock is wrong, or a proxy rewrote the path/query | Pin `APP_KEY` (the entrypoint persists a generated one to `/data/app-key`, so `/data` must be a real volume) and keep `/api/*` unrewritten. |
| Connection error | `API_URL` is wrong or the API is not listening | Inside the container: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/up`. |
| `404` | A proxy is stripping the `/api` prefix | Route `/api*` to the API untouched. |
| PASS, but the browser still fails | The break is browser → renderer, not renderer → API | Check the site's host reaches the renderer, not the dashboard static files. |

Preview links are valid for 30 minutes. An expired one now says so, and the
renderer skips the API call entirely for it.

### Why the API can drop the renderer's call

The image serves the API with `php artisan serve`, which is PHP's built-in
server: **one request at a time** unless `PHP_CLI_SERVER_WORKERS` is set. The
renderer calls the API *while* it is rendering a page, so a single worker means
any overlapping request - the 20s health check, a dashboard poll - can reset the
renderer's connection. The renderer reports that as "could not reach the API".

The image now ships `PHP_CLI_SERVER_WORKERS=8`; raise it from the panel if the
deployment is busy. This is a stopgap: `artisan serve` is not a production
server. The durable fix is php-fpm behind Caddy (`php_fastcgi 127.0.0.1:9000`
with `root * /var/www/html/public`), which needs the `php:8.4-fpm-bookworm` base.
