#!/bin/sh
set -e

cd /app
node dist/scripts/migrate.js
exec node dist/src/server.js
