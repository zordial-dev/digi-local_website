import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  Store, 
  ArrowLeft, 
  LogOut, 
  LogIn, 
  Building2, 
  BookOpen, 
  HelpCircle, 
  ArrowUpRight, 
  User, 
  MapPin, 
  ChevronDown, 
  Check, 
  Plus, 
  Edit3, 
  ShoppingCart, 
  Menu, 
  X,
  Sparkles,
  ShieldCheck,
  Lock,
  FileText,
  Headphones,
  RefreshCw,
  ShoppingBag,
  Wrench,
  HeartHandshake,
  ShieldAlert,
  Scale,
  Compass,
  ExternalLink,
  Layers
} from 'lucide-react';
import DeliveryAddressModal from '../modals/DeliveryAddressModal';
import AnimatedIcon from '../common/AnimatedIcon';
import { api } from '../../services/api';

export default function Navbar({ currentRoute, setRoute, activeVendor, onVendorLogout, activeUser, onUserLogout, onOpenLogin, onOpenSupportDesk }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const resourcesRef = useRef(null);
  const resourcesTimeoutRef = useRef(null);

  const handleResourcesMouseEnter = () => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
      resourcesTimeoutRef.current = null;
    }
    setIsResourcesOpen(true);
  };

  const handleResourcesMouseLeave = () => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
    }
    resourcesTimeoutRef.current = setTimeout(() => {
      setIsResourcesOpen(false);
    }, 60);
  };

  // Top Scroll Progress Bar (Mobbin Style)
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Close resources mega-menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target)) {
        setIsResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (resourcesTimeoutRef.current) clearTimeout(resourcesTimeoutRef.current);
    };
  }, []);

  // Body scroll lock & Escape listener for mobile drawer
  useEffect(() => {
    if (isMobileMenuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setIsMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isMobileMenuOpen]);

  // Active Cart State (Persisted Across All Pages)
  const [activeCart, setActiveCart] = useState(null);

  useEffect(() => {
    const updateCartState = () => {
      try {
        const storedStr = localStorage.getItem('digilocal_active_cart');
        if (storedStr) {
          const parsed = JSON.parse(storedStr);
          if (parsed && parsed.vendor && Array.isArray(parsed.items) && parsed.items.length > 0) {
            setActiveCart(parsed);
            return;
          }
        }
        setActiveCart(null);
      } catch (_) {
        setActiveCart(null);
      }
    };

    updateCartState();
    window.addEventListener('digilocal_cart_updated', updateCartState);
    return () => window.removeEventListener('digilocal_cart_updated', updateCartState);
  }, []);
  
  // Delivery Address & Dropdown State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const dropdownRef = useRef(null);

  const isHomePage = currentRoute?.page === 'home';
  const isDashboardOrAdmin = currentRoute?.page === 'vendorDashboard' || currentRoute?.page === 'admin';
  const isProfilePage = currentRoute?.page === 'profile';

  // Load saved addresses strictly scoped to logged-in user or active session
  const loadSavedAddresses = () => {
    try {
      // 1. Check if a resident user is logged in
      let loggedUser = activeUser;
      if (!loggedUser) {
        const uSession = localStorage.getItem('digilocal_user_session');
        if (uSession) {
          const parsedU = JSON.parse(uSession);
          if (parsedU && (parsedU.user || parsedU.name) && (!parsedU.expiresAt || parsedU.expiresAt > Date.now())) {
            loggedUser = parsedU.user || parsedU;
          }
        }
      }

      if (loggedUser) {
        const userPhoneKey = String(loggedUser.phone || loggedUser.mobile || loggedUser.user_id || loggedUser.id || '').replace(/\D/g, '');
        const userScopedStr = userPhoneKey ? localStorage.getItem(`digilocal_saved_addresses_${userPhoneKey}`) : null;
        const globalStr = localStorage.getItem('digilocal_saved_addresses');
        const targetStr = userScopedStr || globalStr;
        
        if (targetStr) {
          const parsed = JSON.parse(targetStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAddresses(parsed);
            return;
          }
        }

        if (loggedUser.society_name || loggedUser.society || loggedUser.area || loggedUser.flat) {
          const rawSoc = String(loggedUser.society_name || loggedUser.society || loggedUser.area || '').replace(/^undefined$/, '').replace(/^null$/, '');
          const rawFlat = String(loggedUser.flat || '').replace(/^undefined$/, '').replace(/^null$/, '');
          if (rawSoc || rawFlat) {
            const registeredAddr = [{
              id: 'registered_profile',
              label: loggedUser.label || loggedUser.address_type || 'Home',
              society: rawSoc,
              flat: rawFlat,
              city: loggedUser.city || '',
              pincode: loggedUser.pincode || '',
              address: loggedUser.address || `${rawFlat}${rawFlat && rawSoc ? ', ' : ''}${rawSoc}`,
              isDefault: true
            }];
            setSavedAddresses(registeredAddr);
            return;
          }
        }
      }

      // 2. If logged out, do not show stale previous user addresses
      setSavedAddresses([]);
    } catch (_) {
      setSavedAddresses([]);
    }
  };

  useEffect(() => {
    loadSavedAddresses();

    let uId = activeUser?.user_id || activeUser?.id || activeUser?.phone;
    if (!uId) {
      try {
        const uSession = localStorage.getItem('digilocal_user_session');
        if (uSession) {
          const parsed = JSON.parse(uSession);
          uId = parsed?.user?.user_id || parsed?.user?.phone || parsed?.phone;
        }
      } catch (_) {}
    }

    if (uId) {
      api.checkUserStatus(uId).then(statusRes => {
        const freshUser = statusRes?.user || statusRes;
        if (freshUser && (freshUser.society_name || freshUser.area || freshUser.flat || freshUser.pincode)) {
          const userPhoneKey = String(freshUser.phone || freshUser.user_id || '').replace(/\D/g, '');
          const savedStr = userPhoneKey ? localStorage.getItem(`digilocal_saved_addresses_${userPhoneKey}`) : localStorage.getItem('digilocal_saved_addresses');
          let currentList = [];
          if (savedStr) {
            try { currentList = JSON.parse(savedStr); } catch (_) {}
          }
          const defaultLabel = freshUser.label || freshUser.address_type || currentList[0]?.label || 'Home';
          const rawSoc = String(freshUser.society_name || freshUser.society || freshUser.area || '').replace(/^undefined$/, '').replace(/^null$/, '');
          const rawFlat = String(freshUser.flat || '').replace(/^undefined$/, '').replace(/^null$/, '');
          const freshAddr = {
            id: currentList[0]?.id || 'registered_profile',
            label: defaultLabel,
            society: rawSoc,
            flat: rawFlat,
            city: freshUser.city || '',
            pincode: freshUser.pincode || '',
            address: freshUser.address || `${rawFlat}${rawFlat && rawSoc ? ', ' : ''}${rawSoc}`,
            isDefault: true
          };
          const updatedList = currentList.length > 0
            ? currentList.map((a, i) => i === 0 ? { ...a, ...freshAddr } : a)
            : [freshAddr];

          setSavedAddresses(updatedList);
          if (userPhoneKey) {
            localStorage.setItem(`digilocal_saved_addresses_${userPhoneKey}`, JSON.stringify(updatedList));
          }
          localStorage.setItem('digilocal_saved_addresses', JSON.stringify(updatedList));
        }
      }).catch(() => {});
    }

    const handleAddressesChanged = () => {
      loadSavedAddresses();
    };

    window.addEventListener('digilocal_saved_addresses_updated', handleAddressesChanged);
    window.addEventListener('digilocal_location_changed', handleAddressesChanged);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
      const scrollPos = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const nearFooter = scrollPos >= pageHeight - 380;
      setIsNearFooter(nearFooter);
      if (nearFooter) {
        setIsResourcesOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('digilocal_saved_addresses_updated', handleAddressesChanged);
      window.removeEventListener('digilocal_location_changed', handleAddressesChanged);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeUser]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setRoute({ page: 'home' });
    }
  };

  const handleSelectAddress = (targetAddr) => {
    try {
      const updatedList = savedAddresses.map(a => ({
        ...a,
        isDefault: a.id === targetAddr.id
      }));
      setSavedAddresses(updatedList);
      
      const userPhoneKey = String(activeUser?.phone || activeUser?.user_id || '').replace(/\D/g, '');
      if (userPhoneKey) {
        localStorage.setItem(`digilocal_saved_addresses_${userPhoneKey}`, JSON.stringify(updatedList));
      }
      localStorage.setItem('digilocal_saved_addresses', JSON.stringify(updatedList));

      const activeLocObj = {
        area: targetAddr.society || targetAddr.area || 'Residential Complex',
        city: targetAddr.city || '',
        state: targetAddr.state || '',
        pincode: targetAddr.pincode || '',
        address: targetAddr.address || `${targetAddr.flat}, ${targetAddr.society}`,
        society: targetAddr.society,
        flat: targetAddr.flat,
        name: targetAddr.society
      };
      localStorage.setItem('digilocal_user_location', JSON.stringify(activeLocObj));

      window.dispatchEvent(new CustomEvent('digilocal_location_changed', { detail: activeLocObj }));
    } catch (err) {
      console.error('Select address error:', err);
    }
    setIsLocationDropdownOpen(false);
  };

  const handleVendorButtonClick = () => {
    try {
      const savedSession = localStorage.getItem('digilocal_vendor_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.vendor && parsed.vendor.vendor_id && parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setRoute({ page: 'vendorDashboard', vendorId: parsed.vendor.vendor_id });
          return;
        }
      }
    } catch (_) { }

    if (activeVendor && activeVendor.vendor_id) {
      setRoute({ page: 'vendorDashboard', vendorId: activeVendor.vendor_id });
      return;
    }

    setRoute({ page: 'login', accountType: 'vendor' });
  };

  const handleHeaderUserLogout = () => {
    try {
      localStorage.removeItem('digilocal_user_session');
      localStorage.removeItem('digilocal_resident_session');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('resident_profile');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('digilocal_saved_addresses');
      localStorage.removeItem('digilocal_user_location');
      localStorage.removeItem('digilocal_active_order');
      localStorage.removeItem('digilocal_guest_address');
    } catch (_) { }

    setSavedAddresses([]);
    window.dispatchEvent(new CustomEvent('digilocal_saved_addresses_updated', { detail: [] }));
    window.dispatchEvent(new CustomEvent('digilocal_location_changed', { detail: null }));

    if (onUserLogout) onUserLogout();
    setRoute({ page: 'home' });
  };

  const handleHeaderVendorLogout = () => {
    try {
      localStorage.removeItem('digilocal_vendor_session');
      localStorage.removeItem('digilocal_vendor_token');
    } catch (_) { }

    if (onVendorLogout) onVendorLogout();
    setRoute({ page: 'home' });
  };

  const isVendorsActive = currentRoute?.page === 'societyVendors';
  const isOurStoryActive = currentRoute?.page === 'info' && currentRoute?.tab === 'about-us';
  const isHowItWorksActive = currentRoute?.page === 'info' && currentRoute?.tab === 'how-it-works';
  const isVendorPortalActive = currentRoute?.page === 'login' && currentRoute?.accountType === 'vendor';

  let currentUser = activeUser;
  let currentVendor = activeVendor;

  if (!currentVendor) {
    try {
      const savedVendor = localStorage.getItem('digilocal_vendor_session');
      if (savedVendor) {
        const parsedV = JSON.parse(savedVendor);
        if (parsedV && parsedV.vendor && (!parsedV.expiresAt || parsedV.expiresAt > Date.now())) {
          currentVendor = parsedV.vendor;
        }
      }
    } catch (_) { }
  }

  if (!currentUser) {
    try {
      const savedUser = localStorage.getItem('digilocal_user_session');
      if (savedUser) {
        const parsedU = JSON.parse(savedUser);
        if (parsedU && (parsedU.user || parsedU.name) && (!parsedU.expiresAt || parsedU.expiresAt > Date.now())) {
          currentUser = parsedU.user || parsedU;
        }
      }
    } catch (_) { }
  }

  if (currentUser && !currentUser.name) {
    currentUser = {
      ...currentUser,
      name: currentUser.phone ? `Resident ${currentUser.phone.slice(-4)}` : 'Resident'
    };
  }

  const defaultAddress = savedAddresses.find(a => a.isDefault) || savedAddresses[0];

  // Helper renderer for Location Pill & Dropdown
  const renderLocationPill = () => {
    const rawSoc = defaultAddress?.society || defaultAddress?.area || defaultAddress?.address || '';
    const cleanSoc = (rawSoc && rawSoc !== 'undefined' && rawSoc !== 'null') ? rawSoc : '';
    const rawFlat = defaultAddress?.flat || '';
    const cleanFlat = (rawFlat && rawFlat !== 'undefined' && rawFlat !== 'null') ? rawFlat : '';

    const label = cleanSoc
      ? `${cleanSoc}${cleanFlat ? ` • ${cleanFlat}` : ''}`
      : (cleanFlat ? `Flat ${cleanFlat}` : 'Delivery Address');

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
          className="bg-[#EEE5DA] hover:bg-[#D6B7A5]/60 text-[#211A19] px-2.5 sm:px-3.5 py-1.5 rounded-full flex items-center space-x-1 sm:space-x-1.5 text-xs font-bold transition-all border border-[#E5DAD0] shadow-xs shrink-0 cursor-pointer"
          title="Delivery Address"
        >
          <MapPin className="w-3.5 h-3.5 text-[#541D26] shrink-0" />
          <span className="truncate max-w-[90px] xs:max-w-[110px] sm:max-w-[150px]">
            {label}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-[#541D26] transition-transform duration-200 shrink-0 ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

      {/* Dropdown Menu for Saved Addresses */}
      {isLocationDropdownOpen && (
        <div className="absolute top-full right-0 sm:left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl p-3 shadow-2xl border border-[#E5DAD0] z-[99999] text-[#211A19] animate-in fade-in zoom-in-95 duration-150 font-sans">
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-[#E5DAD0]">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#541D26]">Delivery Location</span>
              <h4 className="text-xs font-serif font-bold text-[#211A19]">Select Delivery Flat</h4>
            </div>
            {savedAddresses.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#541D26]/10 text-[#541D26]">
                {savedAddresses.length} Saved
              </span>
            )}
          </div>

          {savedAddresses.length > 0 ? (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {savedAddresses.map((addr) => {
                const isSelected = defaultAddress?.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    className={`w-full p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 border ${
                      isSelected
                        ? 'bg-[#541D26]/10 border-[#541D26] text-[#541D26]'
                        : 'bg-white hover:bg-[#EEE5DA]/60 border-[#E5DAD0] text-[#211A19]'
                    }`}
                  >
                    <div 
                      onClick={() => handleSelectAddress(addr)}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-[#541D26]" />
                        <span className="truncate">{addr.label || 'Home'}</span>
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-[#541D26] text-white rounded-full uppercase">Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#211A19]/80 truncate font-semibold mt-0.5">{addr.flat}</p>
                      <p className="text-[10px] text-[#211A19]/60 truncate">{addr.society}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLocationDropdownOpen(false);
                          setEditingAddress(addr);
                          setShowAddressModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-black/5 hover:bg-[#541D26] text-[#541D26] hover:text-white transition-colors cursor-pointer"
                        title="Edit Address"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {isSelected && <Check className="w-4 h-4 text-[#541D26] shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-[#211A19]/70 space-y-1">
              <p className="font-semibold text-[#211A19]">No delivery addresses saved yet.</p>
              <p className="text-[11px] text-[#211A19]/60">Add your flat number & society location to order from local stores.</p>
            </div>
          )}

          <div className="pt-2 mt-2 border-t border-[#E5DAD0]">
            <button
              onClick={() => {
                setIsLocationDropdownOpen(false);
                setEditingAddress(null);
                setShowAddressModal(true);
              }}
              className="w-full py-2 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#C8A878]" />
              <span>Add New Address</span>
            </button>
          </div>
        </div>
      )}
    </div>
    );
  };

  const navToInfo = (tab) => {
    setIsResourcesOpen(false);
    setIsMobileMenuOpen(false);
    setRoute({ page: 'info', tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resources Mega Menu (Connexon Reference Style)
  const renderResourcesButton = (isMobile = false) => {
    const isInfoActive = currentRoute?.page === 'info';

    if (isMobile) {
      return (
        <div className="space-y-1">
          <button
            onClick={() => setIsResourcesOpen(!isResourcesOpen)}
            className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
              isInfoActive ? 'bg-[#541D26] text-white' : 'text-[#211A19] hover:bg-[#EEE5DA]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#C8A878]" />
              <span>Resources</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`} />
          </button>

          {isResourcesOpen && (
            <div className="pl-3 pr-2 py-2 space-y-1.5 bg-[#FAF8F5] rounded-xl border border-[#E5DAD0]">
              <button onClick={() => navToInfo('about-us')} className="w-full text-left py-1 text-xs font-semibold text-[#211A19] hover:text-[#541D26] flex items-center gap-2">
                <Scale className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Why DigiLocal / Our Story</span>
              </button>
              <button onClick={() => navToInfo('how-it-works')} className="w-full text-left py-1 text-xs font-semibold text-[#211A19] hover:text-[#541D26] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#541D26]" />
                <span>How It Works</span>
              </button>
              <button onClick={() => navToInfo('help-support')} className="w-full text-left py-1 text-xs font-semibold text-[#211A19] hover:text-[#541D26] flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Help & FAQs</span>
              </button>
              <button onClick={() => navToInfo('safety-standards')} className="w-full text-left py-1 text-xs font-semibold text-[#211A19] hover:text-[#541D26] flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Safety Standards</span>
              </button>
              <button onClick={() => navToInfo('privacy-policy')} className="w-full text-left py-1 text-xs font-semibold text-[#211A19] hover:text-[#541D26] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Privacy Policy</span>
              </button>
              <button onClick={() => navToInfo('terms-and-conditions')} className="w-full text-left py-1 text-xs font-semibold text-[#211A19] hover:text-[#541D26] flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#541D26]" />
                <span>Terms & Conditions</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        className="relative" 
        ref={resourcesRef}
        onMouseEnter={handleResourcesMouseEnter}
        onMouseLeave={handleResourcesMouseLeave}
      >
        <button
          onClick={() => setIsResourcesOpen(!isResourcesOpen)}
          className={`px-3 sm:px-3.5 py-1.5 rounded-full transition-colors duration-150 font-semibold text-xs tracking-wider uppercase cursor-pointer flex items-center space-x-1 ${
            isInfoActive
              ? 'bg-[#541D26] text-white font-bold shadow-xs'
              : isResourcesOpen
                ? 'text-[#541D26] bg-[#EEE5DA] font-semibold'
                : 'text-[#211A19]/80 hover:text-[#541D26] hover:bg-[#EEE5DA]'
          }`}
        >
          <span>Resources</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Clean 3-Column Resources Mega Menu Dropdown with Smooth AnimatePresence */}
        <AnimatePresence>
          {isResourcesOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 8, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ 
                opacity: 0, 
                y: 6, 
                scale: 0.985, 
                transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] } 
              }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full -left-28 sm:-left-44 md:-left-56 pt-2 w-[92vw] sm:w-[680px] md:w-[740px] max-w-4xl z-[99999]"
              onMouseEnter={handleResourcesMouseEnter}
              onMouseLeave={handleResourcesMouseLeave}
            >
              <div className="bg-[#FCFAF7] rounded-[1.75rem] p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(33,26,25,0.25),0_10px_25px_-5px_rgba(33,26,25,0.12)] border border-[#E5DAD0] text-[#211A19] font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {/* Column 1: PRODUCT & PLANS */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#541D26] block border-b border-[#E5DAD0] pb-1.5">
                      Product & Plans
                    </span>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => navToInfo('about-us')}
                        className="w-full text-left group/item flex items-start space-x-3 hover:bg-[#F3ECE4] p-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#541D26]/10 border border-[#541D26]/10 flex items-center justify-center shrink-0 text-[#541D26] group-hover/item:bg-[#541D26] group-hover/item:text-white group-hover/item:scale-105 transition-all duration-150">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#211A19] group-hover/item:text-[#541D26] transition-colors leading-tight">Why DigiLocal</h5>
                          <p className="text-[10.5px] text-[#78716C] leading-snug mt-0.5">Hyperlocal advantage & zero markups</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navToInfo('how-it-works')}
                        className="w-full text-left group/item flex items-start space-x-3 hover:bg-[#F3ECE4] p-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#541D26]/10 border border-[#541D26]/10 flex items-center justify-center shrink-0 text-[#541D26] group-hover/item:bg-[#541D26] group-hover/item:text-white group-hover/item:scale-105 transition-all duration-150">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#211A19] group-hover/item:text-[#541D26] transition-colors leading-tight">How It Works</h5>
                          <p className="text-[10.5px] text-[#78716C] leading-snug mt-0.5">3-Step express community ordering</p>
                        </div>
                      </button>

                      <button
                        onClick={() => { setIsResourcesOpen(false); setRoute({ page: 'vendorRegister' }); }}
                        className="w-full text-left group/item flex items-start space-x-3 hover:bg-[#F3ECE4] p-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#541D26]/10 border border-[#541D26]/10 flex items-center justify-center shrink-0 text-[#541D26] group-hover/item:bg-[#541D26] group-hover/item:text-white group-hover/item:scale-105 transition-all duration-150">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#211A19] group-hover/item:text-[#541D26] transition-colors leading-tight">Become a Vendor</h5>
                          <p className="text-[10.5px] text-[#78716C] leading-snug mt-0.5">Register store in under 2 mins</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Column 2: SOLUTIONS */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#541D26] block border-b border-[#E5DAD0] pb-1.5">
                      Solutions
                    </span>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => { setIsResourcesOpen(false); setRoute({ page: 'societyVendors', societyId: 'all' }); }}
                        className="w-full text-left group/item flex items-start space-x-3 hover:bg-[#F3ECE4] p-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#541D26]/10 border border-[#541D26]/10 flex items-center justify-center shrink-0 text-[#541D26] group-hover/item:bg-[#541D26] group-hover/item:text-white group-hover/item:scale-105 transition-all duration-150">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#211A19] group-hover/item:text-[#541D26] transition-colors leading-tight">Explore Stores</h5>
                          <p className="text-[10.5px] text-[#78716C] leading-snug mt-0.5">Discover neighborhood shops</p>
                        </div>
                      </button>

                      <a
                        href="https://zordial.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-left group/item flex items-start space-x-3 hover:bg-[#F3ECE4] p-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#541D26]/10 border border-[#541D26]/10 flex items-center justify-center shrink-0 text-[#541D26] group-hover/item:bg-[#541D26] group-hover/item:text-white group-hover/item:scale-105 transition-all duration-150">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#211A19] group-hover/item:text-[#541D26] transition-colors leading-tight flex items-center gap-1">
                            <span>Zordial Engine</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </h5>
                          <p className="text-[10.5px] text-[#78716C] leading-snug mt-0.5">Enterprise software architecture</p>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Column 3: TRUST & LEGAL */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#541D26] block border-b border-[#E5DAD0] pb-1.5">
                      Trust & Legal
                    </span>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => navToInfo('help-support')}
                        className="w-full text-left group/item flex items-start space-x-3 hover:bg-[#F3ECE4] p-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#541D26]/10 border border-[#541D26]/10 flex items-center justify-center shrink-0 text-[#541D26] group-hover/item:bg-[#541D26] group-hover/item:text-white group-hover/item:scale-105 transition-all duration-150">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#211A19] group-hover/item:text-[#541D26] transition-colors leading-tight">Help & FAQs</h5>
                          <p className="text-[10.5px] text-[#78716C] leading-snug mt-0.5">Answers to common questions</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navToInfo('safety-standards')}
                        className="w-full text-left group/item flex items-start space-x-3 hover:bg-[#F3ECE4] p-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#541D26]/10 border border-[#541D26]/10 flex items-center justify-center shrink-0 text-[#541D26] group-hover/item:bg-[#541D26] group-hover/item:text-white group-hover/item:scale-105 transition-all duration-150">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#211A19] group-hover/item:text-[#541D26] transition-colors leading-tight">Safety Standards</h5>
                          <p className="text-[10.5px] text-[#78716C] leading-snug mt-0.5">Verified hygiene & audits</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navToInfo('privacy-policy')}
                        className="w-full text-left group/item flex items-start space-x-3 hover:bg-[#F3ECE4] p-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#541D26]/10 border border-[#541D26]/10 flex items-center justify-center shrink-0 text-[#541D26] group-hover/item:bg-[#541D26] group-hover/item:text-white group-hover/item:scale-105 transition-all duration-150">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#211A19] group-hover/item:text-[#541D26] transition-colors leading-tight">Privacy Policy</h5>
                          <p className="text-[10.5px] text-[#78716C] leading-snug mt-0.5">How we handle resident data</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navToInfo('terms-and-conditions')}
                        className="w-full text-left group/item flex items-start space-x-3 hover:bg-[#F3ECE4] p-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#541D26]/10 border border-[#541D26]/10 flex items-center justify-center shrink-0 text-[#541D26] group-hover/item:bg-[#541D26] group-hover/item:text-white group-hover/item:scale-105 transition-all duration-150">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#211A19] group-hover/item:text-[#541D26] transition-colors leading-tight">Terms & Conditions</h5>
                          <p className="text-[10.5px] text-[#78716C] leading-snug mt-0.5">Official terms for platform use</p>
                        </div>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Top Floating Scroll Progress Indicator (Mobbin Style) */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#541D26] via-[#C8A878] to-[#541D26] origin-left z-[999999] pointer-events-none"
      />

      {/* Top Header Navbar */}
      <header className={`w-full ${isHomePage ? 'sticky top-0 z-50 pointer-events-none' : 'bg-[#F6F0E8] relative z-40'} text-[#211A19] pt-3 sm:pt-4 pb-2 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-300`}>
        {isHomePage ? (
          /* FLOATING HEADER BAR: Sleek thin glassmorphic warm cream pill bar */
          <div className={`w-full max-w-7xl mx-auto bg-white/95 backdrop-blur-xl rounded-[2rem] sm:rounded-full px-4 sm:px-6 py-1.5 sm:py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E5DAD0] relative transition-all duration-300 ${
            isNearFooter
              ? 'opacity-0 -translate-y-8 pointer-events-none scale-95'
              : 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          }`}>
            <div className="flex items-center justify-between min-h-[38px] sm:min-h-[40px] relative">
              
              {/* LEFT: Logo (#211A19 Espresso text) */}
              <div
                className="flex items-center space-x-2 cursor-pointer select-none group shrink-0 py-0.5"
                onClick={() => setRoute({ page: 'home' })}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-all bg-[#F6F0E8] rounded-lg p-0.5 shadow-xs border border-[#E5DAD0]">
                  <img
                    src="/logo.png"
                    alt="DigiLocal Logo"
                    className="w-full h-full object-contain scale-[1.9]"
                  />
                </div>
                <span className="font-serif italic text-xl sm:text-2xl font-black text-[#211A19] leading-none tracking-tight group-hover:opacity-80 transition-opacity">
                  DigiLocal
                </span>
              </div>

              {/* CENTER: Navigation Links (#211A19 Espresso default, #541D26 Oxblood active) */}
              <nav className="hidden lg:flex items-center space-x-2 sm:space-x-3 text-xs font-semibold my-auto py-0.5">
                <button
                  onClick={() => setRoute({ page: 'home' })}
                  className="px-3.5 sm:px-4 py-1.5 rounded-full bg-[#541D26] text-white font-bold shadow-xs text-xs tracking-wider uppercase cursor-pointer"
                >
                  Home
                </button>

                <button
                  onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
                  className="px-3 sm:px-3.5 py-1.5 rounded-full text-[#211A19]/80 hover:text-[#541D26] hover:bg-[#EEE5DA] transition-all duration-200 font-semibold text-xs tracking-wider uppercase cursor-pointer"
                >
                  Vendors
                </button>

                {/* Single Combined Resources Dropdown Button (Connexon Mega-Menu Style) */}
                {renderResourcesButton(false)}
              </nav>

              {/* RIGHT: Delivery Address Pill + Desktop Actions + Mobile Hamburger */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 my-auto py-0.5 z-10 shrink-0">
                
                {/* Header Delivery Address Pill */}
                {renderLocationPill()}

                {/* DESKTOP ONLY ACTIONS (>= lg) */}
                <div className="hidden lg:flex items-center space-x-1.5 sm:space-x-2">
                  {currentVendor ? (
                    <button
                      onClick={() => setRoute({ page: 'vendorDashboard', vendorId: currentVendor.vendor_id })}
                      className="bg-[#541D26] hover:bg-[#6B2732] text-white px-3.5 sm:px-4 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <AnimatedIcon icon={Store} animation="pulse" size={13} className="text-white" />
                      <span className="truncate max-w-[90px] sm:max-w-[110px]">{currentVendor.store_name || 'My Store'}</span>
                    </button>
                  ) : currentUser ? (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setRoute({ page: 'profile' })}
                        className="bg-[#541D26] hover:bg-[#6B2732] text-white px-3.5 sm:px-4 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-black transition-all shadow-xs hover:scale-105 shrink-0"
                      >
                        <AnimatedIcon icon={User} animation="scale" size={14} className="text-white" />
                        <span className="truncate max-w-[90px] sm:max-w-[110px]">{currentUser.name || currentUser.userName || 'My Profile'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setRoute({ page: 'login', accountType: 'resident' })}
                        className="bg-transparent hover:bg-[#541D26] text-[#541D26] hover:text-white border border-[#541D26] px-3.5 sm:px-4 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        <AnimatedIcon icon={LogIn} animation="scale" size={14} />
                        <span>Log In</span>
                      </button>

                      <button
                        onClick={handleVendorButtonClick}
                        className="bg-[#541D26] hover:bg-[#6B2732] text-white px-3.5 sm:px-4 py-1.5 rounded-full flex items-center space-x-1 text-xs font-bold transition-all shadow-xs group shrink-0 cursor-pointer"
                      >
                        <AnimatedIcon icon={Store} animation="pulse" size={13} className="text-white" />
                        <span className="whitespace-nowrap">Vendor Portal</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Hamburger Toggle Button (Shown on < lg screens) */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 min-w-[38px] min-h-[38px] rounded-full bg-[#EEE5DA] text-[#541D26] hover:bg-[#D6B7A5] transition-colors border border-[#E5DAD0] cursor-pointer shrink-0 ml-0.5 flex items-center justify-center tap-target"
                  aria-label="Toggle Mobile Menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* OTHER PAGES HEADER: Floating Bar Header */
          <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md text-[#211A19] rounded-[2rem] sm:rounded-full p-2.5 sm:p-3 shadow-md mb-2 sm:mb-3 flex items-center justify-between border border-[#E5DAD0] relative">
            {/* Left: Back Button + Clean Logo Badge */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <button
                onClick={handleGoBack}
                className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full bg-[#EEE5DA] hover:bg-[#D6B7A5] text-[#211A19] flex items-center justify-center transition-all border border-[#E5DAD0] shadow-sm group shrink-0"
                title="Go Back"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4 text-[#211A19] group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div
                onClick={() => setRoute({ page: 'home' })}
                className="flex items-center space-x-2 sm:space-x-2.5 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 overflow-hidden bg-[#F6F0E8] rounded-full p-1 group-hover:scale-105 transition-transform border border-[#E5DAD0]">
                  <img
                    src="/logo.png"
                    alt="DigiLocal Logo"
                    className="w-full h-full object-contain scale-[1.8]"
                  />
                </div>
                <span className="font-serif italic text-lg sm:text-2xl font-bold text-[#211A19] leading-none tracking-tight">
                  DigiLocal
                </span>
              </div>
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium mx-auto">
              <button
                onClick={() => setRoute({ page: 'home' })}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all duration-200 ${isHomePage
                  ? 'bg-[#541D26] text-white font-bold shadow-sm'
                  : 'text-[#211A19]/80 hover:text-[#541D26] hover:bg-[#EEE5DA] font-medium'
                  }`}
              >
                Home
              </button>

              <button
                onClick={() => setRoute({ page: 'societyVendors', societyId: 'all' })}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all duration-200 ${isVendorsActive
                  ? 'bg-[#541D26] text-white font-bold shadow-sm'
                  : 'text-[#211A19]/80 hover:text-[#541D26] hover:bg-[#EEE5DA] font-medium'
                  }`}
              >
                Vendors
              </button>

              {/* Single Combined Resources Dropdown Button */}
              {renderResourcesButton(false)}
            </nav>

            {/* Right: Delivery Address Pill + Desktop Actions + Mobile Hamburger */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              
              {/* Header Delivery Address Pill */}
              {renderLocationPill()}

              {/* DESKTOP ONLY ACTIONS (>= lg) */}
              <div className="hidden lg:flex items-center space-x-1.5 sm:space-x-2">
                {currentVendor ? (
                  <button
                    onClick={() => setRoute({ page: 'vendorDashboard', vendorId: currentVendor.vendor_id })}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#E5DAD0] flex items-center space-x-1.5 text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 ${isDashboardOrAdmin
                      ? 'bg-[#541D26] text-white'
                      : 'bg-[#EEE5DA] text-[#211A19] hover:bg-[#541D26] hover:text-white'
                      }`}
                  >
                    <Store className={`w-3.5 h-3.5 shrink-0 ${isDashboardOrAdmin ? 'text-white' : 'text-[#541D26]'}`} />
                    <span className="truncate max-w-[110px]">{currentVendor.store_name || 'My Store'}</span>
                  </button>
                ) : currentUser ? (
                  <button
                    onClick={() => setRoute({ page: 'profile' })}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#E5DAD0] flex items-center space-x-1.5 text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 ${isProfilePage
                      ? 'bg-[#541D26] text-white'
                      : 'bg-[#541D26] text-white hover:bg-[#6B2732]'
                      }`}
                  >
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[110px]">{currentUser.name || currentUser.userName || 'Profile'}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setRoute({ page: 'login', accountType: 'resident' })}
                      className="bg-transparent hover:bg-[#541D26] text-[#541D26] hover:text-white border border-[#541D26] px-3 sm:px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <AnimatedIcon icon={LogIn} animation="scale" size={13} />
                      <span>Log In</span>
                    </button>

                    <button
                      onClick={handleVendorButtonClick}
                      className={`px-3 sm:px-3.5 py-1.5 rounded-full border border-[#E5DAD0] flex items-center space-x-1.5 text-xs font-semibold transition-all shadow-md group shrink-0 cursor-pointer ${isVendorPortalActive
                        ? 'bg-[#541D26] text-white font-bold'
                        : 'bg-[#541D26] hover:bg-[#6B2732] text-white'
                        }`}
                    >
                      <Store className="w-3.5 h-3.5 shrink-0 text-white" />
                      <span className="whitespace-nowrap hidden sm:inline">Vendor Portal</span>
                      <span className="font-bold text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ml-0.5 text-white">
                        ↗
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle for Non-Home Header */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 min-w-[38px] min-h-[38px] rounded-full bg-[#EEE5DA] text-[#541D26] hover:bg-[#D6B7A5] transition-colors border border-[#E5DAD0] cursor-pointer shrink-0 ml-0.5 flex items-center justify-center tap-target"
                aria-label="Toggle Mobile Menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* SIMPLE MINIMALIST MOBILE MENU DRAWER */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-[99999] bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="w-full max-w-[280px] sm:max-w-xs bg-white h-full shadow-2xl border-l border-[#E5DAD0] p-5 flex flex-col justify-between overflow-y-auto pointer-events-auto animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DAD0]">
                  <div 
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => { setRoute({ page: 'home' }); setIsMobileMenuOpen(false); }}
                  >
                    <div className="w-7 h-7 flex items-center justify-center bg-[#FAF8F5] rounded-md border border-[#E5DAD0] p-0.5">
                      <img src="/logo.png" alt="DigiLocal" className="w-full h-full object-contain scale-[1.7]" />
                    </div>
                    <span className="font-serif italic text-lg font-bold text-[#211A19]">DigiLocal</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-[#211A19]/70 hover:text-[#211A19] hover:bg-[#EEE5DA] cursor-pointer transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Primary Navigation Text Links */}
                <nav className="flex flex-col space-y-1 text-sm font-semibold text-[#211A19]">
                  <button
                    onClick={() => { setRoute({ page: 'home' }); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left py-2 px-3 rounded-lg hover:bg-[#EEE5DA]/60 transition-colors ${currentRoute?.page === 'home' ? 'text-[#541D26] font-bold bg-[#EEE5DA]/40' : ''}`}
                  >
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => { setRoute({ page: 'societyVendors', societyId: 'all' }); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left py-2 px-3 rounded-lg hover:bg-[#EEE5DA]/60 transition-colors ${isVendorsActive ? 'text-[#541D26] font-bold bg-[#EEE5DA]/40' : ''}`}
                  >
                    <span>Browse All Vendors</span>
                  </button>

                  <div className="my-1.5 border-t border-[#E5DAD0]" />

                  {/* Auth / Profile Links */}
                  {currentVendor ? (
                    <>
                      <button
                        onClick={() => { setRoute({ page: 'vendorDashboard', vendorId: currentVendor.vendor_id }); setIsMobileMenuOpen(false); }}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#EEE5DA]/60 transition-colors text-[#541D26] font-bold"
                      >
                        <span>Vendor Dashboard ({currentVendor.store_name || 'My Store'})</span>
                      </button>
                      <button
                        onClick={() => {
                          handleHeaderVendorLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                      >
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : currentUser ? (
                    <>
                      <button
                        onClick={() => { setRoute({ page: 'profile' }); setIsMobileMenuOpen(false); }}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#EEE5DA]/60 transition-colors text-[#541D26] font-bold"
                      >
                        <span>My Profile & Orders</span>
                      </button>
                      <button
                        onClick={() => {
                          handleHeaderUserLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                      >
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setRoute({ page: 'login', accountType: 'resident' }); setIsMobileMenuOpen(false); }}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#EEE5DA]/60 transition-colors"
                      >
                        <span>Log In</span>
                      </button>
                      <button
                        onClick={() => { setRoute({ page: 'register' }); setIsMobileMenuOpen(false); }}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#EEE5DA]/60 transition-colors"
                      >
                        <span>Create Account</span>
                      </button>
                      <button
                        onClick={() => { setRoute({ page: 'vendorRegister' }); setIsMobileMenuOpen(false); }}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#EEE5DA]/60 transition-colors text-[#541D26] font-bold"
                      >
                        <span>Register as Vendor</span>
                      </button>
                      <button
                        onClick={() => { setRoute({ page: 'login', accountType: 'vendor' }); setIsMobileMenuOpen(false); }}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#EEE5DA]/60 transition-colors text-[#211A19]/70"
                      >
                        <span>Vendor Portal Login</span>
                      </button>
                    </>
                  )}

                  <div className="my-1.5 border-t border-[#E5DAD0]" />

                  {/* Informational Pages Links */}
                  <button
                    onClick={() => navToInfo('how-it-works')}
                    className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-[#EEE5DA]/60 text-xs text-[#211A19]/80 font-medium transition-colors"
                  >
                    <span>How It Works</span>
                  </button>

                  <button
                    onClick={() => navToInfo('about-us')}
                    className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-[#EEE5DA]/60 text-xs text-[#211A19]/80 font-medium transition-colors"
                  >
                    <span>About DigiLocal</span>
                  </button>

                  <button
                    onClick={() => navToInfo('help-support')}
                    className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-[#EEE5DA]/60 text-xs text-[#211A19]/80 font-medium transition-colors"
                  >
                    <span>Help & FAQs</span>
                  </button>

                  <button
                    onClick={() => navToInfo('safety-standards')}
                    className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-[#EEE5DA]/60 text-xs text-[#211A19]/80 font-medium transition-colors"
                  >
                    <span>Safety Standards</span>
                  </button>

                  <button
                    onClick={() => navToInfo('privacy-policy')}
                    className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-[#EEE5DA]/60 text-xs text-[#211A19]/80 font-medium transition-colors"
                  >
                    <span>Privacy Policy</span>
                  </button>

                  <button
                    onClick={() => navToInfo('terms-and-conditions')}
                    className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-[#EEE5DA]/60 text-xs text-[#211A19]/80 font-medium transition-colors"
                  >
                    <span>Terms & Conditions</span>
                  </button>
                </nav>
              </div>

              {/* Bottom Support Link */}
              {typeof onOpenSupportDesk === 'function' && (
                <div className="pt-3 border-t border-[#E5DAD0]">
                  <button
                    onClick={() => {
                      onOpenSupportDesk();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-1.5 px-3 rounded-lg text-xs font-semibold text-[#541D26] hover:bg-[#EEE5DA]/60 transition-colors"
                  >
                    <span>Need Help? Contact Support</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Delivery Address Modal (Supports Add & Edit) */}
      <DeliveryAddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        addressToEdit={editingAddress}
        onAddressSaved={(savedAddr) => {
          loadSavedAddresses();
          setEditingAddress(null);
        }}
      />
    </>
  );
}
