import { createDataSource } from "../src/infrastructure/data-source.js";
import { env } from "../src/config/env.js";

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

async function migrate(): Promise<void> {
  const dataSource = createDataSource(env.pg);
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
