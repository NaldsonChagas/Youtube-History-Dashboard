import type {
  ChannelCount,
  HistoryParams,
  HourCount,
  ListResult,
  MonthCount,
  StatsOverview,
  StatsParams,
  WeekdayCount,
} from "./types.js";

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

export async function getStatsChannels(params: StatsParams & { limit?: number } = {}): Promise<ChannelCount[]> {
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
