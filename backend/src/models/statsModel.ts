import { pool } from '../config/db.js';

function buildWhere(from?: string, to?: string): { clause: string; values: string[] } {
  const conditions: string[] = [];
  const values: string[] = [];
  let i = 1;
  if (from) {
    conditions.push(`watched_at >= $${i}`);
    values.push(from);
    i++;
  }
  if (to) {
    conditions.push(`watched_at <= $${i}`);
    values.push(to);
  }
  const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { clause, values };
}

export const statsModel = {
  async overview(from?: string, to?: string): Promise<{
    totalViews: number;
    uniqueChannels: number;
    firstWatched: string | null;
    lastWatched: string | null;
  }> {
    const { clause, values } = buildWhere(from, to);
    const result = await pool.query(
      `SELECT
         COUNT(*)::int AS total_views,
         COUNT(DISTINCT channel_id)::int AS unique_channels,
         MIN(watched_at) AS first_watched,
         MAX(watched_at) AS last_watched
       FROM watch_history ${clause}`,
      values
    );
    const row = result.rows[0];
    return {
      totalViews: row?.total_views ?? 0,
      uniqueChannels: row?.unique_channels ?? 0,
      firstWatched: row?.first_watched instanceof Date ? row.first_watched.toISOString() : row?.first_watched ?? null,
      lastWatched: row?.last_watched instanceof Date ? row.last_watched.toISOString() : row?.last_watched ?? null,
    };
  },

  async channels(
    from?: string,
    to?: string,
    limit = 10
  ): Promise<Array<{ channel_id: string; channel_name: string; count: number }>> {
    const { clause, values } = buildWhere(from, to);
    values.push(String(limit));
    const paramIndex = values.length;
    const result = await pool.query(
      `SELECT channel_id, channel_name, COUNT(*)::int AS count
       FROM watch_history ${clause}
       GROUP BY channel_id, channel_name
       ORDER BY count DESC
       LIMIT $${paramIndex}`,
      values
    );
    return result.rows.map((row) => ({
      channel_id: row.channel_id,
      channel_name: row.channel_name,
      count: row.count,
    }));
  },

  async byHour(
    from?: string,
    to?: string
  ): Promise<Array<{ hour: number; count: number }>> {
    const { clause, values } = buildWhere(from, to);
    const result = await pool.query(
      `SELECT EXTRACT(HOUR FROM watched_at AT TIME ZONE 'UTC')::int AS hour, COUNT(*)::int AS count
       FROM watch_history ${clause}
       GROUP BY hour
       ORDER BY hour`,
      values
    );
    return result.rows.map((row) => ({ hour: row.hour, count: row.count }));
  },

  async byWeekday(
    from?: string,
    to?: string
  ): Promise<Array<{ weekday: number; count: number }>> {
    const { clause, values } = buildWhere(from, to);
    const result = await pool.query(
      `SELECT EXTRACT(DOW FROM watched_at)::int AS weekday, COUNT(*)::int AS count
       FROM watch_history ${clause}
       GROUP BY weekday
       ORDER BY weekday`,
      values
    );
    return result.rows.map((row) => ({ weekday: row.weekday, count: row.count }));
  },

  async byMonth(
    from?: string,
    to?: string
  ): Promise<Array<{ year: number; month: number; count: number }>> {
    const { clause, values } = buildWhere(from, to);
    const result = await pool.query(
      `SELECT EXTRACT(YEAR FROM watched_at)::int AS year,
              EXTRACT(MONTH FROM watched_at)::int AS month,
              COUNT(*)::int AS count
       FROM watch_history ${clause}
       GROUP BY year, month
       ORDER BY year, month`,
      values
    );
    return result.rows.map((row) => ({
      year: row.year,
      month: row.month,
      count: row.count,
    }));
  },
};
