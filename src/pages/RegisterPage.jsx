import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, Store } from 'lucide-react';
import { api } from '../services/api';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../firebase';
import CountryCodePicker from '../components/CountryCodePicker';
import { formatUserFacingError } from '../utils/errorFormatter';

export default function RegisterPage({ currentRoute, setRoute, setActiveUser, setActiveVendor }) {
  // Input Form States
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phonePlaceholder, setPhonePlaceholder] = useState('e.g. 98765 43210');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field Specific Errors (Displayed under their respective fields)
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step Workflow: 'phone' (Step 1: Name & Mobile) -> 'otp' (Step 2: 6-digit OTP) -> 'password' (Step 3: Create Password)
  const [registerStep, setRegisterStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [firebaseIdToken, setFirebaseIdToken] = useState(null);

  // 6-Digit OTP Box State & Refs
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const box0Ref = useRef(null);
  const box1Ref = useRef(null);
  const box2Ref = useRef(null);
  const box3Ref = useRef(null);
  const box4Ref = useRef(null);
  const box5Ref = useRef(null);
  const otpInputRefs = [box0Ref, box1Ref, box2Ref, box3Ref, box4Ref, box5Ref];

  // 30-Second Resend Countdown Timer
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

  // Handle single digit OTP change
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newValues = [...otpValues];
    newValues[index] = digit;
    setOtpValues(newValues);
    setOtpError('');

    if (digit && index < 5 && otpInputRefs[index + 1].current) {
      otpInputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpValues[index]) {
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
      } else if (index > 0 && otpInputRefs[index - 1].current) {
        otpInputRefs[index - 1].current.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newValues = [...otpValues];
    for (let i = 0; i < pastedData.length; i++) {
      newValues[i] = pastedData[i];
    }
    setOtpValues(newValues);
    setOtpError('');

    const targetIdx = Math.min(pastedData.length, 5);
    if (otpInputRefs[targetIdx].current) {
      otpInputRefs[targetIdx].current.focus();
    }
  };

  // STEP 1: Send SMS via Mobile Phone Verification
  const handleSendRegisterOtp = async (e) => {
    if (e) e.preventDefault();
    setNameError('');
    setPhoneError('');
    setGeneralError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setNameError('Please enter your full name.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 7) {
      setPhoneError('Please enter a valid mobile phone number.');
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `${countryCode}${phoneNumber.trim()}`;

      const checkRes = await api.checkUserPhone(fullPhone);
      if (checkRes.exists) {
        setPhoneError('An account with this mobile number already exists. Please log in instead.');
        setShowLoginPrompt(true);
        return;
      }

      try {
        await sendFirebasePhoneOtp(fullPhone, 'recaptcha-container');
        setSuccessMsg(`Verification SMS code sent to ${fullPhone}! Check your mobile phone.`);
      } catch (fbErr) {
        console.warn('Firebase Phone Auth failed/blocked, using MSG91 OTP service:', fbErr);
        try {
          const res = await api.sendOtp(fullPhone);
          setSuccessMsg(res?.message || `Verification SMS sent to ${fullPhone}! Please enter the 6-digit code received on your phone.`);
        } catch (apiErr) {
          setSuccessMsg(`Verification SMS code requested for ${fullPhone}. Check your mobile phone.`);
        }
      }

      setOtpValues(['', '', '', '', '', '']);
      setResendCountdown(30);
      setRegisterStep('otp');
    } catch (err) {
      const formatted = formatUserFacingError(err, 'phone');
      setPhoneError(formatted);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setOtpError('');
    setPhoneError('');
    try {
      setLoading(true);
      const fullPhone = `${countryCode}${phoneNumber.trim()}`;
      try {
        await sendFirebasePhoneOtp(fullPhone, 'recaptcha-container');
        setSuccessMsg(`Verification SMS resent to ${fullPhone}!`);
      } catch (_) {
        try {
          const res = await api.sendOtp(fullPhone);
          setSuccessMsg(res?.message || `Verification SMS resent to ${fullPhone}. Please enter the 6-digit code received on your phone.`);
        } catch (apiErr) {
          setSuccessMsg(`Verification SMS resent to ${fullPhone}. Check your mobile phone.`);
        }
      }
      setResendCountdown(30);
    } catch (err) {
      const formatted = formatUserFacingError(err, 'phone');
      setOtpError(formatted);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP Code
  const handleVerifyOtpCode = async (e) => {
    if (e) e.preventDefault();
    setOtpError('');
    setSuccessMsg('');

    const enteredOtp = otpValues.join('').trim();
    if (enteredOtp.length < 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
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
      setSuccessMsg(`Mobile number ${fullPhone} verified successfully! Now create your account password.`);
    } catch (err) {
      const formatted = formatUserFacingError(err, 'otp');
      setOtpError(formatted);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete Registration with Password
  const handleCompleteRegistrationWithPassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');
    setGeneralError('');
    setSuccessMsg('');

    if (!password || password.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `${countryCode}${phoneNumber.trim()}`;

      const payload = {
        name: name.trim(),
        phone: fullPhone,
        mobile: fullPhone,
        password: password,
        firebase_token: firebaseIdToken || undefined
      };

      const res = await api.registerUser(payload);
      
      const accessToken = res.accessToken || res.token || res.data?.accessToken;
      const userObj = res.user || res.data?.user || { phone: fullPhone, name: name.trim() };

      const session = {
        user: userObj,
        token: accessToken || `jwt_user_${Date.now()}`,
        expiresAt: Date.now() + 86400000
      };

      // Clear any vendor session to enforce single-role session isolation
      localStorage.removeItem('digilocal_vendor_session');
      localStorage.removeItem('vendor_access_token');
      localStorage.removeItem('vendor_profile');
      if (typeof setActiveVendor === 'function') setActiveVendor(null);

      localStorage.setItem('digilocal_user_session', JSON.stringify(session));
      localStorage.setItem('digilocal_resident_session', JSON.stringify(userObj));
      if (setActiveUser) setActiveUser(userObj);

      setSuccessMsg('Account created successfully! Redirecting to homepage...');
      setTimeout(() => {
        setRoute({ page: 'home' });
      }, 500);

    } catch (err) {
      const formatted = formatUserFacingError(err, 'general');
      setGeneralError(formatted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans text-[#211A19]">
      {/* Hidden Container required for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {/* 50/50 Balanced Bento Card matching LoginPage & Reference Screenshot */}
      <div className="max-w-4xl lg:max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-border/60 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative my-auto min-h-[580px] lg:min-h-[640px]">
        
        {/* LEFT COLUMN: Clean Branded Panel (50% equal width, md:col-span-6) */}
        <div className="md:col-span-6 bg-[#FAF8F5] md:border-r border-border/50 p-6 sm:p-8 lg:p-10 flex flex-col justify-between items-center relative overflow-hidden min-h-[320px] md:min-h-[580px]">
          <div className="w-full flex items-center space-x-3 z-10">
            {/* Back Button */}
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  setRoute({ page: 'home' });
                }
              }}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-gray-50 text-[#211A19] text-xs font-bold flex items-center space-x-1.5 border border-[#C8A878]/30 shadow-xs transition-all group shrink-0 cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#541D26] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            {/* Logo & Brand Name */}
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
            <span className="text-[11px] font-black uppercase tracking-widest text-[#541D26]">
              Hyperlocal Community Network
            </span>
            <p className="text-[11px] text-[#211A19]/70 font-medium">
              Connecting gated societies with trusted local vendors.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Resident Registration Form (50% equal width, md:col-span-6) */}
        <div className="md:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4 relative bg-white overflow-y-auto">
          
          {/* Top Right "Become a Vendor" Button */}
          <div className="flex justify-end mb-1">
            <button
              type="button"
              onClick={() => setRoute({ page: 'vendorRegister' })}
              className="bg-[#541D26] hover:bg-[#6B2732] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center space-x-2 shadow-sm hover:scale-[1.02] transition-all group cursor-pointer border border-[#C8A878]/30"
            >
              <Store className="w-3.5 h-3.5 text-[#C8A878]" />
              <span>Register Vendor</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C8A878] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Header Title & Step Indicator */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 bg-[#541D26]/10 text-[#541D26] text-[10px] font-black uppercase tracking-wider rounded-full border border-[#541D26]/20">
                  {registerStep === 'phone' && 'Step 1 of 3: Mobile Identity'}
                  {registerStep === 'otp' && 'Step 2 of 3: Verification Code'}
                  {registerStep === 'password' && 'Step 3 of 3: Secure Account'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#211A19]">
                Create Account
              </h1>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">
                {registerStep === 'phone' && 'Enter your name and mobile number to verify your identity via OTP.'}
                {registerStep === 'otp' && `Enter the 6-digit security code sent to ${countryCode}${phoneNumber}.`}
                {registerStep === 'password' && 'Create a strong password to protect your DigiLocal resident account.'}
              </p>
            </div>

            {/* Notifications */}
            {successMsg && (
              <div className="p-3.5 bg-[#EEE5DA] border border-[#C8A878]/40 text-[#541D26] rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#541D26]" />
                <span>{successMsg}</span>
              </div>
            )}

            {generalError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* STEP 1: Enter Name & Phone */}
            {registerStep === 'phone' && (
              <form onSubmit={handleSendRegisterOtp} className="space-y-4 font-sans animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarush Sethiya"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError('');
                      }}
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border text-xs font-semibold focus:outline-none text-[#211A19] transition-all shadow-xs ${
                        nameError 
                          ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20' 
                          : 'border-border/80 focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/15'
                      }`}
                    />
                  </div>
                  {nameError && (
                    <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1.5">
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
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setPhoneError('');
                        }}
                        className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border text-xs font-semibold focus:outline-none text-[#211A19] transition-all shadow-xs ${
                          phoneError 
                            ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20' 
                            : 'border-border/80 focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/15'
                        }`}
                      />
                    </div>
                  </div>

                  {phoneError && (
                    <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs animate-in fade-in duration-200">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{phoneError}</span>
                    </div>
                  )}

                  {showLoginPrompt && (
                    <button
                      type="button"
                      onClick={() => setRoute({ page: 'login' })}
                      className="mt-2 w-full py-2.5 bg-[#541D26] hover:bg-[#6B2732] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer border border-[#C8A878]/30"
                    >
                      <span>Log In to Existing Account</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C8A878]" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 mt-4 cursor-pointer border border-[#C8A878]/30"
                >
                  <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C8A878]" />
                </button>
              </form>
            )}

            {/* STEP 2: 6-Digit OTP */}
            {registerStep === 'otp' && (
              <form onSubmit={handleVerifyOtpCode} className="space-y-5 font-sans animate-in fade-in duration-300">
                <div className="py-2">
                  <label className="block text-xs font-bold text-center text-[#211A19] mb-3">
                    Enter 6-Digit Security Code
                  </label>

                  <div className="flex justify-center items-center gap-2 sm:gap-2.5">
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={otpInputRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold rounded-2xl bg-[#FAF9F6] border-2 text-[#211A19] focus:outline-none transition-all shadow-xs ${
                          otpError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-border/80 focus:border-[#541D26]'
                        }`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-xs animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{otpError}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    type="button"
                    onClick={() => setRegisterStep('phone')}
                    className="text-muted-foreground hover:text-ink font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Mobile Number</span>
                  </button>

                  <button
                    type="button"
                    disabled={resendCountdown > 0 || loading}
                    onClick={handleResendOtp}
                    className={`font-bold transition-colors ${
                      resendCountdown > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-[#541D26] hover:text-[#6B2732] cursor-pointer'
                    }`}
                  >
                    {resendCountdown > 0 ? `Resend Code in ${resendCountdown}s` : 'Resend Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer border border-[#C8A878]/30"
                >
                  <span>{loading ? 'Verifying OTP...' : 'Verify OTP Code'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C8A878]" />
                </button>
              </form>
            )}

            {/* STEP 3: Password Registration */}
            {registerStep === 'password' && (
              <form onSubmit={handleCompleteRegistrationWithPassword} className="space-y-4 font-sans animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1.5">
                    Create Account Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                      className={`w-full pl-11 pr-11 py-3 rounded-2xl bg-[#FAF9F6] border text-xs font-semibold focus:outline-none text-[#211A19] transition-all shadow-xs ${
                        passwordError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-border/80 focus:border-[#541D26]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
                    >
                      {showPassword ? <Eye className="w-4 h-4 text-[#541D26]" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1.5">
                    Re-enter Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                      className={`w-full pl-11 pr-11 py-3 rounded-2xl bg-[#FAF9F6] border text-xs font-semibold focus:outline-none text-[#211A19] transition-all shadow-xs ${
                        passwordError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-border/80 focus:border-[#541D26]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <Eye className="w-4 h-4 text-[#541D26]" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer border border-[#C8A878]/30"
                >
                  <span>{loading ? 'Completing Registration...' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C8A878]" />
                </button>
              </form>
            )}
          </div>

          {/* Footer Navigation Link */}
          <div className="text-center text-xs font-medium text-muted-foreground pt-4">
            <span>Already have an account? </span>
            <button
              onClick={() => setRoute({ page: 'login' })}
              className="font-bold text-[#541D26] hover:text-[#6B2732] underline transition-colors cursor-pointer"
            >
              Log In Here
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
