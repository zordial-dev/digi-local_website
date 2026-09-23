import React, { useState, useEffect } from 'react';
import { Truck, Navigation, ChevronRight, CheckCircle2, Store, Clock, X } from 'lucide-react';
import LiveOrderTrackerModal from './LiveOrderTrackerModal';

export default function LiveOrderTrackerToast({ setRoute }) {
  const [activeOrder, setActiveOrder] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const loadActiveOrder = () => {
    try {
      const stored = localStorage.getItem('digilocal_active_order');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.order_id) {
          // If order is delivered more than 1 hour ago, don't show floating bar
          const rawStatus = (parsed.status || '').toUpperCase();
          if (rawStatus === 'DELIVERED' || rawStatus === 'COMPLETED') {
            const timeDiff = Date.now() - new Date(parsed.order_timestamp || parsed.date || Date.now()).getTime();
            if (timeDiff > 3600000) {
              setActiveOrder(null);
              return;
            }
          }
          setActiveOrder(parsed);
          return;
        }
      }

      // Check latest order from user orders history
      const userOrdersStr = localStorage.getItem('digilocal_user_orders');
      if (userOrdersStr) {
        const userOrders = JSON.parse(userOrdersStr);
        if (Array.isArray(userOrders) && userOrders.length > 0) {
          const latest = userOrders[0];
          const st = (latest.status || '').toUpperCase();
          if (st === 'PLACED' || st === 'PENDING' || st === 'ACCEPTED' || st === 'PREPARING' || st === 'OUT_FOR_DELIVERY') {
            setActiveOrder(latest);
            return;
          }
        }
      }
      setActiveOrder(null);
    } catch (_) {
      setActiveOrder(null);
    }
  };

  useEffect(() => {
    loadActiveOrder();

    const handleStorage = (e) => {
      if (e.key === 'digilocal_active_order' || e.key === 'digilocal_user_orders') {
        loadActiveOrder();
      }
    };

    const handleCustomOrder = (e) => {
      loadActiveOrder();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('digilocal_new_order', handleCustomOrder);
    window.addEventListener('digilocal_order_status_update', handleCustomOrder);

    const interval = setInterval(loadActiveOrder, 4000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('digilocal_new_order', handleCustomOrder);
      window.removeEventListener('digilocal_order_status_update', handleCustomOrder);
      clearInterval(interval);
    };
  }, []);

  if (!activeOrder || isDismissed) return null;

  const rawStatus = (activeOrder.status || 'PLACED').toUpperCase();
  const isDelivered = rawStatus === 'DELIVERED' || rawStatus === 'COMPLETED';
  const isPreparing = rawStatus === 'ACCEPTED' || rawStatus === 'PREPARING' || rawStatus === 'IN_PROGRESS';
  const isOutForDelivery = rawStatus === 'OUT_FOR_DELIVERY' || rawStatus === 'IN_TRANSIT';

  const statusText = isDelivered 
    ? 'Delivered to your doorstep' 
    : isOutForDelivery 
    ? 'Society runner on the way' 
    : isPreparing 
    ? 'Store preparing your items' 
    : 'Order placed • Waiting for store';

  return (
    <>
      {/* Floating Bottom Live Tracker Pill (Swiggy / Zomato style) */}
      <div className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-[99999] animate-in slide-in-from-bottom duration-300 pointer-events-auto">
        <div 
          onClick={() => setIsTrackerOpen(true)}
          className="bg-[#211A19] text-white p-3 sm:p-3.5 rounded-[2rem] border-2 border-[#C8A878] shadow-2xl flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all group"
        >
          {/* Left Pulse Icon & Store Info */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative w-10 h-10 rounded-full bg-[#541D26] border border-[#C8A878]/60 flex items-center justify-center text-white shrink-0">
              <Truck className="w-5 h-5 text-[#C8A878] animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#211A19] animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#211A19]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C8A878] leading-none">
                  {isDelivered ? 'Order Delivered' : 'Live Order Tracking'}
                </span>
                <span className="text-[9px] font-bold text-white/50 font-mono">
                  #{activeOrder.order_id?.toString().slice(-4)}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-black text-white truncate mt-0.5">
                {statusText}
              </p>
              <p className="text-[10px] text-white/70 truncate">
                {activeOrder.store_name || 'Vendor Shop'} • ₹{Number(activeOrder.total_amount || 0).toFixed(2)} ({activeOrder.payment_method || 'COD'})
              </p>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTrackerOpen(true);
              }}
              className="px-3.5 py-2 rounded-full bg-[#C8A878] hover:bg-[#d8bc90] text-[#541D26] font-black text-xs uppercase tracking-wider flex items-center space-x-1 shadow-md transition-all group-hover:translate-x-0.5 cursor-pointer"
            >
              <span>Track</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="w-7 h-7 rounded-full text-white/40 hover:text-white flex items-center justify-center transition-colors"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Swiggy/Zomato Fullscreen / Modal Live Tracker */}
      <LiveOrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        order={activeOrder}
        setRoute={setRoute}
      />
    </>
  );
}
