import { useState } from 'react';
import type { ReportResponse, Classification } from '@prumo/postural-core';

interface ReportViewerProps {
  report: ReportResponse;
}

const SEVERITY_COLORS: Record<Classification, string> = {
  normal: 'border-l-green-500 bg-green-50',
  mild: 'border-l-yellow-500 bg-yellow-50',
  moderate: 'border-l-orange-500 bg-orange-50',
  severe: 'border-l-red-500 bg-red-50',
};

type Tab = 'clinical' | 'patient';

export function ReportViewer({ report }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('clinical');
  const [showMeta, setShowMeta] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Tab header */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('clinical')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'clinical'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Para o profissional
        </button>
        <button
          onClick={() => setActiveTab('patient')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'patient'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Para o paciente
        </button>
      </div>

      {/* Clinical tab */}
      {activeTab === 'clinical' && (
        <div className="p-6 space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Resumo</h4>
            <p className="text-gray-800 leading-relaxed">{report.clinicalReport.summary}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Achados</h4>
            <div className="space-y-2">
              {report.clinicalReport.findings.map((finding, i) => (
                <div
                  key={i}
                  className={`border-l-4 rounded-r-lg p-3 ${SEVERITY_COLORS[finding.severity]}`}
                >
                  <p className="font-medium text-gray-800 text-sm">{finding.area}</p>
                  <p className="text-gray-700 text-sm mt-0.5">{finding.observation}</p>
                </div>
              ))}
            </div>
          </div>

          {report.clinicalReport.hypotheses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Hipóteses</h4>
              <ul className="list-disc list-inside space-y-1">
                {report.clinicalReport.hypotheses.map((h, i) => (
                  <li key={i} className="text-gray-700 text-sm">{h}</li>
                ))}
              </ul>
            </div>
          )}

          {report.clinicalReport.suggestedNextSteps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Próximos passos sugeridos
              </h4>
              <ul className="space-y-1">
                {report.clinicalReport.suggestedNextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 mt-0.5">→</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Patient tab */}
      {activeTab === 'patient' && (
        <div className="p-6 space-y-5">
          <div>
            <p className="text-gray-800 leading-relaxed">{report.patientReport.summary}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Pontos principais
            </h4>
            <ul className="space-y-2">
              {report.patientReport.mainPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 font-bold">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-blue-800 text-sm font-medium">
              {report.patientReport.encouragement}
            </p>
          </div>
        </div>
      )}

      {/* Disclaimers footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="space-y-1">
          {report.disclaimers.map((d, i) => (
            <p key={i} className="text-xs text-gray-500 italic">
              {d}
            </p>
          ))}
        </div>
      </div>

      {/* Meta toggle */}
      <div className="px-6 pb-4 bg-gray-50 rounded-b-lg">
        <button
          onClick={() => setShowMeta(!showMeta)}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          {showMeta ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos'}
        </button>
        {showMeta && (
          <div className="mt-2 text-xs text-gray-500 font-mono space-y-0.5">
            <p>Modelo: {report.meta.model}</p>
            <p>Prompt: {report.meta.promptVersion}</p>
            <p>Tempo: {report.meta.processingMs}ms</p>
            <p>Tokens: {report.meta.inputTokens} in / {report.meta.outputTokens} out</p>
          </div>
        )}
      </div>
    </div>
  );
}
