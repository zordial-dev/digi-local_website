import React from 'react';

/**
 * FloatingDoodles Component
 * Renders high-visibility, transparent stroke doodles covering all blank spaces
 * across every section of the home page (Hero, Story, Bento Grid, Mission, How It Works, Trust, Zordial, CTA).
 */
export default function FloatingDoodles({ section = 'all' }) {

  const renderHeroDoodles = () => (
    <>
      {/* ─── TOP MARGIN & BADGE AREA ─── */}
      <div className="absolute top-4 left-[3%] w-8 h-8 opacity-[0.52] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '0s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>

      <div className="absolute top-3 left-[18%] w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '1.2s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <line x1="8" y1="6" x2="10" y2="6" />
          <line x1="14" y1="6" x2="16" y2="6" />
        </svg>
      </div>

      <div className="absolute top-2 left-[31%] w-5 h-5 opacity-[0.60] text-[#C8A878] animate-float-watery-3" style={{ animationDelay: '2.5s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      <div className="absolute top-2 right-[31%] w-5 h-5 opacity-[0.60] text-[#C8A878] animate-float-watery-1" style={{ animationDelay: '0.8s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 9.41L12 0Z" />
        </svg>
      </div>

      <div className="absolute top-3 right-[18%] w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '2.0s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>

      <div className="absolute top-4 right-[3%] w-8 h-8 opacity-[0.52] text-[#541D26] animate-float-watery-3" style={{ animationDelay: '1.5s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      {/* ─── HEADLINE BLANK SPACE ─── */}
      <div className="absolute top-[8%] left-[10%] w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '0.4s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>

      <div className="absolute top-[7%] left-[25%] w-6 h-6 opacity-[0.50] text-[#C8A878] animate-float-watery-2" style={{ animationDelay: '3.1s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M18 8a6 6 0 0 0-9.33-5c-2.4 1.6-3.8 4.2-3.8 7a6 6 0 0 0 6 6c2.4 0 4.6-1.1 6-3" />
          <path d="M14.5 13.5A3 3 0 0 1 12 15c-1.5 0-3-1-3.5-2.5" />
        </svg>
      </div>

      <div className="absolute top-[7%] right-[25%] w-6 h-6 opacity-[0.50] text-[#541D26] animate-float-watery-3" style={{ animationDelay: '1.9s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.91 4.91 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06z" />
        </svg>
      </div>

      <div className="absolute top-[8%] right-[10%] w-7 h-7 opacity-[0.50] text-[#8C3A48] animate-float-watery-1" style={{ animationDelay: '2.7s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>

      {/* ─── SUBTITLE PARAGRAPH BLANK SPACE ─── */}
      <div className="absolute top-[20%] left-[2.5%] w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '0.6s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
        </svg>
      </div>

      <div className="absolute top-[22%] left-[16%] w-6 h-6 opacity-[0.50] text-[#541D26] animate-float-watery-3" style={{ animationDelay: '3.4s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      </div>

      <div className="absolute top-[26%] left-[25%] w-5 h-5 opacity-[0.60] text-[#C8A878] animate-float-watery-1" style={{ animationDelay: '1.7s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      <div className="absolute top-[26%] right-[25%] w-5 h-5 opacity-[0.60] text-[#C8A878] animate-float-watery-2" style={{ animationDelay: '0.3s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      <div className="absolute top-[22%] right-[16%] w-6 h-6 opacity-[0.50] text-[#C8A878] animate-float-watery-3" style={{ animationDelay: '2.2s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M2.27 21.73a2.5 2.5 0 0 0 3.54 0l12.1-12.1a2.5 2.5 0 0 0-3.54-3.54l-12.1 12.1a2.5 2.5 0 0 0 0 3.54z" />
          <path d="M18 6l3-3" />
        </svg>
      </div>

      <div className="absolute top-[20%] right-[2.5%] w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '1.0s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M8 2h8v3H8z" />
          <path d="M7 5l-1 4v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9l-1-4H7z" />
        </svg>
      </div>

      {/* ─── ACTION BUTTONS AREA ─── */}
      <div className="absolute top-[36%] left-[3%] w-8 h-8 opacity-[0.52] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '3.0s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <line x1="15" y1="6" x2="17" y2="6" />
          <line x1="12" y1="17.5" x2="15" y2="6" />
          <path d="M5.5 17.5l6-9.5h3.5" />
        </svg>
      </div>

      <div className="absolute top-[35%] left-[20%] w-6 h-6 opacity-[0.50] text-[#541D26] animate-float-watery-3" style={{ animationDelay: '0.9s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <circle cx="12" cy="7" r="3" />
          <circle cx="9" cy="12" r="3" />
          <circle cx="15" cy="12" r="3" />
          <circle cx="12" cy="17" r="3" />
        </svg>
      </div>

      <div className="absolute top-[35%] right-[20%] w-6 h-6 opacity-[0.50] text-[#8C3A48] animate-float-watery-1" style={{ animationDelay: '2.4s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>

      <div className="absolute top-[36%] right-[3%] w-8 h-8 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '1.3s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>

      {/* ─── GAP BETWEEN BUTTONS & POLAROIDS ─── */}
      <div className="absolute top-[44%] left-[28%] w-5 h-5 opacity-[0.60] text-[#C8A878] animate-float-watery-3" style={{ animationDelay: '0.2s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      <div className="absolute top-[46%] left-[48%] -translate-x-1/2 w-6 h-6 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '2.8s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M12 2a5 5 0 0 0-5 5c0 1.2.4 2.3 1.1 3.1L6 20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l-2.1-9.9C16.6 9.3 17 8.2 17 7a5 5 0 0 0-5-5z" />
        </svg>
      </div>

      <div className="absolute top-[44%] right-[28%] w-5 h-5 opacity-[0.60] text-[#C8A878] animate-float-watery-2" style={{ animationDelay: '3.6s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      {/* ─── POLAROID CARDS MARGINS ─── */}
      <div className="absolute top-[58%] left-[2.5%] w-8 h-8 opacity-[0.50] text-[#541D26] animate-float-watery-3" style={{ animationDelay: '1.1s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M10.5 20.5l-7-7a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z" />
          <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
        </svg>
      </div>

      <div className="absolute top-[52%] left-[12%] w-6 h-6 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '2.3s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      <div className="absolute top-[52%] right-[12%] w-6 h-6 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '0.7s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>

      <div className="absolute top-[58%] right-[2.5%] w-8 h-8 opacity-[0.50] text-[#541D26] animate-float-watery-3" style={{ animationDelay: '3.8s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>
    </>
  );

  const renderStoryDoodles = () => (
    <>
      {/* ─── SCROLL STORY SECTION BLANK SPACES ─── */}
      <div className="absolute top-4 left-[2%] w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '0.5s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </div>

      <div className="absolute top-6 right-[2%] w-7 h-7 opacity-[0.50] text-[#8C3A48] animate-float-watery-1" style={{ animationDelay: '1.8s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      <div className="absolute top-[35%] left-[1.5%] w-6 h-6 opacity-[0.55] text-[#C8A878] animate-float-watery-3" style={{ animationDelay: '2.9s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>

      <div className="absolute top-[38%] right-[1.5%] w-6 h-6 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '1.1s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <div className="absolute bottom-6 left-[3%] w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '3.3s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      </div>

      <div className="absolute bottom-6 right-[3%] w-6 h-6 opacity-[0.60] text-[#C8A878] animate-float-watery-3" style={{ animationDelay: '0.4s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>
    </>
  );

  const renderBentoDoodles = () => (
    <>
      {/* ─── BENTO GRID SECTION BLANK SPACES ─── */}
      <div className="absolute -top-3 left-[15%] w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '0.7s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>

      <div className="absolute -top-3 right-[15%] w-7 h-7 opacity-[0.50] text-[#8C3A48] animate-float-watery-2" style={{ animationDelay: '2.1s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      </div>

      <div className="absolute top-[45%] -left-3 w-8 h-8 opacity-[0.50] text-[#541D26] animate-float-watery-3" style={{ animationDelay: '1.4s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      </div>

      <div className="absolute top-[45%] -right-3 w-8 h-8 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '3.0s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>

      <div className="absolute -bottom-4 left-[22%] w-6 h-6 opacity-[0.50] text-[#8C3A48] animate-float-watery-2" style={{ animationDelay: '0.9s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
        </svg>
      </div>

      <div className="absolute -bottom-4 right-[22%] w-6 h-6 opacity-[0.50] text-[#541D26] animate-float-watery-3" style={{ animationDelay: '2.6s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
        </svg>
      </div>
    </>
  );

  const renderMissionDoodles = () => (
    <>
      {/* ─── MISSION & STATS BANNER BLANK SPACES ─── */}
      <div className="absolute top-[10%] -left-4 w-8 h-8 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '0.3s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.79-1.81.79-1.81l-1.98-1.98s-1.1.08-1.81.79z" />
          <path d="M15 8s-4-4-9-4c0 0 1 3 3 5l10 10c2 2 5 3 5 3s0-5-4-9z" />
        </svg>
      </div>

      <div className="absolute top-[10%] -right-4 w-8 h-8 opacity-[0.50] text-[#8C3A48] animate-float-watery-2" style={{ animationDelay: '1.7s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>

      {/* Inside dark card accent doodles */}
      <div className="absolute top-4 left-6 w-6 h-6 opacity-30 text-[#C8A878] animate-float-watery-3" style={{ animationDelay: '2.8s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 0 0-12 0c0 2.22 1.2 3.98 2.5 5.5.76.76 1.23 1.52 1.41 2.5" />
        </svg>
      </div>

      <div className="absolute bottom-4 left-6 w-6 h-6 opacity-30 text-[#C8A878] animate-float-watery-1" style={{ animationDelay: '0.8s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
        </svg>
      </div>
    </>
  );

  const renderHowItWorksDoodles = () => (
    <>
      {/* ─── HOW IT WORKS 3 STEPS BLANK SPACES ─── */}
      <div className="absolute -top-3 left-[12%] w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '1.0s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <div className="absolute -top-3 right-[12%] w-7 h-7 opacity-[0.50] text-[#8C3A48] animate-float-watery-3" style={{ animationDelay: '2.4s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
        </svg>
      </div>

      <div className="absolute top-[48%] -left-3 w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '0.2s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>

      <div className="absolute top-[48%] -right-3 w-7 h-7 opacity-[0.50] text-[#8C3A48] animate-float-watery-2" style={{ animationDelay: '1.9s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      </div>

      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 opacity-[0.50] text-[#541D26] animate-float-watery-3" style={{ animationDelay: '3.1s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>
    </>
  );

  const renderTrustDoodles = () => (
    <>
      {/* ─── TRUST BADGES BAR BLANK SPACES ─── */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-8 w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '0.6s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 -right-8 w-7 h-7 opacity-[0.50] text-[#8C3A48] animate-float-watery-3" style={{ animationDelay: '2.2s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      </div>
    </>
  );

  const renderZordialDoodles = () => (
    <>
      {/* ─── ZORDIAL PARTNER SECTION BLANK SPACES ─── */}
      <div className="absolute top-6 -left-4 w-8 h-8 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '1.3s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
        </svg>
      </div>

      <div className="absolute top-6 -right-4 w-7 h-7 opacity-[0.50] text-[#8C3A48] animate-float-watery-1" style={{ animationDelay: '0.4s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>

      <div className="absolute bottom-6 -left-4 w-7 h-7 opacity-[0.60] text-[#C8A878] animate-float-watery-3" style={{ animationDelay: '2.7s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      <div className="absolute bottom-6 -right-4 w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '1.6s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      </div>
    </>
  );

  const renderCtaDoodles = () => (
    <>
      {/* ─── FINAL CTA BANNER BLANK SPACES ─── */}
      <div className="absolute top-4 left-6 w-8 h-8 opacity-[0.50] text-[#541D26] animate-float-watery-1" style={{ animationDelay: '0.5s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>

      <div className="absolute top-4 right-6 w-8 h-8 opacity-[0.50] text-[#8C3A48] animate-float-watery-3" style={{ animationDelay: '1.9s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      <div className="absolute bottom-4 left-8 w-7 h-7 opacity-[0.50] text-[#541D26] animate-float-watery-2" style={{ animationDelay: '3.0s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>

      <div className="absolute bottom-4 right-8 w-6 h-6 opacity-[0.60] text-[#C8A878] animate-float-watery-1" style={{ animationDelay: '0.9s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>
    </>
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {(section === 'hero' || section === 'all') && renderHeroDoodles()}
      {(section === 'story' || section === 'all') && renderStoryDoodles()}
      {(section === 'bento' || section === 'all') && renderBentoDoodles()}
      {(section === 'mission' || section === 'all') && renderMissionDoodles()}
      {(section === 'howItWorks' || section === 'all') && renderHowItWorksDoodles()}
      {(section === 'trust' || section === 'all') && renderTrustDoodles()}
      {(section === 'zordial' || section === 'all') && renderZordialDoodles()}
      {(section === 'cta' || section === 'all') && renderCtaDoodles()}
    </div>
  );
}

