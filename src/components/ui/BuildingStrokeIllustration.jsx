import React from 'react';
import { motion } from 'motion/react';

export default function BuildingStrokeIllustration({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ 
        opacity: 0.85, 
        x: 0,
        y: [3, -3, 3]
      }}
      transition={{
        opacity: { duration: 0.8, ease: 'easeOut' },
        x: { duration: 0.8, ease: 'easeOut' },
        y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
      }}
      className={`pointer-events-none select-none ${className}`}
    >
      <svg
        viewBox="0 0 130 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto text-[#211A19] opacity-90"
      >
        <defs>
          {/* Crisp Shadow Filter for Line Art */}
          <filter id="slimBuildingGlow" x="-15%" y="-10%" width="130%" height="120%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#211A19" floodOpacity="0.18" />
          </filter>
        </defs>

        <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" filter="url(#slimBuildingGlow)">
          {/* Ground Line Art */}
          <path d="M 10 310 L 120 310" strokeWidth="2.8" opacity="0.95" />
          <path d="M 20 316 C 40 319, 70 319, 90 316" opacity="0.6" strokeDasharray="3 3" />

          {/* SLENDER THIN APARTMENT TOWER MAIN FRAME */}
          <rect x="30" y="25" width="70" height="285" rx="4" fill="#211A19" fillOpacity="0.05" strokeWidth="2.4" opacity="0.95" />

          {/* SLEEK FLAT ROOFTOP CROWN */}
          <path d="M 22 25 L 108 25" strokeWidth="3" />
          <path d="M 38 15 L 92 15" strokeWidth="2.2" fill="#211A19" fillOpacity="0.1" />
          <line x1="38" y1="25" x2="38" y2="15" strokeWidth="2" />
          <line x1="92" y1="25" x2="92" y2="15" strokeWidth="2" />
          <path d="M 50 8 L 80 8" strokeWidth="2" opacity="0.8" />

          {/* VERTICAL FACADE ACCENT STRIPES (Thin Modern Skyscraper Look) */}
          <line x1="37" y1="25" x2="37" y2="310" strokeWidth="1.2" opacity="0.4" strokeDasharray="6 4" />
          <line x1="93" y1="25" x2="93" y2="310" strokeWidth="1.2" opacity="0.4" strokeDasharray="6 4" />

          {/* FLOOR 7 (TOP PENTHOUSE) */}
          <rect x="44" y="36" width="42" height="24" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />
          <line x1="65" y1="36" x2="65" y2="60" opacity="0.6" strokeWidth="1.4" />

          {/* FLOOR 6 */}
          <line x1="30" y1="72" x2="100" y2="72" strokeWidth="1.6" opacity="0.7" />
          <rect x="44" y="78" width="18" height="20" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />
          <rect x="68" y="78" width="18" height="20" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />

          {/* FLOOR 5 */}
          <line x1="30" y1="108" x2="100" y2="108" strokeWidth="1.6" opacity="0.7" />
          <rect x="44" y="114" width="18" height="20" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />
          <rect x="68" y="114" width="18" height="20" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />
          {/* Balcony Railing Line */}
          <line x1="38" y1="134" x2="92" y2="134" strokeWidth="2" opacity="0.85" />

          {/* FLOOR 4 */}
          <line x1="30" y1="144" x2="100" y2="144" strokeWidth="1.6" opacity="0.7" />
          <rect x="44" y="150" width="18" height="20" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />
          <rect x="68" y="150" width="18" height="20" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />

          {/* FLOOR 3 */}
          <line x1="30" y1="180" x2="100" y2="180" strokeWidth="1.6" opacity="0.7" />
          <rect x="44" y="186" width="18" height="20" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />
          <rect x="68" y="186" width="18" height="20" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />
          {/* Balcony Railing Line */}
          <line x1="38" y1="206" x2="92" y2="206" strokeWidth="2" opacity="0.85" />

          {/* FLOOR 2 */}
          <line x1="30" y1="216" x2="100" y2="216" strokeWidth="1.6" opacity="0.7" />
          <rect x="44" y="222" width="18" height="20" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />
          <rect x="68" y="222" width="18" height="20" rx="2" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />

          {/* GROUND FLOOR MODERN ENTRANCE LOBBY */}
          <line x1="30" y1="270" x2="100" y2="270" strokeWidth="2" />
          <rect x="48" y="274" width="34" height="36" rx="3" strokeWidth="2.2" fill="#101D37" fillOpacity="0.12" />
          <line x1="65" y1="274" x2="65" y2="310" strokeWidth="1.8" opacity="0.8" />
          <circle cx="60" cy="292" r="2" fill="currentColor" opacity="0.9" />
          <circle cx="70" cy="292" r="2" fill="currentColor" opacity="0.9" />

          {/* Lobby Entrance Canopy */}
          <path d="M 42 274 L 88 274" strokeWidth="2.6" />
          <path d="M 42 274 L 45 280 L 85 280 L 88 274" fill="#101D37" fillOpacity="0.1" strokeWidth="1.6" />

          {/* Small Potted Plant Beside Entrance */}
          <path d="M 104 310 L 106 297 L 114 297 L 116 310 Z" strokeWidth="1.6" fill="#101D37" fillOpacity="0.08" />
          <path d="M 110 297 C 105 287, 102 289, 104 280 C 109 281, 110 289, 110 297" opacity="0.8" strokeWidth="1.4" />
          <path d="M 110 297 C 115 287, 118 289, 116 280 C 111 281, 110 289, 110 297" opacity="0.8" strokeWidth="1.4" />

          {/* Decorative Sparkle Strokes */}
          <path d="M 14 20 L 14 28 M 10 24 L 18 24" opacity="0.5" strokeWidth="1.4" />
          <path d="M 112 55 L 112 63 M 108 59 L 116 59" opacity="0.5" strokeWidth="1.4" />
        </g>
      </svg>
    </motion.div>
  );
}
