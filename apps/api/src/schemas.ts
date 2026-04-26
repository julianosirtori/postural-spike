import { z } from 'zod';

const ClassificationEnum = z.enum(['normal', 'mild', 'moderate', 'severe']);
const ViewTypeEnum = z.enum(['anterior', 'posterior', 'lateral_left', 'lateral_right']);
const AngleCodeEnum = z.enum(['craniovertebral', 'shoulder_alignment', 'hip_alignment']);

export const AnalyzeRequestSchema = z.object({
  keypoints: z.array(
    z.object({
      name: z.string(),
      x: z.number(),
      y: z.number(),
      z: z.number(),
      visibility: z.number(),
      manuallyAdjusted: z.boolean(),
    })
  ),
  view: ViewTypeEnum,
});

export const ReportRequestSchema = z.object({
  angles: z.array(
    z.object({
      code: AngleCodeEnum,
      view: ViewTypeEnum,
      value: z.number(),
      referenceMin: z.number(),
      referenceMax: z.number(),
      classification: ClassificationEnum,
    })
  ),
  patientContext: z.object({
    age: z.number().optional(),
    sex: z.enum(['M', 'F', 'other', 'undisclosed']).optional(),
    mainComplaint: z.string().max(500).optional(),
    relevantHistory: z.string().max(500).optional(),
  }),
  detectionQuality: z.object({
    averageConfidence: z.number(),
    pointsManuallyAdjusted: z.number(),
    totalPoints: z.number(),
  }),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type ReportRequest = z.infer<typeof ReportRequestSchema>;
