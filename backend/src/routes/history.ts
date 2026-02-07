import type { FastifyInstance } from "fastify";
import type { HistoryController } from "../controllers/historyController.js";

export async function registerHistoryRoutes(
  app: FastifyInstance,
  historyController: HistoryController
): Promise<void> {
  app.get("/", historyController.list.bind(historyController));
}
