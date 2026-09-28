import React from 'react';

export default function ZordialLogo({ className = "w-full max-w-sm" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/zordial_logo.png" 
        alt="Zordial Technologies Logo" 
        className="w-full h-auto object-contain max-h-72 drop-shadow-sm select-none"
      />
    </div>
  );
}
