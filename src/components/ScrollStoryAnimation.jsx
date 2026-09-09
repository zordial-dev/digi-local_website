import React, { useRef } from 'react';
import EditorialEcosystemAnimation from './EditorialEcosystemAnimation';

export default function ScrollStoryAnimation() {
  const containerRef = useRef(null);

  return (
    <section ref={containerRef} className="w-full bg-[#F6F0E8] py-8 sm:py-14 text-[#211A19] font-sans overflow-hidden relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER (EXACT TYPOGRAPHY & SPACING PRESERVED) */}
        <div className="max-w-2xl mx-auto text-center mb-3 sm:mb-6 space-y-2.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#541D26]/10 text-[#541D26] text-[10px] font-bold tracking-widest uppercase border border-[#541D26]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#541D26]" />
            <span>Hyperlocal Commerce Ecosystem</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#211A19] tracking-tight uppercase">
            How DigiLocal Works
          </h2>

          <p className="text-xs sm:text-sm text-[#211A19]/75 font-medium max-w-xl mx-auto leading-relaxed">
            Connecting residential societies with trusted neighborhood merchants for seamless hyperlocal ordering and express doorstep delivery.
          </p>
        </div>

        {/* SINGLE CONTINUOUS MOTION DESIGN NEIGHBORHOOD STORY */}
        <div className="w-full relative">
          <EditorialEcosystemAnimation />
        </div>

      </div>
    </section>
  );
}

