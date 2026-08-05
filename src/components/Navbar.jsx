import React, { useState, useEffect } from 'react';
import { Store, ArrowLeft, LogOut, Building2, BookOpen, HelpCircle, ArrowUpRight, User } from 'lucide-react';

export default function Navbar({ currentRoute, setRoute, activeVendor, onVendorLogout, activeUser, onUserLogout, onOpenLogin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = currentRoute?.page === 'home';
  const isDashboardOrAdmin = currentRoute?.page === 'vendorDashboard' || currentRoute?.page === 'admin';
  const isProfilePage = currentRoute?.page === 'profile';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setRoute({ page: 'home' });
    }
  };

  const handleVendorButtonClick = () => {
    try {
      const savedSession = localStorage.getItem('digilocal_vendor_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.vendor && parsed.vendor.vendor_id && parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setRoute({ page: 'vendorDashboard', vendorId: parsed.vendor.vendor_id });
          return;
        }
      }
    } catch (_) { }
    setRoute({ page: 'login', tab: 'vendor' });
  };

  const handleHeaderVendorLogout = () => {
    localStorage.removeItem('digilocal_vendor_session');
    localStorage.removeItem('digilocal_active_order');
    if (onVendorLogout) onVendorLogout();
    setRoute({ page: 'home' });
  };

  const handleHeaderUserLogout = () => {
    localStorage.removeItem('digilocal_user_session');
    localStorage.removeItem('digilocal_resident_session');
    localStorage.removeItem('digilocal_active_order');
    if (onUserLogout) onUserLogout();
    setRoute({ page: 'home' });
  };

  const isSocietiesActive = isHomePage && (!currentRoute.tab || currentRoute.tab === 'societies');
  const isVendorsActive = currentRoute?.page === 'societyVendors' || currentRoute?.page === 'vendorStorefront';
  const isOurStoryActive = currentRoute?.page === 'info' && currentRoute?.tab === 'about-us';
  const isHowItWorksActive = currentRoute?.page === 'info' && currentRoute?.tab === 'how-it-works';
  const isVendorPortalActive = currentRoute?.page === 'vendorRegister' || currentRoute?.page === 'vendorDashboard' || (currentRoute?.page === 'login' && (currentRoute?.tab === 'vendor' || currentRoute?.accountType === 'vendor'));

  // Check active user session
  let currentUser = activeUser;
  if (!currentUser) {
    try {
      const saved = localStorage.getItem('digilocal_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.user || parsed.name) && parsed.expiresAt > Date.now()) {
          currentUser = parsed.user || parsed;
        }
      } else {
        const savedRes = localStorage.getItem('digilocal_resident_session');
        if (savedRes) currentUser = JSON.parse(savedRes);
      }
    } catch (_) {}
  }

  // Check active vendor session
  let currentVendor = activeVendor;
  if (!currentVendor) {
    try {
      const saved = localStorage.getItem('digilocal_vendor_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.vendor && parsed.expiresAt > Date.now()) {
          currentVendor = parsed.vendor;
        }
      }
    } catch (_) {}
  }

  return (
    <>
      {/* Top Header Navbar */}
      <header className="w-full bg-[#EDEDE4] pt-2 sm:pt-3 px-1.5 sm:px-3 lg:px-4 font-sans">
        {isHomePage ? (
          /* MAIN HOME PAGE HEADER: Curvy Clean Bento Header */
          <div className="max-w-[1440px] mx-auto bg-[#34533C] text-white rounded-t-[2.5rem] sm:rounded-t-[2.8rem] lg:rounded-t-[3rem] relative pt-3 sm:pt-3.5 px-3 sm:px-4 lg:px-5 pb-0 shadow-md overflow-hidden">
            <div className="flex items-center justify-between min-h-[56px] sm:min-h-[60px] relative">
              {/* LEFT: Curvy Off-White Logo Tab */}
              <div className="flex items-center space-x-3 self-stretch z-10 shrink-0">
                <div 
                  className="flex items-center relative cursor-pointer select-none group h-full" 
                  onClick={() => setRoute({ page: 'home' })}
                >
                  <div className="relative flex items-center h-full min-w-[190px] sm:min-w-[230px]">
                    {/* SVG for Off-White Background Tab with Smooth Concentric Curves */}
                    <svg 
                      className="absolute inset-0 w-full h-full pointer-events-none" 
                      viewBox="0 0 240 56" 
                      preserveAspectRatio="none"
                    >
                      <path 
                        d="M 22 0 H 160 C 190 0, 190 56, 230 56 H 0 V 22 A 22 22 0 0 1 22 0 Z" 
                        fill="#EDEDE4" 
                      />
                    </svg>

                    {/* Logo Icon and Text */}
                    <div className="relative z-10 flex items-center space-x-2 sm:space-x-2.5 pl-4 sm:pl-5 pr-6 sm:pr-8 py-2.5 my-auto">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                        <img 
                          src="/logo.png" 
                          alt="DigiLocal Logo" 
                          className="w-full h-full object-contain scale-[2.3] mix-blend-multiply" 
                        />
                      </div>

                      <span className="font-cormorant italic text-xl sm:text-2xl lg:text-3xl font-bold text-[#1E3623] leading-none tracking-tight">
                        DigiLocal
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER: Top Navigation Links (Vertically Centered in Green Bar) */}
              <nav className={`hidden lg:flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm font-medium my-auto py-2 transition-all duration-400 ${
                isScrolled ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
              }`}>
                <button
                  onClick={() => setRoute({ page: 'home' })}
                  className="px-4 sm:px-6 py-2 rounded-full bg-[#EDEDE4] text-[#1E3623] font-bold shadow-sm"
                >
                  Societies
                </button>

                <button
                  onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
                  className="px-4 sm:px-6 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  Vendors
                </button>

                <button
                  onClick={() => setRoute({ page: 'info', tab: 'about-us' })}
                  className="px-4 sm:px-6 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  Our Story
                </button>

                <button
                  onClick={() => setRoute({ page: 'info', tab: 'how-it-works' })}
                  className="px-4 sm:px-6 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  How It Works
                </button>
              </nav>

              {/* RIGHT: User Profile / Vendor Portal / Single Logout Button */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 my-auto py-2 z-10 shrink-0">
                {currentUser ? (
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <button
                      onClick={() => setRoute({ page: 'profile' })}
                      className="bg-[#E6C35C] hover:bg-[#d8b34c] text-[#0B150D] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center space-x-1.5 text-xs font-black transition-all shadow-md hover:scale-105 shrink-0"
                    >
                      <User className="w-4 h-4 text-[#0B150D]" />
                      <span className="truncate max-w-[100px] sm:max-w-[120px]">{currentUser.name || currentUser.userName || 'My Profile'}</span>
                    </button>

                    <button
                      onClick={handleHeaderUserLogout}
                      title="Log Out User"
                      className="p-1.5 sm:p-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition-colors shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : currentVendor ? (
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <button
                      onClick={() => setRoute({ page: 'vendorDashboard', vendorId: currentVendor.vendor_id })}
                      className="bg-[#0B150D] hover:bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#E6C35C]/30 flex items-center space-x-1.5 text-xs font-bold transition-all shadow-md shrink-0"
                    >
                      <Store className="w-3.5 h-3.5 text-[#E6C35C]" />
                      <span className="truncate max-w-[100px] sm:max-w-[120px]">{currentVendor.store_name || 'My Store'}</span>
                    </button>

                    <button
                      onClick={handleHeaderVendorLogout}
                      title="Log Out Vendor"
                      className="p-1.5 sm:p-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition-colors shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <button
                      onClick={() => setRoute({ page: 'login' })}
                      className="bg-[#E6C35C] hover:bg-[#d8b34c] text-[#0B150D] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center space-x-1 text-xs font-black transition-all shadow-md hover:scale-105 shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5 rotate-180 text-[#0B150D]" />
                      <span>Log In</span>
                    </button>

                    <button
                      onClick={handleVendorButtonClick}
                      className="bg-[#0B150D] hover:bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 flex items-center space-x-1.5 text-xs font-semibold transition-all shadow-md group shrink-0"
                    >
                      <Store className="w-3.5 h-3.5 text-[#E6C35C]" />
                      <span className="whitespace-nowrap">Vendor Portal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* OTHER PAGES HEADER: Dedicated Clean Bento Bar Header */
          <div className="max-w-[1440px] mx-auto bg-[#34533C] text-white rounded-[2rem] sm:rounded-[2.5rem] p-2.5 sm:p-3 shadow-md mb-6 flex items-center justify-between overflow-hidden">
            {/* Left: Back Button + Clean Logo Badge */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <button
                onClick={handleGoBack}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0D1910] hover:bg-black text-white flex items-center justify-center transition-all border border-white/15 shadow-sm group shrink-0"
                title="Go Back"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div 
                onClick={() => setRoute({ page: 'home' })}
                className="flex items-center space-x-2 sm:space-x-2.5 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 overflow-hidden bg-white/90 rounded-full p-1 group-hover:scale-105 transition-transform">
                  <img 
                    src="/logo.png" 
                    alt="DigiLocal Logo" 
                    className="w-full h-full object-contain scale-[1.8]" 
                  />
                </div>
                <span className="font-cormorant italic text-lg sm:text-2xl font-bold text-white leading-none tracking-tight">
                  DigiLocal
                </span>
              </div>
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium mx-auto">
              <button
                onClick={() => setRoute({ page: 'home' })}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all duration-200 ${
                  isSocietiesActive
                    ? 'bg-[#EDEDE4] text-[#1E3623] font-bold shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                Societies
              </button>

              <button
                onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all duration-200 ${
                  isVendorsActive
                    ? 'bg-[#EDEDE4] text-[#1E3623] font-bold shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                Vendors
              </button>

              <button
                onClick={() => setRoute({ page: 'info', tab: 'about-us' })}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all duration-200 ${
                  isOurStoryActive
                    ? 'bg-[#EDEDE4] text-[#1E3623] font-bold shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                Our Story
              </button>

              <button
                onClick={() => setRoute({ page: 'info', tab: 'how-it-works' })}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all duration-200 ${
                  isHowItWorksActive
                    ? 'bg-[#EDEDE4] text-[#1E3623] font-bold shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                How It Works
              </button>
            </nav>

            {/* Right: Profile / Vendor Portal / Unified Single Logout Button */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {currentUser ? (
                <button
                  onClick={() => setRoute({ page: 'profile' })}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 flex items-center space-x-1.5 text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 ${
                    isProfilePage
                      ? 'bg-[#EDEDE4] text-[#1E3623]'
                      : 'bg-[#E6C35C] text-[#0B150D] hover:bg-[#d8b34c]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[110px]">{currentUser.name || currentUser.userName || 'Profile'}</span>
                </button>
              ) : (
                <button
                  onClick={handleVendorButtonClick}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 flex items-center space-x-1.5 text-xs sm:text-sm font-semibold transition-all shadow-md group shrink-0 ${
                    isVendorPortalActive
                      ? 'bg-[#EDEDE4] text-[#1E3623] font-bold'
                      : 'bg-[#0B150D] hover:bg-black text-white'
                  }`}
                >
                  <Store className={`w-3.5 h-3.5 shrink-0 ${isVendorPortalActive ? 'text-[#1E3623]' : 'text-white'}`} />
                  <span className="whitespace-nowrap">Vendor Portal</span>
                  <span className={`font-bold text-xs sm:text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ml-0.5 ${
                    isVendorPortalActive ? 'text-[#1E3623]' : 'text-[#E6C35C]'
                  }`}>
                    ↗
                  </span>
                </button>
              )}

              {(currentUser || currentVendor || isDashboardOrAdmin) && (
                <button
                  onClick={currentUser ? handleHeaderUserLogout : handleHeaderVendorLogout}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-rose-500/20 border border-rose-400/30 text-rose-200 hover:bg-rose-500 hover:text-white transition-all flex items-center space-x-1.5 shrink-0 whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* FLOATING LEFT VERTICAL PANEL DOCK (Appears smoothly on scroll) */}
      <div 
        className={`fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ease-out ${
          isScrolled 
            ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto' 
            : '-translate-x-12 opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <div className="bg-[#14261C]/90 backdrop-blur-xl border border-white/20 p-2 rounded-full shadow-2xl flex flex-col items-center space-y-2 text-xs">
          
          {/* Societies */}
          <button
            onClick={() => setRoute({ page: 'home' })}
            className={`relative group p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
              isSocietiesActive
                ? 'bg-[#EDEDE4] text-[#1E3623] shadow-md font-bold'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span className="absolute left-full ml-3 px-3 py-1 bg-[#0D1910] text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
              Societies
            </span>
          </button>

          {/* User Profile */}
          {currentUser && (
            <button
              onClick={() => setRoute({ page: 'profile' })}
              className={`relative group p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                isProfilePage
                  ? 'bg-[#E6C35C] text-[#0B150D] shadow-md font-bold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="absolute left-full ml-3 px-3 py-1 bg-[#0D1910] text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                My Profile
              </span>
            </button>
          )}

          {/* Vendors */}
          <button
            onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
            className="relative group p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center"
          >
            <Store className="w-4 h-4" />
            <span className="absolute left-full ml-3 px-3 py-1 bg-[#0D1910] text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
              Vendors
            </span>
          </button>

          {/* Our Story */}
          <button
            onClick={() => setRoute({ page: 'info', tab: 'about-us' })}
            className="relative group p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center"
          >
            <BookOpen className="w-4 h-4" />
            <span className="absolute left-full ml-3 px-3 py-1 bg-[#0D1910] text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
              Our Story
            </span>
          </button>

          {/* How It Works */}
          <button
            onClick={() => setRoute({ page: 'info', tab: 'how-it-works' })}
            className="relative group p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="absolute left-full ml-3 px-3 py-1 bg-[#0D1910] text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
              How It Works
            </span>
          </button>

          {/* Divider */}
          <div className="w-6 h-px bg-white/20 my-1" />

          {/* Vendor Portal Button */}
          {isHomePage && (
            <button
              onClick={handleVendorButtonClick}
              className="relative group p-3 rounded-full bg-[#0B150D] text-white hover:bg-black transition-all duration-200 flex items-center justify-center border border-white/10 shadow-md"
            >
              <ArrowUpRight className="w-4 h-4 text-[#E6C35C]" />
              <span className="absolute left-full ml-3 px-3 py-1 bg-[#0D1910] text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 flex items-center gap-1">
                Vendor Portal <span className="text-[#E6C35C]">↗</span>
              </span>
            </button>
          )}

        </div>
      </div>
    </>
  );
}
