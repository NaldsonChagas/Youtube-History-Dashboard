# Backend architecture

The backend follows a layered architecture: **Controller → Use case → Repository**. Persistence is done via **TypeORM** in `infrastructure/`. Dependency injection uses **injection-js**; the application core does not depend on external libraries (TypeORM, injection-js, Fastify). This document describes the structure and how to **add a new route**.

## Folder structure

```
backend/src/
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
