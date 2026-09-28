import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Briefcase, Clock, ShieldCheck, CheckCircle2, 
  Sparkles, Phone, MessageSquare, MapPin, Building2, 
  Calendar, User, AlertCircle, ExternalLink, HelpCircle,
  Check, Star, ChevronRight, Zap
} from 'lucide-react';
import { api } from '../services/api';

const TIME_SLOT_OPTIONS = [
  { value: 'Today (ASAP)', label: 'Earliest available slot today', badge: 'Fastest', urgent: true },
  { value: 'Today Evening (4 PM - 8 PM)', label: 'Between 4:00 PM – 8:00 PM', badge: 'Evening' },
  { value: 'Tomorrow Morning (9 AM - 1 PM)', label: 'Between 9:00 AM – 1:00 PM', badge: 'Morning' },
  { value: 'Tomorrow Evening (4 PM - 8 PM)', label: 'Between 4:00 PM – 8:00 PM', badge: 'Evening' },
  { value: 'Weekend Slot', label: 'Saturday or Sunday preferred', badge: 'Weekend' },
  { value: 'Flexible / Call to Coordinate', label: 'Anytime suitable for vendor', badge: 'Flexible' }
];

const SERVICE_TYPE_TAGS = [
  'General Repair & Fix',
  'Deep Cleaning / Servicing',
  'Inspection & Quote',
  'Installation / Setup',
  'Routine Maintenance',
  'Emergency Assistance'
];

