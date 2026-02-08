import type { HourCount } from "../../domain/StatsTypes.js";
import type { IStatsRepository } from "../../domain/IStatsRepository.js";

export class GetStatsByHourUseCase {
  constructor(private readonly statsRepository: IStatsRepository) {}

  async execute(from?: string, to?: string): Promise<HourCount[]> {
    return this.statsRepository.byHour(from, to);
  }
}
