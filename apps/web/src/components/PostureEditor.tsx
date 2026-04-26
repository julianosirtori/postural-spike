import { useRef } from 'react';
import type { Keypoint } from '@prumo/postural-core';
import { DraggableKeypoint } from './DraggableKeypoint.js';
import { SkeletonLines } from './SkeletonLines.js';

interface PostureEditorProps {
  imageUrl: string;
  width: number;
  height: number;
  keypoints: Keypoint[];
  onKeypointMove: (index: number, x: number, y: number) => void;
}

export function PostureEditor({ imageUrl, width, height, keypoints, onKeypointMove }: PostureEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto max-h-[75vh]"
        style={{ touchAction: 'none' }}
      >
        <image href={imageUrl} x={0} y={0} width={width} height={height} />
        <SkeletonLines keypoints={keypoints} />
        {keypoints.map((kp, index) => (
          <DraggableKeypoint
            key={kp.name}
            keypoint={kp}
            index={index}
            svgRef={svgRef}
            onMove={onKeypointMove}
          />
        ))}
      </svg>
    </div>
  );
}
