import { join } from "path";

export interface BuildAppOptions {
  publicPath?: string;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databasePath: process.env.DATABASE_PATH ?? './data/youtube_history.db',
  dataPath: process.env.DATA_PATH ?? './youtube-metadata',
  publicPath: process.env.PUBLIC_PATH ?? join(process.cwd(), "..", "web", "dist"),
} as const;
