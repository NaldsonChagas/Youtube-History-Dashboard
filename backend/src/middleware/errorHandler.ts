import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export async function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const statusCode = error.statusCode ?? 500;
  reply.status(statusCode).send({
    error: error.name ?? 'InternalServerError',
    message: error.message,
  });
}
