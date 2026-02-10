import { mkdir } from "fs/promises";
import { dirname } from "path";
import { env } from "../src/config/env.js";
import { logger } from "../src/lib/logger.js";
import { createDataSource } from "../src/infrastructure/data-source.js";
import { runMigration } from "../src/infrastructure/migrate.js";

async function migrate(): Promise<void> {
  const dbPath = env.databasePath;
  if (dbPath !== ":memory:") {
    await mkdir(dirname(dbPath), { recursive: true });
  }
  const dataSource = createDataSource({ databasePath: dbPath });
  await dataSource.initialize();
  try {
    await runMigration(dataSource);
    logger.info("Migration completed.");
  } finally {
    await dataSource.destroy();
  }
}

migrate().catch((err) => {
  logger.error(err, "Migration failed");
  process.exit(1);
});
