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
  Heart,
  Store,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function Footer({ setRoute }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navTo = (tab) => {
    setRoute({ page: 'info', tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-[#18281F] to-[#0f1a14] text-[#F7F4EE] pt-14 pb-8 border-t border-emerald-900/40 mt-16 transition-all">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-800/30">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => setRoute({ page: 'home' })}
              className="cursor-pointer flex items-center space-x-3 group w-fit"
            >
              <img 
                src="/logo.png" 
                alt="DigiLocal Logo" 
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-2xl shadow-lg shadow-black/20 group-hover:scale-105 transition-transform bg-white/10 p-1.5 border border-emerald-700/40" 
              />
              <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-[#C4A066] transition-colors">
                DigiLocal <span className="text-[#C4A066] font-sans text-xs uppercase tracking-widest block font-bold">Network</span>
              </span>
            </div>

            <p className="text-emerald-200/70 text-xs leading-relaxed max-w-sm">
              Empowering residential societies and verified neighborhood vendors with zero-commission direct WhatsApp ordering, transparent delivery, and community trust.
            </p>

            <div className="flex items-center space-x-2 text-xs text-emerald-400/80 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Hyperlocal Network Live & Operational</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-[#C4A066] font-semibold text-xs uppercase tracking-wider mb-4 font-sans flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              <li>
                <button 
                  onClick={() => setRoute({ page: 'home' })}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5"
                >
                  Find My Society
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setRoute({ page: 'vendorRegister' })}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5"
                >
                  Register as Vendor
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setRoute({ page: 'home' })}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5"
                >
                  Request Society Addition
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setRoute({ page: 'admin' })}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5 text-amber-300/90 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C4A066]" /> Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Safety */}
          <div>
            <h4 className="text-[#C4A066] font-semibold text-xs uppercase tracking-wider mb-4 font-sans flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              <li>
                <button 
                  onClick={() => navTo('privacy-policy')}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-emerald-400/60" /> Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navTo('child-security')}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400/60" /> Child Security
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navTo('terms-and-conditions')}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3 text-emerald-400/60" /> Terms & Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navTo('safety-standards')}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400/60" /> Safety Standards
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[#C4A066] font-semibold text-xs uppercase tracking-wider mb-4 font-sans flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" /> Support & FAQs
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              <li>
                <button 
                  onClick={() => navTo('help-support')}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3 h-3 text-emerald-400/60" /> Help & Support
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navTo('contact-support')}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-400/60" /> Contact Support
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navTo('faqs')}
                  className="hover:text-[#C4A066] transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3 h-3 text-emerald-400/60" /> FAQ's
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/50">
          <p>© {new Date().getFullYear()} DigiLocal Network. Built for safe, connected residential communities.</p>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => navTo('privacy-policy')}
              className="hover:text-[#C4A066] transition-colors"
            >
              Privacy
            </button>
            <button 
              onClick={() => navTo('terms-and-conditions')}
              className="hover:text-[#C4A066] transition-colors"
            >
              Terms
            </button>
            <button 
              onClick={() => navTo('faqs')}
              className="hover:text-[#C4A066] transition-colors"
            >
              FAQs
            </button>
            <button
              onClick={scrollToTop}
              className="ml-4 p-2 rounded-full bg-emerald-900/60 hover:bg-[#C4A066] hover:text-[#18281F] text-emerald-200 transition-colors border border-emerald-700/40"
              title="Back to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
