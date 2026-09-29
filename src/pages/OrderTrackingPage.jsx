import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, MapPin, Store, CheckCircle2, Clock, Phone, 
  ShieldCheck, ShoppingBag, ArrowLeft, HelpCircle, 
  Receipt, Check, RefreshCw, ChefHat, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function OrderTrackingPage({ currentRoute, orderId: propOrderId, order: propOrder, setRoute, activeUser, onOpenSupportDesk }) {
  const [activeOrder, setActiveOrder] = useState(propOrder || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const activeOrderRef = useRef(activeOrder);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    activeOrderRef.current = activeOrder;
  }, [activeOrder]);

  const targetOrderId = propOrderId || currentRoute?.orderId || propOrder?.order_id || propOrder?.id;

  const isMatchingOrderId = (idA, idB) => {
    if (!idA || !idB) return false;
    const cleanA = String(idA).replace(/^ORD[-_]?/i, '').trim().toLowerCase();
    const cleanB = String(idB).replace(/^ORD[-_]?/i, '').trim().toLowerCase();
    return cleanA === cleanB || String(idA).trim().toLowerCase() === String(idB).trim().toLowerCase();
  };

  const loadOrderFromStorage = (id) => {
    if (!id) return null;
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
          const found = parsed.find(o => isMatchingOrderId(o?.order_id || o?.id, id));
          if (found) return found;
        } else if (parsed && typeof parsed === 'object') {
          if (isMatchingOrderId(parsed.order_id || parsed.id, id)) return parsed;
        }
      } catch (_) {}
    }
    return null;
  };

  const syncLatestStatus = async (forced = false) => {
    if (isFetchingRef.current) return;
    const currentId = targetOrderId || activeOrderRef.current?.order_id || activeOrderRef.current?.id;
    if (!currentId) return;

    const currentStatusUpper = String(activeOrderRef.current?.status || activeOrderRef.current?.order_status || '').toUpperCase();
    if (!forced && ['COMPLETED', 'DELIVERED', 'CANCELLED', 'CANCELED', 'REJECTED'].includes(currentStatusUpper)) {
      return;
    }

    try {
      isFetchingRef.current = true;
      if (forced) setIsRefreshing(true);

      const res = await api.getOrderStatus(currentId);
      if (res && res.order && res.order.status) {
        const liveOrder = res.order;
        const liveStatus = liveOrder.status;
        setActiveOrder(prev => ({
          ...prev,
          ...liveOrder,
          status: liveStatus,
          order_status: liveStatus,
          items: Array.isArray(res.items) && res.items.length > 0 ? res.items : (prev?.items || liveOrder.items || [])
        }));
        setLastUpdated(new Date());
        api._updateLocalOrderStatus(currentId, liveStatus);
        return;
      }
    } catch (_) {
    } finally {
      isFetchingRef.current = false;
      if (forced) setTimeout(() => setIsRefreshing(false), 400);
    }

    // Offline storage fallback
    const local = loadOrderFromStorage(currentId);
    if (local) {
      setActiveOrder(prev => ({ ...prev, ...local }));
      setLastUpdated(new Date());
    }
  };

  // Initial load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (propOrder) {
      setActiveOrder(propOrder);
      syncLatestStatus();
    } else if (targetOrderId) {
      const local = loadOrderFromStorage(targetOrderId);
      if (local) setActiveOrder(local);
      syncLatestStatus(true);
    } else {
      try {
        const stored = localStorage.getItem('digilocal_active_order');
        if (stored) {
          const parsed = JSON.parse(stored);
          setActiveOrder(parsed);
          syncLatestStatus();
        }
      } catch (_) {}
    }
  }, [targetOrderId]);

  // Real-time live status listeners & 5-second polling interval
  useEffect(() => {
    const handleStorage = () => syncLatestStatus();
    const handleCustomStatus = (e) => {
      if (e?.detail && isMatchingOrderId(e.detail.order_id, targetOrderId || activeOrderRef.current?.order_id || activeOrderRef.current?.id)) {
        setActiveOrder(prev => ({
          ...prev,
          status: e.detail.status,
          order_status: e.detail.status
        }));
        setLastUpdated(new Date());
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('digilocal_order_status_update', handleCustomStatus);

    const interval = setInterval(() => {
      syncLatestStatus();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('digilocal_order_status_update', handleCustomStatus);
      clearInterval(interval);
    };
  }, [targetOrderId]);

  const rawStatus = String(activeOrder?.status || activeOrder?.order_status || 'PLACED').toUpperCase();
  const isCancelled = ['CANCELLED', 'CANCELED', 'REJECTED', 'DECLINED', 'FAILED'].includes(rawStatus);
  const isDelivered = ['DELIVERED', 'COMPLETED', 'COMPLETE', 'FULFILLED', 'DONE'].includes(rawStatus);
  const isOutForDelivery = ['OUT_FOR_DELIVERY', 'IN_PROGRESS', 'PROCESSING', 'IN_TRANSIT'].includes(rawStatus);
  const isAccepted = ['ACCEPTED', 'ACCEPT', 'CONFIRMED', 'PREPARING'].includes(rawStatus);
  const isPendingPayment = rawStatus === 'PENDING';
  const isPlaced = !isAccepted && !isOutForDelivery && !isDelivered && !isCancelled && !isPendingPayment;

  // Step index: 0 = Placed, 1 = Preparing, 2 = Out for Delivery, 3 = Delivered
  let stepIndex = 0;
  if (isPendingPayment || isPlaced) stepIndex = 0;
  else if (isAccepted) stepIndex = 1;
  else if (isOutForDelivery) stepIndex = 2;
  else if (isDelivered) stepIndex = 3;
  else if (isCancelled) stepIndex = -1;

  // Status Presentation Details
  let statusBadge = {
    badge: 'Order Placed',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500 animate-pulse',
    title: 'Order Placed with Store',
    description: `Order details received. Waiting for ${activeOrder?.store_name || 'the merchant'} to review and begin packing.`,
    eta: '~15–20 Mins'
  };

  if (isPendingPayment) {
    statusBadge = {
      badge: 'Payment Pending',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      dotColor: 'bg-amber-500 animate-pulse',
      title: 'Awaiting Online Payment',
      description: 'Please complete your transaction to confirm this order.',
      eta: 'Awaiting Payment'
    };
  } else if (rawStatus === 'CONFIRMED') {
    statusBadge = {
      badge: 'Confirmed',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotColor: 'bg-emerald-500',
      title: 'Payment Confirmed',
      description: `Payment verified. ${activeOrder?.store_name || 'The store'} is reviewing items to start preparation.`,
      eta: '~12–15 Mins'
    };
  } else if (isAccepted) {
    statusBadge = {
      badge: 'Preparing Items',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotColor: 'bg-emerald-500 animate-pulse',
      title: 'Store is Preparing Your Order',
      description: `${activeOrder?.store_name || 'The store'} accepted your order and is packing your fresh products.`,
      eta: '~10–14 Mins'
    };
  } else if (isOutForDelivery) {
    statusBadge = {
      badge: 'Out for Delivery',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      dotColor: 'bg-purple-500 animate-ping',
      title: 'Runner is on the Way',
      description: 'Your package is picked up and currently on the way to your flat doorstep.',
      eta: '~4–8 Mins'
    };
  } else if (isDelivered) {
    statusBadge = {
      badge: 'Delivered',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotColor: 'bg-emerald-600',
      title: 'Order Delivered Successfully',
      description: `Your package has been delivered to ${activeOrder?.delivery_address || activeOrder?.address || 'your flat'}.`,
      eta: 'Delivered'
    };
  } else if (isCancelled) {
    statusBadge = {
      badge: 'Cancelled',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      dotColor: 'bg-rose-600',
      title: 'Order Cancelled',
      description: 'This order was cancelled. If you made an online payment, a full refund is processed.',
      eta: 'Cancelled'
    };
  }

  const orderTimeStr = activeOrder?.order_timestamp || activeOrder?.created_at || activeOrder?.date;
  const formattedTime = orderTimeStr 
    ? new Date(orderTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : 'Just now';
  const formattedDate = orderTimeStr 
    ? new Date(orderTimeStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : 'Today';

  const timelineSteps = [
    {
      title: 'Order Placed',
      description: isPendingPayment ? 'Online transaction pending confirmation' : 'Order received and confirmed by DigiLocal system',
      time: formattedTime,
      isCompleted: stepIndex > 0,
      isCurrent: stepIndex === 0,
      icon: CheckCircle2
    },
    {
      title: 'Store Preparing Items',
      description: isAccepted ? `${activeOrder?.store_name || 'Store'} accepted and is packing your items` : (stepIndex > 1 ? 'Items packed and quality checked' : 'Store will pack fresh items upon accepting'),
      time: isAccepted ? 'In progress' : (stepIndex > 1 ? 'Done' : 'Upcoming'),
      isCompleted: stepIndex > 1,
      isCurrent: stepIndex === 1,
      icon: ChefHat
    },
    {
      title: 'Out for Delivery',
      description: isOutForDelivery ? 'Society runner is heading to your apartment flat' : (stepIndex > 2 ? 'Delivered by society runner' : 'Runner will be dispatched once packed'),
      time: isOutForDelivery ? 'On way' : (stepIndex > 2 ? 'Done' : 'Upcoming'),
      isCompleted: stepIndex > 2,
      isCurrent: stepIndex === 2,
      icon: Truck
    },
    {
      title: 'Delivered to Doorstep',
      description: activeOrder?.delivery_address || activeOrder?.address || 'Handed over at your residence door',
      time: isDelivered ? 'Delivered' : statusBadge.eta,
      isCompleted: isDelivered,
      isCurrent: stepIndex === 3,
      icon: ShieldCheck
    }
  ];

  const itemsList = Array.isArray(activeOrder?.items) ? activeOrder.items : [];
  const subtotal = Number(activeOrder?.total_amount || 0);
  const cleanOrderId = String(activeOrder?.order_id || activeOrder?.id || targetOrderId || '').replace(/^ORD[-_]?/i, '');

  if (!activeOrder && !targetOrderId) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#541D26]/10 text-[#541D26] flex items-center justify-center mb-3">
          <Truck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#211A19]">No Order Selected</h2>
        <p className="text-xs text-[#78716C] max-w-sm mt-1 mb-5">
          Please select an order from your profile or place an express order from your local society store.
        </p>
        <button
          onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
          className="px-5 py-2.5 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-full text-xs font-bold transition-all cursor-pointer"
        >
          Browse Society Stores
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F0E8] py-4 sm:py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DAD0]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#211A19] leading-tight">
                Order #{cleanOrderId}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.badgeColor}`}>
                <span className={`w-2 h-2 rounded-full ${statusBadge.dotColor}`} />
                {statusBadge.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1">
              Placed on {formattedDate} at {formattedTime}
            </p>
          </div>

          {onOpenSupportDesk && (
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                onClick={onOpenSupportDesk}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-[#C8A878]" />
                <span>Help & Support</span>
              </button>
            </div>
          )}
        </div>

        {/* MAIN 2-COLUMN UNIFIED CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: LIVE STATUS & CONNECTED TIMELINE */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E5DAD0] shadow-xs space-y-8">
            
            {/* Status Headline Banner */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#E5DAD0]">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-[#211A19] leading-snug">
                  {statusBadge.title}
                </h2>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  {statusBadge.description}
                </p>
              </div>

              {!isCancelled && (
                <div className="text-right shrink-0 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DAD0]">
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block">Estimated Delivery</span>
                  <span className="text-sm sm:text-base font-bold text-[#541D26] font-mono mt-0.5 block">{statusBadge.eta}</span>
                </div>
              )}
            </div>

            {/* Connected Vertical Stepper */}
            <div className="space-y-6 pt-1">
              {timelineSteps.map((step, idx) => {
                const isLast = idx === timelineSteps.length - 1;
                const StepIcon = step.icon;

                return (
                  <div key={idx} className="relative flex items-start space-x-3.5">
                    {/* Continuous Vertical Line */}
                    {!isLast && (
                      <div 
                        className={`absolute left-[15px] top-8 bottom-[-24px] w-0.5 ${
                          step.isCompleted ? 'bg-emerald-500' : 'bg-[#E5DAD0]'
                        }`} 
                      />
                    )}

                    {/* Step Node */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                      step.isCompleted 
                        ? 'bg-emerald-600 text-white shadow-2xs' 
                        : step.isCurrent 
                        ? 'bg-[#541D26] text-white ring-4 ring-[#541D26]/15 shadow-2xs' 
                        : 'bg-[#EEE5DA] text-[#78716C]'
                    }`}>
                      {step.isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </div>

                    {/* Step Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-xs font-bold leading-tight ${
                          step.isCurrent 
                            ? 'text-[#541D26]' 
                            : step.isCompleted 
                            ? 'text-[#211A19]' 
                            : 'text-[#78716C]'
                        }`}>
                          {step.title}
                        </h3>
                        <span className="text-[11px] font-mono text-[#78716C] shrink-0">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Store & Contact Bar */}
            <div className="pt-5 border-t border-[#E5DAD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#541D26]/10 text-[#541D26] flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#211A19]">{activeOrder?.store_name || 'Society Merchant Store'}</p>
                  <p className="text-[#78716C] text-[11px]">{activeOrder?.society_name || 'Residential Enclave'}</p>
                </div>
              </div>

              {activeOrder?.phone_number && (
                <a 
                  href={`tel:${activeOrder.phone_number}`} 
                  className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EEE5DA] text-[#541D26] font-bold border border-[#E5DAD0] flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#541D26]" />
                  <span>Call Store</span>
                </a>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: DELIVERY DETAILS & ORDER SUMMARY */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            
            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5DAD0] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#541D26]" />
                  <span>Delivery Address</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Direct Flat Delivery
                </span>
              </div>
              <div className="text-xs text-[#211A19] space-y-1.5">
                <p className="font-bold text-sm">{activeOrder?.customer_name || activeUser?.name || 'Resident Customer'}</p>
                <p className="text-[#78716C] leading-relaxed">
                  {activeOrder?.delivery_address || activeOrder?.address || activeOrder?.flat || 'Flat Doorstep, Residential Society'}
                </p>
                {(activeOrder?.customer_phone || activeOrder?.phone_number) && (
                  <p className="text-[#78716C] pt-0.5">
                    Phone: <span className="font-medium text-[#211A19]">+91 {String(activeOrder.customer_phone || activeOrder.phone_number).slice(-10)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Order Items & Bill Breakdown Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5DAD0] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DAD0]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#541D26]" />
                  <span>Order Items</span>
                </h3>
                <span className="text-xs font-mono font-bold text-[#78716C]">
                  {itemsList.length || 1} {itemsList.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Itemized list */}
              <div className="space-y-3 text-xs">
                {itemsList.length > 0 ? (
                  itemsList.map((item, idx) => {
                    const qty = Number(item.quantity || item.qty || 1);
                    const unitPrice = Number(item.unit_price || item.price || 0);
                    const itemTotal = qty * unitPrice;

                    return (
                      <div key={idx} className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-2 min-w-0">
                          <span className="font-mono font-bold text-[#541D26] shrink-0">
                            {qty}×
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#211A19] truncate">{item.name || item.item_name || 'Product'}</p>
                            {item.variant && <p className="text-[10px] text-[#78716C]">{item.variant}</p>}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-[#211A19] shrink-0">
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between text-[#78716C]">
                    <span>Items from {activeOrder?.store_name || 'Store'}</span>
                    <span className="font-mono font-bold text-[#211A19]">₹{subtotal.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Bill Breakdown */}
              <div className="pt-3 border-t border-[#E5DAD0] space-y-2 text-xs text-[#78716C]">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-mono font-bold text-[#211A19]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-emerald-700 font-mono">FREE</span>
                </div>
                <div className="pt-3 border-t border-[#E5DAD0] flex justify-between items-center text-sm">
                  <span className="font-bold text-[#211A19]">Total Amount</span>
                  <span className="font-bold text-base text-[#541D26] font-mono">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1">
                  <span>Payment Mode</span>
                  <span className="font-bold text-[#211A19] uppercase tracking-wider">
                    {activeOrder?.payment_method || 'COD'} • {String(activeOrder?.payment_status || 'PENDING').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
