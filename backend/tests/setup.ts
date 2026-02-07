import { pool } from '../src/config/db.js';

const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS watch_history (
  id BIGSERIAL PRIMARY KEY,
  video_id VARCHAR(20),
  title TEXT NOT NULL,
  channel_id VARCHAR(30) NOT NULL,
  channel_name TEXT NOT NULL,
  watched_at TIMESTAMPTZ NOT NULL,
  activity_type VARCHAR(20) NOT NULL,
  source_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history (watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_channel_id ON watch_history (channel_id);
`;

export async function ensureSchema(): Promise<void> {
  await pool.query(CREATE_TABLE);
}
