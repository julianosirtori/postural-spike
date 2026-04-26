import { describe, it, expect } from 'vitest';
import type { Keypoint, KeypointName } from '../types.js';
import {
  calculateCraniovertebralAngle,
  calculateShoulderAlignment,
  calculateHipAlignment,
  calculateAllAngles,
} from '../angle-calculator.js';

/** Helper to create a minimal keypoints array with only the needed points */
function makeKeypoints(
  overrides: Partial<Record<KeypointName, { x: number; y: number }>>
): Keypoint[] {
  const defaults: Record<string, { x: number; y: number }> = {
    nose: { x: 200, y: 100 },
    left_ear: { x: 180, y: 120 },
    right_ear: { x: 220, y: 120 },
    left_shoulder: { x: 150, y: 250 },
    right_shoulder: { x: 250, y: 250 },
    left_hip: { x: 160, y: 450 },
    right_hip: { x: 240, y: 450 },
  };

  const merged = { ...defaults, ...overrides };

  return Object.entries(merged).map(([name, pos]) => ({
    name: name as KeypointName,
    x: pos.x,
    y: pos.y,
    z: 0,
    visibility: 0.9,
    manuallyAdjusted: false,
  }));
}

describe('calculateCraniovertebralAngle', () => {
  it('returns ~90° when ear is directly above C7', () => {
    // Ear at (200, 100), shoulders at (150, 250) and (250, 250)
    // C7 midpoint = (200, 250). Ear directly above → 90°
    const keypoints = makeKeypoints({
      left_ear: { x: 200, y: 100 },
      left_shoulder: { x: 150, y: 250 },
      right_shoulder: { x: 250, y: 250 },
    });
    const angle = calculateCraniovertebralAngle(keypoints, 'left');
    expect(angle).toBeCloseTo(90, 0);
  });

  it('returns angle in normal range (~55°) for typical posture', () => {
    // Ear slightly forward: ear at (240, 180), C7 at midpoint of shoulders
    // shoulders at (200, 300) both → C7 = (200, 300)
    // dx = 240 - 200 = 40, dy(inverted) = 300 - 180 = 120
    // atan2(120, 40) ≈ 71.6° — this is too high for "normal"
    // Let's adjust: ear at (260, 200), shoulders at (200, 300) → C7 = (200, 300)
    // dx = 60, dy = 100 → atan2(100, 60) ≈ 59°
    const keypoints = makeKeypoints({
      left_ear: { x: 260, y: 200 },
      left_shoulder: { x: 200, y: 300 },
      right_shoulder: { x: 200, y: 300 },
    });
    const angle = calculateCraniovertebralAngle(keypoints, 'left');
    expect(angle).toBeGreaterThanOrEqual(49);
    expect(angle).toBeLessThanOrEqual(60);
  });

  it('returns low angle (<44°) for severe forward head posture', () => {
    // Ear far forward: ear at (350, 270), shoulders at (200, 300) → C7 = (200, 300)
    // dx = 150, dy = 30 → atan2(30, 150) ≈ 11.3°
    const keypoints = makeKeypoints({
      left_ear: { x: 350, y: 270 },
      left_shoulder: { x: 200, y: 300 },
      right_shoulder: { x: 200, y: 300 },
    });
    const angle = calculateCraniovertebralAngle(keypoints, 'left');
    expect(angle).toBeLessThan(44);
  });

  it('uses right ear when side is "right"', () => {
    const keypoints = makeKeypoints({
      right_ear: { x: 260, y: 200 },
      left_shoulder: { x: 200, y: 300 },
      right_shoulder: { x: 200, y: 300 },
    });
    const angle = calculateCraniovertebralAngle(keypoints, 'right');
    expect(angle).toBeGreaterThan(0);
    expect(angle).toBeLessThan(90);
  });

  it('handles ear at same Y as C7 (0° — extreme forward head)', () => {
    // Ear at same height as C7 → purely horizontal → 0°
    const keypoints = makeKeypoints({
      left_ear: { x: 350, y: 300 },
      left_shoulder: { x: 200, y: 300 },
      right_shoulder: { x: 200, y: 300 },
    });
    const angle = calculateCraniovertebralAngle(keypoints, 'left');
    expect(angle).toBeCloseTo(0, 0);
  });
});

