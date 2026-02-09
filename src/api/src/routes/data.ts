import type { FastifyInstance } from "fastify";
import type { ImportController } from "../controllers/importController.js";

const clearSchema = {
  tags: ["import"],
  description: "Delete all watch history data. After this, the app will show the setup screen.",
  response: { 204: { type: "null", description: "Data cleared" } },
};

export async function registerDataRoutes(
  app: FastifyInstance,
  importController: ImportController
): Promise<void> {
  app.delete(
    "/data",
    { schema: clearSchema },
    importController.clearData.bind(importController)
  );
}
