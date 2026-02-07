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
