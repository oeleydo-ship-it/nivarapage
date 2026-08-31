# Deploying on a managed host (Ploi, Uplary, or any VM)

UiDesired is one Laravel application. There is no renderer service, no
container image, and nothing to orchestrate: the dashboard, the API, and every
published customer site are served by the same PHP process.

Full instructions are in [../DEPLOY.md](../DEPLOY.md). This page covers only
what is specific to a managed host.

## Check this first

**PHP 8.4 or newer.** Locked Symfony packages require `>=8.4.1`; on 8.3 the
application fails while loading vendor and never boots. Node is needed to build
the front end during deployment, not to run anything.

## Ploi

1. Create a site, set **PHP 8.4+**, and point the web directory at
   `/apps/api/public`.
2. Connect the repository and enable deployments.
3. Use `./deploy.sh` from the repository root as the deploy script, or inline
   the same steps: `composer install`, `migrate --force`, `pnpm install &&
   pnpm build`, then the config/route/event caches.
4. Add the daemon and cron entry from DEPLOY.md - one queue worker, and
   `schedule:run` every minute.
5. Add the dashboard hostname, `*.sites.example.com`, and every custom domain
   to the same site, so all of them reach this application.

## Uplary

Uplary Cloud's documented application type is Custom Docker, which this project
no longer ships. **Confirm your plan can run a plain PHP application from git
before relying on this path.** If it can - or if you have SSH on the VM and can
install PHP 8.4 with nginx - the setup is identical to Ploi above.

## Do not add these files to public/

`robots.txt` and `sitemap.xml` are routes that answer per site. A static file of
either name in `apps/api/public` shadows the route and serves one customer's
content to everybody.
