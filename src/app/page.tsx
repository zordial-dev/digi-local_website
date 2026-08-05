'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, Store, ArrowRight, PlusCircle, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface Society {
  id: string;
  name: string;
  pincode: string;
  location: string;
  bannerImage: string;
  activeVendorsCount: number;
}

const MOCK_SOCIETIES: Society[] = [
  {
    id: '101',
    name: 'Greenwood Heights',
    pincode: '201301',
    location: 'Sector 128, Noida',
    bannerImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
    activeVendorsCount: 14,
  },
  {
    id: '102',
    name: 'Silver Oak Residency',
    pincode: '201304',
    location: 'Expressway, Noida',
    bannerImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
    activeVendorsCount: 8,
  },
  {
    id: '103',
    name: 'Palm Grove Apartments',
    pincode: '110075',
    location: 'Dwarka Sector 10, New Delhi',
    bannerImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    activeVendorsCount: 22,
  },
  {
    id: '104',
    name: 'Royal Palms Gated Community',
    pincode: '560103',
    location: 'Bellandur, Bengaluru',
    bannerImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80',
    activeVendorsCount: 19,
  },
  {
    id: '105',
    name: 'Sun City Towers',
    pincode: '400053',
    location: 'Andheri West, Mumbai',
    bannerImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80',
    activeVendorsCount: 11,
  },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredSocieties, setFilteredSocieties] = useState<Society[]>(MOCK_SOCIETIES);
  const [isUnlistedModalOpen, setIsUnlistedModalOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
      setFilteredSocieties(MOCK_SOCIETIES);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const results = MOCK_SOCIETIES.filter(
        (soc) =>
          soc.name.toLowerCase().includes(query) ||
          soc.pincode.includes(query) ||
          soc.location.toLowerCase().includes(query)
      );
      setFilteredSocieties(results);
    }
  }, [searchQuery]);

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
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2229] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#C5A880]/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => (window.location.href = '/')}>
            <div className="w-10 h-10 rounded-xl bg-[#0A1428] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] font-bold text-lg">
              DL
            </div>
            <div>
              <span className="font-serif font-extrabold text-lg text-[#0A1428] tracking-wider uppercase block leading-none">
                DigiLocal
              </span>
              <span className="text-[10px] text-[#C5A880] font-semibold uppercase tracking-widest">
                Society Marketplace
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setUnlistedForm((prev) => ({ ...prev, societyName: searchQuery }));
              setIsUnlistedModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white font-bold text-xs transition-colors uppercase tracking-wider flex items-center space-x-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-[#C5A880]" />
            <span>Request Unlisted Society</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-[#C5A880]/20 py-12 sm:py-16 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="px-3.5 py-1.5 text-xs font-extrabold bg-[#F6F3EC] text-[#0A1428] border border-[#C5A880]/30 rounded-full inline-block mb-4 uppercase tracking-wider">
            Verified Residential Marketplace
          </span>

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-[#0A1428] tracking-tight leading-tight uppercase">
            Find Local Services in <br />
            <span className="text-[#C5A880]">Your Housing Society</span>
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-[#787F8C] max-w-xl mx-auto font-medium">
            Connect directly with verified resident vendors, groceries, pharmacies, and daily services inside your gated community.
          </p>

          {/* Interactive Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto relative" ref={searchContainerRef}>
            <div className="relative shadow-sm rounded-2xl bg-white border border-[#C5A880]/40 focus-within:border-[#C5A880] focus-within:ring-4 focus-within:ring-[#C5A880]/15 transition-all">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C5A880]" />

              <input
                type="text"
                placeholder="Search by Society Name or Pincode (e.g. Greenwood, 201301, Noida)..."
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-transparent text-[#0A1428] placeholder-[#787F8C] text-sm font-medium focus:outline-none"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown List */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#C5A880]/30 z-50 overflow-hidden max-h-80 overflow-y-auto text-left">
                {filteredSocieties.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-1.5 text-[11px] font-extrabold text-[#787F8C] uppercase tracking-wider bg-[#FAF9F6]">
                      Available Registered Societies
                    </div>

                    {filteredSocieties.map((society) => (
                      <div
                        key={society.id}
                        onClick={() => {
                          handleNavigateToSociety(society.id);
                          setIsDropdownOpen(false);
                        }}
                        className="px-4 py-3 hover:bg-[#F6F3EC] cursor-pointer transition-colors border-b border-gray-100 last:border-none flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] group-hover:bg-[#C5A880] group-hover:text-white transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#0A1428] group-hover:text-[#C5A880] transition-colors">
                              {society.name}
                            </h4>
                            <p className="text-[11px] text-[#787F8C] flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-[#C5A880]" />
                              <span>{society.location}</span>
                              <span className="font-semibold text-gray-400">• Pincode {society.pincode}</span>
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {society.activeVendorsCount} Vendors
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Dropdown Empty State */
                  <div className="p-6 text-center bg-[#FAF9F6]">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-[#0A1428]">No Registered Societies Match "{searchQuery}"</h4>
                    <p className="text-[11px] text-[#787F8C] mt-1 mb-3">
                      Can't find your residential society in our database? Request onboarding below.
                    </p>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setUnlistedForm((prev) => ({ ...prev, societyName: searchQuery }));
                        setIsUnlistedModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#0A1428] hover:bg-[#C5A880] text-white font-bold text-xs rounded-xl transition-colors uppercase tracking-wider"
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
            <h2 className="text-xl font-serif font-bold text-[#0A1428] uppercase tracking-wider flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#C5A880]" />
              <span>Registered Societies</span>
            </h2>
            <p className="text-xs text-[#787F8C] mt-0.5 font-medium">
              Browse society portals or register as an approved vendor
            </p>
          </div>

          <span className="text-xs font-bold text-gray-500">
            Showing {filteredSocieties.length} Societies
          </span>
        </div>

        {/* Societies Grid */}
        {filteredSocieties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSocieties.map((society) => (
              <div
                key={society.id}
                className="bg-white rounded-2xl border border-[#C5A880]/30 hover:border-[#C5A880] transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Image */}
                  <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                    <img
                      src={society.bannerImage}
                      alt={society.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#0A1428]/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold flex items-center space-x-1">
                      <Store className="w-3 h-3 text-[#C5A880]" />
                      <span>{society.activeVendorsCount} Active Vendors</span>
                    </div>
                  </div>

                  {/* Society Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-serif font-extrabold text-[#0A1428] uppercase tracking-wide group-hover:text-[#C5A880] transition-colors">
                      {society.name}
                    </h3>
                    <p className="text-xs text-[#787F8C] flex items-center space-x-1 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{society.location}</span>
                      <span className="font-bold text-gray-500">• {society.pincode}</span>
                    </p>
                  </div>
                </div>

                {/* 2 CTA Buttons */}
                <div className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavigateToSociety(society.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/40 text-[#0A1428] hover:bg-[#F6F3EC] font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Show Vendors</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                  </button>

                  <button
                    onClick={() => handleNavigateToVendorRegister(society.id, society.name)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <Store className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Become Vendor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Unlisted Fallback Banner when search yields no results */
          <div className="bg-white border-2 border-dashed border-[#C5A880]/40 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm my-8">
            <div className="w-14 h-14 rounded-2xl bg-[#F6F3EC] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-serif font-extrabold text-[#0A1428] uppercase tracking-wide">
              Society Not Listed?
            </h3>
            <p className="text-xs text-[#787F8C] mt-2 mb-6 font-medium max-w-md mx-auto">
              We couldn't find any registered societies matching "{searchQuery}". Request onboarding for your gated community now to enable resident shopping and vendor registrations.
            </p>

            <button
              onClick={() => {
                setUnlistedForm((prev) => ({ ...prev, societyName: searchQuery }));
                setIsUnlistedModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white font-extrabold text-xs uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center space-x-2 mx-auto"
            >
              <PlusCircle className="w-4 h-4 text-[#C5A880]" />
              <span>Request to Add Your Society</span>
            </button>
          </div>
        )}
      </main>

      {/* Unlisted Society Modal */}
      {isUnlistedModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#C5A880]/30 overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="bg-[#0A1428] text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-extrabold uppercase tracking-wider">
                    Request Society Onboarding
                  </h3>
                  <p className="text-[11px] text-[#C5A880]">Register an unlisted gated community</p>
                </div>
              </div>
              <button
                onClick={resetUnlistedModal}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
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
                    <h4 className="text-lg font-serif font-extrabold text-[#0A1428] uppercase">
                      Request Submitted Successfully!
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Our DigiLocal admin team will verify <strong>{unlistedForm.societyName}</strong> with RWA contacts within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={resetUnlistedModal}
                    className="w-full py-3 bg-[#0A1428] text-white font-bold text-xs rounded-xl hover:bg-[#C5A880] transition-colors uppercase tracking-wider"
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
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Society / Colony Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahagun Modern"
                      value={unlistedForm.societyName}
                      onChange={(e) => setUnlistedForm({ ...unlistedForm, societyName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Full Address & Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sector 78, Expressway"
                      value={unlistedForm.fullAddress}
                      onChange={(e) => setUnlistedForm({ ...unlistedForm, fullAddress: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="201301"
                        value={unlistedForm.pincode}
                        onChange={(e) => setUnlistedForm({ ...unlistedForm, pincode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Total Flats *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 450"
                        value={unlistedForm.totalFlats}
                        onChange={(e) => setUnlistedForm({ ...unlistedForm, totalFlats: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#C5A880]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      RWA / Facility Manager Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit phone number"
                      value={unlistedForm.rwaPhone}
                      onChange={(e) => setUnlistedForm({ ...unlistedForm, rwaPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#0A1428] hover:bg-[#C5A880] text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors shadow-md mt-2"
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
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <p>© 2026 DigiLocal Resident Commerce. All rights reserved.</p>
      </footer>
    </div>
  );
}
