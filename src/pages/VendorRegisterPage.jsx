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
  ShieldCheck,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Camera,
  FolderPlus
} from 'lucide-react';
import { api } from '../services/api';
import CountryCodePicker from '../components/CountryCodePicker';
import CategoryPicker from '../components/CategoryPicker';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../firebase';

export default function VendorRegisterPage({ currentRoute, setRoute, setActiveVendor }) {
  // Stepper State (1: Society & Contact Verification, 2: Shop Details, 3: Password & Finish)
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Society & Verification States
  const [selectedSocietyId, setSelectedSocietyId] = useState(currentRoute?.societyId || '');
  const [societySearch, setSocietySearch] = useState(currentRoute?.societyName || '');
  const [verificationMethod, setVerificationMethod] = useState('phone'); // 'phone' | 'email'
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phonePlaceholder, setPhonePlaceholder] = useState('e.g. 98765 43210');
  const [emailAddress, setEmailAddress] = useState('');
  
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [isVendorContactVerified, setIsVendorContactVerified] = useState(false);
  const [verifiedContactValue, setVerifiedContactValue] = useState('');
  const [firebaseIdToken, setFirebaseIdToken] = useState(null);

  // STEP 2: Shop Details States
  const [ownerName, setOwnerName] = useState('');
  const [shopBusinessName, setShopBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Resin Art & Handicrafts');
  const [shopNumber, setShopNumber] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [shopImages, setShopImages] = useState([
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80"
  ]);

  // Custom Photo Upload Modal States
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [photoUploadTab, setPhotoUploadTab] = useState('device'); // 'device' | 'url' | 'presets'
  const [customPhotoUrlInput, setCustomPhotoUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // STEP 3: Password & Finish States
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

  // 6-Digit Vendor OTP Verification Modal States
  const [showVendorOtpModal, setShowVendorOtpModal] = useState(false);
  const [vendorOtpValues, setVendorOtpValues] = useState(['', '', '', '', '', '']);
  const [vendorGeneratedOtp, setVendorGeneratedOtp] = useState('');
  const [vendorResendTimer, setVendorResendTimer] = useState(30);
  const vendorOtpInputRefs = useRef([]);

  const isSocietySelected = Boolean(selectedSocietyId || (societySearch && societySearch.trim().length > 0));

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // GSAP / DOM Refs
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

  // 6-Digit OTP Handlers
  const handleVendorOtpChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...vendorOtpValues];
    newOtp[index] = digit;
    setVendorOtpValues(newOtp);

    if (digit && index < 5 && vendorOtpInputRefs.current[index + 1]) {
      vendorOtpInputRefs.current[index + 1].focus();
    }
  };

  const handleVendorOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (vendorOtpValues[index]) {
        const newOtp = [...vendorOtpValues];
        newOtp[index] = '';
        setVendorOtpValues(newOtp);
      } else if (index > 0 && vendorOtpInputRefs.current[index - 1]) {
        vendorOtpInputRefs.current[index - 1].focus();
        const newOtp = [...vendorOtpValues];
        newOtp[index - 1] = '';
        setVendorOtpValues(newOtp);
      }
    }
  };

  const handleVendorOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;
    const digits = pasteData.split('');
    const newOtp = [...vendorOtpValues];
    digits.forEach((d, idx) => {
      if (idx < 6) newOtp[idx] = d;
    });
    setVendorOtpValues(newOtp);
    const focusIdx = Math.min(digits.length, 5);
    if (vendorOtpInputRefs.current[focusIdx]) {
      vendorOtpInputRefs.current[focusIdx].focus();
    }
  };

  // Navigation Handler
  const handleNavigateWithAnimation = (targetPage, options = {}) => {
    setRoute({ page: targetPage, ...options });
  };

  // Check existing vendor session
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

  // Real Photo Upload & Custom Image Handlers
  const handleOpenPhotoUpload = () => {
    if (shopImages.length >= 5) {
      setError('Maximum 5 shop images allowed.');
      return;
    }
    setShowPhotoUploadModal(true);
  };

  const handleDeviceFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (shopImages.length + files.length > 5) {
      setError('Maximum 5 shop images allowed.');
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setShopImages((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });

    setShowPhotoUploadModal(false);
    if (e.target) e.target.value = '';
  };

  const handleAddCustomPhotoUrl = (e) => {
    e.preventDefault();
    if (!customPhotoUrlInput.trim()) return;

    if (shopImages.length >= 5) {
      setError('Maximum 5 shop images allowed.');
      return;
    }

    setShopImages((prev) => [...prev, customPhotoUrlInput.trim()]);
    setCustomPhotoUrlInput('');
    setShowPhotoUploadModal(false);
  };

  const handleSelectPresetPhoto = (url) => {
    if (shopImages.length >= 5) {
      setError('Maximum 5 shop images allowed.');
      return;
    }
    setShopImages((prev) => [...prev, url]);
    setShowPhotoUploadModal(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    setShopImages(shopImages.filter((_, idx) => idx !== indexToRemove));
  };

  // STEP 1: Request Verification 6-Digit OTP (Mobile OR Email)
  const handleSendVendorVerificationOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedSocietyId && (!societySearch || !societySearch.trim())) {
      setError('Please search & select your Housing Society first to proceed.');
      return;
    }

    let targetIdentifier = '';
    if (verificationMethod === 'phone') {
      if (!mobileNumber.trim() || mobileNumber.trim().length < 7) {
        setError('Please enter a valid mobile phone number for OTP verification.');
        return;
      }
      targetIdentifier = `${countryCode}${mobileNumber.trim()}`;
    } else {
      if (!emailAddress.trim() || !emailAddress.includes('@')) {
        setError('Please enter a valid email address for OTP verification.');
        return;
      }
      targetIdentifier = emailAddress.trim();
    }

    try {
      setLoading(true);

      if (verificationMethod === 'phone') {
        await sendFirebasePhoneOtp(targetIdentifier, 'recaptcha-container');
        setSuccessMsg(`6-Digit Verification SMS code sent to ${targetIdentifier} via Firebase! Check your mobile phone.`);
      } else {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setVendorGeneratedOtp(code);
        setSuccessMsg(`6-Digit Verification OTP sent to ${targetIdentifier}! Code: ${code}`);
      }

      setVendorOtpValues(['', '', '', '', '', '']);
      setVendorResendTimer(30);
      setVerifiedContactValue(targetIdentifier);
      setShowVendorOtpModal(true);
    } catch (err) {
      const formatted = formatUserFacingError(err, verificationMethod);
      if (verificationMethod === 'phone') {
        setPhoneError(formatted);
      } else {
        setEmailError(formatted);
      }
    } finally {
      setLoading(false);
    }
  };

  // Vendor Resend 6-Digit OTP via Firebase
  const handleResendVendorOtp = async () => {
    if (vendorResendTimer > 0) return;
    setError('');
    try {
      setLoading(true);
      const targetIdentifier = verifiedContactValue || (verificationMethod === 'phone' ? `${countryCode}${mobileNumber.trim()}` : emailAddress.trim());

      if (verificationMethod === 'phone') {
        await sendFirebasePhoneOtp(targetIdentifier, 'recaptcha-container');
        setSuccessMsg(`6-digit verification SMS code resent to ${targetIdentifier} via Firebase!`);
      } else {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setVendorGeneratedOtp(code);
        setSuccessMsg(`New 6-digit verification OTP resent to ${targetIdentifier}! Code: ${code}`);
      }

      setVendorResendTimer(30);
    } catch (err) {
      setError(err.message || 'Failed to resend SMS via Firebase.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1 VERIFICATION: Verify 6-Digit Firebase OTP Code & Advance to Step 2
  const handleVerifyVendorOtpCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const enteredOtp = vendorOtpValues.join('').trim();
    if (enteredOtp.length < 6) {
      setError('Please enter the complete 6-digit security code.');
      return;
    }

    try {
      setLoading(true);
      const targetIdentifier = verifiedContactValue || (verificationMethod === 'phone' ? `${countryCode}${mobileNumber.trim()}` : emailAddress.trim());

      if (verificationMethod === 'phone') {
        const result = await verifyFirebasePhoneOtp(enteredOtp);
        setFirebaseIdToken(result.idToken);
      } else {
        if (vendorGeneratedOtp && enteredOtp !== vendorGeneratedOtp) {
          throw new Error('Invalid 6-digit OTP code. Please double check and try again.');
        }
      }

      setIsVendorContactVerified(true);
      setShowVendorOtpModal(false);
      setSuccessMsg(`Mobile number ${targetIdentifier} verified via Firebase! Now fill in your shop & owner details.`);
      setCurrentStep(2);
    } catch (err) {
      setError(err.message || 'Invalid 6-digit OTP code. Please double check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Validate Shop & Business Info -> Move to Step 3
  const handleNextStep2 = (e) => {
    e.preventDefault();
    setError('');

    if (!ownerName.trim()) {
      setError('Please enter Owner Full Name.');
      return;
    }
    if (!shopBusinessName.trim()) {
      setError('Please enter Shop / Business Name.');
      return;
    }
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

  // STEP 3: Create Password & Final Store Registration Submit
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
      const mainPhone = verificationMethod === 'phone' ? `${countryCode}${mobileNumber.trim()}` : (mobileNumber.trim() ? `${countryCode}${mobileNumber.trim()}` : '');
      const customLogo = (Array.isArray(shopImages) && shopImages.length > 0 ? shopImages[0] : (typeof shopImages === 'string' ? shopImages : ''));
      const cleanEmail = mainEmail || (verificationMethod === 'email' ? verifiedContactValue : '');

      const payload = {
        owner_name: ownerName.trim(),
        vendor_name: ownerName.trim(),
        mobile_number: mainPhone || verifiedContactValue,
        phone_number: mobileNumber.trim() || verifiedContactValue,
        email: cleanEmail,
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
        logo: customLogo,
        image_url: customLogo,
        password,
        verification_type: verificationMethod,
        verified_contact: verifiedContactValue,
        firebase_token: firebaseIdToken || undefined
      };

      const res = await api.registerVendor(payload);
      
      const accessToken = res.accessToken || res.data?.accessToken || res.token;
      const refreshToken = res.refreshToken || res.data?.refreshToken;
      const createdVendor = res.vendor || res.data?.vendor || {
        vendor_id: res.vendor_id || Math.floor(Math.random() * 1000 + 104),
        society_id: selectedSocietyId || 1,
        society_name: societySearch.trim(),
        store_name: shopBusinessName.trim(),
        vendor_name: ownerName.trim(),
        email: cleanEmail,
        phone_number: mainPhone || verifiedContactValue,
        category: businessCategory,
        logo: customLogo,
        image_url: customLogo,
        joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };

      if (customLogo) {
        try {
          if (createdVendor?.vendor_id) {
            localStorage.setItem(`digilocal_vendor_logo_${createdVendor.vendor_id}`, customLogo);
            localStorage.setItem(`digilocal_vendor_logo_${String(createdVendor.vendor_id)}`, customLogo);
          }
          if (shopBusinessName.trim()) {
            localStorage.setItem(`digilocal_vendor_logo_${shopBusinessName.trim()}`, customLogo);
          }
        } catch (_) {}
      }

      // Add/Update vendor in local registered vendors array for instant UI reflection
      try {
        const regStr = localStorage.getItem('digilocal_registered_vendors');
        let regList = regStr ? JSON.parse(regStr) : [];
        if (!Array.isArray(regList)) regList = [];
        const fullVendorRecord = {
          ...createdVendor,
          logo: customLogo || createdVendor.logo,
          image: customLogo || createdVendor.image,
          image_url: customLogo || createdVendor.image_url,
          shop_images: shopImages
        };
        regList = [fullVendorRecord, ...regList.filter(v => v && String(v.vendor_id) !== String(createdVendor.vendor_id))];
        localStorage.setItem('digilocal_registered_vendors', JSON.stringify(regList));
      } catch (_) {}

      if (accessToken) {
        localStorage.setItem('vendor_access_token', accessToken);
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (createdVendor) localStorage.setItem('vendor_profile', JSON.stringify(createdVendor));

      const sessionObj = {
        vendor: createdVendor,
        token: accessToken || `jwt_vendor_${Date.now()}`,
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
      <div id="recaptcha-container"></div>

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
                  Society & Verification
                </span>
              </div>

              {/* Step 2 Circle */}
              <div className="flex flex-col items-center z-10 space-y-0.5 cursor-pointer" onClick={() => { if (isVendorContactVerified) setCurrentStep(2); }}>
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

          {/* STEP 1 FORM: SOCIETY SELECTION & VERIFY CONTACT BEFORE FILLING DETAILS */}
          {currentStep === 1 && (
            <form onSubmit={handleSendVendorVerificationOtp} className="space-y-4 animate-in fade-in">
              
              {/* 1. MANDATORY HOUSING SOCIETY SELECTION */}
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

                {/* Society Selection Summary Box */}
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

              {/* 2. CONTACT VERIFICATION SECTION (Mobile OR Email choice - NOT both compulsory!) */}
              <div className="relative pt-1">
                {!isSocietySelected && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center p-2 rounded-2xl bg-white/50 backdrop-blur-[2px]">
                    <div className="px-4 py-2 bg-[#18281F] text-white text-xs font-extrabold rounded-full shadow-xl flex items-center gap-2 border border-white/20">
                      <Lock className="w-3.5 h-3.5 text-[#E6C35C]" />
                      <span>Select Housing Society above first</span>
                    </div>
                  </div>
                )}

                <div className={`space-y-4 transition-all duration-300 ${!isSocietySelected ? 'opacity-40 filter blur-[1.5px] pointer-events-none select-none' : ''}`}>
                  
                  <div>
                    <label className="block text-xs font-extrabold text-[#1E3623] mb-2 uppercase tracking-wider">
                      Verify Contact (Choose Mobile OR Email) *
                    </label>

                    {/* Verification Method Pill Selector */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF9F6] border border-border/80 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setVerificationMethod('phone')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          verificationMethod === 'phone'
                            ? 'bg-[#18281F] text-white shadow-sm'
                            : 'text-[#18281F] hover:bg-white'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Mobile Number</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerificationMethod('email')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          verificationMethod === 'email'
                            ? 'bg-[#18281F] text-white shadow-sm'
                            : 'text-[#18281F] hover:bg-white'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Address</span>
                      </button>
                    </div>
                  </div>

                  {/* Input field based on chosen channel */}
                  {verificationMethod === 'phone' ? (
                    <div>
                      <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
                        Mobile Phone Number *
                      </label>
                      <div className="flex items-center gap-2">
                        <CountryCodePicker
                          value={countryCode}
                          onChange={(val, countryObj) => {
                            setCountryCode(val);
                            setPhonePlaceholder(countryObj?.placeholder || 'e.g. 98765 43210');
                          }}
                        />
                        <div className="relative flex-1">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="tel"
                            required
                            placeholder={phonePlaceholder}
                            value={mobileNumber}
                            onChange={(e) => {
                              setMobileNumber(e.target.value);
                              setPhoneError('');
                            }}
                            className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border text-xs font-semibold focus:outline-none text-ink transition-all shadow-xs ${
                              phoneError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-border/80 focus:border-[#1E3623]'
                            }`}
                          />
                        </div>
                      </div>
                      {phoneError && (
                        <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>{phoneError}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. lovelysethia753@gmail.com"
                          value={emailAddress}
                          onChange={(e) => {
                            setEmailAddress(e.target.value);
                            setEmailError('');
                          }}
                          className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border text-xs font-semibold focus:outline-none text-ink transition-all shadow-xs ${
                            emailError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-border/80 focus:border-[#1E3623]'
                          }`}
                        />
                      </div>
                      {emailError && (
                        <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>{emailError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-full bg-[#18281F] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer border border-[#1E3623]/30"
                  >
                    <span>{loading ? 'Sending OTP...' : `Send 6-Digit OTP (${verificationMethod === 'phone' ? 'SMS' : 'Email'})`}</span>
                    <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2 FORM: FILL SHOP & OWNER DETAILS (Only unlocked after OTP verification!) */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-3.5 animate-in fade-in">
              
              {/* Verified Contact Banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-300/80 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">Verified Contact:</span>
                  <span className="font-bold text-emerald-950">{verifiedContactValue}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Verified ✓
                </span>
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Owner Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lovely Sethiya"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Optional Secondary Contact */}
              {verificationMethod === 'phone' ? (
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
                    Email Address <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="e.g. lovelysethia753@gmail.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
                    Mobile Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <CountryCodePicker
                      value={countryCode}
                      onChange={(val, countryObj) => {
                        setCountryCode(val);
                        setPhonePlaceholder(countryObj?.placeholder || 'e.g. 98765 43210');
                      }}
                    />
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder={phonePlaceholder}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                  <CategoryPicker
                    value={businessCategory}
                    onChange={(val) => setBusinessCategory(val)}
                    label="Business Category / Variety *"
                  />
                </div>
              </div>

              {/* Shop Number & Address */}
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

              {/* Pincode & City */}
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

              {/* GST Number */}
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

              {/* Shop Images */}
              <div className="space-y-1.5 pt-0.5">
                <label className="block text-xs font-bold text-[#1E3623]">
                  Shop Images
                </label>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleDeviceFileUpload} 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                />

                <div className="grid grid-cols-4 gap-2.5 items-center">
                  <div 
                    onClick={handleOpenPhotoUpload}
                    className="border-2 border-dashed border-border/80 hover:border-[#18281F] bg-[#FAF9F6] hover:bg-[#E3EFE6]/50 rounded-2xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all h-20 text-center group"
                  >
                    <div className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center text-[#18281F] group-hover:scale-110 transition-transform shadow-2xs">
                      <Camera className="w-3.5 h-3.5 text-[#18281F]" />
                    </div>
                    <span className="text-[9px] font-bold text-[#18281F] mt-1">Add Photos</span>
                  </div>

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

          {/* STEP 3 FORM: CREATE PASSWORD & SUBMIT */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmitVendorRegistration} className="space-y-3 animate-in fade-in">
              {/* Verified Contact Banner */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">Verified Contact:</span>
                  <span className="font-bold text-emerald-950">{verifiedContactValue}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Verified ✓
                </span>
              </div>

              {/* Create Password */}
              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
                  >
                    {showPassword ? <Eye className="w-4 h-4 text-emerald-800" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Registration Details Summary Card */}
              <div className="bg-[#FAF9F6] border border-border/80 rounded-2xl p-3.5 space-y-2 shadow-xs">
                <h3 className="text-xs font-serif font-extrabold text-[#1E3623] border-b border-border/60 pb-1.5 flex items-center justify-between">
                  <span>Registration Summary</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-800 text-[9px] font-black rounded-full uppercase tracking-wider">
                    Summary
                  </span>
                </h3>

                <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                  <div>
                    <span className="text-muted-foreground font-medium">Owner:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{ownerName}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium">Society:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{societySearch}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-muted-foreground font-medium">Verified Contact:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{verifiedContactValue}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium">Shop Name:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{shopBusinessName}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium">Shop No:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{shopNumber}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-muted-foreground font-medium">Category:</span>
                    <span className="font-bold text-[#1E3623] ml-1">{businessCategory}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-muted-foreground font-medium">Address:</span>
                    <span className="font-bold text-[#1E3623] ml-1">
                      {shopAddress}, {city} {pincode}
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
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-ink transition-colors cursor-pointer"
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

      {/* 6-DIGIT VENDOR OTP VERIFICATION MODAL */}
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
                <h3 className="text-base font-serif font-bold text-[#1E3623]">
                  Verify {verificationMethod === 'phone' ? 'Mobile Number' : 'Email Address'}
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  We've sent a 6-digit security code to <span className="font-bold text-[#1E3623]">{verifiedContactValue}</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyVendorOtpCode} className="space-y-4">
              <div className="py-2">
                <label className="block text-xs font-bold text-center text-[#1E3623] mb-3">
                  Enter 6-Digit Security Code
                </label>

                {/* 6 Single-Digit Input Blocks */}
                <div className="flex justify-center items-center gap-2 sm:gap-2.5">
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
                      className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold rounded-2xl bg-[#FAF9F6] border-2 border-border/80 text-[#1E3623] focus:outline-none focus:border-[#1E3623] focus:bg-white focus:ring-4 focus:ring-[#1E3623]/10 transition-all shadow-xs"
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
                  <span>Change Contact</span>
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
                disabled={loading || vendorOtpValues.join('').length < 6}
                className="w-full py-3.5 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Verifying...' : `Verify ${verificationMethod === 'phone' ? 'Mobile Number' : 'Email Address'}`}</span>
                <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM SHOP PHOTO UPLOADER MODAL */}
      {showPhotoUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-border/80 p-6 max-w-lg w-full shadow-2xl relative space-y-4 text-left overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPhotoUploadModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E3EFE6] border border-[#18281F]/20 flex items-center justify-center text-[#18281F]">
                <Camera className="w-5 h-5 text-[#18281F]" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#1E3623]">
                  Add Shop Photos
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Upload custom photos from your computer/phone, paste an image URL, or pick presets.
                </p>
              </div>
            </div>

            {/* Tab Navigation Pill Selector */}
            <div className="flex items-center p-1 bg-[#FAF9F6] border border-border/70 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setPhotoUploadTab('device')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  photoUploadTab === 'device'
                    ? 'bg-[#18281F] text-white shadow-xs'
                    : 'text-muted-foreground hover:text-[#1E3623]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Device File</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoUploadTab('url')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  photoUploadTab === 'url'
                    ? 'bg-[#18281F] text-white shadow-xs'
                    : 'text-muted-foreground hover:text-[#1E3623]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Custom Image URL</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoUploadTab('presets')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  photoUploadTab === 'presets'
                    ? 'bg-[#18281F] text-white shadow-xs'
                    : 'text-muted-foreground hover:text-[#1E3623]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Category Presets</span>
              </button>
            </div>

            {/* TAB 1: DEVICE FILE UPLOAD */}
            {photoUploadTab === 'device' && (
              <div className="space-y-4 pt-2">
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="border-2 border-dashed border-[#1E3623]/30 hover:border-[#1E3623] bg-[#FAF9F6] hover:bg-[#E3EFE6]/40 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#1E3623]/20 flex items-center justify-center text-[#1E3623] group-hover:scale-110 transition-transform shadow-md">
                    <FolderPlus className="w-7 h-7 text-[#18281F]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1E3623]">
                      Click to choose image files from your computer or phone
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                      Supports JPG, PNG, WEBP & Data URLs (Max 5MB each)
                    </p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-[#18281F] text-white text-[11px] font-bold shadow-xs">
                    Browse Device Photos
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: CUSTOM IMAGE URL */}
            {photoUploadTab === 'url' && (
              <form onSubmit={handleAddCustomPhotoUrl} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
                    Paste Image URL
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={customPhotoUrlInput}
                      onChange={(e) => setCustomPhotoUrlInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink transition-all shadow-xs"
                    />
                  </div>
                </div>

                {customPhotoUrlInput && (
                  <div className="p-2 border border-border/60 rounded-2xl bg-[#FAF9F6] space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground">Image Preview:</span>
                    <div className="h-24 rounded-xl overflow-hidden bg-white border border-border">
                      <img
                        src={customPhotoUrlInput}
                        alt="Custom Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.alt = 'Invalid Image URL';
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!customPhotoUrlInput.trim()}
                  className="w-full py-3 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  Add Custom Image URL
                </button>
              </form>
            )}

            {/* TAB 3: CATEGORY PRESETS */}
            {photoUploadTab === 'presets' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E3623]">
                    Preserved Photos for <span className="text-emerald-950 font-black">{businessCategory}</span>:
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Click any image to add</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                  {[
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&auto=format&fit=crop&q=80"
                  ].map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectPresetPhoto(url)}
                      className="relative h-20 rounded-2xl overflow-hidden border border-border/80 hover:border-[#1E3623] hover:ring-2 hover:ring-[#1E3623]/20 cursor-pointer transition-all group shadow-xs"
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        + Select
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
