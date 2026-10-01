import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Truck, ChevronRight, CheckCircle2, Store, Clock, X, 
  Star, Check, Loader2
} from 'lucide-react';
import LiveOrderTrackerModal from '../modals/LiveOrderTrackerModal';
import { api } from '../../services/api';

const RATING_TAGS = [
  'Fast Delivery',
  'Fresh & Delicious',
  'Good Packaging',
  'Accurate Order',
  'Value for Money',
  'Polite Delivery'
];

export default function LiveOrderTrackerToast({ currentRoute, activeUser, setRoute }) {
  const [activeOrder, setActiveOrder] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Rating Modal State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [inlineRatedNotice, setInlineRatedNotice] = useState(false);

  const activeOrderRef = useRef(activeOrder);
  const isPollingRef = useRef(false);

  useEffect(() => {
    activeOrderRef.current = activeOrder;
  }, [activeOrder]);

  const getLoggedInUser = () => {
    if (activeUser) return activeUser;
    try {
      const sessionStr = localStorage.getItem('digilocal_user_session');
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        if (parsed && (parsed.user || parsed.name) && (!parsed.expiresAt || parsed.expiresAt > Date.now())) {
          return parsed.user || parsed;
        }
      }
    } catch (_) {}
    return null;
  };

  const isOrderMatchingUser = (ord, user) => {
    if (!ord || !user) return false;
    const ordUserId = String(ord.user_id || ord.customer_id || '').trim();
    const ordPhone = String(ord.phone || ord.customer_phone || ord.user_phone || '').replace(/[^0-9]/g, '').slice(-10);
    const userId = String(user.user_id || user.id || '').trim();
    const userPhone = String(user.phone || user.mobile || '').replace(/[^0-9]/g, '').slice(-10);

    if (userId && ordUserId && ordUserId === userId) return true;
    if (userPhone && ordPhone && ordPhone === userPhone) return true;
    if (!ordUserId && !ordPhone) return true; // placed in current active user session
    return false;
  };

  const getRatedOrders = () => {
    try {
      const stored = localStorage.getItem('digilocal_rated_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (_) {}
    return [];
  };

  const isOrderRated = (orderId) => {
    if (!orderId) return false;
    const rated = getRatedOrders();
    const cleanId = String(orderId).replace(/^ORD[-_]?/i, '').trim().toLowerCase();
    return rated.some(id => {
      const c = String(id).replace(/^ORD[-_]?/i, '').trim().toLowerCase();
      return c === cleanId || String(id).trim().toLowerCase() === String(orderId).trim().toLowerCase();
    });
  };

  const markOrderAsRated = (orderId) => {
    try {
      const current = getRatedOrders();
      if (!current.includes(orderId)) {
        current.push(orderId);
        localStorage.setItem('digilocal_rated_orders', JSON.stringify(current));
      }
    } catch (_) {}
  };

  const getDismissedOrders = () => {
    try {
      const stored = sessionStorage.getItem('digilocal_dismissed_orders') || localStorage.getItem('digilocal_dismissed_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (_) {}
    return [];
  };

  const isOrderDismissed = (orderId) => {
    if (!orderId) return false;
    const dismissed = getDismissedOrders();
    const cleanId = String(orderId).replace(/^ORD[-_]?/i, '').trim().toLowerCase();
    return dismissed.some(id => {
      const c = String(id).replace(/^ORD[-_]?/i, '').trim().toLowerCase();
      return c === cleanId || String(id).trim().toLowerCase() === String(orderId).trim().toLowerCase();
    });
  };

  const markOrderAsDismissed = (orderId) => {
    if (!orderId) return;
    try {
      const current = getDismissedOrders();
      if (!current.includes(orderId)) {
        current.push(orderId);
        sessionStorage.setItem('digilocal_dismissed_orders', JSON.stringify(current));
        localStorage.setItem('digilocal_dismissed_orders', JSON.stringify(current));
      }
      // If delivered, remove from active order in localStorage
      const activeStr = localStorage.getItem('digilocal_active_order');
      if (activeStr) {
        const parsed = JSON.parse(activeStr);
        const pId = String(parsed?.order_id || parsed?.id || '').replace(/^ORD[-_]?/i, '').trim().toLowerCase();
        const targetId = String(orderId).replace(/^ORD[-_]?/i, '').trim().toLowerCase();
        if (pId === targetId) {
          localStorage.removeItem('digilocal_active_order');
        }
      }
    } catch (_) {}
  };

  const getStatusScore = (st) => {
    const s = String(st || '').toUpperCase();
    if (['DELIVERED', 'COMPLETED', 'COMPLETE', 'FULFILLED', 'DONE'].includes(s)) return 4;
    if (['OUT_FOR_DELIVERY', 'IN_PROGRESS', 'IN_TRANSIT'].includes(s)) return 3;
    if (['ACCEPTED', 'PREPARING', 'CONFIRMED', 'ACCEPT'].includes(s)) return 2;
    if (['PLACED', 'PENDING'].includes(s)) return 1;
    if (['CANCELLED', 'CANCELED', 'REJECTED', 'DECLINED', 'FAILED'].includes(s)) return -1;
    return 0;
  };

  const findLatestOrderStatusAcrossStorage = (orderId, initialStatus) => {
    if (!orderId) return initialStatus;
    const cleanTargetId = String(orderId).replace(/^ORD[-_]?/i, '').trim().toLowerCase();
    let bestStatus = initialStatus;
    let bestScore = getStatusScore(initialStatus);

    const isMatch = (o) => {
      if (!o) return false;
      const oId = String(o.order_id || o.id || o.orderId || '').replace(/^ORD[-_]?/i, '').trim().toLowerCase();
      return oId === cleanTargetId;
    };

    const keys = [
      'digilocal_active_order',
      'digilocal_user_orders',
      'digilocal_all_vendor_orders',
      'digilocal_past_orders',
      'digilocal_orders'
    ];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('digilocal_vendor_orders_') || k.startsWith('digilocal_vendor_purchases_'))) {
          keys.push(k);
        }
      }
    } catch (_) {}

    for (const key of keys) {
      try {
        const val = localStorage.getItem(key);
        if (!val) continue;
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          const match = parsed.find(isMatch);
          if (match && (match.status || match.order_status)) {
            const st = match.status || match.order_status;
            const score = getStatusScore(st);
            if (score > bestScore || (score === -1 && bestScore < 4)) {
              bestScore = score;
              bestStatus = st;
            }
          }
        } else if (typeof parsed === 'object' && parsed !== null) {
          if (isMatch(parsed) && (parsed.status || parsed.order_status)) {
            const st = parsed.status || parsed.order_status;
            const score = getStatusScore(st);
            if (score > bestScore || (score === -1 && bestScore < 4)) {
              bestScore = score;
              bestStatus = st;
            }
          }
        }
      } catch (_) {}
    }

    return bestStatus;
  };

  const loadActiveOrder = () => {
    try {
      const user = getLoggedInUser();
      if (!user) {
        setActiveOrder(null);
        return;
      }

      let candidateOrder = null;

      const stored = localStorage.getItem('digilocal_active_order');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.order_id || parsed.id) && isOrderMatchingUser(parsed, user)) {
          candidateOrder = parsed;
        }
      }

      if (!candidateOrder) {
        const userOrdersStr = localStorage.getItem('digilocal_user_orders');
        if (userOrdersStr) {
          const userOrders = JSON.parse(userOrdersStr);
          if (Array.isArray(userOrders) && userOrders.length > 0) {
            const latest = userOrders.find(ord => isOrderMatchingUser(ord, user));
            if (latest) {
              candidateOrder = latest;
            }
          }
        }
      }

      if (!candidateOrder) {
        setActiveOrder(null);
        return;
      }

      const ordId = candidateOrder.order_id || candidateOrder.id;
      const latestStatus = findLatestOrderStatusAcrossStorage(ordId, candidateOrder.status || candidateOrder.order_status || 'PLACED');
      const rawStatus = String(latestStatus).toUpperCase();
      const resolvedOrder = {
        ...candidateOrder,
        status: rawStatus,
        order_status: rawStatus
      };

      if (['CANCELLED', 'CANCELED', 'REJECTED', 'DECLINED', 'FAILED'].includes(rawStatus)) {
        setActiveOrder(null);
        try {
          localStorage.removeItem('digilocal_active_order');
        } catch (_) {}
        return;
      }

      if (isOrderDismissed(ordId)) {
        setActiveOrder(null);
        return;
      }

      const isDelivered = ['DELIVERED', 'COMPLETED', 'COMPLETE', 'FULFILLED', 'DONE'].includes(rawStatus);
      if (isDelivered) {
        if (isOrderRated(ordId)) {
          setActiveOrder(null);
          return;
        }
        setActiveOrder(resolvedOrder);
        return;
      }

      setActiveOrder(resolvedOrder);
    } catch (_) {
      setActiveOrder(null);
    }
  };

  const pollBackendStatus = async () => {
    if (isPollingRef.current) return;
    const current = activeOrderRef.current;
    if (!current) return;
    const orderId = current.order_id || current.id;
    if (!orderId) return;

    const rawStatus = String(current.status || current.order_status || '').toUpperCase();
    const isDelivered = ['DELIVERED', 'COMPLETED', 'COMPLETE', 'FULFILLED', 'DONE'].includes(rawStatus);
    const isCancelled = ['CANCELLED', 'CANCELED', 'REJECTED', 'DECLINED', 'FAILED'].includes(rawStatus);

    if (isCancelled || (isDelivered && isOrderRated(orderId))) {
      return;
    }

    try {
      isPollingRef.current = true;
      const res = await api.getOrderStatus(orderId);
      const liveStatus = res?.order?.status || res?.order?.order_status || res?.status || res?.order_status || res?.data?.status || res?.data?.order?.status;
      if (liveStatus) {
        const liveStatusUpper = String(liveStatus).toUpperCase();
        if (liveStatusUpper !== rawStatus) {
          const updated = {
            ...current,
            ...(res.order || (res.data?.order ? res.data.order : {})),
            status: liveStatusUpper,
            order_status: liveStatusUpper
          };
          setActiveOrder(updated);
          api._updateLocalOrderStatus(orderId, liveStatusUpper);
        }
      }
    } catch (_) {
    } finally {
      isPollingRef.current = false;
    }
  };

  useEffect(() => {
    loadActiveOrder();

    const handleStorage = (e) => {
      if (e.key === 'digilocal_active_order' || e.key === 'digilocal_user_orders' || e.key === 'digilocal_rated_orders' || e.key === 'userToken' || e.key === 'digilocal_resident_session' || e.key === 'user') {
        loadActiveOrder();
      }
    };

    const handleCustomEvent = (e) => {
      if (e?.detail?.order_id && activeOrderRef.current) {
        const currentId = String(activeOrderRef.current.order_id || activeOrderRef.current.id || '').replace(/^ORD[-_]?/i, '').toLowerCase();
        const eventId = String(e.detail.order_id).replace(/^ORD[-_]?/i, '').toLowerCase();
        if (currentId === eventId && e.detail.status) {
          const newStatusUpper = String(e.detail.status).toUpperCase();
          setActiveOrder(prev => prev ? ({ ...prev, status: newStatusUpper, order_status: newStatusUpper }) : null);
        }
      }
      loadActiveOrder();
      pollBackendStatus();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('digilocal_new_order', handleCustomEvent);
    window.addEventListener('digilocal_order_status_update', handleCustomEvent);
    window.addEventListener('digilocal_order_rated', handleCustomEvent);
    window.addEventListener('digilocal_auth_change', handleCustomEvent);
    window.addEventListener('digilocal_user_logout', handleCustomEvent);
    window.addEventListener('digilocal_user_login', handleCustomEvent);

    const interval = setInterval(() => {
      loadActiveOrder();
      pollBackendStatus();
    }, 3000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('digilocal_new_order', handleCustomEvent);
      window.removeEventListener('digilocal_order_status_update', handleCustomEvent);
      window.removeEventListener('digilocal_order_rated', handleCustomEvent);
      window.removeEventListener('digilocal_auth_change', handleCustomEvent);
      window.removeEventListener('digilocal_user_logout', handleCustomEvent);
      window.removeEventListener('digilocal_user_login', handleCustomEvent);
      clearInterval(interval);
    };
  }, [activeUser]);

  const handleOpenTracker = () => {
    if (setRoute && activeOrder) {
      setRoute({ 
        page: 'orderTracking', 
        orderId: activeOrder.order_id || activeOrder.id, 
        order: activeOrder 
      });
    } else {
      setIsTrackerOpen(true);
    }
  };

  const handleDismissOrder = (e) => {
    if (e) e.stopPropagation();
    setIsDismissed(true);
    if (activeOrder) {
      const id = activeOrder.order_id || activeOrder.id;
      markOrderAsDismissed(id);
    }
    setActiveOrder(null);
  };

  const handleStarClick = (starVal) => {
    setSelectedRating(starVal);
    setIsRatingModalOpen(true);
  };

  const handleSubmitRating = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const user = getLoggedInUser();
      const vendorId = activeOrder.vendor_id || activeOrder.vendorId || activeOrder.store_id || activeOrder.merchant_id;
      
      const fullComment = [
        reviewComment.trim(),
        selectedTags.length > 0 ? `Highlights: ${selectedTags.join(', ')}` : ''
      ].filter(Boolean).join(' | ');

      const ratingPayload = {
        vendor_id: vendorId,
        rating: Number(selectedRating),
        review_text: fullComment,
        comment: fullComment,
        review: fullComment,
        feedback: fullComment,
        user_id: user?.id || user?.user_id || 'usr_resident',
        user_name: user?.name || user?.full_name || 'Resident Customer',
        customer_name: user?.name || user?.full_name || 'Resident Customer',
        order_id: ordId
      };

      if (vendorId) {
        await api.submitVendorRating(vendorId, ratingPayload);
      }

      markOrderAsRated(ordId);
      setSubmitSuccess(true);

      window.dispatchEvent(new CustomEvent('digilocal_order_rated', { detail: { order_id: ordId, rating: selectedRating } }));

      setTimeout(() => {
        setIsRatingModalOpen(false);
        setActiveOrder(null);
        setSubmitSuccess(false);
      }, 1000);

    } catch (err) {
      markOrderAsRated(ordId);
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsRatingModalOpen(false);
        setActiveOrder(null);
        setSubmitSuccess(false);
      }, 800);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeOrder || isDismissed || currentRoute?.page === 'orderTracking') return null;

  const rawStatus = String(activeOrder.status || activeOrder.order_status || 'PLACED').toUpperCase();
  const isCancelled = ['CANCELLED', 'CANCELED', 'REJECTED', 'DECLINED', 'FAILED'].includes(rawStatus);
  const isDelivered = ['DELIVERED', 'COMPLETED', 'COMPLETE', 'FULFILLED', 'DONE'].includes(rawStatus);

  const ordId = activeOrder.order_id || activeOrder.id;
  if (isCancelled || isOrderDismissed(ordId) || (isDelivered && isOrderRated(ordId))) {
    return null;
  }

  const isPreparing = rawStatus === 'ACCEPTED' || rawStatus === 'PREPARING' || rawStatus === 'IN_PROGRESS';
  const isOutForDelivery = rawStatus === 'OUT_FOR_DELIVERY' || rawStatus === 'IN_TRANSIT';

  const statusText = isOutForDelivery 
    ? 'Society runner on the way' 
    : isPreparing 
    ? 'Store preparing your items' 
    : 'Order placed • Waiting for store';

  return (
    <>
      {/* ========================================================================= */}
      {/* FLOATING BOTTOM PILL                                                      */}
      {/* ========================================================================= */}
      <div className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-[99999] animate-in slide-in-from-bottom duration-300 pointer-events-auto font-sans">
        {isDelivered ? (
          /* DELIVERED STATE: DigiLocal Theme-Oriented Rating Pill */
          <div className="bg-[#211A19] text-white p-3 sm:py-3.5 sm:px-5 rounded-[2rem] border-2 border-[#C8A878] shadow-2xl flex items-center justify-between gap-3">
            {/* Left: Store Question & Status */}
            <div className="min-w-0 pr-1">
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                How was the food from <span className="text-[#C8A878] font-serif font-black">{activeOrder.store_name || 'the store'}</span>?
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-white/70 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-bold">Delivered</span>
                <span className="text-white/40">•</span>
                <span className="font-mono text-white/60">Order #{String(ordId).replace('ORD-', '').slice(-4)}</span>
              </div>
            </div>

            {/* Right: 5 Interactive Champagne Gold Stars & Close Button */}
            <div className="flex items-center gap-2 shrink-0">
              <div 
                className="flex items-center gap-1 bg-[#541D26] px-3 py-1.5 rounded-full border border-[#C8A878]/70 shadow-xs"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= (hoverRating || selectedRating);
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onClick={() => handleStarClick(starVal)}
                      className="p-0.5 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      title={`Rate ${starVal} Star`}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          isFilled
                            ? 'text-[#C8A878] fill-[#C8A878] drop-shadow-[0_0_6px_rgba(200,168,120,0.6)]'
                            : 'text-[#C8A878] fill-transparent stroke-[1.75] hover:fill-[#C8A878]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleDismissOrder}
                className="w-7 h-7 rounded-full text-[#C8A878]/70 hover:text-[#C8A878] flex items-center justify-center transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* IN-PROGRESS STATE: Live Order Tracking Pill */
          <div 
            onClick={handleOpenTracker}
            className="bg-[#211A19] text-white p-3 sm:p-3.5 rounded-[2rem] border-2 border-[#C8A878] shadow-2xl flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all group"
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
                    Live Order Tracking
                  </span>
                  <span className="text-[9px] font-bold text-white/50 font-mono">
                    #{String(ordId).replace('ORD-', '').slice(-4)}
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
                  handleOpenTracker();
                }}
                className="px-3.5 py-2 rounded-full bg-[#C8A878] hover:bg-[#d8bc90] text-[#541D26] font-black text-xs uppercase tracking-wider flex items-center space-x-1 shadow-md transition-all group-hover:translate-x-0.5 cursor-pointer"
              >
                <span>Track</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDismissOrder}
                className="w-7 h-7 rounded-full text-white/40 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RATING & REVIEW MODAL                                                     */}
      {/* ========================================================================= */}
      {isRatingModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
          onClick={() => !isSubmitting && setIsRatingModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E5DAD0] p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 text-[#211A19] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => !isSubmitting && setIsRatingModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#EEE5DA] text-[#211A19]/60 hover:text-[#211A19] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-serif font-black text-[#541D26]">
                  Rating Submitted
                </h3>
                <p className="text-xs text-[#211A19]/70 max-w-xs mx-auto">
                  Thank you for rating your order from {activeOrder.store_name || 'the vendor'}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRating} className="space-y-4">
                {/* Header */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#541D26]">
                    Delivered Order
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-black text-[#211A19]">
                    Rate {activeOrder.store_name || 'Your Order'}
                  </h3>
                  <p className="text-xs text-[#211A19]/60">
                    Order #{String(ordId).replace('ORD-', '')} • ₹{Number(activeOrder.total_amount || 0).toFixed(2)}
                  </p>
                </div>

                {/* Star Selector */}
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DAD0] text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const activeScore = hoverRating || selectedRating;
                      const isFilled = starVal <= activeScore;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setSelectedRating(starVal)}
                          className="p-1 transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              isFilled
                                ? 'text-[#C8A878] fill-[#C8A878]'
                                : 'text-stone-300 fill-transparent hover:text-[#C8A878]'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs font-bold text-[#541D26]">
                    {selectedRating === 5 && 'Excellent (5.0 / 5.0)'}
                    {selectedRating === 4 && 'Very Good (4.0 / 5.0)'}
                    {selectedRating === 3 && 'Good (3.0 / 5.0)'}
                    {selectedRating === 2 && 'Fair (2.0 / 5.0)'}
                    {selectedRating === 1 && 'Poor (1.0 / 5.0)'}
                  </p>
                </div>

                {/* Quick Feedback Tags */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#211A19]/70">
                    What went well? <span className="font-normal text-[#211A19]/50">(Optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {RATING_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTags(selectedTags.filter((t) => t !== tag));
                            } else {
                              setSelectedTags([...selectedTags, tag]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                            isSelected
                              ? 'bg-[#541D26] text-white'
                              : 'bg-[#FAF7F2] text-[#211A19] hover:bg-[#EEE5DA] border border-[#E5DAD0]'
                          }`}
                        >
                          <span>{tag}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#C8A878]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#211A19]/70">
                    Comments <span className="font-normal text-[#211A19]/50">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Leave brief feedback for the merchant..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DAD0] text-xs font-medium text-[#211A19] placeholder:text-[#211A19]/40 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26] transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRatingModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EEE5DA] text-[#211A19] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Rating</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Live Order Tracker Modal Fallback */}
      {isTrackerOpen && (
        <LiveOrderTrackerModal
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
          order={activeOrder}
          setRoute={setRoute}
        />
      )}
    </>
  );
}
