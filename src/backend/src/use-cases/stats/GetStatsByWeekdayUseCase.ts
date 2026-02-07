import type { IStatsRepository } from "../../domain/IStatsRepository.js";
import type { WeekdayCount } from "../../domain/StatsTypes.js";

export class GetStatsByWeekdayUseCase {
  constructor(private readonly statsRepository: IStatsRepository) {}

  async execute(from?: string, to?: string): Promise<WeekdayCount[]> {
    return this.statsRepository.byWeekday(from, to);
  }
}
