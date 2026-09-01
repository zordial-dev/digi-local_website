import React from 'react';
import { 
  Building2, 
  ExternalLink, 
  Globe, 
  Code2, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Store,
  MessageSquare,
  Server
} from 'lucide-react';
import ZordialLogo from '../components/ZordialLogo';

export default function ZordialPartnerPage({ setRoute }) {
  return (
    <div className="min-h-screen bg-[#F6EDDA] pt-4 pb-20 px-3 sm:px-6 lg:px-8 font-sans text-[#182421]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setRoute({ page: 'home' })}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white hover:bg-[#EEE5DA] text-[#211A19] text-xs font-bold transition-all shadow-sm border border-[#E5DAD0] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#541D26]" />
            <span>Back to DigiLocal Home</span>
          </button>

          <a
            href="https://zordial.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white text-xs font-extrabold transition-all shadow-md cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#C8A878]" />
            <span>Visit Zordial Official Website (zordial.com) ↗</span>
          </a>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* HERO SECTION: Bento Card with Dark Theme & Zordial Branding   */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#211A19] text-white rounded-[2.5rem] p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden border border-white/10">
          
          {/* Subtle Decorative Lighting & Glow Gradients in Theme Nude & Gold */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D6B7A5]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C8A878]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Partnership & Parent Company Info */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-extrabold text-[#C8A878]">
                <Sparkles className="w-4 h-4 text-[#C8A878]" />
                <span>Parent Engineering & Tech Partner</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-tight">
                  Engineered & Powered by <span className="text-[#E6C35C]">Zordial Technologies</span>
                </h1>
                <p className="text-sm sm:text-base text-emerald-100/80 font-medium leading-relaxed max-w-2xl">
                  DigiLocal is built and powered by <strong>Zordial</strong> — a premier software technology company specializing in transforming ambitious ideas into enterprise-grade applications.
                </p>
              </div>

              {/* Company Quick Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1 backdrop-blur-xs">
                  <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block">Company Name</span>
                  <span className="text-sm font-black text-white">Zordial</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1 backdrop-blur-xs">
                  <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block">Official Website</span>
                  <a href="https://zordial.com" target="_blank" rel="noopener noreferrer" className="text-sm font-black text-[#E6C35C] hover:underline flex items-center gap-1">
                    zordial.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1 backdrop-blur-xs">
                  <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block">Company Tagline</span>
                  <span className="text-xs font-black text-amber-300">Transforming Ideas Into Applications..</span>
                </div>
              </div>

              {/* Action Link to Official Website */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="https://zordial.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full bg-[#C4A066] hover:bg-amber-400 text-[#0B150D] font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
                >
                  <span>Explore Zordial Products & Solutions</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setRoute({ page: 'home' })}
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all cursor-pointer"
                >
                  Explore DigiLocal Platform
                </button>
              </div>

            </div>

            {/* Right Column: Unaltered Zordial Official Logo Container */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-2xl border-4 border-[#E6C35C]/40 max-w-md w-full text-center space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Official Brand Mark
                </span>
                
                {/* Official Unaltered Logo Graphic */}
                <div className="py-2">
                  <ZordialLogo className="w-full h-auto mx-auto" />
                </div>

                <div className="pt-2 border-t border-border text-center">
                  <span className="text-[11px] font-bold text-muted-foreground block">
                    ZORDIAL TECHNOLOGIES PRIVATE LIMITED
                  </span>
                  <a
                    href="https://zordial.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-extrabold text-emerald-800 hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    https://zordial.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 2: HOW DIGILOCAL IS LINKED WITH ZORDIAL (ARCHITECTURE) */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-border space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Product Link & Integration Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1E3623]">
              The Link Between DigiLocal and Zordial
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed font-medium">
              DigiLocal was conceived, architected, and engineered by <strong>Zordial</strong> to solve hyperlocal e-commerce for gated residential societies. Zordial provides the underlying core technology stack that powers DigiLocal.
            </p>
          </div>

          {/* 4 Architectural Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-3 hover:border-[#1E3623] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-100">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-ink">Multi-Tenant Gated Society Mesh</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Engineered by Zordial to instantly map gated societies, resident flat numbers, and verified community vendors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-3 hover:border-[#1E3623] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#E6C35C]/20 text-amber-900 flex items-center justify-center font-bold border border-[#E6C35C]/30">
                <MessageSquare className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="font-serif font-bold text-lg text-ink">WhatsApp Order Routing Engine</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zordial’s zero-commission order gateway routes resident orders directly to store merchants via formatted WhatsApp messages.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-3 hover:border-[#1E3623] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-100">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-ink">Real-time REST & JSON DB Server</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Custom Node REST server framework built by Zordial with file-backed JSON database persistence & SLA tracking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-border space-y-3 hover:border-[#1E3623] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#E6C35C]/20 text-amber-900 flex items-center justify-center font-bold border border-[#E6C35C]/30">
                <ShieldCheck className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="font-serif font-bold text-lg text-ink">Store Settlement & Merchant Portal</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Comprehensive vendor management dashboard providing catalog editing, store hours control, and order fulfillment tracking.
              </p>
            </div>

          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 3: COMPANY SPECIFICATION & DIRECT WEBSITE LINK CARD  */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-md border border-border space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <span className="text-xs font-bold text-[#541D26] uppercase tracking-wider">Company Profile</span>
              <h3 className="text-2xl font-serif font-bold text-[#211A19] mt-1">About Zordial Technologies</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Transforming Ideas Into Applications Across Web, Cloud & Mobile Ecosystems</p>
            </div>

            <a
              href="https://zordial.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-[#C8A878] font-extrabold text-xs uppercase tracking-wider shadow-sm flex items-center space-x-2 shrink-0 border border-[#C8A878]/30 cursor-pointer"
            >
              <span>zordial.com</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-muted-foreground font-medium">
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-ink">Company Overview</h4>
              <p>
                <strong>Zordial</strong> is a digital innovation firm that builds cutting-edge web applications, mobile platforms, and enterprise cloud solutions. Guided by their core vision — <em>"Transforming Ideas Into Applications"</em> — Zordial partners with startups and established enterprises to deliver high-impact software.
              </p>
              <p>
                From rapid prototyping to scalable production architectures, Zordial specializes in modern JavaScript stacks, real-time messaging integrations, and high-performance databases.
              </p>
            </div>

            <div className="space-y-3 bg-secondary/30 p-5 rounded-2xl border border-border">
              <h4 className="font-serif font-bold text-sm text-ink">Key Company Details</h4>
              <ul className="space-y-2">
                <li className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="font-bold text-ink">Legal Company Name:</span>
                  <span className="font-mono text-ink">Zordial Technologies</span>
                </li>
                <li className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="font-bold text-ink">Official Website:</span>
                  <a href="https://zordial.com" target="_blank" rel="noopener noreferrer" className="text-[#541D26] font-bold hover:underline">https://zordial.com</a>
                </li>
                <li className="flex items-center justify-between border-b border-border/60 pb-1.5">
                  <span className="font-bold text-ink">Core Expertise:</span>
                  <span>Full-Stack Web & Mobile Apps</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-bold text-ink">Flagship Product:</span>
                  <span className="font-bold text-[#541D26]">DigiLocal Hyperlocal Platform</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="bg-[#541D26] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#C8A878]/30">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif font-bold text-base text-white">Have a project idea to transform into an application?</h4>
              <p className="text-xs text-[#EEE5DA]/80">Connect with the engineering team at Zordial Technologies.</p>
            </div>

            <a
              href="https://zordial.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-[#C8A878] hover:bg-[#d8be92] text-[#211A19] font-extrabold text-xs uppercase tracking-wider shadow-md shrink-0 flex items-center space-x-2 cursor-pointer"
            >
              <span>Visit Zordial.com</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
