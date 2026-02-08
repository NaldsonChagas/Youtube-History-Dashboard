import type { FastifyInstance } from "fastify";
import type { StatsController } from "../controllers/statsController.js";

const dateRangeQuerystring = {
  type: "object",
  properties: {
    from: { type: "string", format: "date", description: "Filter from date (ISO 8601)" },
    to: { type: "string", format: "date", description: "Filter to date (ISO 8601)" },
  },
};

const overviewResponse = {
  200: {
    type: "object",
    required: ["totalViews", "uniqueChannels", "firstWatched", "lastWatched"],
    properties: {
      totalViews: { type: "integer" },
      uniqueChannels: { type: "integer" },
      firstWatched: { type: "string", nullable: true },
      lastWatched: { type: "string", nullable: true },
    },
  },
};

const channelsQuerystring = {
  type: "object",
  properties: {
    from: { type: "string", format: "date", description: "Filter from date (ISO 8601)" },
    to: { type: "string", format: "date", description: "Filter to date (ISO 8601)" },
    limit: { type: "integer", minimum: 1, maximum: 50, default: 10, description: "Max channels to return" },
    search: { type: "string", description: "Filter by channel name (case-insensitive partial match)" },
  },
};

const channelsResponse = {
  200: {
    type: "array",
    items: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        channelName: { type: "string" },
        count: { type: "integer" },
      },
    },
  },
};

const hourResponse = {
  200: {
    type: "array",
    items: {
      type: "object",
      properties: {
        hour: { type: "integer" },
        count: { type: "integer" },
      },
    },
  },
};

const weekdayResponse = {
  200: {
    type: "array",
    items: {
      type: "object",
      properties: {
        weekday: { type: "integer" },
        count: { type: "integer" },
      },
    },
  },
};

const monthResponse = {
  200: {
    type: "array",
    items: {
      type: "object",
      properties: {
        year: { type: "integer" },
        month: { type: "integer" },
        count: { type: "integer" },
      },
    },
  },
};

export async function registerStatsRoutes(
  app: FastifyInstance,
  statsController: StatsController
): Promise<void> {
  app.get(
    "/overview",
    { schema: { tags: ["stats"], description: "Totals: views, channels, first/last date", querystring: dateRangeQuerystring, response: overviewResponse } },
    statsController.overview.bind(statsController)
  );
  app.get(
    "/channels",
    { schema: { tags: ["stats"], description: "Most watched channels", querystring: channelsQuerystring, response: channelsResponse } },
    statsController.channels.bind(statsController)
  );
  app.get(
    "/by-hour",
    { schema: { tags: ["stats"], description: "View count by hour of day (0–23)", querystring: dateRangeQuerystring, response: hourResponse } },
    statsController.byHour.bind(statsController)
  );
  app.get(
    "/by-weekday",
    { schema: { tags: ["stats"], description: "View count by weekday (0–6)", querystring: dateRangeQuerystring, response: weekdayResponse } },
    statsController.byWeekday.bind(statsController)
  );
  app.get(
    "/by-month",
    { schema: { tags: ["stats"], description: "View count by month/year", querystring: dateRangeQuerystring, response: monthResponse } },
    statsController.byMonth.bind(statsController)
  );
}
