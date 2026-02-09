import type { IHistoryRepository } from "../../domain/IHistoryRepository.js";

export class ClearDataUseCase {
  constructor(private readonly historyRepository: IHistoryRepository) {}

  async execute(): Promise<void> {
    await this.historyRepository.deleteAll();
  }
}
