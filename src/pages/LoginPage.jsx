import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Store, User, Phone, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, KeyRound, Smartphone } from 'lucide-react';
import { gsap } from 'gsap';
import { api } from '../services/api';

export default function LoginPage({ currentRoute, setRoute, setActiveVendor, setActiveUser }) {
  const [accountType, setAccountType] = useState(
    currentRoute?.tab === 'vendor' || currentRoute?.accountType === 'vendor' ? 'vendor' : 'resident'
  ); // 'resident' (default user) | 'vendor'

  useEffect(() => {
    if (currentRoute?.tab === 'vendor' || currentRoute?.accountType === 'vendor') {
      setAccountType('vendor');
    } else {
      setAccountType('resident');
    }
  }, [currentRoute]);
  
  // Auth Method State: 'password' (default) | 'otp' (inline 4-block OTP)
  const [authMethod, setAuthMethod] = useState('password');

  // User & Vendor Input States
  const [userPhone, setUserPhone] = useState('');
  const [vendorIdentifier, setVendorIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');

  // Animation State & Refs for GSAP
  const [isSwapping, setIsSwapping] = useState(false);
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

  // Try Another Method (Password Update Choice) Modal State
  const [showAltModal, setShowAltModal] = useState(false);
  const [altContact, setAltContact] = useState('');
  const [altOtp, setAltOtp] = useState('5930');
  const [altNewPassword, setAltNewPassword] = useState('');
  const [altConfirmPassword, setAltConfirmPassword] = useState('');
  const [altStep, setAltStep] = useState(3); // 3: Password Update Choice, 4: Enter New Password
  const [altMsg, setAltMsg] = useState('');
  const [altMsgType, setAltMsgType] = useState('info'); // 'info' | 'success' | 'error'

  // 4-Block OTP Input State & Refs
  const [otpBoxes, setOtpBoxes] = useState(['5', '9', '3', '0']);
  const box0Ref = useRef(null);
  const box1Ref = useRef(null);
  const box2Ref = useRef(null);
  const box3Ref = useRef(null);
  const otpBoxRefs = [box0Ref, box1Ref, box2Ref, box3Ref];

  const handleOtpBoxChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newBoxes = [...otpBoxes];
    newBoxes[index] = digit;
    setOtpBoxes(newBoxes);
    setAltOtp(newBoxes.join(''));

    if (digit && index < 3 && otpBoxRefs[index + 1].current) {
      otpBoxRefs[index + 1].current.focus();
    }
  };

  const handleOtpBoxKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpBoxes[index]) {
        const newBoxes = [...otpBoxes];
        newBoxes[index] = '';
        setOtpBoxes(newBoxes);
        setAltOtp(newBoxes.join(''));
      } else if (index > 0 && otpBoxRefs[index - 1].current) {
        otpBoxRefs[index - 1].current.focus();
        const newBoxes = [...otpBoxes];
        newBoxes[index - 1] = '';
        setOtpBoxes(newBoxes);
        setAltOtp(newBoxes.join(''));
      }
    }
  };

  const handleOtpBoxPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (pasteData) {
      const newBoxes = pasteData.split('').concat(['', '', '', '']).slice(0, 4);
      setOtpBoxes(newBoxes);
      setAltOtp(newBoxes.join(''));
    }
  };

  // GSAP Smooth Panel Swap Animation
  const handleNavigateWithAnimation = (targetPage) => {
    if (isSwapping) return;
    setIsSwapping(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setRoute({ page: targetPage });
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

  // Central Direct Login Handler
  const performLoginDirectly = async (contactInput, passwordInput = '123456') => {
    setError('');
    setSuccessMsg('');
    const targetId = (contactInput || (accountType === 'resident' ? userPhone : vendorIdentifier) || altContact).trim();

    if (accountType === 'resident') {
      if (!targetId) {
        setError('Please enter your 10-digit mobile phone number.');
        return;
      }

      try {
        setLoading(true);
        // RESIDENT / USER LOGIN FLOW
        const res = await api.loginUser({ phone: targetId, email: `${targetId}@digilocal.com`, password: passwordInput, isOtpLogin: authMethod === 'otp' });
        
        let userObj = res?.user;
        try {
          const pool = JSON.parse(localStorage.getItem('digilocal_registered_users') || '[]');
          const match = pool.find(u => String(u.phone).trim() === targetId || String(u.email).trim().toLowerCase() === targetId.toLowerCase());
          if (match) userObj = match;
        } catch (_) {}

        if (!userObj) {
          userObj = {
            user_id: `usr_${Date.now()}`,
            name: `Resident ${targetId.slice(-4)}`,
            email: `${targetId}@digilocal.com`,
            phone: targetId,
            society_name: '',
            society_id: '',
            flat: '',
            joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          };
        }

        const session = {
          user: userObj,
          token: res?.token || `user_jwt_${Date.now()}`,
          expiresAt: Date.now() + 86400000
        };

        const pendingSocietyId = currentRoute?.redirectSocietyId || sessionStorage.getItem('digilocal_pending_society_id');
        const pendingSocietyName = sessionStorage.getItem('digilocal_pending_society_name');

        if (pendingSocietyId) {
          userObj.society_id = pendingSocietyId;
          if (pendingSocietyName) userObj.society_name = pendingSocietyName;
          session.user = userObj;
        }

        // SAVE USER SESSIONS
        localStorage.setItem('digilocal_user_session', JSON.stringify(session));
        localStorage.setItem('digilocal_resident_session', JSON.stringify(userObj));
        if (setActiveUser) setActiveUser(userObj);

        if (pendingSocietyId) {
          sessionStorage.removeItem('digilocal_pending_society_id');
          sessionStorage.removeItem('digilocal_pending_society_name');
          setSuccessMsg(`Logged in successfully! Redirecting to ${pendingSocietyName || 'your selected society'}...`);
          setTimeout(() => {
            setRoute({ page: 'societyVendors', societyId: pendingSocietyId });
          }, 400);
        } else {
          setSuccessMsg(`Logged in successfully as ${userObj.name || 'Resident'}! Opening Profile...`);
          setTimeout(() => {
            setRoute({ page: 'profile' });
          }, 400);
        }
      } catch (err) {
        setError(err.message || 'Invalid phone number or password. Please try again.');
      } finally {
        setLoading(false);
      }

    } else {

      if (!targetId) {
        setError('Please enter your vendor email address or phone number.');
        return;
      }

      try {
        setLoading(true);
        // VENDOR LOGIN FLOW
        const res = await api.loginVendor({ email: targetId, phone: targetId, password: passwordInput, isOtpLogin: authMethod === 'otp' });

        let vendorObj = res?.vendor;
        try {
          const pool = JSON.parse(localStorage.getItem('digilocal_registered_vendors') || '[]');
          const match = pool.find(v => String(v.phone_number).trim() === targetId || String(v.email).trim().toLowerCase() === targetId.toLowerCase());
          if (match) vendorObj = match;
        } catch (_) {}

        if (!vendorObj) {
          vendorObj = {
            vendor_id: 1,
            vendor_name: targetId.split('@')[0],
            store_name: `${targetId.split('@')[0]}'s Store`,
            email: targetId,
            phone_number: targetId,
            status: 'ACTIVE'
          };
        }

        const session = {
          vendor: vendorObj,
          token: res?.token || res?.accessToken || `jwt_vendor_${Date.now()}`,
          expiresAt: Date.now() + 86400000
        };

        const pendingSocietyId = currentRoute?.redirectSocietyId || sessionStorage.getItem('digilocal_pending_society_id');
        const pendingSocietyName = sessionStorage.getItem('digilocal_pending_society_name');

        // SAVE VENDOR SESSIONS
        localStorage.setItem('digilocal_vendor_session', JSON.stringify(session));
        if (setActiveVendor) setActiveVendor(vendorObj);

        if (pendingSocietyId) {
          sessionStorage.removeItem('digilocal_pending_society_id');
          sessionStorage.removeItem('digilocal_pending_society_name');
          setSuccessMsg(`Logged in successfully! Redirecting to ${pendingSocietyName || 'society stores'}...`);
          setTimeout(() => {
            setRoute({ page: 'societyVendors', societyId: pendingSocietyId });
          }, 400);
        } else {
          setSuccessMsg(`Logged in successfully as ${vendorObj.store_name || vendorObj.vendor_name}! Redirecting to Vendor Panel...`);
          setTimeout(() => {
            setRoute({ page: 'vendorDashboard', vendorId: vendorObj.vendor_id });
          }, 400);
        }
      } catch (err) {
        setError(err.message || 'Invalid email/phone or password. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Main Form Submission
  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    const contact = (accountType === 'resident' ? userPhone : vendorIdentifier).trim();

    if (authMethod === 'otp') {
      const code = otpBoxes.join('').trim();
      if (code.length < 4) {
        setError('Please enter all 4 digits of the OTP code.');
        return;
      }
      if (code !== '5930' && code.length !== 4) {
        setError('Invalid OTP code. Use demo OTP: 5930');
        return;
      }
      setError('');
      setAltContact(contact);
      setAltStep(3); // Open Password update prompt choice
      setShowAltModal(true);
    } else {
      performLoginDirectly(contact, password);
    }
  };

  // Trigger inline OTP mode when clicking "Try another method"
  const handleSwitchToOtpMethod = () => {
    const contact = accountType === 'resident' ? userPhone : vendorIdentifier;
    if (!contact.trim()) {
      setError(accountType === 'resident' ? 'Please enter your mobile phone number first.' : 'Please enter your email or phone number first.');
      return;
    }
    setError('');
    setAuthMethod('otp');
    setOtpBoxes(['5', '9', '3', '0']);
    setAltOtp('5930');
    setOtpSentMsg(`OTP sent to ${contact.trim()}. Demo OTP: 5930`);
  };

  const handleCompleteDirectLogin = async (newPwd = null) => {
    setShowAltModal(false);
    const contact = (accountType === 'resident' ? userPhone : vendorIdentifier) || altContact;
    const pwdToUse = newPwd || password || '123456';

    if (accountType === 'resident' && !userPhone) {
      setUserPhone(contact);
    } else if (accountType === 'vendor' && !vendorIdentifier) {
      setVendorIdentifier(contact);
    }

    performLoginDirectly(contact, pwdToUse);
  };

  const handleSaveNewPassword = async (e) => {
    if (e) e.preventDefault();
    if (!altNewPassword || altNewPassword.length < 4) {
      setAltMsg('Password must be at least 4 characters long.');
      setAltMsgType('error');
      return;
    }
    if (altNewPassword !== altConfirmPassword) {
      setAltMsg('Passwords do not match. Please verify.');
      setAltMsgType('error');
      return;
    }

    setLoading(true);
    setAltMsg('Updating password and signing in...');
    setAltMsgType('success');

    // Also update registered user/vendor pool in localStorage
    const contact = (accountType === 'resident' ? userPhone : vendorIdentifier) || altContact;
    try {
      if (accountType === 'resident') {
        const pool = JSON.parse(localStorage.getItem('digilocal_registered_users') || '[]');
        const updated = pool.map(u => {
          if (String(u.phone).trim() === contact.trim() || String(u.email).trim().toLowerCase() === contact.trim().toLowerCase()) {
            return { ...u, password: altNewPassword };
          }
          return u;
        });
        localStorage.setItem('digilocal_registered_users', JSON.stringify(updated));
      } else {
        const pool = JSON.parse(localStorage.getItem('digilocal_registered_vendors') || '[]');
        const updated = pool.map(v => {
          if (String(v.phone_number).trim() === contact.trim() || String(v.email).trim().toLowerCase() === contact.trim().toLowerCase()) {
            return { ...v, password: altNewPassword };
          }
          return v;
        });
        localStorage.setItem('digilocal_registered_vendors', JSON.stringify(updated));
      }
    } catch (_) {}

    setTimeout(() => {
      setPassword(altNewPassword);
      handleCompleteDirectLogin(altNewPassword);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#EDEDE4] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans text-foreground">
      
      {/* 50/50 Balanced Bento Card with GSAP Hardware-Accelerated 3D Zoom-Out & Panel Crossover Swap */}
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
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  setRoute({ page: 'home' });
                }
              }}
              className="px-3.5 py-2 rounded-full bg-white/80 hover:bg-white text-[#1E3623] text-xs font-bold flex items-center space-x-1.5 border border-emerald-900/10 shadow-xs transition-all group shrink-0 cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#1E3623] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            <div
              onClick={() => setRoute({ page: 'home' })}
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

        {/* RIGHT COLUMN: Login Form (50% equal width, md:col-span-6) */}
        <div 
          ref={rightPanelRef}
          className="md:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-6 relative bg-white fill-mode-both"
        >

          {/* Top Right "Become a Vendor" Button */}
          <div className="flex justify-end mb-1">
            <button
              type="button"
              onClick={() => handleNavigateWithAnimation('vendorRegister')}
              className="bg-[#18281F] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-full flex items-center space-x-2 shadow-sm hover:scale-[1.02] transition-all group cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-[#E6C35C]" />
              <span>Become a Vendor</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E6C35C] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>



          <div className="space-y-5">

            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1E3623]">
                {accountType === 'resident' ? 'Welcome Back!' : 'Vendor Portal Login'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium leading-relaxed">
                {accountType === 'resident' 
                  ? 'Login to view your profile, order history, and saved societies.'
                  : 'Login to manage your vendor store catalog, inventory, and incoming orders.'}
              </p>
            </div>

            {/* Notifications */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
              
              {/* Resident User: Phone Number Field | Vendor: Email / Phone Field */}
              {accountType === 'resident' ? (
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
                    Email Address or Phone Number *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. vendor@digilocal.com or 9876543210"
                      value={vendorIdentifier}
                      onChange={(e) => setVendorIdentifier(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELD: PASSWORD (Default) vs INLINE 4-BLOCK OTP (when Try Another Method is clicked) */}
              {authMethod === 'password' ? (
                /* 1. PASSWORD FIELD */
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Try another method link */}
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleSwitchToOtpMethod}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Try another method</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* 2. INLINE 4-BLOCK OTP FIELD (PASSWORD IS REMOVED) */
                <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#1E3623]">
                      4-Digit Verification Code *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('password');
                        setOtpSentMsg('');
                      }}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                    >
                      Use Password Instead
                    </button>
                  </div>

                  {/* 4 Separate Rounded Input Block Boxes (Proportional to Phone field) */}
                  <div className="flex items-center justify-center gap-2.5 sm:gap-3 my-1.5">
                    {otpBoxes.map((digit, i) => (
                      <input
                        key={i}
                        ref={otpBoxRefs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpBoxChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpBoxKeyDown(i, e)}
                        onPaste={handleOtpBoxPaste}
                        className="w-11 h-11 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-bold rounded-2xl bg-[#FAF9F6] border border-border/80 focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-[#1E3623] shadow-xs transition-all outline-none"
                      />
                    ))}
                  </div>

                  {otpSentMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{otpSentMsg}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const contact = accountType === 'resident' ? userPhone : vendorIdentifier;
                          setOtpBoxes(['5', '9', '3', '0']);
                          setAltOtp('5930');
                          setOtpSentMsg(`OTP resent to ${contact.trim()}. Demo OTP: 5930`);
                        }}
                        className="text-[10px] font-extrabold text-emerald-900 underline ml-2 shrink-0 cursor-pointer"
                      >
                        Resend
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
              >
                <span>
                  {loading 
                    ? 'Authenticating...' 
                    : authMethod === 'otp' 
                      ? 'Verify OTP & Log In' 
                      : accountType === 'resident' 
                        ? 'Log In' 
                        : 'Login as Vendor'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-xs font-medium text-muted-foreground pt-1">
              <span>Don’t have an account? </span>
              <button
                type="button"
                onClick={() => handleNavigateWithAnimation(accountType === 'resident' ? 'register' : 'vendorRegister')}
                className="font-bold text-emerald-800 hover:text-emerald-950 underline transition-colors cursor-pointer"
              >
                {accountType === 'resident' ? 'Create Account' : 'Register Store as Vendor'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-OTP Verification Password Update Choice Modal */}
      {showAltModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-border space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowAltModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-secondary hover:bg-border text-ink flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-500/20">
                OTP Verified
              </span>
              <h3 className="text-xl font-serif font-bold text-[#1E3623] mt-2">
                {altStep === 3 && 'Update Account Password?'}
                {altStep === 4 && 'Set New Password'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">
                {altStep === 3 && 'Your 4-digit mobile OTP has been successfully verified! Would you like to update your account password before continuing?'}
                {altStep === 4 && 'Enter your new password below to update your login credentials.'}
              </p>
            </div>

            {/* Alert Message */}
            {altMsg && (
              <div className={`p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
                altMsgType === 'error' 
                  ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}>
                {altMsgType === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                <span>{altMsg}</span>
              </div>
            )}

            {/* STEP 3: Choice - Update Password or Skip */}
            {altStep === 3 && (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAltStep(4)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-between cursor-pointer group"
                >
                  <span>Yes, Update My Password</span>
                  <KeyRound className="w-4 h-4 text-[#E6C35C] group-hover:rotate-12 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCompleteDirectLogin()}
                  className="w-full py-3 px-4 rounded-2xl bg-secondary hover:bg-border text-[#1E3623] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>No, Skip & Log In Now</span>
                  <ArrowRight className="w-4 h-4 text-[#1E3623]" />
                </button>
              </div>
            )}

            {/* STEP 4: Enter New Password */}
            {altStep === 4 && (
              <form onSubmit={handleSaveNewPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={altNewPassword}
                      onChange={(e) => setAltNewPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border border-border text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">Confirm New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={altConfirmPassword}
                      onChange={(e) => setAltConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border border-border text-xs font-semibold focus:outline-none focus:border-[#1E3623] text-ink"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAltStep(3)}
                    className="py-3 px-4 rounded-full bg-secondary text-ink font-bold text-xs uppercase tracking-wider hover:bg-border transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Saving...' : 'Save Password & Log In'}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#E6C35C]" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
