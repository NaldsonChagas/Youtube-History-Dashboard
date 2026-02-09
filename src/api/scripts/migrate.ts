import { mkdir } from "fs/promises";
import { dirname } from "path";
import { createDataSource } from "../src/infrastructure/data-source.js";
import { runMigration } from "../src/infrastructure/migrate.js";
import { env } from "../src/config/env.js";

async function migrate(): Promise<void> {
  const dbPath = env.databasePath;
  if (dbPath !== ":memory:") {
    await mkdir(dirname(dbPath), { recursive: true });
  }
  const dataSource = createDataSource({ databasePath: dbPath });
  await dataSource.initialize();
  try {
    await runMigration(dataSource);
    console.log("Migration completed.");
  } finally {
    await dataSource.destroy();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
