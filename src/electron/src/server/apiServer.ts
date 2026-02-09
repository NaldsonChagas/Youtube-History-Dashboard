import { join } from "path";
import { pathToFileURL } from "url";
import type { AppPaths } from "../config/paths.js";

export interface ServerConfig {
  paths: AppPaths;
  projectRoot: string;
  port?: number;
}

export interface StartServerResult {
  app: { close: () => Promise<void> };
  port: number;
  baseUrl: string;
}

export async function startApiServer(config: ServerConfig): Promise<StartServerResult> {
  const { paths, projectRoot, port } = config;
  if (port !== undefined) {
    process.env.PORT = String(port);
  }
  process.env.DATABASE_PATH = paths.databasePath;
  process.env.DATA_PATH = paths.dataPath;
  process.env.PUBLIC_PATH = paths.publicPath;

  const apiEntry = pathToFileURL(
    join(projectRoot, "src", "api", "dist", "src", "startServer.js")
  ).href;
  const mod = await import(apiEntry);
  return mod.startServer({ publicPath: paths.publicPath });
}
