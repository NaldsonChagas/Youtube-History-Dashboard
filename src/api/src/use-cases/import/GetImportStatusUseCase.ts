import type { IHistoryRepository } from "../../domain/IHistoryRepository.js";

export interface ImportStatus {
  hasData: boolean;
}

export class GetImportStatusUseCase {
  constructor(private readonly historyRepository: IHistoryRepository) {}

  async execute(): Promise<ImportStatus> {
    const hasData = await this.historyRepository.hasAny();
    return { hasData };
  }
}
