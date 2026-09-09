import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, ArrowRight, ArrowUpRight, Sparkles, ShieldCheck, Lock, Headphones, Star, Truck, Zap, ShoppingBag, CheckCircle2, Wrench, ExternalLink, Building2, Globe, Cpu } from 'lucide-react';
import LiveOrderTrackerToast from '../components/LiveOrderTrackerToast';
import AnimatedIcon from '../components/common/AnimatedIcon';
import ScrollStoryAnimation from '../components/ScrollStoryAnimation';
import StrokeText from '../components/StrokeText';
import ZordialLogo from '../components/ZordialLogo';
import ScrollTextReveal from '../components/common/ScrollTextReveal';
import FloatingDoodles from '../components/FloatingDoodles';

const POLAROID_SETS = [
  {
    categoryLabel: "🌸 Specialty Stores & Healthcare",
    badge: "Specialty Merchant",
    items: [
      {
        image: "/polaroid_organic_dairy.jpg",
        text: "Organic Dairy",
        angle: -4
      },
      {
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80",
        text: "Gourmet Coffee",
        angle: 3
      },
      {
        image: "/polaroid_pharmacy_wellness.jpg",
        text: "Pharmacy & Care",
        angle: -3
      },
      {
        image: "/polaroid_resin_crafts.jpg",
        text: "Resin & Crafts",
        angle: 4
      }
    ]
  },
  {
    categoryLabel: "🛒 Daily Goods & Fresh Produce",
    badge: "Product Merchant",
    items: [
      {
        image: "/polaroid_fresh_produce.jpg",
        text: "Fresh Produce",
        angle: -4
      },
      {
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
        text: "Artisan Bakes",
        angle: 3
      },
      {
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80",
        text: "Food Junction",
        angle: -3
      },
      {
        image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80",
        text: "Orchard Fruits",
        angle: 4
      }
    ]
  },
  {
    categoryLabel: "🛠️ On-Demand Home Services",
    badge: "Service Merchant",
    items: [
      {
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
        text: "Electric & Plumbing",
        angle: -4
      },
      {
        image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80",
        text: "Express Laundry",
        angle: 3
      },
      {
        image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=80",
        text: "Pet Care & Grooming",
        angle: -3
      },
      {
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80",
        text: "Home Salon & Care",
        angle: 4
      }
    ]
  }
];

