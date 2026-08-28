#!/bin/sh
set -e

cd /var/www/html

wait_for_mysql() {
  host="${DB_HOST:-mysql}"
  port="${DB_PORT:-3306}"
  user="${DB_USERNAME:-uidesired}"
  password="${DB_PASSWORD:-secret}"
  database="${DB_DATABASE:-uidesired}"

  echo "Waiting for MySQL at ${host}:${port}..."
  i=0
  # Credentials go through the environment, never through string interpolation:
  # a password containing a quote or a backslash would otherwise produce invalid
  # PHP and make a perfectly reachable database look permanently unreachable.
  until PROBE_HOST="$host" PROBE_PORT="$port" PROBE_DB="$database" \
        PROBE_USER="$user" PROBE_PASS="$password" php -r '
    try {
      new PDO(
        sprintf("mysql:host=%s;port=%s;dbname=%s", getenv("PROBE_HOST"), getenv("PROBE_PORT"), getenv("PROBE_DB")),
        getenv("PROBE_USER"),
        getenv("PROBE_PASS")
      );
    } catch (Throwable $e) {
      fwrite(STDERR, $e->getMessage().PHP_EOL);
      exit(1);
    }
  '; do
    i=$((i + 1))
    if [ "$i" -gt 60 ]; then
      echo "MySQL was not ready in time."
      exit 1
    fi
    sleep 2
  done
}

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

if [ -z "${APP_KEY}" ] || [ "${APP_KEY}" = "base64:" ]; then
  php artisan key:generate --force --no-interaction
fi

if [ "${DB_CONNECTION:-mysql}" = "mysql" ]; then
  wait_for_mysql
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  php artisan migrate --force
  if [ "${SEED_TEMPLATES:-true}" = "true" ]; then
    php artisan db:seed --class=PlanSeeder --force
    php artisan db:seed --class=TemplateSeeder --force
  fi
  if [ "${SEED_SUPER_ADMIN:-true}" = "true" ]; then
    php artisan db:seed --class=SuperAdminSeeder --force
  fi
  if [ "${SEED_DEMO:-false}" = "true" ]; then
    php artisan db:seed --force
  fi
fi

php artisan config:clear --no-interaction || true
php artisan storage:link --force --no-interaction || true

exec "$@"
