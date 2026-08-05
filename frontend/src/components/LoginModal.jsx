import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { api } from '../services/api';

export default function LoginModal({ isOpen, onClose, setRoute, setActiveVendor, setActiveUser }) {
  const [loginType, setLoginType] = useState('resident'); // 'resident' (default) | 'vendor'
  const [step, setStep] = useState(1); // For resident OTP login
  
  // Vendor Login State (Email & Password)
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');

  // Resident Details State
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('9876543210');
  const [flatAddress, setFlatAddress] = useState('');

  // OTP State for Resident
  const [otpInput, setOtpInput] = useState('1234');
  const [generatedOtp, setGeneratedOtp] = useState('1234');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

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

      const vendorObj = res.vendor || {
        vendor_id: 1,
        vendor_name: vendorEmail.split('@')[0],
        store_name: `${vendorEmail.split('@')[0]}'s Store`,
        email: vendorEmail.trim(),
        status: 'ACTIVE'
      };

      const session = {
        vendor: vendorObj,
        token: res.token || res.accessToken || `mock_jwt_${Date.now()}`,
        expiresAt: Date.now() + 86400000
      };

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

  // 2. Step 1: Send Resident OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    setOtpError('');
    
    if (!userName.trim()) {
      setOtpError('Please enter your Full Name.');
      return;
    }
    if (!userPhone || userPhone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpInput(code);
    setStep(2);
    setInfoMsg(`Demo OTP code ${code} sent to +91 ${userPhone}`);
  };

  // Step 2: Verify Resident OTP & Log In -> Navigates to User Profile Page!
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (otpInput.trim() !== generatedOtp) {
      setOtpError('Invalid OTP code. Please enter the correct 4-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const residentSession = {
        user_id: `usr_${Date.now()}`,
        name: userName.trim(),
        email: `${userName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        phone: userPhone,
        flat: flatAddress || 'Tower A-402',
        society_name: 'Omaxe Greenwood Residency',
        society_id: 'SOC-101',
        joined_date: 'August 2026',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      };
      
      const session = {
        user: residentSession,
        token: `user_token_${Date.now()}`,
        expiresAt: Date.now() + 86400000
      };

      localStorage.setItem('digilocal_user_session', JSON.stringify(session));
      localStorage.setItem('digilocal_resident_session', JSON.stringify(residentSession));
      if (setActiveUser) setActiveUser(residentSession);

      handleResetModal();
      onClose();
      setRoute({ page: 'profile' });
    } catch (err) {
      setOtpError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetModal = () => {
    setStep(1);
    setOtpError('');
    setInfoMsg('');
  };

  const handleResendOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpInput(code);
    setInfoMsg(`New Demo OTP code ${code} resent to +91 ${userPhone}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden relative text-foreground">
        
        {/* Header */}
        <div className="bg-[#18281F] text-[#F7F4EE] px-6 py-5 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 flex items-center justify-center border border-white/15">
              <img src="/logo.png" alt="DigiLocal Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-black uppercase tracking-wider text-white">
                DigiLocal Access Portal
              </h3>
              <p className="text-[11px] text-emerald-200/80 font-medium">
                {loginType === 'vendor' ? 'Vendor Email & Password Authentication' : step === 1 ? 'Enter your details & phone number' : 'Verify Mobile OTP'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => { handleResetModal(); onClose(); }} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Role Selector Tabs */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/80 rounded-2xl border border-border">
              <button
                type="button"
                onClick={() => { setLoginType('resident'); setOtpError(''); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  loginType === 'resident'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-ink'
                }`}
              >
                <User className="w-4 h-4 text-gold" />
                <span>Resident Login</span>
              </button>

              <button
                type="button"
                onClick={() => { setLoginType('vendor'); setOtpError(''); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  loginType === 'vendor'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-ink'
                }`}
              >
                <Store className="w-4 h-4 text-gold" />
                <span>Vendor Login</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {otpError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <span>⚠️</span>
              <span>{otpError}</span>
            </div>
          )}

          {/* VENDOR LOGIN FORM (EMAIL & PASSWORD) */}
          {loginType === 'vendor' && (
            <form onSubmit={handleVendorEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5">
                  Vendor Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. freshmart@gmail.com"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={vendorPassword}
                    onChange={(e) => setVendorPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs uppercase tracking-wider shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 mt-2"
              >
                <span>{loading ? 'Logging in...' : 'Log In to Vendor Portal'}</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </button>
            </form>
          )}

          {/* RESIDENT LOGIN STEP 1: NAME & PHONE FORM */}
          {loginType === 'resident' && step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5">
                  User Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5">
                  Flat & Tower Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tower B, Flat 402"
                  value={flatAddress}
                  onChange={(e) => setFlatAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs uppercase tracking-wider shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 mt-2"
              >
                <span>Get OTP Code</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </button>
            </form>
          )}

          {/* STEP 2: DUMMY OTP VERIFICATION FORM */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              
              {/* Sent Notification Info */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-1">
                <div className="font-extrabold flex items-center justify-between">
                  <span>📱 Verification OTP Sent</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[10px] text-primary underline hover:text-ink"
                  >
                    Edit Phone
                  </button>
                </div>
                <p className="text-[11px]">Sent to: <strong>+91 {userPhone}</strong> ({userName})</p>
              </div>

              {/* Demo OTP Banner Card */}
              <div className="p-4 bg-[#18281F] text-white rounded-2xl border border-gold/40 flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#C4A066]">
                    Demo OTP Verification Code
                  </span>
                  <div className="text-2xl font-mono font-black text-white tracking-widest mt-0.5">
                    {generatedOtp}
                  </div>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-emerald-300 border border-white/15 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-gold" /> Auto-Filled
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5">
                  Enter 4-Digit Security OTP *
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="Enter 4-digit code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-center text-lg font-mono font-bold rounded-2xl bg-background border-2 border-primary text-ink focus:outline-none focus:ring-4 focus:ring-primary/20 tracking-widest"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-primary hover:text-ink font-bold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resend OTP Code</span>
                </button>
                <span className="text-muted-foreground text-[11px]">Resend in 30s</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs uppercase tracking-wider shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Open Profile'}</span>
                <CheckCircle2 className="w-4.5 h-4.5 text-gold" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
