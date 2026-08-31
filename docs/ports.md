# Ports

In production there is **one** port: the web server in front of Laravel. The
application no longer runs a renderer, a proxy, or a container stack.

Locally, UiDesired avoids default ports that are commonly already taken on a
development machine (AMPPS Apache/MySQL, another Vite app, Redis, Herd).

| Service | Port | Notes |
| --- | --- | --- |
| Laravel (`artisan serve`) | **8000** | Serves the dashboard, the API, and published sites |
| Dashboard Vite dev server | **5174** | Optional, for iterating on the UI. 5173 is usually taken |
| Reverb | **8090** | 8080 is often occupied |
| MySQL | 3306 | Local install |
| Redis | 6379 | Optional |

Published sites are reached on port 8000 during development, for example
`http://acme.sites.localhost:8000`. `*.localhost` resolves to 127.0.0.1 on
current browsers, so no hosts-file entry is needed.
