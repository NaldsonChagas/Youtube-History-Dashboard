import type { FastifyInstance } from "fastify";
import type { HistoryController } from "../controllers/historyController.js";

const listHistorySchema = {
  tags: ["history"],
  description: "Paginated watch history list",
  querystring: {
    type: "object",
    properties: {
      page: { type: "integer", minimum: 1, default: 1, description: "Page number" },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 50, description: "Items per page" },
      from: { type: "string", format: "date", description: "Filter from date (ISO 8601)" },
      to: { type: "string", format: "date", description: "Filter to date (ISO 8601)" },
      channel_id: { type: "string", description: "Filter by channel ID" },
    },
  },
  response: {
    200: {
      type: "object",
      required: ["items", "total"],
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer" },
              video_id: { type: "string", nullable: true },
              title: { type: "string" },
              channel_id: { type: "string" },
              channel_name: { type: "string" },
              watched_at: { type: "string" },
              activity_type: { type: "string" },
              source_url: { type: "string", nullable: true },
            },
          },
        },
        total: { type: "integer" },
      },
    },
  },
};

export async function registerHistoryRoutes(
  app: FastifyInstance,
  historyController: HistoryController
): Promise<void> {
  app.get("/", { schema: listHistorySchema }, historyController.list.bind(historyController));
}
