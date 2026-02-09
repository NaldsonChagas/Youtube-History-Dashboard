import type { IHistoryRepository } from "../../domain/IHistoryRepository.js";
import { seedFromHtml } from "../../lib/seed-from-html.js";

export interface ImportResult {
  inserted: number;
}

export class ImportHistoryUseCase {
  constructor(private readonly historyRepository: IHistoryRepository) {}

  async execute(html: string): Promise<ImportResult> {
    if (await this.historyRepository.hasAny()) {
      await this.historyRepository.deleteAll();
    }
    return seedFromHtml(html, this.historyRepository);
  }
}
