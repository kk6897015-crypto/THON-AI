import React from 'react';

export const DoubleBezelCard = ({ children, className = '', innerClassName = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`double-bezel transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-white/20' : ''} ${className}`}
    >
      <div className={`double-bezel-inner ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
};
