# Environment

Copy the files below and fill secrets before starting services.

## Configuration

There is one env file: `apps/api/.env`. Start from `apps/api/.env.example`.

The hostname settings are the important ones - they are what separates the
dashboard from customer sites.

| Variable | Local default | Purpose |
| --- | --- | --- |
| `APP_URL` | `http://localhost:8000` | Dashboard and API origin |
| `FRONTEND_URL` | `http://localhost:8000` | Dashboard origin / CORS. Password reset links are built from this, never from the request host |
| `DASHBOARD_HOSTS` | empty | Extra dashboard hostnames, comma separated. Every hostname that is not listed here or in `APP_URL`/`FRONTEND_URL` is treated as a published customer site |
| `PLATFORM_DOMAIN` | `sites.localhost` | Subdomain suffix (`studio.sites.localhost`) |
| `PREVIEW_DOMAIN` | `preview.localhost` | Hostname that serves the draft preview route |
| `SANCTUM_EXPIRATION` | `10080` | API token lifetime in minutes (7 days) |
| `SESSION_SECURE_COOKIE` | empty | Set `true` in production HTTPS |
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

Generate `APP_KEY` once with `php artisan key:generate`. The web process, the
queue worker, the scheduler, and Reverb all read the same `.env`, so they share
it automatically.

## Local development

`apps/api/.env.example` defaults to SQLite, which is enough to run everything. For Redis features locally, point `REDIS_HOST` at `127.0.0.1` and run Redis yourself, or keep `QUEUE_CONNECTION=sync` and `CACHE_STORE=file` for a minimal loop.
