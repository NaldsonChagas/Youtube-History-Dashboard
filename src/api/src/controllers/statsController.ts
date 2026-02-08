import type { FastifyReply, FastifyRequest } from "fastify";
import { Inject, Injectable } from "injection-js";
import {
  GET_STATS_BY_HOUR_USE_CASE,
  GET_STATS_BY_MONTH_USE_CASE,
  GET_STATS_BY_WEEKDAY_USE_CASE,
  GET_STATS_CHANNELS_USE_CASE,
  GET_STATS_OVERVIEW_USE_CASE,
} from "../di/tokens.js";
import type { GetStatsByHourUseCase } from "../use-cases/stats/GetStatsByHourUseCase.js";
import type { GetStatsByMonthUseCase } from "../use-cases/stats/GetStatsByMonthUseCase.js";
import type { GetStatsByWeekdayUseCase } from "../use-cases/stats/GetStatsByWeekdayUseCase.js";
import type { GetStatsChannelsUseCase } from "../use-cases/stats/GetStatsChannelsUseCase.js";
import type { GetStatsOverviewUseCase } from "../use-cases/stats/GetStatsOverviewUseCase.js";
import { optionalQueryParam } from "../lib/queryParams.js";

interface StatsQuerystring {
  from?: string;
  to?: string;
}

@Injectable()
export class StatsController {
  constructor(
    @Inject(GET_STATS_OVERVIEW_USE_CASE) private readonly getStatsOverview: GetStatsOverviewUseCase,
    @Inject(GET_STATS_CHANNELS_USE_CASE) private readonly getStatsChannels: GetStatsChannelsUseCase,
    @Inject(GET_STATS_BY_HOUR_USE_CASE) private readonly getStatsByHour: GetStatsByHourUseCase,
    @Inject(GET_STATS_BY_WEEKDAY_USE_CASE) private readonly getStatsByWeekday: GetStatsByWeekdayUseCase,
    @Inject(GET_STATS_BY_MONTH_USE_CASE) private readonly getStatsByMonth: GetStatsByMonthUseCase
  ) {}

  async overview(
    request: FastifyRequest<{ Querystring: StatsQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.getStatsOverview.execute(
      optionalQueryParam(request.query.from),
      optionalQueryParam(request.query.to)
    );
    await reply.send(result);
  }

  async channels(
    request: FastifyRequest<{
      Querystring: StatsQuerystring & { limit?: string; search?: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const limit = Math.min(
      50,
      Math.max(1, parseInt(request.query.limit ?? "10", 10) || 10)
    );
    const result = await this.getStatsChannels.execute(
      optionalQueryParam(request.query.from),
      optionalQueryParam(request.query.to),
      limit,
      optionalQueryParam(request.query.search)
    );
    await reply.send(result);
  }

  async byHour(
    request: FastifyRequest<{ Querystring: StatsQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.getStatsByHour.execute(
      optionalQueryParam(request.query.from),
      optionalQueryParam(request.query.to)
    );
    await reply.send(result);
  }

  async byWeekday(
    request: FastifyRequest<{ Querystring: StatsQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.getStatsByWeekday.execute(
      optionalQueryParam(request.query.from),
      optionalQueryParam(request.query.to)
    );
    await reply.send(result);
  }

  async byMonth(
    request: FastifyRequest<{ Querystring: StatsQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.getStatsByMonth.execute(
      optionalQueryParam(request.query.from),
      optionalQueryParam(request.query.to)
    );
    await reply.send(result);
  }
}
