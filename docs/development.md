# Development

This document covers how to run the project, environment variables, build and tests, and API reference.

## Prerequisites

- **Docker and Docker Compose** – for running the app with `docker compose` (build uses pnpm via Corepack).
- **Node.js 24.13.0** (recommended) and pnpm – for local development without Docker. Use `nvm use` (or `fnm use`) if you have `.nvmrc` support.

## How to run with Docker

1. Place the Takeout export in the `youtube-metadata/` folder (expected structure: `youtube-metadata/histórico/histórico-de-visualização.html`).

2. Start the services:

```bash
docker compose up --build
```

3. The API runs at `http://localhost:3000`. On first run, the entrypoint runs the web build (Vite), then the migration and seed (if the table is empty). The web app is served by the API from `src/web/dist` at `/`. The API runs in development mode with watch for API code; web changes require re-running the web build (or restarting the container).

## Environment variables

| Variable        | Description                  | Default                        |
|----------------|------------------------------|--------------------------------|
| `PORT`         | Server port                  | `3000`                         |
| `DATABASE_PATH`| Path to SQLite database file | `~/.youtube-history-dashboard/data/youtube_history.db` |
| `DATA_PATH`    | Path to Takeout folder       | `./youtube-metadata`           |
| `PUBLIC_PATH`  | Path to static web build     | `../web/dist` (from API cwd)   |
| `NODE_ENV`     | Environment                  | `development`                  |

## Local development (without Docker)

1. Install dependencies and run migration and seed:

```bash
cd src/api
pnpm install
pnpm run migrate
pnpm run seed
```

2. Start the server:

```bash
pnpm run dev
```

3. Run tests (uses a temporary SQLite database; no external database required):

```bash
pnpm run test
```

4. Lint:

```bash
pnpm run lint
```

## Web (standalone)

The web app is in `src/web/`. Source is TypeScript in `src/web/src/`; build output is minified and goes to `src/web/dist/` (Vite).

```bash
cd src/web
pnpm install
pnpm run build    # Vite build (minified JS/CSS to dist/)
pnpm run test     # unit tests (Vitest)
pnpm run lint     # ESLint
```

When running the full app (Docker or API dev server), the API serves static files from `src/web/dist/`. Run `pnpm run build` in `src/web/` after changing web source so the API serves the latest build.

## Desktop app (Electron) from source

A **Makefile** at the project root ensures dependencies, builds, and the database are ready before starting Electron.

From the project root:

```bash
make dev
```

This runs, in order: `install` (pnpm in `src/api`, `src/web`, `src/electron`), `build` (API, web, Electron), `migrate` (runs the database migration; no `data/` folder is created in the project), then starts the Electron app (`electron .` from `src/electron/`).

Other useful targets:

| Target   | Description |
|----------|-------------|
| `make help` | List all Makefile targets. |
| `make setup` | Install, build, and migrate (without starting Electron). |
| `make install` | Install dependencies in api, web, and src/electron. |
| `make build` | Build API, web, and Electron. |
| `make migrate` | Run the API migration (uses default DB path in user home). |

Requires **make** and **pnpm**. When `DATABASE_PATH` is not set, the API uses a database in the user home (`~/.youtube-history-dashboard/data/`). Electron sets its own `DATABASE_PATH` (e.g. under `~/.config/` on Linux) before starting the API. The Makefile migration ensures the schema is valid; standalone API or `make migrate` use the default path in the user home.

## API reference

- `GET /api/history` – Paginated history list. Query: `page`, `limit`, `from`, `to`, `channel_id`.
- `GET /api/import/status` – Whether history data has been imported (`hasData`).
- `POST /api/import` – Import Takeout HTML (body: text/html).
- `GET /api/server-info` – Server network address for access from other devices (`baseUrl`).
- `GET /api/stats/overview` – Totals (views, channels, first/last date).
- `GET /api/stats/channels` – Most watched channels. Query: `limit`, `from`, `to`, `search`.
- `GET /api/stats/by-hour` – Count by hour of day.
- `GET /api/stats/by-weekday` – Count by weekday.
- `GET /api/stats/by-month` – Count by month/year.

Responses are JSON. Date filters `from` and `to` use ISO 8601 format (e.g. `2025-01-01`, `2025-12-31`).

**Swagger UI** is available at `/documentation` when the API is running.
