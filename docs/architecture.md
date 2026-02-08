# Architecture

This document describes the structure of the API and web app.

## API

The API follows a layered architecture: **Controller → Use case → Repository**. Persistence is done via **TypeORM** in `infrastructure/`. Dependency injection uses **injection-js**; the application core does not depend on external libraries (TypeORM, injection-js, Fastify). Below is the structure and how to **add a new route**.

## Folder structure

```
src/api/src/
├── config/              # Configuration (env)
├── controllers/         # HTTP handlers: receive request/reply, validate, call use case, respond
├── di/                  # Dependency injection (injection-js): tokens, providers, container
├── domain/              # Repository interfaces and domain types (no external libs)
├── infrastructure/      # Persistence details and external libs
│   ├── data-source.ts   # TypeORM DataSource creation
│   ├── entities/        # TypeORM entities
│   └── repositories/    # Repository implementations (implement domain interfaces)
├── middleware/          # Error handler and other middlewares
├── routes/              # Route registration; receive injected controller
├── use-cases/           # Use cases (business logic); depend only on domain interfaces
├── app.ts               # Fastify factory: builds container, gets controllers, registers routes
└── server.ts            # Entry point: buildApp + listen
```

## Request flow

1. **Route** registers method and path; the handler is a **controller** method (instance obtained from the container).
2. **Controller** reads/validates query/body, calls the injected **use case** and sends the response with `reply.send()`.
3. **Use case** orchestrates the business rule and delegates to the **repository** (injected interface).
4. **Repository** (implementation in `infrastructure/repositories/`) accesses the database via TypeORM.

## Core and external libraries

**No external library details** (TypeORM, injection-js, Fastify) should appear in `domain/` or `use-cases/`. Only TypeScript interfaces and types. Implementations and framework usage stay in `infrastructure/`, `di/`, `controllers/` (Fastify) and `app.ts`.

## Conventions

- **Routes**: one file per domain (e.g. `history.ts`, `stats.ts`). Function that receives `app` and the **controller** (obtained from the container in `app.ts`) and registers handlers with `controller.method.bind(controller)`.
- **Controllers**: classes with `@Injectable()`; constructor receives use cases via `@Inject(TOKEN)`. They do not instantiate use cases or repositories.
- **Use cases**: classes with an `execute(...)` method; constructor receives only the repository interface (e.g. `IStatsRepository`). Repository implementation is injected by the container.
- **Repositories**: interface in `domain/` (e.g. `IHistoryRepository`); implementation in `infrastructure/repositories/`, using TypeORM (DataSource, QueryBuilder, entities).
- **DI**: tokens in `di/tokens.ts`; providers in `di/providers.ts`; container created in `app.ts` with `buildContainerWithDataSource()`; controllers obtained from the container and passed to route functions.

## How to add a new route

1. **Interface in domain** (if new repository): create `domain/I<Name>Repository.ts` with the required methods; types/DTOs in `domain/` or next to the interface.
2. **Implementation in infrastructure**: create entity in `infrastructure/entities/` (if new table) and class in `infrastructure/repositories/` that implements the interface and uses TypeORM.
3. **Use case**: create class in `use-cases/<domain>/` with `execute(...)` that receives the repository interface in the constructor (injected via factory in `di/providers.ts`).
4. **Tokens and providers**: add tokens in `di/tokens.ts`; register repository, use case and controller in `di/providers.ts`.
5. **Controller**: class with `@Injectable()` and constructor receiving the use case via `@Inject(TOKEN)`; method that extracts query/body, calls `useCase.execute(...)` and `reply.send()`.
6. **Routes and app**: in `routes/<name>.ts`, function that receives `app` and the controller and registers the routes; in `app.ts`, get the controller from the container and call that function with the prefix.

## Summary

- **New route** = interface (domain) → repository implementation (infrastructure) → use case → tokens/providers (di) → controller → route registered in app + tests.
- Thin controllers (validation + use case + send); business logic in use cases; data access in repositories.
- See [docs/coding-standards.md](coding-standards.md) for style, dependency injection and the core-without-external-libs rule.

## Web

The web app is static HTML + **Alpine.js** (CDN) + **TypeScript** built with **Vite**. No SPA router; each page is a separate HTML file. The API serves the built output from `src/web/dist/` (minified JS and CSS).

### Folder structure

```
src/web/
├── pages/                 # HTML pages
│   ├── index.html         # Dashboard page
│   ├── history.html       # History list page
│   └── setup.html         # Setup page
├── src/
│   ├── lib/               # Shared utilities and API client
│   │   ├── api.ts         # API client (fetch wrappers)
│   │   ├── format.ts      # Helpers (formatDate, escapeHtml, etc.)
│   │   ├── guards.ts      # Guards (requireImportData)
│   │   └── theme.ts       # Theme utilities
│   ├── components/        # Alpine components
│   │   ├── dashboard.ts   # Dashboard (overview + charts)
│   │   ├── history-list.ts# History table + pagination
│   │   └── setup.ts       # Setup/import page
│   ├── entries/           # Vite entry points
│   │   ├── dashboard.ts   # Imports CSS + dashboard component
│   │   ├── history.ts     # Imports CSS + history-list component
│   │   └── setup.ts       # Imports CSS + setup component
│   ├── types.ts           # Interfaces for API responses
│   └── globals.d.ts       # Global declarations (Alpine, Chart)
├── dist/                  # Vite build output (minified); served by API
├── css/                   # Styles (imported by entries)
├── tests/                 # Unit tests (Vitest)
│   ├── api.test.ts
│   ├── format.test.ts
│   ├── guards.test.ts
│   └── theme.test.ts
└── vite.config.ts         # Vite MPA config (outDir: dist)
```

### Flow

1. HTML pages in `pages/` load Alpine (CDN), Tailwind (CDN), Chart.js (CDN where needed), and the built scripts via Vite entry points (`/src/entries/dashboard.ts`, `/src/entries/history.ts`, `/src/entries/setup.ts`). Vite bundles and minifies to `dist/assets/*.js` and `dist/assets/*.css`.
2. Alpine components are registered via `Alpine.data()` from the TS modules in `components/`. State and methods are typed in TypeScript.
3. The API client (`lib/api.ts`) and types (`types.ts`) are shared; Chart.js is used imperatively (create/destroy) from Alpine init or methods.
4. Build: run `pnpm run build` (Vite) in `src/web/`; output goes to `src/web/dist/`. The API serves from `src/web/dist/` (default `PUBLIC_PATH`).

### Tests

- Unit tests live in **`src/web/tests/`** (Vitest).
- Cover: API module (with mocked `fetch`), pure helpers (formatDate, escapeHtml), guards, theme utilities, and any extracted logic used by Alpine components.
- Same rules as API: new feature → add/update tests; bug fix → failing test first, then fix.
