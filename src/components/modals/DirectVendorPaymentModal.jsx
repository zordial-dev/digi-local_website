import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CreditCard, 
  Sparkles, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Store, 
  QrCode, 
  Send, 
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { api, getNormalizedImageUrl } from '../../services/api';
import { openCashfreeModal, getCashfree } from '../../services/cashfree';
import { useScrollLock } from '../../hooks/useScrollLock';

export default function DirectVendorPaymentModal({
  isOpen,
  onClose,
  vendor,
  onSuccess
}) {
  useScrollLock(isOpen);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedPayment, setVerifiedPayment] = useState(null);

  // Pre-load Cashfree SDK on mount
  useEffect(() => {
    if (isOpen) {
      getCashfree().catch(err => console.warn('Pre-loading Cashfree SDK note:', err));

      // Auto-fill resident details if available
      try {
        const uStr = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session') || localStorage.getItem('user_profile');
        if (uStr) {
          const parsed = JSON.parse(uStr);
          const u = parsed.user || parsed.resident || parsed;
          if (u) {
            setCustomerName(u.name || u.full_name || '');
            setCustomerPhone(u.phone || u.mobile || u.phone_number || '');
          }
        }
      } catch (_) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const vendorName = vendor?.store_name || vendor?.name || vendor?.vendor_name || 'Society Vendor';
  const vendorId = vendor?.vendor_id || vendor?.id || 1296;

  const handlePayDirect = async (e) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount greater than ₹0.');
      return;
    }
    if (!customerPhone || customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit customer mobile number.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      setStatusMsg('Preparing payment session with Cashfree...');

      const directPayload = {
        vendor_id: Number(vendorId),
        amount: numAmount,
        customer_name: customerName || 'Resident Customer',
        customer_phone: customerPhone.replace(/\D/g, '').slice(-10),
        notes: notes || 'Direct Counter Payment'
      };

      // 1. Create Direct Payment Session
      const sessionData = await api.payVendorDirect(directPayload);
      if (!sessionData?.payment_session_id) {
        throw new Error(sessionData?.error || 'Could not initiate Cashfree payment session.');
      }

      const orderId = sessionData.order_id;
      const sessionId = sessionData.payment_session_id;

      setStatusMsg('Opening secure Cashfree popup...');

      // 2. Launch Cashfree PG Modal
      const checkoutResult = await openCashfreeModal(sessionId);

      if (checkoutResult.error) {
        setStatusMsg('');
        setErrorMsg('Payment was cancelled or closed.');
        setLoading(false);
        return;
      }

      // 3. Verify Direct Payment on Backend
      setStatusMsg('Verifying payment status...');
      const verifyRes = await api.verifyDirectPayment({ order_id: orderId });

      if (verifyRes?.verified || verifyRes?.payment_status === 'PAID') {
        const paymentRecord = {
          order_id: orderId,
          amount: numAmount,
          vendor_id: vendorId,
          vendor_name: vendorName,
          customer_name: customerName || 'Resident Customer',
          customer_phone: customerPhone,
          notes: notes,
          payment_method: 'CASHFREE',
          payment_status: 'PAID',
          paid_at: new Date().toISOString()
        };

        // Save to resident's transaction records
        try {
          const directHistoryKey = 'digilocal_direct_payments';
          const existingStr = localStorage.getItem(directHistoryKey);
          let list = existingStr ? JSON.parse(existingStr) : [];
          if (!Array.isArray(list)) list = [];
          list = [paymentRecord, ...list];
          localStorage.setItem(directHistoryKey, JSON.stringify(list));
        } catch (_) {}

        setVerifiedPayment(paymentRecord);
        if (onSuccess) onSuccess(paymentRecord);
      } else {
        throw new Error(verifyRes?.error || 'Payment confirmation pending.');
      }
    } catch (err) {
      console.error('Direct payment error:', err);
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  const handleResetAndClose = () => {
    setAmount('');
    setNotes('');
    setErrorMsg('');
    setStatusMsg('');
    setVerifiedPayment(null);
    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-sans overflow-y-auto animate-in fade-in duration-200"
      onClick={handleResetAndClose}
    >
      <div 
        className="relative bg-white border border-[#E7DFD5] rounded-[2rem] max-w-md w-full shadow-2xl overflow-hidden my-auto text-[#211A19] flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#541D26] text-white p-5 flex items-center justify-between border-b border-[#C8A878]/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4ECE1]/15 border border-[#C8A878]/30 flex items-center justify-center text-[#C8A878] shrink-0">
              <Sparkles className="w-5 h-5 text-[#C8A878]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-serif font-black uppercase tracking-wider text-white">
                  Direct Pay to Store
                </h3>
                <span className="px-2 py-0.5 text-[9px] font-black bg-[#C8A878] text-[#541D26] rounded-md uppercase tracking-wider">
                  Cashfree PG
                </span>
              </div>
              <p className="text-[11px] text-[#EEE5DA]/80 font-medium truncate max-w-[240px]">
                {vendorName}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleResetAndClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!verifiedPayment ? (
          <form onSubmit={handlePayDirect} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            
            {/* Vendor Profile Card */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5] flex items-center space-x-3.5">
              <img
                src={getNormalizedImageUrl(vendor)}
                alt={vendorName}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80';
                }}
                className="w-12 h-12 rounded-xl object-cover border border-[#E7DFD5] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-serif font-black text-[#211A19] truncate">{vendorName}</h4>
                <p className="text-[11px] text-[#78716C] truncate">{vendor?.society_name || 'Resident Society'}</p>
                <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Cashfree Verified Settlement</span>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#78716C] mb-1.5">
                ENTER AMOUNT (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-[#541D26]">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-[#FAF8F5] border border-[#E7DFD5] focus:border-[#541D26] focus:bg-white rounded-2xl text-lg font-black text-[#211A19] focus:outline-none transition-all placeholder-[#A8A29E]"
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex items-center gap-1.5 mt-2">
                {[50, 100, 200, 500, 1000].map((quickAmt) => (
                  <button
                    key={quickAmt}
                    type="button"
                    onClick={() => setAmount(String(quickAmt))}
                    className="px-2.5 py-1 rounded-xl bg-[#FAF8F5] hover:bg-[#EEE5DA] text-[11px] font-extrabold text-[#541D26] border border-[#E7DFD5] transition-colors cursor-pointer"
                  >
                    +₹{quickAmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Resident Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#78716C] mb-1">
                  YOUR NAME
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7DFD5] focus:border-[#541D26] focus:bg-white rounded-xl text-xs font-bold text-[#211A19] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#78716C] mb-1">
                  MOBILE NUMBER *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7DFD5] focus:border-[#541D26] focus:bg-white rounded-xl text-xs font-bold text-[#211A19] focus:outline-none"
                />
              </div>
            </div>

            {/* Notes / Purpose */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#78716C] mb-1">
                NOTE / BILL PURPOSE (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="e.g. Counter sweets bill, extra milk tokens"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7DFD5] focus:border-[#541D26] focus:bg-white rounded-xl text-xs font-medium text-[#211A19] focus:outline-none"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || numAmount <= 0}
                className="w-full py-3.5 rounded-2xl bg-[#541D26] hover:bg-[#6B2732] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 border border-[#C8A878]/30 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#C8A878]" />
                <span>
                  {loading 
                    ? (statusMsg || 'Processing Cashfree PG...') 
                    : `Pay ₹${numAmount > 0 ? numAmount.toFixed(2) : '0.00'} via Cashfree`}
                </span>
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[#78716C] mt-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Supports UPI (Google Pay, PhonePe, Paytm), Cards & NetBanking</span>
              </div>
            </div>
          </form>
        ) : (
          /* Payment Success State */
          <div className="p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-serif font-black text-[#211A19] uppercase tracking-wide">
                Payment Successful!
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                ₹{verifiedPayment.amount.toFixed(2)} paid to <strong>{verifiedPayment.vendor_name}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5] text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#78716C]">Order Reference:</span>
                <span className="font-mono font-bold text-[#211A19]">{verifiedPayment.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716C]">Payment Gateway:</span>
                <span className="font-bold text-[#541D26]">Cashfree PG (v3)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716C]">Status:</span>
                <span className="font-black text-emerald-700 uppercase">PAID & CONFIRMED</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-2xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all border border-[#C8A878]/30 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
