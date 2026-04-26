import type { Keypoint, KeypointName } from '@prumo/postural-core';

interface SkeletonLinesProps {
  keypoints: Keypoint[];
}

type Connection = [KeypointName, KeypointName];

const SKELETON_CONNECTIONS: Connection[] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['right_hip', 'right_knee'],
  ['left_knee', 'left_ankle'],
  ['right_knee', 'right_ankle'],
  ['left_shoulder', 'left_elbow'],
  ['right_shoulder', 'right_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_elbow', 'right_wrist'],
];

function findKp(keypoints: Keypoint[], name: KeypointName): Keypoint | undefined {
  return keypoints.find((k) => k.name === name);
}

export function SkeletonLines({ keypoints }: SkeletonLinesProps) {
  // Reference lines for angles
  const leftShoulder = findKp(keypoints, 'left_shoulder');
  const rightShoulder = findKp(keypoints, 'right_shoulder');
  const leftHip = findKp(keypoints, 'left_hip');
  const rightHip = findKp(keypoints, 'right_hip');
  const leftEar = findKp(keypoints, 'left_ear');
  const rightEar = findKp(keypoints, 'right_ear');

  return (
    <g>
      {/* Skeleton connections */}
      {SKELETON_CONNECTIONS.map(([from, to]) => {
        const a = findKp(keypoints, from);
        const b = findKp(keypoints, to);
        if (!a || !b) return null;
        return (
          <line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#94a3b8"
            strokeWidth={2}
            opacity={0.6}
          />
        );
      })}

      {/* Shoulder horizontal reference line */}
      {leftShoulder && rightShoulder && (
        <line
          x1={leftShoulder.x - 30}
          y1={leftShoulder.y}
          x2={rightShoulder.x + 30}
          y2={leftShoulder.y}
          stroke="#60a5fa"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.7}
        />
      )}

      {/* Hip horizontal reference line */}
      {leftHip && rightHip && (
        <line
          x1={leftHip.x - 30}
          y1={leftHip.y}
          x2={rightHip.x + 30}
          y2={leftHip.y}
          stroke="#60a5fa"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.7}
        />
      )}

      {/* Craniovertebral reference: horizontal from C7 + line to ear */}
      {leftShoulder && rightShoulder && (leftEar || rightEar) && (() => {
        const c7x = (leftShoulder.x + rightShoulder.x) / 2;
        const c7y = (leftShoulder.y + rightShoulder.y) / 2;
        const ear = leftEar || rightEar;
        if (!ear) return null;
        return (
          <g>
            {/* Horizontal reference from C7 */}
            <line
              x1={c7x - 60}
              y1={c7y}
              x2={c7x + 60}
              y2={c7y}
              stroke="#a78bfa"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.7}
            />
            {/* Line from C7 to ear (craniovertebral) */}
            <line
              x1={c7x}
              y1={c7y}
              x2={ear.x}
              y2={ear.y}
              stroke="#a78bfa"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              opacity={0.8}
            />
          </g>
        );
      })()}
    </g>
  );
}
