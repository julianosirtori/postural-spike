import Anthropic from '@anthropic-ai/sdk';
import type { ReportRequest } from '../schemas.js';
import type { ReportResponse } from '@prumo/postural-core';
import { SYSTEM_PROMPT_V1, REPORT_TOOL_DEFINITION, PROMPT_VERSION } from './prompts.js';
import { PosturalReportSchema } from './schemas.js';

const MODEL = 'claude-sonnet-4-5-20250514';

function buildUserMessage(input: ReportRequest): string {
  const anglesDescription = input.angles
    .map(
      (a) =>
        `- ${a.code} (vista ${a.view}): ${a.value}° (referência: ${a.referenceMin}°–${a.referenceMax}°, classificação: ${a.classification})`
    )
    .join('\n');

  const patientInfo = [];
  if (input.patientContext.age) patientInfo.push(`Idade: ${input.patientContext.age} anos`);
  if (input.patientContext.sex) patientInfo.push(`Sexo: ${input.patientContext.sex}`);
  if (input.patientContext.mainComplaint)
    patientInfo.push(`Queixa principal: ${input.patientContext.mainComplaint}`);
  if (input.patientContext.relevantHistory)
    patientInfo.push(`Histórico relevante: ${input.patientContext.relevantHistory}`);

  const qualityInfo = [
    `Confiança média da detecção: ${(input.detectionQuality.averageConfidence * 100).toFixed(1)}%`,
    `Pontos ajustados manualmente: ${input.detectionQuality.pointsManuallyAdjusted} de ${input.detectionQuality.totalPoints}`,
  ].join('\n');

  return `## Dados da Avaliação Postural

### Ângulos Medidos
${anglesDescription}

### Contexto do Paciente
${patientInfo.length > 0 ? patientInfo.join('\n') : 'Nenhum contexto adicional fornecido.'}

### Qualidade da Detecção
${qualityInfo}

Por favor, gere o relatório completo usando a ferramenta submit_postural_report.`;
}

export async function generateReport(input: ReportRequest): Promise<ReportResponse> {
  const anthropic = new Anthropic({
    timeout: 30_000,
  });

  const startTime = Date.now();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT_V1,
    messages: [{ role: 'user', content: buildUserMessage(input) }],
    tools: [REPORT_TOOL_DEFINITION],
    tool_choice: { type: 'tool', name: 'submit_postural_report' },
  });

  const processingMs = Date.now() - startTime;

  const toolUseBlock = response.content.find((block) => block.type === 'tool_use');
  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    console.error('LLM did not call the tool. Response:', JSON.stringify(response.content));
    throw new Error('Modelo não gerou o relatório no formato esperado (tool_use não encontrado).');
  }

  const parsed = PosturalReportSchema.safeParse(toolUseBlock.input);
  if (!parsed.success) {
    console.error('Zod validation failed:', parsed.error.issues);
    console.error('Raw tool input:', JSON.stringify(toolUseBlock.input));
    throw new Error('Relatório gerado pelo modelo não passou na validação de schema.');
  }

  const { input_tokens, output_tokens } = response.usage;
  console.log(
    `[LLM] model=${MODEL} time=${processingMs}ms tokens_in=${input_tokens} tokens_out=${output_tokens}`
  );

  return {
    clinicalReport: {
      summary: parsed.data.clinical_report.summary,
      findings: parsed.data.clinical_report.findings.map((f) => ({
        area: f.area,
        observation: f.observation,
        severity: f.severity,
      })),
      hypotheses: parsed.data.clinical_report.hypotheses,
      suggestedNextSteps: parsed.data.clinical_report.suggested_next_steps,
    },
    patientReport: {
      summary: parsed.data.patient_report.summary,
      mainPoints: parsed.data.patient_report.main_points,
      encouragement: parsed.data.patient_report.encouragement,
    },
    disclaimers: parsed.data.disclaimers,
    meta: {
      model: MODEL,
      promptVersion: PROMPT_VERSION,
      processingMs,
      inputTokens: input_tokens,
      outputTokens: output_tokens,
    },
  };
}
