---
name: require-tests
description: Enforces writing or updating tests for every new feature and every bug fix. For bug fixes, write the failing test first (test-first), then implement the fix. Use when developing features, fixing bugs, or when the user mentions tests, test coverage, or corrections.
---

# Require tests

## When to apply

- Adding or changing a feature in the backend (new route, new behavior).
- Fixing a bug (always: test first, then fix).
- User asks for tests or mentions test coverage.

## Rules

1. **New feature**: Add or update integration tests in `backend/tests/` that cover the new API behavior (status, response shape). Use `buildApp()` and `app.inject()` as in existing tests.
2. **Bug fix**: First add or adjust a test that reproduces the bug (the test must fail). Then implement the fix until the test passes.
3. Do not mark the task done without the corresponding tests.

## Backend tests

- Framework: Vitest.
- Location: `backend/tests/*.test.ts`.
- Setup: `ensureSchema()` in `tests/setup.ts` so the table exists; tests use the same DB config as the app (env vars).
- Pattern: `beforeAll` build app and ensure schema; `afterAll` close app and pool; each test uses `app.inject()` and asserts on `statusCode` and `res.json()`.
