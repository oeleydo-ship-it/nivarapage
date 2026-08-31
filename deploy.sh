#!/usr/bin/env bash
# Deploys the current branch on a single server. Safe to re-run.
#
# For a managed host that clones each release into its own directory (Ploi,
# Uplary, Envoyer), use the host's own pipeline instead - the Laravel app is at
# the repository root, so the stock PHP pipeline works unmodified. This script
# is for a plain VM that pulls in place.
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Fetching"
git pull --ff-only

echo "==> PHP dependencies"
composer install --no-dev --prefer-dist --optimize-autoloader

# Maintenance mode spans only the risky window: migrations and the asset swap.
# The dashboard's index.html names hashed bundles, so serving the old shell
# beside new assets for a moment is what it protects against.
php artisan down --render="errors::503" || true
trap 'php artisan up || true' EXIT

echo "==> Migrations"
php artisan migrate --force

echo "==> Front-end build"
pnpm install --frozen-lockfile
pnpm build

echo "==> Caches"
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan storage:link || true

php artisan up
trap - EXIT

echo "==> Restarting workers"
php artisan queue:restart

echo "Done."
