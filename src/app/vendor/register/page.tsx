'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Upload, Smartphone, Store, Clock, Plus, Tag } from 'lucide-react';

function VendorRegisterContent() {
  const searchParams = useSearchParams();
  const rawSocietyId = searchParams.get('societyId') || '101';
  const rawSocietyName = searchParams.get('societyName') || 'Greenwood Heights';

  const [societyId] = useState(rawSocietyId);
  const [societyName] = useState(rawSocietyName);

  // Stepper State (3 Steps)
  const [step, setStep] = useState<number>(1);
  const STATIC_OTP = '123456';

  // Step 1 State: Locked Society Info & Business Profile
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [step1Error, setStep1Error] = useState('');

  // Step 2 State: Phone OTP Authentication & KYC Document
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [kycFileUploaded, setKycFileUploaded] = useState(false);
  const [step2Error, setStep2Error] = useState('');

  // Step 3 State: Catalog Item Setup
  const [itemName, setItemName] = useState('Fresh Whole Milk');
  const [itemPrice, setItemPrice] = useState('65');
  const [itemUnit, setItemUnit] = useState('per item');
  const [isRegistrationSubmitted, setIsRegistrationSubmitted] = useState(false);

  // Step 1 Validation
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setStep1Error('Please enter your Vendor Business Name before continuing.');
      return;
    }
    setStep1Error('');
    setStep(2);
  };

  // OTP Handlers
  const handleSendOTP = () => {
    if (phoneNumber.length < 10) {
      setStep2Error('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    setStep2Error('');
    setOtpSent(true);
  };

  const handleVerifyOTP = () => {
    if (otpCode !== STATIC_OTP) {
      setStep2Error('Invalid verification code. Please try again.');
      return;
    }
    setStep2Error('');
    setIsPhoneVerified(true);
  };

  const handleStep2Next = () => {
    if (!isPhoneVerified) {
      setStep2Error('Please complete phone OTP verification first.');
      return;
    }
    if (!kycFileUploaded) {
      setStep2Error('Please upload your Aadhaar/PAN Card KYC document.');
      return;
    }
    setStep2Error('');
    setStep(3);
  };

  // Step 3 Submit Registration
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistrationSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2229] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#C5A880]/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => (window.location.href = '/')}>
            <div className="w-10 h-10 rounded-xl bg-[#0A1428] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] font-bold text-lg">
              DL
            </div>
            <div>
              <span className="font-serif font-extrabold text-lg text-[#0A1428] tracking-wider uppercase block leading-none">
                DigiLocal
              </span>
              <span className="text-[10px] text-[#C5A880] font-semibold uppercase tracking-widest">
                Vendor Onboarding
              </span>
            </div>
          </div>

          <button
            onClick={() => (window.location.href = '/')}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider"
          >
            ← Back to Homepage
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        {isRegistrationSubmitted ? (
          /* Success Screen with Pending Admin Approval Badge */
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#C5A880]/30 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-md">
              <Clock className="w-10 h-10" />
            </div>

            <div>
              {/* Pending Admin Approval Badge */}
              <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-extrabold text-xs uppercase tracking-wider mb-3">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending Admin Approval</span>
              </span>

              <h2 className="text-2xl font-serif font-extrabold text-[#0A1428] uppercase tracking-wide mt-2">
                Registration Submitted!
              </h2>
              <p className="text-xs text-gray-600 max-w-md mx-auto mt-2 leading-relaxed">
                Thank you for applying to serve <strong>{societyName}</strong>. Your vendor application and KYC documents have been received and are currently under review by platform admins.
              </p>
            </div>

            {/* Registration Summary Card */}
            <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#C5A880]/30 max-w-md mx-auto text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Assigned Society:</span>
                <span className="font-bold text-[#0A1428]">{societyName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Business Name:</span>
                <span className="font-bold text-[#0A1428]">{businessName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Service Category:</span>
                <span className="font-bold text-[#0A1428]">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Verified Mobile:</span>
                <span className="font-bold text-emerald-700">+91 {phoneNumber}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-3.5 bg-[#0A1428] hover:bg-[#C5A880] text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors shadow-md"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        ) : (
          /* 3-Step Stepper Wizard Form */
          <div className="bg-white rounded-3xl shadow-xl border border-[#C5A880]/30 overflow-hidden">
            
            {/* Stepper Header */}
            <div className="bg-[#0A1428] text-white p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="px-3 py-1 bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/30 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    Vendor Registration Portal
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-extrabold mt-1">
                    Become a Society Vendor
                  </h2>
                </div>

                <div className="text-right text-xs text-[#C5A880] font-extrabold">
                  Step {step} of 3
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { num: 1, label: '1. Society Info' },
                  { num: 2, label: '2. Auth & KYC' },
                  { num: 3, label: '3. Catalog Setup' },
                ].map((s) => (
                  <div key={s.num} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                        step === s.num
                          ? 'bg-[#C5A880] text-[#0A1428] ring-4 ring-[#C5A880]/30'
                          : step > s.num
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-1.5 text-center ${
                        step === s.num ? 'text-[#C5A880]' : 'text-gray-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              
              {/* STEP 1: SOCIETY INFO (LOCKED / READ-ONLY) */}
              {step === 1 && (
                <form onSubmit={handleStep1Next} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#C5A880]/30 flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-[#C5A880] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold text-[#0A1428] uppercase tracking-wider">
                        Assigned Society Pre-Selected & Locked
                      </h4>
                      <p className="text-xs text-[#787F8C] mt-0.5">
                        Your business application is anchored to the society portal you selected.
                      </p>
                    </div>
                  </div>

                  {/* Locked Pre-Filled Society Input Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Society Name (Locked / Read-Only)</span>
                      <span className="text-[10px] text-amber-600 font-bold flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Non-Editable</span>
                      </span>
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={societyName}
                        className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 font-extrabold text-sm cursor-not-allowed select-none"
                      />
                      <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {step1Error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                      {step1Error}
                    </div>
                  )}

                  {/* Vendor Business Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Vendor Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fresh Daily Supermarket & Dairy"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>

                  {/* Category Select Options */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Service Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-medium bg-white focus:ring-2 focus:ring-[#C5A880]"
                    >
                      <option value="Milk">Milk & Dairy</option>
                      <option value="Laundry">Laundry & Dry Cleaning</option>
                      <option value="Grocery">Grocery & Daily Essentials</option>
                      <option value="Electrician">Electrician & Plumbing</option>
                      <option value="Bakery">Bakery & Confectionery</option>
                      <option value="Pharmacy">Pharmacy & Wellness</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#0A1428] hover:bg-[#C5A880] text-white font-bold text-xs rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md mt-4"
                  >
                    <span>Proceed to Auth & KYC</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: AUTHENTICATION & KYC */}
              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
                    Authentication & KYC Verification
                  </h3>

                  {step2Error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                      {step2Error}
                    </div>
                  )}

                  {/* Phone Number & Send OTP Button */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Mobile Phone Number *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10-digit phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#C5A880]"
                      />
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="px-5 py-3 bg-[#0A1428] hover:bg-[#C5A880] text-white font-bold text-xs rounded-xl transition-colors uppercase tracking-wider"
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>

                  {/* OTP Verification Input (6 Digits) */}
                  {otpSent && (
                    <div className="space-y-3 border-t border-gray-100 pt-4">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        6-Digit Verification Code
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-44 px-4 py-3 rounded-xl border border-gray-300 font-mono font-bold text-center text-lg tracking-widest focus:ring-2 focus:ring-[#C5A880]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors uppercase tracking-wider"
                        >
                          Verify OTP
                        </button>
                      </div>

                      {isPhoneVerified && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Phone Number Verified Successfully!</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* File Upload Zone for Aadhaar/PAN Card */}
                  <div className="border-t border-gray-100 pt-4">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Upload Vendor KYC (Aadhaar / PAN Card) *
                    </label>

                    <div className="p-5 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-[#FAF9F6] hover:border-[#C5A880] transition-colors">
                      <Upload className="w-8 h-8 text-[#C5A880] mx-auto mb-2" />
                      <h4 className="text-xs font-bold text-gray-800">Drag & Drop Identity Proof</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Supports PDF, JPG, PNG (Max 5MB)</p>

                      <button
                        type="button"
                        onClick={() => setKycFileUploaded(!kycFileUploaded)}
                        className={`mt-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          kycFileUploaded
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {kycFileUploaded ? '✓ Document Uploaded (Aadhaar_Front.pdf)' : 'Choose File'}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleStep2Next}
                      className="flex-1 py-3 bg-[#0A1428] hover:bg-[#C5A880] text-white font-bold text-xs rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center space-x-2"
                    >
                      <span>Proceed to Catalog Setup</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CATALOG SETUP */}
              {step === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-5">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
                    Catalog Item Setup
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Add your primary item offering to enable resident ordering.</p>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Organic Farm Fresh Milk (1L)"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="65"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Unit *
                      </label>
                      <select
                        value={itemUnit}
                        onChange={(e) => setItemUnit(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium bg-white focus:ring-2 focus:ring-[#C5A880]"
                      >
                        <option value="per item">per item</option>
                        <option value="per kg">per kg</option>
                        <option value="per month">per month</option>
                        <option value="per service">per service</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#C5A880]/30 text-xs space-y-1">
                    <div className="font-bold text-[#0A1428] uppercase tracking-wider flex items-center space-x-1 mb-1">
                      <Tag className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Item Preview</span>
                    </div>
                    <div className="flex justify-between text-gray-700 font-medium">
                      <span>{itemName || 'Item Name'}</span>
                      <span className="font-extrabold text-[#0A1428]">₹{itemPrice || '0'} / {itemUnit}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Registration</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <p>© 2026 DigiLocal Vendor Network. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function VendorRegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-500">Loading registration form...</div>}>
      <VendorRegisterContent />
    </Suspense>
  );
}
