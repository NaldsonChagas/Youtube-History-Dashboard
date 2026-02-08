#!/bin/sh
set -e

until nc -z "${PGHOST:-localhost}" "${PGPORT:-5432}"; do
  echo "Waiting for Postgres..."
  sleep 2
done

cd /app/web && rm -rf node_modules && pnpm install && pnpm run build
cd /app
pnpm run migrate
pnpm run seed
exec pnpm run dev
