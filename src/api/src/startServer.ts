import "reflect-metadata";
import { buildApp, type BuildAppOptions } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { getNetworkBaseUrl } from "./lib/network.js";

export interface StartServerOptions extends BuildAppOptions {
  port?: number;
}

export interface StartServerResult {
  app: Awaited<ReturnType<typeof buildApp>>;
  port: number;
  baseUrl: string;
}

function getListenPort(app: Awaited<ReturnType<typeof buildApp>>, fallback: number): number {
  const addr = (app.server as { address?: () => { port: number } }).address?.();
  return typeof addr === "object" && addr != null && "port" in addr ? addr.port : fallback;
}

export async function startServer(opts?: StartServerOptions): Promise<StartServerResult> {
  const app = await buildApp(opts);
  const requestedPort = opts?.port ?? env.port;
  await app.listen({ port: requestedPort, host: "0.0.0.0" });
  const port = getListenPort(app, requestedPort);
  const baseUrl = getNetworkBaseUrl(port);
  logger.info({ port, baseUrl }, "Server started");
  return { app, port, baseUrl };
}
