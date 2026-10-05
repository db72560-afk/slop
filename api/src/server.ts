import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerTenderRoutes } from './routes/tenders.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
});

app.get('/health', async () => ({ status: 'ok' }));
await registerTenderRoutes(app);

const port = Number(process.env.PORT ?? 3001);

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
