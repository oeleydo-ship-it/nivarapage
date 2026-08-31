#!/usr/bin/env bash
# Deploys the current branch on a single server. Safe to re-run.
set -euo pipefail

cd "$(dirname "$0")"
API=apps/api

echo "==> Fetching"
git pull --ff-only

echo "==> PHP dependencies"
composer install --no-dev --prefer-dist --optimize-autoloader -d "$API"

# Maintenance mode spans only the risky window: migrations and the asset swap.
# The dashboard's index.html names hashed bundles, so serving the old shell
# beside new assets for a moment is what it protects against.
php "$API/artisan" down --render="errors::503" || true
trap 'php "$API/artisan" up || true' EXIT

echo "==> Migrations"
php "$API/artisan" migrate --force

echo "==> Front-end build"
pnpm install --frozen-lockfile
pnpm build

echo "==> Caches"
php "$API/artisan" config:cache
php "$API/artisan" route:cache
php "$API/artisan" event:cache
php "$API/artisan" storage:link || true

php "$API/artisan" up
trap - EXIT

echo "==> Restarting workers"
php "$API/artisan" queue:restart

echo "Done."
