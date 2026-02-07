import { pool } from '../config/db.js';

export interface ListFilters {
  page: number;
  limit: number;
  from?: string;
  to?: string;
  channelId?: string;
}

export interface ListResult {
  items: Array<{
    id: number;
    video_id: string | null;
    title: string;
    channel_id: string;
    channel_name: string;
    watched_at: string;
    activity_type: string;
    source_url: string | null;
  }>;
  total: number;
}

export const historyModel = {
  async list(filters: ListFilters): Promise<ListResult> {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters.from) {
      conditions.push(`watched_at >= $${paramIndex}`);
      values.push(filters.from);
      paramIndex++;
    }
    if (filters.to) {
      conditions.push(`watched_at <= $${paramIndex}`);
      values.push(filters.to);
      paramIndex++;
    }
    if (filters.channelId) {
      conditions.push(`channel_id = $${paramIndex}`);
      values.push(filters.channelId);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM watch_history ${whereClause}`,
      values
    );
    const total = countResult.rows[0]?.total ?? 0;

    values.push(filters.limit, offset);
    const listResult = await pool.query(
      `SELECT id, video_id, title, channel_id, channel_name, watched_at, activity_type, source_url
       FROM watch_history ${whereClause}
       ORDER BY watched_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

    const items = listResult.rows.map((row) => ({
      id: row.id,
      video_id: row.video_id,
      title: row.title,
      channel_id: row.channel_id,
      channel_name: row.channel_name,
      watched_at: row.watched_at instanceof Date ? row.watched_at.toISOString() : String(row.watched_at),
      activity_type: row.activity_type,
      source_url: row.source_url ?? null,
    }));

    return { items, total };
  },
};
