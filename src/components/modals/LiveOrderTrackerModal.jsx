import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Truck, MapPin, Store, CheckCircle2, Clock, Phone, 
  ShieldCheck, ShoppingBag, Navigation, ChevronDown, 
  Sparkles, ExternalLink, RefreshCw, AlertCircle, ChefHat,
  PackageCheck, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export default function LiveOrderTrackerModal({ isOpen, onClose, order, initialOrder, setRoute }) {
  const currentInitial = order || initialOrder;
  const [activeOrder, setActiveOrder] = useState(currentInitial || null);
  const [showItemDetails, setShowItemDetails] = useState(true);

  const activeOrderRef = useRef(activeOrder);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    activeOrderRef.current = activeOrder;
  }, [activeOrder]);

  const isMatchingOrderId = (idA, idB) => {
    if (!idA || !idB) return false;
    const cleanA = String(idA).replace(/^ORD[-_]?/i, '').trim().toLowerCase();
    const cleanB = String(idB).replace(/^ORD[-_]?/i, '').trim().toLowerCase();
    return cleanA === cleanB || String(idA).trim().toLowerCase() === String(idB).trim().toLowerCase();
  };

  const syncLatestStatus = async (candidateOrder) => {
    if (isFetchingRef.current) return;
    const target = candidateOrder || activeOrderRef.current;
    if (!target) return;
    const targetId = target.order_id || target.id;
    if (!targetId) return;

    const currentStatusUpper = String(target.status || target.order_status || '').toUpperCase();
    if (currentStatusUpper === 'COMPLETED' || currentStatusUpper === 'DELIVERED' || currentStatusUpper === 'CANCELLED') {
      return; // No need to poll completed orders
    }

    try {
      isFetchingRef.current = true;
      const res = await api.getOrderStatus(targetId);
      if (res && res.order && res.order.status) {
        const liveOrder = res.order;
        const liveStatus = liveOrder.status;
        setActiveOrder(prev => ({
          ...prev,
          ...liveOrder,
          status: liveStatus,
          order_status: liveStatus,
          items: Array.isArray(res.items) && res.items.length > 0 ? res.items : (prev?.items || [])
        }));
        api._updateLocalOrderStatus(targetId, liveStatus);
        return;
      }
    } catch (_) {
    } finally {
      isFetchingRef.current = false;
    }

    // 2. Offline Fallback to local storage
    const keys = [
      'digilocal_active_order',
      'digilocal_user_orders',
      'digilocal_all_vendor_orders',
      'digilocal_past_orders'
    ];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('digilocal_vendor_orders_') || k.startsWith('digilocal_vendor_purchases_'))) {
          keys.push(k);
        }
      }
    } catch (_) {}

    for (const k of keys) {
      try {
        const val = localStorage.getItem(k);
        if (!val) continue;
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          const found = parsed.find(o => isMatchingOrderId(o?.order_id || o?.id, targetId));
          if (found && found.status) {
            setActiveOrder(prev => ({
              ...prev,
              ...found,
              status: found.status,
              order_status: found.status
            }));
            return;
          }
        } else if (parsed && typeof parsed === 'object') {
          if (isMatchingOrderId(parsed.order_id || parsed.id, targetId) && parsed.status) {
            setActiveOrder(prev => ({
              ...prev,
              ...parsed,
              status: parsed.status,
              order_status: parsed.status
            }));
            return;
          }
        }
      } catch (_) {}
    }
  };

  // Sync active order from props once on open
  useEffect(() => {
    if (!isOpen) return;

    if (currentInitial) {
      setActiveOrder(currentInitial);
      syncLatestStatus(currentInitial);
    } else {
      try {
        const stored = localStorage.getItem('digilocal_active_order');
        if (stored) {
          const parsed = JSON.parse(stored);
          setActiveOrder(parsed);
          syncLatestStatus(parsed);
        }
      } catch (_) {}
    }
  }, [isOpen, currentInitial?.order_id || currentInitial?.id]);

  // Real-time status update listener across tabs and events
  useEffect(() => {
    if (!isOpen) return;

    const handleStorage = () => {
      syncLatestStatus();
    };

    const handleCustomStatus = (e) => {
      if (e?.detail && isMatchingOrderId(e.detail.order_id, activeOrderRef.current?.order_id || activeOrderRef.current?.id)) {
        setActiveOrder(prev => ({
          ...prev,
          status: e.detail.status,
          order_status: e.detail.status
        }));
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('digilocal_order_status_update', handleCustomStatus);

    // Controlled 6-second polling only while modal is open and order is active
    const interval = setInterval(() => {
      syncLatestStatus();
    }, 6000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('digilocal_order_status_update', handleCustomStatus);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen || !activeOrder) return null;

  const rawStatus = String(activeOrder.status || activeOrder.order_status || 'PLACED').toUpperCase();
  const isCancelled = ['CANCELLED', 'CANCELED', 'REJECTED', 'DECLINED', 'FAILED'].includes(rawStatus);
  const isDelivered = ['DELIVERED', 'COMPLETED', 'COMPLETE', 'FULFILLED', 'DONE'].includes(rawStatus);
  const isOutForDelivery = ['OUT_FOR_DELIVERY', 'IN_PROGRESS', 'PROCESSING', 'IN_TRANSIT'].includes(rawStatus);
  const isAccepted = ['ACCEPTED', 'ACCEPT', 'CONFIRMED', 'PREPARING'].includes(rawStatus);
  const isPreparing = isAccepted;
  const isPendingPayment = rawStatus === 'PENDING';
  const isPlaced = !isAccepted && !isOutForDelivery && !isDelivered && !isCancelled && !isPendingPayment;

  // Determine active step index (-1 to 3)
  let stepIndex = 0;
  if (isPendingPayment || isPlaced) stepIndex = 0;
  else if (isAccepted) stepIndex = 1;
  else if (isOutForDelivery) stepIndex = 2;
  else if (isDelivered) stepIndex = 3;
  else if (isCancelled) stepIndex = -1;
  const currentStep = stepIndex;

  // Recommended Palette Status Badge
  let statusBadge = {
    label: 'Order Placed',
    color: 'bg-[#EFF6FF] text-[#1D4ED8] border-blue-200',
    dot: 'bg-[#1D4ED8] animate-pulse',
    eta: 'Awaiting Vendor Review',
    subtitle: `Waiting for ${activeOrder.store_name || 'vendor'} to review and accept order.`
  };

  if (isPendingPayment) {
    statusBadge = {
      label: 'Payment Pending',
      color: 'bg-[#FFFBEB] text-[#B45309] border-amber-200',
      dot: 'bg-[#B45309] animate-pulse',
      eta: 'Awaiting Payment',
      subtitle: 'Complete payment on Cashfree gateway to confirm your order.'
    };
  } else if (rawStatus === 'CONFIRMED') {
    statusBadge = {
      label: 'Confirmed',
      color: 'bg-[#ECFDF5] text-[#047857] border-emerald-200',
      dot: 'bg-[#047857]',
      eta: 'Payment Confirmed',
      subtitle: `Payment verified. Awaiting ${activeOrder.store_name || 'store'} acceptance.`
    };
  } else if (isAccepted) {
    statusBadge = {
      label: 'Accepted / Preparing',
      color: 'bg-[#F0FDF4] text-[#15803D] border-green-200',
      dot: 'bg-[#15803D] animate-pulse',
      eta: '⚡ ~10 – 14 Mins',
      subtitle: `${activeOrder.store_name || 'Store'} accepted your order and is packing fresh items.`
    };
  } else if (isOutForDelivery) {
    statusBadge = {
      label: 'Out for Delivery',
      color: 'bg-[#F5F3FF] text-[#6D28D9] border-purple-200',
      dot: 'bg-[#6D28D9] animate-ping',
      eta: '⚡ ~5 – 8 Mins',
      subtitle: 'Society delivery runner picked up your order and is heading to your flat.'
    };
  } else if (isDelivered) {
    statusBadge = {
      label: 'Delivered',
      color: 'bg-[#ECFDF5] text-[#059669] border-emerald-300',
      dot: 'bg-[#059669]',
      eta: '🎉 Delivered at Door',
      subtitle: `Your order was delivered to ${activeOrder.delivery_address || 'your flat'}. Enjoy!`
    };
  } else if (isCancelled) {
    statusBadge = {
      label: 'Cancelled',
      color: 'bg-[#FEF2F2] text-[#B91C1C] border-rose-200',
      dot: 'bg-[#B91C1C]',
      eta: 'Order Cancelled',
      subtitle: 'This order was cancelled by the store or resident.'
    };
  }

  // Progress Bar Percentage
  let progressWidth = '15%';
  if (isAccepted) progressWidth = '45%';
  if (isOutForDelivery) progressWidth = '75%';
  if (isDelivered) progressWidth = '100%';

  const steps = [
    {
      title: 'Order Placed',
      desc: isPendingPayment ? 'Online transaction pending' : (isPlaced ? 'Order received, awaiting merchant acceptance' : 'Order placed & verified'),
      time: activeOrder.order_timestamp || activeOrder.date ? new Date(activeOrder.order_timestamp || activeOrder.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Placed',
      icon: CheckCircle2
    },
    {
      title: 'Order Accepted & Preparing',
      desc: isAccepted ? `${activeOrder.store_name || 'Merchant'} is currently packing your items` : (isOutForDelivery || isDelivered ? 'Items packed & quality checked' : 'Merchant will pack fresh items upon accepting'),
      time: isAccepted ? 'In progress' : (isOutForDelivery || isDelivered ? 'Done' : 'Upcoming'),
      icon: ChefHat
    },
    {
      title: 'Out for Delivery',
      desc: isOutForDelivery ? 'Society runner is on the way to your flat' : (isDelivered ? 'Runner completed delivery' : 'Assigned once items are packed'),
      time: isOutForDelivery ? 'On way' : (isDelivered ? 'Done' : 'Upcoming'),
      icon: Truck
    },
    {
      title: 'Delivered to Doorstep',
      desc: activeOrder.delivery_address || activeOrder.address || 'Delivered to your flat',
      time: isDelivered ? 'Completed' : '~10-15 mins',
      icon: ShieldCheck
    }
  ];

  const itemsList = Array.isArray(activeOrder.items) ? activeOrder.items : [];
  const subtotal = Number(activeOrder.total_amount || 0);

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999999] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5DAD0] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 text-[#211A19]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E5DAD0] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#541D26] text-[#C8A878] flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#541D26]">Live Order Tracking</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h2 className="text-sm sm:text-base font-serif font-black text-[#211A19] leading-tight">
                Order #{String(activeOrder.order_id || activeOrder.id || '').replace('ORD-', '')}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#EEE5DA] text-[#211A19] flex items-center justify-center border border-[#E5DAD0] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SCROLLABLE TRACKER CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* MAIN STATUS & ETA CARD */}
          <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E5DAD0] space-y-4">
            
            {/* Top ETA & Live Badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#211A19]/60">Estimated Arrival</span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#541D26] mt-0.5">
                  {statusBadge.eta}
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shrink-0 ${statusBadge.color}`}>
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                <span>{statusBadge.label}</span>
              </span>
            </div>

            <p className="text-xs text-[#211A19]/80 font-medium leading-relaxed">
              {statusBadge.subtitle}
            </p>

            {/* ROUTE PROGRESS BAR (Clean & Modern) */}
            <div className="pt-2">
              <div className="h-2 w-full bg-[#E5DAD0] rounded-full overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-700 ease-out rounded-full ${
                    isCancelled ? 'bg-rose-500' : 'bg-gradient-to-r from-[#C8A878] via-[#541D26] to-[#541D26]'
                  }`}
                  style={{ width: progressWidth }}
                />
              </div>

              {/* Endpoint Labels */}
              <div className="flex justify-between items-center mt-2.5 text-[11px] font-bold text-[#211A19]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#541D26]" />
                  <span className="truncate max-w-[120px]">{activeOrder.store_name || 'Store'}</span>
                </div>

                <div className="text-[10px] text-[#211A19]/60 font-semibold px-2 py-0.5 rounded-full bg-white border border-[#E5DAD0]">
                  {isPlaced ? 'Awaiting Acceptance' : isPreparing ? 'Packing' : isOutForDelivery ? 'On Route' : isDelivered ? 'Arrived' : 'Status'}
                </div>

                <div className="flex items-center space-x-1.5 text-right">
                  <span className="truncate max-w-[120px]">{activeOrder.delivery_address?.split(',')[0] || 'Doorstep'}</span>
                  <span className={`w-2 h-2 rounded-full ${isDelivered ? 'bg-emerald-600' : 'bg-[#C8A878]'}`} />
                </div>
              </div>
            </div>

            {/* DELIVERY / STORE CONTACT ROW */}
            <div className="pt-3 border-t border-[#E5DAD0] flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white border border-[#E5DAD0] flex items-center justify-center text-sm shrink-0">
                  {isOutForDelivery || isDelivered ? '🛵' : '🏪'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#211A19] truncate">
                    {isOutForDelivery ? 'Society Express Runner' : activeOrder.store_name || 'Store Merchant'}
                  </p>
                  <p className="text-[10px] text-[#211A19]/60 font-medium">
                    {isOutForDelivery ? 'Gate Verified • Contactless' : 'Order fulfillment & packing'}
                  </p>
                </div>
              </div>

              {activeOrder.phone_number && (
                <a
                  href={`tel:${activeOrder.phone_number}`}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DAD0] hover:bg-[#EEE5DA] text-[#541D26] font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-[#541D26]" />
                  <span>Call Store</span>
                </a>
              )}
            </div>

            {/* FULL DELIVERY ADDRESS & DESTINATION ROW */}
            <div className="pt-3 border-t border-[#E5DAD0] flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-lg bg-[#541D26]/10 text-[#541D26] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[#211A19]">Deliver to:</span>
                  <span className="font-bold text-[#541D26]">{activeOrder.delivery_address || activeOrder.address || 'Resident Doorstep'}</span>
                </div>
                {activeOrder.customer_name && (
                  <p className="text-[11px] text-[#211A19]/60 font-medium mt-0.5">
                    Recipient: <strong className="text-[#211A19]">{activeOrder.customer_name}</strong>
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* STATUS TIMELINE */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5DAD0] space-y-4">
            <h4 className="font-serif font-bold text-xs text-[#211A19] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E5DAD0]">
              <Clock className="w-4 h-4 text-[#541D26]" />
              <span>Order Milestones</span>
            </h4>

            <div className="space-y-4 pl-1">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                const isPassed = idx < currentStep;
                const isCurrent = idx === currentStep;
                const isUpcoming = idx > currentStep;

                return (
                  <div key={idx} className="flex items-start space-x-3 relative">
                    {/* Connecting line */}
                    {idx < steps.length - 1 && (
                      <div 
                        className={`absolute left-3.5 top-6 bottom-0 w-0.5 -ml-[1px] ${
                          idx < currentStep ? 'bg-[#541D26]' : 'bg-[#E5DAD0]'
                        }`} 
                      />
                    )}

                    {/* Step Icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                      isPassed 
                        ? 'bg-[#541D26] text-white' 
                        : isCurrent 
                        ? 'bg-[#541D26] text-[#C8A878] ring-4 ring-[#541D26]/10' 
                        : 'bg-[#FAF7F2] border border-[#E5DAD0] text-[#211A19]/40'
                    }`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold leading-tight ${isCurrent ? 'text-[#541D26]' : isPassed ? 'text-[#211A19]' : 'text-[#211A19]/50'}`}>
                          {step.title}
                        </span>
                        <span className="text-[10px] font-semibold text-[#211A19]/50">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#211A19]/70 mt-0.5 leading-snug">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ITEM BREAKDOWN ACCORDION */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5DAD0] space-y-3">
            <button
              type="button"
              onClick={() => setShowItemDetails(!showItemDetails)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#211A19] cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-[#541D26]" />
                <span>Purchased Items ({itemsList.length})</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#541D26] transition-transform ${showItemDetails ? 'rotate-180' : ''}`} />
            </button>

            {showItemDetails && (
              <div className="pt-2 border-t border-[#E5DAD0] space-y-2 text-xs">
                {itemsList.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DAD0] text-[#541D26] font-bold text-[10px]">
                        ×{it.quantity || 1}
                      </span>
                      <span className="font-semibold text-[#211A19] truncate">{it.item_name || it.name || 'Product'}</span>
                    </div>
                    <span className="font-bold text-[#211A19] font-mono shrink-0">
                      ₹{parseFloat(it.item_total || (it.price * (it.quantity || 1)) || 0).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="pt-2.5 border-t border-dashed border-[#E5DAD0] flex justify-between items-center font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#211A19]">Total Amount:</span>
                    <span className="text-[10px] text-[#541D26] bg-[#541D26]/10 px-2 py-0.5 rounded-full border border-[#541D26]/20 font-bold">
                      {activeOrder.payment_method || 'Cash on Delivery'}
                    </span>
                  </div>
                  <span className="text-[#541D26] font-serif text-base font-black">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#E5DAD0] flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white border border-[#E5DAD0] hover:bg-[#EEE5DA] text-[#211A19] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
          >
            Close
          </button>

          {setRoute && (
            <button
              type="button"
              onClick={() => {
                onClose();
                setRoute({ page: 'profile', tab: 'orders' });
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <span>My Orders</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C8A878]" />
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
