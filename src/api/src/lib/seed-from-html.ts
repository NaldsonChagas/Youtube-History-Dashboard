import type { IHistoryRepository } from "../domain/IHistoryRepository.js";
import { parseHistoryHtml } from "./parse-history-html.js";

const BATCH_SIZE = 1000;

export async function seedFromHtml(
  html: string,
  repo: IHistoryRepository
): Promise<{ inserted: number }> {
  const entries = parseHistoryHtml(html);
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    await repo.insertBatch(batch);
  }
  return { inserted: entries.length };
}
