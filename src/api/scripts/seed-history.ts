import { readFile } from "fs/promises";
import { join } from "path";
import { createDataSource } from "../src/infrastructure/data-source.js";
import { env } from "../src/config/env.js";
import { HistoryRepository } from "../src/infrastructure/repositories/HistoryRepository.js";
import { seedFromHtml } from "../src/lib/seed-from-html.js";

async function seed(): Promise<void> {
  const dataSource = createDataSource({ databasePath: env.databasePath });
  await dataSource.initialize();

  try {
    const repo = new HistoryRepository(dataSource);
    if (await repo.hasAny()) {
      console.log("watch_history already has data; skipping seed.");
      return;
    }

    const historyPath = join(
      env.dataPath,
      "histórico",
      "histórico-de-visualização.html"
    );
    console.log("Reading", historyPath);
    const html = await readFile(historyPath, "utf-8");
    const { inserted } = await seedFromHtml(html, repo);
    console.log("Seed completed. Inserted", inserted, "entries.");
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
