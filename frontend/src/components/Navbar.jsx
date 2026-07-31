import React, { useState, useEffect } from 'react';
import { Store, ArrowLeft, LogOut, ArrowUpRight, Building2, ShoppingBag, User, LogIn, MapPin, ChevronDown } from 'lucide-react';
import LoginModal from './LoginModal';
import DeliveryLocationModal from './DeliveryLocationModal';

export default function Navbar({ currentRoute, setRoute, activeVendor, onVendorLogout }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const isHomePage = currentRoute.page === 'home';
  const isDashboardOrAdmin = currentRoute.page === 'vendorDashboard' || currentRoute.page === 'admin';

  // Load saved delivery location from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('digilocal_delivery_location');
      if (saved) {
        setSelectedLocation(JSON.parse(saved));
      }
    } catch (_) {}
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
    } catch (_) {}
    setRoute({ page: 'vendorRegister' });
  };

  const handleHeaderLogout = () => {
    localStorage.removeItem('digilocal_vendor_session');
    if (onVendorLogout) onVendorLogout();
    setRoute({ page: 'home' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Left Brand Identity */}
          <div className="flex items-center space-x-3">
            {!isHomePage && (
              <button 
                onClick={handleGoBack} 
                className="w-9 h-9 rounded-full bg-secondary hover:bg-border text-foreground flex items-center justify-center transition-colors border border-border shadow-sm"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div 
              onClick={() => setRoute({ page: 'home' })}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#18281F] flex items-center justify-center border border-[#E4DCC9]/30 p-2 shadow-md group-hover:scale-105 transition-transform">
                <img 
                  src="/logo.png" 
                  alt="DigiLocal Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-lg sm:text-xl font-serif font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                    DIGILOCAL
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Center Navigation Items */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-wide text-foreground/80">
            <button 
              onClick={() => setRoute({ page: 'home' })}
              className={`hover:text-foreground transition-colors py-1 ${isHomePage ? 'font-black text-foreground border-b-2 border-foreground' : ''}`}
            >
              Societies
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('societies-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-foreground transition-colors py-1"
            >
              Vendors
            </button>
            <button 
              onClick={() => setRoute({ page: 'info', tab: 'help-support' })}
              className="hover:text-foreground transition-colors py-1"
            >
              How It Works
            </button>
          </nav>

          {/* Top Right Action Buttons */}
          <div className="flex items-center space-x-2.5">
            
            {/* 1. Enter Your Delivery Location Pill */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden lg:flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#E4ECE4] hover:bg-[#D6E3D6] text-[#18281F] border border-[#18281F]/10 transition-all shadow-sm group max-w-[240px] truncate"
              title={selectedLocation?.label || "Enter your delivery location"}
            >
              <MapPin className="w-3.5 h-3.5 text-[#18281F] fill-[#18281F]/20 shrink-0" />
              <span className="truncate">
                {selectedLocation?.label || "Enter your delivery location"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#18281F]/70 group-hover:translate-y-0.5 transition-transform shrink-0" />
            </button>

            {/* 2. Sign In Pill */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#18281F] text-white hover:bg-[#243A2D] transition-all shadow-md flex items-center space-x-1.5 tracking-tight"
            >
              <LogIn className="w-3.5 h-3.5 text-[#C4A066]" />
              <span>Sign in</span>
            </button>

            {/* 3. Vendor Portal Pill */}
            {isHomePage && (
              <button
                onClick={handleVendorButtonClick}
                className="hidden sm:flex px-5 py-2.5 rounded-full text-xs font-bold bg-white text-ink hover:bg-secondary transition-all duration-200 border border-slate-300 shadow-sm items-center space-x-1.5 tracking-tight group"
              >
                <Store className="w-3.5 h-3.5 text-ink" />
                <span>Vendor Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-muted-foreground" />
              </button>
            )}

            {isDashboardOrAdmin && (
              <button
                onClick={handleHeaderLogout}
                className="px-4 py-2 rounded-full text-xs font-extrabold bg-rose-500/10 border border-rose-500/30 text-rose-700 hover:bg-rose-500 hover:text-white transition-all flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Delivery Location Selector Modal */}
      <DeliveryLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        setRoute={setRoute}
      />

      {/* Login Portal Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        setRoute={setRoute}
      />
    </>
  );
}
