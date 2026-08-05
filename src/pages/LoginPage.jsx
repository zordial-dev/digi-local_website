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
    }
  }, [currentRoute]);
  
  // User & Vendor Input States
  const [userPhone, setUserPhone] = useState('');
  const [vendorIdentifier, setVendorIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [optionalOtp, setOptionalOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');

  // Animation State & Refs for GSAP Buttery Smooth Transitions
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

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [forgotMsg, setForgotMsg] = useState('');

  // GSAP Silky Smooth Panel Swap & Zoom-Out Animation
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

  const handleSendOptionalOtp = () => {
    const targetContact = accountType === 'resident' ? userPhone : vendorIdentifier;
    if (!targetContact.trim()) {
      setError(accountType === 'resident' ? 'Please enter your mobile phone number first.' : 'Please enter your email or phone number first.');
      return;
    }
    setError('');
    setOtpSentMsg(`OTP sent to ${targetContact.trim()}. Demo OTP: 593021`);
    setTimeout(() => {
      setOptionalOtp('593021');
    }, 1000);
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setOtpSentMsg('');

    if (accountType === 'resident') {
      if (!userPhone.trim()) {
        setError('Please enter your 10-digit mobile phone number.');
        return;
      }
      if (!password.trim() && !optionalOtp.trim()) {
        setError('Please enter either your Password OR 6-digit OTP to log in.');
        return;
      }

      try {
        setLoading(true);
        // RESIDENT / USER LOGIN FLOW
        const res = await api.loginUser({ phone: userPhone.trim(), email: `${userPhone.trim()}@digilocal.com`, password, otp: optionalOtp });
        const userObj = res?.user || {
          user_id: `usr_${Date.now()}`,
          name: `User ${userPhone.trim().slice(-4)}`,
          email: `${userPhone.trim()}@digilocal.com`,
          phone: userPhone.trim(),
          society_name: '',
          society_id: '',
          flat: '',
          joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        };

        const session = {
          user: userObj,
          token: res?.token || `user_jwt_${Date.now()}`,
          expiresAt: Date.now() + 86400000
        };

        localStorage.setItem('digilocal_user_session', JSON.stringify(session));
        localStorage.setItem('digilocal_resident_session', JSON.stringify(userObj));
        if (setActiveUser) setActiveUser(userObj);

        setSuccessMsg('Login successful! Redirecting to your Profile...');
        setTimeout(() => {
          setRoute({ page: 'profile' });
        }, 500);
      } catch (err) {
        setError(err.message || 'Invalid phone number or authentication code. Please try again.');
      } finally {
        setLoading(false);
      }

    } else {

      if (!vendorIdentifier.trim()) {
        setError('Please enter your vendor email address or phone number.');
        return;
      }
      if (!password.trim() && !optionalOtp.trim()) {
        setError('Please enter either your Password OR 6-digit OTP to log in.');
        return;
      }

      try {
        setLoading(true);
        // VENDOR LOGIN FLOW
        const res = await api.loginVendor({ email: vendorIdentifier.trim(), phone: vendorIdentifier.trim(), password, otp: optionalOtp });

        const vendorObj = res.vendor || {
          vendor_id: 1,
          vendor_name: vendorIdentifier.split('@')[0],
          store_name: `${vendorIdentifier.split('@')[0]}'s Store`,
          email: vendorIdentifier.trim(),
          phone_number: vendorIdentifier.trim(),
          status: 'ACTIVE'
        };

        const session = {
          vendor: vendorObj,
          token: res.token || res.accessToken || `jwt_vendor_${Date.now()}`,
          expiresAt: Date.now() + 86400000
        };

        localStorage.setItem('digilocal_vendor_session', JSON.stringify(session));
        if (setActiveVendor) setActiveVendor(vendorObj);

        setSuccessMsg('Login successful! Redirecting to Vendor Portal...');
        setTimeout(() => {
          setRoute({ page: 'vendorDashboard', vendorId: vendorObj.vendor_id });
        }, 500);
      } catch (err) {
        setError(err.message || 'Invalid email/phone or password. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle Forgot Password OTP Trigger
  const handleSendForgotOtp = () => {
    if (!forgotEmail.trim()) {
      setForgotMsg('Please enter a valid registered email address or phone number.');
      return;
    }
    setForgotMsg('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotStep(2);
      setForgotMsg(`OTP sent to ${forgotEmail.trim()}. Use demo OTP: 593021`);
    }, 800);
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (forgotOtp !== '593021' && forgotOtp.length < 4) {
      setForgotMsg('Invalid OTP. Use demo OTP: 593021');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setForgotMsg('Password must be at least 4 characters.');
      return;
    }
    setForgotMsg('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowForgotModal(false);
      setSuccessMsg('Password reset successfully! You can now log in with your new password.');
      setForgotStep(1);
      setForgotEmail('');
      setForgotOtp('');
      setNewPassword('');
    }, 800);
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
            {/* 1. Back Button */}
            <button
              onClick={() => setRoute({ page: 'home' })}
              className="px-3.5 py-2 rounded-full bg-white/80 hover:bg-white text-[#1E3623] text-xs font-bold flex items-center space-x-1.5 border border-emerald-900/10 shadow-xs transition-all group shrink-0 cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#1E3623] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            {/* 2. Logo & Name */}
            <div
              onClick={() => setRoute({ page: 'home' })}
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

        {/* RIGHT COLUMN: Login Form (50% equal width, md:col-span-6) */}
        <div 
          ref={rightPanelRef}
          className="md:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5 relative bg-white fill-mode-both"
        >

          {/* Top Right "Become a Vendor" Button */}
          <div className="flex justify-end">
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

          {/* Dual Login Switcher Tabs (Resident User vs Vendor Portal) */}
          <div className="bg-[#EDEDE4] p-1.5 rounded-full grid grid-cols-2 gap-1 text-xs font-bold shadow-inner">
            <button
              type="button"
              onClick={() => {
                setAccountType('resident');
                setError('');
                setSuccessMsg('');
                setOtpSentMsg('');
              }}
              className={`py-2.5 px-4 rounded-full flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                accountType === 'resident'
                  ? 'bg-[#18281F] text-white shadow-md font-extrabold'
                  : 'text-[#4A5D4E] hover:text-[#18281F]'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${accountType === 'resident' ? 'text-[#E6C35C]' : 'text-[#4A5D4E]'}`} />
              <span>User Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('vendor');
                setError('');
                setSuccessMsg('');
                setOtpSentMsg('');
              }}
              className={`py-2.5 px-4 rounded-full flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                accountType === 'vendor'
                  ? 'bg-[#18281F] text-white shadow-md font-extrabold'
                  : 'text-[#4A5D4E] hover:text-[#18281F]'
              }`}
            >
              <Store className={`w-3.5 h-3.5 ${accountType === 'vendor' ? 'text-[#E6C35C]' : 'text-[#4A5D4E]'}`} />
              <span>Vendor Login</span>
            </button>
          </div>

          <div className="space-y-4">

            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E3623]">
                {accountType === 'resident' ? 'Welcome Back!' : 'Vendor Portal Login'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                {accountType === 'resident' 
                  ? 'Login to view your resident profile, order history, and saved societies.'
                  : 'Login to manage your vendor store catalog, inventory, and incoming orders.'}
              </p>
            </div>

            {/* Notifications */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {otpSentMsg && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <KeyRound className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>{otpSentMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3 font-sans">
              
              {/* Resident User: Phone Number Field | Vendor: Email / Phone Field */}
              {accountType === 'resident' ? (
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
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
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1">
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
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* Password Field (Optional if logging in with OTP) */}
              <div>
                <label className="block text-xs font-bold text-[#1E3623] mb-1">
                  Password <span className="text-muted-foreground font-normal">(or login via OTP below)</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => { setShowForgotModal(true); setForgotEmail(accountType === 'resident' ? userPhone : vendorIdentifier); }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Optional OTP Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1E3623]">
                    OTP <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOptionalOtp}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    Get OTP via SMS
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP (Optional)"
                    value={optionalOtp}
                    onChange={(e) => setOptionalOtp(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 mt-2 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : accountType === 'resident' ? 'Login as Resident User' : 'Login as Vendor'}</span>
                <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
              </button>
            </form>

            {/* Google Social Login - Commented Out For Now
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-border w-full" />
              <span className="bg-white px-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider absolute">
                or
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 rounded-full bg-[#FAF9F6] hover:bg-white border border-border/80 text-xs font-bold text-[#1E3623] shadow-xs transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google ({accountType === 'resident' ? 'User' : 'Vendor'})</span>
            </button>
            */}

            {/* Sign Up Link */}
            <div className="text-center text-xs font-medium text-muted-foreground pt-1">
              <span>Don’t have an account? </span>
              <button
                type="button"
                onClick={() => handleNavigateWithAnimation(accountType === 'resident' ? 'register' : 'vendorRegister')}
                className="font-bold text-emerald-800 hover:text-emerald-950 underline transition-colors cursor-pointer"
              >
                {accountType === 'resident' ? 'Create User Account' : 'Register Store as Vendor'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-serif font-bold text-ink">Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-8 h-8 rounded-full bg-secondary text-ink flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {forgotMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                {forgotMsg}
              </div>
            )}

            {forgotStep === 1 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Enter your registered phone number or email address. We will send you a verification code to reset your password.
                </p>
                <input
                  type="text"
                  placeholder="e.g. 9876543210 or name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-border text-xs font-semibold focus:outline-none focus:border-[#1E3623]"
                />
                <button
                  type="button"
                  onClick={handleSendForgotOtp}
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[#18281F] text-white font-bold text-xs uppercase"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Enter Verification Code (OTP)</label>
                  <input
                    type="text"
                    placeholder="e.g. 593021"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-border text-xs font-semibold focus:outline-none focus:border-[#1E3623]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-border text-xs font-semibold focus:outline-none focus:border-[#1E3623]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[#18281F] text-white font-bold text-xs uppercase"
                >
                  {loading ? 'Resetting...' : 'Save New Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
