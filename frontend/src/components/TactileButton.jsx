import React from 'react';

export const TactileButton = ({
  children,
  variant = 'primary',
  icon,
  type = 'button',
  disabled = false,
  onClick,
  className = ''
}) => {
  const baseStyle = variant === 'primary' ? 'btn-pill-primary' : 'btn-pill-secondary';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span>{children}</span>
      {icon && (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/20 border border-white/10 text-current text-xs">
          {icon}
        </span>
      )}
    </button>
  );
};
