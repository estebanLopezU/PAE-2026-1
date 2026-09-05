import React from 'react';

/**
 * A status indicator with a pulsing animation.
 * Ideal for "Live" data or entity health.
 */
const StatusPulse = ({ status = 'success', size = 'md', className = '' }) => {
  const getColors = () => {
    switch (status) {
      case 'success': return 'bg-emerald-500 shadow-emerald-500/50';
      case 'warning': return 'bg-amber-500 shadow-amber-500/50';
      case 'error': return 'bg-rose-500 shadow-rose-500/50';
      default: return 'bg-slate-400 shadow-slate-400/50';
    }
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Outer pulse effect */}
      <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${getColors()}`} />
      
      {/* Inner solid dot */}
      <div className={`relative rounded-full shadow-lg ${sizeClasses[size]} ${getColors()}`} />
    </div>
  );
};

export default StatusPulse;
