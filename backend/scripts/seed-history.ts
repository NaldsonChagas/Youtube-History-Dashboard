import { readFile } from 'fs/promises';
import { join } from 'path';
import { pool } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { parseHistoryHtml } from './parse-history-html.js';

const BATCH_SIZE = 1000;

async function tableIsEmpty(): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM watch_history LIMIT 1'
  );
  return result.rows.length === 0;
}

async function seed(): Promise<void> {
  const isEmpty = await tableIsEmpty();
  if (!isEmpty) {
    console.log('watch_history already has data; skipping seed.');
    await pool.end();
    return;
  }

  const historyPath = join(
    env.dataPath,
    'histórico',
    'histórico-de-visualização.html'
  );
  console.log('Reading', historyPath);
  const html = await readFile(historyPath, 'utf-8');
  const entries = parseHistoryHtml(html);
  console.log('Parsed', entries.length, 'entries.');

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const values: unknown[] = [];
    const placeholders: string[] = [];
    let param = 1;
    for (const e of batch) {
      placeholders.push(
        `($${param}, $${param + 1}, $${param + 2}, $${param + 3}, $${param + 4}, $${param + 5}, $${param + 6})`
      );
      values.push(
        e.videoId,
        e.title,
        e.channelId,
        e.channelName,
        e.watchedAt.toISOString(),
        e.activityType,
        e.sourceUrl
      );
      param += 7;
    }
    await pool.query(
      `INSERT INTO watch_history (video_id, title, channel_id, channel_name, watched_at, activity_type, source_url)
       VALUES ${placeholders.join(', ')}`,
      values
    );
    console.log('Inserted', Math.min(i + BATCH_SIZE, entries.length), '/', entries.length);
  }

  console.log('Seed completed.');
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