export default function ServiceEnquiryPage({ 
  currentRoute, 
  setRoute, 
  activeUser, 
  activeVendor, 
  onOpenLoginModal 
}) {
  const vendorId = currentRoute?.vendorId || currentRoute?.id;
  const societyId = currentRoute?.societyId || 'all';
  const initialServiceItem = currentRoute?.serviceItem || null;
  const initialServiceId = currentRoute?.serviceId || initialServiceItem?.item_id || initialServiceItem?.id || null;
  const initialServiceTitle = currentRoute?.serviceTitle || initialServiceItem?.item_name || initialServiceItem?.name || '';

  const [vendorData, setVendorData] = useState(null);
  const [loadingVendor, setLoadingVendor] = useState(true);
  const [selectedService, setSelectedService] = useState(initialServiceItem);
  
  // Form State
  const [serviceTitle, setServiceTitle] = useState(initialServiceTitle);
  const [selectedTag, setSelectedTag] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('Today (ASAP)');
  const [isUrgent, setIsUrgent] = useState(false);

  // Resident Contact Details
  const [residentName, setResidentName] = useState('');
  const [residentPhone, setResidentPhone] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [societyName, setSocietyName] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);
  const [formError, setFormError] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch Vendor Profile & Catalog
  useEffect(() => {
    if (!vendorId) return;
    let isMounted = true;
    setLoadingVendor(true);

    api.getVendorStorefront(vendorId)
      .then(res => {
        if (!isMounted) return;
        const v = res?.vendor || res?.data?.vendor || res;
        setVendorData(v);

        // If a service ID was passed in query/route, resolve matching service from items
        const allItems = res?.items || res?.services || res?.products || res?.data?.items || [];
        if (initialServiceId && !selectedService) {
          const match = allItems.find(i => String(i.item_id || i.id) === String(initialServiceId));
          if (match) {
            setSelectedService(match);
            if (!serviceTitle) setServiceTitle(match.item_name || match.name || '');
          }
        }
      })
      .catch(err => {
        console.warn('Could not load vendor profile for enquiry:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingVendor(false);
      });

    return () => { isMounted = false; };
  }, [vendorId, initialServiceId]);

  // Pre-fill Resident Details from activeUser or Session
  useEffect(() => {
    let u = activeUser;
    if (!u) {
      try {
        const uStr = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session');
        if (uStr) {
          const parsed = JSON.parse(uStr);
          u = parsed.user || parsed.resident || parsed;
        }
      } catch (_) {}
    }

    if (u) {
      if (u.name || u.full_name) setResidentName(prev => prev || u.name || u.full_name || '');
      if (u.phone || u.mobile || u.phone_number) setResidentPhone(prev => prev || u.phone || u.mobile || u.phone_number || '');
      if (u.flat) setFlatNumber(prev => prev || u.flat || '');
      if (u.tower || u.building) setBuildingNumber(prev => prev || u.tower || u.building || '');
      if (u.society_name || u.area) setSocietyName(prev => prev || u.society_name || u.area || '');
    }
  }, [activeUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const titleToSubmit = (serviceTitle || selectedService?.item_name || '').trim();
    if (!titleToSubmit) {
      setFormError('Please enter a service name or task requirement.');
      return;
    }

    const cleanPhone = String(residentPhone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError('Please provide a valid 10-digit mobile number for vendor coordination.');
      return;
    }

    try {
      setSubmitting(true);
      const resName = residentName.trim() || `Flat ${flatNumber || 'Resident'}`;
      const payload = {
        vendor_id: vendorId,
        vendor_name: vendorData?.store_name || vendorData?.vendor_name || 'Service Vendor',
        service_id: selectedService?.item_id || selectedService?.id || null,
        service_title: titleToSubmit,
        description: (selectedTag ? `[${selectedTag}] ` : '') + serviceDescription.trim(),
        preferred_time: preferredTime || 'Today (ASAP)',
        resident_name: resName,
        resident_phone: cleanPhone.slice(-10),
        flat_number: flatNumber.trim(),
        building_number: buildingNumber.trim(),
        society_id: societyId !== 'all' ? societyId : (vendorData?.society_id || 1),
        society_name: societyName || vendorData?.society_name || 'Resident Society',
        is_urgent: isUrgent,
        status: 'NEW'
      };

      const res = await api.createServiceEnquiry(payload);

      // Save locally to resident enquiries history
      try {
        const key = 'digilocal_user_service_enquiries';
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        const entry = {
          ...payload,
          enquiry_id: res?.enquiry?.enquiry_id || res?.enquiry_id || `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
          created_at: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify([entry, ...saved]));
      } catch (_) {}

      setSubmittedEnquiry(res?.enquiry || {
        ...payload,
        enquiry_id: res?.enquiry_id || `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
        created_at: new Date().toISOString()
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setFormError(err.message || 'Failed to submit service enquiry. Please try again or contact the vendor directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const getNormalizedImageUrl = (item) => {
    if (!item) return '';
    return item.image_url || item.image || (Array.isArray(item.images) && item.images[0]) || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80';
  };

  const vendorStoreName = vendorData?.store_name || vendorData?.vendor_name || 'Verified Service Provider';

  return (
    <div className="min-h-screen bg-[#F6F0E8] text-[#211A19] pb-16 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#541D26]/10 text-[#541D26] border border-[#541D26]/20 text-[11px] font-extrabold uppercase tracking-wider mb-2.5">
            <Briefcase className="w-3.5 h-3.5 text-[#541D26]" />
            <span>Doorstep Service Consultation & Booking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#541D26] tracking-tight">
            Enquire with {vendorStoreName}
          </h1>
          <p className="text-sm text-[#211A19]/75 font-medium mt-1.5 max-w-2xl">
            Submit your specific home task or maintenance requirement. The verified specialist will review your details, confirm availability, and provide doorstep assistance.
          </p>
        </div>

        {/* Confirmation State View (Hybrid Website + WhatsApp / Direct Call Flow) */}
        {submittedEnquiry ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E5DAD0] p-6 sm:p-9 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#541D26]/10 text-[#541D26] flex items-center justify-center mx-auto ring-8 ring-[#541D26]/5">
                <CheckCircle2 className="w-9 h-9 text-[#541D26]" />
              </div>

              <div>
                <span className="px-3 py-0.5 rounded-full bg-[#541D26]/10 text-[#541D26] border border-[#541D26]/20 text-xs font-black uppercase tracking-wider">
                  Enquiry Registered on DigiLocal (Status: NEW)
                </span>
                <h2 className="text-2xl font-serif font-black text-[#211A19] mt-2">
                  Request Received by {vendorStoreName}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Your official tracking ID is <span className="font-mono font-bold text-[#541D26]">#{submittedEnquiry.enquiry_id || submittedEnquiry.id}</span>.
                </p>
              </div>

              {/* Direct Instant Action Shortcuts (WhatsApp + Call) */}
              {(() => {
                const whatsappLink = submittedEnquiry.direct_actions?.whatsapp_link || 
                  submittedEnquiry.whatsapp_link || 
                  (vendorData?.whatsapp_number || vendorData?.phone_number ? `https://wa.me/91${String(vendorData?.whatsapp_number || vendorData?.phone_number).replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(`Hi ${vendorStoreName},\nI have submitted a service request #${submittedEnquiry.enquiry_id || submittedEnquiry.id} for ${submittedEnquiry.service_title || submittedEnquiry.service_type || 'Service'}.`)}` : '');

                const callLink = submittedEnquiry.direct_actions?.call_link || 
                  submittedEnquiry.call_link || 
                  (vendorData?.phone_number ? `tel:${String(vendorData.phone_number).replace(/[^0-9]/g, '')}` : '');

                return (
                  <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E5DAD0] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#541D26] flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Instant Vendor Contact (Direct Actions)</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#541D26] bg-[#541D26]/10 px-2 py-0.5 rounded-full border border-[#541D26]/20">
                        Hybrid Sync
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                        >
                          <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      )}

                      {callLink ? (
                        <a
                          href={callLink}
                          className="w-full py-3 px-4 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                        >
                          <Phone className="w-4 h-4 text-[#C8A878]" />
                          <span>Direct Call Vendor</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRoute({ page: 'vendorStorefront', societyId: societyId || 'all', vendorId: vendorId })}
                          className="w-full py-3 px-4 rounded-xl bg-[#FAF9F6] text-[#211A19] font-bold text-xs uppercase tracking-wider border border-[#E5DAD0] transition-all cursor-pointer"
                        >
                          View Storefront
                        </button>
                      )}
                    </div>
                    <p className="text-[10.5px] text-muted-foreground text-center">
                      Click WhatsApp or Call to connect with the specialist immediately regarding this enquiry.
                    </p>
                  </div>
                );
              })()}

              {/* Summary Receipt Box */}
              <div className="bg-[#FAF9F6] rounded-2xl border border-[#E5DAD0] p-4.5 text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DAD0]">
                  <span className="text-muted-foreground font-semibold">Service Requirement:</span>
                  <span className="font-bold text-[#211A19] text-right">{submittedEnquiry.service_title || submittedEnquiry.service_type}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DAD0]">
                  <span className="text-muted-foreground font-semibold">Preferred Schedule:</span>
                  <span className="font-bold text-[#541D26] text-right">{submittedEnquiry.preferred_time}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DAD0]">
                  <span className="text-muted-foreground font-semibold">Contact Resident:</span>
                  <span className="font-bold text-[#211A19] text-right">{submittedEnquiry.resident_name || submittedEnquiry.user_name} ({submittedEnquiry.resident_phone || submittedEnquiry.user_phone})</span>
                </div>
                {submittedEnquiry.flat_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-semibold">Flat / Location:</span>
                    <span className="font-bold text-[#211A19] text-right">{submittedEnquiry.flat_number} {submittedEnquiry.building_number ? `(${submittedEnquiry.building_number})` : ''}</span>
                  </div>
                )}
              </div>

              {/* Next Steps Timeline */}
              <div className="bg-white rounded-2xl border border-[#E5DAD0] p-4 text-left space-y-3">
                <h4 className="text-xs font-bold text-[#541D26] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C8A878]" />
                  <span>Doorstep Service Process</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5DAD0]">
                    <span className="font-black text-[#541D26] block text-xs">1. Saved in DB</span>
                    <p className="text-muted-foreground mt-0.5">Enquiry logged & visible in vendor dashboard.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5DAD0]">
                    <span className="font-black text-[#541D26] block text-xs">2. Coordination</span>
                    <p className="text-muted-foreground mt-0.5">Technician confirms requirement & time slot.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5DAD0]">
                    <span className="font-black text-[#541D26] block text-xs">3. Doorstep Visit</span>
                    <p className="text-muted-foreground mt-0.5">Pay directly upon satisfaction at your flat.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRoute({ page: 'vendorStorefront', societyId: societyId || 'all', vendorId: vendorId })}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Return to Storefront
                </button>
                <button
                  type="button"
                  onClick={() => setRoute({ page: 'societyVendors', societyId: societyId || 'all' })}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#FAF6EE] hover:bg-[#EEE5DA] text-[#211A19] font-bold text-xs uppercase tracking-wider border border-[#E5DAD0] transition-all cursor-pointer"
                >
                  Browse Other Vendors
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Two-Column Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Vendor Profile & Guarantee Card */}
            <div className="lg:col-span-4 space-y-4">
              {/* Vendor Info Card */}
              <div className="bg-white rounded-3xl border border-[#E5DAD0] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#FAF6EE] border border-[#E5DAD0] shrink-0 p-1 flex items-center justify-center shadow-2xs">
                    {vendorData?.logo || vendorData?.avatar ? (
                      <img 
                        src={vendorData.logo || vendorData.avatar} 
                        alt={vendorStoreName}
                        className="w-full h-full object-cover rounded-xl" 
                      />
                    ) : (
                      <Briefcase className="w-7 h-7 text-[#541D26]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-[#541D26]/10 text-[#541D26] border border-[#541D26]/20 text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-[#541D26]" />
                        Verified Partner
                      </span>
                    </div>
                    <h3 className="font-serif font-black text-base sm:text-lg text-[#211A19] truncate mt-0.5">
                      {vendorStoreName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium truncate">
                      {vendorData?.category || 'Professional Services'}
                    </p>
                  </div>
                </div>

                {/* Society & Location Details */}
                <div className="pt-3 border-t border-[#E5DAD0] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#541D26] shrink-0" />
                    <span className="truncate">{vendorData?.society_name || vendorData?.location || 'Local Residential Society'}</span>
                  </div>
                  {vendorData?.phone_number && (
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Phone className="w-3.5 h-3.5 text-[#541D26] shrink-0" />
                      <span className="truncate font-semibold text-[#211A19]">{vendorData.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Service Card Preview (if pre-selected) */}
              {selectedService && (
                <div className="bg-white rounded-3xl border border-[#541D26]/20 p-4.5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#541D26] bg-[#541D26]/10 px-2.5 py-0.5 rounded-full">
                      Selected Service
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedService(null);
                        setServiceTitle('');
                      }}
                      className="text-[10.5px] font-bold text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border">
                      <img
                        src={getNormalizedImageUrl(selectedService)}
                        alt={selectedService.item_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#211A19] truncate">
                        {selectedService.item_name || selectedService.name}
                      </h4>
                      {selectedService.category && (
                        <span className="text-[9.5px] font-semibold text-muted-foreground uppercase">
                          {selectedService.category}
                        </span>
                      )}
                      <div className="flex items-center gap-2 text-[11px] mt-0.5 font-bold">
                        {selectedService.price && parseFloat(selectedService.price) > 0 ? (
                          <span className="text-[#541D26]">
                            Rate: ₹{parseFloat(selectedService.price).toFixed(2)}
                            {selectedService.unit ? ` / ${selectedService.unit}` : ''}
                          </span>
                        ) : (
                          <span className="text-emerald-700">Quote on Inspection</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Doorstep Direct Service Policy Guarantee Card */}
              <div className="bg-[#FAF6EE] rounded-3xl border border-[#E5DAD0] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#541D26]/10 text-[#541D26] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#541D26]" />
                  </div>
                  <h4 className="font-serif font-black text-sm text-[#541D26]">
                    Doorstep Direct Service Policy
                  </h4>
                </div>
                <p className="text-xs text-[#211A19]/80 leading-relaxed font-normal">
                  No advance online booking payment is required on DigiLocal. The service vendor receives your enquiry directly, coordinates scope and timing, and you settle charges in person upon complete satisfaction.
                </p>
                <div className="pt-2 border-t border-[#E5DAD0] flex items-center gap-2 text-[11px] font-bold text-[#541D26]">
                  <Check className="w-3.5 h-3.5 text-[#C8A878] shrink-0" />
                  <span>100% Resident Satisfaction Assurance</span>
                </div>
              </div>
            </div>

            {/* Right Column: Custom Service Consultation Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl border border-[#E5DAD0] p-6 sm:p-8 shadow-md">
                <div className="pb-5 mb-5 border-b border-[#E5DAD0] flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif font-black text-xl sm:text-2xl text-[#211A19]">
                      Requirement Details & Schedule
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      Fill out the form below so the technician arrives prepared with proper equipment.
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#541D26] border border-[#E5DAD0] shrink-0 hidden sm:inline-block">
                    Free Consultation
                  </span>
                </div>

                {formError && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider">
                      Service / Task Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Tap Leakage Repair, AC Deep Cleaning, Home Haircut, Switchboard Replacement..."
                      value={serviceTitle}
                      onChange={(e) => setServiceTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF9F6] border border-[#E5DAD0] text-xs sm:text-sm font-semibold text-[#211A19] placeholder:text-muted-foreground/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26] transition-all"
                    />
                  </div>

                  {/* Task Type Tags */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider">
                      Category Tag <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SERVICE_TYPE_TAGS.map((tag) => {
                        const isSelected = selectedTag === tag;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(isSelected ? '' : tag)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#541D26] text-white border-[#541D26] shadow-2xs'
                                : 'bg-[#FAF9F6] text-[#211A19] hover:bg-[#FAF6EE] border-[#E5DAD0]'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider">
                      Describe What Needs Fixing <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe the issue, brand/model (e.g. Daikin 1.5T Inverter AC), specific spare parts needed, or special access instructions..."
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF9F6] border border-[#E5DAD0] text-xs sm:text-sm font-medium text-[#211A19] placeholder:text-muted-foreground/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26] transition-all"
                    />
                  </div>

                  {/* Preferred Time Slot */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider">
                      Preferred Doorstep Slot <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {TIME_SLOT_OPTIONS.map((slot) => {
                        const isSelected = preferredTime === slot.value;
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            onClick={() => setPreferredTime(slot.value)}
                            className={`p-3 rounded-2xl text-left text-xs font-bold transition-all border cursor-pointer relative ${
                              isSelected
                                ? 'bg-[#541D26] text-white border-[#541D26] shadow-xs'
                                : 'bg-[#FAF9F6] text-[#211A19] hover:bg-[#FAF6EE] border-[#E5DAD0]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold truncate">{slot.badge}</span>
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-[#C8A878]" />
                              ) : (
                                slot.urgent && <Zap className="w-3 h-3 text-amber-600" />
                              )}
                            </div>
                            <p className={`text-[10.5px] font-medium truncate mt-1 ${isSelected ? 'text-white/85' : 'text-muted-foreground'}`}>
                              {slot.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resident Contact & Location Details Section */}
                  <div className="pt-3 border-t border-[#E5DAD0] space-y-3">
                    <h3 className="text-xs font-extrabold text-[#541D26] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#541D26]" />
                      <span>Resident Contact & Address</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#211A19] uppercase tracking-wider">
                          Your Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aarushi Sharma"
                          value={residentName}
                          onChange={(e) => setResidentName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5DAD0] text-xs font-semibold text-[#211A19] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#211A19] uppercase tracking-wider">
                          10-Digit Mobile Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={14}
                          placeholder="e.g. 9876543210"
                          value={residentPhone}
                          onChange={(e) => setResidentPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5DAD0] text-xs font-semibold text-[#211A19] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#211A19] uppercase tracking-wider">
                          Flat / Unit Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Flat A-402"
                          value={flatNumber}
                          onChange={(e) => setFlatNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5DAD0] text-xs font-semibold text-[#211A19] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#211A19] uppercase tracking-wider">
                          Tower / Wing / Society
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Tower B, Greenwood Residency"
                          value={buildingNumber || societyName}
                          onChange={(e) => setBuildingNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5DAD0] text-xs font-semibold text-[#211A19] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Urgent Assistance Toggle */}
                  <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E5DAD0] cursor-pointer select-none hover:bg-[#EEE5DA]/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="w-4 h-4 rounded text-[#541D26] focus:ring-[#541D26] accent-[#541D26] cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#211A19] flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-amber-600" />
                        Urgent Task: Need technician assistance within 2 hours if available
                      </span>
                    </div>
                  </label>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setRoute({ page: 'vendorStorefront', societyId: societyId || 'all', vendorId: vendorId })}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FAF6EE] hover:bg-[#EEE5DA] text-[#211A19] font-bold text-xs uppercase tracking-wider border border-[#E5DAD0] transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Briefcase className="w-4 h-4 text-[#C8A878]" />
                      <span>{submitting ? 'Submitting Enquiry...' : 'Submit Service Enquiry & Consultation'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
