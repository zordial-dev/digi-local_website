import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../firebase';
import CountryCodePicker from '../components/CountryCodePicker';
import { formatUserFacingError } from '../utils/errorFormatter';

export default function RegisterPage({ setRoute, setActiveUser }) {
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

      await sendFirebasePhoneOtp(fullPhone, 'recaptcha-container');
      setSuccessMsg(`Verification SMS code sent to ${fullPhone}! Check your mobile phone.`);
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
      await sendFirebasePhoneOtp(fullPhone, 'recaptcha-container');
      setSuccessMsg(`Verification SMS resent to ${fullPhone}!`);
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
    <div className="min-h-screen bg-[#EDEDE4] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Hidden Container required for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      <div className="bg-white rounded-[2.5rem] max-w-4xl w-full overflow-hidden shadow-2xl border border-border flex flex-col md:flex-row relative">
        
        {/* Top Back Navigation Button */}
        <button
          onClick={() => setRoute({ page: 'home' })}
          className="absolute top-6 left-6 z-20 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-ink text-xs font-bold transition-all shadow-xs border border-border cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {/* LEFT PANEL: Form Inputs & Step Views */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 pt-16 flex flex-col justify-between">
          
          <div className="space-y-5">
            {/* Header */}
            <div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-500/20">
                {registerStep === 'phone' && 'Step 1 of 3: Mobile Identity'}
                {registerStep === 'otp' && 'Step 2 of 3: Verification Code'}
                {registerStep === 'password' && 'Step 3 of 3: Secure Account'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1E3623] mt-2">
                Create Account
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">
                {registerStep === 'phone' && 'Enter your name and mobile number to verify your identity via OTP.'}
                {registerStep === 'otp' && `Enter the 6-digit security code sent to ${countryCode}${phoneNumber}.`}
                {registerStep === 'password' && 'Create a strong password to protect your DigiLocal resident account.'}
              </p>
            </div>

            {/* Success Notification Banner */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* General Error Banner (Non-field specific) */}
            {generalError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* STEP 1: Enter Name & Phone */}
            {registerStep === 'phone' && (
              <form onSubmit={handleSendRegisterOtp} className="space-y-4 font-sans animate-in fade-in duration-300">
                
                {/* Full Name Field */}
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
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError('');
                      }}
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border text-xs font-semibold focus:outline-none text-ink transition-all shadow-xs ${
                        nameError 
                          ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20' 
                          : 'border-border/80 focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15'
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

                {/* Mobile Phone Number Field */}
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
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setPhoneError('');
                        }}
                        className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border text-xs font-semibold focus:outline-none text-ink transition-all shadow-xs ${
                          phoneError 
                            ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20' 
                            : 'border-border/80 focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15'
                        }`}
                      />
                    </div>
                  </div>

                  {/* FIELD-LEVEL ERROR DISPLAYED DIRECTLY UNDER MOBILE PHONE FIELD */}
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
                      className="mt-2 w-full py-2.5 bg-[#1E3623] hover:bg-[#152718] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Log In to Existing Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
                >
                  <span>{loading ? 'Sending Verification OTP...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
                </button>
              </form>
            )}

            {/* STEP 2: 6-Digit OTP */}
            {registerStep === 'otp' && (
              <form onSubmit={handleVerifyOtpCode} className="space-y-5 font-sans animate-in fade-in duration-300">
                <div className="py-2">
                  <label className="block text-xs font-bold text-center text-[#1E3623] mb-3">
                    Enter 6-Digit Security Code
                  </label>

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
                        className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold rounded-2xl bg-[#FAF9F6] border-2 text-[#1E3623] focus:outline-none transition-all shadow-xs ${
                          otpError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-border/80 focus:border-[#1E3623]'
                        }`}
                      />
                    ))}
                  </div>

                  {/* FIELD-LEVEL OTP ERROR */}
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
                    onClick={() => { setRegisterStep('phone'); setPhoneError(''); setOtpError(''); }}
                    className="font-semibold text-muted-foreground hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Mobile Number</span>
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

            {/* STEP 3: Create Password */}
            {registerStep === 'password' && (
              <form onSubmit={handleCompleteRegistrationWithPassword} className="space-y-4 font-sans animate-in fade-in duration-300">
                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-emerald-900">Mobile Verified:</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-950">{countryCode}{phoneNumber}</span>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
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
                      className={`w-full pl-11 pr-11 py-3 rounded-2xl bg-[#FAF9F6] border text-xs font-semibold focus:outline-none text-ink transition-all shadow-xs ${
                        passwordError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-border/80 focus:border-[#1E3623]'
                      }`}
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

                {/* Confirm Password Field */}
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
                      onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                      className={`w-full pl-11 pr-11 py-3 rounded-2xl bg-[#FAF9F6] border text-xs font-semibold focus:outline-none text-ink transition-all shadow-xs ${
                        passwordError ? 'border-rose-400 focus:border-rose-600 bg-rose-50/20' : 'border-border/80 focus:border-[#1E3623]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <Eye className="w-4 h-4 text-emerald-800" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* FIELD-LEVEL PASSWORD ERROR */}
                {passwordError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{loading ? 'Creating Account...' : 'Complete & Finish Registration'}</span>
                  <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
                </button>
              </form>
            )}

          </div>

          {/* Footer Navigation Link */}
          <div className="text-center text-xs font-medium text-muted-foreground pt-6">
            <span>Already have an account? </span>
            <button
              onClick={() => setRoute({ page: 'login' })}
              className="font-bold text-emerald-800 hover:text-emerald-950 underline transition-colors cursor-pointer"
            >
              Log In Here
            </button>
          </div>

        </div>

        {/* RIGHT PANEL: Decorative Illustration */}
        <div className="w-full md:w-1/2 bg-[#E1EADF] p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden border-t md:border-t-0 md:border-l border-border">
          <div className="w-full max-w-sm aspect-square bg-[#C9DBC6] rounded-3xl overflow-hidden shadow-inner relative flex items-center justify-center border border-[#B3CBB0]">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
              alt="Community Local Market"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18281F]/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E6C35C]">Hyperlocal Community Network</span>
              <h3 className="font-serif text-lg font-bold">Connecting gated societies with trusted local vendors.</h3>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <h4 className="font-serif font-bold text-sm text-[#18281F]">Hyperlocal Gated Community Network</h4>
            <p className="text-[11px] text-muted-[#18281F]/70 font-medium">Connecting gated societies with verified local merchants.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
