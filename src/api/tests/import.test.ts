import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../src/app.js";
import { ensureSchema, truncateWatchHistory } from "./setup.js";

const VALID_HTML_SNIPPET = `
Watched <a href="https://www.youtube.com/watch?v=abc12345678">Test Video</a><br>
<a href="https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxxxxx">Test Channel</a><br>
1 de jan. de 2024, 12:00:00 BRT
`;

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

  it("returns 409 when table already has data", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/import",
      headers: { "content-type": "text/html; charset=utf-8" },
      payload: VALID_HTML_SNIPPET,
    });
    expect(res.statusCode).toBe(409);
    const body = res.json();
    expect(body).toHaveProperty("error", "Conflict");
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
