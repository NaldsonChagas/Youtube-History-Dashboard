import type { FastifyReply, FastifyRequest } from "fastify";
import { Inject, Injectable } from "injection-js";
import {
  CLEAR_DATA_USE_CASE,
  GET_IMPORT_STATUS_USE_CASE,
  IMPORT_HISTORY_USE_CASE,
} from "../di/tokens.js";
import type { ClearDataUseCase } from "../use-cases/import/ClearDataUseCase.js";
import type { GetImportStatusUseCase } from "../use-cases/import/GetImportStatusUseCase.js";
import type {
  ImportHistoryUseCase,
} from "../use-cases/import/ImportHistoryUseCase.js";

@Injectable()
export class ImportController {
  constructor(
    @Inject(CLEAR_DATA_USE_CASE)
    private readonly clearDataUseCase: ClearDataUseCase,
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
    const result = await this.importHistoryUseCase.execute(html);
    await reply.status(201).send(result);
  }

  async clearData(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.clearDataUseCase.execute();
    await reply.status(204).send();
  }
}
