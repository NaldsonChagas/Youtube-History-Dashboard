export interface StatsOverview {
  totalViews: number;
  uniqueChannels: number;
  firstWatched: string | null;
  lastWatched: string | null;
}

export interface ChannelCount {
  channel_id: string;
  channel_name: string;
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
  video_id: string | null;
  title: string;
  channel_id: string;
  channel_name: string;
  watched_at: string;
  activity_type: string;
  source_url: string | null;
}

export interface ListResult {
  items: HistoryItem[];
  total: number;
}

export interface HistoryParams {
  from?: string;
  to?: string;
  channel_id?: string;
  page?: number;
  limit?: number;
}

export interface StatsParams {
  from?: string;
  to?: string;
  limit?: number;
}
