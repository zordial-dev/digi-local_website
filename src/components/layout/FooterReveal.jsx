import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';

/**
 * ==============================================================================
 * 🎭 FOOTER REVEAL COMPONENT (Mobbin.com "Curtain Uncover" Effect)
 * ==============================================================================
 * 
 * Framework-agnostic (Vite, Next.js App Router, Next.js Pages Router, React CRA)
 * 
 * HOW IT WORKS:
 * 1. The main content page sits inside a top elevated sheet (<main>) with a solid
 *    background and large rounded bottom corners (rounded-b-[2.5rem]).
 * 2. The <footer> sits fixed at the bottom behind the sheet (z-index 0 vs 10).
 * 3. A ResizeObserver dynamically measures the footer's exact height and applies
 *    it as margin-bottom on the main sheet, producing the exact scroll distance
 *    to lift the curtain.
 * 4. As the user reaches the end of the page, the sheet slides up and away,
 *    uncovering the stationary dark footer underneath.
 * 5. While covered, pointer-events: none and aria-hidden prevent ghost clicks/tabs.
 * 6. Includes smooth linear scroll-driven parallax and responsive viewport fallbacks.
 */

// ==============================================================================
// 🛠️ CUSTOMIZATION KNOBS (Tweak these 2 settings for your design)
// ==============================================================================
// KNOB 1: Deep rounded bottom corners of the lifting main sheet (like Mobbin.com)
export const SHEET_CORNER_RADIUS = 'rounded-b-[40px] sm:rounded-b-[56px] md:rounded-b-[68px]';

// KNOB 2: Solid background color of the main sheet & the fixed footer container
export const SHEET_BG_COLOR = 'bg-[#F6F0E8]';     // DigiLocal Warm Cream Sheet
export const FOOTER_BG_COLOR = 'bg-[#181312]';   // Near-black Dark Espresso (#181312)
// ==============================================================================

export default function FooterReveal({ children, footerContent }) {
  const footerRef = useRef(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFixedMode, setIsFixedMode] = useState(true);
  const [parallaxState, setParallaxState] = useState({ translateY: 0, opacity: 1 });

  // Safe layout effect for SSR / Next.js
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // 1. DYNAMIC FOOTER HEIGHT MEASUREMENT (ResizeObserver)
  useIsomorphicLayoutEffect(() => {
    if (!footerRef.current) return;

    const measureFooter = () => {
      if (footerRef.current) {
        const height = footerRef.current.getBoundingClientRect().height;
        setFooterHeight(Math.round(height));

        // RESPONSIVE FALLBACK (Req #7): If footer is taller than 90% viewport or screen is extremely short,
        // disable fixed positioning to prevent clipping / scroll traps.
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const shouldBeFixed = height < viewportHeight * 0.92 && viewportHeight >= 480;
        setIsFixedMode(shouldBeFixed);
      }
    };

    measureFooter();

    const resizeObserver = new ResizeObserver(() => {
      measureFooter();
    });

    resizeObserver.observe(footerRef.current);
    window.addEventListener('resize', measureFooter, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureFooter);
    };
  }, []);

  // 2. SCROLL PROGRESS & PARALLAX TRACKER (requestAnimationFrame driven)
  const handleScroll = useCallback(() => {
    if (!isFixedMode || footerHeight === 0) {
      setIsRevealed(true);
      setParallaxState({ translateY: 0, opacity: 1 });
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Distance remaining to the bottom of the page
    const distanceToBottom = documentHeight - (scrollY + viewportHeight);

    // Check if user is within reveal zone (one footer height from bottom)
    const inRevealZone = distanceToBottom <= footerHeight + 2;
    setIsRevealed(inRevealZone);

    // ACCESSIBILITY (Req #8): Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReducedMotion) {
      setParallaxState({ translateY: 0, opacity: 1 });
      return;
    }

    // Calculate linear 0.0 -> 1.0 reveal progress
    const rawProgress = 1 - (distanceToBottom / footerHeight);
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    // Subtle parallax: translateY (-36px -> 0px), opacity (0.65 -> 1.0)
    const translateY = Math.round((-36 * (1 - progress)) * 10) / 10;
    const opacity = Math.round((0.65 + 0.35 * progress) * 100) / 100;

    setParallaxState({ translateY, opacity });
  }, [isFixedMode, footerHeight]);

  useEffect(() => {
    let animationFrameId;

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [handleScroll]);

  return (
    <div className="relative w-full overflow-x-clip bg-[#181312]">
      
      {/* 
        ========================================================================
        1. THE LIFTING CURTAIN SHEET (<main>)
        ========================================================================
        - Solid background (#F6F0E8 Cream)
        - Sits above footer (z-index: 10)
        - Deep rounded bottom corners (${SHEET_CORNER_RADIUS})
        - overflow-hidden to cleanly clip all child content along the curve
        - Multi-layer drop shadow for elevated physical depth
        - Dynamic margin-bottom equal to the footer height
      */}
      <main
        className={`relative z-10 w-full ${SHEET_BG_COLOR} ${SHEET_CORNER_RADIUS} overflow-clip shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65),0_10px_30px_-5px_rgba(0,0,0,0.4)] transition-[margin-bottom] duration-150 ease-out`}
        style={{
          marginBottom: isFixedMode && footerHeight > 0 ? `${footerHeight}px` : 0
        }}
      >
        <div className="w-full pb-8 sm:pb-14">
          {children}
        </div>
      </main>

      {/* 
        ========================================================================
        2. THE STATIONARY FIXED FOOTER (<footer>)
        ========================================================================
        - Sits fixed at bottom of viewport behind the sheet (z-index: 0)
        - Full width, solid background (${FOOTER_BG_COLOR})
        - Does not scroll or jitter; waiting to be uncovered
        - When covered: pointer-events-none and aria-hidden prevent ghost clicks/tabbing
      */}
      <div
        ref={footerRef}
        className={`w-full ${FOOTER_BG_COLOR} z-0 transition-opacity ${
          isFixedMode
            ? 'fixed bottom-0 left-0'
            : 'relative'
        }`}
        style={{
          // Prevent interactions until user scrolls into reveal zone
          pointerEvents: !isFixedMode || isRevealed ? 'auto' : 'none',
          visibility: isFixedMode && !isRevealed && parallaxState.opacity === 0 ? 'hidden' : 'visible'
        }}
        aria-hidden={isFixedMode && !isRevealed}
      >
        {/* Parallax inner content wrapper */}
        <div
          style={{
            transform: isFixedMode ? `translate3d(0, ${parallaxState.translateY}px, 0)` : 'none',
            opacity: isFixedMode ? parallaxState.opacity : 1,
            willChange: isFixedMode ? 'transform, opacity' : 'auto'
          }}
          className="w-full"
        >
          {footerContent}
        </div>
      </div>

    </div>
  );
}
