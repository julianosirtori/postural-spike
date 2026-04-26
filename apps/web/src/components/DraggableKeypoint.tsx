import { useState, useCallback, type RefObject } from 'react';
import type { Keypoint } from '@prumo/postural-core';

interface DraggableKeypointProps {
  keypoint: Keypoint;
  index: number;
  svgRef: RefObject<SVGSVGElement | null>;
  onMove: (index: number, x: number, y: number) => void;
}

function screenToSVG(
  svgEl: SVGSVGElement,
  screenX: number,
  screenY: number
): { x: number; y: number } {
  const point = svgEl.createSVGPoint();
  point.x = screenX;
  point.y = screenY;
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const svgPoint = point.matrixTransform(ctm.inverse());
  return { x: svgPoint.x, y: svgPoint.y };
}

function getColor(keypoint: Keypoint): string {
  if (keypoint.manuallyAdjusted) return '#10b981'; // green
  if (keypoint.visibility > 0.7) return '#3b82f6'; // blue
  return '#f59e0b'; // yellow/amber
}

export function DraggableKeypoint({ keypoint, index, svgRef, onMove }: DraggableKeypointProps) {
  const [isDragging, setIsDragging] = useState(false);
  const color = getColor(keypoint);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);
      setIsDragging(true);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      if (!isDragging) return;
      if (!svgRef.current) return;
      const { x, y } = screenToSVG(svgRef.current, e.clientX, e.clientY);
      onMove(index, x, y);
    },
    [isDragging, svgRef, index, onMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
    },
    []
  );

  return (
    <g
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      {/* Larger invisible circle for easier touch targeting */}
      <circle
        cx={keypoint.x}
        cy={keypoint.y}
        r={15}
        fill="transparent"
      />
      {/* Pulsing halo for low-confidence points */}
      {keypoint.visibility <= 0.7 && !keypoint.manuallyAdjusted && (
        <circle
          cx={keypoint.x}
          cy={keypoint.y}
          r={10}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.5}
        >
          <animate
            attributeName="r"
            values="8;14;8"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0.2;0.6"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      {/* Visible keypoint circle */}
      <circle
        cx={keypoint.x}
        cy={keypoint.y}
        r={6}
        fill={color}
        stroke="white"
        strokeWidth={1.5}
      />
    </g>
  );
}
