export interface WatchHistoryEntry {
  videoId: string | null;
  title: string;
  channelId: string;
  channelName: string;
  watchedAt: Date;
  activityType: string;
  sourceUrl: string | null;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  fev: 1,
  mar: 2,
  abr: 3,
  mai: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  set: 8,
  out: 9,
  nov: 10,
  dez: 11,
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractVideoId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  return null;
}

function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(
    /(\d{1,2})\s+de\s+(\w+)\.?\s+de\s+(\d{4}),\s+(\d{1,2}):(\d{2}):(\d{2})\s+(BRT|UTC|GMT)/i
  );
  if (!match) return null;
  const [, day, monthStr, year, hour, min, sec, tz] = match;
  const month = MONTH_MAP[monthStr.toLowerCase().slice(0, 3)];
  if (month === undefined) return null;
  const m = month + 1;
  const isoDate = `${year}-${String(m).padStart(2, '0')}-${String(parseInt(day, 10)).padStart(2, '0')}T${String(parseInt(hour, 10)).padStart(2, '0')}:${min}:${sec}`;
  const offset = /BRT/i.test(tz) ? '-03:00' : 'Z';
  return new Date(isoDate + offset);
}

const BLOCK_REGEX =
  /(Watched|Viewed)\s+<a\s+href="(https?:\/\/[^"]+)">([^<]*)<\/a>\s*<br>\s*<a\s+href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)">([^<]*)<\/a><br>\s*([^<]+(?:BRT|UTC|GMT)[^<]*)/gi;

export function parseHistoryHtml(html: string): WatchHistoryEntry[] {
  const entries: WatchHistoryEntry[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(BLOCK_REGEX.source, 'gi');
  while ((m = re.exec(html)) !== null) {
    const [, watchOrView, videoUrl, rawTitle, channelId, channelName, dateStr] = m;
    const activityType = watchOrView.toLowerCase() === 'watched' ? 'watch' : 'viewed';
    const videoId = extractVideoId(videoUrl);
    const watchedAt = parseDate(dateStr.trim());
    if (!watchedAt) continue;
    entries.push({
      videoId,
      title: decodeHtmlEntities(rawTitle),
      channelId,
      channelName: decodeHtmlEntities(channelName),
      watchedAt,
      activityType,
      sourceUrl: videoUrl,
    });
  }
  return entries;
}
