# Ports

UiDesired avoids default ports that are already in use on this machine (AMPPS Apache/MySQL, another Vite app, Redis, Laravel Herd).

Rescanned 18 Aug 2026:

| Host port | Status |
| --- | --- |
| 80 / 443 | Busy — AMPPS `httpd` |
| 3306 | Busy — AMPPS `mysqld` |
| 5173 | Busy — another Node/Vite process |
| 8080 | Busy — reserved/Herd |
| 6379 | Busy — `redis-server` |
| 3000 | Currently free, but other Next apps often take it |
| 5174, 8000, 3100, 8088, 8090, 8443 | Free |

Chosen mapping:

| Service | Host port | Notes |
| --- | --- | --- |
| Dashboard (Vite) | **5174** | 5173 is taken by another Node process |
| Laravel API | **8000** | Free; kept |
| Next.js renderer | **3100** | Keep off 3000 so a second Next app can run |
| Caddy (Docker HTTP) | **8088** | 80/443 taken by AMPPS Apache |
| Caddy (Docker HTTPS) | **8443** | Production compose only |
| Reverb | **8090** | 8080 is occupied |
| MySQL | not published | AMPPS already owns 3306 |
| Redis | not published | A Redis server already owns 6379 |

Internal Docker ports stay standard (`mysql:3306`, `redis:6379`, `caddy:80`, `reverb:8080`, dashboard `5173`, renderer `3000`).
