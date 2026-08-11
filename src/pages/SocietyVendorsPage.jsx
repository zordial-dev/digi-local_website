import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api, getSocietyImage } from '../services/api';
import { Search, Store, Phone, ShieldCheck, ShoppingCart, ChevronRight, FileText, Clock, MapPin, Building2, ArrowLeft, ChevronDown, Check, Sparkles, X, Lock, LogIn } from 'lucide-react';
import { getStoreStatus } from '../utils/storeHours';
import { VendorCardSkeleton } from '../components/Skeletons';

const checkUserLoggedIn = () => {
  try {
    const savedUser = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session');
    const savedVendor = localStorage.getItem('digilocal_vendor_session');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const u = parsed.user || parsed;
      if (u && (u.user_id || u.email || u.name || u.phone)) return true;
    }
    if (savedVendor) {
      const parsedV = JSON.parse(savedVendor);
      const v = parsedV.vendor || parsedV;
      if (v && (v.vendor_id || v.email || v.vendor_name || v.store_name)) return true;
    }
  } catch (_) {}
  return false;
};

export default function SocietyVendorsPage({ societyId: initialSocietyId, setRoute, onOpenLoginModal }) {
  const [currentSocietyId, setCurrentSocietyId] = useState(initialSocietyId || 'all');
  const [society, setSociety] = useState(null);
  const [allSocieties, setAllSocieties] = useState([]);
  const [allMasterVendors, setAllMasterVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [selectedVendorForPrompt, setSelectedVendorForPrompt] = useState(null);

  // Custom Dropdown State
  const [isSocietyDropdownOpen, setIsSocietyDropdownOpen] = useState(false);
  const [societyFilterSearch, setSocietyFilterSearch] = useState('');
  const dropdownRef = useRef(null);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsSocietyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync props when initialSocietyId changes
  useEffect(() => {
    const target = initialSocietyId || 'all';
    if (target !== currentSocietyId) {
      setCurrentSocietyId(target);
    }
  }, [initialSocietyId]);

  // Load all societies list for filter dropdown
  useEffect(() => {
    api.getSocieties().then(data => {
      if (Array.isArray(data)) setAllSocieties(data);
    }).catch(() => {});
  }, []);

  // Load Active Society Details & Vendors (runs when societyId changes)
  useEffect(() => {
    loadData();
  }, [currentSocietyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (currentSocietyId && currentSocietyId !== 'all') {
        let socData = await api.getSociety(currentSocietyId);
        if (!socData || !socData.society_name) {
          const found = allSocieties.find(s => String(s.society_id) === String(currentSocietyId) || String(s.society_id).replace('SOC-', '') === String(currentSocietyId).replace('SOC-', ''));
          if (found) socData = found;
        }
        setSociety(socData);
        const venData = await api.getSocietyVendors(currentSocietyId, '');
        setAllMasterVendors(Array.isArray(venData) ? venData : []);
      } else {
        setSociety(null);
        const venData = await api.getSocietyVendors('all', '');
        setAllMasterVendors(Array.isArray(venData) ? venData : []);
      }
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Synchronous client-side filtered vendors - Guarantees all vendors show instantly when search is empty
  const vendors = useMemo(() => {
    if (!search || !search.trim()) return allMasterVendors;
    const term = search.toLowerCase().trim();
    return allMasterVendors.filter(v =>
      v.store_name?.toLowerCase().includes(term) ||
      v.vendor_name?.toLowerCase().includes(term) ||
      v.category?.toLowerCase().includes(term) ||
      v.society_name?.toLowerCase().includes(term) ||
      v.description?.toLowerCase().includes(term)
    );
  }, [allMasterVendors, search]);

  const currentSocietyName = society?.society_name || (currentSocietyId !== 'all' ? (allSocieties.find(s => String(s.society_id) === String(currentSocietyId))?.society_name || 'Society') : '');

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 px-3 sm:px-6 font-sans">
      
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto pt-4 pb-6">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              setRoute({ page: 'home' });
            }
          }}
          className="mb-3 inline-flex items-center space-x-1.5 text-xs font-bold text-muted-foreground hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          {currentSocietyId !== 'all' ? (
            /* 1. SPECIFIC SOCIETY HEADER WITH REAL SOCIETY NAME & LOCATION */
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-border shadow-sm shrink-0">
                  <img 
                    src={getSocietyImage(society || { society_name: currentSocietyName })} 
                    alt={currentSocietyName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-3.5 py-1 text-[11px] font-bold bg-[#18281F] text-white rounded-full inline-block border border-emerald-900/40">
                      Approved Residential Society
                    </span>
                    <span className="px-3 py-1 text-[11px] font-extrabold bg-emerald-500/15 text-emerald-800 rounded-full inline-block border border-emerald-500/20">
                      {vendors.length} Active Vendors
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                    {currentSocietyName} Vendors
                  </h1>
                  <div className="flex items-center space-x-1.5 text-muted-foreground text-xs mt-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-gold shrink-0" />
                    <span>{society?.location || 'Gated Residential Community'}</span>
                  </div>
                </div>
              </div>

              {/* Vendor Search Input for this specific society */}
              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="text"
                    placeholder={`Search stores in ${currentSocietyName}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-background border border-border text-ink text-xs font-semibold focus:outline-none focus:border-primary shadow-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 2. GLOBAL ALL VENDORS HEADER */
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3.5 py-1 text-[11px] font-bold bg-[#18281F] text-white rounded-full inline-block border border-emerald-900/40">
                    Hyperlocal Marketplace
                  </span>
                  <span className="px-3 py-1 text-[11px] font-extrabold bg-emerald-500/15 text-emerald-800 rounded-full inline-block border border-emerald-500/20">
                    {vendors.length} Active Vendors
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  Explore All Community Vendors
                </h1>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium max-w-xl leading-relaxed">
                  Discover verified local vendors, groceries, bakeries, and daily essentials serving residential communities across DigiLocal.
                </p>
              </div>

              {/* Vendor Search Input */}
              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="text"
                    placeholder="Search vendor, category or store..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-background border border-border text-ink text-xs font-semibold focus:outline-none focus:border-primary shadow-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vendors Bento Grid Container */}
      <div className="max-w-7xl mx-auto mt-2">
        
        {/* Society Filter Selector Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-card border border-border rounded-2xl p-3.5 sm:px-5 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-ink">
            <Building2 className="w-4 h-4 text-[#C4A066]" />
            <span>Filter Vendors by Society:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Custom Styled React Dropdown */}
            <div className="relative w-full sm:w-80 z-30" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsSocietyDropdownOpen(!isSocietyDropdownOpen)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F7F4EE] hover:bg-white text-ink text-xs font-bold transition-all shadow-xs flex items-center justify-between gap-2 cursor-pointer group"
              >
                <div className="flex items-center space-x-2 truncate">
                  {currentSocietyId === 'all' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#C4A066] shrink-0" />
                      <span className="truncate">All Societies (Show All Vendors)</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-[#C4A066] shrink-0" />
                      <span className="truncate">{society?.society_name || 'Selected Society'}</span>
                    </>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground group-hover:text-ink transition-transform duration-200 shrink-0 ${isSocietyDropdownOpen ? 'rotate-180 text-[#C4A066]' : ''}`} />
              </button>

              {isSocietyDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-96 bg-white border border-[#E4DCC9] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                  {/* Search inside dropdown */}
                  <div className="p-2.5 border-b border-[#E4DCC9] bg-[#F7F4EE]">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={societyFilterSearch}
                        onChange={(e) => setSocietyFilterSearch(e.target.value)}
                        placeholder="Search society by name or location..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4DCC9] bg-white text-xs text-[#18281F] focus:outline-none focus:ring-2 focus:ring-[#C4A066]"
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSocietyId('all');
                        setRoute({ page: 'societyVendors', societyId: 'all' });
                        setIsSocietyDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentSocietyId === 'all' ? 'bg-[#18281F] text-white shadow-xs' : 'hover:bg-[#F7F4EE] text-[#18281F]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-[#C4A066] shrink-0" />
                        <span>All Societies (Show All Vendors)</span>
                      </div>
                      {currentSocietyId === 'all' && <Check className="w-4 h-4 text-[#C4A066]" />}
                    </button>

                    {allSocieties
                      .filter(s =>
                        !societyFilterSearch.trim() ||
                        s.society_name?.toLowerCase().includes(societyFilterSearch.toLowerCase()) ||
                        s.location?.toLowerCase().includes(societyFilterSearch.toLowerCase())
                      )
                      .map((soc) => {
                        const isSelected = String(currentSocietyId) === String(soc.society_id);
                        return (
                          <button
                            type="button"
                            key={soc.society_id}
                            onClick={() => {
                              setCurrentSocietyId(soc.society_id);
                              setRoute({ page: 'societyVendors', societyId: soc.society_id });
                              setIsSocietyDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                              isSelected ? 'bg-[#18281F] text-white font-bold shadow-xs' : 'hover:bg-[#F7F4EE] text-[#18281F]'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#C4A066]' : 'text-emerald-700'}`} />
                              <div className="truncate">
                                <span className="block truncate font-bold">{soc.society_name}</span>
                                <span className={`text-[10px] block truncate ${isSelected ? 'text-emerald-200' : 'text-[#6B7C70]'}`}>
                                  {soc.location}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#C4A066] shrink-0" />}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {currentSocietyId !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  setCurrentSocietyId('all');
                  setRoute({ page: 'societyVendors', societyId: 'all' });
                }}
                className="px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-black transition-colors shrink-0 cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>
        </div>
        
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <VendorCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && vendors.length === 0 && (
          <div className="text-center py-16 bg-card border border-border rounded-[2.5rem] p-8 max-w-lg mx-auto shadow-sm">
            <Store className="w-12 h-12 text-[#C4A066] mx-auto mb-4" />
            <h3 className="text-lg font-serif font-black text-ink mb-1">No Vendors Found</h3>
            <p className="text-muted-foreground text-xs mb-6 font-medium">
              There are currently no active approved vendors listed {society ? `in ${society.society_name}` : 'for your search'}.
            </p>
            <button
              onClick={() => setRoute({ page: 'vendorRegister', societyId: currentSocietyId, societyName: society?.society_name })}
              className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md tracking-wider uppercase cursor-pointer"
            >
              Register your Store Here
            </button>
          </div>
        )}

        {!loading && vendors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => {
              const vId = vendor.vendor_id;
              const savedCustomLogo = (vId ? localStorage.getItem(`digilocal_vendor_logo_${vId}`) : null) ||
                                      (vId ? localStorage.getItem(`digilocal_vendor_logo_${String(vId)}`) : null) ||
                                      (vendor.store_name ? localStorage.getItem(`digilocal_vendor_logo_${vendor.store_name}`) : null);

              const storeImage = savedCustomLogo || vendor.logo || vendor.image_url || vendor.image || (Array.isArray(vendor.shop_images) && vendor.shop_images.length > 0 ? vendor.shop_images[0] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80');
              const status = getStoreStatus(
                vendor.opening_timing || vendor.opening_time || '08:00 AM',
                vendor.closing_timing || vendor.closing_time || '10:00 PM',
                vendor
              );

              return (
                <div
                  key={vendor.vendor_id}
                  onClick={() => {
                    if (!checkUserLoggedIn()) {
                      setSelectedVendorForPrompt(vendor);
                      setShowLoginPromptModal(true);
                      return;
                    }
                    setRoute({ page: 'vendorStorefront', societyId: vendor.society_id || currentSocietyId || 1, vendorId: vendor.vendor_id });
                  }}
                  className="group rounded-3xl bg-white border border-[#E8E2D5] hover:border-[#18281F]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between relative shadow-xs"
                >
                  <div>
                    {/* Single Prominent Store Image Header */}
                    <div className="h-44 w-full relative bg-gray-900 overflow-hidden">
                      <img
                        src={storeImage}
                        alt={vendor.store_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20" />

                      {/* Top Floating Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow-sm">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{vendor.society_name || 'Gated Society'}</span>
                        </span>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center space-x-1.5 backdrop-blur-md shadow-sm border uppercase ${
                          !status.isOpen 
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/50' 
                            : status.closingCountdown
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${!status.isOpen ? 'bg-rose-400' : status.closingCountdown ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                          <span>{status.statusText}</span>
                        </span>
                      </div>

                      {/* Store Title & Verified Badge Overlaid on Bottom of Cover Image */}
                      <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
                        <div className="inline-flex items-center space-x-1.5 bg-emerald-950/85 backdrop-blur-md text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 text-[10px] font-extrabold mb-1 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Verified Store</span>
                        </div>
                        <h3 className="font-serif font-black text-xl text-white group-hover:text-emerald-300 transition-colors leading-tight truncate drop-shadow-md">
                          {vendor.store_name}
                        </h3>
                        <p className="text-xs text-emerald-100/90 font-medium mt-0.5 truncate drop-shadow-sm">
                          By {vendor.vendor_name}
                        </p>
                      </div>
                    </div>

                    {/* Description Body */}
                    <div className="p-4 pt-3">
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-normal">
                        {vendor.description || 'Quality goods & daily essentials delivered within society via WhatsApp.'}
                      </p>
                    </div>
                  </div>

                  {/* Timing, Contact & CTA Button */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between pt-2 mb-3 border-t border-gray-100 text-xs">
                      {checkUserLoggedIn() ? (
                        <span className="flex items-center space-x-1.5 font-bold text-[#18281F]">
                          <Phone className="w-3.5 h-3.5 text-[#C4A066]" />
                          <span>{vendor.phone_number || 'Contact Available'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70 text-[11px] font-bold">
                          <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Login to view contact</span>
                        </span>
                      )}

                      {vendor.opening_time && (
                        <span className="flex items-center space-x-1 text-[11px] text-gray-500 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#C4A066]" />
                          <span>{vendor.opening_time} – {vendor.closing_time}</span>
                        </span>
                      )}
                    </div>

                    {!status.isOpen && status.nextOpenText ? (
                      <div className="w-full py-2.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-800 text-xs font-bold flex items-center justify-center space-x-2">
                        <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>CLOSED • OPENS AT {vendor.opening_time} ({status.nextOpenText})</span>
                      </div>
                    ) : (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-[#18281F] text-[#C4A066] group-hover:bg-[#C4A066] group-hover:text-[#18281F] transition-all duration-300 flex items-center justify-between font-bold text-xs shadow-xs">
                        <span className="flex items-center space-x-2">
                          <ShoppingCart className="w-4 h-4 text-[#C4A066] group-hover:text-[#18281F] transition-colors" />
                          <span>Visit Store & Order</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#C4A066] group-hover:text-[#18281F] group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LOGIN REQUIRED POPUP MODAL (MATCHES USER DESIGN SPECIFICATION EXACTLY) */}
      {showLoginPromptModal && !checkUserLoggedIn() && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-[2.2rem] p-7 sm:p-8 shadow-2xl border border-[#E8E2D5] text-center space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Top Right Close Button */}
            <button
              onClick={() => setShowLoginPromptModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFE6] text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4.5 h-4.5 text-gray-500" />
            </button>

            {/* Center Gold Building Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#FFFBF0] border border-[#F5E6C4] flex items-center justify-center mx-auto text-[#C4A066] shadow-xs">
              <Building2 className="w-8 h-8 text-[#C4A066]" />
            </div>

            {/* Pill Badge & Title */}
            <div className="space-y-2">
              <span className="inline-block px-4 py-1 rounded-full bg-[#FFF5E5] text-[#C47D14] border border-[#FFE3B5] text-[11px] font-extrabold uppercase tracking-widest">
                LOGIN REQUIRED
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#18281F] leading-tight">
                Explore {selectedVendorForPrompt?.store_name || society?.society_name || 'Community Vendors'}
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed max-w-xs mx-auto pt-1">
                Please log in to your account to view approved local stores, products, and daily essentials for {selectedVendorForPrompt?.store_name || society?.society_name || 'your residential complex'}.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowLoginPromptModal(false);
                  setRoute({
                    page: 'login',
                    accountType: 'resident',
                    redirectVendorId: selectedVendorForPrompt?.vendor_id,
                    redirectSocietyId: currentSocietyId
                  });
                }}
                className="w-full sm:w-1/2 py-3.5 px-5 rounded-full bg-[#18281F] hover:bg-[#233A2E] text-white font-extrabold text-xs shadow-md tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#C4A066]" />
                <span>LOG IN NOW</span>
              </button>

              <button
                onClick={() => {
                  setShowLoginPromptModal(false);
                  setRoute({ page: 'register' });
                }}
                className="w-full sm:w-1/2 py-3.5 px-5 rounded-full bg-[#F5EFE0] hover:bg-[#EBE2CC] text-[#18281F] font-extrabold text-xs border border-[#E3D9C3] tracking-wider uppercase transition-all flex items-center justify-center cursor-pointer"
              >
                <span>REGISTER</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
