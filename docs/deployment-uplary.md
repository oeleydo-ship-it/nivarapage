# Deploying on Uplary (single server)

Uplary is treated as one VM. Run production Compose on that host.

## Shape

- One server: Caddy (80/443) + Laravel API/worker/scheduler/Reverb + renderer + dashboard + MySQL + Redis.
- No source mounts for the JavaScript apps (`docker-compose.prod.yml`).
- Persist `mysql_data` and `redis_data` volumes.
- Run migrations on deploy (`RUN_MIGRATIONS=true` on `laravel-api` only).

## Deploy loop

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
