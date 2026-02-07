const API_BASE = '';

export async function getHistory(params = {}) {
  const sp = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/api/history?${sp}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function getStatsOverview(params = {}) {
  const sp = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/api/stats/overview?${sp}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function getStatsChannels(params = {}) {
  const sp = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/api/stats/channels?${sp}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function getStatsByHour(params = {}) {
  const sp = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/api/stats/by-hour?${sp}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function getStatsByWeekday(params = {}) {
  const sp = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/api/stats/by-weekday?${sp}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function getStatsByMonth(params = {}) {
  const sp = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/api/stats/by-month?${sp}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
