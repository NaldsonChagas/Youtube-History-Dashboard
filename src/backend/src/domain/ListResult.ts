export interface ListResultItem {
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
  items: ListResultItem[];
  total: number;
}
