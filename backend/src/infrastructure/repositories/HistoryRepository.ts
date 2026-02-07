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
      qb.andWhere("w.watched_at >= :from", { from: filters.from });
    }
    if (filters.to) {
      qb.andWhere("w.watched_at <= :to", { to: filters.to });
    }
    if (filters.channelId) {
      qb.andWhere("w.channel_id = :channelId", { channelId: filters.channelId });
    }

    const total = await qb.getCount();

    const offset = (filters.page - 1) * filters.limit;
    qb.orderBy("w.watched_at", "DESC")
      .skip(offset)
      .take(filters.limit);

    const items = await qb.getMany();

    return {
      total,
      items: items.map((row) => ({
        id: Number(row.id),
        video_id: row.video_id,
        title: row.title,
        channel_id: row.channel_id,
        channel_name: row.channel_name,
        watched_at:
          row.watched_at instanceof Date
            ? row.watched_at.toISOString()
            : String(row.watched_at),
        activity_type: row.activity_type,
        source_url: row.source_url ?? null,
      })),
    };
  }
}
