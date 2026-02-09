import { homedir } from "os";
import { join } from "path";

export interface BuildAppOptions {
  publicPath?: string;
}

function getEnv() {
  return {
    get port() {
      return Number(process.env.PORT ?? 3000);
    },
    get nodeEnv() {
      return process.env.NODE_ENV ?? "development";
    },
    get databasePath() {
      return (
        process.env.DATABASE_PATH ??
        join(homedir(), ".youtube-history-dashboard", "data", "youtube_history.db")
      );
    },
    get dataPath() {
      return process.env.DATA_PATH ?? "./youtube-metadata";
    },
    get publicPath() {
      return process.env.PUBLIC_PATH ?? join(process.cwd(), "..", "web", "dist");
    },
  };
}

export const env = getEnv();
