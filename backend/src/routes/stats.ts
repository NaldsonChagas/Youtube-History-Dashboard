import type { FastifyInstance } from "fastify";
import type { StatsController } from "../controllers/statsController.js";

export async function registerStatsRoutes(
  app: FastifyInstance,
  statsController: StatsController
): Promise<void> {
  app.get("/overview", statsController.overview.bind(statsController));
  app.get("/channels", statsController.channels.bind(statsController));
  app.get("/by-hour", statsController.byHour.bind(statsController));
  app.get("/by-weekday", statsController.byWeekday.bind(statsController));
  app.get("/by-month", statsController.byMonth.bind(statsController));
}
