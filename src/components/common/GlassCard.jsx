import React from 'react';

export const GlassCard = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:border-white/10 ${className}`}
    >
      {children}
    </div>
  );
};
