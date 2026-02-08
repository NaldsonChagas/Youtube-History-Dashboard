import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStoredTheme, setStoredTheme } from "../src/theme";

describe("theme", () => {
  const storage: Record<string, string> = {};

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
    });
    delete storage.theme;
  });

  describe("getStoredTheme", () => {
    it("returns light when localStorage is empty", () => {
      expect(getStoredTheme()).toBe("light");
    });

    it("returns stored theme when valid", () => {
      storage.theme = "light";
      expect(getStoredTheme()).toBe("light");
      storage.theme = "dark";
      expect(getStoredTheme()).toBe("dark");
    });

    it("returns light when stored value is invalid", () => {
      storage.theme = "invalid";
      expect(getStoredTheme()).toBe("light");
    });
  });

  describe("setStoredTheme", () => {
    it("persists theme in localStorage", () => {
      setStoredTheme("light");
      expect(storage.theme).toBe("light");
      setStoredTheme("dark");
      expect(storage.theme).toBe("dark");
    });

    it("allows getStoredTheme to read the value", () => {
      setStoredTheme("light");
      expect(getStoredTheme()).toBe("light");
    });
  });
});
