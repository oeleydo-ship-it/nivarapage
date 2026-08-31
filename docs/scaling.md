# Scaling

The MVP is designed to start on one server and split later along process boundaries.

## Single server (now)

All Compose services on one host is enough for early tenants. Put MySQL backups and Redis persistence on the same disk with volume snapshots.

## Next splits

1. **Keep Redis and MySQL** on the original box (or managed equivalents) and move `next-renderer` replicas behind Caddy. The renderer is stateless aside from ISR (`revalidate: 60`).
2. **Horizon workers** scale independently. They need `pcntl`/`posix` (Linux images only).
3. **Laravel API** can be replicated once sessions and cache are on Redis (set `CACHE_STORE`, `SESSION_DRIVER` and `QUEUE_CONNECTION` to `redis`).
4. **Reverb** stays a single sticky WebSocket process until a Redis adapter is required.

## Caching

- Public tenant payloads: renderer `fetch` with `next: { revalidate: 60 }`.
- Preview (`/preview`) is never cached.
- Domain/site mapping can also live in Redis on the API (`TenantCacheService`).

## What not to split yet

AI generation, blog, and ecommerce are not part of the MVP and should not drive extra services.
