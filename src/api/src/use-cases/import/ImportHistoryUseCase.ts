import type { IHistoryRepository } from "../../domain/IHistoryRepository.js";
import { seedFromHtml } from "../../lib/seed-from-html.js";

export const ALREADY_HAS_DATA = "ALREADY_HAS_DATA";

export interface ImportResult {
  inserted: number;
}

export class ImportHistoryUseCase {
  constructor(private readonly historyRepository: IHistoryRepository) {}

  async execute(html: string): Promise<ImportResult> {
    if (await this.historyRepository.hasAny()) {
      const err = new Error("Database already has history data");
      (err as Error & { code: string }).code = ALREADY_HAS_DATA;
      throw err;
    }
    return seedFromHtml(html, this.historyRepository);
  }
}
