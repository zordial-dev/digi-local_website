import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  HelpCircle, 
  ShieldAlert, 
  Headphones, 
  MessageSquare, 
  ArrowUp,
  Store,
  Building2,
  CheckCircle2,
  MapPin,
  Mail,
  ArrowRight,
  Shield,
  Home,
  PlusCircle,
  Instagram,
  Linkedin,
  Info,
  Sparkles,
  Heart,
  ShoppingBag,
  Bike,
  RefreshCw
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
    <footer className="w-full py-8 px-2 sm:px-4 md:px-6 bg-[#F7F4EE] font-sans">
      
      {/* Wide Outer Bento Container spanning nicely across the screen */}
      <div className="w-full max-w-[96%] xl:max-w-[1520px] mx-auto bg-[#0B1610] text-[#F7F4EE] rounded-[2.5rem] p-8 md:p-12 lg:p-14 shadow-2xl relative overflow-hidden space-y-10 border border-emerald-900/40">
        
        {/* ========================================================================= */}
        {/* MAIN SPLIT CONTENT GRID (Wide layout)                                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start relative z-10">
          
          {/* LEFT BRAND SECTION (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Logo + Brand Name */}
            <div 
              onClick={() => setRoute({ page: 'home' })}
              className="flex items-center space-x-3.5 cursor-pointer group w-fit"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden p-1 shadow-lg group-hover:scale-105 transition-transform shrink-0 border border-emerald-700/40">
                <img 
                  src="/logo.png" 
                  alt="DigiLocal Logo" 
                  className="w-full h-full object-contain scale-[1.8]" 
                />
              </div>
              <span className="font-cormorant italic text-3xl sm:text-4xl font-bold text-white group-hover:text-[#C4A066] transition-colors leading-none tracking-tight">
                DigiLocal <span className="text-[#C4A066] font-sans text-xs uppercase tracking-widest block font-bold pt-1 font-normal not-italic">Network</span>
              </span>
            </div>

            {/* Catchy Headline with Green Highlights */}
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-1.5 flex-wrap">
                Your <span className="text-emerald-400 font-extrabold">Society</span>. Your <span className="text-emerald-400 font-extrabold">Vendors</span>. Your <span className="text-emerald-400 font-extrabold">Doorstep</span>.
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed max-w-lg pt-1">
                Connecting gated communities with trusted local vendors through zero-commission WhatsApp ordering.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => setRoute({ page: 'home' })}
                className="px-6 py-2.5 rounded-full border border-emerald-500/50 hover:bg-emerald-500/20 text-white text-xs font-bold transition-all flex items-center space-x-2 backdrop-blur-md"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Find My Society</span>
              </button>

              <button
                onClick={() => setRoute({ page: 'vendorRegister' })}
                className="px-6 py-2.5 rounded-full bg-[#C4A066] hover:bg-amber-400 text-[#0B1610] text-xs font-extrabold transition-all shadow-lg flex items-center space-x-2"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Register Store</span>
              </button>
            </div>

          </div>

          {/* RIGHT LINKS COLUMNS (7 cols total with left border line) */}
          <div className="lg:col-span-7 pt-8 lg:pt-0 border-t lg:border-t-0 lg:border-l border-emerald-800/30 lg:pl-10 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
            
            {/* Column 1: EXPLORE */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-widest font-sans flex items-center gap-1">
                  EXPLORE
                </h4>
                <div className="w-6 h-0.5 bg-[#C4A066]" />
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-emerald-100/80">
                <li>
                  <button 
                    onClick={() => setRoute({ page: 'home' })}
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group"
                  >
                    <MapPin className="w-4 h-4 text-emerald-100/80 group-hover:text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>Find My Society</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setRoute({ page: 'vendorRegister' })}
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group"
                  >
                    <Store className="w-4 h-4 text-emerald-100/80 group-hover:text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>Become a Vendor</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setRoute({ page: 'home', openRequestModal: true, _ts: Date.now() })}
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-100/80 group-hover:text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>Add Your Society</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: SUPPORT */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-widest font-sans">
                  SUPPORT
                </h4>
                <div className="w-6 h-0.5 bg-[#C4A066]" />
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-emerald-100/80">
                <li>
                  <button 
                    onClick={() => onOpenSupportDesk ? onOpenSupportDesk() : navTo('contact-support')}
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group font-bold text-amber-200 cursor-pointer py-0.5"
                  >
                    <Headphones className="w-4 h-4 text-[#C4A066] group-hover:scale-110 transition-transform shrink-0" />
                    <span className="whitespace-nowrap">Support Desk</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onOpenSupportDesk ? onOpenSupportDesk() : navTo('contact-support')}
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-100/80 group-hover:text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>Contact Support (Create Ticket)</span>
                  </button>
                </li>
                <li>
                  <a 
                    href="mailto:support@digilocal.network?subject=DigiLocal%20Support%20Desk%20Inquiry"
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-emerald-100/80 group-hover:text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>Email Support Desk</span>
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => navTo('help-support')}
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-100/80 group-hover:text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>Help & FAQs</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: COMPANY & LEGAL */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-widest font-sans">
                  COMPANY
                </h4>
                <div className="w-6 h-0.5 bg-[#C4A066]" />
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-emerald-100/80">
                <li>
                  <button 
                    onClick={() => navTo('about-us')}
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group"
                  >
                    <Info className="w-4 h-4 text-emerald-100/80 group-hover:text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>About Us</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setRoute({ page: 'zordial' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-white transition-colors flex items-center space-x-2 text-left group font-bold text-[#C4A066]"
                  >
                    <Sparkles className="w-4 h-4 text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>Zordial Technologies ↗</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navTo('privacy-policy')}
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-100/80 group-hover:text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navTo('refund-policy')}
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-100/80 group-hover:text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>Refund Policy</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navTo('terms-and-conditions')}
                    className="hover:text-[#C4A066] transition-colors flex items-center space-x-2 text-left group"
                  >
                    <FileText className="w-4 h-4 text-emerald-100/80 group-hover:text-[#C4A066] shrink-0 group-hover:scale-110 transition-all" />
                    <span>Terms & Conditions</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* HORIZONTAL SEPARATOR LINE */}
        <div className="w-full h-px bg-emerald-800/30 relative z-10" />

        {/* ========================================================================= */}
        {/* BOTTOM BAR: COPYRIGHT | BACK TO TOP                                       */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 pt-1">
          
          {/* Copyright & Mission Subtitle */}
          <div className="text-center md:text-left space-y-0.5">
            <p className="text-xs sm:text-sm font-semibold text-white">
              © {new Date().getFullYear()} DigiLocal Network • Engineered by{' '}
              <button 
                onClick={() => { setRoute({ page: 'zordial' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-[#C4A066] hover:underline font-bold"
              >
                Zordial Technologies
              </button>
            </p>
            <p className="text-xs text-emerald-400 font-medium">Transforming Ideas Into Applications • Built for connected gated communities.</p>
          </div>

          {/* Back To Top Circle Button */}
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full border border-emerald-700/60 bg-[#122218] text-emerald-400 hover:bg-[#C4A066] hover:text-[#0B1610] hover:border-[#C4A066] transition-all flex items-center justify-center shadow-md shrink-0"
            title="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

        </div>

      </div>
    </footer>
  );
}
