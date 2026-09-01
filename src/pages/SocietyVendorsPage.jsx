import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api, getSocietyImage, getNormalizedImageUrl } from '../services/api';
import { Search, Store, Phone, ShieldCheck, ShoppingCart, ChevronRight, ChevronLeft, FileText, Clock, MapPin, Building2, ArrowLeft, ChevronDown, Check, Sparkles, X, Lock, LogIn, Heart } from 'lucide-react';
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
  } catch (_) { }
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

  // 24-Item Vendor Pagination State (24 grids per page)
  const [currentPage, setCurrentPage] = useState(1);
  const VENDORS_PER_PAGE = 24;

  // Favorite Vendors State (Con-04)
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('digilocal_favorite_vendors');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          setFavoriteIds(list.map(f => String(f.vendor_id)));
        }
      }
    } catch (_) { }
  }, []);

  const toggleFavorite = (e, vendor) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('digilocal_favorite_vendors');
      let list = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];

      const vIdStr = String(vendor.vendor_id);
      const exists = list.some(f => String(f.vendor_id) === vIdStr);

      if (exists) {
        list = list.filter(f => String(f.vendor_id) !== vIdStr);
      } else {
        list.push({
          vendor_id: vendor.vendor_id,
          store_name: vendor.store_name,
          category: vendor.category || 'General Store',
          logo: vendor.logo || vendor.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
          rating: vendor.rating || '4.9',
          delivery_time: vendor.delivery_time || '15 mins'
        });
      }

      localStorage.setItem('digilocal_favorite_vendors', JSON.stringify(list));
      setFavoriteIds(list.map(f => String(f.vendor_id)));
    } catch (_) { }
  };

  // Custom Dropdown State
  const [isSocietyDropdownOpen, setIsSocietyDropdownOpen] = useState(false);
  const [societyFilterSearch, setSocietyFilterSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Global Keyboard Listener for '/' shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    }).catch(() => { });
  }, []);

  // Load Active Society Details & Vendors (runs when societyId changes)
  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [currentSocietyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const [activeUserLocation, setActiveUserLocation] = useState(null);

  // Load active user location on mount and listen for location changes
  useEffect(() => {
    const handleLocUpdate = () => {
      try {
        const saved = localStorage.getItem('digilocal_user_location');
        if (saved) {
          setActiveUserLocation(JSON.parse(saved));
        } else {
          setActiveUserLocation(null);
        }
      } catch (_) {
        setActiveUserLocation(null);
      }
    };
    handleLocUpdate();
    window.addEventListener('digilocal_location_changed', handleLocUpdate);
    return () => window.removeEventListener('digilocal_location_changed', handleLocUpdate);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      let socList = allSocieties;
      if (!socList || socList.length === 0) {
        try {
          const fetchedSocs = await api.getSocieties();
          if (Array.isArray(fetchedSocs) && fetchedSocs.length > 0) {
            socList = fetchedSocs;
            setAllSocieties(fetchedSocs);
          }
        } catch (_) { }
      }

      let userLoc = null;
      try {
        const saved = localStorage.getItem('digilocal_user_location');
        if (saved) userLoc = JSON.parse(saved);
      } catch (_) { }

      let venData = [];
      if (currentSocietyId && currentSocietyId !== 'all') {
        let socData = await api.getSociety(currentSocietyId);
        if ((!socData || !socData.society_name) && Array.isArray(socList)) {
          const cleanTarget = String(currentSocietyId).replace('SOC-', '').toLowerCase();
          const found = socList.find(s =>
            String(s.society_id).toLowerCase() === String(currentSocietyId).toLowerCase() ||
            String(s.society_id).replace('SOC-', '').toLowerCase() === cleanTarget
          );
          if (found) socData = found;
        }
        setSociety(socData);
        venData = await api.getSocietyVendors(currentSocietyId, '');
      } else {
        setSociety(null);
        venData = await api.getSocietyVendors('all', '');
      }

      setAllMasterVendors(Array.isArray(venData) ? venData : []);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Synchronous client-side filtered vendors - Supports searching by society, area, sector, vendor name, address, pincode, store name & category!
  const vendors = useMemo(() => {
    let list = allMasterVendors;

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      const terms = term.split(/\s+/).filter(Boolean);

      return list.filter(v => {
        if (!v) return false;
        // Dynamically inspect all values of the vendor object
        const allVendorText = Object.values(v)
          .map(val => {
            if (!val) return '';
            if (typeof val === 'string' || typeof val === 'number') return String(val);
            if (Array.isArray(val)) return val.join(' ');
            if (typeof val === 'object') return Object.values(val).join(' ');
            return '';
          })
          .join(' ')
          .toLowerCase();

        return terms.every(t => allVendorText.includes(t));
      });
    }

    return list;
  }, [allMasterVendors, search, currentSocietyId]);

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
                    src={getSocietyImage(society, 0)}
                    alt={currentSocietyName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="px-3.5 py-1 text-[11px] font-bold bg-[#541D26] text-white rounded-full inline-block mb-1.5">
                    {society?.is_area ? '📍 Servicing Area' : '🏢 Housing Society'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">
                    {currentSocietyName}
                  </h1>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground font-medium mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C8A878] shrink-0" />
                    <span>{society?.location || 'Gated Residential Community'}</span>
                  </div>
                </div>
              </div>

              {/* Vendor Search Input for this specific society */}
              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#541D26]" />
                  <input
                    type="text"
                    placeholder={`Search stores in ${currentSocietyName}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#E5DAD0] text-[#211A19] text-xs font-semibold focus:outline-none focus:border-[#541D26] shadow-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 2. LOCATION-SPECIFIC / ALL VENDORS HEADER */
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                  <span className="px-3.5 py-1 text-[11px] font-bold bg-[#541D26] text-white rounded-full inline-block">
                    Hyperlocal Marketplace
                  </span>
                  <span className="px-3 py-1 text-[11px] font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 rounded-full inline-block border border-emerald-500/20">
                    {vendors.length} Serviceable Vendors
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                  {search.trim()
                    ? `Vendors Matching "${search}"`
                    : 'Explore All Community Vendors'}
                </h1>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium max-w-xl leading-relaxed">
                  {search.trim()
                    ? `Showing verified local vendors matching location, society, pincode or store name "${search}".`
                    : 'Discover verified local vendors, groceries, bakeries, and daily essentials serving residential communities across DigiLocal.'}
                </p>
              </div>

              {/* Single Main Vendor Search Input Matching Design Spec */}
              <div className="w-full md:w-96">
                <div className="w-full relative bg-white border-2 border-[#E5DAD0] rounded-full px-4 py-2.5 flex items-center justify-between shadow-xs transition-all focus-within:border-[#541D26] focus-within:ring-2 focus-within:ring-[#541D26]/15">
                  <Search className="w-4 h-4 text-[#541D26] shrink-0 mr-2.5 stroke-[2.5]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by society, area, sector, vendor name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-xs font-semibold text-[#211A19] placeholder:text-[#211A19]/50 focus:outline-none"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="text-xs font-bold text-[#211A19]/60 hover:text-[#541D26] mr-2 p-1"
                    >
                      ✕
                    </button>
                  )}
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#EEE5DA] text-[10px] font-bold text-[#541D26] shrink-0 select-none border border-[#E5DAD0]">
                    Press /
                  </span>
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
            <Building2 className="w-4 h-4 text-[#151415]" />
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
                        placeholder="Search society or area by name or location..."
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
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${currentSocietyId === 'all' ? 'bg-[#541D26] text-white shadow-xs' : 'hover:bg-[#EEE5DA] text-[#211A19]'}`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-[#C8A878] shrink-0" />
                        <span>All Partnered Societies & Local Areas</span>
                      </div>
                      {currentSocietyId === 'all' && <Check className="w-4 h-4 text-[#C8A878]" />}
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
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${isSelected ? 'bg-[#315C45] text-white font-bold shadow-xs' : 'hover:bg-[#F7F3E8] text-[#202622]'}`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              {soc.is_area ? (
                                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#C4A066]' : 'text-amber-600'}`} />
                              ) : (
                                <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#C4A066]' : 'text-emerald-700'}`} />
                              )}
                              <div className="truncate">
                                <div className="flex items-center gap-1.5">
                                  <span className="block truncate font-bold">{soc.society_name}</span>
                                  {soc.is_area ? (
                                    <span className="px-1.5 py-0.2 text-[8px] font-extrabold bg-amber-100 text-amber-900 rounded shrink-0">📍 Area</span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 text-[8px] font-extrabold bg-emerald-100 text-emerald-900 rounded shrink-0">🏢 Society</span>
                                  )}
                                </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

        {!loading && vendors.length > 0 && (() => {
          const totalPages = Math.ceil(vendors.length / VENDORS_PER_PAGE);
          const paginatedVendors = vendors.slice((currentPage - 1) * VENDORS_PER_PAGE, currentPage * VENDORS_PER_PAGE);

          return (
            <>
              <div id="vendors-grid-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {paginatedVendors.map((vendor) => {
                  const vId = vendor.vendor_id;
                  const savedCustomLogo = (vId ? localStorage.getItem(`digilocal_vendor_logo_${vId}`) : null) ||
                    (vId ? localStorage.getItem(`digilocal_vendor_logo_${String(vId)}`) : null) ||
                    (vendor.store_name ? localStorage.getItem(`digilocal_vendor_logo_${vendor.store_name}`) : null);

                  const rawImg = savedCustomLogo || vendor.logo || vendor.image_url || vendor.image || (Array.isArray(vendor.shop_images) && vendor.shop_images.length > 0 ? vendor.shop_images[0] : '');
                  const storeImage = getNormalizedImageUrl(rawImg, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800');
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
                      className="group rounded-3xl bg-white border border-[#E8E2D5] hover:border-[#18281F]/40 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between relative shadow-sm"
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          {/* Prominent Store Image Header */}
                          <div className="h-48 sm:h-52 w-full relative bg-gray-900 overflow-hidden">
                            <img
                              src={storeImage}
                              alt={vendor.store_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/25" />

                            {/* Top Floating Badges Overlay */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                              <div className="flex items-center gap-1.5 max-w-[65%]">
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white shadow-sm truncate">
                                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span className="truncate">{vendor.coverage_badge || (vendor.location ? `Location: ${vendor.location}` : vendor.society_name || 'Local Area')}</span>
                                </span>
                                {(vendor.vendor_type === 'service' || vendor.can_add_items === false) ? (
                                  <span className="px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-400/40 text-[9px] font-extrabold backdrop-blur-md shrink-0">
                                    🛠️ Service
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-400/40 text-[9px] font-extrabold backdrop-blur-md shrink-0">
                                    🛍️ Product
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">

                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center space-x-1.5 backdrop-blur-md shadow-sm border uppercase ${!status.isOpen
                                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                                    : status.closingCountdown
                                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                                  }`}>
                                  <span className={`w-2 h-2 rounded-full ${!status.isOpen ? 'bg-rose-400' : status.closingCountdown ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                                  <span>{status.statusText}</span>
                                </span>
                              </div>
                            </div>

                            {/* Store Title & Verified Badge Overlaid on Bottom of Cover Image */}
                            <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
                              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold mb-1 shadow-sm">
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
                          <div className="p-4 pt-3.5">
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-normal min-h-[2.5rem]">
                              {vendor.description || 'Quality goods & daily essentials delivered within society via WhatsApp.'}
                            </p>
                          </div>
                        </div>

                        {/* Timing, Contact & CTA Button */}
                        <div className="px-4 pb-4 space-y-3">
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
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
                            <div className="w-full py-3 px-4 rounded-xl bg-[#541D26] text-white group-hover:bg-[#6B2732] transition-all duration-300 flex items-center justify-between font-bold text-xs shadow-xs group-hover:shadow-md">
                              <div className="flex items-center space-x-2">
                                <ShoppingCart className="w-4 h-4 text-[#C8A878] group-hover:text-white transition-colors" />
                                <span className="uppercase tracking-wider">Explore Storefront</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-[#C8A878] group-hover:text-white group-hover:translate-x-1 transition-transform" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 25-Item Vendor Pagination Controls Bar */}
              {vendors.length > VENDORS_PER_PAGE && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 px-6 rounded-2xl shadow-xs">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Showing <span className="font-bold text-ink">{(currentPage - 1) * VENDORS_PER_PAGE + 1}</span>–<span className="font-bold text-ink">{Math.min(currentPage * VENDORS_PER_PAGE, vendors.length)}</span> of <span className="font-bold text-ink">{vendors.length}</span> Active Vendors
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(p => Math.max(p - 1, 1));
                        document.getElementById('vendors-grid-container')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-secondary text-ink text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        type="button"
                        key={pg}
                        onClick={() => {
                          setCurrentPage(pg);
                          document.getElementById('vendors-grid-container')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === pg
                            ? 'bg-[#18281F] text-white shadow-xs'
                            : 'bg-background hover:bg-secondary text-ink border border-border'
                          }`}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(p => Math.min(p + 1, totalPages));
                        document.getElementById('vendors-grid-container')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-secondary text-ink text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
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

              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#202622] leading-tight">
                Log In to Access Your Gated Community Marketplace
              </h2>
              <p className="text-xs text-muted-foreground mt-2 font-medium leading-relaxed max-w-sm mx-auto">
                Please log in as a resident user to order from verified local stores, organic farms, and artisan bakeries in your residential area.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setRoute({ page: 'login', accountType: 'resident', redirectSocietyId: currentSocietyId })}
                className="w-full sm:w-1/2 py-3.5 px-5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs shadow-md tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-white" />
                <span>LOG IN NOW</span>
              </button>

              <button
                onClick={() => setRoute({ page: 'register' })}
                className="w-full sm:w-1/2 py-3.5 px-5 rounded-full bg-transparent border border-[#541D26] text-[#541D26] hover:bg-[#541D26] hover:text-white font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center cursor-pointer"
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
