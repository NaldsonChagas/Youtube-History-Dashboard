# YouTube History Dashboard

Dashboard for viewing and analyzing YouTube watch history, powered by data exported via Google Takeout.

## What it is

- **Backend**: REST API in Fastify + TypeScript (MVC), with PostgreSQL. Takeout data is imported once (seed) and queried via the database.
- **Frontend**: Static pages (HTML, Tailwind, Chart.js, Alpine.js) with TypeScript. Built with **Vite** (output in `frontend/dist`, minified); dashboard with charts and paginated history list.

## Prerequisites

- Docker and Docker Compose (build uses pnpm via Corepack)
- (Optional, for local development) Node.js 20+, pnpm, PostgreSQL 16

## How to run

1. Place the Takeout export in the `youtube-metadata/` folder (expected structure: `youtube-metadata/histórico/histórico-de-visualização.html`).

2. Start the services:

```bash
docker compose up --build
```

3. The backend runs at `http://localhost:3000`. On first run, the entrypoint runs the frontend build (Vite), then the migration and seed (if the table is empty). The frontend is served by the backend from `frontend/dist` at `/` (root). The backend runs in **development mode with watch** for backend code; frontend changes require re-running the frontend build (or restarting the container, which rebuilds the frontend).

## Environment variables

| Variable     | Description                    | Default           |
|-------------|--------------------------------|-------------------|
| `PORT`      | Server port                    | `3000`            |
| `PGHOST`    | PostgreSQL host                | `localhost`       |
| `PGPORT`    | PostgreSQL port                | `5432`            |
| `PGUSER`    | PostgreSQL user                | `postgres`        |
| `PGPASSWORD`| PostgreSQL password            | `postgres`        |
| `PGDATABASE`| Database name                  | `youtube_history` |
| `DATA_PATH` | Path to Takeout folder         | `./youtube-metadata` |
| `PUBLIC_PATH` | Path to static frontend build | `../frontend/dist` (from backend cwd) |
| `NODE_ENV`  | Environment                    | `development`     |

## Local development (without Docker)

1. Install dependencies and run migration and seed:

```bash
cd backend
pnpm install
pnpm run migrate
pnpm run seed
```

2. Start the server:

```bash
pnpm run dev
```

3. Run tests (PostgreSQL must be reachable with the variables above):

```bash
pnpm run test
```

4. Lint:

```bash
pnpm run lint
```

## Frontend (standalone)

The frontend is in `frontend/`. Source is TypeScript in `frontend/src/`; build output is **minified** and goes to `frontend/dist/` (Vite).

```bash
cd frontend
pnpm install
pnpm run build    # Vite build (minified JS/CSS to dist/)
pnpm run test     # unit tests (Vitest)
pnpm run lint     # ESLint
```

When running the full app (Docker or backend dev server), the backend serves static files from **`frontend/dist/`**. Run `pnpm run build` in `frontend/` after changing frontend source so the backend serves the latest build.

## Project documentation

- [docs/coding-standards.md](docs/coding-standards.md) – Code standards (Google Style Guide, clean code).
- [docs/architecture.md](docs/architecture.md) – Backend and frontend architecture; how to add new routes.

## API

- `GET /api/history` – Paginated history list. Query: `page`, `limit`, `from`, `to`, `channel_id`.
- `GET /api/stats/overview` – Totals (views, channels, first/last date).
- `GET /api/stats/channels` – Most watched channels. Query: `limit`, `from`, `to`.
- `GET /api/stats/by-hour` – Count by hour of day.
- `GET /api/stats/by-weekday` – Count by weekday.
- `GET /api/stats/by-month` – Count by month/year.

Responses are JSON. Filters `from` and `to` use ISO 8601 format (e.g. `2025-01-01`, `2025-12-31`).

API documentation is available via **Swagger UI** at `/documentation` when the backend is running.
