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
   `/public`.
2. Connect the repository and enable deployments.
3. Use `./deploy.sh` from the repository root as the deploy script, or inline
   the same steps: `composer install`, `migrate --force`, `pnpm install &&
   pnpm build`, then the config/route/event caches.
4. Add the daemon and cron entry from DEPLOY.md - one queue worker, and
   `schedule:run` every minute.
5. Add the dashboard hostname, `*.sites.example.com`, and every custom domain
   to the same site, so all of them reach this application.

## Uplary

Uplary clones each release into `releases/<timestamp>` and then runs its own
fixed Laravel pipeline - `composer install`, `artisan migrate`, the caches -
**from the release root**. It never runs `deploy.sh`.

That is why the Laravel application sits at the repository root rather than in
`apps/api`. The stock pipeline finds `composer.json` and `artisan` where it
expects them, and nothing about the deploy needs customising.

Set on the site:

- **PHP 8.4+**. On 8.3 the app fails while loading vendor.
- **Web directory `/public`**.
- **Shared `.env`** at the release root - the same file every release symlinks to.
- **Shared `storage/`**, so uploads and logs survive a release swap.

Two things the pipeline does not do for you:

- **Build the front end.** Uplary's Node step runs npm, but this repo is a pnpm
  workspace and the dashboard depends on `workspace:*` packages that npm cannot
  resolve. Add `corepack enable && pnpm install --frozen-lockfile && pnpm build`
  as a deploy hook, or build `public/dashboard` and `public/site` in CI and ship
  them as artefacts. Without it the release serves no dashboard.
- **Run a queue worker.** Add the daemon and the `schedule:run` cron from
  DEPLOY.md.

Point the dashboard hostname, `*.sites.example.com`, and every custom domain at
the same site, so all of them reach this application.

## Do not add these files to public/

`robots.txt` and `sitemap.xml` are routes that answer per site. A static file of
either name in `public/` shadows the route and serves one customer's
content to everybody.
