import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getHistory,
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
});
