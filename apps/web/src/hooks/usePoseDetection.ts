import { useRef, useState, useCallback } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import type { Keypoint } from '@prumo/postural-core';
import { LANDMARK_NAMES } from '@prumo/postural-core';

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.24/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export function usePoseDetection() {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initLandmarker = async (): Promise<PoseLandmarker> => {
    if (landmarkerRef.current) return landmarkerRef.current;

    const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
    const landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numPoses: 1,
    });

    landmarkerRef.current = landmarker;
    return landmarker;
  };

  const detect = useCallback(async (image: HTMLImageElement): Promise<Keypoint[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const landmarker = await initLandmarker();
      const result = landmarker.detect(image);

      if (!result.landmarks || result.landmarks.length === 0) {
        setError('Nenhuma pessoa detectada na imagem. Tente outra foto com o corpo inteiro visível.');
        return null;
      }

      const landmarks = result.landmarks[0];
      const keypoints: Keypoint[] = landmarks.map((lm, index) => ({
        name: LANDMARK_NAMES[index],
        x: lm.x * image.naturalWidth,
        y: lm.y * image.naturalHeight,
        z: lm.z,
        visibility: lm.visibility ?? 0,
        manuallyAdjusted: false,
      }));

      return keypoints;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na detecção de pose';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { detect, isLoading, error };
}
