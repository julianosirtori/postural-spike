import type { FastifyInstance } from 'fastify';
import { calculateAllAngles } from '@prumo/postural-core';
import type { Keypoint, ViewType } from '@prumo/postural-core';
import { AnalyzeRequestSchema } from '../schemas.js';

export async function analyzeRoute(app: FastifyInstance) {
  app.post('/analyze', async (request, reply) => {
    const parsed = AnalyzeRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid request body',
        details: parsed.error.issues,
      });
    }

    const { keypoints, view } = parsed.data;
    const angles = calculateAllAngles(keypoints as Keypoint[], view as ViewType);

    return { angles };
  });
}
