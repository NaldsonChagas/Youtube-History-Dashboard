import { mkdir } from "fs/promises";
import { dirname } from "path";
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

async function migrate(): Promise<void> {
  const dbPath = env.databasePath;
  if (dbPath !== ":memory:") {
    await mkdir(dirname(dbPath), { recursive: true });
  }
  const dataSource = createDataSource({ databasePath: dbPath });
  await dataSource.initialize();
  try {
    await dataSource.query(CREATE_TABLE);
    console.log("Migration completed.");
  } finally {
    await dataSource.destroy();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
