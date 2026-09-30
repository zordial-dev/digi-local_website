import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, Store } from 'lucide-react';
import { api } from '../services/api';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../firebase';
import CountryCodePicker from '../components/CountryCodePicker';
import { formatUserFacingError } from '../utils/errorFormatter';
import { useOtpCooldown } from '../hooks/useOtpCooldown';

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

  // 6-Digit OTP Box State & Exponential Cooldown
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [verificationId, setVerificationId] = useState('');
  const { cooldown: resendCountdown, canResend, triggerCooldown, resetCooldown } = useOtpCooldown();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const box0Ref = useRef(null);
  const box1Ref = useRef(null);
  const box2Ref = useRef(null);
  const box3Ref = useRef(null);
  const box4Ref = useRef(null);
  const box5Ref = useRef(null);
  const otpInputRefs = [box0Ref, box1Ref, box2Ref, box3Ref, box4Ref, box5Ref];

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

      // Send OTP directly for registration
      const res = await api.sendMobileOtp({ phone: fullPhone, role: 'user', purpose: 'register' });
      if (res?.verification_id || res?.verificationId) {
        setVerificationId(res.verification_id || res.verificationId);
      }
      const cooldownSec = res.cooldown_seconds || 10;
      triggerCooldown(cooldownSec);
      setSuccessMsg(res?.message || `Verification SMS sent to ${fullPhone}! Please enter the 6-digit code received on your phone.`);

      setOtpValues(['', '', '', '', '', '']);
      setRegisterStep('otp');
    } catch (err) {
      if (err?.status === 429 || err?.isCooldown) {
        const waitSec = err.retry_after || err.cooldown_seconds || 10;
        triggerCooldown(waitSec);
        setPhoneError(err.message || `Please wait ${waitSec} seconds before requesting a new OTP.`);
        setRegisterStep('otp');
        return;
      }
      const formatted = formatUserFacingError(err, 'phone');
      setPhoneError(formatted);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (!canResend || resendCountdown > 0) return;
    setOtpError('');
    setPhoneError('');
    try {
      setLoading(true);
      const fullPhone = `${countryCode}${phoneNumber.trim()}`;
      const res = await api.sendMobileOtp({ phone: fullPhone, role: 'user', purpose: 'register' });
      if (res?.verification_id || res?.verificationId) {
        setVerificationId(res.verification_id || res.verificationId);
      }
      const cooldownSec = res.cooldown_seconds || 10;
      triggerCooldown(cooldownSec);
      setSuccessMsg(res?.message || `Verification SMS resent to ${fullPhone}. Next resend available in ${cooldownSec}s.`);
    } catch (err) {
      if (err?.status === 429 || err?.isCooldown) {
        const waitSec = err.retry_after || err.cooldown_seconds || 10;
        triggerCooldown(waitSec);
        setOtpError(err.message || `Please wait ${waitSec} seconds before resending OTP.`);
        return;
      }
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
      
      await api.verifyRegistrationOtp({
        phone: fullPhone,
        otp: enteredOtp,
        role: 'user',
        verification_id: verificationId
      });

      resetCooldown();
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
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#FAF8F5] flex flex-col justify-start md:justify-center items-center p-3.5 sm:p-6 lg:p-8 py-5 sm:py-8 font-sans text-[#211A19]">
      {/* Hidden Container required for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {/* 50/50 Balanced Bento Card with Full Responsive Adaptability */}
      <div className="w-full max-w-lg md:max-w-4xl lg:max-w-5xl bg-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-xl md:shadow-2xl border border-stone-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative my-auto">
        
        {/* LEFT COLUMN: Clean Branded Panel (Desktop Only, 50% width) */}
        <div className="hidden md:flex md:col-span-6 bg-[#FAF8F5] md:border-r border-stone-200/60 p-6 sm:p-8 lg:p-10 flex-col justify-between items-center relative overflow-hidden min-h-[520px]">
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
              className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 text-[#211A19] text-xs font-bold flex items-center space-x-1.5 border border-stone-200 shadow-xs transition-all group shrink-0 cursor-pointer"
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
              <div className="w-8 h-8 rounded-full bg-[#541D26]/10 border border-[#541D26]/15 flex items-center justify-center p-1 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                <img src="/logo.png" alt="DigiLocal" className="w-full h-full object-contain scale-[1.8] mix-blend-multiply" />
              </div>
              <span className="font-cormorant italic text-lg font-bold text-[#541D26]">DigiLocal</span>
            </div>
          </div>

          <div className="my-auto relative z-10 w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[310px] py-4">
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
            <p className="text-[11px] text-stone-600 font-medium">
              Connecting gated societies with trusted local vendors.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Resident Registration Form */}
        <div className="md:col-span-6 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center space-y-4 sm:space-y-5 bg-white">
          
          {/* Top Bar for Mobile + "Register Vendor" button */}
          <div className="flex items-center justify-between gap-2 pb-1">
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    setRoute({ page: 'home' });
                  }
                }}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#211A19] cursor-pointer hover:bg-stone-200 transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#541D26]" />
              </button>
              <div
                onClick={() => setRoute({ page: 'home' })}
                className="flex items-center space-x-1.5 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#541D26]/10 flex items-center justify-center p-0.5 overflow-hidden">
                  <img src="/logo.png" alt="DigiLocal" className="w-full h-full object-contain scale-[1.6] mix-blend-multiply" />
                </div>
                <span className="font-cormorant italic text-base font-bold text-[#541D26]">DigiLocal</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRoute({ page: 'vendorRegister' })}
              className="bg-[#541D26] hover:bg-[#6B2732] text-white text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center space-x-1.5 shadow-sm hover:scale-[1.02] transition-all group cursor-pointer border border-[#C8A878]/30 ml-auto shrink-0 min-h-[34px] sm:min-h-[38px]"
            >
              <Store className="w-3.5 h-3.5 text-[#C8A878]" />
              <span>Register Vendor</span>
              <ArrowRight className="w-3 h-3 text-[#C8A878] group-hover:translate-x-0.5 transition-transform hidden sm:inline-block" />
            </button>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {/* Header Title & Step Indicator */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-[#541D26]/10 text-[#541D26] text-[10px] font-black uppercase tracking-wider rounded-full border border-[#541D26]/20">
                  {registerStep === 'phone' && 'Step 1 of 3: Mobile Identity'}
                  {registerStep === 'otp' && 'Step 2 of 3: Verification Code'}
                  {registerStep === 'password' && 'Step 3 of 3: Secure Account'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#211A19]">
                Create Account
              </h1>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed font-medium">
                {registerStep === 'phone' && 'Enter your name and mobile number to verify your identity via OTP.'}
                {registerStep === 'otp' && `Enter the 6-digit security code sent to ${countryCode}${phoneNumber}.`}
                {registerStep === 'password' && 'Create a strong password to protect your DigiLocal resident account.'}
              </p>
            </div>

            {/* Notifications */}
            {successMsg && (
              <div className="p-3 bg-[#EEE5DA] border border-[#C8A878]/40 text-[#541D26] rounded-xl sm:rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#541D26]" />
                <span>{successMsg}</span>
              </div>
            )}

            {generalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* STEP 1: Enter Name & Phone */}
            {registerStep === 'phone' && (
              <form onSubmit={handleSendRegisterOtp} className="space-y-3.5 font-sans animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarush Sethiya"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError('');
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FAF9F6] border text-sm font-medium focus:outline-none focus:bg-white text-[#211A19] transition-all shadow-xs ${
                        nameError 
                          ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20' 
                          : 'border-stone-200 focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/15'
                      }`}
                    />
                  </div>
                  {nameError && (
                    <p className="mt-1 text-xs font-bold text-rose-600 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">
                    Mobile Phone Number *
                  </label>
                  <div className="flex items-center gap-2 w-full">
                    <CountryCodePicker
                      value={countryCode}
                      onChange={(val, countryObj) => {
                        setCountryCode(val);
                        setPhonePlaceholder(countryObj?.placeholder || 'e.g. 98765 43210');
                      }}
                    />
                    <div className="relative flex-1 min-w-0">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="tel"
                        required
                        placeholder={phonePlaceholder}
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setPhoneError('');
                        }}
                        className={`w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FAF9F6] border text-sm font-medium focus:outline-none focus:bg-white text-[#211A19] transition-all shadow-xs ${
                          phoneError 
                            ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20' 
                            : 'border-stone-200 focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/15'
                        }`}
                      />
                    </div>
                  </div>

                  {phoneError && (
                    <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs animate-in fade-in duration-200">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span>{phoneError}</span>
                    </div>
                  )}

                  {showLoginPrompt && (
                    <button
                      type="button"
                      onClick={() => setRoute({ page: 'login' })}
                      className="mt-2 w-full py-2.5 bg-[#541D26] hover:bg-[#6B2732] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer border border-[#C8A878]/30 min-h-[42px]"
                    >
                      <span>Log In to Existing Account</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C8A878]" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 mt-3 cursor-pointer border border-[#C8A878]/30 min-h-[46px] active:scale-[0.99]"
                >
                  <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C8A878]" />
                </button>
              </form>
            )}

            {/* STEP 2: 6-Digit OTP */}
            {registerStep === 'otp' && (
              <form onSubmit={handleVerifyOtpCode} className="space-y-4 font-sans animate-in fade-in duration-300">
                <div className="py-1">
                  <label className="block text-xs font-bold text-center text-[#211A19] mb-2.5">
                    Enter 6-Digit Security Code
                  </label>

                  <div className="flex justify-center items-center gap-1.5 sm:gap-2">
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
                        className={`w-9 h-11 sm:w-10 sm:h-12 text-center text-base sm:text-lg font-bold rounded-xl bg-[#FAF9F6] border-2 text-[#211A19] focus:outline-none transition-all shadow-xs ${
                          otpError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-stone-200 focus:border-[#541D26]'
                        }`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-xs animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span>{otpError}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs px-1 gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setRegisterStep('phone')}
                    className="text-stone-500 hover:text-[#211A19] font-semibold flex items-center space-x-1 transition-colors cursor-pointer py-1 min-h-[32px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Mobile</span>
                  </button>

                  <button
                    type="button"
                    disabled={resendCountdown > 0 || loading}
                    onClick={handleResendOtp}
                    className={`font-bold transition-colors py-1 min-h-[32px] ${
                      resendCountdown > 0 ? 'text-stone-400 cursor-not-allowed' : 'text-[#541D26] hover:text-[#6B2732] cursor-pointer'
                    }`}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer border border-[#C8A878]/30 min-h-[46px] active:scale-[0.99]"
                >
                  <span>{loading ? 'Verifying OTP...' : 'Verify OTP Code'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C8A878]" />
                </button>
              </form>
            )}

            {/* STEP 3: Password Registration */}
            {registerStep === 'password' && (
              <form onSubmit={handleCompleteRegistrationWithPassword} className="space-y-3.5 font-sans animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">
                    Create Account Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                      className={`w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FAF9F6] border text-sm font-medium focus:outline-none focus:bg-white text-[#211A19] transition-all shadow-xs ${
                        passwordError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-stone-200 focus:border-[#541D26]'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-[#211A19] transition-colors cursor-pointer z-10"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">
                    Re-enter Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                      className={`w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FAF9F6] border text-sm font-medium focus:outline-none focus:bg-white text-[#211A19] transition-all shadow-xs ${
                        passwordError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-stone-200 focus:border-[#541D26]'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-[#211A19] transition-colors cursor-pointer z-10"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer border border-[#C8A878]/30 min-h-[46px] active:scale-[0.99]"
                >
                  <span>{loading ? 'Completing Registration...' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C8A878]" />
                </button>
              </form>
            )}
          </div>

          {/* Footer Navigation Link */}
          <div className="text-center text-xs font-medium text-stone-500 pt-2">
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
