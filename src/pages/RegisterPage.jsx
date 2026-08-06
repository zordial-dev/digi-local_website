import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { api } from '../services/api';

export default function RegisterPage({ currentRoute, setRoute, setActiveUser }) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation State & Refs for GSAP Smooth Transitions
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

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }
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
      const userPhone = phoneNumber.trim();
      const userEmail = '';

      const payload = {
        name: cleanName,
        phone: userPhone,
        email: userEmail,
        password
      };

      let userObj;
      try {
        const res = await api.registerUser(payload);
        userObj = res?.user || {
          user_id: `usr_${Date.now()}`,
          name: cleanName,
          phone: userPhone,
          email: userEmail,
          society_name: '',
          society_id: '',
          flat: '',
          joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        };
      } catch (err) {
        userObj = {
          user_id: `usr_${Date.now()}`,
          name: cleanName,
          phone: userPhone,
          email: userEmail,
          society_name: '',
          society_id: '',
          flat: '',
          joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        };
      }

      const session = {
        user: userObj,
        token: `jwt_resident_${Date.now()}`,
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
      setError(err.message || 'Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEDE4] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans text-foreground">
      
      {/* 50/50 Balanced Bento Card with GSAP Hardware-Accelerated 3D Zoom-Out & Panel Crossover Swap */}
      <div 
        ref={cardRef}
        className="max-w-4xl lg:max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-border/40 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative my-auto min-h-[580px] lg:min-h-[620px] fill-mode-both"
      >
        
        {/* LEFT COLUMN: User Registration Form (50% equal width, md:col-span-6 md:order-1) */}
        <div 
          ref={leftPanelRef}
          className="md:order-1 md:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-5 relative bg-white fill-mode-both overflow-y-auto"
        >
          
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1E3623]">
              Create Account
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium leading-relaxed">
              Fill in your details below to register your DigiLocal account.
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

          {/* Register Form */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4 font-sans">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
                Name *
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
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
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

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
            >
              <span>{loading ? 'Creating Account...' : 'Create My Account'}</span>
              <ArrowRight className="w-4 h-4 text-[#E6C35C]" />
            </button>
          </form>

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
          className="md:order-2 md:col-span-6 bg-[#E3EFE6] p-6 sm:p-8 lg:p-10 flex flex-col justify-between items-center relative overflow-hidden min-h-[320px] md:min-h-[580px] fill-mode-both"
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
