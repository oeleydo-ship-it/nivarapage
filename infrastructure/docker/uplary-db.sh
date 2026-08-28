#!/bin/sh
# Database provisioning for the UiDesired single-container image.
#
# Sourced by uplary-entrypoint.sh. Two modes, chosen by DB_EMBEDDED:
#
#   auto  (default) - use the external server named by DB_HOST when it answers,
#                     otherwise provision and use the MariaDB bundled in this
#                     image. Once the bundled one holds data it keeps winning,
#                     so a network blip cannot silently move the app onto an
#                     empty database.
#   true            - always use the bundled MariaDB, never look outside.
#   false           - never use the bundled MariaDB; external only.

MYSQL_DATADIR=/data/mysql
MYSQL_SOCKET=/run/mysqld/mysqld.sock
embedded_db_pid=""
embedded_db_active=false

# Managed panels rename the database service, usually to {container}-db, and
# only tell you by rewriting DB_HOST - which does not always happen. Trying the
# usual names costs a second and turns a failed deploy into a working one.
db_candidates() {
  echo "${DB_HOST:-db}"
  self="$(hostname 2>/dev/null || true)"
  [ -n "$self" ] && echo "${self}-db"
  echo db
  echo mariadb
  echo mysql
}

# Credentials go through the environment, never through string interpolation:
# a password containing a quote or a backslash would otherwise produce invalid
# PHP and make a perfectly reachable database look permanently unreachable.
#
# The connection deliberately omits the database name. "Server up but schema
# missing" and "server down" are different problems with different fixes, and
# collapsing them is what leaves a container retrying forever against a server
# that was up the whole time.
probe_db() {
  PROBE_HOST="$1" PROBE_PORT="$db_port" \
  PROBE_USER="$db_user" PROBE_PASS="$db_password" \
  php -r '
    try {
      new PDO(
        sprintf("mysql:host=%s;port=%s", getenv("PROBE_HOST"), getenv("PROBE_PORT")),
        getenv("PROBE_USER"),
        getenv("PROBE_PASS"),
        [PDO::ATTR_TIMEOUT => 3]
      );
    } catch (Throwable $e) {
      fwrite(STDERR, $e->getMessage().PHP_EOL);
      exit(1);
    }
  '
}

