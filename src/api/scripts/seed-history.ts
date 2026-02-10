import { readFile } from "fs/promises";
import { join } from "path";
import { env } from "../src/config/env.js";
import { logger } from "../src/lib/logger.js";
import { seedFromHtml } from "../src/lib/seed-from-html.js";
import { createDataSource } from "../src/infrastructure/data-source.js";
import { HistoryRepository } from "../src/infrastructure/repositories/HistoryRepository.js";

async function seed(): Promise<void> {
  const dataSource = createDataSource({ databasePath: env.databasePath });
  await dataSource.initialize();

  try {
    const repo = new HistoryRepository(dataSource);
    if (await repo.hasAny()) {
      logger.info("watch_history already has data; skipping seed.");
      return;
    }

    const historyPath = join(
      env.dataPath,
      "histórico",
      "histórico-de-visualização.html"
    );
    logger.info({ path: historyPath }, "Reading history file");
    const html = await readFile(historyPath, "utf-8");
    const { inserted } = await seedFromHtml(html, repo);
    logger.info({ inserted }, "Seed completed");
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((err) => {
  logger.error(err, "Seed failed");
  process.exit(1);
});
