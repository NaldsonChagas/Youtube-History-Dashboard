import { FastifyRequest, FastifyReply } from 'fastify';
import { statsModel } from '../models/statsModel.js';

interface StatsQuerystring {
  from?: string;
  to?: string;
}

const rawDate = (v: string | undefined): string | undefined =>
  v && v !== 'undefined' ? v : undefined;

export const statsController = {
  async overview(
    request: FastifyRequest<{ Querystring: StatsQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await statsModel.overview(
      rawDate(request.query.from),
      rawDate(request.query.to)
    );
    await reply.send(result);
  },

  async channels(
    request: FastifyRequest<{ Querystring: StatsQuerystring & { limit?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const limit = Math.min(50, Math.max(1, parseInt(request.query.limit ?? '10', 10) || 10));
    const result = await statsModel.channels(
      rawDate(request.query.from),
      rawDate(request.query.to),
      limit
    );
    await reply.send(result);
  },

  async byHour(
    request: FastifyRequest<{ Querystring: StatsQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await statsModel.byHour(
      rawDate(request.query.from),
      rawDate(request.query.to)
    );
    await reply.send(result);
  },

  async byWeekday(
    request: FastifyRequest<{ Querystring: StatsQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await statsModel.byWeekday(
      rawDate(request.query.from),
      rawDate(request.query.to)
    );
    await reply.send(result);
  },

  async byMonth(
    request: FastifyRequest<{ Querystring: StatsQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await statsModel.byMonth(
      rawDate(request.query.from),
      rawDate(request.query.to)
    );
    await reply.send(result);
  },
};
