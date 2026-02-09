import { createDataSource } from "../infrastructure/data-source.js";
import { HistoryRepository } from "../infrastructure/repositories/HistoryRepository.js";
import { StatsRepository } from "../infrastructure/repositories/StatsRepository.js";
import { env } from "../config/env.js";
import type { IHistoryRepository } from "../domain/IHistoryRepository.js";
import type { IStatsRepository } from "../domain/IStatsRepository.js";
import {
  CLEAR_DATA_USE_CASE,
  DATA_SOURCE,
  GET_IMPORT_STATUS_USE_CASE,
  GET_STATS_BY_HOUR_USE_CASE,
  GET_STATS_BY_MONTH_USE_CASE,
  GET_STATS_BY_WEEKDAY_USE_CASE,
  GET_STATS_CHANNELS_USE_CASE,
  GET_STATS_OVERVIEW_USE_CASE,
  HISTORY_CONTROLLER,
  HISTORY_REPOSITORY,
  IMPORT_CONTROLLER,
  IMPORT_HISTORY_USE_CASE,
  LIST_HISTORY_USE_CASE,
  STATS_CONTROLLER,
  STATS_REPOSITORY,
} from "./tokens.js";
import { HistoryController } from "../controllers/historyController.js";
import { StatsController } from "../controllers/statsController.js";
import { ListHistoryUseCase } from "../use-cases/history/ListHistoryUseCase.js";
import { GetStatsOverviewUseCase } from "../use-cases/stats/GetStatsOverviewUseCase.js";
import { GetStatsChannelsUseCase } from "../use-cases/stats/GetStatsChannelsUseCase.js";
import { GetStatsByHourUseCase } from "../use-cases/stats/GetStatsByHourUseCase.js";
import { GetStatsByWeekdayUseCase } from "../use-cases/stats/GetStatsByWeekdayUseCase.js";
import { GetStatsByMonthUseCase } from "../use-cases/stats/GetStatsByMonthUseCase.js";
import { ClearDataUseCase } from "../use-cases/import/ClearDataUseCase.js";
import { GetImportStatusUseCase } from "../use-cases/import/GetImportStatusUseCase.js";
import { ImportHistoryUseCase } from "../use-cases/import/ImportHistoryUseCase.js";
import { ImportController } from "../controllers/importController.js";

export const providers = [
  {
    provide: DATA_SOURCE,
    useFactory: () => createDataSource({ databasePath: env.databasePath }),
    deps: [],
  },
  { provide: HISTORY_REPOSITORY, useClass: HistoryRepository },
  { provide: STATS_REPOSITORY, useClass: StatsRepository },
  {
    provide: LIST_HISTORY_USE_CASE,
    useFactory: (historyRepository: IHistoryRepository) =>
      new ListHistoryUseCase(historyRepository),
    deps: [HISTORY_REPOSITORY],
  },
  {
    provide: GET_STATS_OVERVIEW_USE_CASE,
    useFactory: (statsRepository: IStatsRepository) =>
      new GetStatsOverviewUseCase(statsRepository),
    deps: [STATS_REPOSITORY],
  },
  {
    provide: GET_STATS_CHANNELS_USE_CASE,
    useFactory: (statsRepository: IStatsRepository) =>
      new GetStatsChannelsUseCase(statsRepository),
    deps: [STATS_REPOSITORY],
  },
  {
    provide: GET_STATS_BY_HOUR_USE_CASE,
    useFactory: (statsRepository: IStatsRepository) =>
      new GetStatsByHourUseCase(statsRepository),
    deps: [STATS_REPOSITORY],
  },
  {
    provide: GET_STATS_BY_WEEKDAY_USE_CASE,
    useFactory: (statsRepository: IStatsRepository) =>
      new GetStatsByWeekdayUseCase(statsRepository),
    deps: [STATS_REPOSITORY],
  },
  {
    provide: GET_STATS_BY_MONTH_USE_CASE,
    useFactory: (statsRepository: IStatsRepository) =>
      new GetStatsByMonthUseCase(statsRepository),
    deps: [STATS_REPOSITORY],
  },
  {
    provide: CLEAR_DATA_USE_CASE,
    useFactory: (historyRepository: IHistoryRepository) =>
      new ClearDataUseCase(historyRepository),
    deps: [HISTORY_REPOSITORY],
  },
  {
    provide: GET_IMPORT_STATUS_USE_CASE,
    useFactory: (historyRepository: IHistoryRepository) =>
      new GetImportStatusUseCase(historyRepository),
    deps: [HISTORY_REPOSITORY],
  },
  {
    provide: IMPORT_HISTORY_USE_CASE,
    useFactory: (historyRepository: IHistoryRepository) =>
      new ImportHistoryUseCase(historyRepository),
    deps: [HISTORY_REPOSITORY],
  },
  { provide: HISTORY_CONTROLLER, useClass: HistoryController },
  { provide: IMPORT_CONTROLLER, useClass: ImportController },
  { provide: STATS_CONTROLLER, useClass: StatsController },
];