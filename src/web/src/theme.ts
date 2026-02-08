const STORAGE_KEY = "theme";

export type Theme = "dark" | "light";

export function getStoredTheme(): Theme {
  if (typeof localStorage === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "light";
}

export function setStoredTheme(theme: Theme): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme: Theme): void {
  document.documentElement.className = theme;
}

export function initTheme(): Theme {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}
