import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getHistory,
  getImportStatus,
  importHistory,
  getStatsOverview,
  getStatsChannels,
  getStatsByHour,
  getStatsByWeekday,
  getStatsByMonth,
} from "../src/api";

describe("api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getHistory builds query and returns parsed json", async () => {
    const mockFetch = vi.mocked(fetch);
    const listResult = { items: [], total: 0 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(listResult),
    } as Response);

    const result = await getHistory({ page: 1, limit: 10 });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/history?"));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/page=1/));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/limit=10/));
    expect(result).toEqual(listResult);
  });

  it("getHistory sends channelIds as comma-separated in query", async () => {
    const mockFetch = vi.mocked(fetch);
    const listResult = { items: [], total: 0 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(listResult),
    } as Response);

    await getHistory({ channelIds: ["id1", "id2"] });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/history?"));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/channelIds=id1%2Cid2/));
  });

  it("getHistory throws when response not ok", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({ ok: false, statusText: "Not Found" } as Response);

    await expect(getHistory()).rejects.toThrow("Not Found");
  });

  it("getStatsOverview builds query and returns parsed json", async () => {
    const mockFetch = vi.mocked(fetch);
    const overview = { totalViews: 100, uniqueChannels: 5, firstWatched: null, lastWatched: null };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(overview),
    } as Response);

    const result = await getStatsOverview({ from: "2024-01-01" });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/stats/overview?"));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/from=2024-01-01/));
    expect(result).toEqual(overview);
  });

  it("getStatsChannels returns parsed json", async () => {
    const mockFetch = vi.mocked(fetch);
    const channels = [{ channelId: "1", channelName: "C1", count: 10 }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(channels),
    } as Response);

    const result = await getStatsChannels({ limit: 15 });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/stats/channels?"));
    expect(result).toEqual(channels);
  });

  it("getStatsChannels sends search param when provided", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    await getStatsChannels({ search: "linkin", limit: 50 });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/stats/channels?"));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/search=linkin/));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/limit=50/));
  });

  it("getStatsByHour returns parsed json", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ hour: 0, count: 1 }]),
    } as Response);

    const result = await getStatsByHour();

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/stats/by-hour"));
    expect(result).toEqual([{ hour: 0, count: 1 }]);
  });

  it("getStatsByWeekday returns parsed json", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ weekday: 0, count: 1 }]),
    } as Response);

    const result = await getStatsByWeekday();

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/stats/by-weekday"));
    expect(result).toEqual([{ weekday: 0, count: 1 }]);
  });

  it("getStatsByMonth returns parsed json", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ year: 2024, month: 1, count: 10 }]),
    } as Response);

    const result = await getStatsByMonth();

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/stats/by-month"));
    expect(result).toEqual([{ year: 2024, month: 1, count: 10 }]);
  });

  it("getImportStatus returns hasData from /api/import/status", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hasData: false }),
    } as Response);

    const result = await getImportStatus();

    expect(mockFetch).toHaveBeenCalledWith("/api/import/status");
    expect(result).toEqual({ hasData: false });
  });

  it("importHistory POSTs HTML to /api/import and returns inserted count", async () => {
    const mockFetch = vi.mocked(fetch);
    const html = "<p>test</p>";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ inserted: 42 }),
    } as Response);

    const result = await importHistory(html);

    expect(mockFetch).toHaveBeenCalledWith("/api/import", {
      method: "POST",
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: html,
    });
    expect(result).toEqual({ inserted: 42 });
  });

  it("importHistory throws with response message when not ok", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Database already has history data." }),
    } as Response);

    await expect(importHistory("<html></html>")).rejects.toThrow(
      "Database already has history data."
    );
  });
});
