import React, { useState } from 'react';
import { Building2, ShieldCheck, CheckCircle2, Lock, ArrowRight, ArrowLeft, Upload, Store, Smartphone, AlertCircle, Sparkles } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden my-8 bento-card">
      {/* Stepper Header in Deep Forest Green */}
      <div className="bg-primary text-primary-foreground p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="px-3.5 py-1 bg-primary-foreground/20 text-gold border border-primary-foreground/30 text-[11px] font-extrabold rounded-full uppercase tracking-wider">
              Vendor Onboarding Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-black mt-2 text-primary-foreground">Register Store for {societyName}</h2>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="text-primary-foreground/70 hover:text-primary-foreground text-xs font-bold uppercase tracking-wider">
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
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                step === s.num
                  ? 'bg-gold text-ink ring-4 ring-gold/30 scale-105'
                  : step > s.num
                  ? 'bg-primary-foreground text-primary font-black'
                  : 'bg-primary-foreground/15 text-primary-foreground/60'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[10px] font-semibold mt-1 text-center hidden sm:block ${
                step === s.num ? 'text-gold font-black' : 'text-primary-foreground/70'
              }`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Pre-Selected Society & Mobile OTP */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-secondary border border-border flex items-start space-x-3">
              <Lock className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-ink uppercase tracking-wider">Target Society Locked</h4>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  You are registering your vendor profile specifically for residential society:
                </p>
                <div className="mt-2 text-sm font-bold text-ink bg-card px-3.5 py-1.5 rounded-xl border border-border inline-block">
                  🏛️ {societyName} (ID: #{societyId})
                </div>
              </div>
            </div>

            {/* Read-Only Society Field */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Assigned Society Name (Read-Only)
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={societyName}
                className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-ink font-extrabold text-sm cursor-not-allowed"
              />
            </div>

            {/* Mobile OTP Verification */}
            <div className="border-t border-border pt-5 space-y-4">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-gold" />
                <span>Vendor Mobile Phone Authentication</span>
              </h4>

              {otpError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold">
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
                    className="flex-1 px-4 py-3.5 rounded-2xl bg-background border-2 border-border text-sm font-semibold focus:outline-none focus:border-primary text-ink"
                  />
                  <button
                    onClick={handleSendOTP}
                    className="px-6 py-3.5 bg-gold hover:bg-primary text-ink hover:text-primary-foreground font-black text-xs rounded-full transition-all duration-300 uppercase tracking-wider shadow-md border border-gold/40 cursor-pointer"
                  >
                    Send OTP
                  </button>
                </div>
              ) : !isPhoneVerified ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-semibold">
                    OTP sent to +91 {phone}. Demo verification code: <span className="font-black text-gold bg-secondary px-2 py-0.5 rounded-md border border-border">1234</span>
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-36 px-4 py-3 rounded-2xl bg-background border-2 border-border text-center font-mono font-black text-lg text-ink focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleVerifyOTP}
                      className="px-6 py-3 bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs rounded-full transition-all duration-300 uppercase tracking-wider shadow-md cursor-pointer"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-primary/10 border border-primary/30 text-primary rounded-2xl text-xs font-black flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-gold" />
                  <span>Mobile Phone (+91 {phone}) Verified Successfully!</span>
                </div>
              )}
            </div>

            <button
              disabled={!isPhoneVerified}
              onClick={() => setStep(2)}
              className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-300 ${
                isPhoneVerified
                  ? 'bg-primary hover:bg-gold text-primary-foreground hover:text-ink shadow-lg cursor-pointer group'
                  : 'bg-secondary text-muted-foreground border-2 border-border cursor-not-allowed'
              }`}
            >
              <span>Continue to Store Details</span>
              <ArrowRight className="w-4 h-4 text-gold group-hover:text-ink transition-colors" />
            </button>
          </div>
        )}

        {/* STEP 2: Store Information */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-2">Store Profile & Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-ink uppercase mb-1">Owner / Vendor Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={businessInfo.vendor_name}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, vendor_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-background border-2 border-border text-xs font-semibold text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink uppercase mb-1">Store / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Green Leaf Organics & Bakery"
                  value={businessInfo.store_name}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, store_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-background border-2 border-border text-xs font-semibold text-ink focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-ink uppercase mb-1">Business Email</label>
                <input
                  type="email"
                  placeholder="vendor@store.com"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-background border-2 border-border text-xs font-semibold text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink uppercase mb-1">Primary Store Category</label>
                <select
                  value={businessInfo.category}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-background border-2 border-border text-xs font-black text-ink focus:outline-none focus:border-primary"
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
              <label className="block text-xs font-black text-ink uppercase mb-1">GSTIN Number (Optional)</label>
              <input
                type="text"
                placeholder="07AAAAA0000A1Z5"
                value={businessInfo.gst_number}
                onChange={(e) => setBusinessInfo({ ...businessInfo, gst_number: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-background border-2 border-border text-xs font-semibold text-ink focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3.5 rounded-full border-2 border-border bg-secondary text-ink font-extrabold text-xs uppercase tracking-wider hover:bg-border transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs rounded-full transition-all duration-300 uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg border border-primary/20 group cursor-pointer"
              >
                <span>Proceed to KYC Verification</span>
                <ArrowRight className="w-4 h-4 text-gold group-hover:text-ink transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: KYC Document Verification Upload */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-1">Business Verification & KYC</h3>
            <p className="text-xs text-muted-foreground mb-4 font-semibold">Upload identity & registration documents for society RWA trust compliance.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 border-2 border-dashed border-border rounded-2xl text-center hover:border-primary transition-colors bg-secondary">
                <Upload className="w-8 h-8 text-gold mx-auto mb-2" />
                <h4 className="text-xs font-black text-ink">Govt ID / Aadhaar Card</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">Front & Back PDF / JPG</p>
                <button
                  onClick={() => setKycDocs({ ...kycDocs, idProofUploaded: true })}
                  className={`mt-4 px-6 py-2.5 rounded-full text-xs font-black transition-all shadow-sm cursor-pointer ${
                    kycDocs.idProofUploaded
                      ? 'bg-primary text-primary-foreground border border-primary'
                      : 'bg-card border-2 border-border text-ink hover:bg-gold hover:border-gold'
                  }`}
                >
                  {kycDocs.idProofUploaded ? '✓ Uploaded' : 'Choose File'}
                </button>
              </div>

              <div className="p-5 border-2 border-dashed border-border rounded-2xl text-center hover:border-primary transition-colors bg-secondary">
                <Upload className="w-8 h-8 text-gold mx-auto mb-2" />
                <h4 className="text-xs font-black text-ink">FSSAI License / Shop Establishment</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">Registration certificate</p>
                <button
                  onClick={() => setKycDocs({ ...kycDocs, addressProofUploaded: true })}
                  className={`mt-4 px-6 py-2.5 rounded-full text-xs font-black transition-all shadow-sm cursor-pointer ${
                    kycDocs.addressProofUploaded
                      ? 'bg-primary text-primary-foreground border border-primary'
                      : 'bg-card border-2 border-border text-ink hover:bg-gold hover:border-gold'
                  }`}
                >
                  {kycDocs.addressProofUploaded ? '✓ Uploaded' : 'Choose File'}
                </button>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3.5 rounded-full border-2 border-border bg-secondary text-ink font-extrabold text-xs uppercase tracking-wider hover:bg-border transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-4 bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs rounded-full transition-all duration-300 uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg border border-primary/20 group cursor-pointer"
              >
                <span>Proceed to Catalog Setup</span>
                <ArrowRight className="w-4 h-4 text-gold group-hover:text-ink transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Initial Catalog & Final Submission */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-1">Add First Store Offering</h3>
            <p className="text-xs text-muted-foreground mb-4 font-semibold">Create your first catalog item so residents can immediately order.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-ink uppercase mb-1">Item / Product Name</label>
                <input
                  type="text"
                  value={initialProduct.item_name}
                  onChange={(e) => setInitialProduct({ ...initialProduct, item_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-background border-2 border-border text-xs font-semibold text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink uppercase mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={initialProduct.price}
                  onChange={(e) => setInitialProduct({ ...initialProduct, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-background border-2 border-border text-xs font-semibold text-ink focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="p-4 bg-secondary border-2 border-border rounded-2xl text-ink text-xs space-y-1">
              <div className="flex items-center space-x-2 font-black mb-1">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>Onboarding Pre-Checks Complete!</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-semibold">
                Your store will be activated for <strong>{societyName}</strong> residents immediately upon submission.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3.5 rounded-full border-2 border-border bg-secondary text-ink font-extrabold text-xs uppercase tracking-wider hover:bg-border transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (onCompleteOnboarding) {
                    onCompleteOnboarding({ societyId, societyName, phone, ...businessInfo, initialProduct });
                  }
                }}
                className="flex-1 py-4 bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs rounded-full transition-all duration-300 uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl border border-primary/20 group cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-gold group-hover:text-ink transition-colors" />
                <span>Complete Store Onboarding</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

