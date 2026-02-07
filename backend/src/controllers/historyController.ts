import { FastifyRequest, FastifyReply } from 'fastify';
import { historyModel } from '../models/historyModel.js';

interface ListQuerystring {
  page?: string;
  limit?: string;
  from?: string;
  to?: string;
  channel_id?: string;
}

export const historyController = {
  async list(
    request: FastifyRequest<{ Querystring: ListQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const page = Math.max(1, parseInt(request.query.page ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit ?? '50', 10) || 50));
    const raw = (v: string | undefined) => (v && v !== 'undefined' ? v : undefined);
    const from = raw(request.query.from);
    const to = raw(request.query.to);
    const channelId = raw(request.query.channel_id);

    const result = await historyModel.list({
      page,
      limit,
      from,
      to,
      channelId,
    });

    await reply.send(result);
  },
};
