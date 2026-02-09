import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../src/app.js";
import { ensureSchema } from "./setup.js";

describe("GET /api/server-info", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    await ensureSchema();
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("returns 200 and body with baseUrl containing the configured port", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/server-info",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { baseUrl: string };
    expect(body).toHaveProperty("baseUrl");
    expect(typeof body.baseUrl).toBe("string");
    const port = Number(process.env.PORT ?? 3000);
    expect(body.baseUrl).toMatch(new RegExp(`:${port}$`));
  });

  it("returns baseUrl with http scheme", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/server-info",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { baseUrl: string };
    expect(body.baseUrl).toMatch(/^http:\/\//);
  });
});
