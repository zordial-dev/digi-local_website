import React from 'react';
import { Store, ArrowLeft, LogOut, ArrowUpRight, Sparkles, Building2, ShoppingBag } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          {!isHomePage && (
            <button
              onClick={handleGoBack}
              className="px-3 py-1.5 rounded-full bg-secondary hover:bg-border text-foreground text-xs font-bold flex items-center space-x-1.5 transition-all border border-border"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <div 
            onClick={() => setRoute({ page: 'home' })}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            {/* Sparkle Logo Icon */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-foreground fill-foreground" />
            </div>

            <div className="flex items-center">
              <h1 className="text-xl font-serif font-black tracking-wider uppercase text-foreground">
                DIGILOCAL
              </h1>
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
            onClick={() => {
              const el = document.getElementById('societies-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-foreground transition-colors py-1"
          >
            Our Story
          </button>
          <button 
            onClick={() => setRoute({ page: 'info', tab: 'help-support' })}
            className="hover:text-foreground transition-colors py-1"
          >
            How It Works
          </button>
        </nav>

        {/* Top Right Action Button */}
        <div className="flex items-center space-x-2">
          {isHomePage && (
            <button
              onClick={handleVendorButtonClick}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-foreground hover:bg-secondary transition-all duration-200 border border-border shadow-sm flex items-center space-x-1.5 tracking-tight group"
            >
              <Store className="w-3.5 h-3.5 text-foreground" />
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
  );
}


