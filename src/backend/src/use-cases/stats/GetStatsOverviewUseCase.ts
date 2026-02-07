import type { IStatsRepository } from "../../domain/IStatsRepository.js";
import type { StatsOverview } from "../../domain/StatsTypes.js";

export class GetStatsOverviewUseCase {
  constructor(private readonly statsRepository: IStatsRepository) {}

  async execute(from?: string, to?: string): Promise<StatsOverview> {
    return this.statsRepository.overview(from, to);
  }
}