# Creates the schema when the server is reachable but the database is not there
# yet. Panels that hand out a server without creating the database are common,
# and the application account usually owns CREATE on its own name.
ensure_database() {
  ENSURE_HOST="$1" ENSURE_PORT="$db_port" ENSURE_DB="$db_database" \
  ENSURE_USER="$db_user" ENSURE_PASS="$db_password" \
  php -r '
    $name = (string) getenv("ENSURE_DB");

    // Identifiers cannot be bound as parameters, so anything that is not a
    // plain MySQL identifier is refused rather than quoted and hoped for.
    if (! preg_match("/^[A-Za-z0-9_$]{1,64}$/", $name)) {
      fwrite(STDERR, sprintf("Refusing to use a database named \"%s\": unexpected characters." . PHP_EOL, $name));
      exit(2);
    }

    try {
      $pdo = new PDO(
        sprintf("mysql:host=%s;port=%s", getenv("ENSURE_HOST"), getenv("ENSURE_PORT")),
        getenv("ENSURE_USER"),
        getenv("ENSURE_PASS"),
        [PDO::ATTR_TIMEOUT => 3, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
      );
    } catch (Throwable $e) {
      fwrite(STDERR, $e->getMessage() . PHP_EOL);
      exit(1);
    }

    $found = $pdo->prepare("SELECT 1 FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?");
    $found->execute([$name]);
    if ($found->fetchColumn()) {
      exit(0);
    }

    try {
      $pdo->exec(sprintf(
        "CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        str_replace("`", "``", $name)
      ));
      fwrite(STDERR, sprintf("Created database \"%s\"." . PHP_EOL, $name));
      exit(0);
    } catch (Throwable $e) {
      fwrite(STDERR, sprintf(
        "Database \"%s\" does not exist and this account cannot create it: %s" . PHP_EOL,
        $name,
        $e->getMessage()
      ));
      exit(3);
    }
  '
}

# Prints the reachable host on stdout, or nothing. Never fails the script: the
# platform kills the container if the entrypoint blocks past its readiness
# window, and /api/v1/health does not need the database to answer.
find_db_host() {
  deadline=$(( $(date +%s) + ${DB_WAIT_SECONDS:-60} ))
  last_error=""

  while [ "$(date +%s)" -lt "$deadline" ]; do
    for candidate in $(db_candidates); do
      if last_error="$(probe_db "$candidate" 2>&1)"; then
        # Server and credentials are good; the schema may still be missing.
        if ensure_database "$candidate" >&2; then
          echo "$candidate"
          return 0
        fi
        last_error="the server at ${candidate} answered but database ${db_database} is unusable"
      fi
    done
    sleep 2
  done

  echo "Database not reachable after ${DB_WAIT_SECONDS:-60}s. Last error: ${last_error}" >&2
  echo "Tried: $(db_candidates | tr '\n' ' ')" >&2
  return 1
}

embedded_db_available() {
  command -v mariadbd >/dev/null 2>&1
}

embedded_db_initialized() {
  [ -d "$MYSQL_DATADIR/mysql" ]
}

start_embedded_db() {
  mkdir -p "$MYSQL_DATADIR" /run/mysqld
  chown mysql:mysql "$MYSQL_DATADIR" /run/mysqld 2>/dev/null || true

  if ! embedded_db_initialized; then
    echo "Creating the built-in MariaDB data directory at ${MYSQL_DATADIR}..."
    if ! mariadb-install-db --user=mysql --datadir="$MYSQL_DATADIR" \
        --auth-root-authentication-method=socket --skip-test-db >/dev/null; then
      echo "Could not initialise MariaDB in ${MYSQL_DATADIR}." >&2
      return 1
    fi
    chown -R mysql:mysql "$MYSQL_DATADIR" 2>/dev/null || true
  fi

  mariadbd --user=mysql --datadir="$MYSQL_DATADIR" &
  embedded_db_pid=$!

  i=0
  while [ "$i" -lt "${DB_EMBEDDED_WAIT_SECONDS:-60}" ]; do
    if mariadb-admin --socket="$MYSQL_SOCKET" ping >/dev/null 2>&1; then
      return 0
    fi
    if ! kill -0 "$embedded_db_pid" 2>/dev/null; then
      echo "The built-in MariaDB exited while starting up." >&2
      embedded_db_pid=""
      return 1
    fi
    i=$((i + 1))
    sleep 1
  done

  echo "The built-in MariaDB did not accept connections in time." >&2
  return 1
}

# Root authenticates over the unix socket, so there is no root password to
# manage or leak. The application account is the only one with a password, and
# the server never listens outside this container.
provision_embedded_db() {
  PROV_SOCKET="$MYSQL_SOCKET" PROV_DB="$db_database" \
  PROV_USER="$db_user" PROV_PASS="$db_password" \
  php -r '
    $name = (string) getenv("PROV_DB");
    $user = (string) getenv("PROV_USER");

    foreach (["database" => $name, "user" => $user] as $label => $value) {
      if (! preg_match("/^[A-Za-z0-9_$]{1,64}$/", $value)) {
        fwrite(STDERR, sprintf("Refusing to create a %s named \"%s\": unexpected characters." . PHP_EOL, $label, $value));
        exit(2);
      }
    }

    try {
      $pdo = new PDO(
        "mysql:unix_socket=" . getenv("PROV_SOCKET"),
        "root",
        "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
      );

      $quoted = str_replace("`", "``", $name);
      $account = $pdo->quote($user);
      $secret = $pdo->quote((string) getenv("PROV_PASS"));

      $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . $quoted . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

      // Both spellings: PDO reaches the server over TCP as 127.0.0.1, while
      // the command line client arrives over the socket as localhost.
      foreach (["localhost", "127.0.0.1"] as $from) {
        $host = $pdo->quote($from);
        $pdo->exec("CREATE USER IF NOT EXISTS " . $account . "@" . $host . " IDENTIFIED BY " . $secret);
        $pdo->exec("ALTER USER " . $account . "@" . $host . " IDENTIFIED BY " . $secret);
        $pdo->exec("GRANT ALL PRIVILEGES ON `" . $quoted . "`.* TO " . $account . "@" . $host);
      }

      $pdo->exec("FLUSH PRIVILEGES");
    } catch (Throwable $e) {
      fwrite(STDERR, $e->getMessage() . PHP_EOL);
      exit(1);
    }
  '
}

stop_embedded_db() {
  [ -n "$embedded_db_pid" ] || return 0
  mariadb-admin --socket="$MYSQL_SOCKET" shutdown >/dev/null 2>&1 \
    || kill "$embedded_db_pid" 2>/dev/null || true
  wait "$embedded_db_pid" 2>/dev/null || true
  embedded_db_pid=""
}

# Supervisor owns MariaDB for the life of the container, but only when the
# bundled server is the one in use. The program file is generated for the same
# reason the Caddyfile is: what should run depends on how the container was
# configured, and a static config cannot express that.
write_mariadb_supervisor_conf() {
  rm -f /etc/supervisor/conf.d/mariadb.conf

  [ "$embedded_db_active" = "true" ] || return 0

  {
    echo "[program:mariadb]"
    echo "command=/usr/sbin/mariadbd --user=mysql --datadir=${MYSQL_DATADIR}"
    echo "; Ahead of everything that connects to it. Supervisor does not wait"
    echo "; for readiness, but a head start plus autorestart on the clients is"
    echo "; enough, and the schema is already migrated by the time these run."
    echo "priority=5"
    echo "autostart=true"
    echo "autorestart=true"
    echo "stdout_logfile=/dev/stdout"
    echo "stdout_logfile_maxbytes=0"
    echo "stderr_logfile=/dev/stderr"
    echo "stderr_logfile_maxbytes=0"
  } > /etc/supervisor/conf.d/mariadb.conf
}

# The bundled server needs a password for its application account. Generating
# one and keeping it beside APP_KEY means a deployment that sets no database
# variables at all still gets a private credential rather than a known default.
resolve_embedded_password() {
  [ -z "${DB_PASSWORD:-}" ] || return 0

  if [ -s /data/db-password ]; then
    DB_PASSWORD="$(tr -d '\r\n' < /data/db-password)"
  else
    DB_PASSWORD="$(php -r 'echo bin2hex(random_bytes(16));')"
    (umask 077; printf '%s' "$DB_PASSWORD" > /data/db-password)
  fi

  export DB_PASSWORD
  db_password="$DB_PASSWORD"
}

use_embedded_db() {
  embedded_db_available || return 1

  resolve_embedded_password

  start_embedded_db || return 1
  if ! provision_embedded_db; then
    stop_embedded_db
    return 1
  fi

  DB_HOST=127.0.0.1
  DB_PORT="$db_port"
  export DB_HOST DB_PORT
  embedded_db_active=true

  echo "Using the built-in MariaDB (database ${db_database}, user ${db_user})."
  return 0
}
