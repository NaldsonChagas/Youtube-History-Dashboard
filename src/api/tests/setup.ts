import { createDataSource } from "../src/infrastructure/data-source.js";
import { runMigration } from "../src/infrastructure/migrate.js";
import { env } from "../src/config/env.js";

export async function ensureSchema(): Promise<void> {
  const dataSource = createDataSource({ databasePath: env.databasePath });
  await dataSource.initialize();
  try {
    await runMigration(dataSource);
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
