import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const statusCode = error.statusCode ?? 500;
  request.log.error({ err: error }, error.message);
  reply.status(statusCode).send({
    error: error.name ?? 'InternalServerError',
    message: error.message,
  });
}
