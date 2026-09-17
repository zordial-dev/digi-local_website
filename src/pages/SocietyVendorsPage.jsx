import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { api, getSocietyImage, getNormalizedImageUrl } from '../services/api';
import { Search, Store, Phone, ShieldCheck, ShoppingCart, ChevronRight, ChevronLeft, FileText, Clock, MapPin, Building2, ArrowLeft, ChevronDown, Check, Sparkles, X, Lock, LogIn, Heart, SlidersHorizontal, Star } from 'lucide-react';
import { getStoreStatus } from '../utils/storeHours';
import { VendorCardSkeleton } from '../components/Skeletons';
import { sanitizeSocietyLocation } from '../utils/locationResolver';

const checkUserLoggedIn = (activeUser = null, activeVendor = null) => {
  if (activeUser && (activeUser.user_id || activeUser.id || activeUser.phone || activeUser.name)) {
    return true;
  }
  if (activeVendor && (activeVendor.vendor_id || activeVendor.id || activeVendor.store_name)) {
    return true;
  }
  try {
    const savedUser = localStorage.getItem('digilocal_user_session');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const u = parsed.user || parsed;
      if (u && (u.user_id || u.id || u.email || u.name || u.phone) && parsed.expiresAt && parsed.expiresAt > Date.now()) return true;
    }
    const savedVendor = localStorage.getItem('digilocal_vendor_session');
    if (savedVendor) {
      const parsedV = JSON.parse(savedVendor);
      const v = parsedV.vendor || parsedV;
      if (v && (v.vendor_id || v.id || v.email || v.vendor_name || v.store_name) && parsedV.expiresAt && parsedV.expiresAt > Date.now()) return true;
    }
  } catch (_) { }
  return false;
};

const getDetailedLocationSubtitle = (rawSoc) => {
  if (!rawSoc) return '';
  const soc = sanitizeSocietyLocation(rawSoc);
  const name = (soc.society_name || soc.name || '').trim();
  const city = (soc.city || '').trim();
  const area = (soc.area || soc.sector || '').trim();
  const pincode = (soc.pincode || soc.pin || soc.zip || '').trim();
  const fullLoc = (soc.location || '').trim();

  let pinStr = pincode;
  if (!pinStr && fullLoc) {
    const m = fullLoc.match(/\b\d{6}\b/);
    if (m) pinStr = m[0];
  }

  let areaStr = area;
  let cityStr = city;

  if (fullLoc && (!cityStr || !areaStr)) {
    const parts = fullLoc.split(',').map(p => p.trim()).filter(Boolean);
    const nonPinParts = parts.filter(p => !/^\d{6}$/.test(p));
    const distinctParts = nonPinParts.filter(p => p.toLowerCase() !== name.toLowerCase());

    if (distinctParts.length >= 2) {
      if (!areaStr) areaStr = distinctParts[0];
      if (!cityStr) cityStr = distinctParts[1];
    } else if (distinctParts.length === 1) {
      if (!cityStr) cityStr = distinctParts[0];
    }
  }

  const parts = [];
  if (areaStr && areaStr.toLowerCase() !== name.toLowerCase()) parts.push(areaStr);
  if (cityStr && cityStr.toLowerCase() !== name.toLowerCase()) parts.push(cityStr);
  if (pinStr) parts.push(pinStr);

  if (parts.length === 0 && fullLoc) {
    const cleanLoc = fullLoc.replace(new RegExp(`^${name},\\s*`, 'i'), '');
    return cleanLoc || fullLoc;
  }

  return parts.join(' • ');
};

export function isServiceVendor(vendor) {
  if (!vendor) return false;
  const type = String(vendor.vendor_type || vendor.merchant_type || vendor.business_type || '').toLowerCase();
  const cat = String(vendor.category || vendor.category_name || vendor.store_name || '').toLowerCase();
  if (type === 'service' || type === 'services' || type === 'service_provider') return true;
  if (vendor.can_add_items === false) return true;
  if (
    cat.includes('plumb') ||
    cat.includes('electr') ||
    cat.includes('repair') ||
    cat.includes('salon') ||
    cat.includes('laundry') ||
    cat.includes('service') ||
    cat.includes('clean') ||
    cat.includes('painter') ||
    cat.includes('carpenter') ||
    cat.includes('grooming') ||
    cat.includes('barber')
  ) {
    return true;
  }
  return false;
}