describe('calculateShoulderAlignment', () => {
  it('returns 0° for perfectly level shoulders', () => {
    const keypoints = makeKeypoints({
      left_shoulder: { x: 100, y: 250 },
      right_shoulder: { x: 300, y: 250 },
    });
    const angle = calculateShoulderAlignment(keypoints);
    expect(angle).toBe(0);
  });

  it('returns small angle for slight tilt (normal range)', () => {
    // dy = 5 over dx = 200 → atan2(5, 200) ≈ 1.43°
    const keypoints = makeKeypoints({
      left_shoulder: { x: 100, y: 250 },
      right_shoulder: { x: 300, y: 255 },
    });
    const angle = calculateShoulderAlignment(keypoints);
    expect(angle).toBeGreaterThan(0);
    expect(angle).toBeLessThanOrEqual(2);
  });

  it('returns same magnitude regardless of which shoulder is higher', () => {
    const keypointsLeftHigh = makeKeypoints({
      left_shoulder: { x: 100, y: 240 },
      right_shoulder: { x: 300, y: 260 },
    });
    const keypointsRightHigh = makeKeypoints({
      left_shoulder: { x: 100, y: 260 },
      right_shoulder: { x: 300, y: 240 },
    });
    const angleLeft = calculateShoulderAlignment(keypointsLeftHigh);
    const angleRight = calculateShoulderAlignment(keypointsRightHigh);
    expect(angleLeft).toBeCloseTo(angleRight, 1);
  });

  it('returns moderate angle for significant tilt', () => {
    // dy = 30 over dx = 200 → atan2(30, 200) ≈ 8.5°
    const keypoints = makeKeypoints({
      left_shoulder: { x: 100, y: 250 },
      right_shoulder: { x: 300, y: 280 },
    });
    const angle = calculateShoulderAlignment(keypoints);
    expect(angle).toBeGreaterThan(5);
    expect(angle).toBeLessThanOrEqual(10);
  });
});

describe('calculateHipAlignment', () => {
  it('returns 0° for level hips', () => {
    const keypoints = makeKeypoints({
      left_hip: { x: 150, y: 450 },
      right_hip: { x: 250, y: 450 },
    });
    const angle = calculateHipAlignment(keypoints);
    expect(angle).toBe(0);
  });

  it('returns angle for tilted hips', () => {
    // dy = 10 over dx = 100 → atan2(10, 100) ≈ 5.7°
    const keypoints = makeKeypoints({
      left_hip: { x: 150, y: 450 },
      right_hip: { x: 250, y: 460 },
    });
    const angle = calculateHipAlignment(keypoints);
    expect(angle).toBeGreaterThan(5);
    expect(angle).toBeLessThan(7);
  });
});

describe('calculateAllAngles', () => {
  it('returns shoulder + hip angles for anterior view', () => {
    const keypoints = makeKeypoints({});
    const angles = calculateAllAngles(keypoints, 'anterior');
    expect(angles).toHaveLength(2);
    expect(angles[0].code).toBe('shoulder_alignment');
    expect(angles[1].code).toBe('hip_alignment');
  });

  it('returns craniovertebral angle for lateral_left view', () => {
    const keypoints = makeKeypoints({});
    const angles = calculateAllAngles(keypoints, 'lateral_left');
    expect(angles).toHaveLength(1);
    expect(angles[0].code).toBe('craniovertebral');
  });

  it('applies correct classification', () => {
    // Level shoulders → normal classification
    const keypoints = makeKeypoints({
      left_shoulder: { x: 100, y: 250 },
      right_shoulder: { x: 300, y: 250 },
      left_hip: { x: 150, y: 450 },
      right_hip: { x: 250, y: 450 },
    });
    const angles = calculateAllAngles(keypoints, 'anterior');
    expect(angles[0].classification).toBe('normal');
    expect(angles[1].classification).toBe('normal');
  });
});
