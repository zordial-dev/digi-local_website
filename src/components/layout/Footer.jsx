import React from 'react';
import { 
  ShieldCheck, 
  Store, 
  Building2, 
  Mail, 
  Sparkles, 
  ShoppingBag, 
  ChevronRight, 
  ExternalLink,
  ArrowUp,
  Headphones,
  HelpCircle,
  Shield,
  FileText
} from 'lucide-react';

export default function Footer({ setRoute, onOpenSupportDesk }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navTo = (tab) => {
    setRoute({ page: 'info', tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#181312] text-white font-sans overflow-hidden px-4 sm:px-8 md:px-14 py-8 sm:py-12 select-none relative pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
      
      {/* Background Decorative Ambient Radial Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C8A878]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-6 left-10 w-96 h-96 bg-[#541D26]/25 rounded-full blur-[150px] pointer-events-none" />

      {/* Subtle Background Watermark (Mobbin Brand Style) */}
      <div 
        className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[12vw] font-serif font-black tracking-widest text-white/[0.025] select-none pointer-events-none whitespace-nowrap leading-none uppercase"
        aria-hidden="true"
      >
        DIGILOCAL
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Top Status & Network Badge Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#D6B7A5] font-medium backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Hyperlocal Network Live • 50+ Connected Communities</span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-[#D6B7A5]">
            <span>15-Min Express Doorstep Delivery</span>
            <span className="w-1 h-1 rounded-full bg-[#C8A878]" />
            <span className="text-[#C8A878] font-bold">100% Verified Stores</span>
          </div>
        </div>

        {/* MAIN SPLIT CONTENT: Brand on Left, Link Columns on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* LEFT: Brand Name + Tagline */}
          <div className="lg:col-span-6 space-y-5">
            <div 
              onClick={() => setRoute({ page: 'home' })}
              className="flex items-center space-x-3 cursor-pointer group w-fit"
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center overflow-hidden p-1 shadow-xl group-hover:scale-105 transition-transform shrink-0 border border-white/20">
                <img 
                  src="/logo.png" 
                  alt="DigiLocal Logo" 
                  className="w-full h-full object-contain scale-[1.8]" 
                />
              </div>
              <div>
                <span className="font-serif italic text-2xl sm:text-3xl font-bold text-white group-hover:text-[#C8A878] transition-colors leading-none tracking-tight block">
                  DigiLocal <span className="text-[#D6B7A5] font-sans text-[11px] uppercase tracking-widest font-bold not-italic inline-block ml-1">Network</span>
                </span>
              </div>
            </div>

            <p className="text-sm text-[#D6B7A5]/90 leading-relaxed max-w-md font-medium">
              Connecting gated societies directly with verified neighborhood stores, daily essentials, artisan bakeries, and skilled services. Zero middleman markups.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setRoute({ page: 'vendorRegister' })}
                className="px-5 py-2.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white text-xs font-extrabold shadow-lg flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer border border-[#C8A878]/30"
              >
                <Store className="w-3.5 h-3.5 text-[#C8A878]" />
                <span>Register Store</span>
              </button>

              <button
                onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer border border-white/10"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#D6B7A5]" />
                <span>Browse Marketplace</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Two Distinct Link Columns */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-8 lg:pl-6 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0">
            
            {/* Column 1: EXPLORE */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-[#D6B7A5] uppercase tracking-widest font-sans flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#C8A878]" />
                  <span>EXPLORE</span>
                </h4>
                <div className="w-6 h-0.5 bg-[#C8A878]" />
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-white font-medium">
                <li>
                  <button 
                    onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
                    className="hover:text-[#C8A878] transition-all flex items-center space-x-2 text-left group cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-[#D6B7A5] group-hover:text-[#C8A878] group-hover:translate-x-1 transition-transform shrink-0" />
                    <span>Browse Vendors</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navTo('how-it-works')}
                    className="hover:text-[#C8A878] transition-all flex items-center space-x-2 text-left group cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-[#D6B7A5] group-hover:text-[#C8A878] group-hover:translate-x-1 transition-transform shrink-0" />
                    <span>How It Works</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navTo('about-us')}
                    className="hover:text-[#C8A878] transition-all flex items-center space-x-2 text-left group cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-[#D6B7A5] group-hover:text-[#C8A878] group-hover:translate-x-1 transition-transform shrink-0" />
                    <span>Our Story</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: SUPPORT & CONTACT */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-[#D6B7A5] uppercase tracking-widest font-sans flex items-center gap-1.5">
                  <Headphones className="w-3 h-3 text-[#C8A878]" />
                  <span>SUPPORT</span>
                </h4>
                <div className="w-6 h-0.5 bg-[#C8A878]" />
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-white font-medium">
                <li>
                  <button 
                    onClick={() => onOpenSupportDesk?.() || navTo('contact-support')}
                    className="hover:text-[#C8A878] transition-all flex items-center space-x-2 text-left group cursor-pointer font-bold"
                  >
                    <ChevronRight className="w-3 h-3 text-[#C8A878] group-hover:translate-x-1 transition-transform shrink-0" />
                    <span className="whitespace-nowrap">Support Desk</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navTo('contact-support')}
                    className="hover:text-[#C8A878] transition-all flex items-center space-x-2 text-left group cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-[#D6B7A5] group-hover:text-[#C8A878] group-hover:translate-x-1 transition-transform shrink-0" />
                    <span>Contact Team</span>
                  </button>
                </li>
                <li>
                  <a 
                    href="mailto:support@digilocal.network?subject=DigiLocal%20Support%20Desk%20Inquiry"
                    className="hover:text-[#C8A878] transition-all flex items-center space-x-2 text-left group cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-[#D6B7A5] group-hover:text-[#C8A878] group-hover:translate-x-1 transition-transform shrink-0" />
                    <span>Email Support</span>
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => navTo('help-support')}
                    className="hover:text-[#C8A878] transition-all flex items-center space-x-2 text-left group cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-[#D6B7A5] group-hover:text-[#C8A878] group-hover:translate-x-1 transition-transform shrink-0" />
                    <span>Help & FAQs</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* HORIZONTAL SEPARATOR */}
        <div className="w-full h-px bg-white/10" />

        {/* BOTTOM ROW: © on Left, Privacy & Terms on Right, Back to Top */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1 text-xs text-[#D6B7A5]">
          
          {/* Left: Copyright */}
          <div className="text-center md:text-left space-y-0.5">
            <p className="font-semibold text-white">
              © {new Date().getFullYear()} DigiLocal Network • Product of{' '}
              <a 
                href="https://zordial.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#C8A878] hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>Zordial Technologies</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            <p className="text-[11px] text-[#D6B7A5]/75">Transforming Ideas Into Enterprise Applications • Hyperlocal Commerce for Gated Communities</p>
          </div>

          {/* Right: Privacy & Terms Links + Back to Top */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button 
              onClick={() => navTo('privacy-policy')}
              className="hover:text-[#C8A878] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <button 
              onClick={() => navTo('terms-and-conditions')}
              className="hover:text-[#C8A878] transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>

            {/* Back To Top Floating Circle Button */}
            <button
              onClick={scrollToTop}
              className="w-9 h-9 rounded-full border border-white/20 bg-white/5 text-white hover:bg-[#541D26] hover:border-[#C8A878]/50 transition-all flex items-center justify-center shadow-md shrink-0 cursor-pointer ml-2 group hover:scale-105"
              title="Scroll to Top"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5 text-[#C8A878] group-hover:text-white group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}
