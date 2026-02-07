# Coding standards

This document defines the project's code standards, aligned with the **Google TypeScript Style Guide** and clean code practices. It must be followed in all code and in reviews.

## General principles

- **Clean code**: names that explain intent; small functions with a single responsibility; low cognitive load per function.
- **No unnecessary comments**: code should be self-explanatory. Comment only when the business decision or a workaround is not obvious.
- **Consistency**: follow the standards below across the repository.

## TypeScript

- Use **strict mode** (already enabled in `tsconfig.json`).
- Prefer `interface` for public objects; `type` for unions/intersections and when utility types are needed.
- Avoid `any`; use `unknown` and type guards when the type is not known.
- Naming: **camelCase** for variables and functions; **PascalCase** for types, interfaces and classes.
- Export only what is needed; prefer named exports.

## Functions

- One responsibility per function.
- Prefer pure functions when possible; side effects (I/O, mutation) explicit and concentrated in few places.
- Parameters: at most a few; if many, group them in an object.
- Function names should be verbs or verb + noun (e.g. `parseHistoryHtml`, `list`, `buildWhere`).

## Files and modules

- One main concept per file; file name reflects the content (e.g. `historyModel.ts`, `errorHandler.ts`).
- Imports: alphabetical order or grouped (externals first, then internals); use `.js` extension in relative imports for ESM.

## Error handling

- Do not swallow errors; propagate or log and rethrow.
- In HTTP handlers, use the global Fastify error handler; in scripts, `process.exit(1)` after logging.

## Formatting and style

- Indentation: 2 spaces.
- Semicolon at end of statements.
- Double quotes for strings, unless single quotes avoid escaping.
- Long lines: break at logical points (parameters, chaining); avoid very long lines.

## Dependency injection

- Use **injection-js** for dependency injection. Tokens in `di/tokens.ts`; providers (including `useClass` and `useFactory`) in `di/providers.ts`; container created in `app.ts` with `buildContainerWithDataSource()`.
- Controllers and use cases **do not instantiate** dependencies: they receive them via constructor (through the container). Use cases depend only on **repository interfaces** (e.g. `IStatsRepository`); concrete implementations live in `infrastructure/repositories/` and are injected at composition time.

## Core and external libraries

- In **`domain/`** and **`use-cases/`**: do not import TypeORM, injection-js, Fastify or other infra libs. No ORM or DI decorators in the core. Interfaces and types are plain TypeScript.
- Implementations and framework details live in **`infrastructure/`** and **`di/`**. Controllers may use Fastify (request/reply) and injection-js decorators to receive use cases.

## Lint

- The project uses **ESLint** with **typescript-eslint** (replacing TSLint).
- Run `npm run lint` in the backend before committing; fix warnings and errors.
- Main rules: no unused variables (except with `_` prefix), warning for `any`, consistent style.

## Reference

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) – basis for the conventions above.
