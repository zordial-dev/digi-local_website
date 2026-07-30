import React, { useState } from 'react';
import { Building2, ShieldCheck, CheckCircle2, Lock, ArrowRight, ArrowLeft, Upload, Store, Smartphone, AlertCircle } from 'lucide-react';

export default function VendorOnboardingStepper({ societyId, societyName, onCompleteOnboarding, onCancel }) {
  const [step, setStep] = useState(1);
  const STATIC_OTP = "1234";

  // Step 1 State: OTP & Society Lock
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Step 2 State: Business Info
  const [businessInfo, setBusinessInfo] = useState({
    vendor_name: '',
    store_name: '',
    email: '',
    category: 'Grocery & Staples',
    gst_number: '',
  });

  // Step 3 State: KYC Uploads
  const [kycDocs, setKycDocs] = useState({
    panNumber: '',
    fssaiLicense: '',
    idProofUploaded: false,
    addressProofUploaded: false,
  });

  // Step 4 State: Initial Catalog Item
  const [initialProduct, setInitialProduct] = useState({
    item_name: 'Farm Fresh Organic Milk (1L)',
    price: '65',
    category: 'Dairy',
    stock: '50',
  });

  // Handle OTP Dispatch
  const handleSendOTP = (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpError('');
    setOtpSent(true);
  };

  // Handle OTP Verification
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp !== STATIC_OTP) {
      setOtpError(`Invalid OTP code. Please enter demo code "${STATIC_OTP}"`);
      return;
    }
    setOtpError('');
    setIsPhoneVerified(true);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-[#C5A880]/30 overflow-hidden my-8">
      {/* Stepper Header */}
      <div className="bg-[#0A1428] text-white p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="px-3 py-1 bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/30 text-[11px] font-extrabold rounded-full uppercase tracking-wider">
              Vendor Onboarding Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-extrabold mt-1">Register Store for {societyName}</h2>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider">
              Cancel
            </button>
          )}
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 gap-2 relative">
          {[
            { num: 1, title: 'Society & OTP' },
            { num: 2, title: 'Store Details' },
            { num: 3, title: 'KYC Verification' },
            { num: 4, title: 'Catalog Launch' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === s.num
                  ? 'bg-[#C5A880] text-[#0A1428] ring-4 ring-[#C5A880]/30'
                  : step > s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 text-gray-400'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[10px] font-semibold mt-1 text-center hidden sm:block ${
                step === s.num ? 'text-[#C5A880]' : 'text-gray-400'
              }`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* STEP 1: Pre-Selected Society & Mobile OTP */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#C5A880]/30 flex items-start space-x-3">
              <Lock className="w-5 h-5 text-[#C5A880] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#0A1428] uppercase tracking-wider">Target Society Locked</h4>
                <p className="text-xs text-[#787F8C] mt-0.5">
                  You are registering your vendor profile specifically for residential society:
                </p>
                <div className="mt-2 text-sm font-bold text-[#0A1428] bg-white px-3 py-1.5 rounded-xl border border-gray-200 inline-block">
                  🏛️ {societyName} (ID: #{societyId})
                </div>
              </div>
            </div>

            {/* Read-Only Society Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Assigned Society Name (Read-Only)
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={societyName}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 font-semibold text-sm cursor-not-allowed"
              />
            </div>

            {/* Mobile OTP Verification */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-[#C5A880]" />
                <span>Vendor Mobile Phone Authentication</span>
              </h4>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {otpError}
                </div>
              )}

              {!otpSent ? (
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-[#C5A880]"
                  />
                  <button
                    onClick={handleSendOTP}
                    className="px-5 py-3 bg-[#0A1428] text-white font-bold text-xs rounded-xl hover:bg-[#C5A880] transition-colors uppercase tracking-wider"
                  >
                    Send OTP
                  </button>
                </div>
              ) : !isPhoneVerified ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    OTP sent to +91 {phone}. Demo verification code: <span className="font-extrabold text-[#C5A880]">1234</span>
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-36 px-4 py-3 rounded-xl border border-gray-300 text-center font-mono font-bold text-lg focus:ring-2 focus:ring-[#C5A880]"
                    />
                    <button
                      onClick={handleVerifyOTP}
                      className="px-6 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors uppercase tracking-wider"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mobile Phone (+91 {phone}) Verified Successfully!</span>
                </div>
              )}
            </div>

            <button
              disabled={!isPhoneVerified}
              onClick={() => setStep(2)}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                isPhoneVerified
                  ? 'bg-[#0A1428] text-white hover:bg-[#C5A880]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Store Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Store Information */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Store Profile & Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Owner / Vendor Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={businessInfo.vendor_name}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, vendor_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Store / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Green Leaf Organics & Bakery"
                  value={businessInfo.store_name}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, store_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Business Email</label>
                <input
                  type="email"
                  placeholder="vendor@store.com"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Store Category</label>
                <select
                  value={businessInfo.category}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium bg-white"
                >
                  <option>Grocery & Staples</option>
                  <option>Bakery & Confectionery</option>
                  <option>Fresh Fruits & Vegetables</option>
                  <option>Pharmacy & Wellness</option>
                  <option>Dairy & Poultry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">GSTIN Number (Optional)</label>
              <input
                type="text"
                placeholder="07AAAAA0000A1Z5"
                value={businessInfo.gst_number}
                onChange={(e) => setBusinessInfo({ ...businessInfo, gst_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-[#0A1428] text-white font-bold text-xs rounded-xl hover:bg-[#C5A880] transition-colors uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <span>Proceed to KYC Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: KYC Document Verification Upload */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Business Verification & KYC</h3>
            <p className="text-xs text-gray-500 mb-4">Upload identity & registration documents for society RWA trust compliance.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-[#C5A880] transition-colors bg-[#FAF9F6]">
                <Upload className="w-8 h-8 text-[#C5A880] mx-auto mb-2" />
                <h4 className="text-xs font-bold text-gray-800">Govt ID / Aadhaar Card</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Front & Back PDF / JPG</p>
                <button
                  onClick={() => setKycDocs({ ...kycDocs, idProofUploaded: true })}
                  className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-bold ${
                    kycDocs.idProofUploaded
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {kycDocs.idProofUploaded ? '✓ Uploaded' : 'Choose File'}
                </button>
              </div>

              <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-[#C5A880] transition-colors bg-[#FAF9F6]">
                <Upload className="w-8 h-8 text-[#C5A880] mx-auto mb-2" />
                <h4 className="text-xs font-bold text-gray-800">FSSAI License / Shop Establishment</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Registration certificate</p>
                <button
                  onClick={() => setKycDocs({ ...kycDocs, addressProofUploaded: true })}
                  className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-bold ${
                    kycDocs.addressProofUploaded
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {kycDocs.addressProofUploaded ? '✓ Uploaded' : 'Choose File'}
                </button>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-[#0A1428] text-white font-bold text-xs rounded-xl hover:bg-[#C5A880] transition-colors uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <span>Proceed to Catalog Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Initial Catalog & Final Submission */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Add First Store Offering</h3>
            <p className="text-xs text-gray-500 mb-4">Create your first catalog item so residents can immediately order.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Item / Product Name</label>
                <input
                  type="text"
                  value={initialProduct.item_name}
                  onChange={(e) => setInitialProduct({ ...initialProduct, item_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={initialProduct.price}
                  onChange={(e) => setInitialProduct({ ...initialProduct, price: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs">
              <div className="flex items-center space-x-2 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Onboarding Pre-Checks Complete!</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Your store will be activated for <strong>{societyName}</strong> residents immediately upon submission.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (onCompleteOnboarding) {
                    onCompleteOnboarding({ societyId, societyName, phone, ...businessInfo, initialProduct });
                  }
                }}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Complete Store Onboarding</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
