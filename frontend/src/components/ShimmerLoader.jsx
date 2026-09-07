import React from 'react';

export const ShimmerLoader = ({ rows = 3, height = 'h-16', className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={`w-full ${height} rounded-2xl shimmer-box border border-white/5`}
        />
      ))}
    </div>
  );
};
