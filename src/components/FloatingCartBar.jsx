import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function FloatingCartBar({ currentRoute, setRoute }) {
  const [activeCart, setActiveCart] = useState(null);

  const syncCartFromStorage = () => {
    try {
      const storedStr = localStorage.getItem('digilocal_active_cart');
      if (storedStr) {
        const parsed = JSON.parse(storedStr);
        if (parsed && parsed.vendor && Array.isArray(parsed.items) && parsed.items.length > 0) {
          setActiveCart(parsed);
          return;
        }
      }
      setActiveCart(null);
    } catch (_) {
      setActiveCart(null);
    }
  };

  useEffect(() => {
    syncCartFromStorage();

    const handleCartUpdate = (e) => {
      if (e?.detail) {
        setActiveCart(e.detail);
      } else {
        syncCartFromStorage();
      }
    };

    window.addEventListener('digilocal_cart_updated', handleCartUpdate);
    window.addEventListener('storage', syncCartFromStorage);
    
    // Poll every 800ms to guarantee instant visibility on route transitions
    const interval = setInterval(syncCartFromStorage, 800);

    return () => {
      window.removeEventListener('digilocal_cart_updated', handleCartUpdate);
      window.removeEventListener('storage', syncCartFromStorage);
      clearInterval(interval);
    };
  }, []);

  // Hide on auth / admin pages
  if (
    !activeCart ||
    !activeCart.items ||
    activeCart.items.length === 0 ||
    currentRoute?.page === 'login' ||
    currentRoute?.page === 'register' ||
    currentRoute?.page === 'vendorRegister' ||
    currentRoute?.page === 'admin'
  ) {
    return null;
  }

  const totalItemCount = activeCart.items.reduce((s, i) => s + (i.quantity || 1), 0);
  const subtotal = activeCart.items.reduce((s, i) => s + (parseFloat(i.price || 0) * (i.quantity || 1)), 0);

  const handleClick = () => {
    if (activeCart.vendor?.vendor_id) {
      setRoute({
        page: 'vendorStorefront',
        vendorId: activeCart.vendor.vendor_id,
        openCart: true
      });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-auto animate-in slide-in-from-bottom duration-300">
      <button
        onClick={handleClick}
        className="bg-[#541D26] hover:bg-[#6B2732] text-white px-7 py-3.5 rounded-full shadow-2xl border-2 border-[#C8A878]/60 flex items-center space-x-3 text-xs font-black tracking-wider uppercase transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
      >
        <div className="w-7 h-7 rounded-full bg-[#C8A878] flex items-center justify-center text-[#541D26] font-black shrink-0 shadow-sm">
          <ShoppingBag className="w-4 h-4 text-[#541D26]" />
        </div>
        <span className="text-white font-extrabold text-xs">
          VIEW CART ({totalItemCount}) • ₹{subtotal.toFixed(2)}
        </span>
        <ArrowRight className="w-4 h-4 text-[#C8A878] transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
