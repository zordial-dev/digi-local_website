import React, { useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Building2, MapPin, CheckCircle2, Store, Send, Sparkles, Eye, ShieldCheck, Home, ChevronRight, Hash, Phone, User } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import CategoryPicker from '../components/CategoryPicker';

export default function RequestSocietyPage({ setRoute }) {
  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [isVendor, setIsVendor] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    society_name: '',
    address: '',
    city: 'Noida',
    pincode: '',
    total_flats: '',
    society_type: 'High-Rise Gated Community',
    rwa_contact_name: '',
    rwa_contact_phone: '',
    vendor_business_name: '',
    vendor_category: 'Grocery',
    vendor_phone: ''
  });

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Common Pincode Auto-City Helper
  const handlePincodeChange = (e) => {
    const pin = e.target.value;
    let autoCity = formData.city;
    
    if (pin.startsWith('2013')) autoCity = 'Noida';
    else if (pin.startsWith('1100')) autoCity = 'New Delhi';
    else if (pin.startsWith('1220')) autoCity = 'Gurugram';
    else if (pin.startsWith('5600')) autoCity = 'Bengaluru';
    else if (pin.startsWith('4000')) autoCity = 'Mumbai';
    else if (pin.startsWith('4110')) autoCity = 'Pune';

    setFormData(prev => ({ ...prev, pincode: pin, city: autoCity }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.society_name.trim() || !formData.address.trim() || !formData.pincode.trim()) {
      setModalConfig({
        isOpen: true,
        title: 'Missing Required Fields',
        message: 'Please fill in the Society Name, Full Address, and Pincode to list your society.',
        type: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        total_flats: parseInt(formData.total_flats, 10) || 0,
        is_vendor_request: isVendor
      };
      const res = await api.requestSociety(payload);
      setSubmittedRequest({ ...payload, ...res });
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Submission Error',
        message: err.message || 'Failed to submit society request.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const societyTypes = [
    '🏢 High-Rise Gated Community',
    '🏡 Residential Township / Villas',
    '🏙️ Co-operative Housing Society',
    '🏘️ Independent Sector / Block'
  ];

  return (
    <div className="min-h-screen bg-[#F6F0E8] text-[#211A19] pb-24">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-[#E5DAD0] py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => setRoute({ page: 'home' })}
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#211A19]/60 hover:text-[#541D26] mb-3 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#C8A878]" />
            <span>Back to Search</span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EEE5DA] border border-[#E5DAD0] flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 text-[#541D26]" />
            </div>
            <div>
              <span className="px-3 py-0.5 text-[10px] font-extrabold bg-[#541D26]/10 text-[#541D26] border border-[#541D26]/20 rounded-full uppercase tracking-wider inline-block mb-1">
                Instant Society Onboarding
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#211A19] uppercase tracking-wide">
                Register Your Residential Society
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* SUCCESS INSTANT ACTIVATION STATE */}
        {submittedRequest ? (
          <div className="bg-white border border-[#E5DAD0] rounded-3xl p-8 sm:p-12 shadow-xl text-center max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="w-20 h-20 bg-[#541D26]/10 border-2 border-[#541D26]/20 text-[#541D26] rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10 text-[#541D26]" />
            </div>

            <div>
              <span className="px-3.5 py-1 bg-[#541D26]/10 text-[#541D26] border border-[#541D26]/20 text-xs font-extrabold rounded-full uppercase tracking-wider">
                ✓ Published & Live Instantly
              </span>
              <h2 className="text-2xl font-serif font-extrabold text-[#211A19] mt-3 uppercase tracking-wide">
                {submittedRequest.society_name} is Now Live!
              </h2>
              <p className="text-xs text-[#211A19]/70 mt-2 max-w-md mx-auto font-medium leading-relaxed">
                Your residential society has been successfully registered and added to the DigiLocal network. Residents can now search and explore vendors for this community!
              </p>
            </div>

            {/* Live Society Badge Card */}
            <div className="p-4 bg-[#FAF8F5] border border-[#E5DAD0] rounded-2xl text-left max-w-md mx-auto shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#541D26] text-white flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-[#C8A878]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#211A19] text-sm">{submittedRequest.society_name}</h4>
                  <p className="text-xs text-[#211A19]/60">{submittedRequest.address}, {submittedRequest.city} - {submittedRequest.pincode}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              {submittedRequest.society_id && (
                <button
                  onClick={() => setRoute({ page: 'societyVendors', societyId: submittedRequest.society_id })}
                  className="px-6 py-3.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#C8A878]" />
                  <span>Explore Society Marketplace</span>
                </button>
              )}
              
              {submittedRequest.society_id && (
                <button
                  onClick={() => setRoute({ page: 'vendorRegister', societyId: submittedRequest.society_id })}
                  className="px-6 py-3.5 rounded-xl bg-white border border-[#541D26] text-[#541D26] hover:bg-[#541D26] hover:text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Store className="w-4 h-4 text-[#C8A878]" />
                  <span>Register as Vendor</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          
          /* TWO COLUMN INTERACTIVE LAYOUT (Form + Live Card Preview) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-[#E5DAD0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div>
                <h3 className="text-sm font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C8A878]" />
                  <span>Society Information</span>
                </h3>
                <p className="text-[11px] text-[#211A19]/60 mt-0.5 font-medium">Fill in your society details to make it available for local vendors</p>
              </div>

              {/* Society Type Quick Select Pills */}
              <div>
                <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-2">
                  Category / Type of Society
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {societyTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, society_type: type }))}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                        formData.society_type === type
                          ? 'bg-[#541D26] text-white border-[#541D26] shadow-sm'
                          : 'bg-[#FAF8F5] text-[#211A19]/70 border-[#E5DAD0] hover:border-[#541D26]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                    Society Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A878]" />
                    <input
                      type="text"
                      name="society_name"
                      required
                      placeholder="e.g. Greenwood Residency, Royal Garden Enclave"
                      value={formData.society_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5DAD0] text-xs font-bold text-[#211A19] focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/10 transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                    Full Address & Sector *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A878]" />
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="e.g. Block A, Sector 62, Phase 2"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5DAD0] text-xs font-bold text-[#211A19] focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/10 transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                      Pincode *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A878]" />
                      <input
                        type="text"
                        name="pincode"
                        required
                        placeholder="e.g. 201301"
                        value={formData.pincode}
                        onChange={handlePincodeChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5DAD0] text-xs font-bold text-[#211A19] focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/10 transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Noida, Gurugram, Delhi"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3.5 py-3 rounded-xl border border-[#E5DAD0] text-xs font-bold text-[#211A19] focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/10 transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                      Total Units / Flats
                    </label>
                    <input
                      type="number"
                      name="total_flats"
                      placeholder="e.g. 650"
                      value={formData.total_flats}
                      onChange={handleChange}
                      className="w-full px-3.5 py-3 rounded-xl border border-[#E5DAD0] text-xs font-bold text-[#211A19] focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/10 transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                      RWA / Admin Contact Name
                    </label>
                    <input
                      type="text"
                      name="rwa_contact_name"
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.rwa_contact_name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-3 rounded-xl border border-[#E5DAD0] text-xs font-bold text-[#211A19] focus:outline-none focus:border-[#541D26] focus:ring-2 focus:ring-[#541D26]/10 transition-all bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Vendor Self-Registration Toggle */}
              <div className="pt-2 border-t border-[#E5DAD0]">
                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-[#FAF8F5] border border-[#E5DAD0] rounded-xl hover:border-[#541D26] transition-colors">
                  <input
                    type="checkbox"
                    checked={isVendor}
                    onChange={(e) => setIsVendor(e.target.checked)}
                    className="w-4 h-4 text-[#541D26] rounded border-[#E5DAD0] focus:ring-[#541D26]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#211A19]">I am a Vendor offering services in this society</span>
                    <p className="text-[10px] text-[#211A19]/60">Pre-register your store to be mapped immediately upon creation</p>
                  </div>
                </label>
              </div>

              {/* Expanded Vendor Form */}
              {isVendor && (
                <div className="p-4 bg-[#EEE5DA]/60 rounded-2xl border border-[#E5DAD0] space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#C8A878]" />
                    <span>Vendor Store Pre-Registration</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#211A19] mb-1">Store / Business Name</label>
                      <input
                        type="text"
                        name="vendor_business_name"
                        placeholder="e.g. Express Fresh Grocery"
                        value={formData.vendor_business_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5DAD0] text-xs text-[#211A19] focus:outline-none focus:border-[#541D26]"
                      />
                    </div>

                    <div>
                      <CategoryPicker
                        value={formData.vendor_category}
                        onChange={(val) => setFormData(prev => ({ ...prev, vendor_category: val }))}
                        label="Business Category"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#211A19] mb-1">Contact Mobile Number</label>
                      <input
                        type="tel"
                        name="vendor_phone"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.vendor_phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5DAD0] text-xs text-[#211A19] focus:outline-none focus:border-[#541D26]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Publishing Society...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#C8A878]" />
                    <span>Publish & List Society Instantly</span>
                  </>
                )}
              </button>

            </form>

            {/* Right Column: Interactive Live Preview Card */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#211A19] uppercase tracking-wider">
                <Eye className="w-4 h-4 text-[#C8A878]" />
                <span>Live Marketplace Listing Preview</span>
              </div>

              {/* Mock Society Card */}
              <div className="rounded-2xl bg-white p-5 border border-[#E5DAD0] shadow-md relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 bg-[#541D26] text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                  Live Preview
                </div>

                <div className="flex items-center space-x-3.5 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#EEE5DA] border border-[#E5DAD0] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-[#541D26]" />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#211A19]">
                      {formData.society_name.trim() || 'Your Society Name'}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-[#211A19]/60 text-xs mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#C8A878]" />
                      <span>{formData.address.trim() ? `${formData.address}, ${formData.city}` : 'Society Location & Address'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5DAD0] flex items-center justify-between text-xs font-bold">
                  <span className="px-2.5 py-1 text-[10px] bg-[#FAF8F5] text-[#211A19] border border-[#E5DAD0] rounded-full flex items-center gap-1">
                    <Store className="w-3 h-3 text-[#541D26]" />
                    {isVendor ? '1 Registered Vendor' : '0 Vendors Yet'}
                  </span>

                  <div className="flex items-center space-x-1 text-[#541D26]">
                    <span className="uppercase text-[10px] tracking-wider font-extrabold">Explore</span>
                    <ChevronRight className="w-4 h-4 text-[#541D26]" />
                  </div>
                </div>
              </div>

              {/* Informational Tip Card */}
              <div className="p-4 bg-[#FAF8F5] border border-[#E5DAD0] rounded-2xl text-xs text-[#211A19]/70 space-y-2">
                <div className="flex items-center space-x-2 text-[#211A19] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#C8A878]" />
                  <span>Instant Verification Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  DigiLocal societies are immediately published to search so your neighbors and local shops can start ordering right away without delay.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      <NotificationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
