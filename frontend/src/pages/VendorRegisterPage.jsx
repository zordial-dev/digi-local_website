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

export default function VendorRegisterPage({ currentRoute, setRoute, setActiveVendor }) {
  // Stepper State (1: Business Info, 2: Shop Details, 3: Verify & Finish)
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Business Info States
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
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

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  // GSAP Animation Refs matching LoginPage
  const cardRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  // GSAP Smooth Entrance Animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.94, opacity: 0.6, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
    if (leftPanelRef.current && rightPanelRef.current) {
      gsap.fromTo(
        [leftPanelRef.current, rightPanelRef.current],
        { opacity: 0.6, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, []);

  // GSAP Smooth Navigation Swap Animation
  const handleNavigateWithAnimation = (targetPage, options = {}) => {
    if (isSwapping) return;
    setIsSwapping(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setRoute({ page: targetPage, ...options });
      }
    });

    tl.to(cardRef.current, {
      scale: 0.93,
      opacity: 0.8,
      duration: 0.25,
      ease: 'power2.inOut'
    })
    .to(leftPanelRef.current, {
      xPercent: 100,
      opacity: 0.15,
      scale: 0.95,
      duration: 0.45,
      ease: 'power3.inOut'
    }, '<')
    .to(rightPanelRef.current, {
      xPercent: -100,
      opacity: 0.15,
      scale: 0.95,
      duration: 0.45,
      ease: 'power3.inOut'
    }, '<');
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
    if (!shopNumber.trim()) {
      setError('Please enter Shop Number / Unit ID.');
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

    if (!shopAddress.trim()) {
      setError('Please enter Shop Address.');
      return;
    }
    if (!societySearch.trim()) {
      setError('Please select or enter your Housing Society.');
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

  // Final Submit Handler
  const handleSubmitRegistration = async (e) => {
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
        mobile_number: mobileNumber.trim(),
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
        phone_number: mobileNumber.trim(),
        status: 'ACTIVE'
      };

      const session = {
        vendor: createdVendor,
        token: res.token || `jwt_vendor_${Date.now()}`,
        expiresAt: Date.now() + 86400000
      };

      localStorage.setItem('digilocal_vendor_session', JSON.stringify(session));
      if (setActiveVendor) setActiveVendor(createdVendor);

      setSuccessMsg('Store registration completed successfully! Launching your Vendor Portal...');
      setTimeout(() => {
        setRoute({ page: 'vendorDashboard', vendorId: createdVendor.vendor_id });
      }, 600);

    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEDE4] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans text-foreground">
      
      {/* 50/50 Balanced Bento Card matching LoginPage */}
      <div 
        ref={cardRef}
        className="max-w-4xl lg:max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-border/40 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative my-auto min-h-[580px] lg:min-h-[640px] fill-mode-both"
      >

        {/* LEFT COLUMN: Pastel Illustration (50% equal width, md:col-span-6) */}
        <div 
          ref={leftPanelRef}
          className="md:col-span-6 bg-[#E3EFE6] p-6 sm:p-8 lg:p-10 flex flex-col justify-between items-center relative overflow-hidden min-h-[320px] md:min-h-[580px] fill-mode-both"
        >
          <div className="w-full flex items-center space-x-3 z-10">
            {/* 1. Back Button */}
            <button
              onClick={() => handleNavigateWithAnimation('home')}
              className="px-3.5 py-2 rounded-full bg-white/80 hover:bg-white text-[#1E3623] text-xs font-bold flex items-center space-x-1.5 border border-emerald-900/10 shadow-xs transition-all group shrink-0 cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#1E3623] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            {/* 2. Logo & Name */}
            <div
              onClick={() => handleNavigateWithAnimation('home')}
              className="flex items-center space-x-2 cursor-pointer group bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-emerald-900/10 shadow-xs transition-all"
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
          className="md:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4 relative bg-white fill-mode-both overflow-y-auto"
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
            <form onSubmit={handleNextStep1} className="space-y-3 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Owner Name
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

              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9509512187"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. lovelysethia753@gmail.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
                    Shop Number *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
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
                    Shop / Business Name
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
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
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Business Category
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all appearance-none cursor-pointer"
                  >
                    {categoryOptions.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 mt-2 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
              </button>
            </form>
          )}

          {/* STEP 2 FORM: SHOP DETAILS */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-3 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Shop Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anupam Apartment"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                  />
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
            <form onSubmit={handleSubmitRegistration} className="space-y-3 animate-in fade-in">
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
    </div>
  );
}
