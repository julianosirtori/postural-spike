import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { analyzeRoute } from './routes/analyze.js';
import { reportRoute } from './routes/report.js';

const port = Number(process.env.PORT) || 3001;

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.register(analyzeRoute, { prefix: '/api' });
app.register(reportRoute, { prefix: '/api' });

try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`API server running on http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
