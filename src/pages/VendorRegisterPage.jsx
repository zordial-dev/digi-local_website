import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Store, 
  Building2, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X, 
  MapPin, 
  Hash, 
  Briefcase, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { gsap } from 'gsap';
import { api } from '../services/api';
import CountryCodePicker from '../components/CountryCodePicker';

export default function VendorRegisterPage({ currentRoute, setRoute, setActiveVendor }) {
  // Stepper State (1: Business Info, 2: Shop Details, 3: Verify & Finish)
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Business Info States
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phonePlaceholder, setPhonePlaceholder] = useState('e.g. 98765 43210');
  const [emailAddress, setEmailAddress] = useState('');
  const [shopNumber, setShopNumber] = useState('');
  const [shopBusinessName, setShopBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Resin Art & Handicrafts');

  // STEP 2: Shop Details States
  const [shopAddress, setShopAddress] = useState('');
  const [selectedSocietyId, setSelectedSocietyId] = useState(currentRoute?.societyId || '');
  const [societySearch, setSocietySearch] = useState(currentRoute?.societyName || '');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [shopImages, setShopImages] = useState([
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80"
  ]);

  // STEP 3: Verify & Finish States
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Societies Dropdown Data
  const [societiesList, setSocietiesList] = useState([]);
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [showSelectedDetails, setShowSelectedDetails] = useState(true);
  const [activeSocietyDetails, setActiveSocietyDetails] = useState(null);

  // Custom Society Modal States
  const [showCustomSocietyModal, setShowCustomSocietyModal] = useState(false);
  const [customSocietyName, setCustomSocietyName] = useState('');
  const [customSocietyAddress, setCustomSocietyAddress] = useState('');
  const [customSecretaryName, setCustomSecretaryName] = useState('');
  const [customSecretaryPhone, setCustomSecretaryPhone] = useState('');
  const [customSocietyLoading, setCustomSocietyLoading] = useState(false);
  const [customSocietyError, setCustomSocietyError] = useState('');

  // Vendor OTP Verification Modal States
  const [showVendorOtpModal, setShowVendorOtpModal] = useState(false);
  const [isVendorPhoneVerified, setIsVendorPhoneVerified] = useState(false);
  const [vendorOtpValues, setVendorOtpValues] = useState(['', '', '', '']);
  const [vendorGeneratedOtp, setVendorGeneratedOtp] = useState('');
  const [vendorResendTimer, setVendorResendTimer] = useState(30);
  const vendorOtpInputRefs = useRef([]);

  const isSocietySelected = Boolean(selectedSocietyId || (societySearch && societySearch.trim().length > 0));

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  // GSAP Animation Refs matching LoginPage
  const cardRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const societyDropdownRef = useRef(null);

  // Click Outside Listener for Society Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (societyDropdownRef.current && !societyDropdownRef.current.contains(event.target)) {
        setShowSocietyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Vendor OTP Resend 30s Countdown Timer
  useEffect(() => {
    let interval = null;
    if (showVendorOtpModal && vendorResendTimer > 0) {
      interval = setInterval(() => {
        setVendorResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showVendorOtpModal, vendorResendTimer]);

  const handleVendorOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...vendorOtpValues];
    newOtp[index] = value;
    setVendorOtpValues(newOtp);

    if (value && index < 3 && vendorOtpInputRefs.current[index + 1]) {
      vendorOtpInputRefs.current[index + 1].focus();
    }
  };

  const handleVendorOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !vendorOtpValues[index] && index > 0) {
      vendorOtpInputRefs.current[index - 1].focus();
    }
  };

  const handleVendorOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasteData)) {
      setVendorOtpValues(pasteData.split(''));
      vendorOtpInputRefs.current[3]?.focus();
    }
  };

  // Instant & Reliable Navigation Handler
  const handleNavigateWithAnimation = (targetPage, options = {}) => {
    setRoute({ page: targetPage, ...options });
  };

  // Check existing vendor session only if not explicitly attempting to register a new store
  useEffect(() => {
    try {
      if (currentRoute?.allowNewStore || currentRoute?.isAddingNewStore) {
        return;
      }
      const savedVendor = localStorage.getItem('digilocal_vendor_session');
      if (savedVendor) {
        const parsed = JSON.parse(savedVendor);
        if (parsed && parsed.vendor && parsed.vendor.vendor_id && parsed.expiresAt > Date.now()) {
          setRoute({ page: 'vendorDashboard', vendorId: parsed.vendor.vendor_id });
          return;
        }
      }
    } catch (_) {}
  }, [currentRoute]);

  // Fetch Housing Societies List
  useEffect(() => {
    api.getSocieties().then((data) => {
      if (data && data.length > 0) {
        setSocietiesList(data);
      }
    }).catch(() => {
      setSocietiesList([
        { society_id: 1, society_name: 'Omaxe Greenwood Residency', location: 'Greater Noida' },
        { society_id: 2, society_name: 'Anupam Apartment', location: 'Jaipur' },
        { society_id: 3, society_name: 'Palm Meadows Residency', location: 'Bengaluru' },
        { society_id: 4, society_name: 'Godrej Woods Community', location: 'Noida' }
      ]);
    });
  }, []);

  const categoryOptions = [
    'Resin Art & Handicrafts',
    'Grocery & Organic Essentials',
    'Dairy & Fresh Milk',
    'Bakery & Artisan Bakes',
    'Fruits & Fresh Vegetables',
    'Home Services & Maintenance',
    'Food Junction & Snacks',
    'Apparel, Tailoring & Boutique',
    'Pharmacy & Health Wellness',
    'Stationery, Books & Prints',
    'Electronics & Gadget Repair',
    'General Store'
  ];

  const filteredSocieties = societiesList.filter((s) =>
    s.society_name.toLowerCase().includes(societySearch.toLowerCase())
  );

  // Validate Step 1
  const handleNextStep1 = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedSocietyId && !societySearch.trim()) {
      setError('Please search & select your Housing Society first to proceed.');
      return;
    }
    if (!ownerName.trim()) {
      setError('Please enter Vendor Owner Name.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit Mobile Phone Number.');
      return;
    }
    if (!emailAddress.trim() || !emailAddress.includes('@')) {
      setError('Please enter a valid Email Address.');
      return;
    }
    if (!shopBusinessName.trim()) {
      setError('Please enter Shop / Business Name.');
      return;
    }

    setCurrentStep(2);
  };

  // Validate Step 2
  const handleNextStep2 = (e) => {
    e.preventDefault();
    setError('');

    if (!shopNumber.trim()) {
      setError('Please enter Shop Number / Unit ID.');
      return;
    }
    if (!shopAddress.trim()) {
      setError('Please enter Shop Address.');
      return;
    }
    if (!pincode.trim()) {
      setError('Please enter Pincode.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter City.');
      return;
    }

    setCurrentStep(3);
  };

  // Handle Adding Custom Society
  const handleAddCustomSociety = async (e) => {
    e.preventDefault();
    setCustomSocietyError('');

    if (!customSocietyName.trim()) {
      setCustomSocietyError('Please enter Society Name.');
      return;
    }
    if (!customSocietyAddress.trim()) {
      setCustomSocietyError('Please enter Society Address / Location.');
      return;
    }
    if (!customSecretaryName.trim()) {
      setCustomSocietyError('Please enter Secretary Name.');
      return;
    }
    if (!customSecretaryPhone.trim() || customSecretaryPhone.length < 10) {
      setCustomSocietyError('Please enter a valid 10-digit Secretary Contact Number.');
      return;
    }

    try {
      setCustomSocietyLoading(true);
      const newSocPayload = {
        society_name: customSocietyName.trim(),
        address: customSocietyAddress.trim(),
        secretary_name: customSecretaryName.trim(),
        secretary_phone: customSecretaryPhone.trim(),
        location: customSocietyAddress.trim()
      };

      const res = await api.createSociety(newSocPayload);
      const createdId = res.society_id || res.id || Math.floor(Math.random() * 1000 + 50);

      const createdSoc = {
        society_id: createdId,
        society_name: customSocietyName.trim(),
        location: customSocietyAddress.trim(),
        secretary_name: customSecretaryName.trim(),
        secretary_phone: customSecretaryPhone.trim()
      };

      setSocietiesList((prev) => [createdSoc, ...prev]);
      setSelectedSocietyId(createdId);
      setSocietySearch(customSocietyName.trim());
      setActiveSocietyDetails(createdSoc);
      setShowSelectedDetails(true);
      setShowCustomSocietyModal(false);
      setShowSocietyDropdown(false);
      
      setCustomSocietyName('');
      setCustomSocietyAddress('');
      setCustomSecretaryName('');
      setCustomSecretaryPhone('');
    } catch (err) {
      setCustomSocietyError(err.message || 'Failed to register custom society.');
    } finally {
      setCustomSocietyLoading(false);
    }
  };

  // Image Upload Handler Simulation
  const handleAddImage = () => {
    const sampleImages = [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80"
    ];
    if (shopImages.length >= 5) {
      setError('Maximum 5 images allowed.');
      return;
    }
    const nextImg = sampleImages[shopImages.length % sampleImages.length];
    setShopImages([...shopImages, nextImg]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setShopImages(shopImages.filter((_, idx) => idx !== indexToRemove));
  };

  // STEP 1: Request Mobile Verification OTP
  const handleSendVendorOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedSocietyId && (!societySearch || !societySearch.trim())) {
      setError('Please select your Housing Society from the list.');
      return;
    }
    if (!ownerName.trim()) {
      setError('Please enter Owner Full Name.');
      return;
    }
    if (!shopBusinessName.trim()) {
      setError('Please enter Store / Shop Name.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.trim().length < 6) {
      setError('Please enter a valid mobile phone number.');
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `${countryCode}${mobileNumber.trim()}`;
      
      let sentOtpCode;
      try {
        const res = await api.requestOtp(fullPhone);
        sentOtpCode = res?.otp || res?.debug_otp || Math.floor(1000 + Math.random() * 9000).toString();
      } catch (err) {
        sentOtpCode = Math.floor(1000 + Math.random() * 9000).toString();
      }

      setVendorGeneratedOtp(sentOtpCode);
      setVendorOtpValues(['', '', '', '']);
      setVendorResendTimer(30);
      setShowVendorOtpModal(true);
      setSuccessMsg(`Verification OTP sent to ${fullPhone}! Code: ${sentOtpCode}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Vendor Resend OTP
  const handleResendVendorOtp = async () => {
    if (vendorResendTimer > 0) return;
    setError('');
    try {
      setLoading(true);
      const fullPhone = `${countryCode}${mobileNumber.trim()}`;
      let newOtp;
      try {
        const res = await api.requestOtp(fullPhone);
        newOtp = res?.otp || res?.debug_otp || Math.floor(1000 + Math.random() * 9000).toString();
      } catch (err) {
        newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      }
      setVendorGeneratedOtp(newOtp);
      setVendorResendTimer(30);
      setSuccessMsg(`New verification OTP sent to ${fullPhone}! Code: ${newOtp}`);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Vendor Mobile OTP
  const handleVerifyVendorOtpCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const enteredOtp = vendorOtpValues.join('');
    if (enteredOtp.length < 4) {
      setError('Please enter the complete 4-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `${countryCode}${mobileNumber.trim()}`;
      
      try {
        await api.verifyOtp({ phone: fullPhone, otp: enteredOtp });
      } catch (otpErr) {
        if (vendorGeneratedOtp && enteredOtp !== vendorGeneratedOtp) {
          throw new Error('Invalid OTP code. Please double check the 4-digit code.');
        }
      }

      setIsVendorPhoneVerified(true);
      setShowVendorOtpModal(false);
      setSuccessMsg(`Mobile number ${fullPhone} verified! Advancing to Store Location & Details...`);
      setCurrentStep(2);
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Create Password & Final Store Submit
  const handleSubmitVendorRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!password || password.length < 4) {
      setError('Please create a password of at least 4 characters.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        owner_name: ownerName.trim(),
        vendor_name: ownerName.trim(),
        mobile_number: `${countryCode}${mobileNumber.trim()}`,
        phone_number: mobileNumber.trim(),
        email: emailAddress.trim(),
        shop_number: shopNumber.trim(),
        store_name: shopBusinessName.trim(),
        shop_business_name: shopBusinessName.trim(),
        business_category: businessCategory,
        shop_address: shopAddress.trim(),
        society_name: societySearch.trim(),
        society_id: selectedSocietyId || 1,
        pincode: pincode.trim(),
        city: city.trim(),
        gst_number: gstNumber.trim(),
        shop_images: shopImages,
        password
      };

      const res = await api.registerVendor(payload);
      
      const createdVendor = res.vendor || {
        vendor_id: res.vendor_id || Math.floor(Math.random() * 1000 + 10),
        society_id: selectedSocietyId || 1,
        society_name: societySearch.trim(),
        store_name: shopBusinessName.trim(),
        vendor_name: ownerName.trim(),
        email: emailAddress.trim(),
        phone: mobileNumber.trim(),
        category: businessCategory,
        joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };

      const sessionObj = {
        vendor: createdVendor,
        token: `jwt_vendor_${Date.now()}`,
        expiresAt: Date.now() + 86400000
      };

      localStorage.setItem('digilocal_vendor_session', JSON.stringify(sessionObj));
      if (setActiveVendor) setActiveVendor(createdVendor);

      setSuccessMsg('Store registration completed successfully! Launching your Vendor Dashboard...');

      setTimeout(() => {
        setRoute({ page: 'vendorDashboard', vendorId: createdVendor.vendor_id });
      }, 600);
    } catch (err) {
      setError(err.message || 'Vendor registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEDE4] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans text-foreground">
      
      {/* 50/50 Balanced Bento Card matching LoginPage */}
      <div 
        ref={cardRef}
        className="max-w-4xl lg:max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-border/40 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative my-auto min-h-[580px] lg:min-h-[640px]"
      >

        {/* LEFT COLUMN: Pastel Illustration (50% equal width, md:col-span-6) */}
        <div 
          ref={leftPanelRef}
          className="md:col-span-6 bg-[#E3EFE6] p-6 sm:p-8 lg:p-10 flex flex-col justify-between items-center relative overflow-hidden min-h-[320px] md:min-h-[580px]"
        >
          <div className="w-full flex items-center space-x-3 z-10">
            {/* 1. Back Button */}
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  handleNavigateWithAnimation('login', { accountType: 'vendor' });
                }
              }}
              className="px-3.5 py-2 rounded-full bg-white/80 hover:bg-white text-[#1E3623] text-xs font-bold flex items-center space-x-1.5 border border-emerald-900/10 shadow-xs transition-all group shrink-0 cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#1E3623] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            {/* 2. Logo & Name */}
            <div
              onClick={() => handleNavigateWithAnimation('home')}
              className="flex items-center space-x-2 cursor-pointer group transition-all"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#18281F]/10 border border-[#18281F]/15 flex items-center justify-center p-1 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                <img src="/logo.png" alt="DigiLocal" className="w-full h-full object-contain scale-[1.8] mix-blend-multiply" />
              </div>
              <span className="font-cormorant italic text-base sm:text-lg font-bold text-[#1E3623]">DigiLocal</span>
            </div>
          </div>

          <div className="my-auto relative z-10 w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[330px] py-4">
            <img
              src="/login_hero.png"
              alt="DigiLocal Local Store & Delivery Illustration"
              className="w-full h-auto object-contain drop-shadow-md rounded-2xl"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <div className="text-center z-10 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#2E4A35]">
              Hyperlocal Community Network
            </span>
            <p className="text-[11px] text-[#4A5D4E] font-medium">
              Connecting gated societies with trusted local vendors.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 3-Step Registration Form (50% equal width, md:col-span-6) */}
        <div 
          ref={rightPanelRef}
          className="md:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4 relative bg-white overflow-y-auto"
        >

          {/* Top Right "Already a Vendor? Login" Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleNavigateWithAnimation('login', { tab: 'vendor' })}
              className="bg-[#18281F] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-full flex items-center space-x-2 shadow-sm hover:scale-[1.02] transition-all group cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-[#E6C35C]" />
              <span>Already a Vendor? Login</span>
            </button>
          </div>

          {/* Title Header */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E3623]">
              Vendor Registration
            </h1>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Expand your business by connecting with gated residential communities.
            </p>
          </div>

          {/* 3-Step Stepper Progress Bar */}
          <div className="py-1">
            <div className="flex items-center justify-between relative max-w-sm mx-auto">
              <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-border -z-0" />
              <div 
                className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-[#18281F] transition-all duration-500 -z-0"
                style={{
                  width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
                }}
              />

              {/* Step 1 Circle */}
              <div className="flex flex-col items-center z-10 space-y-0.5 cursor-pointer" onClick={() => setCurrentStep(1)}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    currentStep >= 1 
                      ? 'bg-[#18281F] text-white shadow-sm ring-4 ring-[#18281F]/15' 
                      : 'bg-white text-muted-foreground border-2 border-border'
                  }`}
                >
                  1
                </div>
                <span className={`text-[10px] font-bold ${currentStep === 1 ? 'text-[#18281F]' : 'text-muted-foreground'}`}>
                  Business Info
                </span>
              </div>

              {/* Step 2 Circle */}
              <div className="flex flex-col items-center z-10 space-y-0.5 cursor-pointer" onClick={() => { if (ownerName && shopBusinessName) setCurrentStep(2); }}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    currentStep >= 2 
                      ? 'bg-[#18281F] text-white shadow-sm ring-4 ring-[#18281F]/15' 
                      : 'bg-white text-muted-foreground border-2 border-border'
                  }`}
                >
                  2
                </div>
                <span className={`text-[10px] font-bold ${currentStep === 2 ? 'text-[#18281F]' : 'text-muted-foreground'}`}>
                  Shop Details
                </span>
              </div>

              {/* Step 3 Circle */}
              <div className="flex flex-col items-center z-10 space-y-0.5 cursor-pointer" onClick={() => { if (shopAddress && city) setCurrentStep(3); }}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    currentStep >= 3 
                      ? 'bg-[#18281F] text-white shadow-sm ring-4 ring-[#18281F]/15' 
                      : 'bg-white text-muted-foreground border-2 border-border'
                  }`}
                >
                  3
                </div>
                <span className={`text-[10px] font-bold ${currentStep === 3 ? 'text-[#18281F]' : 'text-muted-foreground'}`}>
                  Verify & Finish
                </span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1 FORM: BUSINESS INFO */}
          {currentStep === 1 && (
            <form onSubmit={handleSendVendorOtp} className="space-y-3.5 animate-in fade-in">
              
              {/* MANDATORY HOUSING SOCIETY SELECTION */}
              <div className="bg-[#FAF9F6] border border-[#1E3623]/20 rounded-2xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#1E3623] flex items-center gap-1.5 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-[#18281F]" />
                    <span>Select Housing Society *</span>
                  </label>
                  {isSocietySelected ? (
                    <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-500/15 text-amber-800 text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-amber-500/20">
                      <Lock className="w-3 h-3 text-amber-600" /> Required First
                    </span>
                  )}
                </div>

                {/* Society Autocomplete Search Box */}
                <div className="relative" ref={societyDropdownRef}>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Type society name (e.g. Greenwood, Anupam)..."
                      value={societySearch}
                      onFocus={() => setShowSocietyDropdown(true)}
                      onChange={(e) => {
                        setSocietySearch(e.target.value);
                        setSelectedSocietyId('');
                        setShowSocietyDropdown(true);
                      }}
                      className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-white border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                    />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showSocietyDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-border/80 rounded-2xl shadow-xl z-40 max-h-48 overflow-y-auto p-1.5 space-y-1 animate-in fade-in">
                      {filteredSocieties.map((soc) => (
                        <div
                          key={soc.society_id}
                          onClick={() => {
                            setSelectedSocietyId(soc.society_id);
                            setSocietySearch(soc.society_name);
                            setActiveSocietyDetails(soc);
                            setShowSelectedDetails(true);
                            setShowSocietyDropdown(false);
                          }}
                          className={`px-3 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                            selectedSocietyId === soc.society_id ? 'bg-[#18281F] text-white' : 'text-[#18281F] hover:bg-[#E3EFE6]'
                          }`}
                        >
                          <span>{soc.society_name}</span>
                          <span className={`text-[10px] ${selectedSocietyId === soc.society_id ? 'text-emerald-200' : 'text-muted-foreground'}`}>
                            {soc.location || soc.city || 'Gated Community'}
                          </span>
                        </div>
                      ))}
                      {filteredSocieties.length === 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground italic">
                          No society found matching "{societySearch}"
                        </div>
                      )}
                      <div 
                        onClick={() => {
                          setShowSocietyDropdown(false);
                          setShowCustomSocietyModal(true);
                        }}
                        className="px-3 py-2.5 text-xs font-bold text-[#18281F] bg-[#E3EFE6] hover:bg-[#18281F] hover:text-white rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1.5 mt-1 border border-[#1E3623]/15"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#E6C35C]" />
                        <span>+ Register Unlisted Society</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 1. When NO society is selected: Show Can't find society button */}
                {!isSocietySelected ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomSocietyModal(true)}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#18281F] hover:text-white text-[#18281F] border border-[#1E3623]/20 text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>Can't find your society? Register Unlisted Society</span>
                  </button>
                ) : (
                  /* 2. When society IS selected/added: Hide register button and show filled form details dropdown */
                  <div className="mt-2 p-3 bg-emerald-50/70 border border-emerald-300/60 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
                    <div 
                      onClick={() => setShowSelectedDetails(!showSelectedDetails)}
                      className="flex items-center justify-between cursor-pointer font-bold text-[#1E3623]"
                    >
                      <span className="flex items-center gap-1.5 text-emerald-950 font-extrabold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Selected Society Details</span>
                      </span>
                      <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 hover:underline">
                        {showSelectedDetails ? 'Hide details' : 'View filled details'}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSelectedDetails ? 'rotate-180' : ''}`} />
                      </span>
                    </div>

                    {showSelectedDetails && (
                      <div className="pt-2 border-t border-emerald-200/80 space-y-1.5 text-[11px] text-[#1E3623]/90">
                        <div className="flex items-start justify-between">
                          <span className="text-muted-foreground font-medium">Society Name:</span>
                          <span className="font-bold text-right">{activeSocietyDetails?.society_name || societySearch}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-muted-foreground font-medium">Address / Location:</span>
                          <span className="font-semibold text-right max-w-[220px]">{activeSocietyDetails?.location || activeSocietyDetails?.address || 'Residential Gated Community'}</span>
                        </div>
                        {activeSocietyDetails?.secretary_name && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">Secretary Name:</span>
                            <span className="font-semibold">{activeSocietyDetails.secretary_name}</span>
                          </div>
                        )}
                        {activeSocietyDetails?.secretary_phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">Secretary Contact:</span>
                            <span className="font-semibold">{activeSocietyDetails.secretary_phone}</span>
                          </div>
                        )}
                        <div className="pt-1.5 flex justify-end border-t border-emerald-200/50">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSocietyId('');
                              setSocietySearch('');
                              setActiveSocietyDetails(null);
                              setShowSocietyDropdown(true);
                            }}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Change Society</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* VENDOR DETAILS SECTION */}
              <div className="relative pt-1">
                {/* Floating Lock Badge Overlay */}
                {!isSocietySelected && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center p-2 rounded-2xl bg-white/40 backdrop-blur-[2px]">
                    <div className="px-4 py-2 bg-[#18281F] text-white text-xs font-extrabold rounded-full shadow-xl flex items-center gap-2 border border-white/20">
                      <Lock className="w-3.5 h-3.5 text-[#E6C35C]" />
                      <span>Select society above to unlock form</span>
                    </div>
                  </div>
                )}

                <div className={`space-y-3 transition-all duration-300 ${!isSocietySelected ? 'opacity-40 filter blur-[1.5px] pointer-events-none select-none' : ''}`}>
                  
                  {/* Owner Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E3623] mb-1">
                      Owner Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lovely Sethiya"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* 2-Column Grid for Mobile & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-[#1E3623] mb-1">
                        Mobile Number *
                      </label>
                      <div className="flex items-center gap-1.5">
                        <CountryCodePicker
                          value={countryCode}
                          onChange={(val, countryObj) => {
                            setCountryCode(val);
                            setPhonePlaceholder(countryObj?.placeholder || 'e.g. 98765 43210');
                          }}
                        />
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <input
                            type="tel"
                            required
                            placeholder={phonePlaceholder}
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="w-full pl-8 pr-3 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3623] mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. lovelysethia753@gmail.com"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Grid for Shop Name & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-[#1E3623] mb-1">
                        Shop / Business Name *
                      </label>
                      <div className="relative">
                        <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. ResinReverie"
                          value={shopBusinessName}
                          onChange={(e) => setShopBusinessName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3623] mb-1">
                        Business Category *
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <select
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all appearance-none cursor-pointer"
                        >
                          {categoryOptions.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-full bg-[#18281F] hover:bg-black text-white font-extrabold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 mt-3 cursor-pointer border border-[#1E3623]/30"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                    <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2 FORM: SHOP DETAILS */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-3 animate-in fade-in">
              {/* Mobile Verified Badge */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">Mobile Verified:</span>
                  <span className="font-bold text-emerald-950">{countryCode} {mobileNumber}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Verified ✓
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
                    Shop Number *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Block A 12"
                      value={shopNumber}
                      onChange={(e) => setShopNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
                    Shop Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gate 2, Commercial Complex"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Select Society Selector */}
              <div className="relative">
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Select Society
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="Anupam apartment"
                    value={societySearch}
                    onFocus={() => setShowSocietyDropdown(true)}
                    onChange={(e) => {
                      setSocietySearch(e.target.value);
                      setShowSocietyDropdown(true);
                    }}
                    className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                  />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Society Autocomplete Dropdown */}
                {showSocietyDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border/80 rounded-2xl shadow-xl z-30 max-h-40 overflow-y-auto p-1.5 space-y-1">
                    {filteredSocieties.map((soc) => (
                      <div
                        key={soc.society_id}
                        onClick={() => {
                          setSelectedSocietyId(soc.society_id);
                          setSocietySearch(soc.society_name);
                          setShowSocietyDropdown(false);
                        }}
                        className="px-3 py-2 text-xs font-semibold text-[#18281F] hover:bg-[#E3EFE6] rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <span>{soc.society_name}</span>
                        <span className="text-[10px] text-muted-foreground">{soc.location || soc.city || 'Active'}</span>
                      </div>
                    ))}
                    {filteredSocieties.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground italic">
                        Custom society: "{societySearch}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pincode & City 2-Column Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="302033"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jaipur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  GST Number <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter GST number"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                />
              </div>

              {/* Shop Images Upload Box */}
              <div className="space-y-1.5 pt-0.5">
                <label className="block text-xs font-bold text-[#1E3623]">
                  Shop Images
                </label>

                <div className="grid grid-cols-4 gap-2.5 items-center">
                  {/* Upload Action Trigger */}
                  <div 
                    onClick={handleAddImage}
                    className="border-2 border-dashed border-border/80 hover:border-[#18281F] bg-[#FAF9F6] hover:bg-[#E3EFE6]/50 rounded-2xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all h-20 text-center group"
                  >
                    <div className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center text-[#18281F] group-hover:scale-110 transition-transform">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-bold text-[#18281F] mt-1">Add Photos</span>
                  </div>

                  {/* Thumbnail Previews */}
                  {shopImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative h-20 rounded-2xl overflow-hidden border border-border/60 group shadow-xs">
                      <img src={imgUrl} alt={`Shop ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-1/3 py-3 rounded-full bg-[#FAF9F6] hover:bg-[#EDEDE4] border border-border text-[#1E3623] font-bold text-xs uppercase cursor-pointer"
                >
                  Previous
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 FORM: VERIFY & FINISH */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmitVendorRegistration} className="space-y-3 animate-in fade-in">
              {/* Mobile Verified Badge */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">Mobile Verified:</span>
                  <span className="font-bold text-emerald-950">{countryCode} {mobileNumber}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Verified ✓
                </span>
              </div>
              {/* Create Password */}
              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="#23Lovely"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Registration Details Card Summary */}
              <div className="bg-[#FAF9F6] border border-border/80 rounded-2xl p-3.5 space-y-2 shadow-xs">
                <h3 className="text-xs font-serif font-extrabold text-[#1E3623] border-b border-border/60 pb-1.5 flex items-center justify-between">
                  <span>Registration Details</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-800 text-[9px] font-black rounded-full uppercase tracking-wider">
                    Summary
                  </span>
                </h3>

                <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                  <div>
                    <span className="text-muted-foreground font-medium">Owner:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{ownerName || 'Lovely Sethiya'}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium">Mobile:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{mobileNumber || '9509512187'}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-muted-foreground font-medium">Email:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{emailAddress || 'lovelysethia753@gmail.com'}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium">Shop Name:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{shopBusinessName || 'ResinReverie'}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium">Shop No:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{shopNumber || 'Block A 12'}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-muted-foreground font-medium">Category:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{businessCategory}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-muted-foreground font-medium">Address:</span>
                    <span className="font-bold text-[#1E3623] ml-1">
                      {shopAddress || 'Anupam Apartment'}, {societySearch}, {city} {pincode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="flex items-center space-x-2 pt-0.5">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#18281F] accent-[#18281F] cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[11px] font-medium text-muted-foreground cursor-pointer">
                  I agree to the <span className="font-bold text-[#1E3623] underline">Terms & Conditions</span> and <span className="font-bold text-[#1E3623] underline">Privacy Policy</span>.
                </label>
              </div>

              <div className="flex items-center space-x-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-1/3 py-3 rounded-full bg-[#FAF9F6] hover:bg-[#EDEDE4] border border-border text-[#1E3623] font-bold text-xs uppercase cursor-pointer"
                >
                  Previous
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{loading ? 'Submitting...' : 'Submit Registration'}</span>
                  <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* CUSTOM SOCIETY REGISTRATION MODAL */}
      {showCustomSocietyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-border/80 p-6 max-w-md w-full shadow-2xl relative space-y-4 text-left">
            <button
              type="button"
              onClick={() => setShowCustomSocietyModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E3EFE6] border border-[#18281F]/20 flex items-center justify-center text-[#18281F]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#1E3623]">Add New Society</h3>
                <p className="text-[11px] text-muted-foreground font-medium">Enter society details & secretary contacts for onboarding</p>
              </div>
            </div>

            {customSocietyError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{customSocietyError}</span>
              </div>
            )}

            <form onSubmit={handleAddCustomSociety} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Society Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greenwood Residency"
                    value={customSocietyName}
                    onChange={(e) => setCustomSocietyName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Society Address / Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 12, Sector 4, Greater Noida"
                    value={customSocietyAddress}
                    onChange={(e) => setCustomSocietyAddress(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
                    Secretary Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mr. R.K. Sharma"
                      value={customSecretaryName}
                      onChange={(e) => setCustomSecretaryName(e.target.value)}
                      className="w-full pl-9 pr-2.5 py-2 rounded-xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
                    Secretary Contact *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={customSecretaryPhone}
                      onChange={(e) => setCustomSecretaryPhone(e.target.value)}
                      className="w-full pl-9 pr-2.5 py-2 rounded-xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCustomSocietyModal(false)}
                  className="px-4 py-2 rounded-full bg-secondary hover:bg-border text-ink text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={customSocietyLoading}
                  className="px-5 py-2 rounded-full bg-[#18281F] hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>{customSocietyLoading ? 'Adding...' : 'Add & Select Society'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR OTP VERIFICATION MODAL */}
      {showVendorOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-border/80 p-6 max-w-md w-full shadow-2xl relative space-y-4 text-left">
            <button
              type="button"
              onClick={() => setShowVendorOtpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E3EFE6] border border-[#18281F]/20 flex items-center justify-center text-[#18281F]">
                <ShieldCheck className="w-5 h-5 text-[#18281F]" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#1E3623]">Verify Mobile Number</h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  We've sent a 4-digit code to <span className="font-bold text-[#1E3623]">{countryCode} {mobileNumber}</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Demonstration Dynamic OTP Banner */}
            {vendorGeneratedOtp && (
              <div className="p-3 bg-[#E3EFE6] border border-[#18281F]/20 rounded-2xl text-xs font-bold text-[#18281F] flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#C4A066]" />
                  <span>Verification OTP:</span>
                </div>
                <span className="font-mono text-sm tracking-widest bg-white px-3 py-1 rounded-xl text-[#18281F] font-black border border-[#18281F]/15">
                  {vendorGeneratedOtp}
                </span>
              </div>
            )}

            <form onSubmit={handleVerifyVendorOtpCode} className="space-y-4">
              <div className="py-2">
                <label className="block text-xs font-bold text-center text-[#1E3623] mb-3">
                  Enter 4-Digit Security Code
                </label>

                <div className="flex justify-center items-center gap-3">
                  {vendorOtpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (vendorOtpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleVendorOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleVendorOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleVendorOtpPaste : undefined}
                      className="w-12 h-14 text-center text-xl font-bold rounded-2xl bg-[#FAF9F6] border-2 border-border/80 text-[#1E3623] focus:outline-none focus:border-[#1E3623] focus:bg-white focus:ring-4 focus:ring-[#1E3623]/10 transition-all shadow-xs"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <button
                  type="button"
                  onClick={() => setShowVendorOtpModal(false)}
                  className="font-semibold text-muted-foreground hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Mobile</span>
                </button>

                <button
                  type="button"
                  disabled={vendorResendTimer > 0 || loading}
                  onClick={handleResendVendorOtp}
                  className={`font-bold transition-colors ${
                    vendorResendTimer > 0 || loading 
                      ? 'text-muted-foreground cursor-not-allowed' 
                      : 'text-emerald-800 hover:text-emerald-950 underline cursor-pointer'
                  }`}
                >
                  {vendorResendTimer > 0 ? `Resend code in ${vendorResendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || vendorOtpValues.join('').length < 4}
                className="w-full py-3.5 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Verifying Mobile...' : 'Verify Mobile Number'}</span>
                <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
