'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, Store, ArrowRight, PlusCircle, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { api, getSocietyImage } from '../services/api';

interface Society {
  id: string;
  name: string;
  pincode: string;
  location: string;
  bannerImage: string;
  activeVendorsCount: number;
}

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allSocieties, setAllSocieties] = useState<Society[]>([]);
  const [filteredSocieties, setFilteredSocieties] = useState<Society[]>([]);
  const [isUnlistedModalOpen, setIsUnlistedModalOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load societies from API
  useEffect(() => {
    const loadSocietiesData = async () => {
      try {
        const rawList = await api.getSocieties();
        if (Array.isArray(rawList)) {
          const mapped: Society[] = rawList.map(s => ({
            id: String(s.society_id || s.id || ''),
            name: s.society_name || s.name || '',
            pincode: s.pincode || '',
            location: s.location || `${s.city || ''}, ${s.state || ''}`,
            bannerImage: s.banner_image || s.image || getSocietyImage(s),
            activeVendorsCount: Number(s.active_vendors_count || s.vendor_count || 0)
          }));
          setAllSocieties(mapped);
          setFilteredSocieties(mapped);
        }
      } catch (_) {}
    };
    loadSocietiesData();
  }, []);

  // Unlisted Society Form State
  const [unlistedForm, setUnlistedForm] = useState({
    societyName: '',
    fullAddress: '',
    pincode: '',
    totalFlats: '',
    rwaPhone: '',
  });
  const [unlistedFormSubmitted, setUnlistedFormSubmitted] = useState(false);
  const [unlistedError, setUnlistedError] = useState('');

  // Handle Search Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSocieties(allSocieties);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const results = allSocieties.filter(
        (soc) =>
          soc.name.toLowerCase().includes(query) ||
          soc.pincode.includes(query) ||
          soc.location.toLowerCase().includes(query)
      );
      setFilteredSocieties(results);
    }
  }, [searchQuery, allSocieties]);

  // Click Outside Handler for Autocomplete Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigateToSociety = (societyId: string) => {
    window.location.href = `/society/${societyId}`;
  };

  const handleNavigateToVendorRegister = (societyId: string, societyName: string) => {
    const encodedName = encodeURIComponent(societyName);
    window.location.href = `/vendor/register?societyId=${societyId}&societyName=${encodedName}`;
  };

  const handleUnlistedSubmit = (e: React.FormEvent) => {
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
    setUnlistedError('');
    setUnlistedFormSubmitted(true);
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
    <div className="min-h-screen bg-[#F6F0E8] text-[#211A19] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E5DAD0] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => (window.location.href = '/')}>
            <div className="w-10 h-10 rounded-xl bg-[#541D26] border border-[#C8A878]/40 flex items-center justify-center text-[#C8A878] font-bold text-lg">
              DL
            </div>
            <div>
              <span className="font-serif font-extrabold text-lg text-[#211A19] tracking-wider uppercase block leading-none">
                DigiLocal
              </span>
              <span className="text-[10px] text-[#C8A878] font-semibold uppercase tracking-widest">
                Society Marketplace
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setUnlistedForm((prev) => ({ ...prev, societyName: searchQuery }));
              setIsUnlistedModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs transition-colors uppercase tracking-wider flex items-center space-x-1.5 shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#C8A878]" />
            <span>Request Unlisted Society</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-[#E5DAD0] py-12 sm:py-16 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="px-3.5 py-1.5 text-xs font-extrabold bg-[#EEE5DA] text-[#211A19] border border-[#E5DAD0] rounded-full inline-block mb-4 uppercase tracking-wider">
            Verified Residential Marketplace
          </span>

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-[#211A19] tracking-tight leading-tight uppercase">
            Find Local Services in <br />
            <span className="text-[#541D26]">Your Housing Society</span>
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-[#211A19]/60 max-w-xl mx-auto font-medium">
            Connect directly with verified resident vendors, groceries, pharmacies, and daily services inside your gated community.
          </p>

          {/* Interactive Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto relative" ref={searchContainerRef}>
            <div className="relative shadow-sm rounded-2xl bg-white border border-[#E5DAD0] focus-within:border-[#541D26] focus-within:ring-4 focus-within:ring-[#541D26]/10 transition-all">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C8A878]" />

              <input
                type="text"
                placeholder="Search by Society Name or Pincode (e.g. Greenwood, 201301, Noida)..."
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-transparent text-[#211A19] placeholder-[#211A19]/50 text-sm font-medium focus:outline-none"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#211A19]/50 hover:text-[#211A19] bg-[#EEE5DA] rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown List */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#E5DAD0] z-50 overflow-hidden max-h-80 overflow-y-auto text-left">
                {filteredSocieties.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-1.5 text-[11px] font-extrabold text-[#211A19]/60 uppercase tracking-wider bg-[#FAF8F5]">
                      Available Registered Societies
                    </div>

                    {filteredSocieties.map((society) => (
                      <div
                        key={society.id}
                        onClick={() => {
                          handleNavigateToSociety(society.id);
                          setIsDropdownOpen(false);
                        }}
                        className="px-4 py-3 hover:bg-[#FAF8F5] cursor-pointer transition-colors border-b border-[#E5DAD0]/50 last:border-none flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E5DAD0] flex items-center justify-center text-[#C8A878] group-hover:bg-[#541D26] group-hover:text-white transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#211A19] group-hover:text-[#541D26] transition-colors">
                              {society.name}
                            </h4>
                            <p className="text-[11px] text-[#211A19]/60 flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-[#C8A878]" />
                              <span>{society.location}</span>
                              <span className="font-semibold text-[#211A19]/50">• Pincode {society.pincode}</span>
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#541D26]/10 text-[#541D26] border border-[#541D26]/20">
                          {society.activeVendorsCount} Vendors
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Dropdown Empty State */
                  <div className="p-6 text-center bg-[#FAF8F5]">
                    <AlertCircle className="w-8 h-8 text-[#C8A878] mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-[#211A19]">No Registered Societies Match "{searchQuery}"</h4>
                    <p className="text-[11px] text-[#211A19]/60 mt-1 mb-3">
                      Can't find your residential society in our database? Request onboarding below.
                    </p>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setUnlistedForm((prev) => ({ ...prev, societyName: searchQuery }));
                        setIsUnlistedModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs rounded-xl transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Onboard Unlisted Society
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content: Society Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#211A19] uppercase tracking-wider flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#C8A878]" />
              <span>Registered Societies</span>
            </h2>
            <p className="text-xs text-[#211A19]/60 mt-0.5 font-medium">
              Browse society portals or register as an approved vendor
            </p>
          </div>

          <span className="text-xs font-bold text-[#211A19]/60">
            Showing {filteredSocieties.length} Societies
          </span>
        </div>

        {/* Societies Grid */}
        {filteredSocieties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSocieties.map((society) => (
              <div
                key={society.id}
                className="bg-white rounded-2xl border border-[#E5DAD0] hover:border-[#541D26]/40 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Image */}
                  <div className="h-44 w-full relative overflow-hidden bg-[#EEE5DA]">
                    <img
                      src={society.bannerImage}
                      alt={society.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#541D26]/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold flex items-center space-x-1">
                      <Store className="w-3 h-3 text-[#C8A878]" />
                      <span>{society.activeVendorsCount} Active Vendors</span>
                    </div>
                  </div>

                  {/* Society Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-serif font-extrabold text-[#211A19] uppercase tracking-wide group-hover:text-[#541D26] transition-colors">
                      {society.name}
                    </h3>
                    <p className="text-xs text-[#211A19]/60 flex items-center space-x-1 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#C8A878]" />
                      <span>{society.location}</span>
                      <span className="font-bold text-[#211A19]/50">• {society.pincode}</span>
                    </p>
                  </div>
                </div>

                {/* 2 CTA Buttons */}
                <div className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavigateToSociety(society.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E5DAD0] text-[#211A19] hover:bg-[#EEE5DA] font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Show Vendors</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C8A878]" />
                  </button>

                  <button
                    onClick={() => handleNavigateToVendorRegister(society.id, society.name)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center space-x-1 shadow-sm cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5 text-[#C8A878]" />
                    <span>Become Vendor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Unlisted Fallback Banner when search yields no results */
          <div className="bg-white border-2 border-dashed border-[#E5DAD0] rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm my-8">
            <div className="w-14 h-14 rounded-2xl bg-[#EEE5DA] border border-[#E5DAD0] flex items-center justify-center text-[#541D26] mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-serif font-extrabold text-[#211A19] uppercase tracking-wide">
              Society Not Listed?
            </h3>
            <p className="text-xs text-[#211A19]/60 mt-2 mb-6 font-medium max-w-md mx-auto">
              We couldn't find any registered societies matching "{searchQuery}". Request onboarding for your gated community now to enable resident shopping and vendor registrations.
            </p>

            <button
              onClick={() => {
                setUnlistedForm((prev) => ({ ...prev, societyName: searchQuery }));
                setIsUnlistedModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center space-x-2 mx-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#C8A878]" />
              <span>Request to Add Your Society</span>
            </button>
          </div>
        )}
      </main>

      {/* Unlisted Society Modal */}
      {isUnlistedModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E5DAD0] overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="bg-[#541D26] text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-[#C8A878]/30 flex items-center justify-center text-[#C8A878]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-extrabold uppercase tracking-wider">
                    Request Society Onboarding
                  </h3>
                  <p className="text-[11px] text-[#C8A878]">Register an unlisted gated community</p>
                </div>
              </div>
              <button
                onClick={resetUnlistedModal}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {unlistedFormSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif font-extrabold text-[#211A19] uppercase">
                      Request Submitted Successfully!
                    </h4>
                    <p className="text-xs text-[#211A19]/60 mt-1">
                      Our DigiLocal admin team will verify <strong>{unlistedForm.societyName}</strong> with RWA contacts within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={resetUnlistedModal}
                    className="w-full py-3 bg-[#541D26] text-white font-bold text-xs rounded-xl hover:bg-[#6B2732] transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Done & Return to Homepage
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUnlistedSubmit} className="space-y-4">
                  {unlistedError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                      {unlistedError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                      Society / Colony Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahagun Modern"
                      value={unlistedForm.societyName}
                      onChange={(e) => setUnlistedForm({ ...unlistedForm, societyName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5DAD0] text-xs font-medium focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                      Full Address & Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sector 78, Expressway"
                      value={unlistedForm.fullAddress}
                      onChange={(e) => setUnlistedForm({ ...unlistedForm, fullAddress: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5DAD0] text-xs font-medium focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="201301"
                        value={unlistedForm.pincode}
                        onChange={(e) => setUnlistedForm({ ...unlistedForm, pincode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5DAD0] text-xs font-medium focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                        Total Flats *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 450"
                        value={unlistedForm.totalFlats}
                        onChange={(e) => setUnlistedForm({ ...unlistedForm, totalFlats: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5DAD0] text-xs font-medium focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider mb-1">
                      RWA / Facility Manager Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit phone number"
                      value={unlistedForm.rwaPhone}
                      onChange={(e) => setUnlistedForm({ ...unlistedForm, rwaPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5DAD0] text-xs font-medium focus:ring-2 focus:ring-[#541D26]/20 focus:border-[#541D26] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors shadow-md mt-2 cursor-pointer"
                  >
                    Submit Society Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5DAD0] py-6 text-center text-xs text-[#211A19]/60">
        <p>© 2026 DigiLocal Resident Commerce. All rights reserved.</p>
      </footer>
    </div>
  );
}
