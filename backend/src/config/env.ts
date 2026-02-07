import { join } from "path";

export interface BuildAppOptions {
  publicPath?: string;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  pg: {
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER ?? 'postgres',
    password: process.env.PGPASSWORD ?? 'postgres',
    database: process.env.PGDATABASE ?? 'youtube_history',
  },
  dataPath: process.env.DATA_PATH ?? './youtube-metadata',
  publicPath: process.env.PUBLIC_PATH ?? join(process.cwd(), "..", "frontend", "dist"),
} as const;
