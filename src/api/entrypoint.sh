#!/bin/sh
set -e

cd /app
node dist/scripts/migrate.js
node dist/scripts/seed-history.js
exec node dist/src/server.js
