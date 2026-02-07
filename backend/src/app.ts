import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'fs';
import { historyRoutes } from './routes/history.js';
import { statsRoutes } from './routes/stats.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

export async function buildApp() {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: true });
  app.setErrorHandler(errorHandler);

  await app.register(historyRoutes, { prefix: '/api/history' });
  await app.register(statsRoutes, { prefix: '/api/stats' });

  const publicPath = env.publicPath;
  if (existsSync(publicPath)) {
    await app.register(fastifyStatic, { root: publicPath });
    app.get('/', (_request, reply) => reply.sendFile('index.html'));
    app.get('/history', (_request, reply) => reply.sendFile('history.html'));
  }

  return app;
}
