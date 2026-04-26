/** All 33 MediaPipe Pose Landmarker keypoint names */
export type KeypointName =
  | 'nose'
  | 'left_eye_inner'
  | 'left_eye'
  | 'left_eye_outer'
  | 'right_eye_inner'
  | 'right_eye'
  | 'right_eye_outer'
  | 'left_ear'
  | 'right_ear'
  | 'mouth_left'
  | 'mouth_right'
  | 'left_shoulder'
  | 'right_shoulder'
  | 'left_elbow'
  | 'right_elbow'
  | 'left_wrist'
  | 'right_wrist'
  | 'left_pinky'
  | 'right_pinky'
  | 'left_index'
  | 'right_index'
  | 'left_thumb'
  | 'right_thumb'
  | 'left_hip'
  | 'right_hip'
  | 'left_knee'
  | 'right_knee'
  | 'left_ankle'
  | 'right_ankle'
  | 'left_heel'
  | 'right_heel'
  | 'left_foot_index'
  | 'right_foot_index';

export interface Keypoint {
  name: KeypointName;
  x: number;
  y: number;
  z: number;
  visibility: number;
  manuallyAdjusted: boolean;
}

export type AngleCode = 'craniovertebral' | 'shoulder_alignment' | 'hip_alignment';

export type ViewType = 'anterior' | 'posterior' | 'lateral_left' | 'lateral_right';

export type Classification = 'normal' | 'mild' | 'moderate' | 'severe';

export interface CalculatedAngle {
  code: AngleCode;
  view: ViewType;
  value: number;
  referenceMin: number;
  referenceMax: number;
  classification: Classification;
}

export interface PatientContext {
  age?: number;
  sex?: 'M' | 'F' | 'other' | 'undisclosed';
  mainComplaint?: string;
  relevantHistory?: string;
}

export interface DetectionQuality {
  averageConfidence: number;
  pointsManuallyAdjusted: number;
  totalPoints: number;
}

export interface ClinicalReport {
  summary: string;
  findings: Array<{
    area: string;
    observation: string;
    severity: Classification;
  }>;
  hypotheses: string[];
  suggestedNextSteps: string[];
}

export interface PatientReport {
  summary: string;
  mainPoints: string[];
  encouragement: string;
}

export interface ReportResponse {
  clinicalReport: ClinicalReport;
  patientReport: PatientReport;
  disclaimers: string[];
  meta: {
    model: string;
    promptVersion: string;
    processingMs: number;
    inputTokens: number;
    outputTokens: number;
  };
}

/** MediaPipe landmark index → keypoint name mapping */
export const LANDMARK_NAMES: readonly KeypointName[] = [
  'nose',
  'left_eye_inner',
  'left_eye',
  'left_eye_outer',
  'right_eye_inner',
  'right_eye',
  'right_eye_outer',
  'left_ear',
  'right_ear',
  'mouth_left',
  'mouth_right',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_pinky',
  'right_pinky',
  'left_index',
  'right_index',
  'left_thumb',
  'right_thumb',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
  'left_heel',
  'right_heel',
  'left_foot_index',
  'right_foot_index',
] as const;
