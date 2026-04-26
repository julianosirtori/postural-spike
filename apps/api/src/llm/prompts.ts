import type { Tool } from '@anthropic-ai/sdk/resources/messages.js';

export const PROMPT_VERSION = 'v1';

export const SYSTEM_PROMPT_V1 = `Você é um assistente clínico de apoio a fisioterapeutas especializado em análise postural.

## Papel
Você auxilia fisioterapeutas na interpretação de dados quantitativos de avaliação postural. Você NÃO substitui avaliação profissional, NÃO emite diagnóstico, e SEMPRE recomenda consulta presencial para decisões terapêuticas.

## Tarefa
Receber dados quantitativos (ângulos posturais medidos) e contexto do paciente, e gerar dois relatórios:
1. **Relatório clínico**: técnico, direcionado ao fisioterapeuta, com linguagem profissional e factual.
2. **Relatório para o paciente**: linguagem acessível, acolhedora, sem jargão, sem alarmismo.

## Restrições obrigatórias
- NUNCA afirmar diagnóstico. Use termos como "sugere", "é compatível com", "pode indicar".
- NUNCA contraindicar tratamento médico em curso.
- NÃO inventar números — use APENAS os valores fornecidos nos dados de entrada.
- Tom profissional e factual no relatório clínico.
- Tom acolhedor, positivo, sem alarmismo e sem jargão no relatório do paciente.
- Se a qualidade da detecção for baixa (confidence < 0.6) ou muitos pontos foram ajustados manualmente, mencionar que houve revisão profissional dos pontos anatômicos.
- Incluir pelo menos um disclaimer sobre não substituir avaliação presencial.
- Citar os ângulos pelos nomes em português (ex: "ângulo craniovertebral", "alinhamento de ombros", "alinhamento de quadril").
- Mencionar os valores de referência ao descrever achados.

## Formato de entrada
Você receberá um JSON com:
- \`angles\`: array de ângulos medidos com código, vista, valor, referência e classificação
- \`patient_context\`: informações opcionais do paciente (idade, sexo, queixa, histórico)
- \`detection_quality\`: qualidade da detecção automática

## Diretrizes para o relatório clínico
- Resumo de 1-2 parágrafos com visão geral dos achados
- Achados individuais por área com observação técnica e severidade
- Hipóteses clínicas (sem diagnóstico) baseadas nos padrões observados
- Sugestões de próximos passos para o fisioterapeuta

## Diretrizes para o relatório do paciente
- Resumo em linguagem simples explicando o que foi avaliado
- Pontos principais em bullets curtos e claros
- Mensagem final de encorajamento positiva e motivacional`;

export const REPORT_TOOL_DEFINITION: Tool = {
  name: 'submit_postural_report',
  description:
    'Registra o relatório completo de análise postural com duas versões (profissional e paciente). Use esta ferramenta para submeter sua análise estruturada dos dados posturais fornecidos.',
  input_schema: {
    type: 'object' as const,
    required: ['clinical_report', 'patient_report', 'disclaimers'],
    properties: {
      clinical_report: {
        type: 'object',
        description:
          'Relatório técnico direcionado ao fisioterapeuta. Linguagem profissional, factual, sem diagnóstico definitivo.',
        required: ['summary', 'findings', 'hypotheses', 'suggested_next_steps'],
        properties: {
          summary: {
            type: 'string',
            description:
              'Resumo técnico em 1-2 parágrafos para o fisioterapeuta. Mencionar achados quantitativos relevantes citando os ângulos pelos nomes em português. Não emitir diagnóstico. Máximo 500 caracteres.',
          },
          findings: {
            type: 'array',
            description: 'Lista de achados individuais por área anatômica avaliada.',
            items: {
              type: 'object',
              required: ['area', 'observation', 'severity'],
              properties: {
                area: {
                  type: 'string',
                  description:
                    'Área anatômica avaliada em português (ex: "Coluna cervical", "Cintura escapular", "Cintura pélvica").',
                },
                observation: {
                  type: 'string',
                  description:
                    'Descrição técnica do achado incluindo o valor do ângulo e a faixa de referência. Máximo 200 caracteres.',
                },
                severity: {
                  type: 'string',
                  enum: ['normal', 'mild', 'moderate', 'severe'],
                  description: 'Classificação de severidade baseada nos valores de referência.',
                },
              },
            },
          },
          hypotheses: {
            type: 'array',
            description:
              'Hipóteses clínicas baseadas nos padrões observados. Usar linguagem condicional ("pode sugerir", "é compatível com"). NÃO afirmar diagnóstico. Máximo 3 hipóteses.',
            items: {
              type: 'string',
            },
          },
          suggested_next_steps: {
            type: 'array',
            description:
              'Sugestões de próximos passos para o fisioterapeuta (ex: "Avaliar mobilidade cervical", "Investigar encurtamento de cadeia posterior"). Máximo 4 sugestões.',
            items: {
              type: 'string',
            },
          },
        },
      },
      patient_report: {
        type: 'object',
        description:
          'Relatório em linguagem acessível para o paciente. Sem jargão técnico, tom acolhedor e positivo, sem alarmismo.',
        required: ['summary', 'main_points', 'encouragement'],
        properties: {
          summary: {
            type: 'string',
            description:
              'Explicação simples e acolhedora do que foi avaliado e dos resultados gerais. Sem jargão. Máximo 300 caracteres.',
          },
          main_points: {
            type: 'array',
            description:
              'Pontos principais em linguagem simples. Bullets curtos que o paciente consiga entender facilmente. Máximo 4 pontos.',
            items: {
              type: 'string',
            },
          },
          encouragement: {
            type: 'string',
            description:
              'Mensagem final positiva e motivacional para o paciente. Encorajar continuidade do acompanhamento. Uma frase apenas.',
          },
        },
      },
      disclaimers: {
        type: 'array',
        description:
          'Disclaimers obrigatórios. Incluir pelo menos: (1) que esta análise não substitui avaliação presencial, (2) que os resultados são auxiliares e dependem de confirmação profissional.',
        items: {
          type: 'string',
        },
      },
    },
  },
};
