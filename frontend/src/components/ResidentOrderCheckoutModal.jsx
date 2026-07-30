import React, { useState } from 'react';
import { ShoppingCart, Clock, Phone, MapPin, CheckCircle2, ShieldCheck, ArrowRight, X } from 'lucide-react';

export default function ResidentOrderCheckoutModal({ isOpen, onClose, cartItems = [], vendor, onOrderPlaced }) {
  const [step, setStep] = useState(1); // Step 1: Cart & Delivery Slot, Step 2: Phone OTP, Step 3: Success
  const STATIC_OTP = "1234";

  // Delivery Slot Selection
  const [selectedSlot, setSelectedSlot] = useState('Express 30-Min Instant Delivery');
  const [flatAddress, setFlatAddress] = useState('');

  // User OTP Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setOtpError('Please enter a valid 10-digit phone number');
      return;
    }
    setOtpError('');
    setOtpSent(true);
  };

  const handleVerifyAndPlaceOrder = async (e) => {
    e.preventDefault();
    if (otp !== STATIC_OTP) {
      setOtpError(`Invalid OTP. For prototype testing, use static code "${STATIC_OTP}"`);
      return;
    }

    try {
      setPlacingOrder(true);
      setOtpError('');
      
      const payload = {
        vendor_id: vendor?.vendor_id || 1,
        phone_number: phoneNumber,
        delivery_address: flatAddress || 'Tower A-402, Resident Flat',
        delivery_slot: selectedSlot,
        total_amount: totalAmount,
        items: cartItems.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.price
        }))
      };

      // Call API order placement handler
      if (onOrderPlaced) {
        await onOrderPlaced(payload);
      }
      setStep(3); // Navigate to Order Success step
    } catch (err) {
      setOtpError(err.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-[#C5A880]/30 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0A1428] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif uppercase tracking-wider">Resident Order Checkout</h3>
              <p className="text-[11px] text-[#C5A880]">Fulfilling store: {vendor?.store_name || 'Society Vendor Store'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* STEP 1: Cart Items & Slot Selector */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Item Summary */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cart Line Items</h4>
                <div className="divide-y divide-gray-100 bg-[#FAF9F6] rounded-2xl border border-gray-200 p-3 max-h-48 overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">Your cart is empty.</p>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.item_id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[#0A1428]">{item.item_name}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-extrabold text-[#0A1428]">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="mt-3 flex items-center justify-between text-sm font-bold px-1">
                  <span>Total Payable:</span>
                  <span className="text-lg text-emerald-700 font-extrabold">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Apartment / Tower & Flat Address</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tower B, Flat 804"
                  value={flatAddress}
                  onChange={(e) => setFlatAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#C5A880]"
                />
              </div>

              {/* Delivery Slot Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Choose Delivery Preference</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Express 30-Min Instant Delivery', tag: 'Fastest' },
                    { label: 'Morning Slot (8:00 AM - 10:00 AM)', tag: 'Scheduled' },
                    { label: 'Evening Slot (5:00 PM - 7:00 PM)', tag: 'Scheduled' },
                  ].map((slot) => (
                    <div
                      key={slot.label}
                      onClick={() => setSelectedSlot(slot.label)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        selectedSlot === slot.label
                          ? 'border-[#C5A880] bg-[#F6F3EC] font-bold text-[#0A1428]'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{slot.label}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                        {slot.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                disabled={cartItems.length === 0}
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-[#0A1428] text-white font-bold text-xs rounded-xl hover:bg-[#C5A880] transition-colors uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <span>Proceed to Mobile Authentication</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Phone OTP Authentication */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <ShieldCheck className="w-10 h-10 text-[#C5A880] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#0A1428] uppercase tracking-wider">Mobile OTP Authentication</h4>
                <p className="text-xs text-gray-500 mt-1">Keyless resident verification for society delivery security</p>
              </div>

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                  {otpError}
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Resident Phone Number
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#0A1428] text-white font-bold text-xs rounded-xl hover:bg-[#C5A880] transition-colors uppercase tracking-wider">
                    Send Verification OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndPlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 text-center">
                      Enter 4-Digit OTP Code (Prototype static code: <span className="text-[#C5A880]">1234</span>)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-center font-mono font-bold text-xl tracking-widest focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={placingOrder}
                    className="w-full py-3.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors uppercase tracking-wider flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{placingOrder ? 'Confirming Order...' : 'Verify OTP & Confirm Order'}</span>
                  </button>
                </form>
              )}

              <button onClick={() => setStep(1)} className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-800">
                ← Back to Order Summary
              </button>
            </div>
          )}

          {/* STEP 3: Order Placed Success */}
          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-serif font-extrabold text-[#0A1428] uppercase tracking-wider">Order Placed Successfully!</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Your order of <strong>₹{totalAmount.toFixed(2)}</strong> has been dispatched to <strong>{vendor?.store_name}</strong>.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#C5A880]/30 text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Slot:</span>
                  <span className="font-bold text-[#0A1428]">{selectedSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Flat Address:</span>
                  <span className="font-bold text-[#0A1428]">{flatAddress || 'Resident Flat'}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-[#0A1428] text-white font-bold text-xs rounded-xl hover:bg-[#C5A880] transition-colors uppercase tracking-wider"
              >
                Close & Track Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
