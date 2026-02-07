import { Inject, Injectable } from "injection-js";
import type { DataSource } from "typeorm";
import type {
  ChannelCount,
  HourCount,
  MonthCount,
  StatsOverview,
  WeekdayCount,
} from "../../domain/StatsTypes.js";
import type { IStatsRepository } from "../../domain/IStatsRepository.js";
import { DATA_SOURCE } from "../../di/tokens.js";
import { WatchHistory } from "../entities/WatchHistory.entity.js";

function formatDate(val: unknown): string | null {
  if (val instanceof Date) return val.toISOString();
  if (val == null) return null;
  return String(val);
}

@Injectable()
export class StatsRepository implements IStatsRepository {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  async overview(from?: string, to?: string): Promise<StatsOverview> {
    const qb = this.dataSource
      .getRepository(WatchHistory)
      .createQueryBuilder("w")
      .select("COUNT(*)", "total_views")
      .addSelect("COUNT(DISTINCT w.channel_id)", "unique_channels")
      .addSelect("MIN(w.watched_at)", "first_watched")
      .addSelect("MAX(w.watched_at)", "last_watched");

    if (from) qb.andWhere("w.watched_at >= :from", { from });
    if (to) qb.andWhere("w.watched_at <= :to", { to });

    const row = await qb.getRawOne<{
      total_views: string;
      unique_channels: string;
      first_watched: Date | null;
      last_watched: Date | null;
    }>();

    return {
      totalViews: Number(row?.total_views ?? 0),
      uniqueChannels: Number(row?.unique_channels ?? 0),
      firstWatched: formatDate(row?.first_watched ?? null),
      lastWatched: formatDate(row?.last_watched ?? null),
    };
  }

  async channels(
    from?: string,
    to?: string,
    limit = 10
  ): Promise<ChannelCount[]> {
    const qb = this.dataSource
      .getRepository(WatchHistory)
      .createQueryBuilder("w")
      .select("w.channel_id", "channel_id")
      .addSelect("w.channel_name", "channel_name")
      .addSelect("COUNT(*)", "count")
      .groupBy("w.channel_id")
      .addGroupBy("w.channel_name")
      .orderBy("count", "DESC")
      .limit(limit);

    if (from) qb.andWhere("w.watched_at >= :from", { from });
    if (to) qb.andWhere("w.watched_at <= :to", { to });

    const rows = await qb.getRawMany<{
      channel_id: string;
      channel_name: string;
      count: string;
    }>();
    return rows.map((r) => ({
      channel_id: r.channel_id,
      channel_name: r.channel_name,
      count: Number(r.count),
    }));
  }

  async byHour(from?: string, to?: string): Promise<HourCount[]> {
    const qb = this.dataSource
      .getRepository(WatchHistory)
      .createQueryBuilder("w")
      .select(
        "EXTRACT(HOUR FROM w.watched_at AT TIME ZONE 'UTC')::int",
        "hour"
      )
      .addSelect("COUNT(*)", "count")
      .groupBy("EXTRACT(HOUR FROM w.watched_at AT TIME ZONE 'UTC')")
      .orderBy("hour", "ASC");

    if (from) qb.andWhere("w.watched_at >= :from", { from });
    if (to) qb.andWhere("w.watched_at <= :to", { to });

    const rows = await qb.getRawMany<{ hour: string; count: string }>();
    return rows.map((r) => ({ hour: Number(r.hour), count: Number(r.count) }));
  }

  async byWeekday(from?: string, to?: string): Promise<WeekdayCount[]> {
    const qb = this.dataSource
      .getRepository(WatchHistory)
      .createQueryBuilder("w")
      .select("EXTRACT(DOW FROM w.watched_at)::int", "weekday")
      .addSelect("COUNT(*)", "count")
      .groupBy("EXTRACT(DOW FROM w.watched_at)")
      .orderBy("weekday", "ASC");

    if (from) qb.andWhere("w.watched_at >= :from", { from });
    if (to) qb.andWhere("w.watched_at <= :to", { to });

    const rows = await qb.getRawMany<{ weekday: string; count: string }>();
    return rows.map((r) => ({
      weekday: Number(r.weekday),
      count: Number(r.count),
    }));
  }

  async byMonth(from?: string, to?: string): Promise<MonthCount[]> {
    const qb = this.dataSource
      .getRepository(WatchHistory)
      .createQueryBuilder("w")
      .select("EXTRACT(YEAR FROM w.watched_at)::int", "year")
      .addSelect("EXTRACT(MONTH FROM w.watched_at)::int", "month")
      .addSelect("COUNT(*)", "count")
      .groupBy("EXTRACT(YEAR FROM w.watched_at)")
      .addGroupBy("EXTRACT(MONTH FROM w.watched_at)")
      .orderBy("year", "ASC")
      .addOrderBy("month", "ASC");

    if (from) qb.andWhere("w.watched_at >= :from", { from });
    if (to) qb.andWhere("w.watched_at <= :to", { to });

    const rows = await qb.getRawMany<{ year: string; month: string; count: string }>();
    return rows.map((r) => ({
      year: Number(r.year),
      month: Number(r.month),
      count: Number(r.count),
    }));
  }
}
