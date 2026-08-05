import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Search, MapPin, Building2, Store, PlusCircle, AlertCircle, ArrowRight, X, CheckCircle2, ArrowUpRight, Play, Sparkles, ChevronRight, ShieldCheck, Heart, Coffee, Clock, Lock, Smartphone, ShoppingBag, Cookie, Milk, Headphones, Star, Truck, MessageCircle, Filter, Zap, LogOut } from 'lucide-react';
import LiveOrderTrackerToast from '../components/LiveOrderTrackerToast';
import { SocietyCardSkeleton } from '../components/Skeletons';
import MaskedHeading from '../components/MaskedHeading';
import TextType from '../components/TextType';
import AccordionGallery from '../components/AccordionGallery';

export default function HomePage({ currentRoute, setRoute, onOpenLogin }) {
  const [societies, setSocieties] = useState([]);
  const [search, setSearch] = useState('');
  const [activeLocationFilter, setActiveLocationFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isResidentNoticeModalOpen, setIsResidentNoticeModalOpen] = useState(false);
  const [activeResidentUser, setActiveResidentUser] = useState(null);
  const [selectedTargetSociety, setSelectedTargetSociety] = useState(null);

  useEffect(() => {
    if (currentRoute?.openSocietyModal) {
      checkVendorAuthBeforeSocietyCreate();
    }
  }, [currentRoute]);

  const handleSocietySelect = (soc) => {
    const sId = soc.society_id || soc.id;
    const sName = soc.society_name || soc.name || 'Selected Society';

    sessionStorage.setItem('digilocal_pending_society_id', String(sId));
    sessionStorage.setItem('digilocal_pending_society_name', sName);
    setSelectedTargetSociety(soc);

    const savedUser = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session');
    const savedVendor = localStorage.getItem('digilocal_vendor_session');
    let isLoggedIn = false;
    try {
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const u = parsed.user || parsed;
        if (u && (u.user_id || u.email || u.name)) isLoggedIn = true;
      }
      if (savedVendor) {
        const parsedV = JSON.parse(savedVendor);
        const v = parsedV.vendor || parsedV;
        if (v && (v.vendor_id || v.email || v.vendor_name || v.store_name)) isLoggedIn = true;
      }
    } catch (_) {}

    if (isLoggedIn) {
      setRoute({ page: 'societyVendors', societyId: sId });
    } else {
      setIsLoginPromptOpen(true);
    }
  };

  const checkVendorAuthBeforeSocietyCreate = (prefillName = '') => {
    try {
      const savedVendor = localStorage.getItem('digilocal_vendor_session');
      if (savedVendor) {
        const parsed = JSON.parse(savedVendor);
        if (parsed && parsed.vendor && parsed.expiresAt > Date.now()) {
          if (prefillName) setUnlistedForm((prev) => ({ ...prev, societyName: prefillName }));
          setIsUnlistedModalOpen(true);
          return;
        }
      }

      const savedUser = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        const userObj = parsedUser.user || parsedUser;
        if (userObj && (userObj.user_id || userObj.name || userObj.email)) {
          setActiveResidentUser(userObj);
          setIsResidentNoticeModalOpen(true);
          return;
        }
      }
    } catch (_) { }
    setIsLoginPromptOpen(true);
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);

  // Hero Carousel Images State (Rotates every 3.5 seconds)
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000&auto=format&fit=crop&q=80",
      alt: "Fresh organic green vegetables & salads",
      tag: "Fresh Produce"
    },
    {
      url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80",
      alt: "Artisan fresh baked sourdough bread & pastries",
      tag: "Artisan Bakes"
    },
    {
      url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1000&auto=format&fit=crop&q=80",
      alt: "Fresh neighborhood snacks & bakes",
      tag: "Food Junction"
    },
    {
      url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1000&auto=format&fit=crop&q=80",
      alt: "Fresh organic farm fruits & berries",
      tag: "Farm Fresh"
    },
    {
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&auto=format&fit=crop&q=80",
      alt: "Specialty coffee & neighborhood bakery",
      tag: "Gourmet Coffee"
    }
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Unlisted Society Modal State
  const [isUnlistedModalOpen, setIsUnlistedModalOpen] = useState(false);
  const [unlistedForm, setUnlistedForm] = useState({
    societyName: '',
    fullAddress: '',
    pincode: '',
    totalFlats: '',
    rwaPhone: '',
  });
  const [unlistedFormSubmitted, setUnlistedFormSubmitted] = useState(false);
  const [unlistedError, setUnlistedError] = useState('');

  const searchRef = useRef(null);

  useEffect(() => {
    fetchSocieties(search);
  }, [search]);

  // Load active order from storage for live order tracking widget
  useEffect(() => {
    try {
      const saved = localStorage.getItem('digilocal_active_order');
      if (saved) {
        setActiveOrder(JSON.parse(saved));
      }
    } catch (_) { }
  }, []);

  // Keyboard shortcut listener ('/' focuses search box)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const inputEl = document.getElementById('search-input-box');
        if (inputEl) inputEl.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Outside Click for Autocomplete Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSocieties = async (queryStr = '') => {
    try {
      setLoading(true);
      const data = await api.getSocieties(queryStr);
      setSocieties(data);
      setError('');
    } catch (err) {
      setError('Could not connect to DigiLocal backend server');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlistedSubmit = async (e) => {
    e.preventDefault();
    if (
      !unlistedForm.societyName.trim() ||
      !unlistedForm.fullAddress.trim() ||
      !unlistedForm.pincode.trim() ||
      !unlistedForm.totalFlats.trim() ||
      !unlistedForm.rwaPhone.trim()
    ) {
      setUnlistedError('Please complete all required fields before submitting.');
      return;
    }

    try {
      setUnlistedError('');
      let token = '';
      try {
        const session = localStorage.getItem('digilocal_vendor_session');
        if (session) {
          const parsed = JSON.parse(session);
          token = parsed.token || parsed.accessToken || parsed.vendor?.token || '';
        }
      } catch (_) { }

      await api.createSociety({
        society_name: unlistedForm.societyName,
        location: unlistedForm.fullAddress,
        pincode: unlistedForm.pincode,
        total_flats: unlistedForm.totalFlats,
        rwa_phone: unlistedForm.rwaPhone
      }, token);

      setUnlistedFormSubmitted(true);
      fetchSocieties(search);
    } catch (err) {
      console.warn('Society request note:', err);
      setUnlistedFormSubmitted(true);
      fetchSocieties(search);
    }
  };

  const resetUnlistedModal = () => {
    setIsUnlistedModalOpen(false);
    setUnlistedFormSubmitted(false);
    fetchSocieties(search);
    setUnlistedForm({
      societyName: '',
      fullAddress: '',
      pincode: '',
      totalFlats: '',
      rwaPhone: '',
    });
    setUnlistedError('');
  };

  return (
    <div className="w-full bg-[#EDEDE4] text-foreground pb-12 px-1.5 sm:px-3 lg:px-4 font-sans -mt-px">

      {/* Outer Dark Green Bento Container wrapping Hero section */}
      <div className="max-w-[1440px] mx-auto bg-[#34533C] text-white rounded-b-[2.5rem] sm:rounded-b-[2.8rem] lg:rounded-b-[3rem] px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 mb-10 shadow-md">

        {/* Main Off-White Hero Section Container (Merged with Logo Tab) */}
        <div className="bg-[#EDEDE4] text-[#1E3623] rounded-tl-none rounded-tr-[2rem] sm:rounded-tr-[2.4rem] lg:rounded-tr-[2.6rem] rounded-b-[2rem] sm:rounded-b-[2.4rem] lg:rounded-b-[2.6rem] pt-6 sm:pt-8 pb-8 sm:pb-10 px-6 sm:px-10 lg:px-12 relative overflow-hidden shadow-xs">


          {/* Main 2-Column Hero Grid shifted slightly inner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center max-w-[1360px] mx-auto">

            {/* Left Column - Hero Copy & Action Buttons */}
            <div className="lg:col-span-6 space-y-6">

              {/* Delivery Time Badge */}
              <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-white/80 border border-[#1E3623]/10 text-[#1E3623] text-xs font-bold shadow-sm">
                <span>Delivered in 10–15 Mins</span>
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              </div>

              {/* Headline with MaskedHeading Reveal Effect */}
              <div className="my-2">
                <MaskedHeading
                  text="Your Society. Your Vendors. Delivered."
                  tag="h1"
                  mediaType="image"
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=80"
                  fillScale={1.3}
                  parallax={28}
                  drift={14}
                  reveal="wipe"
                  trigger="view"
                  align="left"
                  weight={700}
                  tracking={-0.03}
                  lineHeight={1.1}
                  textScale={0.085}
                  className="font-serif text-[#1E3623]"
                />
              </div>

              {/* Sub-headline Description & Rotating Stamp Row (Elevated & Positioned Right) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <p className="text-xs sm:text-sm text-[#4A5D4E] font-normal leading-relaxed max-w-sm sm:max-w-md">
                  DigiLocal is a curated marketplace of vendors chosen from within your registered society — bakers, growers, florists and craftspeople, all a few doors away.
                </p>

                {/* Stamp Graphic: TRUSTED BY HOUSING SOCIETIES (Positioned Right & Nudged Down Slightly) */}
                <div className="flex items-center justify-center relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 text-[#1E3623] select-none shrink-0 sm:ml-auto mt-1 sm:mt-2">
                  <svg className="w-full h-full animate-spin-slow origin-center" viewBox="0 0 100 100">
                    <path id="stampCircle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                    <text className="text-[6.2px] font-extrabold tracking-[0.16em] fill-[#1E3623] uppercase">
                      <textPath href="#stampCircle">
                        • TRUSTED BY HOUSING SOCIETIES • DIGILOCAL MARKETPLACE 
                      </textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-black text-[#1E3623] text-center">
                    <span className="text-lg sm:text-xl font-black tracking-tight leading-none">100+</span>
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#2E4A35] mt-0.5">Societies</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
                <button
                  onClick={() => {
                    const el = document.getElementById('societies-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#0D1910] hover:bg-black text-white px-6 sm:px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-md transition-all group"
                >
                  <span>Discover Local Stores</span>
                  <span className="text-[#E6C35C] font-bold text-sm sm:text-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    ↗
                  </span>
                </button>

                <button
                  onClick={() => setRoute({ page: 'info', tab: 'how-it-works' })}
                  className="text-[#1E3623] hover:text-black text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-colors px-2 py-2"
                >
                  <span>How It Works</span>
                  <Play className="w-3 h-3 text-[#1E3623] fill-[#1E3623] shrink-0" />
                </button>
              </div>

            </div>

            {/* Right Column - Accordion Gallery of 5 Hyperlocal Photos */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-[2.2rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl border border-[#1E3623]/10 bg-[#18281F]">
                <AccordionGallery
                  items={[
                    {
                      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000&auto=format&fit=crop&q=80",
                      label: "Fresh Produce",
                      alt: "Fresh organic green vegetables & salads"
                    },
                    {
                      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80",
                      label: "Artisan Bakes",
                      alt: "Artisan fresh baked sourdough bread & pastries"
                    },
                    {
                      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1000&auto=format&fit=crop&q=80",
                      label: "Food Junction",
                      alt: "Fresh neighborhood snacks & bakes"
                    },
                    {
                      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1000&auto=format&fit=crop&q=80",
                      label: "Farm Fresh",
                      alt: "Fresh organic farm fruits & berries"
                    },
                    {
                      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&auto=format&fit=crop&q=80",
                      label: "Gourmet Coffee",
                      alt: "Specialty coffee & neighborhood bakery"
                    }
                  ]}
                  defaultIndex={1}
                  expandRatio={0.48}
                  height={410}
                  gap={8}
                  radius={20}
                  accentColor="#E6C35C"
                  overlayColor="#18281F"
                  textColor="#ffffff"
                  trigger="hover"
                  grayscale={false}
                  showLabels={true}
                />
              </div>
            </div>

          </div>

        </div>

      </div>


      {/* 3-Column Bottom Bento Grid */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

        {/* Card 1: Verified Stores */}
        <div className="lg:col-span-4 bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
          <div className="relative z-10 pr-24 sm:pr-28">
            <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-foreground mb-4">
              <Store className="w-6 h-6 text-foreground" />
            </div>

            <span className="text-[10px] font-bold text-[#C4A066] tracking-widest block mb-1">
              Hyperlocal
            </span>

            <h2 className="text-2xl font-serif font-bold text-ink">
              Verified Stores
            </h2>

            <p className="text-xs text-muted-foreground font-normal mt-1 mb-6 leading-relaxed">
              Explore trusted local vendors in your gated community.
            </p>

            <button
              onClick={() => {
                const el = document.getElementById('societies-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-ink hover:text-[#C4A066] transition-colors"
            >
              <span>Explore Stores</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Fresh Produce Basket Graphic Cutout */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 absolute bottom-4 right-4 opacity-90 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80"
              alt="Basket"
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
            />
          </div>
        </div>

        {/* Card 2: Quick Delivery */}
        <div className="lg:col-span-4 bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
          <div className="relative z-10 pr-24 sm:pr-28">
            <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-foreground mb-4">
              <Clock className="w-6 h-6 text-foreground" />
            </div>

            <span className="text-[10px] font-bold text-[#C4A066] tracking-widest block mb-1">
              Fast & Reliable
            </span>

            <h2 className="text-2xl font-serif font-bold text-ink">
              Quick Delivery
            </h2>

            <p className="text-xs text-muted-foreground font-normal mt-1 mb-6 leading-relaxed">
              Get your daily essentials delivered in just 10-15 mins.
            </p>

            <button
              onClick={() => setRoute({ page: 'info', tab: 'how-it-works' })}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-ink hover:text-[#C4A066] transition-colors cursor-pointer"
            >
              <span>How It Works</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grocery Bag & Clock Graphic Cutout */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 absolute bottom-4 right-4 opacity-90 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&auto=format&fit=crop&q=80"
              alt="Grocery Bag"
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
            />
          </div>
        </div>

        {/* Card 3: Registered Housing Societies */}
        <div className="lg:col-span-4 bg-card border border-border rounded-[2.5rem] p-6 sm:p-7 shadow-sm flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-foreground">
                <Building2 className="w-6 h-6 text-foreground" />
              </div>
              <span className="px-3 py-1 text-[10px] font-black bg-[#18281F] text-white rounded-full uppercase tracking-wider shadow-xs">
                6+ SOCIETIES
              </span>
            </div>

            <span className="text-[10px] font-bold text-[#C4A066] tracking-widest uppercase block mb-0.5">
              Gated Communities
            </span>

            <h2 className="text-xl font-serif font-black text-ink uppercase tracking-tight mb-3">
              REGISTERED HOUSING SOCIETIES
            </h2>

            {/* Society Thumbnails Row */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {societies.slice(0, 4).map((soc) => (
                <div
                  key={soc.society_id}
                  onClick={() => setRoute({ page: 'societyVendors', societyId: soc.society_id })}
                  className="group/soc cursor-pointer"
                >
                  <div className="h-16 rounded-xl overflow-hidden bg-secondary border border-border relative mb-1">
                    <img
                      src={soc.image_url || soc.banner_image}
                      alt={soc.society_name}
                      className="w-full h-full object-cover group-hover/soc:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-1 left-1 px-1 py-0.5 text-[8px] font-extrabold bg-[#18281F]/80 text-[#C4A066] rounded">
                      {soc.society_id}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-ink truncate leading-tight">
                    {soc.society_name.split(' ')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('societies-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-ink hover:text-[#C4A066] transition-colors pt-3"
          >
            <span>View All Societies</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Bottom Trust Badges Bar */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-3 border-r border-border/50 pr-4 last:border-none">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground flex-shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-foreground" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-ink">Verified Vendors</h5>
            <p className="text-[10px] text-muted-foreground font-normal">100% Verified & Reliable</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 border-r border-border/50 pr-4 last:border-none">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground flex-shrink-0">
            <Lock className="w-4.5 h-4.5 text-foreground" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-ink">Safe Payments</h5>
            <p className="text-[10px] text-muted-foreground font-normal">Secure & Hassle-free</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 border-r border-border/50 pr-4 last:border-none">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground flex-shrink-0">
            <Headphones className="w-4.5 h-4.5 text-foreground" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-ink">24/7 Support</h5>
            <p className="text-[10px] text-muted-foreground font-normal">We're here to help</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground flex-shrink-0">
            <Star className="w-4.5 h-4.5 text-foreground" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-ink">Best Quality</h5>
            <p className="text-[10px] text-muted-foreground font-normal">Quality you can trust</p>
          </div>
        </div>
      </div>

      {/* SEARCH SOCIETY AUTOCOMPLETE BAR SECTION */}
      <div className="mt-8 max-w-3xl mx-auto relative" ref={searchRef}>
        <div className="relative shadow-sm rounded-[2rem] bg-card border-2 border-border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />

          <input
            id="search-input-box"
            type="text"
            placeholder="Search by society name, pincode or store (e.g. Greenwood, 201301, FreshMart)..."
            value={search}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsDropdownOpen(true);
            }}
            className="w-full pl-14 pr-24 py-4 rounded-[2rem] bg-transparent text-ink placeholder-muted-foreground text-xs sm:text-sm font-semibold focus:outline-none"
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="text-xs font-bold text-muted-foreground hover:text-ink bg-secondary rounded-full w-6 h-6 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-md border border-border">
                Press /
              </span>
            )}
          </div>
        </div>

        {/* Location Quick Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto py-3 px-1 scrollbar-none text-xs font-bold">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-extrabold flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gold" /> Filter:
          </span>
          {['All', 'Noida', 'Greater Noida', 'Bengaluru', 'Gurugram'].map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setActiveLocationFilter(loc);
                setSearch(loc === 'All' ? '' : loc);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-1.5 ${activeLocationFilter === loc || (loc === 'All' && !search)
                ? 'bg-[#14261C] text-white border-[#14261C] shadow-sm'
                : 'bg-card text-muted-foreground hover:text-ink border-border'
                }`}
            >
              {loc === 'All' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                  <span>All Complexes</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20 shrink-0" />
                  <span>{loc}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Dropdown Autocomplete Results */}
        {isDropdownOpen && search.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-card rounded-[1.75rem] shadow-2xl border border-border z-50 overflow-hidden max-h-80 overflow-y-auto text-left">
            {societies.length > 0 ? (
              <div className="py-2">
                <div className="px-5 py-2 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider bg-secondary/50 border-b border-border/50">
                  Matching Societies ({societies.length})
                </div>

                {societies.map((soc) => (
                  <div
                    key={soc.society_id}
                    onClick={() => {
                      handleSocietySelect(soc);
                      setIsDropdownOpen(false);
                    }}
                    className="px-5 py-3.5 hover:bg-secondary cursor-pointer transition-colors border-b border-border/40 last:border-none flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink group-hover:text-primary transition-colors">
                          {soc.society_name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gold" />
                          <span>{soc.location}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {soc.vendor_count || 0} Vendors
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* Dropdown Empty State */
              <div className="p-6 text-center bg-card">
                <AlertCircle className="w-8 h-8 text-gold mx-auto mb-2" />
                <h4 className="text-xs font-bold text-ink">No Registered Societies Match "{search}"</h4>
                <p className="text-[11px] text-muted-foreground mt-1 mb-4">
                  Can't find your residential society in our database? Request onboarding below.
                </p>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    checkVendorAuthBeforeSocietyCreate(search);
                  }}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-full transition-colors uppercase tracking-wider shadow-sm"
                >
                  Onboard Unlisted Society
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN CONTENT: SOCIETIES GRID SECTION */}
      <div id="societies-section" className="max-w-7xl mx-auto mt-10">

        {/* Section Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-6 rounded-[2rem] shadow-sm">
          <div>
            <div className="flex items-center space-x-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-gold" />
              <span>Gated Communities</span>
            </div>
            <h2 className="text-2xl font-serif font-black text-ink uppercase tracking-tight">
              Registered Housing Societies
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Select a society portal or register your store as an approved vendor</p>
          </div>

          <button
            onClick={() => checkVendorAuthBeforeSocietyCreate(search)}
            className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all uppercase tracking-wider flex items-center space-x-2 shadow-sm self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-gold" />
            <span>Request Unlisted Society</span>
          </button>
        </div>

        {/* Skeleton Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SocietyCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-center font-medium text-xs">
            {error}
          </div>
        )}

        {/* Unlisted Fallback Banner when search yields no results */}
        {!loading && societies.length === 0 && (
          <div className="bg-card border-2 border-dashed border-border rounded-[2.5rem] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm my-8">
            <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gold" />
            </div>

            <h3 className="text-xl font-serif font-extrabold text-ink uppercase tracking-wide">
              Society Not Listed?
            </h3>
            <p className="text-xs text-muted-foreground mt-2 mb-6 font-medium max-w-md mx-auto">
              We couldn't find any registered societies matching "{search}". Request onboarding for your gated community now to enable resident shopping and vendor registrations.
            </p>

            <button
              onClick={() => checkVendorAuthBeforeSocietyCreate(search)}
              className="px-6 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs uppercase tracking-widest transition-colors shadow-md flex items-center justify-center space-x-2 mx-auto"
            >
              <PlusCircle className="w-4 h-4 text-gold" />
              <span>Request to Add Your Society</span>
            </button>
          </div>
        )}

        {/* Societies Bento Grid */}
        {!loading && societies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {societies.map((soc) => (
              <div
                key={soc.society_id}
                className="bg-card rounded-[2rem] border border-border hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between group bento-card"
              >
                <div>
                  {/* Banner Image */}
                  <div className="h-48 w-full relative overflow-hidden bg-secondary">
                    <img
                      src={soc.image_url || soc.banner_image || 'https://static.squareyards.com/resources/images/noida/project-image/omaxe-greenwood-project-project-large-image1-2275.jpg'}
                      alt={soc.society_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Unique Society ID Badge */}
                    <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold flex items-center space-x-1 shadow-sm">
                      <Building2 className="w-3 h-3 text-gold" />
                      <span>{soc.society_id}</span>
                    </div>

                    {/* Active Vendors Count Badge */}
                    <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-ink/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold flex items-center space-x-1.5">
                      <Store className="w-3.5 h-3.5 text-gold" />
                      <span>{soc.vendor_count || 0} Active Vendors</span>
                    </div>
                  </div>

                  {/* Society Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-xl font-serif font-extrabold text-ink uppercase tracking-wide group-hover:text-primary transition-colors">
                        {soc.society_name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center space-x-1.5 mt-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-gold shrink-0" />
                      <span>{soc.location}</span>
                    </p>
                  </div>
                </div>

                {/* 2 CTA Buttons */}
                <div className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleSocietySelect(soc)}
                    className="w-full py-2.5 px-3 rounded-full bg-secondary text-ink hover:bg-border font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Show Vendors</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold" />
                  </button>

                  <button
                    onClick={() => setRoute({ page: 'vendorRegister', societyId: soc.society_id, societyName: soc.society_name, allowNewStore: true })}
                    className="w-full py-2.5 px-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5 text-gold" />
                    <span>Become Vendor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* VENDOR & USER LOGIN REQUIRED PROMPT MODAL */}
      {isLoginPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-center">
            <button
              onClick={() => setIsLoginPromptOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-600">
              <Building2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-500/20">
                Login Required
              </span>
              <h3 className="text-xl font-serif font-black text-ink mt-2">
                {selectedTargetSociety ? `Explore ${selectedTargetSociety.society_name}` : 'Log In to Access Society Portal'}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">
                {selectedTargetSociety
                  ? `Please log in to your account to view approved local stores, products, and daily essentials for ${selectedTargetSociety.society_name}.`
                  : 'Please log in to your account to access residential society portals and vendor stores.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setIsLoginPromptOpen(false);
                  const targetId = selectedTargetSociety?.society_id || sessionStorage.getItem('digilocal_pending_society_id');
                  setRoute({ page: 'login', tab: 'user', redirectSocietyId: targetId });
                }}
                className="flex-1 py-3 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 rotate-180" />
                <span>Log In Now</span>
              </button>
              <button
                onClick={() => {
                  setIsLoginPromptOpen(false);
                  const targetId = selectedTargetSociety?.society_id || sessionStorage.getItem('digilocal_pending_society_id');
                  setRoute({ page: 'register', redirectSocietyId: targetId });
                }}
                className="flex-1 py-3 px-4 rounded-full bg-secondary hover:bg-border text-ink font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESIDENT USER PRIVILEGE NOTICE MODAL */}
      {isResidentNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-center">
            <button
              onClick={() => setIsResidentNoticeModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-[#18281F]/10 border border-[#18281F]/20 flex items-center justify-center mx-auto text-[#18281F]">
              <Building2 className="w-8 h-8 text-emerald-800" />
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-500/20">
                Resident User Account
              </span>
              <h3 className="text-xl font-serif font-black text-ink mt-2">Explore Society Vendors</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">
                You are currently logged in as a <strong>Resident User</strong>. As a resident, you can explore societies, browse catalogs, and order from local vendors. Society onboarding and store registrations are reserved for Vendor accounts.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setIsResidentNoticeModalOpen(false);
                  const targetSocId = activeResidentUser?.society_id || activeResidentUser?.societyId || 1;
                  setRoute({ page: 'societyVendors', societyId: targetSocId });
                }}
                className="flex-1 py-3 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Store className="w-4 h-4 text-[#E6C35C]" />
                <span>Explore Vendors</span>
              </button>
              <button
                onClick={() => {
                  setIsResidentNoticeModalOpen(false);
                  setRoute({ page: 'login', tab: 'vendor' });
                }}
                className="flex-1 py-3 px-4 rounded-full bg-secondary hover:bg-border text-ink font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Vendor Account
              </button>
            </div>
          </div>
        </div>
      )}
      {isUnlistedModalOpen && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card rounded-[2.5rem] max-w-lg w-full shadow-2xl border border-border overflow-hidden relative">

            {/* Modal Header */}
            <div className="bg-primary text-primary-foreground p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-foreground/20 border border-primary-foreground/30 flex items-center justify-center text-gold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-extrabold uppercase tracking-wider">
                    Request Society Onboarding
                  </h3>
                  <p className="text-[11px] text-gold">Register an unlisted gated community</p>
                </div>
              </div>
              <button
                onClick={resetUnlistedModal}
                className="p-1.5 rounded-full text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {unlistedFormSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif font-extrabold text-ink uppercase">
                      Request Submitted Successfully!
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our DigiLocal admin team will verify <strong>{unlistedForm.societyName}</strong> with RWA contacts within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={resetUnlistedModal}
                    className="w-full py-3.5 bg-primary text-primary-foreground font-bold text-xs rounded-full hover:bg-primary/90 transition-colors uppercase tracking-wider shadow-sm"
                  >
                    Done & Return to Homepage
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUnlistedSubmit} className="space-y-4">
                  {unlistedError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold rounded-2xl">
                      {unlistedError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                      Society / Colony Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahagun Modern"
                      value={unlistedForm.societyName}
                      onChange={(e) => setUnlistedForm({ ...unlistedForm, societyName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-border text-xs font-medium focus:ring-2 focus:ring-primary bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                      Full Address & Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sector 78, Expressway"
                      value={unlistedForm.fullAddress}
                      onChange={(e) => setUnlistedForm({ ...unlistedForm, fullAddress: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-border text-xs font-medium focus:ring-2 focus:ring-primary bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="201301"
                        value={unlistedForm.pincode}
                        onChange={(e) => setUnlistedForm({ ...unlistedForm, pincode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl border border-border text-xs font-medium focus:ring-2 focus:ring-primary bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                        Total Flats *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 450"
                        value={unlistedForm.totalFlats}
                        onChange={(e) => setUnlistedForm({ ...unlistedForm, totalFlats: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl border border-border text-xs font-medium focus:ring-2 focus:ring-primary bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                      RWA / Facility Manager Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit phone number"
                      value={unlistedForm.rwaPhone}
                      onChange={(e) => setUnlistedForm({ ...unlistedForm, rwaPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-border text-xs font-medium focus:ring-2 focus:ring-primary bg-background"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs rounded-full uppercase tracking-wider transition-colors shadow-md mt-2"
                  >
                    Submit Society Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Order Tracker Floating Widget */}
      <LiveOrderTrackerToast
        activeOrder={activeOrder}
        onClose={() => setActiveOrder(null)}
      />

    </div>
  );
}
