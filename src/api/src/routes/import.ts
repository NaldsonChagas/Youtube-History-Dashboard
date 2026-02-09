import type { FastifyInstance } from "fastify";
import type { ImportController } from "../controllers/importController.js";

const statusSchema = {
  tags: ["import"],
  description: "Check if history data has been imported",
  response: {
    200: {
      type: "object",
      required: ["hasData"],
      properties: { hasData: { type: "boolean" } },
    },
  },
};

const importSchema = {
  tags: ["import"],
  description: "Import watch history from Takeout HTML",
  consumes: ["text/html"],
  response: {
    201: {
      type: "object",
      required: ["inserted"],
      properties: { inserted: { type: "integer", description: "Number of rows inserted" } },
    },
  },
};

export async function registerImportRoutes(
  app: FastifyInstance,
  importController: ImportController
): Promise<void> {
  app.get(
    "/status",
    { schema: statusSchema },
    importController.getStatus.bind(importController)
  );
  app.post(
    "/",
    { schema: importSchema },
    importController.importHistory.bind(importController)
  );
}
