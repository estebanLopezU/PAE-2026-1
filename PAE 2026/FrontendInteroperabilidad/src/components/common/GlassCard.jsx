import React from 'react';

/**
 * A premium glassmorphic card component.
 * Features a semi-transparent background with blur, subtle borders, and a hover-active glow.
 */
const GlassCard = ({ children, className = '', hoverEffect = true }) => {
  return (
    <div className={`
      relative overflow-hidden
      bg-slate-900/40 backdrop-blur-md
      border border-slate-700/50 rounded-xl
      shadow-2xl transition-all duration-300 ease-out
      ${hoverEffect ? 'hover:border-blue-500/50 hover:shadow-blue-500/10' : ''}
      ${className}
    `}>
      {/* Subtle inner highlight/gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
