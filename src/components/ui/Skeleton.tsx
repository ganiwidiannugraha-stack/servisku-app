import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
};
