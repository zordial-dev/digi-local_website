import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Store, ShieldCheck, Building2, CheckCircle2, ArrowRight, Zap, Clock, Sparkles } from 'lucide-react';

export default function ScrollStoryAnimation({ onExploreClick }) {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 75%', 'end 25%']
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  // Progress calculations for track line & active node state
  const trackWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  const riderPosition = useTransform(smoothProgress, [0.1, 0.85], ['0%', '100%']);

  const steps = [
    {
      id: '01',
      tag: 'Step 01 • Origin',
      title: 'In-Society Vendor',
      subtitle: 'Instant Fulfillment',
      description: 'Your order is assigned directly to verified local merchants located right within or adjacent to your gated society.',
      icon: Store,
      badge: '100% Verified Merchant',
      detail: 'Fulfilling in ~3 mins'
    },
    {
      id: '02',
      tag: 'Step 02 • Verification',
      title: 'Society Gates',
      subtitle: 'Seamless Pass-Through',
      description: 'Pre-verified delivery partners pass through gate security with zero delay or resident intervention.',
      icon: ShieldCheck,
      badge: 'RFID & Gate Verified',
      detail: 'Instant clearance'
    },
    {
      id: '03',
      tag: 'Step 03 • Arrival',
      title: 'Resident Tower',
      subtitle: 'Doorstep Delivery',
      description: 'Hand-delivered straight to your apartment door with real-time tracking updates in under 15 minutes total.',
      icon: Building2,
      badge: '15-Min Guaranteed',
      detail: 'Delivered to Doorstep'
    }
  ];

  return (
    <section ref={containerRef} className="w-full bg-[#EEE5DA] py-12 sm:py-20 text-[#211A19] font-sans overflow-hidden border-y border-[#E5DAD0]">
      <div className="w-full max-w-[96%] xl:max-w-[1240px] mx-auto px-4">
        
        {/* SECTION HEADER */}
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#541D26]/10 text-[#541D26] text-[11px] font-extrabold shadow-xs border border-[#541D26]/20 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#541D26]" />
            <span>Hyperlocal Logistics Journey</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-[#211A19] tracking-tight uppercase">
            How Direct Fulfillment Works
          </h2>

          <p className="text-xs sm:text-sm text-[#211A19]/75 font-medium max-w-xl mx-auto leading-relaxed">
            A frictionless, 3-stage delivery pipeline engineered specifically for connected gated residential communities.
          </p>
        </div>

        {/* ELEGANT 3-STAGE STORYBOARD CANVAS */}
        <div className="w-full max-w-5xl mx-auto relative space-y-12">
          
          {/* CONTINUOUS GLOWING PROGRESS TRACK BAR */}
          <div className="w-full relative px-6 sm:px-12 py-4">
            <div className="w-full h-1.5 bg-[#D6B7A5]/40 rounded-full relative overflow-hidden">
              <motion.div
                style={{ width: trackWidth }}
                className="h-full bg-[#541D26] rounded-full transition-all duration-150"
              />
            </div>

            {/* FLOATING DELIVERY RIDER INDICATOR NODE */}
            <motion.div
              style={{ left: riderPosition }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#541D26] text-white flex items-center justify-center shadow-lg border-2 border-[#C8A878] transition-transform"
            >
              <Zap className="w-4 h-4 text-[#C8A878]" />
            </motion.div>
          </div>

          {/* 3-COLUMN BENTO STAGE CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
            {steps.map((step, index) => {
              const StepIcon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`bg-white rounded-[2rem] p-7 sm:p-8 border transition-all duration-300 flex flex-col justify-between cursor-pointer relative group ${
                    activeStep === index
                      ? 'border-[#541D26] shadow-xl ring-2 ring-[#541D26]/20'
                      : 'border-[#E5DAD0] hover:border-[#541D26]/40 shadow-xs'
                  }`}
                >
                  {/* Top Header Tag & Number */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#541D26] tracking-widest uppercase font-mono">
                        {step.tag}
                      </span>
                      <span className="w-8 h-8 rounded-full bg-[#541D26]/10 text-[#541D26] text-xs font-black flex items-center justify-center">
                        {step.id}
                      </span>
                    </div>

                    {/* Icon Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-[#541D26] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <StepIcon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-xl font-serif font-black text-[#211A19] tracking-tight">
                        {step.title}
                      </h3>
                      <div className="text-xs font-bold text-[#541D26] uppercase tracking-wider mt-0.5">
                        {step.subtitle}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium pt-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom Highlight Badge */}
                  <div className="mt-6 pt-4 border-t border-[#E5DAD0] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#541D26] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#541D26]" />
                      <span>{step.badge}</span>
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-[#211A19]/60">
                      {step.detail}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* DELIVERED IN 15 MINS SUMMARY BAR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-xl mx-auto bg-[#211A19] text-white rounded-full py-4 px-6 sm:px-8 shadow-xl border border-white/10 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#541D26] text-white flex items-center justify-center font-bold">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black uppercase tracking-wider text-white">Average Delivery: 15 Mins</div>
                <div className="text-[11px] text-[#D6B7A5] font-medium">Direct from neighborhood vendors</div>
              </div>
            </div>

            <button
              onClick={onExploreClick}
              className="px-6 py-2 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ml-auto transition-all"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
