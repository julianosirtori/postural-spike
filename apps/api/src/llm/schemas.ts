import { z } from 'zod';

const ClassificationEnum = z.enum(['normal', 'mild', 'moderate', 'severe']);

export const ClinicalReportSchema = z.object({
  summary: z.string(),
  findings: z.array(
    z.object({
      area: z.string(),
      observation: z.string(),
      severity: ClassificationEnum,
    })
  ),
  hypotheses: z.array(z.string()),
  suggested_next_steps: z.array(z.string()),
});

export const PatientReportSchema = z.object({
  summary: z.string(),
  main_points: z.array(z.string()),
  encouragement: z.string(),
});

export const PosturalReportSchema = z.object({
  clinical_report: ClinicalReportSchema,
  patient_report: PatientReportSchema,
  disclaimers: z.array(z.string()),
});

export type PosturalReportOutput = z.infer<typeof PosturalReportSchema>;
