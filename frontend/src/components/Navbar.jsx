import React from 'react';
import { Store, UserCheck, ArrowLeft, LogOut } from 'lucide-react';

export default function Navbar({ currentRoute, setRoute, activeVendor, onVendorLogout }) {
  const isHomePage = currentRoute.page === 'home';
  const isDashboardOrAdmin = currentRoute.page === 'vendorDashboard' || currentRoute.page === 'admin';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#C5A880]/20 shadow-sm px-4 sm:px-8 py-3.5 flex items-center justify-between">
      
      <div className="flex items-center space-x-3">
        {/* Back Button (Shown on all pages EXCEPT Home page) */}
        {!isHomePage && (
          <button
            onClick={handleGoBack}
            className="px-3 py-1.5 rounded-lg bg-[#FAF9F6] hover:bg-[#F6F3EC] text-[#0A1428] border border-[#C5A880]/30 text-xs font-bold flex items-center space-x-1.5 transition-colors uppercase tracking-wider shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#C5A880]" />
            <span>Back</span>
          </button>
        )}

        {/* Brand & Logo */}
        <div 
          onClick={() => setRoute({ page: 'home' })}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <img
            src="/logo.png"
            alt="DigiLocal Logo"
            className="w-10 h-10 object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <h1 className="text-base font-serif font-extrabold tracking-wider text-[#0A1428] uppercase leading-tight">
              Digi<span className="text-[#C5A880]">Local</span>
            </h1>
            <span className="text-[9px] font-bold text-[#C5A880] tracking-widest uppercase">
              Hyperlocal Society Platform
            </span>
          </div>
        </div>
      </div>

      {/* Top Right Action Header Bar */}
      <div className="flex items-center space-x-3">
        {isHomePage && (
          <button
            onClick={handleVendorButtonClick}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] shadow-md transition-all flex items-center space-x-1.5 tracking-wider uppercase"
          >
            <Store className="w-4 h-4 text-[#C5A880]" />
            <span>Login / Register as Vendor</span>
          </button>
        )}

        {isDashboardOrAdmin && (
          <button
            onClick={handleHeaderLogout}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-sm transition-all flex items-center space-x-1.5 tracking-wider uppercase"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Logout</span>
          </button>
        )}
      </div>

    </header>
  );
}
