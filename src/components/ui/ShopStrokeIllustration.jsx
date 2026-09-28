import React from 'react';
import { motion } from 'motion/react';

export default function ShopStrokeIllustration({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 0.85, 
        x: 0,
        y: [-4, 4, -4]
      }}
      transition={{
        opacity: { duration: 0.8, ease: 'easeOut' },
        x: { duration: 0.8, ease: 'easeOut' },
        y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
      }}
      className={`pointer-events-none select-none ${className}`}
    >
      <svg
        viewBox="0 0 280 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto text-[#211A19] opacity-90"
      >
        <defs>
          {/* Crisp Shadow Filter for Line Art */}
          <filter id="navyLineGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#211A19" floodOpacity="0.18" />
          </filter>
        </defs>

        <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" filter="url(#navyLineGlow)">
          {/* Ground & Cobblestone Line Art */}
          <path d="M 10 240 L 270 240" strokeWidth="2.8" opacity="0.95" />
          <path d="M 25 246 C 40 249, 60 249, 75 246" opacity="0.6" strokeDasharray="3 3" />
          <path d="M 120 246 C 140 249, 170 249, 190 246" opacity="0.6" strokeDasharray="3 3" />

          {/* Main Building Frame */}
          <rect x="50" y="80" width="180" height="160" rx="4" fill="#211A19" fillOpacity="0.04" opacity="0.95" />

          {/* Roof Structure */}
          <path d="M 35 80 L 140 20 L 245 80 Z" strokeWidth="2.6" fill="#211A19" fillOpacity="0.07" />
          {/* Roof Tiles Line Texture */}
          <path d="M 60 65 L 220 65" opacity="0.6" strokeDasharray="5 5" />
          <path d="M 85 50 L 195 50" opacity="0.6" strokeDasharray="5 5" />
          <path d="M 110 35 L 170 35" opacity="0.6" strokeDasharray="5 5" />

          {/* Roof Peak Chimney / Crest */}
          <path d="M 140 20 L 140 10 L 148 10 L 148 24" />
          <path d="M 136 6 L 152 6" strokeWidth="1.8" opacity="0.85" />

          {/* Signboard Banner */}
          <rect x="75" y="90" width="130" height="24" rx="3" strokeWidth="2" fill="#101D37" fillOpacity="0.08" />
          {/* Signboard Text Art Lines */}
          <path d="M 95 102 L 185 102" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.9" />
          <circle cx="83" cy="102" r="3" fill="currentColor" opacity="0.8" />
          <circle cx="197" cy="102" r="3" fill="currentColor" opacity="0.8" />

          {/* Striped Canopy Awning */}
          <path d="M 45 118 L 235 118" strokeWidth="2.8" />
          <path d="M 45 118 L 50 140 C 60 145, 70 145, 80 140 C 90 145, 100 145, 110 140 C 120 145, 130 145, 140 140 C 150 145, 160 145, 170 140 C 180 145, 190 145, 200 140 C 210 145, 220 145, 230 140 L 235 118" strokeWidth="2.2" fill="#101D37" fillOpacity="0.06" />
          {/* Awning Stripes */}
          <line x1="80" y1="118" x2="80" y2="140" opacity="0.7" strokeDasharray="3 3" />
          <line x1="110" y1="118" x2="110" y2="140" opacity="0.7" strokeDasharray="3 3" />
          <line x1="140" y1="118" x2="140" y2="140" opacity="0.7" strokeDasharray="3 3" />
          <line x1="170" y1="118" x2="170" y2="140" opacity="0.7" strokeDasharray="3 3" />
          <line x1="200" y1="118" x2="200" y2="140" opacity="0.7" strokeDasharray="3 3" />

          {/* Storefront Display Window Left */}
          <rect x="62" y="152" width="72" height="74" rx="4" strokeWidth="2.2" fill="#101D37" fillOpacity="0.05" />
          {/* Window Panes */}
          <line x1="62" y1="185" x2="134" y2="185" opacity="0.75" />
          <line x1="98" y1="152" x2="98" y2="226" opacity="0.75" />
          {/* Display Window Products Texture Line Art */}
          <circle cx="80" cy="205" r="7" opacity="0.8" strokeWidth="1.8" fill="#101D37" fillOpacity="0.1" />
          <circle cx="116" cy="205" r="7" opacity="0.8" strokeWidth="1.8" fill="#101D37" fillOpacity="0.1" />
          <path d="M 75 172 C 85 166, 110 166, 120 172" opacity="0.7" strokeWidth="1.8" />

          {/* Main Door Right */}
          <rect x="150" y="152" width="65" height="88" rx="3" strokeWidth="2.2" fill="#101D37" fillOpacity="0.06" />
          {/* Door Arch Window */}
          <path d="M 160 185 C 160 168, 205 168, 205 185 Z" opacity="0.8" strokeWidth="1.8" />
          {/* Door Handle */}
          <circle cx="160" cy="200" r="3" fill="currentColor" opacity="0.9" />

          {/* Hanging OPEN Sign */}
          <rect x="170" y="195" width="26" height="14" rx="2" strokeWidth="1.6" opacity="0.9" fill="#101D37" fillOpacity="0.12" />
          <path d="M 174 202 L 192 202" strokeWidth="2" strokeDasharray="3 2" opacity="0.85" />
          <line x1="183" y1="185" x2="183" y2="195" opacity="0.7" />

          {/* Vintage Lamp Post on Left Side of Shop */}
          <path d="M 28 240 L 28 120 L 38 108" strokeWidth="2.2" />
          <path d="M 32 108 L 44 108 L 40 120 L 36 120 Z" opacity="0.9" strokeWidth="1.8" />
          <circle cx="38" cy="114" r="2.5" fill="currentColor" opacity="0.8" />

          {/* Potted Plant on Right Side of Shop */}
          <path d="M 238 240 L 243 222 L 257 222 L 262 240 Z" strokeWidth="1.8" fill="#101D37" fillOpacity="0.08" />
          {/* Plant Leaves */}
          <path d="M 250 222 C 242 210, 235 212, 238 200 C 248 202, 250 212, 250 222" opacity="0.8" strokeWidth="1.6" />
          <path d="M 250 222 C 258 210, 265 212, 262 200 C 252 202, 250 212, 250 222" opacity="0.8" strokeWidth="1.6" />
          <path d="M 250 222 L 250 195" strokeWidth="1.8" opacity="0.8" />

          {/* Decorative Sparkle Strokes */}
          <path d="M 30 70 L 30 80 M 25 75 L 35 75" opacity="0.6" strokeWidth="1.6" />
          <path d="M 250 45 L 250 53 M 246 49 L 254 49" opacity="0.6" strokeWidth="1.6" />
        </g>
      </svg>
    </motion.div>
  );
}
