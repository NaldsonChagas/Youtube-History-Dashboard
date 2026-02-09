import { join } from "path";

export interface AppPaths {
  userData: string;
  databasePath: string;
  dataPath: string;
  publicPath: string;
}

export function getAppPaths(userData: string, projectRoot: string): AppPaths {
  const dataDir = join(userData, "data");
  return {
    userData,
    databasePath: join(dataDir, "youtube_history.db"),
    dataPath: join(dataDir, "youtube-metadata"),
    publicPath: join(projectRoot, "src", "web", "dist"),
  };
}
