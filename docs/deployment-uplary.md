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

## The front-end build

Uplary's asset step runs `npm install && npm run build`, but this is a pnpm
workspace: the dashboard depends on `workspace:*` packages that npm cannot
resolve, and `public/dashboard` is gitignored, so a release clone starts with no
dashboard at all.

The root `build` script therefore fetches pnpm through `npx` and runs the
workspace build itself. `npm run build` works unmodified, and no deploy hook is
needed. Two consequences worth knowing:

- The build needs network access to fetch pnpm on first run.
- `pnpm-lock.yaml` must stay in step with the root `package.json`, because the
  script installs with `--frozen-lockfile`. If you change a dependency, commit
  the regenerated lockfile with it or the deploy fails with
  `ERR_PNPM_OUTDATED_LOCKFILE`.

## Reference data seeds itself

The pipeline runs `migrate` but never `db:seed`, and a deployment that only
migrates comes up unusable: registration calls `assignFreePlan`, which does
`Plan::where('slug', 'free')->firstOrFail()` and 404s when the table is empty;
the template picker shows nothing; and there is no administrator to sign in as.

`migrate` is the one step every pipeline runs, so the seeding hangs off it -
`database/migrations/..._seed_reference_data.php` calls `db:seed`, which brings
in the plans, the template catalogue and the super admin. Nothing to run by
hand, and every seeder is keyed on a slug through `updateOrCreate`, so it is
safe over a database that was already seeded.

**Set `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` in `.env` before that
release.** `SuperAdminSeeder` returns without doing anything when either is
missing, silently, and you get no administrator.

To pick up templates added after that migration has already run, re-seed by
hand - the migration will not run twice:

```bash
cd /var/www/<site>/current && php artisan db:seed --class=TemplateSeeder --force
```

One thing the pipeline still does not do for you:

- **Run a queue worker.** Add the daemon and the `schedule:run` cron from
  DEPLOY.md.

Point the dashboard hostname, `*.sites.example.com`, and every custom domain at
the same site, so all of them reach this application.

## Do not add these files to public/

`robots.txt` and `sitemap.xml` are routes that answer per site. A static file of
either name in `public/` shadows the route and serves one customer's
content to everybody.
