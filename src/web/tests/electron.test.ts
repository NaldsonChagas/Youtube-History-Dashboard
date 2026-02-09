import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isElectron, openInSystemBrowser } from "../src/lib/electron.js";

describe("electron", () => {
  let originalNavigator: typeof navigator;
  let originalOpen: typeof window.open;
  let originalElectron: typeof window.electron;

  beforeEach(() => {
    originalNavigator = globalThis.navigator;
    originalOpen = window.open;
    originalElectron = window.electron;
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
    });
    window.open = originalOpen;
    window.electron = originalElectron;
  });

  it("returns true when userAgent contains Electron", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Electron/28.0.0 Safari/537.36" },
      configurable: true,
    });
    expect(isElectron()).toBe(true);
  });

  it("returns false when userAgent does not contain Electron", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" },
      configurable: true,
    });
    expect(isElectron()).toBe(false);
  });

  describe("openInSystemBrowser", () => {
    it("calls window.electron.openExternal when available", () => {
      const openExternal = vi.fn().mockResolvedValue(undefined);
      window.electron = { openExternal };
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      openInSystemBrowser("http://192.168.1.1:3000");

      expect(openExternal).toHaveBeenCalledWith("http://192.168.1.1:3000");
      expect(openSpy).not.toHaveBeenCalled();
    });

    it("calls window.open when window.electron is undefined", () => {
      window.electron = undefined;
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      openInSystemBrowser("http://localhost:4000");

      expect(openSpy).toHaveBeenCalledWith("http://localhost:4000", "_blank", "noopener,noreferrer");
    });
  });
});
