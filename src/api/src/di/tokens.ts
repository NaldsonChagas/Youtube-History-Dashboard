import type { DataSource } from "typeorm";
import { InjectionToken } from "injection-js";
import type { IHistoryRepository } from "../domain/IHistoryRepository.js";
import type { IStatsRepository } from "../domain/IStatsRepository.js";
import type { ListHistoryUseCase } from "../use-cases/history/ListHistoryUseCase.js";
import type { GetStatsOverviewUseCase } from "../use-cases/stats/GetStatsOverviewUseCase.js";
import type { GetStatsChannelsUseCase } from "../use-cases/stats/GetStatsChannelsUseCase.js";
import type { GetStatsByHourUseCase } from "../use-cases/stats/GetStatsByHourUseCase.js";
import type { GetStatsByWeekdayUseCase } from "../use-cases/stats/GetStatsByWeekdayUseCase.js";
import type { GetStatsByMonthUseCase } from "../use-cases/stats/GetStatsByMonthUseCase.js";

export const DATA_SOURCE = new InjectionToken<DataSource>("DataSource");
export const HISTORY_REPOSITORY = new InjectionToken<IHistoryRepository>("IHistoryRepository");
export const STATS_REPOSITORY = new InjectionToken<IStatsRepository>("IStatsRepository");

export const LIST_HISTORY_USE_CASE = new InjectionToken<ListHistoryUseCase>("ListHistoryUseCase");
export const GET_STATS_OVERVIEW_USE_CASE = new InjectionToken<GetStatsOverviewUseCase>("GetStatsOverviewUseCase");
export const GET_STATS_CHANNELS_USE_CASE = new InjectionToken<GetStatsChannelsUseCase>("GetStatsChannelsUseCase");
export const GET_STATS_BY_HOUR_USE_CASE = new InjectionToken<GetStatsByHourUseCase>("GetStatsByHourUseCase");
export const GET_STATS_BY_WEEKDAY_USE_CASE = new InjectionToken<GetStatsByWeekdayUseCase>("GetStatsByWeekdayUseCase");
export const GET_STATS_BY_MONTH_USE_CASE = new InjectionToken<GetStatsByMonthUseCase>("GetStatsByMonthUseCase");

export const HISTORY_CONTROLLER = new InjectionToken<unknown>("HistoryController");
export const STATS_CONTROLLER = new InjectionToken<unknown>("StatsController");
