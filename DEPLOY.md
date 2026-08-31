# Deploying UiDesired

One Laravel application serves everything: the builder dashboard, the API, and
every published customer website. There is no Node process at runtime, no
renderer service, and no Docker. Deployment is a git pull and two build steps.

## What runs on the server

| Piece | How it is served |
| --- | --- |
| Builder dashboard | Static build in `public/dashboard`, served by Laravel on the dashboard hostname |
| API | Laravel, under `/api` |
| Published sites | HTML rendered at publish time, stored in `page_renders`, served by Laravel on the site's own hostname |
| Site runtime | `public/site/site.js` and `public/site/site.css`, loaded by published pages |

Published pages are **not** rendered per request. When someone presses Publish,
the builder renders each page with the same React block components the editor
uses and uploads the HTML. A visitor request is one indexed lookup.

## Requirements

- PHP 8.3+ with `pdo_mysql` (or `pdo_sqlite`), `mbstring`, `gd`, `zip`
- Composer
- MySQL/MariaDB 8+ (SQLite works for small installs)
- Node 20+ and pnpm — **build time only**, not at runtime
- Redis is optional; the database queue and cache drivers are fine on one server

## First deploy

```bash
git clone <your-repo> /var/www/uidesired
cd /var/www/uidesired
cp apps/api/.env.example apps/api/.env   # then edit it, see below
composer install --no-dev --prefer-dist --optimize-autoloader -d apps/api
php apps/api/artisan key:generate --force
php apps/api/artisan migrate --force
php apps/api/artisan db:seed --class=PlanSeeder --force
php apps/api/artisan db:seed --class=SuperAdminSeeder --force
pnpm install --frozen-lockfile
pnpm build
php apps/api/artisan storage:link
```

Point the web server's document root at **`apps/api/public`**.

## Every deploy after that

```bash
./deploy.sh
```

## Environment

The hostnames are what separate the dashboard from customer sites, so these
three matter most:

```
APP_URL=https://app.example.com
FRONTEND_URL=https://app.example.com
PLATFORM_DOMAIN=sites.example.com
```

`APP_URL` and `FRONTEND_URL` are the dashboard. **Every other hostname that
reaches the app is treated as a published site** and resolved against the
`domains` table; a hostname with no active row gets a 404. Add extra dashboard
hostnames with `DASHBOARD_HOSTS=a.example.com,b.example.com`.

Point `*.sites.example.com` and every custom domain at this same server.

## Web server

Nginx, with `try_files` so built assets never reach PHP:

```nginx
server {
    listen 80;
    server_name app.example.com *.sites.example.com;   # plus custom domains
    root /var/www/uidesired/apps/api/public;
    index index.php;

    # Hashed dashboard assets can be cached hard; the site runtime has fixed
    # filenames and changes on deploy, so give it a short life instead.
    location /dashboard/assets/ { expires 1y; add_header Cache-Control "public, immutable"; }
    location /site/ { expires 1h; add_header Cache-Control "public"; }

    location / { try_files $uri $uri/ /index.php?$query_string; }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

Do not add a `robots.txt` or `sitemap.xml` file to `public/` — both are routes
that answer per site, and a static file would shadow them for every customer.

## Queue and scheduler

```
* * * * * cd /var/www/uidesired/apps/api && php artisan schedule:run >> /dev/null 2>&1
```

Run one worker, via systemd or Supervisor:

```
php /var/www/uidesired/apps/api/artisan queue:work --queue=publishing,domains,media,notifications,default
```

## Re-rendering published sites

Published HTML is rebuilt when someone presses Publish. After a deploy that
changes block markup, existing sites keep serving the HTML from their last
publish until they are published again. That is intentional: a deploy never
silently changes a customer's live page.
