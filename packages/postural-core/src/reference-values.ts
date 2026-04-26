import type { AngleCode, Classification } from './types.js';

export interface AngleReference {
  min: number;
  max: number;
  classify: (value: number) => Classification;
}

export const ANGLE_REFERENCES: Record<AngleCode, AngleReference> = {
  craniovertebral: {
    min: 49,
    max: 60,
    classify(value: number): Classification {
      if (value < 44) return 'severe';
      if (value < 49) return 'moderate';
      if (value <= 60) return 'normal';
      return 'mild';
    },
  },
  shoulder_alignment: {
    min: 0,
    max: 2,
    classify(value: number): Classification {
      const abs = Math.abs(value);
      if (abs <= 2) return 'normal';
      if (abs <= 5) return 'mild';
      if (abs <= 10) return 'moderate';
      return 'severe';
    },
  },
  hip_alignment: {
    min: 0,
    max: 2,
    classify(value: number): Classification {
      const abs = Math.abs(value);
      if (abs <= 2) return 'normal';
      if (abs <= 5) return 'mild';
      if (abs <= 10) return 'moderate';
      return 'severe';
    },
  },
};
