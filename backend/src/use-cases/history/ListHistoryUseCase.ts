import type { IHistoryRepository } from "../../domain/IHistoryRepository.js";
import type { ListFilters } from "../../domain/ListFilters.js";
import type { ListResult } from "../../domain/ListResult.js";

export class ListHistoryUseCase {
  constructor(private readonly historyRepository: IHistoryRepository) {}

  async execute(filters: ListFilters): Promise<ListResult> {
    return this.historyRepository.list(filters);
  }
}
