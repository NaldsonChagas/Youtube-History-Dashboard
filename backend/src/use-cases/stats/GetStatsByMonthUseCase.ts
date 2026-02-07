import type { IStatsRepository } from "../../domain/IStatsRepository.js";
import type { MonthCount } from "../../domain/StatsTypes.js";

export class GetStatsByMonthUseCase {
  constructor(private readonly statsRepository: IStatsRepository) {}

  async execute(from?: string, to?: string): Promise<MonthCount[]> {
    return this.statsRepository.byMonth(from, to);
  }
}