export function getCategoryCoverImage(vendor) {
  if (!vendor) return null;
  const vId = vendor.vendor_id;
  const savedCustomLogo = (vId ? localStorage.getItem(`digilocal_vendor_logo_${vId}`) : null) ||
    (vId ? localStorage.getItem(`digilocal_vendor_logo_${String(vId)}`) : null) ||
    (vendor.store_name ? localStorage.getItem(`digilocal_vendor_logo_${vendor.store_name}`) : null);

  const rawImg = savedCustomLogo || vendor.logo || vendor.image_url || vendor.image || (Array.isArray(vendor.shop_images) && vendor.shop_images.length > 0 ? vendor.shop_images[0] : '');

  if (rawImg && typeof rawImg === 'string' && rawImg.trim().length > 5 && !rawImg.includes('photo-1542838132-92c53300491e')) {
    return getNormalizedImageUrl(rawImg, '');
  }

  const nameCat = `${vendor.store_name || ''} ${vendor.category || ''} ${vendor.description || ''}`.toLowerCase();

  if (nameCat.includes('milk') || nameCat.includes('dairy') || nameCat.includes('doodh') || nameCat.includes('ghee') || nameCat.includes('paneer')) {
    return 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=800&auto=format&fit=crop&q=80';
  }
  if (nameCat.includes('bake') || nameCat.includes('bread') || nameCat.includes('cake') || nameCat.includes('sweet') || nameCat.includes('jalebi') || nameCat.includes('mithai')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80';
  }
  if (nameCat.includes('fruit') || nameCat.includes('veg') || nameCat.includes('sabzi') || nameCat.includes('produce') || nameCat.includes('farm')) {
    return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80';
  }
  if (nameCat.includes('electr') || nameCat.includes('wire') || nameCat.includes('light') || nameCat.includes('appliance')) {
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80';
  }
  if (nameCat.includes('plumb') || nameCat.includes('pipe') || nameCat.includes('sanitary') || nameCat.includes('tap')) {
    return 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80';
  }
  if (nameCat.includes('laundry') || nameCat.includes('dry clean') || nameCat.includes('wash') || nameCat.includes('press')) {
    return 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80';
  }
  if (nameCat.includes('salon') || nameCat.includes('beauty') || nameCat.includes('spa') || nameCat.includes('barber') || nameCat.includes('hair')) {
    return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80';
  }
  if (nameCat.includes('pet') || nameCat.includes('dog') || nameCat.includes('cat') || nameCat.includes('vet')) {
    return 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=80';
  }
  if (nameCat.includes('coffee') || nameCat.includes('cafe') || nameCat.includes('tea') || nameCat.includes('chai')) {
    return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80';
  }
  if (nameCat.includes('supermart') || nameCat.includes('grocery') || nameCat.includes('mart') || nameCat.includes('kirana') || nameCat.includes('store')) {
    return 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80';
  }

  return null;
}

