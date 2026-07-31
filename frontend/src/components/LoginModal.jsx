import React, { useState } from 'react';
import { 
  Store, 
  ShieldCheck, 
  User, 
  Smartphone, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Building2, 
  Sparkles,
  Key
} from 'lucide-react';
import { api } from '../services/api';

export default function LoginModal({ isOpen, onClose, setRoute, setActiveVendor }) {
  const [loginType, setLoginType] = useState('vendor'); // 'vendor' | 'admin' | 'resident'
  
  // Vendor Login State
  const [vendorPhone, setVendorPhone] = useState('9876543210');
  const [vendorOtp, setVendorOtp] = useState('');
  const [vendorOtpSent, setVendorOtpSent] = useState(false);

  // Admin Login State
  const [adminKey, setAdminKey] = useState('admin123');

  // Resident Login State
  const [residentPhone, setResidentPhone] = useState('');
  const [residentFlat, setResidentFlat] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle Vendor Login
  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      const res = await api.loginVendor({ phone: vendorPhone });
      const vendorData = res?.vendor || { vendor_id: '201', store_name: 'Fresh Daily Supermarket' };
      
      const session = {
        vendor: vendorData,
        expiresAt: Date.now() + 86400000
      };
      localStorage.setItem('digilocal_vendor_session', JSON.stringify(session));
      if (setActiveVendor) setActiveVendor(vendorData);
      
      onClose();
      setRoute({ page: 'vendorDashboard', vendorId: vendorData.vendor_id });
    } catch (err) {
      setErrorMsg(err.message || 'Vendor login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Login
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    onClose();
    setRoute({ page: 'admin' });
  };

  // Handle Resident Login
  const handleResidentSubmit = (e) => {
    e.preventDefault();
    if (residentPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    const residentSession = {
      phone: residentPhone,
      flat: residentFlat || 'Tower A-402'
    };
    localStorage.setItem('digilocal_resident_session', JSON.stringify(residentSession));
    onClose();
    setRoute({ page: 'home' });
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
              <p className="text-[11px] text-emerald-200/80 font-medium">Select your login portal to proceed</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Portal Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-secondary/80 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => { setLoginType('vendor'); setErrorMsg(''); }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                loginType === 'vendor'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-ink'
              }`}
            >
              <Store className="w-4 h-4 text-gold" />
              <span>Vendor</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginType('admin'); setErrorMsg(''); }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                loginType === 'admin'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-ink'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginType('resident'); setErrorMsg(''); }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                loginType === 'resident'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-ink'
              }`}
            >
              <User className="w-4 h-4 text-gold" />
              <span>Resident</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* 1. VENDOR LOGIN FORM */}
          {loginType === 'vendor' && (
            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5">
                  Vendor Registered Phone Number *
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
                  />
                </div>
              </div>

              <div className="p-3 bg-secondary/50 rounded-2xl border border-border text-[11px] text-muted-foreground">
                💡 <strong className="text-ink">Quick Demo Login:</strong> Use phone number <code className="bg-background px-1.5 py-0.5 rounded text-primary font-mono font-bold">9876543210</code> to log into sample store dashboard.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs uppercase tracking-wider shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Logging into Store Panel...' : 'Login to Vendor Dashboard'}</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </button>
            </form>
          )}

          {/* 2. ADMIN LOGIN FORM */}
          {loginType === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5">
                  Admin Passcode Key *
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="password"
                    required
                    placeholder="Enter admin passcode"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
                  />
                </div>
              </div>

              <div className="p-3 bg-secondary/50 rounded-2xl border border-border text-[11px] text-muted-foreground">
                🛡️ <strong className="text-ink">Central Admin Control:</strong> Access society approval, platform logo settings, and vendor request moderation.
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs uppercase tracking-wider shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Enter Central Admin Panel</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </button>
            </form>
          )}

          {/* 3. RESIDENT LOGIN FORM */}
          {loginType === 'resident' && (
            <form onSubmit={handleResidentSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5">
                  Resident Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9812345678"
                  value={residentPhone}
                  onChange={(e) => setResidentPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-1.5">
                  Flat & Tower Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tower B, Flat 604"
                  value={residentFlat}
                  onChange={(e) => setResidentFlat(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs uppercase tracking-wider shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Sign in as Resident</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
