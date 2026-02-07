import { FastifyInstance } from 'fastify';
import { historyController } from '../controllers/historyController.js';

export async function historyRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', historyController.list);
}
