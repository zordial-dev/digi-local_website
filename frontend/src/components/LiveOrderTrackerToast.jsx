import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, Clock, Truck, ChevronRight, X, Sparkles } from 'lucide-react';

export default function LiveOrderTrackerToast({ activeOrder, onClose, onTrackClick }) {
  const [progressStep, setProgressStep] = useState(1);

  useEffect(() => {
    if (!activeOrder) return;
    
    // Simulate order progress over time for interactive demo
    const timer1 = setTimeout(() => setProgressStep(2), 4000);
    const timer2 = setTimeout(() => setProgressStep(3), 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeOrder]);

  if (!activeOrder) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#18281F] text-[#F7F4EE] rounded-3xl p-5 shadow-2xl border border-[#C5A880]/40 relative overflow-hidden backdrop-blur-xl">
        
        {/* Top Glow & Close */}
        <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-[#C4A066] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live Order Tracker
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Details Summary */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-serif font-black text-white">Order #{activeOrder.order_id || 'ORD-9821'}</h4>
            <p className="text-[11px] text-emerald-200/80 font-medium">
              {activeOrder.items?.length || 1} items • ₹{parseFloat(activeOrder.total_amount || 65).toFixed(2)}
            </p>
          </div>
          <span className="px-3 py-1 text-[10px] font-black bg-[#C4A066] text-[#18281F] rounded-full uppercase tracking-wider shadow-sm">
            {progressStep === 1 ? 'Confirmed' : progressStep === 2 ? 'Preparing' : 'Out for Delivery'}
          </span>
        </div>

        {/* 3-Step Progress Bar */}
        <div className="space-y-2 mb-3">
          <div className="grid grid-cols-3 gap-1.5">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${progressStep >= 1 ? 'bg-[#C4A066]' : 'bg-white/20'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${progressStep >= 2 ? 'bg-[#C4A066]' : 'bg-white/20'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${progressStep >= 3 ? 'bg-emerald-400' : 'bg-white/20'}`} />
          </div>

          <div className="flex justify-between text-[10px] font-extrabold text-emerald-200/90 pt-1">
            <span className={progressStep >= 1 ? 'text-[#C4A066]' : ''}>1. Placed</span>
            <span className={progressStep >= 2 ? 'text-[#C4A066]' : ''}>2. Packed</span>
            <span className={progressStep >= 3 ? 'text-emerald-400' : ''}>3. Doorstep Arrival</span>
          </div>
        </div>

        {/* Delivery Address & CTA */}
        <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between text-xs">
          <div className="text-[11px] text-emerald-300 font-medium truncate max-w-[220px]">
            📍 {activeOrder.delivery_address || 'Resident Society Flat'}
          </div>
          {onTrackClick && (
            <button
              onClick={onTrackClick}
              className="text-[11px] font-extrabold text-[#C4A066] hover:text-white flex items-center gap-0.5 transition-colors"
            >
              <span>View Receipt</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
