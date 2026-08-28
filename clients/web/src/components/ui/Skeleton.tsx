import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = '1.25rem',
  borderRadius = 'var(--radius-sm)',
  style = {},
}: SkeletonProps) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
