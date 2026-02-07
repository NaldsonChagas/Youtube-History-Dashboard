export interface StatsOverview {
  totalViews: number;
  uniqueChannels: number;
  firstWatched: string | null;
  lastWatched: string | null;
}

export interface ChannelCount {
  channelId: string;
  channelName: string;
  count: number;
}

export interface HourCount {
  hour: number;
  count: number;
}

export interface WeekdayCount {
  weekday: number;
  count: number;
}

export interface MonthCount {
  year: number;
  month: number;
  count: number;
}

export interface HistoryItem {
  id: number;
  videoId: string | null;
  title: string;
  channelId: string;
  channelName: string;
  watchedAt: string;
  activityType: string;
  sourceUrl: string | null;
}

export interface ListResult {
  items: HistoryItem[];
  total: number;
}

export interface HistoryParams {
  from?: string;
  to?: string;
  channelId?: string;
  page?: number;
  limit?: number;
}

export interface StatsParams {
  from?: string;
  to?: string;
  limit?: number;
}
