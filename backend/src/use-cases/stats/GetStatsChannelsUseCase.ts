import type { ChannelCount } from "../../domain/StatsTypes.js";
import type { IStatsRepository } from "../../domain/IStatsRepository.js";

export class GetStatsChannelsUseCase {
  constructor(private readonly statsRepository: IStatsRepository) {}

  async execute(
    from?: string,
    to?: string,
    limit?: number
  ): Promise<ChannelCount[]> {
    return this.statsRepository.channels(from, to, limit);
  }
}
