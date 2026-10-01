import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Store, 
  User, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Sparkles,
  Key,
  ShieldCheck,
  RotateCcw,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../../services/api';
import { useOtpCooldown } from '../../hooks/useOtpCooldown';

export default function LoginModal({ isOpen, onClose, setRoute, setActiveVendor, setActiveUser }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  const [loginType, setLoginType] = useState('resident'); // 'resident' (default) | 'vendor'
  const [step, setStep] = useState(1); // For resident OTP login
  
  // Vendor Login State (Email & Password)
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [showVendorPassword, setShowVendorPassword] = useState(false);

  // Resident Details State
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [flatAddress, setFlatAddress] = useState('');

  // OTP State for Resident with Exponential Progressive Cooldown
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const { cooldown: resendCountdown, canResend, triggerCooldown, resetCooldown } = useOtpCooldown();

  if (!isOpen) return null;

  // 1. Vendor Email & Password Login Handler
  const handleVendorEmailLogin = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!vendorEmail.trim()) {
      setOtpError('Please enter your registered vendor email address.');
      return;
    }
    if (!vendorPassword || vendorPassword.length < 4) {
      setOtpError('Please enter your account password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.loginVendor({ 
        email: vendorEmail.trim(), 
        password: vendorPassword 
      });

      const vendorObj = res?.vendor;
      if (!vendorObj) {
        throw new Error('No registered vendor store found. Please verify your credentials.');
      }

      const session = {
        vendor: vendorObj,
        token: res.token || res.accessToken || res.jwt || '',
        expiresAt: Date.now() + 86400000
      };

      // Clear any resident user session to enforce single-role isolation
      localStorage.removeItem('digilocal_user_session');
      localStorage.removeItem('digilocal_resident_session');
      if (typeof setActiveUser === 'function') setActiveUser(null);

      localStorage.setItem('digilocal_vendor_session', JSON.stringify(session));
      if (setActiveVendor) setActiveVendor(vendorObj);

      handleResetModal();
      onClose();
      setRoute({ page: 'vendorDashboard', vendorId: vendorObj.vendor_id });
    } catch (err) {
      setOtpError(err.message || 'Invalid email address or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Step 1: Send Resident OTP (Pre-flight existence check first)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    
    if (!userPhone || userPhone.replace(/[^0-9]/g, '').length < 10) {
      setOtpError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    const cleanPhone = userPhone.replace(/[^0-9]/g, '').slice(-10);

    try {
      setLoading(true);
      // Pre-flight check via /api/auth/check-account
      const checkRes = await api.checkAccount(cleanPhone, 'user');
      if (!checkRes.exists) {
        setOtpError('No resident account found with this mobile number. Please register your account first.');
        return;
      }

      const res = await api.sendMobileOtp({ phone: cleanPhone, role: 'user', purpose: 'login' });
      if (res?.verification_id || res?.verificationId) {
        setVerificationId(res.verification_id || res.verificationId);
      }
      const cooldownSec = res.cooldown_seconds || 10;
      triggerCooldown(cooldownSec);
      setOtpInput('');
      setStep(2);
      setInfoMsg(res?.message || `Verification OTP sent to +91 ${cleanPhone}`);
    } catch (err) {
      if (err?.status === 429 || err?.isCooldown) {
        const waitSec = err.retry_after || err.cooldown_seconds || 10;
        triggerCooldown(waitSec);
        setOtpError(err.message || `Please wait ${waitSec} seconds before requesting a new OTP.`);
        return;
      }

      const isSmsCreditErr = err?.status === 503 || err?.error_code === 'SMS_CREDITS_EXHAUSTED' || err?.data?.error_code === 'SMS_CREDITS_EXHAUSTED';
      const isSmsGatewayErr = err?.status === 502 || err?.error_code === 'SMS_GATEWAY_ERROR' || err?.data?.error_code === 'SMS_GATEWAY_ERROR';

      if (isSmsCreditErr) {
        setOtpError('SMS service is temporarily unavailable due to gateway limits. Please use Email OTP or contact support.');
      } else if (isSmsGatewayErr) {
        setOtpError('SMS service is temporarily unavailable. Please try again or use Email OTP.');
      } else {
        setOtpError(err.message || 'Failed to send verification OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Resident OTP & Log In -> Navigates to User Profile Page with REAL backend profile!
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');

    const enteredOtp = otpInput.trim();
    if (!enteredOtp || enteredOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    const cleanPhone = userPhone.replace(/[^0-9]/g, '').slice(-10);

    try {
      setLoading(true);
      const res = await api.verifyMobileOtp({
        phone: cleanPhone,
        otp: enteredOtp,
        role: 'user',
        verification_id: verificationId
      });

      const userObj = res.user || res.data?.user;
      if (!userObj) {
        throw new Error('No registered resident account found. Please register first.');
      }

      const accessToken = res.accessToken || res.data?.accessToken || res.token || `jwt_user_${Date.now()}`;
      const refreshToken = res.refreshToken || res.data?.refreshToken;

      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (userObj) localStorage.setItem('user', JSON.stringify(userObj));

      const session = {
        user: userObj,
        token: accessToken,
        expiresAt: Date.now() + 86400000
      };

      // Clear any vendor session to enforce single-role isolation
      localStorage.removeItem('digilocal_vendor_session');
      localStorage.removeItem('vendor_access_token');
      localStorage.removeItem('vendor_profile');
      if (typeof setActiveVendor === 'function') setActiveVendor(null);

      localStorage.setItem('digilocal_user_session', JSON.stringify(session));
      localStorage.setItem('digilocal_resident_session', JSON.stringify(userObj));
      if (setActiveUser) setActiveUser(userObj);

      resetCooldown();
      handleResetModal();
      onClose();
      setRoute({ page: 'profile' });
    } catch (err) {
      setOtpError(err.message || 'Login failed. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetModal = () => {
    setStep(1);
    setOtpError('');
    setInfoMsg('');
  };

  const handleResendOtp = async () => {
    if (!canResend || resendCountdown > 0) return;
    const cleanPhone = userPhone.replace(/[^0-9]/g, '').slice(-10);
    try {
      setLoading(true);
      const res = await api.sendMobileOtp({ phone: cleanPhone, role: 'user', purpose: 'login' });
      if (res?.verification_id || res?.verificationId) {
        setVerificationId(res.verification_id || res.verificationId);
      }
      const cooldownSec = res.cooldown_seconds || 10;
      triggerCooldown(cooldownSec);
      setOtpInput('');
      setInfoMsg(`Verification OTP resent to +91 ${cleanPhone}. Next resend in ${cooldownSec}s.`);
    } catch (err) {
      if (err?.status === 429 || err?.isCooldown) {
        const waitSec = err.retry_after || err.cooldown_seconds || 10;
        triggerCooldown(waitSec);
        setOtpError(err.message || `Please wait ${waitSec} seconds before resending OTP.`);
        return;
      }

      const isSmsCreditErr = err?.status === 503 || err?.error_code === 'SMS_CREDITS_EXHAUSTED' || err?.data?.error_code === 'SMS_CREDITS_EXHAUSTED';
      const isSmsGatewayErr = err?.status === 502 || err?.error_code === 'SMS_GATEWAY_ERROR' || err?.data?.error_code === 'SMS_GATEWAY_ERROR';

      if (isSmsCreditErr) {
        setOtpError('SMS service is temporarily unavailable due to gateway limits. Please use Email OTP.');
      } else if (isSmsGatewayErr) {
        setOtpError('SMS service is temporarily unavailable. Please try again or use Email OTP.');
      } else {
        setOtpError(err.message || 'Failed to resend OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md font-sans animate-in fade-in duration-200"
      onClick={() => { handleResetModal(); onClose(); }}
    >
      <div 
        className="bg-card border border-border rounded-[2rem] max-w-md w-full max-h-[90vh] shadow-2xl overflow-hidden relative text-foreground flex flex-col animate-in zoom-in-95 duration-200 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-[#211A19] text-[#F6F0E8] px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-[#C8A878]/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 flex items-center justify-center border border-[#C8A878]/30">
              <img src="/logo.png" alt="DigiLocal Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-black uppercase tracking-wider text-white">
                Digi<span className="text-[#C8A878]">Local</span> Access Portal
              </h3>
              <p className="text-[11px] text-[#D6B7A5] font-medium">
                {loginType === 'vendor' ? 'Vendor Email & Password Authentication' : step === 1 ? 'Enter your details & phone number' : 'Verify Mobile OTP'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => { handleResetModal(); onClose(); }} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          
          {/* Role Selector Tabs */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#EEE5DA] rounded-2xl border border-[#C8A878]/30">
              <button
                type="button"
                onClick={() => { setLoginType('resident'); setOtpError(''); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  loginType === 'resident'
                    ? 'bg-[#541D26] text-white shadow-sm'
                    : 'text-[#211A19]/70 hover:text-[#211A19]'
                }`}
              >
                <User className="w-4 h-4 text-[#C8A878]" />
                <span>Resident Login</span>
              </button>

              <button
                type="button"
                onClick={() => { setLoginType('vendor'); setOtpError(''); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  loginType === 'vendor'
                    ? 'bg-[#541D26] text-white shadow-sm'
                    : 'text-[#211A19]/70 hover:text-[#211A19]'
                }`}
              >
                <Store className="w-4 h-4 text-[#C8A878]" />
                <span>Vendor Login</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {otpError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center space-x-2 min-w-0">
                <span>⚠️</span>
                <span>{otpError}</span>
              </div>
              {(otpError.toLowerCase().includes('register') || otpError.toLowerCase().includes('create') || otpError.toLowerCase().includes('no account') || otpError.toLowerCase().includes('not found')) && (
                <button
                  type="button"
                  onClick={() => {
                    handleResetModal();
                    onClose();
                    setRoute({ page: loginType === 'resident' ? 'register' : 'vendorRegister' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white text-[11px] font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs border border-[#C8A878]/30 shrink-0 self-start sm:self-center"
                >
                  <span>{loginType === 'resident' ? 'Create Account' : 'Register Store'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C8A878]" />
                </button>
              )}
            </div>
          )}

          {/* VENDOR LOGIN FORM (EMAIL & PASSWORD) */}
          {loginType === 'vendor' && (
            <form onSubmit={handleVendorEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-[#211A19] uppercase tracking-wider mb-1.5">
                  Vendor Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#541D26]" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. freshmart@gmail.com"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-[#541D26] text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#211A19] uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#541D26]" />
                  <input
                    type={showVendorPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={vendorPassword}
                    onChange={(e) => setVendorPassword(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-[#541D26] text-ink"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showVendorPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowVendorPassword(!showVendorPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors p-1 cursor-pointer z-10"
                  >
                    {showVendorPassword ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all duration-200 flex items-center justify-center space-x-2 mt-2 cursor-pointer border border-[#C8A878]/30"
              >
                <span>{loading ? 'Logging in...' : 'Log In to Vendor Portal'}</span>
                <ArrowRight className="w-4 h-4 text-[#C8A878]" />
              </button>
            </form>
          )}

          {/* RESIDENT LOGIN STEP 1: NAME & PHONE FORM */}
          {loginType === 'resident' && step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-[#211A19] uppercase tracking-wider mb-1.5">
                  User Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#541D26]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-[#541D26] text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#211A19] uppercase tracking-wider mb-1.5">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#541D26]" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-[#541D26] text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#211A19] uppercase tracking-wider mb-1.5">
                  Flat & Tower Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tower B, Flat 402"
                  value={flatAddress}
                  onChange={(e) => setFlatAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-[#541D26] text-ink"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all duration-200 flex items-center justify-center space-x-2 mt-2 cursor-pointer border border-[#C8A878]/30"
              >
                <span>Get OTP Code</span>
                <ArrowRight className="w-4 h-4 text-[#C8A878]" />
              </button>
            </form>
          )}

          {/* STEP 2: DUMMY OTP VERIFICATION FORM */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              
              {/* Sent Notification Info */}
              <div className="p-3.5 bg-[#EEE5DA] border border-[#C8A878]/40 text-[#541D26] rounded-2xl text-xs space-y-1">
                <div className="font-extrabold flex items-center justify-between">
                  <span>📱 Verification OTP Sent</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[10px] text-[#541D26] font-bold underline hover:text-[#6B2732] cursor-pointer"
                  >
                    Edit Phone
                  </button>
                </div>
                <p className="text-[11px]">Sent to: <strong>+91 {userPhone}</strong> ({userName})</p>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#211A19] uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Security OTP *
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#541D26]" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-center text-lg font-mono font-bold rounded-2xl bg-background border-2 border-[#541D26] text-ink focus:outline-none focus:ring-4 focus:ring-[#541D26]/20 tracking-widest"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  disabled={!canResend || resendCountdown > 0 || loading}
                  onClick={handleResendOtp}
                  className={`font-bold flex items-center gap-1 transition-colors ${
                    resendCountdown > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-[#541D26] hover:text-[#6B2732] cursor-pointer'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP Code'}</span>
                </button>
                {resendCountdown > 0 && (
                  <span className="text-muted-foreground text-[11px] font-medium">Wait {resendCountdown}s</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer border border-[#C8A878]/30"
              >
                <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Open Profile'}</span>
                <ArrowRight className="w-4 h-4 text-[#C8A878]" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
