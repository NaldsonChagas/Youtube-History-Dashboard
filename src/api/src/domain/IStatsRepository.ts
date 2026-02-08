import type { ChannelCount } from './StatsTypes.js';
import type { HourCount } from './StatsTypes.js';
import type { MonthCount } from './StatsTypes.js';
import type { StatsOverview } from './StatsTypes.js';
import type { WeekdayCount } from './StatsTypes.js';

export interface IStatsRepository {
  overview(from?: string, to?: string): Promise<StatsOverview>;
  channels(from?: string, to?: string, limit?: number, search?: string): Promise<ChannelCount[]>;
  byHour(from?: string, to?: string): Promise<HourCount[]>;
  byWeekday(from?: string, to?: string): Promise<WeekdayCount[]>;
  byMonth(from?: string, to?: string): Promise<MonthCount[]>;
}
