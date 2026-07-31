import React, { useState } from 'react';
import { Store, ArrowLeft, LogOut, ArrowUpRight, Building2, ShoppingBag, User, LogIn } from 'lucide-react';
import LoginModal from './LoginModal';

export default function Navbar({ currentRoute, setRoute, activeVendor, onVendorLogout }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2.5 rounded-full text-xs font-black bg-primary text-primary-foreground hover:bg-gold hover:text-ink transition-all duration-200 shadow-md flex items-center space-x-1.5 tracking-tight"
            >
              <LogIn className="w-3.5 h-3.5 text-gold" />
              <span>Login</span>
            </button>

            {isHomePage && (
              <button
                onClick={handleVendorButtonClick}
                className="hidden sm:flex px-5 py-2.5 rounded-full text-xs font-bold bg-white text-foreground hover:bg-secondary transition-all duration-200 border border-border shadow-sm items-center space-x-1.5 tracking-tight group"
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

      {/* Login Portal Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        setRoute={setRoute}
      />
    </>
  );
}
