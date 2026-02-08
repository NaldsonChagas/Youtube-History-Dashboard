---
name: require-tests
description: Enforces writing or updating tests for every new feature and every bug fix. For bug fixes, write the failing test first (test-first), then implement the fix. Use when developing features, fixing bugs, or when the user mentions tests, test coverage, or corrections.
---

# Require tests

## When to apply

- Adding or changing a feature in the API (new route, new behavior) or in the web app (new component, API usage, helpers).
- Fixing a bug (always: test first, then fix).
- User asks for tests or mentions test coverage.

## Rules

1. **New feature**: API — add or update integration tests in `src/api/tests/`. Web — add or update unit tests in `src/web/tests/` for the changed behavior.
2. **Bug fix**: First add or adjust a test that reproduces the bug (the test must fail). Then implement the fix until the test passes. Applies to both API and web.
3. Do not mark the task done without the corresponding tests.

## API tests

- Framework: Vitest.
- Location: `src/api/tests/*.test.ts`.
- Setup: `ensureSchema()` in `tests/setup.ts` so the table exists; tests use the same DB config as the app (env vars).
- Pattern: `beforeAll` build app and ensure schema; `afterAll` close app and pool; each test uses `app.inject()` and asserts on `statusCode` and `res.json()`.

## Web tests

- Framework: Vitest.
- Location: `src/web/tests/*.test.ts`.
- Unit tests for: `api.ts` (mock `fetch`, assert on requests and parsed response); pure helpers (e.g. `formatDate`, `escapeHtml`); any extracted logic used by Alpine components.
- Bug fix: write the failing test first, then fix the implementation.
