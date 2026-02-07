import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../src/app.js";
import { ensureSchema } from "./setup.js";

describe("GET /api/history", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    await ensureSchema();
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('returns 200 and list shape with items and total', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/history',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.total).toBe('number');
  });

  it('accepts page and limit query params', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/history?page=1&limit=5',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.items.length).toBeLessThanOrEqual(5);
  });

  it("returns 400 for invalid page (schema validation)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/history?page=-1",
    });
    expect(res.statusCode).toBe(400);
  });
});
