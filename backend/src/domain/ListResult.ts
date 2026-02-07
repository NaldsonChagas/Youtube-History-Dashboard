export interface ListResultItem {
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
  items: ListResultItem[];
  total: number;
}
