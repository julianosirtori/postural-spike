import type { Keypoint, AngleCode, ViewType, CalculatedAngle } from './types.js';
import { ANGLE_REFERENCES } from './reference-values.js';

function findKeypoint(keypoints: Keypoint[], name: string): Keypoint {
  const kp = keypoints.find((k) => k.name === name);
  if (!kp) throw new Error(`Keypoint "${name}" not found`);
  return kp;
}

/**
 * Craniovertebral angle: angle between the tragus-C7 line and the horizontal.
 * C7 is approximated as the midpoint between the shoulders.
 *
 * Coordinate system: SVG/screen where Y increases downward.
 * In an upright person, ear.y < shoulder.y (ear is above shoulders in screen coords).
 * The angle measures forward head posture — smaller values = more forward head.
 *
 * @param side - 'left' for left lateral view, 'right' for right lateral view
 */
export function calculateCraniovertebralAngle(
  keypoints: Keypoint[],
  side: 'left' | 'right'
): number {
  const ear = findKeypoint(keypoints, side === 'left' ? 'left_ear' : 'right_ear');
  const leftShoulder = findKeypoint(keypoints, 'left_shoulder');
  const rightShoulder = findKeypoint(keypoints, 'right_shoulder');

  // C7 approximation: midpoint of shoulders
  const c7x = (leftShoulder.x + rightShoulder.x) / 2;
  const c7y = (leftShoulder.y + rightShoulder.y) / 2;

  // Vector from C7 to ear
  const dx = ear.x - c7x;
  // Invert Y because SVG Y-axis points down, but anatomical Y points up
  const dy = c7y - ear.y;

  const radians = Math.atan2(dy, Math.abs(dx));
  const degrees = radians * (180 / Math.PI);

  return Math.round(degrees * 10) / 10;
}

/**
 * Shoulder alignment: absolute angle between the line connecting
 * left and right shoulders and the horizontal.
 * 0° = perfectly level shoulders.
 */
export function calculateShoulderAlignment(keypoints: Keypoint[]): number {
  const left = findKeypoint(keypoints, 'left_shoulder');
  const right = findKeypoint(keypoints, 'right_shoulder');

  const dx = right.x - left.x;
  const dy = right.y - left.y;

  const radians = Math.atan2(dy, dx);
  const degrees = Math.abs(radians * (180 / Math.PI));

  return Math.round(degrees * 10) / 10;
}

/**
 * Hip alignment: absolute angle between the line connecting
 * left and right hips and the horizontal.
 * 0° = perfectly level hips.
 */
export function calculateHipAlignment(keypoints: Keypoint[]): number {
  const left = findKeypoint(keypoints, 'left_hip');
  const right = findKeypoint(keypoints, 'right_hip');

  const dx = right.x - left.x;
  const dy = right.y - left.y;

  const radians = Math.atan2(dy, dx);
  const degrees = Math.abs(radians * (180 / Math.PI));

  return Math.round(degrees * 10) / 10;
}

/**
 * Calculates all applicable angles for a given view and keypoint set.
 * Returns an array of CalculatedAngle with classifications applied.
 */
export function calculateAllAngles(
  keypoints: Keypoint[],
  view: ViewType
): CalculatedAngle[] {
  const angles: CalculatedAngle[] = [];

  if (view === 'lateral_left' || view === 'lateral_right') {
    const side = view === 'lateral_left' ? 'left' : 'right';
    const value = calculateCraniovertebralAngle(keypoints, side);
    const ref = ANGLE_REFERENCES.craniovertebral;
    angles.push({
      code: 'craniovertebral',
      view,
      value,
      referenceMin: ref.min,
      referenceMax: ref.max,
      classification: ref.classify(value),
    });
  }

  if (view === 'anterior' || view === 'posterior') {
    const shoulderValue = calculateShoulderAlignment(keypoints);
    const shoulderRef = ANGLE_REFERENCES.shoulder_alignment;
    angles.push({
      code: 'shoulder_alignment',
      view,
      value: shoulderValue,
      referenceMin: shoulderRef.min,
      referenceMax: shoulderRef.max,
      classification: shoulderRef.classify(shoulderValue),
    });

    const hipValue = calculateHipAlignment(keypoints);
    const hipRef = ANGLE_REFERENCES.hip_alignment;
    angles.push({
      code: 'hip_alignment',
      view,
      value: hipValue,
      referenceMin: hipRef.min,
      referenceMax: hipRef.max,
      classification: hipRef.classify(hipValue),
    });
  }

  return angles;
}
