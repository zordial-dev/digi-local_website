import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function EditorialEcosystemAnimation() {
  const [progress, setProgress] = useState(0); // 0 to 1 continuous timeline

  useEffect(() => {
    let startTime = performance.now();
    const cycleDuration = 14000; // 14-second calm, cinematic continuous loop

    let animationFrameId;

    const animateLoop = (now) => {
      const elapsed = (now - startTime) % cycleDuration;
      const norm = elapsed / cycleDuration;
      setProgress(norm);
      animationFrameId = requestAnimationFrame(animateLoop);
    };

    animationFrameId = requestAnimationFrame(animateLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Trajectory coordinates (Normalized SVG viewBox 0..1000, 0..420)
  // Store counter: (150, 310) -> Store door: (250, 315) -> Center arc: (500, 205) -> Society 3rd floor balcony: (785, 175)
  const getPackageCoords = () => {
    if (progress < 0.12) {
      return { x: 150, y: 310, opacity: 0, scale: 0.7 };
    } else if (progress < 0.22) {
      const t = (progress - 0.12) / 0.10;
      return {
        x: 150 + t * 100,
        y: 310 + t * 5,
        opacity: t,
        scale: 0.7 + t * 0.3
      };
    } else if (progress < 0.84) {
      const t = (progress - 0.22) / 0.62;
      // Cubic Bezier: P0=(250, 315), P1=(380, 180), P2=(620, 240), P3=(785, 175)
      const p0 = { x: 250, y: 315 };
      const p1 = { x: 380, y: 180 };
      const p2 = { x: 620, y: 240 };
      const p3 = { x: 785, y: 175 };

      const cx = 3 * (p1.x - p0.x);
      const bx = 3 * (p2.x - p1.x) - cx;
      const ax = p3.x - p0.x - cx - bx;

      const cy = 3 * (p1.y - p0.y);
      const by = 3 * (p2.y - p1.y) - cy;
      const ay = p3.y - p0.y - cy - by;

      const x = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
      const y = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;

      return { x, y, opacity: 1, scale: 1 };
    } else if (progress < 0.94) {
      return { x: 785, y: 175, opacity: 1, scale: 1.05 };
    } else {
      const fade = Math.max(0, 1 - (progress - 0.94) / 0.06);
      return { x: 785, y: 175, opacity: fade, scale: 1 };
    }
  };

  const pkg = getPackageCoords();

  // Dynamic light & state flags
  const isShopActive = progress >= 0.08 && progress < 0.35;
  const isMidpointActive = progress >= 0.45 && progress < 0.65;
  const isSocietyActive = progress >= 0.68 && progress < 0.96;
  const isDelivered = progress >= 0.84 && progress < 0.95;

  return (
    <div className="w-full relative select-none overflow-hidden">
      <div className="w-full max-w-6xl mx-auto relative">
        <svg
          viewBox="0 0 1000 420"
          className="w-full h-auto overflow-visible"
          style={{ maxHeight: '460px' }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="wallPlasterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EDE5D8" />
              <stop offset="100%" stopColor="#DFD4C4" />
            </linearGradient>

            <linearGradient id="societyFacadeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EAE1D3" />
              <stop offset="100%" stopColor="#D8CDBC" />
            </linearGradient>

            <linearGradient id="teakWoodGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8C674E" />
              <stop offset="50%" stopColor="#A37B5E" />
              <stop offset="100%" stopColor="#7E5C44" />
            </linearGradient>

            <linearGradient id="burgundyCanopyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#63222D" />
              <stop offset="100%" stopColor="#48161E" />
            </linearGradient>

            <linearGradient id="warmGlassInterior" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF4E0" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#F9E6C8" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="eveningGlassGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9D6DF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#AABBC8" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="motionTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#541D26" stopOpacity="0.15" />
              <stop offset="35%" stopColor="#541D26" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#7D2C38" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#541D26" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="lightConeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE0AA" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F6F0E8" stopOpacity="0" />
            </linearGradient>

            <radialGradient id="skyAtmosphereGrad" cx="50%" cy="60%" r="55%">
              <stop offset="0%" stopColor="#FFF8EE" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#F8EFE4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F6F0E8" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="shopWarmLuminescence" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE0AA" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#FFD388" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F6F0E8" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="apartmentGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE5B4" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#FFD488" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F6F0E8" stopOpacity="0" />
            </radialGradient>

            {/* Shadows */}
            <filter id="archShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#211A19" floodOpacity="0.08" />
            </filter>

            <filter id="parcelGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#541D26" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* ========================================================================= */}
          {/* 1. SKY & ATMOSPHERIC WARMTH (Fills the entire background smoothly)        */}
          {/* ========================================================================= */}
          <rect x="0" y="0" width="1000" height="420" fill="url(#skyAtmosphereGrad)" />

          {/* ========================================================================= */}
          {/* 2. FAINT URBAN SKYLINE & NEIGHBORHOOD DEPTH (Connects left and right)      */}
          {/* ========================================================================= */}
          <g id="neighborhoodBackdrop" opacity="0.45">
            {/* Distant residential townhouses & low-rise villa blocks */}
            <rect x="260" y="220" width="85" height="150" fill="#E8DED2" />
            <polygon points="260,220 302,195 345,220" fill="#DECFC1" />
            
            <rect x="330" y="240" width="105" height="130" fill="#E2D6C8" />
            <line x1="345" y1="260" x2="420" y2="260" stroke="#211A19" strokeWidth="0.5" strokeOpacity="0.2" />
            <line x1="345" y1="285" x2="420" y2="285" stroke="#211A19" strokeWidth="0.5" strokeOpacity="0.2" />
            
            <rect x="420" y="210" width="120" height="160" fill="#E8DED2" />
            <polygon points="420,210 480,185 540,210" fill="#DECFC1" />
            {/* Distant window grid */}
            <rect x="440" y="230" width="16" height="22" fill="#FAF6EE" opacity="0.6" />
            <rect x="470" y="230" width="16" height="22" fill="#FAF6EE" opacity="0.6" />
            <rect x="500" y="230" width="16" height="22" fill="#FAF6EE" opacity="0.6" />
            <rect x="440" y="265" width="16" height="22" fill="#FAF6EE" opacity="0.6" />
            <rect x="470" y="265" width="16" height="22" fill="#FAF6EE" opacity="0.6" />
            <rect x="500" y="265" width="16" height="22" fill="#FAF6EE" opacity="0.6" />

            <rect x="530" y="235" width="90" height="135" fill="#E2D6C8" />
            <rect x="610" y="200" width="85" height="170" fill="#E8DED2" />
            
            {/* Soft mature trees & palms in neighborhood midground */}
            <ellipse cx="280" cy="210" rx="30" ry="45" fill="#849982" opacity="0.5" />
            <ellipse cx="370" cy="225" rx="26" ry="38" fill="#71866E" opacity="0.45" />
            <ellipse cx="560" cy="215" rx="32" ry="48" fill="#849982" opacity="0.5" />
            <ellipse cx="640" cy="195" rx="28" ry="42" fill="#71866E" opacity="0.45" />
          </g>

          {/* ========================================================================= */}
          {/* 3. CENTRAL HYPERLOCAL RADAR AURA & DISTANCE RINGS                         */}
          {/* ========================================================================= */}
          <g id="hyperlocalRadiusRings" opacity="0.75">
            <ellipse cx="500" cy="270" rx="260" ry="95" fill="none" stroke="#541D26" strokeWidth="0.6" strokeOpacity="0.12" strokeDasharray="6 6" />
            <ellipse cx="500" cy="270" rx="180" ry="65" fill="none" stroke="#C8A878" strokeWidth="0.8" strokeOpacity="0.2" />
            <ellipse cx="500" cy="270" rx="100" ry="38" fill="none" stroke="#541D26" strokeWidth="0.5" strokeOpacity="0.15" />
            
            {/* Soft Central Pulse Node */}
            <circle cx="500" cy="270" r="3" fill="#541D26" opacity="0.25" />
          </g>

          {/* ========================================================================= */}
          {/* 4. UNIFIED GROUND PLANE & CONTINUOUS STREET PAVEMENT                      */}
          {/* ========================================================================= */}
          <g id="neighborhoodGround">
            {/* Ground shadow plane */}
            <ellipse cx="500" cy="374" rx="480" ry="14" fill="#211A19" opacity="0.06" />
            
            {/* Continuous sidewalk curb lines */}
            <line x1="20" y1="370" x2="980" y2="370" stroke="#211A19" strokeWidth="1.4" strokeOpacity="0.3" strokeLinecap="round" />
            <line x1="30" y1="373" x2="970" y2="373" stroke="#D8CDBC" strokeWidth="2.5" strokeOpacity="0.8" />
            
            {/* Pavement stone joints across the whole street */}
            {[60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780, 840, 900, 960].map((x) => (
              <line key={x} x1={x} y1="370" x2={x - 14} y2="390" stroke="#211A19" strokeWidth="0.6" strokeOpacity="0.15" />
            ))}
          </g>

          {/* ========================================================================= */}
          {/* 5. ARCHITECTURAL STREET LIGHTING & LANDSCAPED BOULEVARD MEDIAN            */}
          {/* ========================================================================= */}
          {/* Street Lamp 1 (Near Store) */}
          <g id="streetLamp1">
            <line x1="290" y1="370" x2="290" y2="235" stroke="#211A19" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="288" y="358" width="4" height="12" fill="#211A19" />
            <path d="M 290,235 C 290,225 302,220 308,220 L 314,220" fill="none" stroke="#211A19" strokeWidth="1.6" />
            <polygon points="308,220 318,220 316,230 310,230" fill="#211A19" />
            <circle cx="313" cy="232" r="3.5" fill="#FFE0AA" />
            <polygon points="313,232 250,370 376,370" fill="url(#lightConeGrad)" opacity="0.65" />
          </g>

          {/* Central Landscaped Tree & Planters (Fills center-left space naturally) */}
          <g id="centralLandscaping">
            {/* Tree trunk */}
            <line x1="440" y1="370" x2="440" y2="270" stroke="#685444" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="440" cy="245" rx="32" ry="42" fill="#6A8068" />
            <ellipse cx="430" cy="235" rx="24" ry="32" fill="#7E967B" />
            <ellipse cx="452" cy="238" rx="22" ry="30" fill="#586E56" />

            {/* Tree 2 (Near Society Gate) */}
            <line x1="645" y1="370" x2="645" y2="260" stroke="#685444" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="645" cy="235" rx="30" ry="40" fill="#6A8068" />
            <ellipse cx="655" cy="225" rx="22" ry="30" fill="#7E967B" />
            <ellipse cx="635" cy="230" rx="20" ry="28" fill="#586E56" />
          </g>

          {/* Street Lamp 2 (Near Society Gate) */}
          <g id="streetLamp2">
            <line x1="665" y1="370" x2="665" y2="245" stroke="#211A19" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="663" y="358" width="4" height="12" fill="#211A19" />
            <path d="M 665,245 C 665,235 653,230 647,230 L 641,230" fill="none" stroke="#211A19" strokeWidth="1.6" />
            <polygon points="647,230 637,230 639,240 645,240" fill="#211A19" />
            <circle cx="642" cy="242" r="3.5" fill="#FFE0AA" />
            <polygon points="642,242 580,370 704,370" fill="url(#lightConeGrad)" opacity="0.65" />
          </g>

          {/* ========================================================================= */}
          {/* 6. LEFT SIDE: CONTEMPORARY INDIAN NEIGHBORHOOD RETAIL STORE               */}
          {/* ========================================================================= */}
          <g id="localShop" filter="url(#archShadow)">
            {/* Building Facade */}
            <rect x="45" y="150" width="215" height="220" rx="2" fill="url(#wallPlasterGrad)" />
            
            {/* Parapet & Cornice */}
            <rect x="40" y="140" width="225" height="13" rx="1" fill="#D6C9B8" />
            <rect x="42" y="137" width="221" height="4" fill="#211A19" opacity="0.2" />
            
            {/* Large Glass Storefront */}
            <rect x="62" y="185" width="180" height="185" rx="2" fill="url(#warmGlassInterior)" stroke="#211A19" strokeWidth="1.4" strokeOpacity="0.75" />
            
            {/* Warm Interior Luminescence Dynamic Glow */}
            <ellipse 
              cx="150" 
              cy="275" 
              rx="75" 
              ry="55" 
              fill="url(#shopWarmLuminescence)" 
              opacity={isShopActive ? 0.95 : 0.45} 
              className="transition-opacity duration-1000"
            />

            {/* Interior Shelving */}
            <line x1="72" y1="225" x2="135" y2="225" stroke="#A88B70" strokeWidth="1.8" strokeOpacity="0.6" />
            <line x1="72" y1="260" x2="135" y2="260" stroke="#A88B70" strokeWidth="1.8" strokeOpacity="0.6" />
            <line x1="72" y1="295" x2="135" y2="295" stroke="#A88B70" strokeWidth="1.8" strokeOpacity="0.6" />
            
            {/* Products on Shelves */}
            <rect x="76" y="210" width="9" height="15" rx="1" fill="#7D2C38" opacity="0.8" />
            <rect x="88" y="208" width="11" height="17" rx="1" fill="#C8A878" opacity="0.85" />
            <rect x="102" y="212" width="10" height="13" rx="1" fill="#607262" opacity="0.8" />
            <rect x="115" y="209" width="12" height="16" rx="1" fill="#8C674E" opacity="0.85" />

            <rect x="75" y="246" width="12" height="14" rx="1" fill="#C8A878" opacity="0.85" />
            <rect x="90" y="243" width="9" height="17" rx="1" fill="#541D26" opacity="0.8" />
            <rect x="102" y="247" width="12" height="13" rx="1" fill="#A37B5E" opacity="0.85" />
            <rect x="117" y="244" width="9" height="16" rx="1" fill="#607262" opacity="0.8" />

            {/* Dispatch Counter */}
            <rect x="145" y="305" width="48" height="65" rx="1" fill="#CBB69F" stroke="#211A19" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="152" y="295" width="15" height="10" rx="1" fill="#541D26" opacity="0.85" />
            <rect x="170" y="292" width="18" height="13" rx="1" fill="#C8A878" opacity="0.85" />

            {/* Storefront Mullions */}
            <line x1="140" y1="185" x2="140" y2="370" stroke="#211A19" strokeWidth="1.4" strokeOpacity="0.7" />
            <line x1="62" y1="320" x2="140" y2="320" stroke="#211A19" strokeWidth="1" strokeOpacity="0.5" />

            {/* Entrance Doorway */}
            <rect x="200" y="220" width="42" height="150" fill="#FAF3E8" stroke="#211A19" strokeWidth="1.2" strokeOpacity="0.8" />
            <line x1="200" y1="290" x2="242" y2="290" stroke="#211A19" strokeWidth="1" strokeOpacity="0.5" />
            <rect x="205" y="292" width="2.5" height="18" rx="0.5" fill="#C8A878" />

            {/* Deep Burgundy Canopy */}
            <polygon points="50,175 250,175 258,202 42,202" fill="url(#burgundyCanopyGrad)" />
            <path d="M 42,202 Q 50,208 58,202 Q 66,208 74,202 Q 82,208 90,202 Q 98,208 106,202 Q 114,208 122,202 Q 130,208 138,202 Q 146,208 154,202 Q 162,208 170,202 Q 178,208 186,202 Q 194,208 202,202 Q 210,208 218,202 Q 226,208 234,202 Q 242,208 250,202 L 258,202 L 250,175 L 50,175 Z" fill="#42131A" />
            
            {/* Awning Tension Brackets */}
            <line x1="52" y1="177" x2="44" y2="201" stroke="#C8A878" strokeWidth="1.2" strokeOpacity="0.8" />
            <line x1="248" y1="177" x2="256" y2="201" stroke="#C8A878" strokeWidth="1.2" strokeOpacity="0.8" />

            {/* Brass Wall Sconces */}
            <circle cx="54" cy="230" r="3" fill="#C8A878" />
            <circle cx="54" cy="230" r="8" fill="#FFE0AA" opacity={isShopActive ? 0.75 : 0.3} />

            {/* Sidewalk Planters & Foliage */}
            <rect x="50" y="345" width="16" height="25" rx="1" fill="#CBB69F" stroke="#211A19" strokeWidth="0.8" strokeOpacity="0.5" />
            <ellipse cx="58" cy="340" rx="10" ry="14" fill="#607262" />
            <ellipse cx="54" cy="334" rx="7" ry="10" fill="#758A77" />
            <ellipse cx="62" cy="332" rx="8" ry="11" fill="#526454" />

            <rect x="246" y="348" width="14" height="22" rx="1" fill="#CBB69F" stroke="#211A19" strokeWidth="0.8" strokeOpacity="0.5" />
            <ellipse cx="253" cy="344" rx="8" ry="12" fill="#607262" />
            <ellipse cx="255" cy="338" rx="6" ry="9" fill="#758A77" />
          </g>

          {/* ========================================================================= */}
          {/* 7. RIGHT SIDE: CONTEMPORARY INDIAN RESIDENTIAL SOCIETY (5 FLOORS)        */}
          {/* ========================================================================= */}
          <g id="residentialSociety" filter="url(#archShadow)">
            {/* Main Multi-Story Building Block */}
            <rect x="700" y="35" width="250" height="335" rx="2" fill="url(#societyFacadeGrad)" />
            
            {/* Rooftop Pergola Terrace */}
            <rect x="715" y="23" width="220" height="14" rx="1" fill="#D6C9B8" />
            {[725, 755, 785, 815, 845, 875, 905].map((x) => (
              <line key={x} x1={x} y1="23" x2={x} y2="12" stroke="#8C674E" strokeWidth="2.2" strokeLinecap="round" />
            ))}
            <line x1="720" y1="12" x2="915" y2="12" stroke="#8C674E" strokeWidth="2.8" strokeLinecap="round" />
            <ellipse cx="925" cy="27" rx="10" ry="7" fill="#607262" />
            <ellipse cx="934" cy="29" rx="7" ry="6" fill="#758A77" />

            {/* Vertical Teak Slat Accent Column */}
            <rect x="700" y="35" width="28" height="335" fill="url(#teakWoodGrad)" />
            <line x1="707" y1="35" x2="707" y2="370" stroke="#684A35" strokeWidth="1" />
            <line x1="714" y1="35" x2="714" y2="370" stroke="#684A35" strokeWidth="1" />
            <line x1="721" y1="35" x2="721" y2="370" stroke="#684A35" strokeWidth="1" />

            {/* ----------------- FLOOR 5 (TOP FLOOR) ----------------- */}
            <g id="floor5">
              <rect x="738" y="52" width="52" height="42" rx="1" fill="#FAF6EF" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.5" />
              <line x1="764" y1="52" x2="764" y2="94" stroke="#211A19" strokeWidth="0.7" strokeOpacity="0.4" />
              <rect x="804" y="50" width="128" height="46" rx="1" fill="#EDE4D6" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.3" />
              <rect x="806" y="70" width="124" height="26" fill="url(#eveningGlassGrad)" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.5" />
              <ellipse cx="918" cy="74" rx="6" ry="8" fill="#607262" />
            </g>

            {/* ----------------- FLOOR 4 ----------------- */}
            <g id="floor4">
              <rect x="738" y="112" width="52" height="42" rx="1" fill="#FAF6EF" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.5" />
              <line x1="764" y1="112" x2="764" y2="154" stroke="#211A19" strokeWidth="0.7" strokeOpacity="0.4" />
              <rect x="804" y="110" width="128" height="46" rx="1" fill="#EDE4D6" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.3" />
              <rect x="806" y="130" width="124" height="26" fill="url(#eveningGlassGrad)" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.5" />
              <ellipse cx="818" cy="134" rx="7" ry="9" fill="#758A77" />
            </g>

            {/* ----------------- FLOOR 3 (HERO DESTINATION RESIDENCE) ----------------- */}
            <g id="floor3">
              <rect x="738" y="172" width="52" height="42" rx="1" fill="#FAF6EF" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.5" />
              <line x1="764" y1="172" x2="764" y2="214" stroke="#211A19" strokeWidth="0.7" strokeOpacity="0.4" />
              
              <rect x="804" y="170" width="128" height="46" rx="1" fill="#EDE4D6" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.3" />
              
              {/* Dynamic warm amber light glowing behind the balcony & doorway as delivery arrives */}
              <ellipse 
                cx="825" 
                cy="190" 
                rx="50" 
                ry="35" 
                fill="url(#apartmentGlow)" 
                opacity={isSocietyActive ? 0.95 : 0.25} 
                className="transition-opacity duration-1000"
              />

              {/* Apartment Glazed Door / Doorstep Delivery Destination */}
              <rect x="815" y="176" width="30" height="38" rx="1" fill="#FFF8EE" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.6" />
              <rect x="838" y="192" width="2" height="7" rx="0.5" fill="#C8A878" />

              {/* Glass Railing */}
              <rect x="806" y="190" width="124" height="26" fill="url(#eveningGlassGrad)" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.5" />
              <ellipse cx="904" cy="194" rx="8" ry="10" fill="#607262" />
              <ellipse cx="916" cy="196" rx="7" ry="8" fill="#758A77" />
            </g>

            {/* ----------------- FLOOR 2 ----------------- */}
            <g id="floor2">
              <rect x="738" y="232" width="52" height="42" rx="1" fill="#FAF6EF" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.5" />
              <line x1="764" y1="232" x2="764" y2="274" stroke="#211A19" strokeWidth="0.7" strokeOpacity="0.4" />
              <rect x="804" y="230" width="128" height="46" rx="1" fill="#EDE4D6" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.3" />
              <rect x="806" y="250" width="124" height="26" fill="url(#eveningGlassGrad)" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.5" />
              <ellipse cx="916" cy="254" rx="7" ry="9" fill="#607262" />
            </g>

            {/* ----------------- GROUND FLOOR: GRAND LOBBY & SECURITY ENTRY ----------------- */}
            <g id="groundFloorLobby">
              <rect x="738" y="292" width="138" height="78" fill="#F0E8DC" stroke="#211A19" strokeWidth="1.2" strokeOpacity="0.6" />
              
              {/* Double Glazed Lobby Doors */}
              <rect x="772" y="306" width="68" height="64" fill="#FFF9F0" stroke="#211A19" strokeWidth="1.2" strokeOpacity="0.75" />
              <line x1="806" y1="306" x2="806" y2="370" stroke="#211A19" strokeWidth="1.2" strokeOpacity="0.6" />
              <rect x="802" y="334" width="2" height="14" rx="0.5" fill="#C8A878" />
              <rect x="808" y="334" width="2" height="14" rx="0.5" fill="#C8A878" />

              {/* Lobby Lighting */}
              <circle cx="806" cy="300" r="3.5" fill="#C8A878" />
              <circle cx="806" cy="300" r="14" fill="#FFE0AA" opacity={isSocietyActive ? 0.75 : 0.3} />

              {/* Security Entry Gate Structure */}
              <rect x="680" y="318" width="20" height="52" rx="1" fill="#D6C9B8" stroke="#211A19" strokeWidth="0.9" strokeOpacity="0.5" />
              <rect x="678" y="314" width="24" height="5" rx="0.5" fill="#211A19" opacity="0.35" />
              <circle cx="690" cy="312" r="2.5" fill="#C8A878" />
              <circle cx="690" cy="312" r="9" fill="#FFE0AA" opacity={isSocietyActive ? 0.85 : 0.35} />

              {/* Landscaped Entrance Planters */}
              <rect x="888" y="330" width="30" height="40" rx="1" fill="#CBB69F" stroke="#211A19" strokeWidth="0.7" strokeOpacity="0.4" />
              <ellipse cx="903" cy="322" rx="16" ry="18" fill="#607262" />
              <ellipse cx="897" cy="312" rx="10" ry="14" fill="#758A77" />
              <ellipse cx="911" cy="310" rx="11" ry="15" fill="#526454" />
            </g>
          </g>

          {/* ========================================================================= */}
          {/* 8. MOTION TRAIL & CENTRAL CONNECTION                                      */}
          {/* ========================================================================= */}
          <g id="motionRoute">
            {/* Guide Spline */}
            <path
              d="M 250 315 C 380 180, 620 240, 785 175"
              fill="none"
              stroke="#D6B7A5"
              strokeWidth="0.7"
              strokeOpacity="0.45"
              strokeDasharray="4 4"
            />

            {/* Dynamic Burgundy Motion Trail */}
            <motion.path
              d="M 250 315 C 380 180, 620 240, 785 175"
              fill="none"
              stroke="url(#motionTrailGrad)"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: progress < 0.22 ? 0 : Math.min(1, (progress - 0.22) / 0.62)
              }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />

            {/* Midpoint DigiLocal Connection Pulse */}
            {isMidpointActive && (
              <g transform="translate(500, 205)">
                <circle
                  r="24"
                  fill="none"
                  stroke="#541D26"
                  strokeWidth="0.9"
                  strokeOpacity="0.4"
                  className="animate-ping"
                />
                <circle
                  r="12"
                  fill="none"
                  stroke="#C8A878"
                  strokeWidth="1.2"
                  strokeOpacity="0.8"
                />
                <circle
                  r="3.5"
                  fill="#541D26"
                  opacity="0.95"
                />
              </g>
            )}
          </g>

          {/* ========================================================================= */}
          {/* 9. THE HERO: THE ORDER PACKAGE                                            */}
          {/* ========================================================================= */}
          <g
            id="orderPackage"
            transform={`translate(${pkg.x}, ${pkg.y}) scale(${pkg.scale})`}
            opacity={pkg.opacity}
            filter="url(#parcelGlow)"
            className="transition-transform duration-75"
          >
            {/* Package Body (Luxury Burgundy Gift / Grocery Box) */}
            <rect
              x="-10"
              y="-10"
              width="20"
              height="20"
              rx="3"
              fill="#541D26"
              stroke="#C8A878"
              strokeWidth="1"
            />
            
            {/* Gold Ribbon Accents */}
            <line x1="-10" y1="0" x2="10" y2="0" stroke="#C8A878" strokeWidth="1" />
            <line x1="0" y1="-10" x2="0" y2="10" stroke="#C8A878" strokeWidth="1" />
            
            {/* Center Pearl Seal */}
            <circle cx="0" cy="0" r="2.2" fill="#FFF4E0" stroke="#541D26" strokeWidth="0.5" />
          </g>

          {/* ========================================================================= */}
          {/* 10. DOORSTEP ARRIVAL CONFIRMATION PULSE                                   */}
          {/* ========================================================================= */}
          {isDelivered && (
            <g transform="translate(785, 175)">
              <circle
                r="28"
                fill="none"
                stroke="#541D26"
                strokeWidth="1.2"
                strokeOpacity="0.5"
                className="animate-ping"
              />
              <circle
                r="14"
                fill="none"
                stroke="#C8A878"
                strokeWidth="1.4"
                strokeOpacity="0.9"
              />
              <circle
                r="4.5"
                fill="#541D26"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
