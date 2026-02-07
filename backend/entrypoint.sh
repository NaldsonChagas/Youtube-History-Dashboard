#!/bin/sh
set -e

until nc -z "${PGHOST:-localhost}" "${PGPORT:-5432}"; do
  echo "Waiting for Postgres..."
  sleep 2
done

cd /app
node dist/scripts/migrate.js
node dist/scripts/seed-history.js
exec node dist/src/server.js
