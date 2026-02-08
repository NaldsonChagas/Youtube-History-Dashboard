import { getLocaleForIntl } from "./i18n.js";

export function formatDate(iso: string | null | undefined, locale?: string): string {
  if (iso == null || iso === "") return "–";
  const d = new Date(iso);
  const loc = locale ?? getLocaleForIntl();
  return d.toLocaleDateString(loc, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
