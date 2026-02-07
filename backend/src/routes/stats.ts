import { FastifyInstance } from 'fastify';
import { statsController } from '../controllers/statsController.js';

export async function statsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/overview', statsController.overview);
  app.get('/channels', statsController.channels);
  app.get('/by-hour', statsController.byHour);
  app.get('/by-weekday', statsController.byWeekday);
  app.get('/by-month', statsController.byMonth);
}
