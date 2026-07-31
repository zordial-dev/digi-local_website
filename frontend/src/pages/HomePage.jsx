import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Search, MapPin, Building2, Store, PlusCircle, AlertCircle, ArrowRight, X, CheckCircle2, ArrowUpRight, Play, Sparkles, ChevronRight, ShieldCheck, Heart, Coffee, Clock, Lock, Smartphone, ShoppingBag, Cookie, Milk, Headphones, Star, Truck, MessageCircle } from 'lucide-react';

export default function HomePage({ setRoute }) {
  const [societies, setSocieties] = useState([]);
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
      if (api.requestSociety) {
        await api.requestSociety({
          society_name: unlistedForm.societyName,
          address: unlistedForm.fullAddress,
          pincode: unlistedForm.pincode,
          total_flats: unlistedForm.totalFlats,
          rwa_contact_phone: unlistedForm.rwaPhone,
        });
      }
      setUnlistedFormSubmitted(true);
    } catch (err) {
      setUnlistedFormSubmitted(true);
    }
  };

  const resetUnlistedModal = () => {
    setIsUnlistedModalOpen(false);
    setUnlistedFormSubmitted(false);
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
    <div className="min-h-screen bg-background text-foreground pb-20 px-3 sm:px-6">
      
      {/* Top Bento Hero Section Container */}
      <div className="max-w-7xl mx-auto pt-4 pb-8">
        
        {/* Main Dark Forest Green Bento Hero Container */}
        <div className="bg-[#18281F] text-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-8 border border-[#E4DCC9]/20">
          
          {/* Background Local Store / Fresh Vegetable Photo Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80" 
              alt="Local Market" 
              className="w-full h-full object-cover object-right opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#18281F] via-[#18281F]/90 to-transparent" />
          </div>

          <div className="relative z-10">
            
            {/* Top Row: Pill Nav & Register Button */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md border border-white/15">
                  <Sparkles className="w-4 h-4 text-white fill-white" />
                </div>

                {/* Pill Tab Navigation Bar */}
                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-1 rounded-full flex items-center space-x-1 text-xs font-bold">
                  <button 
                    onClick={() => setSearch('')} 
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                      !search ? 'bg-[#F7F4EE] text-[#18281F] shadow-sm' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    All Vendors
                  </button>
                  <button 
                    onClick={() => setSearch('grocery')} 
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      search === 'grocery' ? 'bg-[#F7F4EE] text-[#18281F] shadow-sm' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Grocery
                  </button>
                  <button 
                    onClick={() => setSearch('dairy')} 
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all hidden sm:inline-block ${
                      search === 'dairy' ? 'bg-[#F7F4EE] text-[#18281F] shadow-sm' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Dairy & Milk
                  </button>
                  <button 
                    onClick={() => setSearch('bakery')} 
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all hidden sm:inline-block ${
                      search === 'bakery' ? 'bg-[#F7F4EE] text-[#18281F] shadow-sm' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Bakery
                  </button>
                  <button 
                    onClick={() => setSearch('pharmacy')} 
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all hidden md:inline-block ${
                      search === 'pharmacy' ? 'bg-[#F7F4EE] text-[#18281F] shadow-sm' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Pharmacy
                  </button>
                </div>
              </div>

              <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/90 font-medium flex items-center space-x-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-300">Direct WhatsApp Ordering</span>
              </div>
            </div>

            {/* Hero Main 2-Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
              
              {/* Left Sub-card Column (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Translucent Dark Inner Card */}
                <div className="bg-[#243A2D]/90 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      <img className="w-8 h-8 rounded-full border-2 border-[#243A2D] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                      <img className="w-8 h-8 rounded-full border-2 border-[#243A2D] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                      <img className="w-8 h-8 rounded-full border-2 border-[#243A2D] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                    </div>
                    <span className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[10px] flex items-center justify-center">
                      20K+
                    </span>
                  </div>

                  <div>
                    <h2 className="text-4xl sm:text-5xl font-serif font-black text-white tracking-tight">20K+</h2>
                    <p className="text-[10px] text-white/70 font-extrabold uppercase tracking-widest mt-1">
                      SOCIETY ORDERS DELIVERED
                    </p>
                  </div>

                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C4A066]" />
                    <span>Trusted by 100+ Societies</span>
                  </div>
                </div>

                {/* 3 Bottom Features underneath inner card */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  <div className="space-y-1.5">
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">Grocery</h4>
                    <p className="text-[9px] text-white/70 leading-tight">Fresh essentials for your home</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">Doorstep Delivery</h4>
                    <p className="text-[9px] text-white/70 leading-tight">On time, every time you trust</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">WhatsApp Orders</h4>
                    <p className="text-[9px] text-white/70 leading-tight">Easy to order, easy to track</p>
                  </div>
                </div>
              </div>

              {/* Right Content Column (7 Cols) */}
              <div className="lg:col-span-7 space-y-5 lg:pl-6">
                <div>
                  <span className="px-3.5 py-1 rounded-full bg-[#2A4435] text-[#C4A066] border border-[#C4A066]/30 text-[10px] font-bold tracking-wider inline-flex items-center gap-1 mb-4">
                    <span>Delivered in 10-15 Mins</span>
                    <span>⚡</span>
                  </span>

                  <h1 className="text-4xl sm:text-6xl font-serif font-normal text-white leading-[1.1] tracking-tight">
                    Local goodness, <br />
                    <span className="font-serif italic text-[#C4A066] font-normal">delivered</span> to your doorstep.
                  </h1>

                  <p className="text-xs sm:text-sm text-white/80 font-normal leading-relaxed max-w-md mt-4">
                    DigiLocal is a curated marketplace of vendors chosen from within your registered society — bakers, growers, florists and craftspeople, all a few doors away.
                  </p>
                </div>

                {/* CTA Action Buttons */}
                <div className="flex items-center space-x-4 pt-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById('societies-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3.5 rounded-full bg-white text-[#18281F] hover:bg-[#C4A066] font-bold text-xs transition-all shadow-lg flex items-center space-x-2 group"
                  >
                    <span>Discover Local Stores</span>
                    <ArrowUpRight className="w-4 h-4 text-[#18281F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('societies-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-white hover:text-[#C4A066] font-bold text-xs flex items-center space-x-2 transition-colors px-2 py-2"
                  >
                    <span>How It Works</span>
                    <Play className="w-4 h-4 fill-current text-white" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* 3-Column Bottom Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
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
                onClick={() => {
                  const el = document.getElementById('societies-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-ink hover:text-[#C4A066] transition-colors"
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

          {/* Card 3: Vertical Category Rows Stack */}
          <div className="lg:col-span-4 bg-card border border-border rounded-[2.5rem] p-6 sm:p-7 shadow-sm flex flex-col justify-between">
            <div className="space-y-3.5">
              
              {/* Row 1: Grocery & Staples */}
              <div 
                onClick={() => setSearch('grocery')}
                className="p-3.5 rounded-2xl bg-secondary/40 hover:bg-secondary border border-border/50 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#E8F2EA] text-[#1E3A29] border border-[#D2E4D5] flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-5 h-5 text-[#1E3A29]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-serif font-bold text-ink">Grocery & Staples</h4>
                    <p className="text-[10px] text-muted-foreground font-normal">Fresh essentials from neighbourhood stores.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Row 2: Bakery & Cafes */}
              <div 
                onClick={() => setSearch('bakery')}
                className="p-3.5 rounded-2xl bg-secondary/40 hover:bg-secondary border border-border/50 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#F9EFE2] text-[#8C6B38] border border-[#EEDFCD] flex items-center justify-center shadow-xs">
                    <Cookie className="w-5 h-5 text-[#8C6B38]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-serif font-bold text-ink">Bakery & Cafes</h4>
                    <p className="text-[10px] text-muted-foreground font-normal">Freshly baked & brewed, just for your society.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Row 3: Dairy & Beverages */}
              <div 
                onClick={() => setSearch('dairy')}
                className="p-3.5 rounded-2xl bg-secondary/40 hover:bg-secondary border border-border/50 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#EBF3F9] text-[#2C5282] border border-[#D5E4F1] flex items-center justify-center shadow-xs">
                    <Milk className="w-5 h-5 text-[#2C5282]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-serif font-bold text-ink">Dairy & Beverages</h4>
                    <p className="text-[10px] text-muted-foreground font-normal">Pure, safe & trusted essentials every day.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground group-hover:translate-x-1 transition-transform" />
              </div>

            </div>
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

      </div>

        {/* SEARCH SOCIETY AUTOCOMPLETE BAR SECTION */}
        <div className="mt-8 max-w-3xl mx-auto relative" ref={searchRef}>
          <div className="relative shadow-xl rounded-[2rem] bg-card border-2 border-border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
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
              className="w-full pl-14 pr-14 py-4 rounded-[2rem] bg-transparent text-ink placeholder-muted-foreground text-xs sm:text-sm font-semibold focus:outline-none"
            />

            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-ink bg-secondary rounded-full w-6 h-6 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            )}
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
                        setRoute({ page: 'societyVendors', societyId: soc.society_id });
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
                      setUnlistedForm((prev) => ({ ...prev, societyName: search }));
                      setIsUnlistedModalOpen(true);
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
            onClick={() => {
              setUnlistedForm((prev) => ({ ...prev, societyName: search }));
              setIsUnlistedModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all uppercase tracking-wider flex items-center space-x-2 shadow-sm self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-gold" />
            <span>Request Unlisted Society</span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-[2rem] bg-card border border-border animate-pulse shadow-sm" />
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
              onClick={() => {
                setUnlistedForm((prev) => ({ ...prev, societyName: search }));
                setIsUnlistedModalOpen(true);
              }}
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
                      src={soc.banner_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80'}
                      alt={soc.society_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Active Vendors Count Badge */}
                    <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-ink/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold flex items-center space-x-1.5">
                      <Store className="w-3.5 h-3.5 text-gold" />
                      <span>{soc.vendor_count || 0} Active Vendors</span>
                    </div>
                  </div>

                  {/* Society Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-extrabold text-ink uppercase tracking-wide group-hover:text-primary transition-colors">
                      {soc.society_name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center space-x-1.5 mt-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-gold" />
                      <span>{soc.location}</span>
                    </p>
                  </div>
                </div>

                {/* 2 CTA Buttons */}
                <div className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setRoute({ page: 'societyVendors', societyId: soc.society_id })}
                    className="w-full py-2.5 px-3 rounded-full bg-secondary text-ink hover:bg-border font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <span>Show Vendors</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold" />
                  </button>

                  <button
                    onClick={() => setRoute({ page: 'vendorRegister', societyId: soc.society_id, societyName: soc.society_name })}
                    className="w-full py-2.5 px-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
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

      {/* UNLISTED SOCIETY MODAL */}
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

    </div>
  );
}
