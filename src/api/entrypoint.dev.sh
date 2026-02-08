#!/bin/sh
set -e

cd /app/web && rm -rf node_modules && pnpm install && pnpm run build
cd /app
pnpm run migrate
exec pnpm run dev
