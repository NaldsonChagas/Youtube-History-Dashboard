import { createDataSource } from "../src/infrastructure/data-source.js";
import { env } from "../src/config/env.js";

const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS watch_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id TEXT,
  title TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  watched_at TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  source_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history (watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_channel_id ON watch_history (channel_id);
`;

export async function ensureSchema(): Promise<void> {
  const dataSource = createDataSource({ databasePath: env.databasePath });
  await dataSource.initialize();
  try {
    await dataSource.query(CREATE_TABLE);
  } finally {
    await dataSource.destroy();
  }
}

export async function truncateWatchHistory(): Promise<void> {
  const dataSource = createDataSource({ databasePath: env.databasePath });
  await dataSource.initialize();
  try {
    await dataSource.query("DELETE FROM watch_history");
  } finally {
    await dataSource.destroy();
  }
}
