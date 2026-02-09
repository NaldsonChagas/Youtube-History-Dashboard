import type { DataSource } from "typeorm";

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS watch_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id TEXT,
  title TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  watched_at TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  source_url TEXT
)`,
  "CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history (watched_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_watch_history_channel_id ON watch_history (channel_id)",
];

export async function runMigration(dataSource: DataSource): Promise<void> {
  for (const sql of STATEMENTS) {
    await dataSource.query(sql);
  }
}
