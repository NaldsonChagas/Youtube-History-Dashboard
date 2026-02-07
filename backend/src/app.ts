import "reflect-metadata";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { existsSync } from "fs";
import type { HistoryController } from "./controllers/historyController.js";
import type { StatsController } from "./controllers/statsController.js";
import {
  buildContainerWithDataSource,
  DATA_SOURCE,
  getHistoryController,
  getStatsController,
} from "./di/index.js";
import type { DataSource } from "typeorm";
import { errorHandler } from "./middleware/errorHandler.js";
import { registerHistoryRoutes } from "./routes/history.js";
import { registerStatsRoutes } from "./routes/stats.js";
import { env } from "./config/env.js";

export async function buildApp() {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: true });
  app.setErrorHandler(errorHandler);

  const container = await buildContainerWithDataSource();
  const dataSource = container.get(DATA_SOURCE) as DataSource;
  app.addHook("onClose", async () => {
    await dataSource.destroy();
  });

  const historyController = getHistoryController(container) as HistoryController;
  const statsController = getStatsController(container) as StatsController;

  await app.register(
    async (instance) => {
      await registerHistoryRoutes(instance, historyController);
    },
    { prefix: "/api/history" }
  );
  await app.register(
    async (instance) => {
      await registerStatsRoutes(instance, statsController);
    },
    { prefix: "/api/stats" }
  );

  const publicPath = env.publicPath;
  if (existsSync(publicPath)) {
    await app.register(fastifyStatic, { root: publicPath });
    app.get("/", (_request, reply) => reply.sendFile("index.html"));
    app.get("/history", (_request, reply) => reply.sendFile("history.html"));
  }

  return app;
}
