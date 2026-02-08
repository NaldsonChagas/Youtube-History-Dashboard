import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../src/app.js";
import { ensureSchema } from "./setup.js";

describe("GET /api/stats", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    await ensureSchema();
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/stats/overview returns 200 and overview shape', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/stats/overview',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('totalViews');
    expect(body).toHaveProperty('uniqueChannels');
    expect(body).toHaveProperty('firstWatched');
    expect(body).toHaveProperty('lastWatched');
    expect(typeof body.totalViews).toBe('number');
    expect(typeof body.uniqueChannels).toBe('number');
  });

  it('GET /api/stats/channels returns 200 and array', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/stats/channels?limit=5',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('channelId');
      expect(body[0]).toHaveProperty('channelName');
      expect(body[0]).toHaveProperty('count');
    }
  });

  it('GET /api/stats/channels?search= returns 200 and only matching channels (case-insensitive)', async () => {
    const search = 'linkin';
    const res = await app.inject({
      method: 'GET',
      url: `/api/stats/channels?search=${encodeURIComponent(search)}&limit=50`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    for (const ch of body) {
      expect(ch.channelName.toLowerCase()).toContain(search.toLowerCase());
    }
  });

  it('GET /api/stats/by-hour returns 200 and array', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/stats/by-hour',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /api/stats/by-weekday returns 200 and array', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/stats/by-weekday',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /api/stats/by-month returns 200 and array', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/stats/by-month',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
