import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { buildApp } from "../src/app.js";
import { ensureSchema, truncateWatchHistory } from "./setup.js";

const VALID_HTML_SNIPPET = `
Watched <a href="https://www.youtube.com/watch?v=abc12345678">Test Video</a><br>
<a href="https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxxxxx">Test Channel</a><br>
1 de jan. de 2024, 12:00:00 BRT
`;

describe("POST /api/import without pre-existing schema (e.g. Electron)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let tempDir: string;
  const originalDbPath = process.env.DATABASE_PATH;

  beforeAll(async () => {
    tempDir = mkdtempSync(join(tmpdir(), "ydh-import-fresh-"));
    process.env.DATABASE_PATH = join(tempDir, "fresh.db");
    app = await buildApp();
  });

  afterAll(async () => {
    process.env.DATABASE_PATH = originalDbPath;
    if (app) await app.close();
    if (tempDir) rmSync(tempDir, { recursive: true });
  });

  it("creates schema on startup and import returns 201", async () => {
    const res = await app!.inject({
      method: "POST",
      url: "/api/import",
      headers: { "content-type": "text/html; charset=utf-8" },
      payload: VALID_HTML_SNIPPET,
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty("inserted");
    expect(body.inserted).toBeGreaterThanOrEqual(1);
  });
});

describe("GET /api/import/status", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    await ensureSchema();
    await truncateWatchHistory();
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("returns 200 and hasData false when table is empty", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/import/status",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toEqual({ hasData: false });
  });
});

describe("POST /api/import", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    await ensureSchema();
    await truncateWatchHistory();
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("returns 201 and inserted count when HTML is valid", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/import",
      headers: { "content-type": "text/html; charset=utf-8" },
      payload: VALID_HTML_SNIPPET,
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty("inserted");
    expect(typeof body.inserted).toBe("number");
    expect(body.inserted).toBeGreaterThanOrEqual(1);
  });

  it("returns 201 and overwrites when table already has data", async () => {
    const firstRes = await app.inject({
      method: "POST",
      url: "/api/import",
      headers: { "content-type": "text/html; charset=utf-8" },
      payload: VALID_HTML_SNIPPET,
    });
    expect(firstRes.statusCode).toBe(201);
    const firstBody = firstRes.json();
    expect(firstBody.inserted).toBeGreaterThanOrEqual(1);

    const secondRes = await app.inject({
      method: "POST",
      url: "/api/import",
      headers: { "content-type": "text/html; charset=utf-8" },
      payload: VALID_HTML_SNIPPET,
    });
    expect(secondRes.statusCode).toBe(201);
    const secondBody = secondRes.json();
    expect(secondBody.inserted).toBeGreaterThanOrEqual(1);
  });

  it("returns 400 when body is empty", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/import",
      headers: { "content-type": "text/html; charset=utf-8" },
      payload: "   ",
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/import/status after import", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    await ensureSchema();
    await truncateWatchHistory();
    app = await buildApp();
    await app.inject({
      method: "POST",
      url: "/api/import",
      headers: { "content-type": "text/html; charset=utf-8" },
      payload: VALID_HTML_SNIPPET,
    });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("returns 200 and hasData true when table has rows", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/import/status",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toEqual({ hasData: true });
  });
});

describe("DELETE /api/data", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    await ensureSchema();
    await truncateWatchHistory();
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("returns 204 and clears all history", async () => {
    await app.inject({
      method: "POST",
      url: "/api/import",
      headers: { "content-type": "text/html; charset=utf-8" },
      payload: VALID_HTML_SNIPPET,
    });
    const delRes = await app.inject({ method: "DELETE", url: "/api/data" });
    expect(delRes.statusCode).toBe(204);
    const statusRes = await app.inject({
      method: "GET",
      url: "/api/import/status",
    });
    expect(statusRes.statusCode).toBe(200);
    expect(statusRes.json()).toEqual({ hasData: false });
  });

  it("returns 204 when table is already empty", async () => {
    const res = await app.inject({ method: "DELETE", url: "/api/data" });
    expect(res.statusCode).toBe(204);
  });
});
