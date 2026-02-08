import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { getLocale, setLocale, t, getWeekdays } from "../src/lib/i18n";

describe("getLocale", () => {
  const storage: Record<string, string> = {};

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.keys(storage).forEach((k) => delete storage[k]);
  });

  it("returns en when localStorage is empty", () => {
    expect(getLocale()).toBe("en");
  });

  it("returns pt when localStorage has pt", () => {
    storage.locale = "pt";
    expect(getLocale()).toBe("pt");
  });

  it("returns en when localStorage has en", () => {
    storage.locale = "en";
    expect(getLocale()).toBe("en");
  });

  it("returns en for invalid stored value", () => {
    storage.locale = "fr";
    expect(getLocale()).toBe("en");
  });
});

describe("setLocale", () => {
  const storage: Record<string, string> = {};
  const reloadMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
    });
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
    });
    document.documentElement.lang = "pt-BR";
    reloadMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.keys(storage).forEach((k) => delete storage[k]);
  });

  it("saves locale to localStorage", () => {
    setLocale("en");
    expect(storage.locale).toBe("en");
  });

  it("sets document lang to en when locale is en", () => {
    setLocale("en");
    expect(document.documentElement.lang).toBe("en");
  });

  it("sets document lang to pt-BR when locale is pt", () => {
    setLocale("pt");
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  it("reloads the page", () => {
    setLocale("en");
    expect(reloadMock).toHaveBeenCalled();
  });
});

describe("t", () => {
  const storage: Record<string, string> = {};

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: () => {},
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.keys(storage).forEach((k) => delete storage[k]);
  });

  it("returns Portuguese translation when locale is pt", () => {
    storage.locale = "pt";
    expect(t("common.apply")).toBe("Aplicar");
  });

  it("returns English translation when locale is en", () => {
    storage.locale = "en";
    expect(t("common.apply")).toBe("Apply");
  });

  it("interpolates params", () => {
    storage.locale = "pt";
    expect(t("common.pageOf", { current: 2, total: 5 })).toBe("Página 2 de 5");
  });

  it("returns key when translation is missing", () => {
    storage.locale = "pt";
    expect(t("missing.key")).toBe("missing.key");
  });
});

describe("getWeekdays", () => {
  const storage: Record<string, string> = {};

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: () => {},
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.keys(storage).forEach((k) => delete storage[k]);
  });

  it("returns Portuguese weekdays when locale is pt", () => {
    storage.locale = "pt";
    expect(getWeekdays()).toEqual(["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]);
  });

  it("returns English weekdays when locale is en", () => {
    storage.locale = "en";
    expect(getWeekdays()).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });
});
