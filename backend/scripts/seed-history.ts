import { readFile } from "fs/promises";
import { join } from "path";
import { createDataSource } from "../src/infrastructure/data-source.js";
import { WatchHistory } from "../src/infrastructure/entities/WatchHistory.entity.js";
import { env } from "../src/config/env.js";
import { parseHistoryHtml } from "./parse-history-html.js";

const BATCH_SIZE = 1000;

async function seed(): Promise<void> {
  const dataSource = createDataSource(env.pg);
  await dataSource.initialize();

  try {
    const repo = dataSource.getRepository(WatchHistory);
    const count = await repo.count();
    if (count > 0) {
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
    const entries = parseHistoryHtml(html);
    console.log("Parsed", entries.length, "entries.");

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      const toInsert = batch.map((e) => ({
        video_id: e.videoId,
        title: e.title,
        channel_id: e.channelId,
        channel_name: e.channelName,
        watched_at: e.watchedAt,
        activity_type: e.activityType,
        source_url: e.sourceUrl,
      }));
      await repo.insert(toInsert);
      console.log(
        "Inserted",
        Math.min(i + BATCH_SIZE, entries.length),
        "/",
        entries.length
      );
    }

    console.log("Seed completed.");
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
