import type { FastifyReply, FastifyRequest } from "fastify";
import { Inject, Injectable } from "injection-js";
import { LIST_HISTORY_USE_CASE } from "../di/tokens.js";
import { optionalQueryParam } from "../lib/queryParams.js";
import type { ListHistoryUseCase } from "../use-cases/history/ListHistoryUseCase.js";

interface ListQuerystring {
  page?: string;
  limit?: string;
  from?: string;
  to?: string;
  channel_id?: string;
}

@Injectable()
export class HistoryController {
  constructor(
    @Inject(LIST_HISTORY_USE_CASE) private readonly listHistoryUseCase: ListHistoryUseCase
  ) {}

  async list(
    request: FastifyRequest<{ Querystring: ListQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const page = Math.max(1, parseInt(request.query.page ?? "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(request.query.limit ?? "50", 10) || 50)
    );
    const from = optionalQueryParam(request.query.from);
    const to = optionalQueryParam(request.query.to);
    const channelId = optionalQueryParam(request.query.channel_id);

    const result = await this.listHistoryUseCase.execute({
      page,
      limit,
      from,
      to,
      channelId,
    });

    await reply.send(result);
  }
}
