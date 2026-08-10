import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../firebase';
import CountryCodePicker from '../components/CountryCodePicker';

export default function RegisterPage({ currentRoute, setRoute, setActiveUser }) {
  // Stepper State: 'phone' (Step 1) | 'otp' (Step 2) | 'password' (Step 3)
  const [registerStep, setRegisterStep] = useState('phone');

  // Input states
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phonePlaceholder, setPhonePlaceholder] = useState('e.g. 98765 43210');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 6 Single-Digit OTP State & Timer
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [firebaseIdToken, setFirebaseIdToken] = useState(null);
  const otpInputRefs = useRef([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Panel Animation Refs
  const cardRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  // Countdown Effect
  useEffect(() => {
    let timer = null;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

  // Navigate with animation
  const handleNavigateWithAnimation = (targetPage) => {
    setRoute({ page: targetPage });
  };

  // OTP Input Handlers
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);

    if (digit && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpValues[index]) {
        const newOtp = [...otpValues];
        newOtp[index] = '';
        setOtpValues(newOtp);
      } else if (index > 0 && otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
        const newOtp = [...otpValues];
        newOtp[index - 1] = '';
        setOtpValues(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;
    const digits = pastedData.split('');
    const newOtp = [...otpValues];
    digits.forEach((d, idx) => {
      if (idx < 6) newOtp[idx] = d;
    });
    setOtpValues(newOtp);
    const focusIdx = Math.min(digits.length, 5);
    if (otpInputRefs.current[focusIdx]) {
      otpInputRefs.current[focusIdx].focus();
    }
  };

  // STEP 1: Send SMS via Firebase Phone Auth
  const handleSendRegisterOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 7) {
      setError('Please enter a valid mobile phone number.');
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `${countryCode}${phoneNumber.trim()}`;

      const checkRes = await api.checkUserPhone(fullPhone);
      if (checkRes.exists) {
        setError('An account with this mobile number already exists. Please log in instead.');
        return;
      }

      await sendFirebasePhoneOtp(fullPhone, 'recaptcha-container');
      setSuccessMsg(`Verification SMS code sent to ${fullPhone}! Check your mobile phone.`);
      setOtpValues(['', '', '', '', '', '']);
      setResendCountdown(30);
      setRegisterStep('otp');
    } catch (err) {
      const errMsg = err?.message || String(err || '');
      if (errMsg.includes('TOO_MANY_ATTEMPTS_TRY_LATER') || errMsg.includes('too-many-requests')) {
        setError('Too many verification requests for this mobile number. Please wait a few minutes before trying again.');
      } else if (errMsg.includes('INVALID_APP_CREDENTIAL') || errMsg.includes('invalid-app-credential')) {
        setError('Security verification check failed. Please refresh the page and try again.');
      } else if (errMsg.includes('already been rendered') || errMsg.includes('reCAPTCHA')) {
        setError('Verification check reset. Please click "Send Verification OTP" again.');
      } else {
        setError(err.message || 'Failed to send verification SMS.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP via Firebase
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setError('');
    try {
      setLoading(true);
      const fullPhone = `${countryCode}${phoneNumber.trim()}`;
      await sendFirebasePhoneOtp(fullPhone, 'recaptcha-container');
      setSuccessMsg(`Verification SMS resent to ${fullPhone}!`);
      setResendCountdown(30);
    } catch (err) {
      setError(err.message || 'Failed to resend SMS.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Firebase OTP Code
  const handleVerifyOtpCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const enteredOtp = otpValues.join('').trim();
    if (enteredOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP verification code.');
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `${countryCode}${phoneNumber.trim()}`;
      
      try {
        const result = await verifyFirebasePhoneOtp(enteredOtp);
        setFirebaseIdToken(result.idToken);
      } catch (fbVerifyErr) {
        console.warn('Firebase verify fallback:', fbVerifyErr);
        await api.verifyOtp(fullPhone, enteredOtp);
      }

      setIsPhoneVerified(true);
      setRegisterStep('password');
      setSuccessMsg(`Mobile number ${fullPhone} verified successfully! Now create your password below.`);
    } catch (err) {
      setError(err.message || 'Invalid OTP code. Please double check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete Registration via Backend POST /api/users/register
  const handleCompleteRegistrationWithPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your re-entered password.');
      return;
    }

    try {
      setLoading(true);
      const cleanName = name.trim().replace(/\b\w/g, c => c.toUpperCase());
      const userPhone = `${countryCode}${phoneNumber.trim()}`;

      const res = await api.userRegister({
        name: cleanName,
        phone: userPhone,
        password,
        firebase_token: firebaseIdToken || undefined
      });

      // STORE BACKEND TOKENS
      const accessToken = res.accessToken || res.data?.accessToken || res.token;
      const refreshToken = res.refreshToken || res.data?.refreshToken;
      const userObj = res.user || res.data?.user || { name: cleanName, phone: userPhone };

      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (userObj) localStorage.setItem('user', JSON.stringify(userObj));

      const session = {
        user: userObj,
        token: accessToken || `jwt_resident_${Date.now()}`,
        expiresAt: Date.now() + 86400000
      };

      const pendingSocietyId = currentRoute?.redirectSocietyId || sessionStorage.getItem('digilocal_pending_society_id');
      const pendingSocietyName = sessionStorage.getItem('digilocal_pending_society_name');

      if (pendingSocietyId) {
        userObj.society_id = pendingSocietyId;
        if (pendingSocietyName) userObj.society_name = pendingSocietyName;
        session.user = userObj;
      }

      localStorage.setItem('digilocal_user_session', JSON.stringify(session));
      localStorage.setItem('digilocal_resident_session', JSON.stringify(userObj));
      if (setActiveUser) setActiveUser(userObj);

      if (pendingSocietyId) {
        sessionStorage.removeItem('digilocal_pending_society_id');
        sessionStorage.removeItem('digilocal_pending_society_name');
        setSuccessMsg(`Account created successfully! Redirecting to ${pendingSocietyName || 'your selected society'}...`);
        setTimeout(() => {
          setRoute({ page: 'societyVendors', societyId: pendingSocietyId });
        }, 500);
      } else {
        setSuccessMsg('Account created successfully! Opening your User Profile...');
        setTimeout(() => {
          setRoute({ page: 'profile' });
        }, 600);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already exists') || msg.includes('already registered')) {
        setError('An account with this mobile number already exists. Please log in instead.');
        setShowLoginPrompt(true);
      } else {
        setError(msg || 'Account creation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEDE4] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans text-foreground">
      <div id="recaptcha-container"></div>
      
      {/* 50/50 Balanced Bento Card with GSAP Hardware-Accelerated 3D Zoom-Out & Panel Crossover Swap */}
      <div 
        ref={cardRef}
        className="max-w-4xl lg:max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-border/40 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative my-auto min-h-[580px] lg:min-h-[620px]"
      >
        
        {/* LEFT COLUMN: User Registration Form (50% equal width, md:col-span-6 md:order-1) */}
        <div 
          ref={leftPanelRef}
          className="md:order-1 md:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-5 relative bg-white overflow-y-auto"
        >
          
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1E3623]">
              {registerStep === 'phone' && 'Create Account'}
              {registerStep === 'otp' && 'Verify Mobile Number'}
              {registerStep === 'password' && 'Set Your Password'}
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium leading-relaxed">
              {registerStep === 'phone' && 'Enter your name and mobile number to verify your identity via OTP.'}
              {registerStep === 'otp' && (
                <>
                  We've sent a 6-digit security code to{' '}
                  <span className="font-bold text-[#1E3623]">{countryCode} {phoneNumber}</span>.{' '}
                  <button
                    type="button"
                    onClick={() => setRegisterStep('phone')}
                    className="text-emerald-800 underline font-bold hover:text-emerald-950 ml-1 cursor-pointer"
                  >
                    Edit Phone
                  </button>
                </>
              )}
              {registerStep === 'password' && 'Create a password for your DigiLocal account to finalize registration.'}
            </p>
          </div>

          {/* Notifications */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold space-y-2 shadow-xs">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              {showLoginPrompt && (
                <button
                  type="button"
                  onClick={() => setRoute({ page: 'login' })}
                  className="mt-1 w-full py-2 bg-[#1E3623] hover:bg-[#152718] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                >
                  <span>Log In to Existing Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Name & Phone -> Request OTP */}
          {registerStep === 'phone' && (
            <form onSubmit={handleSendRegisterOtp} className="space-y-4 font-sans animate-in fade-in duration-300">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarush Sethiya"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Phone Number */}
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
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
              >
                <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
              </button>
            </form>
          )}

          {/* STEP 2: Enter & Verify 6-Digit OTP */}
          {registerStep === 'otp' && (
            <form onSubmit={handleVerifyOtpCode} className="space-y-5 font-sans animate-in fade-in duration-300">
              
              <div className="py-2">
                <label className="block text-xs font-bold text-center text-[#1E3623] mb-3">
                  Enter 6-Digit Security Code
                </label>

                {/* 6 Single-Digit Input Blocks */}
                <div className="flex justify-center items-center gap-2 sm:gap-2.5">
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold rounded-2xl bg-[#FAF9F6] border-2 border-border/80 text-[#1E3623] focus:outline-none focus:border-[#1E3623] focus:bg-white focus:ring-4 focus:ring-[#1E3623]/10 transition-all shadow-xs"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Timer & Actions */}
              <div className="flex items-center justify-between text-xs px-1">
                <button
                  type="button"
                  onClick={() => setRegisterStep('phone')}
                  className="font-semibold text-muted-foreground hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Number</span>
                </button>

                <button
                  type="button"
                  disabled={resendCountdown > 0 || loading}
                  onClick={handleResendOtp}
                  className={`font-bold transition-colors ${
                    resendCountdown > 0 || loading 
                      ? 'text-muted-foreground cursor-not-allowed' 
                      : 'text-emerald-800 hover:text-emerald-950 underline cursor-pointer'
                  }`}
                >
                  {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpValues.join('').length < 6}
                className="w-full py-4 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Verifying OTP...' : 'Verify Mobile Number'}</span>
                <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
              </button>
            </form>
          )}

          {/* STEP 3: Create Password (Only After Phone is Verified!) */}
          {registerStep === 'password' && (
            <form onSubmit={handleCompleteRegistrationWithPassword} className="space-y-4 font-sans animate-in fade-in duration-300">
              
              {/* Phone Verified Badge Indicator */}
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">Mobile Verified:</span>
                  <span className="font-bold text-emerald-950">{countryCode} {phoneNumber}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Verified ✓
                </span>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
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
                    className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Re-enter Password */}
              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
                  Re-enter Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Final Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
              >
                <span>{loading ? 'Finalizing Account...' : 'Complete Account Registration'}</span>
                <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
              </button>
            </form>
          )}

          {/* Already Registered Link */}
          <div className="text-center text-xs font-medium text-muted-foreground pt-1">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => handleNavigateWithAnimation('login')}
              className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer transition-colors"
            >
              Log In Here
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Pastel Illustration (50% equal width, md:col-span-6 md:order-2) */}
        <div 
          ref={rightPanelRef}
          className="md:order-2 md:col-span-6 bg-[#E3EFE6] p-6 sm:p-8 lg:p-10 flex flex-col justify-between items-center relative overflow-hidden min-h-[320px] md:min-h-[580px]"
        >
          <div className="w-full flex items-center space-x-3 z-10">
            {/* 1. Back Button */}
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  handleNavigateWithAnimation('login');
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

      </div>
    </div>
  );
}
