import type { ListFilters } from './ListFilters.js';
import type { ListResult } from './ListResult.js';

export interface WatchHistoryInsert {
  videoId: string | null;
  title: string;
  channelId: string;
  channelName: string;
  watchedAt: Date;
  activityType: string;
  sourceUrl: string | null;
}

export interface IHistoryRepository {
  hasAny(): Promise<boolean>;
  insertBatch(entries: WatchHistoryInsert[]): Promise<void>;
  list(filters: ListFilters): Promise<ListResult>;
}
