import { useState, useCallback, useMemo } from 'react';
import type { Keypoint, ViewType, CalculatedAngle, ReportResponse, PatientContext, DetectionQuality } from '@prumo/postural-core';
import { calculateAllAngles } from '@prumo/postural-core';
import { usePoseDetection } from './hooks/usePoseDetection.js';
import { PostureEditor } from './components/PostureEditor.js';
import { AnglesPanel } from './components/AnglesPanel.js';
import { PatientContextForm } from './components/PatientContextForm.js';
import { ReportViewer } from './components/ReportViewer.js';

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [view, setView] = useState<ViewType>('anterior');
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const { detect, isLoading: detectLoading, error: detectError } = usePoseDetection();

  const angles: CalculatedAngle[] = useMemo(() => {
    if (keypoints.length === 0) return [];
    return calculateAllAngles(keypoints, view);
  }, [keypoints, view]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setKeypoints([]);
      setReport(null);
      setReportError(null);

      const img = new Image();
      img.src = url;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });

      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      const detected = await detect(img);
      if (detected) {
        setKeypoints(detected);
      }
    },
    [detect]
  );

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleKeypointMove = useCallback((index: number, x: number, y: number) => {
    setKeypoints((prev) =>
      prev.map((kp, i) =>
        i === index ? { ...kp, x, y, manuallyAdjusted: true } : kp
      )
    );
  }, []);

  const handleGenerateReport = useCallback(
    async (patientContext: PatientContext) => {
      setReportLoading(true);
      setReportError(null);

      const detectionQuality: DetectionQuality = {
        averageConfidence:
          keypoints.reduce((sum, kp) => sum + kp.visibility, 0) / keypoints.length,
        pointsManuallyAdjusted: keypoints.filter((kp) => kp.manuallyAdjusted).length,
        totalPoints: keypoints.length,
      };

      try {
        const res = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            angles,
            patientContext,
            detectionQuality,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Erro ${res.status}`);
        }

        const data: ReportResponse = await res.json();
        setReport(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setReportError(message);
      } finally {
        setReportLoading(false);
      }
    },
    [angles, keypoints]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Prumo — Análise Postural</h1>
        <p className="text-sm text-gray-500">Spike de validação técnica</p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!imageUrl && (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="text-gray-500">
              <p className="text-lg font-medium">Arraste uma foto ou clique para selecionar</p>
              <p className="text-sm mt-2">JPG ou PNG — pessoa em pé, corpo inteiro visível</p>
            </div>
          </div>
        )}

        {detectLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Detectando pontos anatômicos...</p>
          </div>
        )}

        {detectError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-700">{detectError}</p>
          </div>
        )}

        {imageUrl && imageDimensions && keypoints.length > 0 && (
          <>
            <div className="mb-4 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Vista:</label>
              <select
                value={view}
                onChange={(e) => setView(e.target.value as ViewType)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm"
              >
                <option value="anterior">Anterior</option>
                <option value="posterior">Posterior</option>
                <option value="lateral_left">Lateral Esquerda</option>
                <option value="lateral_right">Lateral Direita</option>
              </select>
              <button
                onClick={() => {
                  setImageUrl(null);
                  setKeypoints([]);
                  setReport(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Nova foto
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              <PostureEditor
                imageUrl={imageUrl}
                width={imageDimensions.width}
                height={imageDimensions.height}
                keypoints={keypoints}
                onKeypointMove={handleKeypointMove}
              />
              <div className="space-y-6">
                <AnglesPanel angles={angles} />
                <PatientContextForm
                  onSubmit={handleGenerateReport}
                  isLoading={reportLoading}
                />
              </div>
            </div>

            {reportError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                <p className="text-red-700 font-medium">Erro ao gerar relatório</p>
                <p className="text-red-600 text-sm mt-1">{reportError}</p>
              </div>
            )}

            {report && (
              <div className="mt-6">
                <ReportViewer report={report} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
