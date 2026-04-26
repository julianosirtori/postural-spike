import type { FastifyInstance } from 'fastify';
import { ReportRequestSchema } from '../schemas.js';
import { generateReport } from '../llm/client.js';

export async function reportRoute(app: FastifyInstance) {
  app.post('/report', async (request, reply) => {
    const parsed = ReportRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid request body',
        details: parsed.error.issues,
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return reply.status(500).send({
        error: 'ANTHROPIC_API_KEY not configured. See .env.example for setup instructions.',
      });
    }

    try {
      const report = await generateReport(parsed.data);
      return report;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Report generation failed:', message);
      return reply.status(502).send({
        error: 'Falha ao gerar relatório. Tente novamente.',
        details: message,
      });
    }
  });
}