export default function HomePage({ currentRoute, setRoute, onOpenLogin }) {
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-switch polaroid merchant categories every 2.8 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSetIndex((prev) => (prev + 1) % POLAROID_SETS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Load active order from storage for live order tracking widget
  useEffect(() => {
    try {
      const saved = localStorage.getItem('digilocal_active_order');
      if (saved) {
        setActiveOrder(JSON.parse(saved));
      }
    } catch (_) { }
  }, []);

  const currentSet = POLAROID_SETS[activeSetIndex];

  // Respect OS/Browser prefers-reduced-motion setting
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Animation variants for calm scroll reveals
  const containerVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 48, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 1.1,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.14,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 32, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.9,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="w-full bg-[#F6F0E8] min-h-screen font-sans -mt-px overflow-x-hidden text-[#211A19] pb-16 relative">
      
      {/* HERO SECTION */}
      <div className="w-full pt-8 sm:pt-10 lg:pt-14 pb-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col items-center justify-between text-center bg-[#F6F0E8] min-h-[620px] lg:min-h-[690px]">

          {/* Background Floating Line-Art Doodles */}
          <FloatingDoodles section="hero" />

          {/* Decorative subtle ambient Nude radial glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#D6B7A5]/25 rounded-full blur-[100px] pointer-events-none z-0" />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center"
          >

            {/* Top Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-md bg-[#541D26]/10 text-[#541D26] text-[11px] font-bold tracking-widest uppercase border border-[#541D26]/20 mb-3 sm:mb-4 lg:mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#541D26]" />
              <span>Hyperlocal Lifestyle Network</span>
            </motion.div>

            {/* Headline with Animated StrokeText Component */}
            <motion.div variants={itemVariants} className="w-full max-w-6xl mx-auto my-1 sm:my-2 lg:my-3">
              <StrokeText
                text="YOUR SOCIETY. YOUR VENDORS. DELIVERED."
                strokeColor="#211A19"
                fillColor="#211A19"
                strokeWidth={1.4}
                drawDuration={1.6}
                fillDelay={0.2}
                stagger={0.035}
                ease="power2.out"
                trigger="mount"
                fillMode="wipe"
                fontSize={76}
                fontWeight={900}
                letterSpacing={0}
                fontFamily="'Playfair Display', 'Cormorant Garamond', Georgia, serif"
                style={{ '--stroke-text-height': 'clamp(2.2rem, 4.8vw, 3.6rem)' }}
                className="w-full"
              />
            </motion.div>

            {/* Subtitle Description */}
            <ScrollTextReveal
              as="p"
              mode="word"
              delay={0.2}
              className="text-xs sm:text-sm lg:text-[15px] text-[#211A19]/80 font-medium leading-[1.65] sm:leading-[1.75] text-center max-w-2xl sm:max-w-3xl mx-auto mt-2 sm:mt-3 mb-5 sm:mb-7 px-4"
            >
              DigiLocal connects residents directly with verified neighborhood stores, organic growers, artisanal bakeries, pharmacies, and daily service providers.
            </ScrollTextReveal>

            {/* Action Buttons (Primary Oxblood #541D26 & Secondary Transparent/Oxblood) */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mb-4 sm:mb-6 z-20">
              <button
                onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
                className="px-8 py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center space-x-2 cursor-pointer transition-all hover:scale-102"
              >
                <span>Browse All Vendors</span>
                <ArrowUpRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={() => setRoute({ page: 'vendorRegister' })}
                className="px-8 py-3.5 rounded-full bg-transparent border border-[#541D26]/70 text-[#541D26] hover:bg-[#541D26] hover:text-white font-extrabold text-xs uppercase tracking-wider shadow-xs flex items-center space-x-2 cursor-pointer transition-all hover:scale-102"
              >
                <Store className="w-4 h-4 currentColor" />
                <span>Register As Vendor</span>
              </button>
            </motion.div>

            {/* 4 TILTED POLAROID CARDS ROW WITH PURE WHITE CARDS */}
            <motion.div
              variants={itemVariants}
              className="w-full max-w-5xl mx-auto pt-2 sm:pt-4 pb-0 flex flex-col items-center select-none translate-y-6 sm:translate-y-10 lg:translate-y-14 -mb-4 sm:-mb-8 lg:-mb-10"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Tilted Polaroid Cards Grid */}
              <div className="w-full min-h-[220px] sm:min-h-[260px] flex items-end justify-center">
                <div className="w-full grid grid-cols-2 md:flex md:flex-row items-end justify-center gap-3 sm:gap-4 md:gap-0">
                  <AnimatePresence mode="wait">
                    {currentSet.items.map((item, index) => (
                      <motion.div
                        key={`${activeSetIndex}-${index}`}
                        initial={{ opacity: 0, y: 24, scale: 0.94, rotate: 0 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: item.angle }}
                        exit={{ opacity: 0, y: -18, scale: 0.94, rotate: 0 }}
                        transition={{
                          duration: 0.45,
                          delay: index * 0.08,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                        whileHover={{ scale: 1.07, rotate: 0, zIndex: 30, transition: { duration: 0.15, ease: 'easeOut' } }}
                        className="w-full md:w-56 lg:w-60 bg-white p-2 sm:p-2.5 pb-6 sm:pb-7 shadow-[0_10px_25px_rgba(33,26,25,0.08)] rounded-md border border-[#E5DAD0] -mx-1 sm:-mx-2 lg:-mx-3 transition-all duration-200 hover:shadow-[0_18px_40px_rgba(33,26,25,0.18)] cursor-pointer shrink-0"
                        onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
                      >
                        <div className="w-full aspect-[4/3] overflow-hidden rounded-xs bg-[#EEE5DA] relative">
                          <img src={item.image} alt={item.text} className="w-full h-full object-cover transition-transform duration-200 ease-out hover:scale-108" />
                        </div>
                        <div className="mt-2.5 text-center font-serif italic text-[#211A19] font-bold text-sm sm:text-base tracking-wide">
                          {item.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* HOW IT WORKS ANIMATED STORY SECTION */}
        <ScrollStoryAnimation
          onExploreClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
        />

        {/* PRODUCT FEATURES & HIGHLIGHTS BENTO GRID (Pure White Cards over Warm Cream Background) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="w-full max-w-[97%] xl:max-w-[95%] mx-auto my-12 px-4 relative"
        >
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2 flex flex-col items-center">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#541D26]/10 text-[#541D26] text-[10px] font-bold tracking-widest uppercase border border-[#541D26]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#541D26]" />
              <span>Why DigiLocal</span>
            </span>
            <ScrollTextReveal
              as="h2"
              mode="word"
              className="text-2xl sm:text-3xl font-serif font-black text-[#211A19] uppercase tracking-tight justify-center"
            >
              The Hyperlocal Advantage
            </ScrollTextReveal>
            <ScrollTextReveal
              as="p"
              mode="word"
              delay={0.15}
              className="text-xs sm:text-sm text-[#211A19]/75 font-medium justify-center"
            >
              Designed for residential communities to empower local commerce with zero friction.
            </ScrollTextReveal>
          </div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {/* Card 1: 15-Min Delivery */}
            <motion.div variants={itemVariants} className="bg-white border border-[#E5DAD0] rounded-[2rem] p-6 sm:p-7 shadow-xs hover:border-[#541D26]/30 transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26] mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-[#541D26]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#211A19] mb-1">
                  15-Min Express Delivery
                </h3>
                <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                  Orders are fulfilled directly from neighborhood stores within your area for instant delivery.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E5DAD0] text-[11px] font-bold text-[#541D26] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Hyperlocal Speed</span>
              </div>
            </motion.div>

            {/* Card 2: Verified Local Stores */}
            <motion.div variants={itemVariants} className="bg-white border border-[#E5DAD0] rounded-[2rem] p-6 sm:p-7 shadow-xs hover:border-[#541D26]/30 transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26] mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-[#541D26]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#211A19] mb-1">
                  100% Verified Merchants
                </h3>
                <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                  Every vendor undergoes identity, GSTIN, and business location verification before listing.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E5DAD0] text-[11px] font-bold text-[#541D26] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Verified & Trustworthy</span>
              </div>
            </motion.div>

            {/* Card 3: Farm Fresh & Organic */}
            <motion.div variants={itemVariants} className="bg-white border border-[#E5DAD0] rounded-[2rem] p-6 sm:p-7 shadow-xs hover:border-[#541D26]/30 transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26] mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-[#541D26]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#211A19] mb-1">
                  Farm Fresh & Organic
                </h3>
                <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                  Direct access to organic produce, A2 cow milk, artisan bakeries, and handcrafted local goods.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E5DAD0] text-[11px] font-bold text-[#541D26] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Pure & Organic</span>
              </div>
            </motion.div>

            {/* Card 4: Seamless Order Tracking */}
            <motion.div variants={itemVariants} className="bg-white border border-[#E5DAD0] rounded-[2rem] p-6 sm:p-7 shadow-xs hover:border-[#541D26]/30 transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26] mb-4 group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6 text-[#541D26]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#211A19] mb-1">
                  Seamless Order Tracking
                </h3>
                <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                  Real-time order status updates, WhatsApp coordination, and direct vendor communication.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E5DAD0] text-[11px] font-bold text-[#541D26] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Instant Updates</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* COMPANY MISSION & LIVE IMPACT STATS (Dark Espresso #211A19 Section) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="w-full max-w-[97%] xl:max-w-[95%] mx-auto my-12 px-4 relative"
        >
          <div className="bg-[#211A19] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <motion.div variants={itemVariants} className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-white/10 text-[#D6B7A5] text-[10px] font-bold tracking-widest uppercase border border-[#D6B7A5]/30 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A878] animate-pulse" />
                  <span>Company Vision & Mission</span>
                </span>
                <ScrollTextReveal
                  as="h2"
                  mode="word"
                  className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight"
                >
                  Empowering Local Merchants, Enriching Residential Communities.
                </ScrollTextReveal>
                <ScrollTextReveal
                  as="p"
                  mode="word"
                  delay={0.15}
                  className="text-xs sm:text-sm text-[#D6B7A5] leading-relaxed font-medium"
                >
                  DigiLocal was built to bridge the gap between residents and neighborhood vendors. By eliminating middleman markups and giving local store owners digital tools, we foster thriving, self-sustaining community economies.
                </ScrollTextReveal>
                <div className="pt-2 flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => setRoute({ page: 'info', tab: 'about-us' })}
                    className="px-6 py-2.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Our Story</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => setRoute({ page: 'info', tab: 'how-it-works' })}
                    className="px-6 py-2.5 rounded-full bg-transparent hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider transition-all border border-[#D6B7A5]/40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>How It Works</span>
                    <ArrowUpRight className="w-4 h-4 text-[#C8A878]" />
                  </button>
                </div>
              </motion.div>

              {/* Live Stats Grid */}
              <motion.div variants={containerVariants} className="lg:col-span-5 grid grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center transition-all hover:border-[#C8A878]/40">
                  <span className="text-[10px] font-extrabold text-[#C8A878] tracking-widest block mb-0.5">01</span>
                  <div className="text-3xl sm:text-4xl font-serif font-black text-white">50+</div>
                  <div className="text-[11px] font-bold text-[#D6B7A5] uppercase tracking-wider mt-1">Cities Serviced</div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center transition-all hover:border-[#C8A878]/40">
                  <span className="text-[10px] font-extrabold text-[#C8A878] tracking-widest block mb-0.5">02</span>
                  <div className="text-3xl sm:text-4xl font-serif font-black text-white">10,000+</div>
                  <div className="text-[11px] font-bold text-[#D6B7A5] uppercase tracking-wider mt-1">Active Residents</div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center transition-all hover:border-[#C8A878]/40">
                  <span className="text-[10px] font-extrabold text-[#C8A878] tracking-widest block mb-0.5">03</span>
                  <div className="text-3xl sm:text-4xl font-serif font-black text-white">1,200+</div>
                  <div className="text-[11px] font-bold text-[#D6B7A5] uppercase tracking-wider mt-1">Verified Stores</div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center transition-all hover:border-[#C8A878]/40">
                  <span className="text-[10px] font-extrabold text-[#C8A878] tracking-widest block mb-0.5">04</span>
                  <div className="text-3xl sm:text-4xl font-serif font-black text-white">99.4%</div>
                  <div className="text-[11px] font-bold text-[#D6B7A5] uppercase tracking-wider mt-1">On-Time Delivery</div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* HOW DIGILOCAL WORKS (3 EASY STEPS WITH PURE WHITE CARDS) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="w-full max-w-[97%] xl:max-w-[95%] mx-auto my-12 px-4 relative"
        >
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2 flex flex-col items-center">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#541D26]/10 text-[#541D26] text-[10px] font-bold tracking-widest uppercase border border-[#541D26]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#541D26]" />
              <span>Simple & Transparent Process</span>
            </span>
            <ScrollTextReveal
              as="h2"
              mode="word"
              className="text-2xl sm:text-3xl font-serif font-black text-[#211A19] uppercase tracking-tight justify-center"
            >
              How DigiLocal Works
            </ScrollTextReveal>
            <ScrollTextReveal
              as="p"
              mode="word"
              delay={0.15}
              className="text-xs sm:text-sm text-[#211A19]/75 font-medium justify-center"
            >
              Experience effortless shopping from neighborhood stores in 3 simple steps.
            </ScrollTextReveal>
          </div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <motion.div variants={itemVariants} className="bg-white border border-[#E5DAD0] rounded-3xl p-7 shadow-xs relative text-center flex flex-col items-center group hover:border-[#541D26]/40 transition-all">
              <span className="text-[10px] font-extrabold text-[#541D26] tracking-widest uppercase mb-2 block">Step 01</span>
              <div className="w-12 h-12 rounded-full bg-[#541D26] text-white font-serif font-black text-lg flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-base font-bold text-[#211A19] mb-1">Search Your Locality or Item</h3>
              <p className="text-xs text-[#211A19]/75 font-medium leading-relaxed">
                Enter your area, society, pincode, or store name to view active vendors servicing your neighborhood.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={itemVariants} className="bg-white border border-[#E5DAD0] rounded-3xl p-7 shadow-xs relative text-center flex flex-col items-center group hover:border-[#541D26]/40 transition-all">
              <span className="text-[10px] font-extrabold text-[#541D26] tracking-widest uppercase mb-2 block">Step 02</span>
              <div className="w-12 h-12 rounded-full bg-[#541D26] text-white font-serif font-black text-lg flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-base font-bold text-[#211A19] mb-1">Select Fresh Goods & Services</h3>
              <p className="text-xs text-[#211A19]/75 font-medium leading-relaxed">
                Browse organic groceries, artisan bakes, dairy, medicines, or book skilled home repair services.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={itemVariants} className="bg-white border border-[#E5DAD0] rounded-3xl p-7 shadow-xs relative text-center flex flex-col items-center group hover:border-[#541D26]/40 transition-all">
              <span className="text-[10px] font-extrabold text-[#541D26] tracking-widest uppercase mb-2 block">Step 03</span>
              <div className="w-12 h-12 rounded-full bg-[#541D26] text-white font-serif font-black text-lg flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-base font-bold text-[#211A19] mb-1">Enjoy Doorstep Delivery</h3>
              <p className="text-xs text-[#211A19]/75 font-medium leading-relaxed">
                Receive your order in 15 minutes with real-time status updates and direct vendor support.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* TRUST BADGES BAR */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="max-w-4xl mx-auto bg-white border border-[#E5DAD0] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-8 relative"
        >
          <motion.div variants={itemVariants} className="flex items-center space-x-2.5 sm:space-x-3 border-r border-[#E5DAD0] pr-2 sm:pr-4 justify-center">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#541D26]/10 flex items-center justify-center text-[#541D26] flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#541D26]" />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-bold text-[#211A19] whitespace-nowrap">Verified Vendors</h5>
              <p className="text-[9px] sm:text-[10px] text-[#211A19]/70 font-normal whitespace-nowrap">100% Verified & Reliable</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-2.5 sm:space-x-3 md:border-r border-[#E5DAD0] pr-2 sm:pr-4 justify-center">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#541D26]/10 flex items-center justify-center text-[#541D26] flex-shrink-0">
              <Lock className="w-4 h-4 text-[#541D26]" />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-bold text-[#211A19] whitespace-nowrap">Safe Payments</h5>
              <p className="text-[9px] sm:text-[10px] text-[#211A19]/70 font-normal whitespace-nowrap">Secure & Hassle-free</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-2.5 sm:space-x-3 border-r border-[#E5DAD0] pr-2 sm:pr-4 justify-center">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#541D26]/10 flex items-center justify-center text-[#541D26] flex-shrink-0">
              <Headphones className="w-4 h-4 text-[#541D26]" />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-bold text-[#211A19] whitespace-nowrap">24/7 Support</h5>
              <p className="text-[9px] sm:text-[10px] text-[#211A19]/70 font-normal whitespace-nowrap">We're here to help</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-2.5 sm:space-x-3 justify-center">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#541D26]/10 flex items-center justify-center text-[#541D26] flex-shrink-0">
              <Star className="w-4 h-4 text-[#C8A878] fill-[#C8A878]" />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-bold text-[#211A19] whitespace-nowrap">Best Quality</h5>
              <p className="text-[9px] sm:text-[10px] text-[#211A19]/70 font-normal whitespace-nowrap">Quality you can trust</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ZORDIAL TECHNOLOGIES PARTNER / PARENT PRODUCT SECTION */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={containerVariants}
          className="w-full max-w-[97%] xl:max-w-[95%] mx-auto my-12 px-4 relative"
        >
          <div className="bg-white border border-[#E7DFD5] rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Background ambient glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A878]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            {/* Left Column: Product Information & Architectural Story */}
            <motion.div variants={itemVariants} className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#541D26]/10 text-[#541D26] text-[10px] font-bold tracking-widest uppercase border border-[#541D26]/20">
                <Building2 className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Product of Zordial Technologies</span>
              </div>

              <ScrollTextReveal
                as="h2"
                mode="word"
                className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#211A19] leading-tight"
              >
                Engineered & Powered by Zordial Technologies
              </ScrollTextReveal>

              <ScrollTextReveal
                as="p"
                mode="word"
                delay={0.12}
                className="text-xs sm:text-sm text-[#211A19]/80 font-medium leading-relaxed"
              >
                DigiLocal was conceived, architected, and engineered by Zordial — a premier software technology company specializing in transforming ambitious ideas into enterprise-grade applications. Zordial provides the underlying core technology stack and infrastructure that powers DigiLocal.
              </ScrollTextReveal>

              {/* 3 Key Capabilities Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5] text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-[#541D26] font-bold text-xs">
                    <Cpu className="w-3.5 h-3.5 text-[#541D26]" />
                    <span>Core Engine</span>
                  </div>
                  <p className="text-[11px] text-[#78716C] font-medium leading-snug">
                    Hyperlocal society & flat unit mapping
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5] text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-[#541D26] font-bold text-xs">
                    <Zap className="w-3.5 h-3.5 text-[#541D26]" />
                    <span>Direct Routing</span>
                  </div>
                  <p className="text-[11px] text-[#78716C] font-medium leading-snug">
                    Zero-commission order fulfillment gateway
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5] text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-[#541D26] font-bold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#541D26]" />
                    <span>Security</span>
                  </div>
                  <p className="text-[11px] text-[#78716C] font-medium leading-snug">
                    Enterprise encryption & data privacy
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="https://zordial.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center space-x-2 border border-[#C8A878]/30 transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#C8A878]" />
                  <span>Visit zordial.com</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#C8A878]" />
                </a>
              </div>
            </motion.div>

            {/* Right Column: Zordial Logo Card */}
            <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full bg-[#FAF8F5] border border-[#E7DFD5] rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-4 shadow-2xs hover:border-[#C8A878]/60 transition-all group">
                <div className="w-full max-w-[240px] sm:max-w-[280px] p-2 bg-white rounded-2xl border border-[#E7DFD5]/60 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <ZordialLogo className="w-full h-auto" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase text-[#211A19]">
                    Zordial Technologies Private Limited
                  </h4>
                  <p className="text-[11px] text-[#78716C] font-medium mt-0.5">
                    Transforming Ideas Into Enterprise Applications
                  </p>
                </div>
                <a
                  href="https://zordial.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#541D26] hover:text-[#6B2732] hover:underline"
                >
                  <span>https://zordial.com</span>
                  <ExternalLink className="w-3 h-3 text-[#541D26]" />
                </a>
              </div>
            </motion.div>

          </div>
        </motion.div>

        {/* FINAL CALL TO ACTION BANNER */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="w-full max-w-[97%] xl:max-w-[95%] mx-auto mt-10 px-4 relative"
        >
          <div className="bg-[#EEE5DA] border border-[#E5DAD0] rounded-[2.5rem] p-8 sm:p-12 text-center relative overflow-hidden shadow-xs">
            <motion.div variants={itemVariants} className="max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#541D26] text-white text-[10px] font-bold tracking-widest uppercase border border-[#541D26] shadow-xs">
                <span>Get Started Today</span>
              </span>
              <ScrollTextReveal
                as="h2"
                mode="word"
                className="text-2xl sm:text-4xl font-serif font-black text-[#211A19] justify-center"
              >
                Ready to Explore Your Neighborhood Marketplace?
              </ScrollTextReveal>
              <ScrollTextReveal
                as="p"
                mode="word"
                delay={0.15}
                className="text-xs sm:text-sm text-[#211A19]/75 font-medium leading-relaxed justify-center"
              >
                Whether you're a resident looking for fresh local products or a merchant wanting to expand your business, DigiLocal is your platform.
              </ScrollTextReveal>
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <button
                  onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
                  className="px-7 py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <span>Browse All Vendors</span>
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={() => setRoute({ page: 'vendorRegister' })}
                  className="px-7 py-3.5 rounded-full bg-white hover:bg-[#541D26] text-[#541D26] hover:text-white border border-[#541D26] font-extrabold text-xs uppercase tracking-wider shadow-sm flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <Store className="w-4 h-4 currentColor" />
                  <span>Register As Merchant</span>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    );
  }
