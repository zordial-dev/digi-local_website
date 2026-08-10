import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Store, User, Phone, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, KeyRound, Smartphone, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { api } from '../services/api';
import CountryCodePicker from '../components/CountryCodePicker';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../firebase';

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
  
  // Country Code & Dynamic Placeholder State
  const [countryCode, setCountryCode] = useState('+91');
  const [phonePlaceholder, setPhonePlaceholder] = useState('e.g. 98765 43210');
  
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

  // Instant & Reliable Navigation Handler

  // Try Another Method (Password Update Choice) Modal State
  const [showAltModal, setShowAltModal] = useState(false);
  const [altContact, setAltContact] = useState('');
  const [altOtp, setAltOtp] = useState('');
  const [altNewPassword, setAltNewPassword] = useState('');
  const [altConfirmPassword, setAltConfirmPassword] = useState('');
  const [altStep, setAltStep] = useState(3); // 3: Password Update Choice, 4: Enter New Password
  const [altMsg, setAltMsg] = useState('');
  const [altMsgType, setAltMsgType] = useState('info'); // 'info' | 'success' | 'error'

  // Real Dynamic OTP State & 30s Resend Timer (6 Digits for Firebase SMS)
  const [otpBoxes, setOtpBoxes] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

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

  const box0Ref = useRef(null);
  const box1Ref = useRef(null);
  const box2Ref = useRef(null);
  const box3Ref = useRef(null);
  const box4Ref = useRef(null);
  const box5Ref = useRef(null);
  const otpBoxRefs = [box0Ref, box1Ref, box2Ref, box3Ref, box4Ref, box5Ref];

  const handleOtpBoxChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newBoxes = [...otpBoxes];
    newBoxes[index] = digit;
    setOtpBoxes(newBoxes);
    setAltOtp(newBoxes.join(''));

    if (digit && index < 5 && otpBoxRefs[index + 1].current) {
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

  // Instant & Reliable Navigation Handler
  const handleNavigateWithAnimation = (targetPage, options = {}) => {
    setRoute({ page: targetPage, ...options });
  };

  // Central Direct Login Handler
  const performLoginDirectly = async (contactInput, passwordInput = '123456') => {
    setError('');
    setSuccessMsg('');
    const rawContact = (contactInput || (accountType === 'resident' ? userPhone : vendorIdentifier) || altContact).trim();
    const fullPhone = rawContact.startsWith('+') ? rawContact : `${countryCode}${rawContact}`;

    if (accountType === 'resident') {
      if (!rawContact) {
        setError('Please enter your mobile phone number.');
        return;
      }

      try {
        setLoading(true);
        // RESIDENT / USER LOGIN FLOW (Item 2 of Checklist: POST /api/users/login)
        const res = await api.userLogin({ phone: fullPhone, password: passwordInput });

        // ITEM 4 CHECKLIST: STORE BACKEND TOKENS
        const accessToken = res.accessToken || res.data?.accessToken || res.token;
        const refreshToken = res.refreshToken || res.data?.refreshToken;
        const userObj = res.user || res.data?.user || { phone: fullPhone, name: `Resident ${fullPhone.slice(-4)}` };

        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (userObj) localStorage.setItem('user', JSON.stringify(userObj));

        const session = {
          user: userObj,
          token: accessToken || `user_jwt_${Date.now()}`,
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
        const msg = err.message || '';
        if (msg.includes('account does not exist') || msg.includes('Invalid mobile number') || msg.includes('not found')) {
          setError('No account found with this mobile number. Please register your account first.');
          setShowRegisterPrompt(true);
        } else {
          setError(msg || 'Invalid phone number or password. Please try again.');
        }
      } finally {
        setLoading(false);
      }

    } else {

      if (!rawContact) {
        setError('Please enter your vendor email address or phone number.');
        return;
      }

      try {
        setLoading(true);
        // VENDOR LOGIN FLOW
        const res = await api.loginVendor({ email: rawContact, phone: rawContact, password: passwordInput, isOtpLogin: authMethod === 'otp' });

        let vendorObj = res?.vendor;
        try {
          const pool = JSON.parse(localStorage.getItem('digilocal_registered_vendors') || '[]');
          const match = pool.find(v => String(v.phone_number).trim() === rawContact || String(v.email).trim().toLowerCase() === rawContact.toLowerCase());
          if (match) vendorObj = match;
        } catch (_) {}

        if (!vendorObj) {
          vendorObj = {
            vendor_id: 1,
            vendor_name: rawContact.split('@')[0],
            store_name: `${rawContact.split('@')[0]}'s Store`,
            email: rawContact,
            phone_number: rawContact,
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
  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    const rawContact = (accountType === 'resident' ? userPhone : vendorIdentifier).trim();
    const fullPhone = rawContact.startsWith('+') ? rawContact : `${countryCode}${rawContact}`;

    if (authMethod === 'otp') {
      const code = otpBoxes.join('').trim();
      if (code.length < 4) {
        setError('Please enter the OTP security code.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        let firebaseToken = null;
        try {
          const result = await verifyFirebasePhoneOtp(code);
          firebaseToken = result.idToken;
        } catch (fbVerifyErr) {
          console.warn('Firebase OTP verify fallback:', fbVerifyErr);
          await api.verifyOtp(fullPhone, code);
        }

        // Send to Backend: POST /api/users/login with { firebase_token }
        const res = await api.userLogin({
          phone: fullPhone,
          firebase_token: firebaseToken || undefined,
          otp: !firebaseToken ? code : undefined
        });

        // ITEM 4 CHECKLIST: STORE BACKEND TOKENS
        const accessToken = res.accessToken || res.data?.accessToken || res.token;
        const refreshToken = res.refreshToken || res.data?.refreshToken;
        const userObj = res.user || res.data?.user || { phone: fullPhone };

        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (userObj) localStorage.setItem('user', JSON.stringify(userObj));

        const session = {
          user: userObj,
          token: accessToken || `user_jwt_${Date.now()}`,
          expiresAt: Date.now() + 86400000
        };

        localStorage.setItem('digilocal_user_session', JSON.stringify(session));
        localStorage.setItem('digilocal_resident_session', JSON.stringify(userObj));
        if (setActiveUser) setActiveUser(userObj);

        setSuccessMsg('Logged in successfully via OTP!');
        setTimeout(() => setRoute({ page: 'profile' }), 400);
      } catch (err) {
        setError(err.message || 'Invalid OTP code. Please verify and try again.');
      } finally {
        setLoading(false);
      }
    } else {
      performLoginDirectly(rawContact, password);
    }
  };

  // Trigger inline OTP mode when clicking "Try another method" (Firebase SMS)
  const handleSwitchToOtpMethod = async () => {
    const rawContact = (accountType === 'resident' ? userPhone : vendorIdentifier).trim();
    if (!rawContact) {
      setError(accountType === 'resident' ? 'Please enter your mobile phone number first.' : 'Please enter your email or phone number first.');
      return;
    }
    const fullPhone = rawContact.startsWith('+') ? rawContact : `${countryCode}${rawContact}`;
    setError('');
    setLoading(true);
    try {
      if (accountType === 'resident') {
        const checkRes = await api.checkUserPhone(fullPhone);
        if (!checkRes.exists) {
          setError('No account found with this mobile number. Please register your account first.');
          setShowRegisterPrompt(true);
          return;
        }
      }

      try {
        await sendFirebasePhoneOtp(fullPhone, 'recaptcha-container');
        setOtpSentMsg(`Verification code sent to ${fullPhone}.`);
      } catch (fbErr) {
        console.error('Firebase Phone Auth Error:', fbErr);
        throw fbErr;
      }

      setAuthMethod('otp');
      setOtpBoxes(Array(6).fill(''));
      setResendCountdown(30);
    } catch (err) {
      const errMsg = err?.message || String(err || '');
      if (errMsg.includes('TOO_MANY_ATTEMPTS_TRY_LATER') || errMsg.includes('too-many-requests')) {
        setError('Too many verification attempts for this mobile number. Please wait a few minutes before trying again.');
      } else if (errMsg.includes('INVALID_APP_CREDENTIAL') || errMsg.includes('invalid-app-credential')) {
        setError('Security verification check failed. Please refresh the page and try again.');
      } else {
        setError(err.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const rawContact = (accountType === 'resident' ? userPhone : vendorIdentifier).trim();
    if (!rawContact || resendCountdown > 0) return;
    const fullPhone = rawContact.startsWith('+') ? rawContact : `${countryCode}${rawContact}`;
    setError('');
    setLoading(true);
    try {
      if (accountType === 'resident') {
        const checkRes = await api.checkUserPhone(fullPhone);
        if (!checkRes.exists) {
          setError('No account found with this mobile number. Please register your account first.');
          setShowRegisterPrompt(true);
          return;
        }
      }

      try {
        await sendFirebasePhoneOtp(fullPhone, 'recaptcha-container');
        setOtpSentMsg(`Verification code resent to ${fullPhone}.`);
      } catch (fbErr) {
        await api.requestOtp(fullPhone);
        setOtpSentMsg(`Verification code resent to ${fullPhone}.`);
      }
      setResendCountdown(30);
    } catch (err) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
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
      <div id="recaptcha-container"></div>
      
      {/* 50/50 Balanced Bento Card with GSAP Hardware-Accelerated 3D Zoom-Out & Panel Crossover Swap */}
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
          className="md:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-6 relative bg-white"
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
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold space-y-2 shadow-xs">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {showRegisterPrompt && (
                  <button
                    type="button"
                    onClick={() => setRoute({ page: 'register' })}
                    className="mt-1 w-full py-2 bg-[#1E3623] hover:bg-[#152718] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                  >
                    <span>Register New Account Now</span>
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

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
              
              {/* Resident User: Phone Number Field | Vendor: Email / Phone Field */}
              {accountType === 'resident' ? (
                <div>
                  <label className="block text-xs font-bold text-[#1E3623] mb-1.5">
                    Phone Number *
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
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs font-semibold focus:outline-none focus:border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/15 text-ink transition-all shadow-xs"
                      />
                    </div>
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
                      <span className="flex items-center gap-1.5 min-w-0 pr-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{otpSentMsg}</span>
                      </span>
                      <button
                        type="button"
                        disabled={resendCountdown > 0 || loading}
                        onClick={handleResendOtp}
                        className={`text-[10px] font-extrabold underline ml-2 shrink-0 cursor-pointer ${
                          resendCountdown > 0 ? 'text-gray-400 cursor-not-allowed no-underline' : 'text-emerald-900 hover:text-emerald-950'
                        }`}
                      >
                        {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
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
