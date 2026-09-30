import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Store, User, Phone, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, KeyRound, Smartphone, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { api } from '../services/api';
import CountryCodePicker from '../components/CountryCodePicker';
import BlockedAccountModal from '../components/BlockedAccountModal';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../firebase';
import { formatUserFacingError } from '../utils/errorFormatter';
import { useScrollLock } from '../hooks/useScrollLock';
import { useOtpCooldown } from '../hooks/useOtpCooldown';

export default function LoginPage({ currentRoute, setRoute, setActiveVendor, setActiveUser }) {
  const [accountType, setAccountType] = useState(
    currentRoute?.tab === 'vendor' || currentRoute?.accountType === 'vendor' ? 'vendor' : 'resident'
  ); // 'resident' (default user) | 'vendor'
  const [blockedModalInfo, setBlockedModalInfo] = useState(null);

  useEffect(() => {
    if (currentRoute?.tab === 'vendor' || currentRoute?.accountType === 'vendor') {
      setAccountType('vendor');
    } else {
      setAccountType('resident');
    }

    if (currentRoute?.blocked || window.location.search.includes('blocked=true')) {
      setBlockedModalInfo({
        accountType: currentRoute?.accountType || 'resident',
        code: currentRoute?.accountType === 'vendor' ? 'VENDOR_BLOCKED' : 'USER_BLOCKED',
        title: currentRoute?.accountType === 'vendor' ? 'Vendor Account Blocked' : 'Resident Account Blocked',
        error: currentRoute?.error || 'Your account has been blocked by administrator.',
        message: 'Your account has been blocked. Please contact customer support for assistance.',
        blockReason: currentRoute?.blockReason || 'Violation of community rules'
      });
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
  const [showAltNewPassword, setShowAltNewPassword] = useState(false);
  const [showAltConfirmPassword, setShowAltConfirmPassword] = useState(false);
  const [altStep, setAltStep] = useState(3); // 3: Password Update Choice, 4: Enter New Password
  const [altMsg, setAltMsg] = useState('');
  const [altMsgType, setAltMsgType] = useState('info'); // 'info' | 'success' | 'error'

  // Real Dynamic OTP State & Exponential Progressive Resend Cooldown
  const [otpBoxes, setOtpBoxes] = useState(['', '', '', '', '', '']);
  const [verificationId, setVerificationId] = useState('');
  const { cooldown: resendCountdown, canResend, triggerCooldown, resetCooldown } = useOtpCooldown();
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  // Set/Change Password after OTP Login Modal State
  const [showOtpPasswordModal, setShowOtpPasswordModal] = useState(false);
  const [otpUserSessionData, setOtpUserSessionData] = useState(null);
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [showOtpNewPassword, setShowOtpNewPassword] = useState(false);
  const [showOtpConfirmPassword, setShowOtpConfirmPassword] = useState(false);
  const [otpPasswordError, setOtpPasswordError] = useState('');
  const [otpPasswordSuccess, setOtpPasswordSuccess] = useState(false);

  // Lock background scroll when any modal is open
  useScrollLock(Boolean(showAltModal || showOtpPasswordModal || blockedModalInfo));

  const handleSaveOtpPassword = async (e) => {
    if (e) e.preventDefault();
    if (!otpNewPassword) {
      setOtpPasswordError('Please enter a new password.');
      return;
    }
    if (otpNewPassword.length < 6) {
      setOtpPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (otpNewPassword !== otpConfirmPassword) {
      setOtpPasswordError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const isVendor = otpUserSessionData?.accountType === 'vendor' || Boolean(otpUserSessionData?.vendorObj);
      if (isVendor) {
        const targetVendorId = otpUserSessionData?.vendorObj?.vendor_id || otpUserSessionData?.vendorObj?.id;
        await api.updateVendorPassword(targetVendorId, otpNewPassword);
        setOtpPasswordSuccess(true);
        setOtpPasswordError('');

        setTimeout(() => {
          setShowOtpPasswordModal(false);
          setSuccessMsg('Password updated successfully! Redirecting to Vendor Panel...');
          setRoute({ page: 'vendorDashboard', vendorId: targetVendorId });
        }, 1000);
      } else {
        const targetUserId = otpUserSessionData?.userObj?.user_id || otpUserSessionData?.userObj?.id || 'usr_932532';
        await api.updateUserProfile(targetUserId, { password: otpNewPassword });
        setOtpPasswordSuccess(true);
        setOtpPasswordError('');

        setTimeout(() => {
          setShowOtpPasswordModal(false);
          setSuccessMsg('Password set successfully! Redirecting to profile...');
          setRoute({ page: 'profile' });
        }, 1000);
      }
    } catch (err) {
      setOtpPasswordError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipOtpPassword = () => {
    setShowOtpPasswordModal(false);
    const isVendor = otpUserSessionData?.accountType === 'vendor' || Boolean(otpUserSessionData?.vendorObj);
    if (isVendor) {
      const targetVendorId = otpUserSessionData?.vendorObj?.vendor_id || otpUserSessionData?.vendorObj?.id;
      setSuccessMsg('Logged in successfully! Opening Vendor Panel...');
      setRoute({ page: 'vendorDashboard', vendorId: targetVendorId });
    } else {
      setSuccessMsg('Logged in successfully! Redirecting to profile...');
      setRoute({ page: 'profile' });
    }
  };


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
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasteData) {
      const newBoxes = pasteData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
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
        const userObj = res.user || res.data?.user;

        if (!userObj) {
          throw new Error('No account found with this mobile number. Please create an account / register first.');
        }

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

        // SAVE USER SESSIONS (Clear any vendor session to enforce single-role isolation)
        localStorage.removeItem('digilocal_vendor_session');
        localStorage.removeItem('vendor_access_token');
        localStorage.removeItem('vendor_profile');
        if (setActiveVendor) setActiveVendor(null);

        localStorage.setItem('digilocal_user_session', JSON.stringify(session));
        localStorage.setItem('digilocal_resident_session', JSON.stringify(userObj));
        if (setActiveUser) setActiveUser(userObj);

        if (currentRoute?.redirectVendorId) {
          setSuccessMsg(`Logged in successfully! Opening Vendor Storefront...`);
          setTimeout(() => {
            setRoute({ page: 'vendorStorefront', societyId: currentRoute.redirectSocietyId || 1, vendorId: currentRoute.redirectVendorId });
          }, 400);
        } else if (pendingSocietyId) {
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
        if (err.isBlocked || err.code === 'USER_BLOCKED' || err.message?.includes('blocked')) {
          setBlockedModalInfo({
            accountType: 'resident',
            code: err.code || 'USER_BLOCKED',
            title: 'Resident Account Blocked by Admin',
            error: err.message || 'Your resident user account has been blocked by administrator.',
            message: 'Your resident account has been blocked. Access to DigiLocal services is restricted.',
            blockReason: err.blockReason || err.data?.block_reason || 'Violation of community rules'
          });
          return;
        }
        setError(formatUserFacingError(err));
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
          const cleanInputDigits = rawContact.replace(/[^0-9]/g, '').slice(-10);
          const match = pool.find(v => {
            const vPhoneDigits = String(v.phone_number || v.phone || v.mobile || '').replace(/[^0-9]/g, '').slice(-10);
            return (cleanInputDigits && vPhoneDigits === cleanInputDigits) ||
                   String(v.phone_number || '').trim() === rawContact ||
                   String(v.email || '').trim().toLowerCase() === rawContact.toLowerCase();
          });
          if (match) vendorObj = { ...vendorObj, ...match };
        } catch (_) {}

        if (!vendorObj) {
          throw new Error('No registered vendor store found with this phone / email. Please register your vendor store first.');
        }

        const session = {
          vendor: vendorObj,
          token: res?.token || res?.accessToken || `jwt_vendor_${Date.now()}`,
          expiresAt: Date.now() + 86400000
        };

        const pendingSocietyId = currentRoute?.redirectSocietyId || sessionStorage.getItem('digilocal_pending_society_id');
        const pendingSocietyName = sessionStorage.getItem('digilocal_pending_society_name');

        // SAVE VENDOR SESSIONS (Clear any user session to enforce single-role isolation)
        localStorage.removeItem('digilocal_user_session');
        localStorage.removeItem('digilocal_resident_session');
        if (setActiveUser) setActiveUser(null);

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
        if (err.isBlocked || err.code === 'VENDOR_BLOCKED' || err.message?.includes('blocked')) {
          setBlockedModalInfo({
            accountType: 'vendor',
            code: err.code || 'VENDOR_BLOCKED',
            title: 'Vendor Store Account Blocked by Admin',
            error: err.message || 'Your vendor store account has been blocked by administrator.',
            message: 'Your vendor store account has been blocked. Access to DigiLocal services is restricted.',
            blockReason: err.blockReason || err.data?.block_reason || 'Policy violation'
          });
          return;
        }
        setError(formatUserFacingError(err));
      } finally {
        setLoading(false);
      }
    }
  };

  // Main Form Submission
  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    const rawContact = (accountType === 'resident' ? userPhone : vendorIdentifier).trim();
    const isEmail = rawContact.includes('@');
    const fullPhone = isEmail ? rawContact : (rawContact.startsWith('+') ? rawContact : `${countryCode}${rawContact}`);

    if (authMethod === 'otp') {
      const code = otpBoxes.join('').trim();
      if (code.length < 6) {
        setError('Please enter the complete 6-digit OTP security code.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        if (accountType === 'resident') {
          const res = isEmail
            ? await api.verifyEmailOtp({ email: rawContact, otp: code, role: 'user' })
            : await api.verifyMobileOtp({ phone: fullPhone, otp: code, role: 'user', verification_id: verificationId });

          const accessToken = res.accessToken || res.data?.accessToken || res.token;
          const refreshToken = res.refreshToken || res.data?.refreshToken;
          const userObj = res.user || res.data?.user;

          if (!userObj) {
            throw new Error('No account found with this mobile number. Please register your account first.');
          }

          if (accessToken) localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          if (userObj) localStorage.setItem('user', JSON.stringify(userObj));

          const session = {
            user: userObj,
            token: accessToken || `user_jwt_${Date.now()}`,
            expiresAt: Date.now() + 86400000
          };

          // Clear any vendor session to enforce single-role isolation
          localStorage.removeItem('digilocal_vendor_session');
          localStorage.removeItem('vendor_access_token');
          localStorage.removeItem('vendor_profile');
          if (setActiveVendor) setActiveVendor(null);

          localStorage.setItem('digilocal_user_session', JSON.stringify(session));
          localStorage.setItem('digilocal_resident_session', JSON.stringify(userObj));
          if (setActiveUser) setActiveUser(userObj);

          resetCooldown();
          setSuccessMsg('Logged in successfully via OTP!');
          setOtpUserSessionData({ userObj, session });
          setShowOtpPasswordModal(true);
        } else {
          // VENDOR OTP LOGIN FLOW (2.0.0 API Spec: POST /api/otp/mobile/verify-otp or POST /api/otp/email/verify-otp)
          const res = isEmail
            ? await api.verifyEmailOtp({ email: rawContact, otp: code, role: 'vendor' })
            : await api.verifyMobileOtp({ phone: fullPhone, otp: code, role: 'vendor', verification_id: verificationId });

          const accessToken = res.accessToken || res.data?.accessToken || res.token;
          const refreshToken = res.refreshToken || res.data?.refreshToken;
          let vendorObj = res.vendor || res.data?.vendor;
          try {
            const pool = JSON.parse(localStorage.getItem('digilocal_registered_vendors') || '[]');
            const cleanInputDigits = fullPhone.replace(/[^0-9]/g, '').slice(-10);
            const match = pool.find(v => {
              const vDigits = String(v.phone_number || v.phone || v.mobile || '').replace(/[^0-9]/g, '').slice(-10);
              return (cleanInputDigits && vDigits === cleanInputDigits) ||
                     (isEmail && String(v.email || '').trim().toLowerCase() === rawContact.toLowerCase());
            });
            if (match) vendorObj = { ...vendorObj, ...match };
          } catch (_) {}

          if (!vendorObj) {
            throw new Error('No registered vendor store found with this credential. Please register your store first.');
          }

          if (accessToken) {
            localStorage.setItem('vendor_access_token', accessToken);
            localStorage.setItem('accessToken', accessToken);
          }
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          if (vendorObj) localStorage.setItem('vendor_profile', JSON.stringify(vendorObj));

          const session = {
            vendor: vendorObj,
            token: accessToken || `vendor_jwt_${Date.now()}`,
            expiresAt: Date.now() + 86400000
          };

          // Clear any user session to enforce single-role isolation
          localStorage.removeItem('digilocal_user_session');
          localStorage.removeItem('digilocal_resident_session');
          if (setActiveUser) setActiveUser(null);

          localStorage.setItem('digilocal_vendor_session', JSON.stringify(session));
          if (setActiveVendor) setActiveVendor(vendorObj);

          resetCooldown();
          setSuccessMsg(`Logged in successfully as ${vendorObj.store_name || vendorObj.vendor_name || 'Vendor'} via OTP!`);
          setOtpUserSessionData({ vendorObj, session, accountType: 'vendor' });
          setShowOtpPasswordModal(true);
        }
      } catch (err) {
        setError(err.message || 'Invalid OTP code. Please verify and try again.');
      } finally {
        setLoading(false);
      }
    } else {
      performLoginDirectly(rawContact, password);
    }
  };

  // Trigger inline OTP mode when clicking "Try another method" or "Login via OTP Instead"
  const handleSwitchToOtpMethod = async () => {
    const rawContact = (accountType === 'resident' ? userPhone : vendorIdentifier).trim();
    if (!rawContact) {
      setError(accountType === 'resident' ? 'Please enter your mobile phone number first.' : 'Please enter your email or phone number first.');
      return;
    }
    const isEmail = rawContact.includes('@');
    const fullPhone = isEmail ? rawContact : (rawContact.startsWith('+') ? rawContact : `${countryCode}${rawContact}`);
    setError('');
    setLoading(true);
    try {
      // Step 1: Pre-flight check via /api/auth/check-account
      const targetRole = accountType === 'vendor' ? 'vendor' : 'user';
      const checkRes = await api.checkAccount(isEmail ? rawContact : fullPhone, targetRole);
      
      if (!checkRes.exists) {
        setError(accountType === 'vendor' 
          ? 'No vendor store account found with this credential. Please register your store first.' 
          : 'No resident user account found with this number. Please register your account first.');
        setShowRegisterPrompt(true);
        return;
      }

      // Step 2: Send OTP
      let cooldownSec = 10;
      if (isEmail) {
        const res = await api.sendEmailOtp({ email: rawContact, role: targetRole, purpose: 'login' });
        setOtpSentMsg(res?.message || `Verification OTP sent to ${rawContact}.`);
        cooldownSec = 10;
      } else {
        const res = await api.sendMobileOtp({ phone: fullPhone, role: targetRole, purpose: 'login' });
        if (res?.verification_id || res?.verificationId) {
          setVerificationId(res.verification_id || res.verificationId);
        }
        cooldownSec = res.cooldown_seconds || 10;
        setOtpSentMsg(res?.message || `Verification SMS sent to ${fullPhone}! Check your mobile phone.`);
      }

      setAuthMethod('otp');
      setOtpBoxes(Array(6).fill(''));
      triggerCooldown(cooldownSec);
    } catch (err) {
      if (err?.status === 429 || err?.isCooldown) {
        const waitSec = err.retry_after || err.cooldown_seconds || 10;
        triggerCooldown(waitSec);
        setError(err.message || `Please wait ${waitSec} seconds before requesting a new OTP.`);
        setAuthMethod('otp');
        return;
      }

      const isSmsCreditErr = err?.status === 503 || err?.error_code === 'SMS_CREDITS_EXHAUSTED' || err?.data?.error_code === 'SMS_CREDITS_EXHAUSTED';
      const isSmsGatewayErr = err?.status === 502 || err?.error_code === 'SMS_GATEWAY_ERROR' || err?.data?.error_code === 'SMS_GATEWAY_ERROR';

      if (isSmsCreditErr) {
        setError('SMS service is temporarily unavailable due to gateway limits. Please log in using Email OTP or contact support.');
      } else if (isSmsGatewayErr) {
        setError('SMS service is temporarily unavailable. Please try again or use Email OTP.');
      } else {
        setError(err.message || 'Failed to initiate OTP login.');
      }
      setAuthMethod('password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const rawContact = (accountType === 'resident' ? userPhone : vendorIdentifier).trim();
    if (!rawContact || !canResend || resendCountdown > 0) return;
    const isEmail = rawContact.includes('@');
    const fullPhone = isEmail ? rawContact : (rawContact.startsWith('+') ? rawContact : `${countryCode}${rawContact}`);
    const targetRole = accountType === 'vendor' ? 'vendor' : 'user';
    setError('');
    setLoading(true);
    try {
      let cooldownSec = 10;
      if (isEmail) {
        const res = await api.sendEmailOtp({ email: rawContact, role: targetRole, purpose: 'login' });
        setOtpSentMsg(res?.message || `Verification OTP resent to ${rawContact}.`);
        cooldownSec = 10;
      } else {
        const res = await api.sendMobileOtp({ phone: fullPhone, role: targetRole, purpose: 'login' });
        if (res?.verification_id || res?.verificationId) {
          setVerificationId(res.verification_id || res.verificationId);
        }
        cooldownSec = res.cooldown_seconds || 10;
        setOtpSentMsg(res?.message || `Verification SMS resent to ${fullPhone}. Next resend available in ${cooldownSec}s.`);
      }
      triggerCooldown(cooldownSec);
    } catch (err) {
      if (err?.status === 429 || err?.isCooldown) {
        const waitSec = err.retry_after || err.cooldown_seconds || 10;
        triggerCooldown(waitSec);
        setError(err.message || `Please wait ${waitSec} seconds before resending OTP.`);
        return;
      }

      const isSmsCreditErr = err?.status === 503 || err?.error_code === 'SMS_CREDITS_EXHAUSTED' || err?.data?.error_code === 'SMS_CREDITS_EXHAUSTED';
      const isSmsGatewayErr = err?.status === 502 || err?.error_code === 'SMS_GATEWAY_ERROR' || err?.data?.error_code === 'SMS_GATEWAY_ERROR';

      if (isSmsCreditErr) {
        setError('SMS service is temporarily unavailable due to gateway limits. Please use Email OTP.');
      } else if (isSmsGatewayErr) {
        setError('SMS service is temporarily unavailable. Please try again or use Email OTP.');
      } else {
        setError(err.message || 'Failed to resend verification code.');
      }
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
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#FAF8F5] flex flex-col justify-start md:justify-center items-center p-3.5 sm:p-6 lg:p-8 py-5 sm:py-8 font-sans text-[#211A19] overflow-y-auto">
      <div id="recaptcha-container"></div>
      
      {/* 50/50 Balanced Bento Card with GSAP Hardware-Accelerated 3D Zoom-Out & Panel Crossover Swap */}
      <div 
        ref={cardRef}
        className="max-w-4xl lg:max-w-5xl w-full bg-white rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl border border-stone-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative my-auto min-h-0 md:min-h-[560px] lg:min-h-[600px] mx-auto shrink-0"
      >

        {/* LEFT COLUMN: Clean Branded Panel (50% equal width, md:col-span-6) */}
        <div 
          ref={leftPanelRef}
          className="hidden md:flex md:col-span-6 bg-[#FAF8F5] md:border-r border-border/50 p-6 sm:p-8 lg:p-10 flex-col justify-between items-center relative overflow-hidden min-h-[560px]"
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
              className="px-3.5 py-2 rounded-full bg-white hover:bg-gray-50 text-[#211A19] text-xs font-bold flex items-center space-x-1.5 border border-[#C8A878]/30 shadow-xs transition-all group shrink-0 cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#541D26] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            <div
              onClick={() => setRoute({ page: 'home' })}
              className="flex items-center space-x-2 cursor-pointer group transition-all"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#541D26]/10 border border-[#541D26]/20 flex items-center justify-center p-1 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                <img src="/logo.png" alt="DigiLocal" className="w-full h-full object-contain scale-[1.8] mix-blend-multiply" />
              </div>
              <span className="font-cormorant italic text-base sm:text-lg font-bold text-[#541D26]">DigiLocal</span>
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
            <p className="text-[11px] text-[#211A19]/70 font-medium">
              Connecting gated societies with trusted local vendors.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Login Form (50% equal width, md:col-span-6) */}
        <div 
          ref={rightPanelRef}
          className="md:col-span-6 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center space-y-4 sm:space-y-5 relative bg-white"
        >
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

          <div className="space-y-4 sm:space-y-5">

            {/* Header */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-extrabold text-[#211A19]">
                {accountType === 'resident' ? 'Welcome Back!' : 'Vendor Portal Login'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                {accountType === 'resident' 
                  ? 'Login to view your profile, order history, and saved societies.'
                  : 'Login to manage your vendor store catalog, inventory, and incoming orders.'}
              </p>
            </div>

            {/* Notifications */}
            {error && (
              <div className="p-3 sm:p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl sm:rounded-2xl text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center space-x-2 min-w-0">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  {(error.toLowerCase().includes('register') || error.toLowerCase().includes('create') || error.toLowerCase().includes('no account') || error.toLowerCase().includes('not found') || showRegisterPrompt) ? (
                    <button
                      type="button"
                      onClick={() => setRoute({ page: accountType === 'resident' ? 'register' : 'vendorRegister' })}
                      className="px-3 py-1.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white text-[11px] font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs border border-[#C8A878]/30"
                    >
                      <span>{accountType === 'resident' ? 'Create Account' : 'Register Store'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C8A878]" />
                    </button>
                  ) : error.toLowerCase().includes('password') && authMethod === 'password' ? (
                    <button
                      type="button"
                      onClick={handleSwitchToOtpMethod}
                      className="px-3 py-1.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white text-[11px] font-extrabold transition-all cursor-pointer shadow-xs border border-[#C8A878]/30"
                    >
                      Login via OTP Instead →
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-3 sm:p-3.5 bg-[#EEE5DA] border border-[#C8A878]/40 text-[#541D26] rounded-xl sm:rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#541D26]" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5 sm:space-y-4 font-sans">
              
              {/* Resident User: Phone Number Field | Vendor: Email / Phone Field */}
              {accountType === 'resident' ? (
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">
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
                    <div className="relative flex-1 min-w-0">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        required
                        placeholder={phonePlaceholder}
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/15 text-ink transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">
                    Email Address or Phone Number *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. vendor@digilocal.com or 9876543210"
                      value={vendorIdentifier}
                      onChange={(e) => setVendorIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/15 text-ink transition-all shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELD: PASSWORD (Default) vs INLINE 4-BLOCK OTP (when Try Another Method is clicked) */}
              {authMethod === 'password' ? (
                /* 1. PASSWORD FIELD */
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FAF9F6] border border-border/80 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/15 text-ink transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-ink transition-colors cursor-pointer z-10"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Try another method link */}
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={handleSwitchToOtpMethod}
                      className="text-xs font-bold text-[#541D26] hover:text-[#6B2732] hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#C8A878]" />
                      <span>Try another method</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* 2. INLINE 6-BLOCK OTP FIELD */
                <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#211A19]">
                      6-Digit Verification Code *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('password');
                        setOtpSentMsg('');
                      }}
                      className="text-[11px] font-bold text-[#541D26] hover:text-[#6B2732] underline cursor-pointer"
                    >
                      Use Password Instead
                    </button>
                  </div>

                  {/* 6 Rounded Input Block Boxes */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 my-1">
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
                        className="w-10 h-11 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-[#FAF9F6] border border-border/80 focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/15 text-[#211A19] shadow-xs transition-all outline-none"
                      />
                    ))}
                  </div>

                  {otpSentMsg && (
                    <div className="p-2.5 sm:p-3 bg-[#EEE5DA] border border-[#C8A878]/40 text-[#541D26] rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
                      <span className="flex items-center gap-1.5 min-w-0 pr-2">
                        <CheckCircle2 className="w-4 h-4 text-[#541D26] shrink-0" />
                        <span className="truncate">{otpSentMsg}</span>
                      </span>
                      <button
                        type="button"
                        disabled={resendCountdown > 0 || loading}
                        onClick={handleResendOtp}
                        className={`text-[10px] font-extrabold underline ml-2 shrink-0 cursor-pointer ${
                          resendCountdown > 0 ? 'text-gray-400 cursor-not-allowed no-underline' : 'text-[#541D26] hover:text-[#6B2732]'
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
                className="w-full py-3 sm:py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 mt-3 cursor-pointer border border-[#C8A878]/30 min-h-[44px]"
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
                <ArrowRight className="w-4 h-4 text-[#C8A878]" />
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-xs font-medium text-muted-foreground pt-1">
              <span>Don’t have an account? </span>
              <button
                type="button"
                onClick={() => handleNavigateWithAnimation(accountType === 'resident' ? 'register' : 'vendorRegister')}
                className="font-bold text-[#541D26] hover:text-[#6B2732] underline transition-colors cursor-pointer"
              >
                {accountType === 'resident' ? 'Create Account' : 'Register Store as Vendor'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-OTP Verification Password Update Choice Modal */}
      {showAltModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto font-sans"
          onClick={() => setShowAltModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-border space-y-5 relative my-auto shrink-0 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAltModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-secondary hover:bg-border text-ink flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div>
              <span className="px-3 py-1 bg-[#541D26]/10 text-[#541D26] text-[10px] font-black uppercase tracking-wider rounded-full border border-[#541D26]/20">
                OTP Verified
              </span>
              <h3 className="text-xl font-serif font-bold text-[#211A19] mt-2">
                {altStep === 3 && 'Update Account Password?'}
                {altStep === 4 && 'Set New Password'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">
                {altStep === 3 && 'Your 6-digit mobile OTP has been successfully verified! Would you like to update your account password before continuing?'}
                {altStep === 4 && 'Enter your new password below to update your login credentials.'}
              </p>
            </div>

            {/* Alert Message */}
            {altMsg && (
              <div className={`p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
                altMsgType === 'error' 
                  ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                  : 'bg-[#EEE5DA] border border-[#C8A878]/40 text-[#541D26]'
              }`}>
                {altMsgType === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-[#541D26]" />}
                <span>{altMsg}</span>
              </div>
            )}

            {/* STEP 3: Choice - Update Password or Skip */}
            {altStep === 3 && (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendPasswordResetOTP}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-between cursor-pointer group border border-[#C8A878]/30"
                >
                  <span className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-[#C8A878] group-hover:rotate-12 transition-transform" />
                    <span>Send Verification Code</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#C8A878] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCompleteDirectLogin()}
                  className="w-full py-3 px-4 rounded-2xl bg-[#EEE5DA] hover:bg-[#D6B7A5] text-[#211A19] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>No, Skip & Log In Now</span>
                  <ArrowRight className="w-4 h-4 text-[#211A19]" />
                </button>
              </div>
            )}

            {/* STEP 4: Enter New Password */}
            {altStep === 4 && (
              <form onSubmit={handleSaveNewPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showAltNewPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={altNewPassword}
                      onChange={(e) => setAltNewPassword(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#FAF9F6] border border-border text-xs font-semibold focus:outline-none focus:border-[#541D26] text-ink"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAltNewPassword(!showAltNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors p-1"
                    >
                      {showAltNewPassword ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">Confirm New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showAltConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={altConfirmPassword}
                      onChange={(e) => setAltConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#FAF9F6] border border-border text-xs font-semibold focus:outline-none focus:border-[#541D26] text-ink"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAltConfirmPassword(!showAltConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors p-1"
                    >
                      {showAltConfirmPassword ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4" />}
                    </button>
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
                    className="flex-1 py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 border border-[#C8A878]/30"
                  >
                    <span>{loading ? 'Saving...' : 'Save Password & Log In'}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#C8A878]" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: POST-OTP LOGIN SET PASSWORD OR SKIP POPUP             */}
      {/* ------------------------------------------------------------- */}
      {showOtpPasswordModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto font-sans"
          onClick={() => setShowOtpPasswordModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border space-y-6 text-center my-auto shrink-0 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-[#EEE5DA] border border-[#C8A878]/40 flex items-center justify-center mx-auto text-[#541D26]">
              <KeyRound className="w-8 h-8 text-[#541D26]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">
                {otpUserSessionData?.accountType === 'vendor' || Boolean(otpUserSessionData?.vendorObj) 
                  ? 'Set / Update Store Password' 
                  : 'Set Account Password?'}
              </h3>
              <p className="text-xs text-muted-foreground mt-2">
                {otpUserSessionData?.accountType === 'vendor' || Boolean(otpUserSessionData?.vendorObj)
                  ? 'You logged in successfully via OTP. Set or update your password now so you can log in to your store panel next time with your password.'
                  : 'You logged in successfully via OTP. Would you like to set a password now so you can login faster next time?'}
              </p>
            </div>

            {otpPasswordSuccess ? (
              <div className="p-3.5 bg-[#EEE5DA] border border-[#C8A878]/40 rounded-2xl text-xs font-bold text-[#541D26] flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#541D26]" />
                <span>
                  {otpUserSessionData?.accountType === 'vendor' || Boolean(otpUserSessionData?.vendorObj)
                    ? 'Password saved successfully! Opening Vendor Dashboard...'
                    : 'Password set successfully! Opening your profile...'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSaveOtpPassword} className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showOtpNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password (min 6 chars)"
                      value={otpNewPassword}
                      onChange={(e) => setOtpNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-secondary/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-[#541D26]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOtpNewPassword(!showOtpNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors p-1"
                    >
                      {showOtpNewPassword ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showOtpConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={otpConfirmPassword}
                      onChange={(e) => setOtpConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-secondary/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-[#541D26]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOtpConfirmPassword(!showOtpConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors p-1"
                    >
                      {showOtpConfirmPassword ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {otpPasswordError && (
                  <p className="text-xs text-red-600 font-semibold">{otpPasswordError}</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSkipOtpPassword}
                    className="flex-1 py-3 px-4 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-ink hover:bg-secondary/60 transition-all cursor-pointer"
                  >
                    Skip for Now
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#541D26] text-white text-xs font-bold shadow-md hover:bg-[#6B2732] transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#C8A878]/30"
                  >
                    <span>Save Password</span>
                    <ArrowRight className="w-4 h-4 text-[#C8A878]" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Blocked Account Alert Modal */}
      <BlockedAccountModal
        isOpen={Boolean(blockedModalInfo)}
        onClose={() => setBlockedModalInfo(null)}
        onOpenSupport={() => {
          setBlockedModalInfo(null);
          setRoute({ page: 'info', tab: 'help-support' });
        }}
        blockInfo={blockedModalInfo}
      />
    </div>
  );
}
