import { Inject, Injectable } from "injection-js";
import type { DataSource } from "typeorm";
import type { ListFilters } from "../../domain/ListFilters.js";
import type { ListResult } from "../../domain/ListResult.js";
import type { IHistoryRepository } from "../../domain/IHistoryRepository.js";
import { DATA_SOURCE } from "../../di/tokens.js";
import { WatchHistory } from "../entities/WatchHistory.entity.js";

@Injectable()
export class HistoryRepository implements IHistoryRepository {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource
  ) {}

  async list(filters: ListFilters): Promise<ListResult> {
    const repo = this.dataSource.getRepository(WatchHistory);
    const qb = repo.createQueryBuilder("w");

    if (filters.from) {
      qb.andWhere("w.watchedAt >= :from", { from: filters.from });
    }
    if (filters.to) {
      qb.andWhere("w.watchedAt <= :to", { to: filters.to });
    }
    if (filters.channelId) {
      qb.andWhere("w.channelId = :channelId", { channelId: filters.channelId });
    }

    const total = await qb.getCount();

    const offset = (filters.page - 1) * filters.limit;
    qb.orderBy("w.watchedAt", "DESC")
      .skip(offset)
      .take(filters.limit);

    const items = await qb.getMany();

    return {
      total,
      items: items.map((row) => ({
        id: Number(row.id),
        videoId: row.videoId,
        title: row.title,
        channelId: row.channelId,
        channelName: row.channelName,
        watchedAt:
          row.watchedAt instanceof Date
            ? row.watchedAt.toISOString()
            : String(row.watchedAt),
        activityType: row.activityType,
        sourceUrl: row.sourceUrl ?? null,
      })),
    };
  }
}
