import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, ArrowRight, ShieldCheck, Upload, Smartphone, Store, Clock, Tag, Sparkles, Building2, CreditCard } from 'lucide-react';
import { api } from '../services/api';
import DummyPaymentModal from '../components/DummyPaymentModal';

export default function VendorRegisterPage({ currentRoute, setRoute, setActiveVendor }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Societies List for interactive selection
  const [societiesList, setSocietiesList] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState(currentRoute?.societyId || '101');
  const [societyName, setSocietyName] = useState(currentRoute?.societyName || 'Greenwood Heights');

  // Load Societies list on mount
  useEffect(() => {
    api.getSocieties().then((data) => {
      if (data && data.length > 0) {
        setSocietiesList(data);
        if (!currentRoute?.societyId && !currentRoute?.societyName) {
          setSelectedSocietyId(data[0].society_id);
          setSocietyName(data[0].society_name);
        } else if (currentRoute?.societyId) {
          const match = data.find(s => String(s.society_id) === String(currentRoute.societyId));
          if (match) setSocietyName(match.society_name);
        }
      }
    }).catch(() => {
      setSocietiesList([
        { society_id: 'SOC-101', society_name: 'Omaxe Greenwood Residency', location: 'Sector Greenwood, Omega II, Greater Noida', image_url: 'https://static.squareyards.com/resources/images/noida/project-image/omaxe-greenwood-project-project-large-image1-2275.jpg' },
        { society_id: 'SOC-102', society_name: 'Palm Meadows Residency', location: 'Whitefield, Bengaluru', image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80' },
        { society_id: 'SOC-103', society_name: 'DLF Phase 5 Enclave', location: 'Golf Course Road, Gurugram', image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80' },
        { society_id: 'SOC-104', society_name: 'Godrej Woods Community', location: 'Sector 43, Noida', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80' },
        { society_id: 'SOC-105', society_name: 'Jaypee Greens Wish Town', location: 'Sector 128, Noida', image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80' },
        { society_id: 'SOC-106', society_name: 'ATS Village Gated Complex', location: 'Sector 93A, Noida', image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80' }
      ]);
    });
  }, [currentRoute]);

  // Stepper State (3 Steps)
  const [step, setStep] = useState(1);
  const STATIC_OTP = '123456';

  // Step 1 State: Society Info & Business Profile
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

  // Field-level Error State for Red Border Highlighting
  const [fieldErrors, setFieldErrors] = useState({});

  // Step 1 Validation
  const handleStep1Next = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!societyName || !societyName.trim()) {
      newErrors.societyName = 'Society Name is required.';
    }
    if (!businessName || !businessName.trim()) {
      newErrors.businessName = 'Vendor Business Name is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setStep1Error('Please fill out all required fields highlighted in red before continuing.');
      return;
    }

    setFieldErrors({});
    setStep1Error('');
    setStep(2);
  };

  // OTP Handlers
  const handleSendOTP = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setFieldErrors((prev) => ({ ...prev, phoneNumber: 'Valid 10-digit mobile number is required.' }));
      setStep2Error('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }));
    setStep2Error('');
    setOtpSent(true);
  };

  const handleVerifyOTP = () => {
    if (otpCode !== STATIC_OTP) {
      setFieldErrors((prev) => ({ ...prev, otpCode: 'Invalid OTP code.' }));
      setStep2Error(`Invalid OTP. For testing, please enter static demo code "${STATIC_OTP}".`);
      return;
    }
    setFieldErrors((prev) => ({ ...prev, otpCode: undefined }));
    setStep2Error('');
    setIsPhoneVerified(true);
  };

  const handleStep2Next = () => {
    const newErrors = {};
    if (!phoneNumber || phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Mobile phone number is required.';
    }
    if (!isPhoneVerified) {
      newErrors.otpCode = 'Phone OTP verification is required.';
    }
    if (!kycFileUploaded) {
      newErrors.kycFile = 'KYC document upload is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setStep2Error('Please complete all required fields highlighted in red before proceeding.');
      return;
    }

    setFieldErrors({});
    setStep2Error('');
    setStep(3);
  };

  // Step 3 Submit Registration
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!itemName || !itemName.trim()) {
      newErrors.itemName = 'Catalog item name is required.';
    }
    if (!itemPrice || Number(itemPrice) <= 0) {
      newErrors.itemPrice = 'Valid item price is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setIsRegistrationSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 px-3 sm:px-6">
      
      {/* Top Banner */}
      <div className="max-w-3xl mx-auto pt-4 pb-6">
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 text-center shadow-sm">
          <span className="px-3.5 py-1 text-xs font-bold bg-secondary text-ink rounded-full inline-flex items-center gap-1.5 uppercase tracking-wider mb-2 border border-border">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Vendor Onboarding Portal</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink uppercase tracking-wide mt-1">
            Register as a Society Vendor
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">
            Join the verified hyper-local resident delivery network
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto">
        {isRegistrationSubmitted ? (
          /* Success Screen with Pending Admin Approval Badge */
          <div className="bg-card rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-border text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-secondary border border-border text-gold flex items-center justify-center mx-auto shadow-md">
              <Clock className="w-10 h-10 text-gold" />
            </div>

            <div>
              {/* Pending Admin Approval Badge */}
              <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-secondary text-ink border border-border font-extrabold text-xs uppercase tracking-wider mb-3">
                <Clock className="w-4 h-4 text-gold" />
                <span>Pending Admin Approval</span>
              </span>

              <h2 className="text-2xl font-serif font-extrabold text-ink uppercase tracking-wide mt-2">
                Registration Submitted!
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed font-medium">
                Thank you for applying to serve <strong>{societyName}</strong>. Your vendor application and KYC documents have been received and are currently under review by platform admins.
              </p>
            </div>

            {/* Registration Summary Card */}
            <div className="p-6 bg-secondary/50 rounded-[1.75rem] border border-border max-w-md mx-auto text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Target Society:</span>
                <span className="font-bold text-ink">{societyName}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Business Name:</span>
                <span className="font-bold text-ink">{businessName}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Service Category:</span>
                <span className="font-bold text-ink">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified Mobile:</span>
                <span className="font-bold text-primary">+91 {phoneNumber}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setRoute({ page: 'home' })}
                className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs rounded-full uppercase tracking-wider transition-colors shadow-md"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        ) : (
          /* 3-Step Stepper Wizard Form */
          <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden bento-card">
            
            {/* Stepper Header in Deep Forest Green */}
            <div className="bg-primary text-primary-foreground p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="px-3.5 py-1 bg-primary-foreground/20 text-gold border border-primary-foreground/30 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    Vendor Onboarding Form
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-black mt-2 text-primary-foreground">
                    Onboard Store for {societyName || 'Society'}
                  </h2>
                </div>

                <div className="text-right text-xs text-gold font-extrabold">
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
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        step === s.num
                          ? 'bg-gold text-ink ring-4 ring-gold/30 scale-105'
                          : step > s.num
                          ? 'bg-primary-foreground text-primary font-black'
                          : 'bg-primary-foreground/15 text-primary-foreground/60'
                      }`}
                    >
                      {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 text-center ${
                        step === s.num ? 'text-gold font-black' : 'text-primary-foreground/70'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              
              {/* STEP 1: SOCIETY SELECTION & BUSINESS PROFILE */}
              {step === 1 && (
                <form onSubmit={handleStep1Next} className="space-y-6">
                  <div className="p-4 rounded-2xl bg-secondary border border-border flex items-start space-x-3">
                    <Building2 className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-ink uppercase tracking-wider">
                        Target Residential Society
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        Type the housing society name where your store will provide doorstep delivery to residents.
                      </p>
                    </div>
                  </div>

                  {/* Single Clean Typable Text Input Field for Society Name */}
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                      Society Name *
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type your housing society name (e.g. Greenwood Heights, Sector 62)..."
                        value={societyName}
                        onChange={(e) => {
                          setSocietyName(e.target.value);
                          if (fieldErrors.societyName) setFieldErrors((prev) => ({ ...prev, societyName: undefined }));
                        }}
                        className={`w-full px-4 py-3.5 rounded-2xl bg-background transition-all text-ink font-extrabold text-sm shadow-sm ${
                          fieldErrors.societyName 
                            ? 'border-2 border-rose-500 ring-4 ring-rose-500/20 bg-rose-500/5' 
                            : 'border border-border focus:ring-2 focus:ring-primary focus:border-primary'
                        }`}
                      />
                    </div>
                    {fieldErrors.societyName && (
                      <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.societyName}
                      </p>
                    )}
                  </div>


                  {step1Error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold rounded-2xl">
                      {step1Error}
                    </div>
                  )}

                  {/* Vendor Business Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                      Vendor Business Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Fresh Daily Supermarket & Dairy"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        if (fieldErrors.businessName) setFieldErrors((prev) => ({ ...prev, businessName: undefined }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-2xl bg-background transition-all text-ink text-xs font-medium ${
                        fieldErrors.businessName 
                          ? 'border-2 border-rose-500 ring-4 ring-rose-500/20 bg-rose-500/5' 
                          : 'border border-border focus:ring-2 focus:ring-primary focus:border-primary'
                      }`}
                    />
                    {fieldErrors.businessName && (
                      <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.businessName}
                      </p>
                    )}
                  </div>

                  {/* Category Select Options */}
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                      Service Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-background border border-border text-ink text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-primary"
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
                    className="w-full py-4 bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs rounded-full transition-all duration-300 uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl border border-primary/20 group cursor-pointer mt-4"
                  >
                    <span>Proceed to Auth & KYC</span>
                    <ArrowRight className="w-4 h-4 text-gold group-hover:text-ink transition-colors" />
                  </button>
                </form>
              )}

              {/* STEP 2: AUTHENTICATION & KYC */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-1">
                    Authentication & KYC Verification
                  </h3>

                  {step2Error && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold rounded-2xl">
                      {step2Error}
                    </div>
                  )}

                  {/* Phone Number & Send OTP Button */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-ink uppercase tracking-wider mb-1">
                      Mobile Phone Number *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10-digit phone number"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (fieldErrors.phoneNumber) setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                        }}
                        className={`flex-1 px-4 py-3.5 rounded-2xl bg-background text-ink text-xs font-semibold transition-all ${
                          fieldErrors.phoneNumber 
                            ? 'border-2 border-rose-500 ring-4 ring-rose-500/20 bg-rose-500/5' 
                            : 'border-2 border-border focus:outline-none focus:border-primary'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="px-6 py-3.5 bg-gold hover:bg-primary text-ink hover:text-primary-foreground font-black text-xs rounded-full transition-all duration-300 uppercase tracking-wider shadow-md border border-gold/40 cursor-pointer"
                      >
                        Send OTP
                      </button>
                    </div>
                    {fieldErrors.phoneNumber && (
                      <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* OTP Verification Input (6 Digits) */}
                  {otpSent && (
                    <div className="space-y-3 border-t border-border pt-4">
                      <label className="block text-xs font-black text-ink uppercase tracking-wider mb-1">
                        6-Digit Verification Code (Demo code: <span className="text-gold font-black bg-secondary px-2 py-0.5 rounded-md border border-border">123456</span>)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => {
                            setOtpCode(e.target.value);
                            if (fieldErrors.otpCode) setFieldErrors((prev) => ({ ...prev, otpCode: undefined }));
                          }}
                          className={`w-44 px-4 py-3 rounded-2xl bg-background font-mono font-black text-center text-lg text-ink tracking-widest transition-all ${
                            fieldErrors.otpCode 
                              ? 'border-2 border-rose-500 ring-4 ring-rose-500/20 bg-rose-500/5' 
                              : 'border-2 border-border focus:outline-none focus:border-primary'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          className="px-6 py-3 bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs rounded-full transition-all duration-300 uppercase tracking-wider shadow-md cursor-pointer"
                        >
                          Verify OTP
                        </button>
                      </div>
                      {fieldErrors.otpCode && (
                        <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.otpCode}
                        </p>
                      )}

                      {isPhoneVerified && (
                        <div className="p-3.5 bg-primary/10 border border-primary/30 text-primary rounded-2xl text-xs font-black flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-gold" />
                          <span>Phone Number Verified Successfully!</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* File Upload Zone for Aadhaar/PAN Card */}
                  <div className="border-t border-border pt-4">
                    <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                      Upload Vendor KYC (Aadhaar / PAN Card) *
                    </label>

                    <div className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${
                      fieldErrors.kycFile 
                        ? 'border-rose-500 ring-4 ring-rose-500/20 bg-rose-500/5' 
                        : kycFileUploaded 
                        ? 'border-emerald-500 bg-emerald-50/30' 
                        : 'border-border bg-secondary hover:border-primary'
                    }`}>
                      <Upload className="w-8 h-8 text-gold mx-auto mb-2" />
                      <h4 className="text-xs font-black text-ink">Drag & Drop Identity Proof</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">Supports PDF, JPG, PNG (Max 5MB)</p>

                      <button
                        type="button"
                        onClick={() => {
                          setKycFileUploaded(!kycFileUploaded);
                          if (fieldErrors.kycFile) setFieldErrors((prev) => ({ ...prev, kycFile: undefined }));
                        }}
                        className={`mt-4 px-6 py-2.5 rounded-full text-xs font-black transition-all shadow-sm cursor-pointer ${
                          kycFileUploaded
                            ? 'bg-primary text-primary-foreground border border-primary'
                            : 'bg-card border-2 border-border text-ink hover:bg-gold hover:border-gold'
                        }`}
                      >
                        {kycFileUploaded ? '✓ Document Uploaded (Aadhaar_Front.pdf)' : 'Choose File'}
                      </button>
                    </div>
                    {fieldErrors.kycFile && (
                      <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.kycFile}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3.5 rounded-full border-2 border-border bg-secondary text-ink font-extrabold text-xs uppercase tracking-wider hover:bg-border transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleStep2Next}
                      className="flex-1 py-4 bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs rounded-full transition-all duration-300 uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg border border-primary/20 group cursor-pointer"
                    >
                      <span>Proceed to Catalog Setup</span>
                      <ArrowRight className="w-4 h-4 text-gold group-hover:text-ink transition-colors" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CATALOG SETUP */}
              {step === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  <h3 className="text-sm font-black text-ink uppercase tracking-wider mb-1">
                    Catalog Item Setup
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 font-semibold">Add your primary item offering to enable resident ordering.</p>

                  <div>
                    <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Organic Farm Fresh Milk (1L)"
                      value={itemName}
                      onChange={(e) => {
                        setItemName(e.target.value);
                        if (fieldErrors.itemName) setFieldErrors((prev) => ({ ...prev, itemName: undefined }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-2xl bg-background text-ink text-xs font-semibold transition-all ${
                        fieldErrors.itemName 
                          ? 'border-2 border-rose-500 ring-4 ring-rose-500/20 bg-rose-500/5' 
                          : 'border-2 border-border focus:outline-none focus:border-primary'
                      }`}
                    />
                    {fieldErrors.itemName && (
                      <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.itemName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        placeholder="65"
                        value={itemPrice}
                        onChange={(e) => {
                          setItemPrice(e.target.value);
                          if (fieldErrors.itemPrice) setFieldErrors((prev) => ({ ...prev, itemPrice: undefined }));
                        }}
                        className={`w-full px-4 py-3.5 rounded-2xl bg-background text-ink text-xs font-semibold transition-all ${
                          fieldErrors.itemPrice 
                            ? 'border-2 border-rose-500 ring-4 ring-rose-500/20 bg-rose-500/5' 
                            : 'border-2 border-border focus:outline-none focus:border-primary'
                        }`}
                      />
                      {fieldErrors.itemPrice && (
                        <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.itemPrice}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-black text-ink uppercase tracking-wider mb-2">
                        Unit *
                      </label>
                      <select
                        value={itemUnit}
                        onChange={(e) => setItemUnit(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-background border-2 border-border text-ink text-xs font-black focus:outline-none focus:border-primary"
                      >
                        <option value="per item">per item</option>
                        <option value="per kg">per kg</option>
                        <option value="per month">per month</option>
                        <option value="per service">per service</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary rounded-2xl border-2 border-border text-xs space-y-2">
                    <div className="font-black text-ink uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                      <Tag className="w-4 h-4 text-gold" />
                      <span>Item Preview</span>
                    </div>
                    <div className="flex justify-between text-ink font-semibold">
                      <span>{itemName || 'Item Name'}</span>
                      <span className="font-black text-primary text-sm">₹{itemPrice || '0'} / {itemUnit}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-3.5 rounded-full border-2 border-border bg-secondary text-ink font-extrabold text-xs uppercase tracking-wider hover:bg-border transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newErrors = {};
                        if (!itemName || !itemName.trim()) newErrors.itemName = 'Catalog item name is required.';
                        if (!itemPrice || Number(itemPrice) <= 0) newErrors.itemPrice = 'Valid item price is required.';
                        if (Object.keys(newErrors).length > 0) {
                          setFieldErrors(newErrors);
                          return;
                        }
                        setFieldErrors({});
                        setShowPaymentModal(true);
                      }}
                      className="flex-1 py-4 bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs rounded-full transition-all duration-300 uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl border border-primary/20 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-gold" />
                      <span>Pay ₹2,999 Subscription (Dummy Payment)</span>
                    </button>

                    <button
                      type="submit"
                      className="py-3.5 px-5 bg-background border-2 border-border hover:bg-secondary text-ink font-extrabold text-xs rounded-full transition-all uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-gold" />
                      <span>Submit Free Trial</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}
      </main>

      {/* Subscription Dummy Payment Gateway Modal */}
      <DummyPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={2999}
        title="Vendor Partner Annual Subscription"
        description={`Registering store: ${businessName || 'Your Store'} at ${societyName}`}
        onSuccess={(txn) => {
          setShowPaymentModal(false);
          setIsRegistrationSubmitted(true);
        }}
      />

    </div>
  );
}

