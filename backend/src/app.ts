import "reflect-metadata";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { existsSync } from "fs";
import type { HistoryController } from "./controllers/historyController.js";
import type { StatsController } from "./controllers/statsController.js";
import { env } from "./config/env.js";
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

export async function buildApp() {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: true });
  app.setErrorHandler(errorHandler);

  await app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "YouTube History API",
        description: "REST API for the YouTube History Dashboard",
        version: "1.0.0",
      },
      servers: [{ url: `http://localhost:${env.port}`, description: "Local" }],
      tags: [
        { name: "history", description: "Watch history list" },
        { name: "stats", description: "Aggregated statistics" },
      ],
    },
  });
  await app.register(swaggerUi, {
    routePrefix: "/documentation",
    uiConfig: { docExpansion: "list" },
  });

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
    app.get("/", { schema: { hide: true } }, (_request, reply) => reply.sendFile("index.html"));
    app.get("/history", { schema: { hide: true } }, (_request, reply) => reply.sendFile("history.html"));
  }

  return app;
}
