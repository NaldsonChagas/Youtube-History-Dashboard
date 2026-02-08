import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { requireImportData } from "../src/guards";

describe("guards", () => {
  let locationHref: string;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    locationHref = "";
    Object.defineProperty(window, "location", {
      value: {
        get href() {
          return locationHref;
        },
        set href(value: string) {
          locationHref = value;
        },
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requireImportData returns true when hasData is true", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hasData: true }),
    } as Response);

    const result = await requireImportData();

    expect(mockFetch).toHaveBeenCalledWith("/api/import/status");
    expect(result).toBe(true);
    expect(window.location.href).toBe("");
  });

  it("requireImportData redirects and returns false when hasData is false", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hasData: false }),
    } as Response);

    const result = await requireImportData();

    expect(result).toBe(false);
    expect(window.location.href).toBe("/");
  });

  it("requireImportData redirects and returns false on fetch error", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await requireImportData();

    expect(result).toBe(false);
    expect(window.location.href).toBe("/");
  });
});
