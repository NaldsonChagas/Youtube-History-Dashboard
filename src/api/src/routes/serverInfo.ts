import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";
import { getNetworkBaseUrl } from "../lib/network.js";

const serverInfoResponse = {
  200: {
    type: "object",
    required: ["baseUrl"],
    properties: {
      baseUrl: { type: "string", description: "Base URL to access the server on the network" },
    },
  },
};

export async function registerServerInfoRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/server-info",
    {
      schema: {
        tags: ["server"],
        description: "Server network address for access from other devices",
        response: serverInfoResponse,
      },
    },
    async (_request, reply) => {
      const baseUrl = getNetworkBaseUrl(env.port);
      return reply.send({ baseUrl });
    }
  );
}
