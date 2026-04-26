import type { CalculatedAngle, Classification } from '@prumo/postural-core';

interface AnglesPanelProps {
  angles: CalculatedAngle[];
}

const ANGLE_LABELS: Record<string, string> = {
  craniovertebral: 'Craniovertebral',
  shoulder_alignment: 'Alinhamento de Ombros',
  hip_alignment: 'Alinhamento de Quadril',
};

const CLASSIFICATION_LABELS: Record<Classification, string> = {
  normal: 'Normal',
  mild: 'Leve',
  moderate: 'Moderado',
  severe: 'Severo',
};

const CLASSIFICATION_COLORS: Record<Classification, string> = {
  normal: 'bg-green-100 text-green-800',
  mild: 'bg-yellow-100 text-yellow-800',
  moderate: 'bg-orange-100 text-orange-800',
  severe: 'bg-red-100 text-red-800',
};

export function AnglesPanel({ angles }: AnglesPanelProps) {
  if (angles.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-700 mb-2">Ângulos Calculados</h3>
        <p className="text-sm text-gray-500">Selecione uma vista lateral para ver o ângulo craniovertebral, ou anterior/posterior para ombros e quadril.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-700 mb-3">Ângulos Calculados</h3>
      <div className="space-y-3">
        {angles.map((angle) => (
          <div key={angle.code} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {ANGLE_LABELS[angle.code] || angle.code}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${CLASSIFICATION_COLORS[angle.classification]}`}
              >
                {CLASSIFICATION_LABELS[angle.classification]}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {angle.value.toFixed(1)}°
              </span>
              <span className="text-xs text-gray-500">
                ref: {angle.referenceMin}°–{angle.referenceMax}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