export function getVendorRating(vendor, liveRatingsMap = {}) {
  if (!vendor) return 0;
  const vId = String(vendor.vendor_id || vendor.id || '');
  if (liveRatingsMap && liveRatingsMap[vId] !== undefined && liveRatingsMap[vId] !== null) {
    const num = parseFloat(liveRatingsMap[vId]);
    if (!isNaN(num)) return num;
  }
  try {
    const cached = localStorage.getItem(`digilocal_vendor_rating_summary_${vId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.avg_rating !== undefined && parsed?.avg_rating !== null) {
        const num = parseFloat(parsed.avg_rating);
        if (!isNaN(num)) return num;
      }
    }
  } catch (_) {}
  const raw = vendor.rating ?? vendor.avg_rating ?? vendor.store_rating ?? vendor.vendor_rating ?? vendor.rating_score;
  if (raw !== undefined && raw !== null && raw !== '') {
    const num = parseFloat(raw);
    if (!isNaN(num)) return num;
  }
  return 0;
}

export default function SocietyVendorsPage({ societyId: initialSocietyId, setRoute, onOpenLoginModal, activeUser, activeVendor }) {
  const isLoggedIn = checkUserLoggedIn(activeUser, activeVendor);
  const [currentSocietyId, setCurrentSocietyId] = useState(initialSocietyId || 'all');
  const [society, setSociety] = useState(null);
  const [allSocieties, setAllSocieties] = useState([]);
  const [allMasterVendors, setAllMasterVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [liveRatingsMap, setLiveRatingsMap] = useState({});
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

  useEffect(() => {
    if (showLoginPromptModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLoginPromptModal]);

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
          rating: vendor.rating || (getVendorRating(vendor, liveRatingsMap) > 0 ? getVendorRating(vendor, liveRatingsMap).toFixed(1) : ''),
          delivery_time: vendor.delivery_time || '15 mins'
        });
      }

      localStorage.setItem('digilocal_favorite_vendors', JSON.stringify(list));
      setFavoriteIds(list.map(f => String(f.vendor_id)));
    } catch (_) { }
  };

  // Custom Dropdown & Sort State
  const [isSocietyDropdownOpen, setIsSocietyDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('rating_high'); // 'rating_high' | 'rating_low'
  const [vendorTypeTab, setVendorTypeTab] = useState('all'); // 'all' | 'products' | 'services'
  const [societyFilterSearch, setSocietyFilterSearch] = useState('');
  const dropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
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

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsSocietyDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortDropdownOpen(false);
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
        venData = await api.getSocietyVendors(currentSocietyId, '', socData);
      } else {
        setSociety(null);
        venData = await api.getSocietyVendors('all', '');
      }

      setAllMasterVendors(Array.isArray(venData) ? venData : []);

      // Fetch live rating summaries for all loaded vendors to ensure 100% sync with backend reviews
      if (Array.isArray(venData) && venData.length > 0) {
        Promise.allSettled(
          venData.map(async (v) => {
            const vId = String(v.vendor_id || v.id || '');
            if (!vId) return null;
            try {
              const res = await api.getVendorRatingSummary(vId);
              if (res?.data && res.data.avg_rating !== undefined) {
                return { vId, avg_rating: Number(res.data.avg_rating) };
              }
            } catch (_) {}
            return null;
          })
        ).then((results) => {
          const map = {};
          results.forEach((r) => {
            if (r.status === 'fulfilled' && r.value) {
              map[r.value.vId] = r.value.avg_rating;
            }
          });
          if (Object.keys(map).length > 0) {
            setLiveRatingsMap((prev) => ({ ...prev, ...map }));
          }
        });
      }
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Synchronous client-side filtered & sorted vendors - Supports searching and sorting by rating & distance!
  const sortedVendors = useMemo(() => {
    let list = [...allMasterVendors];

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      const terms = term.split(/\s+/).filter(Boolean);

      list = list.filter(v => {
        if (!v) return false;
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

    // Sort Options Processing - Rating sort
    if (sortBy === 'rating_high') {
      list.sort((a, b) => {
        const ratingA = getVendorRating(a, liveRatingsMap);
        const ratingB = getVendorRating(b, liveRatingsMap);
        return ratingB - ratingA;
      });
    } else if (sortBy === 'rating_low') {
      list.sort((a, b) => {
        const ratingA = getVendorRating(a, liveRatingsMap);
        const ratingB = getVendorRating(b, liveRatingsMap);
        return ratingA - ratingB;
      });
    }

    return list;
  }, [allMasterVendors, search, currentSocietyId, sortBy, liveRatingsMap]);

  const filteredVendors = useMemo(() => {
    let list = sortedVendors;
    if (vendorTypeTab === 'products') {
      list = list.filter(v => !isServiceVendor(v));
    } else if (vendorTypeTab === 'services') {
      list = list.filter(v => isServiceVendor(v));
    }
    return list;
  }, [sortedVendors, vendorTypeTab]);

  const vendors = filteredVendors;

  const productVendorsCount = useMemo(() => sortedVendors.filter(v => !isServiceVendor(v)).length, [sortedVendors]);
  const serviceVendorsCount = useMemo(() => sortedVendors.filter(v => isServiceVendor(v)).length, [sortedVendors]);

  const currentSocietyName = society?.society_name || (currentSocietyId !== 'all' ? (allSocieties.find(s => String(s.society_id) === String(currentSocietyId))?.society_name || 'Society') : '');

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 px-3 sm:px-6 font-sans">

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto pt-3 pb-3.5">
        <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-xs">
          {currentSocietyId !== 'all' ? (
            /* 1. SPECIFIC SOCIETY HEADER WITH REAL SOCIETY NAME & LOCATION */
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-border shadow-xs shrink-0">
                  <img
                    src={getSocietyImage(society, 0)}
                    alt={currentSocietyName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="px-3 py-0.5 text-[10px] font-bold bg-[#541D26] text-white rounded-full inline-block mb-1">
                    {society?.is_area ? '📍 Servicing Area' : '🏢 Housing Society'}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-serif font-black text-ink">
                    {currentSocietyName}
                  </h1>
                  <div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-medium mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C8A878] shrink-0" />
                    <span>{society?.location || 'Gated Residential Community'}</span>
                  </div>
                </div>
              </div>

              {/* Society / Area / Sector Dropdown Selector */}
              <div className="relative w-full md:w-80 lg:w-88 z-30" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSocietyDropdownOpen(!isSocietyDropdownOpen)}
                  className="w-full px-3.5 py-2 rounded-full border border-[#E5DAD0] bg-[#FAF6EE] hover:bg-[#F5EFE6] text-[#211A19] text-xs font-bold transition-all shadow-2xs flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <div className="flex items-center space-x-2 truncate min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#C8A878] shrink-0" />
                    <span className="truncate font-extrabold text-[#211A19]">
                      {currentSocietyId === 'all'
                        ? 'All Societies (Show All Vendors)'
                        : (society?.society_name || 'Selected Society')}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#211A19] group-hover:text-[#541D26] transition-transform duration-200 shrink-0 ${isSocietyDropdownOpen ? 'rotate-180 text-[#541D26]' : ''}`} />
                </button>

                {isSocietyDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-full sm:w-80 md:w-96 bg-white border border-[#E5DAD0] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                    <div className="p-2.5 border-b border-[#E5DAD0] bg-[#FAF6EE]">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={societyFilterSearch}
                          onChange={(e) => setSocietyFilterSearch(e.target.value)}
                          placeholder="Search society, area, sector..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5DAD0] bg-white text-xs font-semibold text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]/20"
                        />
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
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
                          <span>All Societies (Show All Vendors)</span>
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
                          const subtitle = getDetailedLocationSubtitle(soc);
                          return (
                            <button
                              type="button"
                              key={soc.society_id}
                              onClick={() => {
                                setCurrentSocietyId(soc.society_id);
                                setRoute({ page: 'societyVendors', societyId: soc.society_id });
                                setIsSocietyDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${isSelected ? 'bg-[#541D26] text-white font-bold shadow-xs' : 'hover:bg-[#FAF6EE] text-[#211A19]'}`}
                            >
                              <div className="flex items-start space-x-2.5 min-w-0">
                                {soc.is_area ? (
                                  <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#C8A878]' : 'text-amber-600'}`} />
                                ) : (
                                  <Building2 className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#C8A878]' : 'text-emerald-700'}`} />
                                )}
                                <div className="min-w-0">
                                  <span className="block truncate font-bold text-xs">{soc.society_name}</span>
                                  {subtitle && (
                                    <span className={`block truncate text-[10.5px] mt-0.5 font-medium ${isSelected ? 'text-[#D6B7A5]' : 'text-muted-foreground'}`}>
                                      {subtitle}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-[#C8A878] shrink-0 mt-0.5" />}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 2. LOCATION-SPECIFIC / ALL VENDORS HEADER */
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                  <span className="px-3 py-0.5 text-[10px] font-bold bg-[#541D26] text-white rounded-full inline-block">
                    Hyperlocal Marketplace
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 rounded-full inline-block border border-emerald-500/20">
                    {vendors.length} Serviceable Vendors
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-black text-ink">
                  {search.trim()
                    ? `Vendors Matching "${search}"`
                    : 'Explore All Community Vendors'}
                </h1>
                <p className="text-xs text-muted-foreground mt-1 font-medium max-w-xl leading-snug">
                  {search.trim()
                    ? `Showing verified local vendors matching location, society, pincode or store name "${search}".`
                    : 'Discover verified local vendors, groceries, bakeries, and daily essentials serving residential communities.'}
                </p>
              </div>

              {/* Society Dropdown Selector */}
              <div className="relative w-full md:w-80 lg:w-88 z-30" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSocietyDropdownOpen(!isSocietyDropdownOpen)}
                  className="w-full px-3.5 py-2 rounded-full border border-[#E5DAD0] bg-[#FAF6EE] hover:bg-[#F5EFE6] text-[#211A19] text-xs font-bold transition-all shadow-2xs flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <div className="flex items-center space-x-2 truncate min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#C8A878] shrink-0" />
                    <span className="truncate font-extrabold text-[#211A19]">
                      {currentSocietyId === 'all'
                        ? 'All Societies (Show All Vendors)'
                        : (society?.society_name || 'Selected Society')}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#211A19] group-hover:text-[#541D26] transition-transform duration-200 shrink-0 ${isSocietyDropdownOpen ? 'rotate-180 text-[#541D26]' : ''}`} />
                </button>

                {isSocietyDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-full sm:w-80 md:w-96 bg-white border border-[#E5DAD0] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                    <div className="p-2.5 border-b border-[#E5DAD0] bg-[#FAF6EE]">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={societyFilterSearch}
                          onChange={(e) => setSocietyFilterSearch(e.target.value)}
                          placeholder="Search society, area, sector..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5DAD0] bg-white text-xs font-semibold text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]/20"
                        />
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
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
                          <span>All Societies (Show All Vendors)</span>
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
                          const subtitle = getDetailedLocationSubtitle(soc);
                          return (
                            <button
                              type="button"
                              key={soc.society_id}
                              onClick={() => {
                                setCurrentSocietyId(soc.society_id);
                                setRoute({ page: 'societyVendors', societyId: soc.society_id });
                                setIsSocietyDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${isSelected ? 'bg-[#541D26] text-white font-bold shadow-xs' : 'hover:bg-[#FAF6EE] text-[#211A19]'}`}
                            >
                              <div className="flex items-start space-x-2.5 min-w-0">
                                {soc.is_area ? (
                                  <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#C8A878]' : 'text-amber-600'}`} />
                                ) : (
                                  <Building2 className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#C8A878]' : 'text-emerald-700'}`} />
                                )}
                                <div className="min-w-0">
                                  <span className="block truncate font-bold text-xs">{soc.society_name}</span>
                                  {subtitle && (
                                    <span className={`block truncate text-[10.5px] mt-0.5 font-medium ${isSelected ? 'text-[#D6B7A5]' : 'text-muted-foreground'}`}>
                                      {subtitle}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-[#C8A878] shrink-0 mt-0.5" />}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vendors Bento Grid Container */}
      <div className="max-w-7xl mx-auto">

        {/* STREAMLINED UNIFIED CONTROL TOOLBAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 mb-4 bg-card border border-border rounded-2xl p-2.5 sm:p-3 shadow-2xs">
          
          {/* Category Classification Tabs */}
          <div className="flex items-center space-x-1 bg-[#FAF6EE] p-1 rounded-xl border border-[#E5DAD0] overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => { setVendorTypeTab('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                vendorTypeTab === 'all'
                  ? 'bg-[#541D26] text-white shadow-2xs'
                  : 'text-[#211A19] hover:bg-[#EEE5DA]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>All Merchants ({sortedVendors.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setVendorTypeTab('products'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                vendorTypeTab === 'products'
                  ? 'bg-[#541D26] text-white shadow-2xs'
                  : 'text-[#211A19] hover:bg-[#EEE5DA]'
              }`}
            >
              <span>🛍️ Products ({productVendorsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => { setVendorTypeTab('services'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                vendorTypeTab === 'services'
                  ? 'bg-[#541D26] text-white shadow-2xs'
                  : 'text-[#211A19] hover:bg-[#EEE5DA]'
              }`}
            >
              <span>🛠️ Services ({serviceVendorsCount})</span>
            </button>
          </div>

          {/* Search Bar & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 lg:max-w-xl justify-end">
            <div className="relative w-full sm:w-60 md:w-64">
              <Search className="w-3.5 h-3.5 text-[#541D26] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendor or store..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-border bg-[#F7F4EE] text-xs font-semibold text-[#211A19] placeholder:text-[#211A19]/50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#541D26]/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#211A19]/60 hover:text-[#541D26]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="relative shrink-0 w-full sm:w-auto" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-border bg-[#F7F4EE] hover:bg-white text-ink text-xs font-bold transition-all shadow-2xs flex items-center justify-between gap-1.5 cursor-pointer group"
              >
                <span className="truncate">
                  {sortBy === 'rating_high' ? '⭐ Highest Rated' : '⭐ Lowest Rated'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-ink transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180 text-[#541D26]' : ''}`} />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-[#E4DCC9] rounded-xl shadow-2xl z-50 overflow-hidden p-1 space-y-0.5 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => { setSortBy('rating_high'); setIsSortDropdownOpen(false); }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${sortBy === 'rating_high' ? 'bg-[#541D26] text-white shadow-xs' : 'hover:bg-[#EEE5DA] text-[#211A19]'}`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>Highest Rated</span>
                    </div>
                    {sortBy === 'rating_high' && <Check className="w-3 h-3 text-[#C8A878]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSortBy('rating_low'); setIsSortDropdownOpen(false); }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${sortBy === 'rating_low' ? 'bg-[#541D26] text-white shadow-xs' : 'hover:bg-[#EEE5DA] text-[#211A19]'}`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span>Lowest Rated</span>
                    </div>
                    {sortBy === 'rating_low' && <Check className="w-3 h-3 text-[#C8A878]" />}
                  </button>
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
                className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-black transition-colors shrink-0 cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <VendorCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && filteredVendors.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-3xl p-6 max-w-md mx-auto shadow-xs my-4">
            <Store className="w-10 h-10 text-[#C4A066] mx-auto mb-3" />
            <h3 className="text-base font-serif font-black text-ink mb-1">
              {vendorTypeTab === 'products' ? 'No Product Vendors Found' : vendorTypeTab === 'services' ? 'No Service Providers Found' : 'No Vendors Found'}
            </h3>
            <p className="text-muted-foreground text-xs mb-5 font-medium">
              There are currently no {vendorTypeTab === 'products' ? 'product stores' : vendorTypeTab === 'services' ? 'service providers' : 'active vendors'} listed {society ? `in ${society.society_name}` : 'for your search'}.
            </p>
            <button
              onClick={() => setRoute({ page: 'vendorRegister', societyId: currentSocietyId, societyName: society?.society_name })}
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md tracking-wider uppercase cursor-pointer"
            >
              Register your Store Here
            </button>
          </div>
        )}

        {!loading && filteredVendors.length > 0 && (() => {
          const totalPages = Math.ceil(filteredVendors.length / VENDORS_PER_PAGE);
          const paginatedVendors = filteredVendors.slice((currentPage - 1) * VENDORS_PER_PAGE, currentPage * VENDORS_PER_PAGE);

          return (
            <>
              <div id="vendors-grid-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                {paginatedVendors.map((vendor) => {
                  const isService = isServiceVendor(vendor);
                  const storeImage = getCategoryCoverImage(vendor);
                  const status = getStoreStatus(
                    vendor.opening_timing || vendor.opening_time || '08:00 AM',
                    vendor.closing_timing || vendor.closing_time || '10:00 PM',
                    vendor
                  );

                  return (
                    <div
                      key={vendor.vendor_id}
                      onClick={() => {
                        if (!isLoggedIn) {
                          setSelectedVendorForPrompt(vendor);
                          setShowLoginPromptModal(true);
                          return;
                        }
                        setRoute({ page: 'vendorStorefront', societyId: vendor.society_id || currentSocietyId || 1, vendorId: vendor.vendor_id });
                      }}
                      className="group rounded-2xl bg-white border border-[#E5DAD0] hover:border-[#541D26]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between relative shadow-xs h-full w-full"
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          {/* 1. Cover Image Header (Slim & Modern h-28 sm:h-32) */}
                          <div className="h-28 sm:h-32 w-full relative bg-[#211A19] overflow-hidden shrink-0">
                            {storeImage ? (
                              <img
                                src={storeImage}
                                alt={vendor.store_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#211A19] via-[#3B151C] to-[#541D26] p-3 flex flex-col items-center justify-center text-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-[#C8A878] text-lg font-serif font-black flex items-center justify-center shadow-md mb-0.5">
                                  {(vendor.store_name || 'V').charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[8.5px] font-bold text-[#D6B7A5] uppercase tracking-widest">
                                  {isService ? '🛠️ Service Provider' : '🛍️ Product Store'}
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />

                            {/* Top Badges Overlay */}
                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5 z-10">
                              <div className="flex items-center gap-1 max-w-[65%] truncate">
                                {isService ? (
                                  <span className="px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-200 border border-purple-400/40 text-[8.5px] font-black backdrop-blur-md shadow-xs shrink-0">
                                    🛠️ Service
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-200 border border-emerald-400/40 text-[8.5px] font-black backdrop-blur-md shadow-xs shrink-0">
                                    🛍️ Product
                                  </span>
                                )}
                                <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-[9px] font-bold text-white shadow-xs truncate">
                                  <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                  <span className="truncate">{vendor.coverage_badge || vendor.location || vendor.society_name || 'Local Area'}</span>
                                </span>
                              </div>

                              <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold flex items-center space-x-1 backdrop-blur-md shadow-xs border uppercase shrink-0 ${!status.isOpen
                                  ? 'bg-rose-950/85 text-rose-300 border-rose-500/50'
                                  : status.closingCountdown
                                    ? 'bg-amber-950/85 text-amber-300 border-amber-500/50'
                                    : 'bg-emerald-950/85 text-emerald-300 border-emerald-500/50'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${!status.isOpen ? 'bg-rose-400' : status.closingCountdown ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                                <span>{status.statusText}</span>
                              </span>
                            </div>
                          </div>

                          {/* 2. Store Info Body (Clean, Proportional Typography) */}
                          <div className="p-3 space-y-1.5">
                            {/* Title & Verified Badge */}
                            <div>
                              <div className="flex items-center justify-between gap-1.5">
                                <h3 className="font-serif font-black text-sm sm:text-base text-[#211A19] group-hover:text-[#541D26] transition-colors leading-tight truncate">
                                  {vendor.store_name}
                                </h3>
                                <div className="flex items-center space-x-1 shrink-0">
                                  <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[8.5px] font-extrabold">
                                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />
                                    <span>{getVendorRating(vendor, liveRatingsMap) > 0 ? getVendorRating(vendor, liveRatingsMap).toFixed(1) : 'New'}</span>
                                  </span>
                                  <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[8.5px] font-extrabold">
                                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                    <span>Verified</span>
                                  </span>
                                </div>
                              </div>
                              <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                                By {vendor.vendor_name || 'Vendor Merchant'} • <span className="text-[#541D26] font-semibold">{vendor.category || (isService ? 'Services' : 'Essentials')}</span>
                              </p>
                            </div>

                            {/* Location & Time Info Bar */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-[#F0E6DD] text-[10.5px]">
                              {isLoggedIn ? (
                                <span className="flex items-center space-x-1 font-bold text-[#211A19]">
                                  <Phone className="w-2.5 h-2.5 text-[#541D26] shrink-0" />
                                  <span className="truncate">{vendor.phone_number || 'Contact Available'}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md text-[9.5px] font-bold">
                                  <Lock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                  <span>Login for contact</span>
                                </span>
                              )}

                              {(vendor.opening_time || vendor.opening_timing) && (
                                <span className="flex items-center space-x-1 text-[10px] text-muted-foreground font-semibold shrink-0">
                                  <Clock className="w-2.5 h-2.5 text-[#541D26] shrink-0" />
                                  <span>{vendor.opening_time || vendor.opening_timing} - {vendor.closing_time || vendor.closing_timing}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3. Action CTA Button */}
                        <div className="p-3 pt-0">
                          {!status.isOpen && status.nextOpenText ? (
                            <div className="w-full py-1.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-800 text-[10.5px] font-bold flex items-center justify-center space-x-1">
                              <Clock className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>CLOSED • OPENS {vendor.opening_time || '08:00 AM'}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="w-full py-2 px-3 rounded-xl bg-[#541D26] text-white group-hover:bg-[#6B2732] transition-all duration-200 flex items-center justify-between font-extrabold text-[11px] shadow-2xs group-hover:shadow-xs uppercase tracking-wider cursor-pointer"
                            >
                              <div className="flex items-center space-x-1.5">
                                <ShoppingCart className="w-3.5 h-3.5 text-[#C8A878] group-hover:text-white transition-colors" />
                                <span>Explore Storefront</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#C8A878] group-hover:translate-x-0.5 transition-transform" />
                            </button>
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

      {/* LOGIN REQUIRED POPUP MODAL (PORTALED DIRECTLY TO BODY FOR VIEWPORT CENTERING) */}
      {showLoginPromptModal && !isLoggedIn && createPortal(
        <div 
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-sans overflow-y-auto"
          onClick={() => {
            setShowLoginPromptModal(false);
            setSelectedVendorForPrompt(null);
          }}
        >
          <div 
            className="relative w-full max-w-md bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-[#E8E2D5] text-center space-y-4 my-auto shrink-0 max-h-[90vh] overflow-y-auto pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Close Button */}
            <button
              onClick={() => {
                setShowLoginPromptModal(false);
                setSelectedVendorForPrompt(null);
              }}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFE6] text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer border border-[#E8E2D5]"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Center Gold Building Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFFBF0] border border-[#F5E6C4] flex items-center justify-center mx-auto text-[#C4A066] shadow-xs">
              <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#C4A066]" />
            </div>

            {/* Pill Badge & Title */}
            <div className="space-y-1.5">
              <span className="inline-block px-3.5 py-0.5 rounded-full bg-[#FFF5E5] text-[#C47D14] border border-[#FFE3B5] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest">
                LOGIN REQUIRED
              </span>

              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#202622] leading-snug">
                {selectedVendorForPrompt?.store_name ? `Log In to Open ${selectedVendorForPrompt.store_name}` : 'Log In to Access Community Storefronts'}
              </h2>
              <p className="text-xs text-muted-foreground pt-1 font-medium leading-relaxed max-w-sm mx-auto">
                Please log in to your account to view verified local stores, browse product catalogs, and place orders in your residential area.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setRoute({
                  page: 'login',
                  accountType: 'resident',
                  redirectSocietyId: currentSocietyId,
                  redirectVendorId: selectedVendorForPrompt?.vendor_id
                })}
                className="w-full sm:w-1/2 py-3 px-4 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs shadow-md tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-white" />
                <span>LOG IN NOW</span>
              </button>

              <button
                onClick={() => setRoute({ page: 'register' })}
                className="w-full sm:w-1/2 py-3 px-4 rounded-full bg-transparent border border-[#541D26] text-[#541D26] hover:bg-[#541D26] hover:text-white font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center cursor-pointer"
              >
                <span>REGISTER</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
