import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Store, ShieldCheck, CheckCircle2, CreditCard, ArrowRight, ArrowLeft, AlertCircle, Mail, Lock, Sparkles, KeyRound } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';

export default function VendorRegisterPage({ setRoute, setActiveVendor }) {
  const [step, setStep] = useState(1);
  const [societies, setSocieties] = useState([]);
  
  // Registration Form State
  const [formData, setFormData] = useState({
    society_id: '',
    vendor_name: '',
    store_name: '',
    email: '',
    password: '',
    phone_number: '',
    gst_number: ''
  });

  // Login Form State (Default: True so Login shows first)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginCreds, setLoginCreds] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadSocieties();
  }, []);

  const loadSocieties = async () => {
    try {
      const data = await api.getSocieties();
      setSocieties(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, society_id: data[0].society_id }));
      }
    } catch (err) {
      console.error('Failed to load societies:', err);
    }
  };

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const handleNextToVerify = (e) => {
    e.preventDefault();
    if (!formData.society_id || !formData.vendor_name || !formData.store_name || !formData.email || !formData.password) {
      setModalConfig({
        isOpen: true,
        title: 'Missing Required Fields',
        message: 'Please fill in all required vendor registration inputs before proceeding.',
        type: 'warning'
      });
      return;
    }
    setStep(2);
  };

  const [createdVendor, setCreatedVendor] = useState(null);

  const handleConfirmPayment = async () => {
    try {
      setProcessing(true);
      const transaction_id = `RZP_${paymentMethod}_${Date.now()}`;
      
      const payload = {
        ...formData,
        payment_method: `Razorpay (${paymentMethod})`,
        transaction_id
      };

      const res = await api.registerVendor(payload);
      if (res && res.vendor) {
        const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
        const sessionData = {
          vendor: res.vendor,
          expiresAt: Date.now() + ninetyDaysMs
        };
        localStorage.setItem('digilocal_vendor_session', JSON.stringify(sessionData));
        if (setActiveVendor) setActiveVendor(res.vendor);
        setCreatedVendor(res.vendor);
      }
      setStep(4);
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Registration Failed',
        message: err.message || 'Failed to process vendor registration request.',
        type: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleVendorLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      setProcessing(true);
      const res = await api.loginVendor(loginCreds);
      
      // Store persistent session for 90 days
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
      const sessionData = {
        vendor: res.vendor,
        expiresAt: Date.now() + ninetyDaysMs
      };
      localStorage.setItem('digilocal_vendor_session', JSON.stringify(sessionData));

      setActiveVendor(res.vendor);
      setRoute({ page: 'vendorDashboard', vendorId: res.vendor.vendor_id });
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const fillDemoCreds = (email, password) => {
    setLoginCreds({ email, password });
    setLoginError('');
  };

  const selectedSocietyObj = societies.find(s => String(s.society_id) === String(formData.society_id));

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2229] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        {/* Header Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <img
            src="/logo.png"
            alt="DigiLocal Official Logo"
            className="w-16 h-16 object-contain rounded-2xl shadow-md border border-[#C5A880]/30 p-1 bg-white mb-2"
          />
          <h2 className="text-xl font-serif font-extrabold text-[#0A1428] uppercase tracking-wider">
            Digi<span className="text-[#C5A880]">Local</span> Vendor Portal
          </h2>
        </div>

        {/* Toggle between Login and Register (LOGIN FIRST) */}
        <div className="flex items-center justify-center space-x-2 p-1.5 rounded-xl bg-white border border-[#C5A880]/30 shadow-sm mb-6 max-w-sm mx-auto">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              isLoginMode ? 'bg-[#0A1428] text-white shadow-sm' : 'text-[#787F8C] hover:text-[#0A1428]'
            }`}
          >
            Vendor Login
          </button>
          <button
            onClick={() => { setIsLoginMode(false); setStep(1); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              !isLoginMode ? 'bg-[#0A1428] text-white shadow-sm' : 'text-[#787F8C] hover:text-[#0A1428]'
            }`}
          >
            Vendor Registration
          </button>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="p-4 rounded-xl bg-white border border-[#C5A880]/30 shadow-sm mb-6 space-y-2">
          <div className="flex items-center space-x-2 text-[#C5A880] font-bold text-xs uppercase tracking-wider">
            <KeyRound className="w-4 h-4 text-[#C5A880]" />
            <span>Test Credentials (Click to Auto-fill):</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setIsLoginMode(true); fillDemoCreds('freshmart@gmail.com', 'vendor123'); }}
              className="p-2.5 rounded-lg bg-[#FAF9F6] hover:bg-[#F6F3EC] text-left border border-[#C5A880]/20 transition-colors group"
            >
              <div className="text-[11px] font-bold text-[#0A1428] group-hover:text-[#C5A880]">FreshMart (Active)</div>
              <div className="text-[10px] text-[#787F8C] truncate">freshmart@gmail.com</div>
              <div className="text-[9px] text-[#787F8C]">Pass: vendor123</div>
            </button>

            <button
              type="button"
              onClick={() => { setIsLoginMode(true); fillDemoCreds('bakesandbites@gmail.com', 'vendor123'); }}
              className="p-2.5 rounded-lg bg-[#FAF9F6] hover:bg-[#F6F3EC] text-left border border-[#C5A880]/20 transition-colors group"
            >
              <div className="text-[11px] font-bold text-[#0A1428] group-hover:text-[#C5A880]">Bakes & Bites (Active)</div>
              <div className="text-[10px] text-[#787F8C] truncate">bakesandbites@gmail.com</div>
              <div className="text-[9px] text-[#787F8C]">Pass: vendor123</div>
            </button>

            <button
              type="button"
              onClick={() => { setIsLoginMode(true); fillDemoCreds('royalcleaners@gmail.com', 'vendor123'); }}
              className="p-2.5 rounded-lg bg-[#F6F3EC] hover:bg-amber-100 text-left border border-[#C5A880]/40 transition-colors group"
            >
              <div className="text-[11px] font-bold text-[#0A1428]">Royal Dry Clean (Pending)</div>
              <div className="text-[10px] text-[#787F8C] truncate">royalcleaners@gmail.com</div>
              <div className="text-[9px] text-amber-800">Tests Pending Lock!</div>
            </button>
          </div>
        </div>

        {/* VENDOR LOGIN MODE */}
        {isLoginMode ? (
          <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#0A1428] border border-[#C5A880]/40 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Store className="w-6 h-6 text-[#C5A880]" />
              </div>
              <h2 className="text-xl font-serif font-extrabold text-[#0A1428] uppercase tracking-wider">Vendor Portal Login</h2>
              <p className="text-xs text-[#787F8C] mt-1 font-medium">Access store inventory, orders & settings</p>
            </div>

            {loginError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-6 flex items-start space-x-3 font-medium">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleVendorLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase tracking-wider mb-1.5">Vendor Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A880]" />
                  <input
                    type="email"
                    required
                    placeholder="freshmart@gmail.com"
                    value={loginCreds.email}
                    onChange={(e) => setLoginCreds({ ...loginCreds, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-[#0A1428] text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A880]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginCreds.password}
                    onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-[#0A1428] text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md uppercase tracking-wider mt-4 transition-all"
              >
                {processing ? 'Logging in...' : 'Login to Vendor Panel'}
              </button>
            </form>
          </div>
        ) : (
          /* VENDOR REGISTRATION STEPS */
          <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-8 shadow-xl">
            
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#C5A880]/20">
              <div className="flex items-center space-x-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-[#0A1428] text-white' : 'bg-[#FAF9F6] text-[#787F8C]'}`}>1</span>
                <span className="text-xs font-bold text-[#0A1428] hidden sm:inline">Details</span>
              </div>
              <div className="flex-1 h-0.5 bg-[#C5A880]/20 mx-2" />
              <div className="flex items-center space-x-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-[#0A1428] text-white' : 'bg-[#FAF9F6] text-[#787F8C]'}`}>2</span>
                <span className="text-xs font-bold text-[#0A1428] hidden sm:inline">Verify</span>
              </div>
              <div className="flex-1 h-0.5 bg-[#C5A880]/20 mx-2" />
              <div className="flex items-center space-x-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-[#0A1428] text-white' : 'bg-[#FAF9F6] text-[#787F8C]'}`}>3</span>
                <span className="text-xs font-bold text-[#0A1428] hidden sm:inline">Payment</span>
              </div>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-serif font-extrabold text-[#0A1428] mb-1 uppercase tracking-wider">Register Vendor Account</h2>
                <p className="text-xs text-[#787F8C] mb-6 font-medium">Enter your store information to partner with DigiLocal residents.</p>

                <form onSubmit={handleNextToVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Select Society</label>
                    <select
                      value={formData.society_id}
                      onChange={(e) => setFormData({ ...formData, society_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-[#0A1428] text-xs font-medium focus:outline-none"
                    >
                      {societies.map((s) => (
                        <option key={s.society_id} value={s.society_id}>
                          {s.society_name} ({s.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Vendor Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Sharma"
                        value={formData.vendor_name}
                        onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-[#0A1428] text-xs font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A1428] uppercase mb-0.5">Shop Name</label>
                      <p className="text-[10px] text-[#787F8C] font-medium mb-1">Name of your shop / business visible to residents</p>
                      <input
                        type="text"
                        required
                        placeholder="e.g. FreshMart Grocery, Bakes & Bites"
                        value={formData.store_name}
                        onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-[#0A1428] text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="vendor@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-[#0A1428] text-xs font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-[#0A1428] text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-[#0A1428] text-xs font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">GST Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="07AAACR12341Z5"
                        value={formData.gst_number}
                        onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-[#0A1428] text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md flex items-center justify-center space-x-2 mt-4 uppercase tracking-wider transition-all"
                  >
                    <span>Proceed to Verify Inputs</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-serif font-extrabold text-[#0A1428] mb-1 uppercase tracking-wider">Confirm Your Details</h2>
                <p className="text-xs text-[#787F8C] mb-6 font-medium">Please verify whether all submitted vendor inputs are correct.</p>

                <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/25 space-y-2.5 text-xs font-medium mb-6">
                  <div className="flex justify-between border-b border-[#C5A880]/15 pb-2">
                    <span className="text-[#787F8C]">Target Society:</span>
                    <span className="font-bold text-[#0A1428]">{selectedSocietyObj?.society_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#C5A880]/15 pb-2">
                    <span className="text-[#787F8C]">Vendor Name:</span>
                    <span className="font-bold text-[#0A1428]">{formData.vendor_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#C5A880]/15 pb-2">
                    <span className="text-[#787F8C]">Store Name:</span>
                    <span className="font-bold text-[#0A1428]">{formData.store_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#C5A880]/15 pb-2">
                    <span className="text-[#787F8C]">Email:</span>
                    <span className="font-bold text-[#C5A880]">{formData.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#C5A880]/15 pb-2">
                    <span className="text-[#787F8C]">Phone:</span>
                    <span className="font-bold text-[#0A1428]">{formData.phone_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#787F8C]">GST Number:</span>
                    <span className="font-bold text-[#0A1428]">{formData.gst_number || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-[#C5A880]/40 text-[#0A1428] hover:bg-[#F6F3EC] text-xs font-bold flex items-center gap-1.5 uppercase"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Edit Details</span>
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md flex items-center gap-2 uppercase tracking-wider"
                  >
                    <span>Proceed to Payment</span>
                    <CreditCard className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <div className="flex items-center space-x-2 text-[#C5A880] font-bold text-xs uppercase mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Razorpay Payment Gateway</span>
                </div>
                <h2 className="text-xl font-serif font-extrabold text-[#0A1428] mb-1 uppercase tracking-wider">Annual Vendor Subscription</h2>
                <p className="text-xs text-[#787F8C] mb-6 font-medium">Pay ₹2,999 for 1-Year unlimited society listing & panel access.</p>

                <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/30 mb-6 space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-[#0A1428] border-b border-[#C5A880]/20 pb-3">
                    <span>1-Year Subscription Fee</span>
                    <span className="text-[#C5A880] text-lg font-extrabold">₹2,999.00</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-2">Select Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['UPI', 'Card', 'Net Banking'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            paymentMethod === m 
                              ? 'bg-[#0A1428] text-white border-[#0A1428] shadow-sm' 
                              : 'bg-white text-[#787F8C] border-[#C5A880]/30 hover:text-[#0A1428]'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button onClick={() => setStep(2)} className="px-4 py-2.5 rounded-xl text-[#787F8C] hover:text-[#0A1428] text-xs font-semibold uppercase">
                    Back
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={processing}
                    className="px-6 py-3 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-md flex items-center space-x-2 uppercase tracking-wider"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{processing ? 'Processing...' : 'Pay ₹2,999 via Razorpay'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h2 className="text-xl font-serif font-extrabold text-[#0A1428] mb-2 uppercase tracking-wider">Payment Received & Submitted!</h2>
                <p className="text-[#787F8C] text-xs leading-relaxed mb-6 font-medium">
                  Your registration request has been successfully transmitted to the <strong className="text-[#0A1428]">DigiLocal Admin Portal</strong>.
                </p>

                <div className="p-4 rounded-xl bg-[#F6F3EC] border border-[#C5A880]/40 text-[#0A1428] text-xs leading-relaxed text-left mb-6 space-y-2 font-medium">
                  <div className="font-bold flex items-center gap-1 text-sm text-[#0A1428]">
                    <ShieldCheck className="w-4 h-4 text-[#C5A880]" /> Store Setup Active Notice:
                  </div>
                  <p>
                    Your vendor store panel is now open! You can add products, set operating hours, and configure delivery charges right now.
                  </p>
                  <p className="text-[11px] text-[#787F8C]">
                    Note: Your store will remain hidden from resident community listings until DigiLocal Admin approves your subscription.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const vId = createdVendor?.vendor_id || createdVendor?.id;
                    if (vId) {
                      setRoute({ page: 'vendorDashboard', vendorId: vId });
                    } else {
                      setIsLoginMode(true);
                    }
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md uppercase tracking-wider transition-all"
                >
                  Go to My Store Panel Now
                </button>
              </div>
            )}

          </div>
        )}

        {/* In-Website Notification Modal */}
        <NotificationModal
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          onConfirm={() => setModalConfig({ ...modalConfig, isOpen: false })}
          onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
        />

      </div>
    </div>
  );
}
