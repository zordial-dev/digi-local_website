import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, MapPin, Building2, ChevronRight, Store } from 'lucide-react';

export default function HomePage({ setRoute }) {
  const [societies, setSocieties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSocieties(search);
  }, [search]);

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

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2229] pb-20">
      
      {/* DigiCafe Luxury Hero Section */}
      <div className="bg-white border-b border-[#C5A880]/20 py-12 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="DigiLocal Official Logo"
              className="w-20 h-20 object-contain rounded-2xl shadow-md border border-[#C5A880]/30 p-1 bg-white"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#0A1428] tracking-wider leading-tight uppercase">
            Hyperlocal Resident Commerce <br />
            <span className="text-[#C5A880] text-2xl sm:text-3xl block mt-1">Select Your Residential Society</span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-[#787F8C] max-w-lg mx-auto font-medium">
            Browse verified local grocery stores, bakeries, pharmacies & services for your gated community with instant WhatsApp ordering.
          </p>

          {/* Search Society Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative shadow-md rounded-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A880]" />
              <input
                type="text"
                placeholder="Search by society name, location or shop name (e.g. FreshMart, Noida, Greenwood)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-[#C5A880]/40 text-[#0A1428] placeholder-[#787F8C] text-xs font-semibold focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Main Content: Stacked Societies List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#0A1428] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#C5A880]" />
              <span>Residential Societies</span>
            </h2>
            <p className="text-[11px] text-[#787F8C] mt-0.5 font-medium">Select a society below to explore vendors</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white border border-[#C5A880]/20 animate-pulse shadow-sm" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-center font-medium text-xs">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && societies.length === 0 && (
          <div className="text-center py-12 bg-white border border-[#C5A880]/20 rounded-2xl p-8 shadow-sm">
            <Building2 className="w-10 h-10 text-[#787F8C] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#0A1428] mb-1">No Societies Found</h3>
            <p className="text-[#787F8C] text-xs">No residential societies match your search query.</p>
          </div>
        )}

        {/* Societies Stacked List */}
        {!loading && societies.length > 0 && (
          <div className="space-y-3">
            {societies.map((soc) => (
              <div
                key={soc.society_id}
                onClick={() => setRoute({ page: 'societyVendors', societyId: soc.society_id })}
                className="group rounded-xl bg-white p-4 sm:p-5 border border-[#C5A880]/25 hover:border-[#C5A880] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#F6F3EC] border border-[#C5A880]/30 flex items-center justify-center group-hover:bg-[#0A1428] transition-colors flex-shrink-0">
                    <Building2 className="w-5 h-5 text-[#C5A880] group-hover:text-white transition-colors" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#0A1428] group-hover:text-[#C5A880] transition-colors">
                      {soc.society_name}
                    </h3>
                    {/* Show matched shops when searching by shop name, otherwise show location */}
                    {soc.matched_shops && soc.matched_shops.length > 0 ? (
                      <div className="flex items-center space-x-1.5 text-[#787F8C] text-xs mt-0.5 font-medium flex-wrap gap-1">
                        <Store className="w-3.5 h-3.5 text-[#C5A880] flex-shrink-0" />
                        <span className="text-[#2E7D32] font-semibold">
                          {soc.matched_shops.join(', ')}
                          {soc.vendor_count > soc.matched_shops.length ? ` +${soc.vendor_count - soc.matched_shops.length} more` : ''}
                        </span>
                        <span className="text-[#C5A880]">&bull;</span>
                        <span>{soc.location}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 text-[#787F8C] text-xs mt-0.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{soc.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-[#F6F3EC] text-[#0A1428] border border-[#C5A880]/30 rounded-full hidden sm:flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-[#2E7D32]" />
                    {soc.vendor_count || 0} Active Vendors
                  </span>

                  <div className="flex items-center space-x-1 text-xs font-bold text-[#C5A880] group-hover:text-[#0A1428]">
                    <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Explore</span>
                    <div className="w-7 h-7 rounded-full bg-[#F6F3EC] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-4 h-4 text-[#0A1428]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
