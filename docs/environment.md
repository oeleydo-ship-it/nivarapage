# Environment

Copy the files below and fill secrets before starting services.

## Docker (recommended)

```bash
cp .env.docker.example .env.docker
```

Important variables:

| Variable | Local Docker default | Purpose |
| --- | --- | --- |
| `APP_URL` | `http://api.localhost:8088` | Laravel public URL. Preview tokens are signed relatively so they still work if the renderer uses a different `API_URL`. |
| `FRONTEND_URL` | `http://app.localhost:8088` | Dashboard origin / CORS |
| `RENDERER_URL` | `http://sites.localhost:8088` | Platform site URL |
| `PLATFORM_DOMAIN` | `sites.localhost` | Subdomain suffix (`studio.sites.localhost`) |
| `INTERNAL_RENDERER_SECRET` | empty | If set, renderer sends `X-Internal-Secret` |
| `SANCTUM_EXPIRATION` | `10080` | API token lifetime in minutes (7 days) |
| `SESSION_SECURE_COOKIE` | empty | Set `true` in production HTTPS |
| `TRUSTED_HOSTS` | empty | Extra Host header allow-list (comma-separated) |
| `SEED_DEMO` | `true` | Seeds `admin@uidesired.test` / `password` |
| `MYSQL_*` | `uidesired` / `secret` | MySQL database and user |
| `QUEUE_CONNECTION` | `redis` | Horizon |
| `CACHE_STORE` | `redis` | Tenant and app cache |
| `SESSION_DRIVER` | `redis` | API sessions |
| `BROADCAST_CONNECTION` | `reverb` | Live updates |
| `DOMAIN_PROVIDER` | `fake` | Skip Cloudflare in local/dev |
| `MEDIA_DISK` | `public` | Public disk or `r2` / `s3` for customer images |
| `CLOUDFLARE_SAAS_ENABLED` | `false` | Custom hostname SaaS |
| `CLOUDFLARE_TURNSTILE_SITE_KEY` | empty | Public Turnstile key for published forms |
| `CLOUDFLARE_TURNSTILE_SECRET` | empty | Server-side Turnstile verification |
| `STRIPE_KEY` | empty | Stripe publishable key (`pk_test_...`) |
| `STRIPE_SECRET` | empty | Stripe secret key. Empty = local plan-swap fallback (no Checkout) |
| `STRIPE_WEBHOOK_SECRET` | empty | Signing secret for `/api/v1/billing/webhook` |
| `STRIPE_PRICE_*_{MONTHLY,YEARLY}` | empty | Optional Price IDs seeded onto plans |
| `GOOGLE_CLIENT_ID` | empty | Google OAuth client ID. Fallback for Admin → Google Sign-in |
| `GOOGLE_CLIENT_SECRET` | empty | Google OAuth client secret. Fallback for Admin → Google Sign-in |
| `GOOGLE_REDIRECT_URI` | `${APP_URL}/api/v1/auth/google/callback` | Must match the OAuth client exactly |

Google sign-in is normally configured in the dashboard under **Admin → Google Sign-in**, which stores the credentials in the database and overrides the `GOOGLE_*` variables above. The env keys stay useful for container builds that ship credentials at deploy time. The "Continue with Google" button only appears once the admin toggle is on *and* both credentials resolve.

Leave `STRIPE_SECRET` blank in local/demo so Pest tests and the dashboard can still change plans without a Stripe account. When it is set, paid upgrades go through Stripe Checkout; Free does not require a card.

Generate `APP_KEY` once (`php artisan key:generate --show`) and put it in `.env.docker` so API, worker, scheduler, and Reverb share the same key.

## Renderer (without Docker)

`apps/renderer/env.example`:

```
API_URL=http://127.0.0.1:8000
INTERNAL_RENDERER_SECRET=
```

Copy to `apps/renderer/.env.local`.

When the API runs in Compose, the renderer uses `API_URL=http://laravel-api:8000`.

## API without Docker

`apps/api/.env.example` defaults to SQLite. For Redis features locally, point `REDIS_HOST` at `127.0.0.1` and run Redis yourself, or keep `QUEUE_CONNECTION=sync` and `CACHE_STORE=file` for a minimal loop.
