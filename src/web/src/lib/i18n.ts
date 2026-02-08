import en from "../locales/en.json";
import pt from "../locales/pt.json";

const STORAGE_KEY = "locale";

const messages: Record<string, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  pt: pt as Record<string, unknown>,
};

export type Locale = "en" | "pt";

function getNested(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function getLocale(): Locale {
  if (typeof localStorage === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "pt") return stored;
  return "en";
}

export function setLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
  window.dispatchEvent(new Event("localechange"));
  window.location.reload();
}

export function getLocaleForIntl(): string {
  return getLocale() === "pt" ? "pt-BR" : "en-US";
}

export function t(key: string, params?: Record<string, string | number>): string {
  const locale = getLocale();
  const localeMessages = messages[locale] ?? messages.pt;
  const value = getNested(localeMessages, key);

  if (value == null) return key;
  if (Array.isArray(value)) return value.join(", ");
  let str = String(value);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

export function getWeekdays(): string[] {
  const value = getNested(messages[getLocale()] ?? messages.pt, "chart.weekdays");
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return value as string[];
  }
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}

export function initLocale(): void {
  document.documentElement.lang = getLocale() === "pt" ? "pt-BR" : "en";
}

export function registerI18nStore(): void {
  document.addEventListener("alpine:init", () => {
    Alpine.store("i18n", {
      locale: getLocale(),
      t,
      changeLocale(locale: Locale) {
        setLocale(locale);
      },
    });
  });
}

registerI18nStore();
