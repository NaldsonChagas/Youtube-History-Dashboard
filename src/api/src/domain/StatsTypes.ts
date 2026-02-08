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
