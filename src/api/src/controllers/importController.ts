import type { FastifyReply, FastifyRequest } from "fastify";
import { Inject, Injectable } from "injection-js";
import {
  GET_IMPORT_STATUS_USE_CASE,
  IMPORT_HISTORY_USE_CASE,
} from "../di/tokens.js";
import type { GetImportStatusUseCase } from "../use-cases/import/GetImportStatusUseCase.js";
import type {
  ImportHistoryUseCase,
} from "../use-cases/import/ImportHistoryUseCase.js";
import { ALREADY_HAS_DATA } from "../use-cases/import/ImportHistoryUseCase.js";

@Injectable()
export class ImportController {
  constructor(
    @Inject(GET_IMPORT_STATUS_USE_CASE)
    private readonly getImportStatusUseCase: GetImportStatusUseCase,
    @Inject(IMPORT_HISTORY_USE_CASE)
    private readonly importHistoryUseCase: ImportHistoryUseCase
  ) {}

  async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const status = await this.getImportStatusUseCase.execute();
    await reply.send(status);
  }

  async importHistory(
    request: FastifyRequest<{ Body: string }>,
    reply: FastifyReply
  ): Promise<void> {
    const html = request.body;
    if (typeof html !== "string" || !html.trim()) {
      await reply.status(400).send({
        error: "Bad Request",
        message: "Request body must be non-empty HTML (text/html).",
      });
      return;
    }
    try {
      const result = await this.importHistoryUseCase.execute(html);
      await reply.status(201).send(result);
    } catch (err) {
      const code = (err as Error & { code?: string }).code;
      if (code === ALREADY_HAS_DATA) {
        await reply.status(409).send({
          error: "Conflict",
          message: "Database already has history data. Import only when empty.",
        });
        return;
      }
      throw err;
    }
  }
}
