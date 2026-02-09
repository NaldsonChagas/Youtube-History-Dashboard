import type {
  ChannelCount,
  HistoryParams,
  HourCount,
  ListResult,
  MonthCount,
  StatsOverview,
  StatsParams,
  WeekdayCount,
} from "../types.js";

const API_BASE = "";

function buildQueryString(
  params: Record<string, string | number | undefined | string[]>
): string {
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    if (Array.isArray(v)) {
      if (v.length) filtered[k] = v.join(",");
    } else {
      filtered[k] = String(v);
    }
  }
  const sp = new URLSearchParams(filtered);
  return sp.toString();
}

export async function getHistory(params: HistoryParams = {}): Promise<ListResult> {
  const qs = buildQueryString(
    params as Record<string, string | number | undefined | string[]>
  );
  const res = await fetch(`${API_BASE}/api/history?${qs}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<ListResult>;
}

export async function getStatsOverview(params: StatsParams = {}): Promise<StatsOverview> {
  const qs = buildQueryString(params as Record<string, string | number | undefined>);
  const res = await fetch(`${API_BASE}/api/stats/overview?${qs}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<StatsOverview>;
}

export async function getStatsChannels(params: StatsParams = {}): Promise<ChannelCount[]> {
  const qs = buildQueryString(params as Record<string, string | number | undefined>);
  const res = await fetch(`${API_BASE}/api/stats/channels?${qs}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<ChannelCount[]>;
}

export async function getStatsByHour(params: StatsParams = {}): Promise<HourCount[]> {
  const qs = buildQueryString(params as Record<string, string | number | undefined>);
  const res = await fetch(`${API_BASE}/api/stats/by-hour?${qs}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<HourCount[]>;
}

export async function getStatsByWeekday(params: StatsParams = {}): Promise<WeekdayCount[]> {
  const qs = buildQueryString(params as Record<string, string | number | undefined>);
  const res = await fetch(`${API_BASE}/api/stats/by-weekday?${qs}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<WeekdayCount[]>;
}

export async function getStatsByMonth(params: StatsParams = {}): Promise<MonthCount[]> {
  const qs = buildQueryString(params as Record<string, string | number | undefined>);
  const res = await fetch(`${API_BASE}/api/stats/by-month?${qs}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<MonthCount[]>;
}

export interface ServerInfo {
  baseUrl: string;
}

export async function getServerInfo(): Promise<ServerInfo> {
  const res = await fetch(`${API_BASE}/api/server-info`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<ServerInfo>;
}

export interface ImportStatus {
  hasData: boolean;
}

export async function getImportStatus(): Promise<ImportStatus> {
  const res = await fetch(`${API_BASE}/api/import/status`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<ImportStatus>;
}

export interface ImportResult {
  inserted: number;
}

export async function importHistory(html: string): Promise<ImportResult> {
  const res = await fetch(`${API_BASE}/api/import`, {
    method: "POST",
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = (data as { message?: string }).message ?? res.statusText;
    throw new Error(message);
  }
  return res.json() as Promise<ImportResult>;
}

export async function clearData(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/data`, { method: "DELETE" });
  if (!res.ok) throw new Error(res.statusText);
}
