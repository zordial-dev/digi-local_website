import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Search, MapPin, Store, Phone, ShieldCheck, ShoppingCart, ChevronRight, FileText, Clock } from 'lucide-react';
import { getStoreStatus } from '../utils/storeHours';

export default function SocietyVendorsPage({ societyId, setRoute }) {
  const [society, setSociety] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [societyId, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const socData = await api.getSociety(societyId);
      setSociety(socData);
      const venData = await api.getSocietyVendors(societyId, search);
      setVendors(venData);
    } catch (err) {
      console.error('Failed to load society vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2229] pb-20">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-[#C5A880]/20 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setRoute({ page: 'home' })}
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#787F8C] hover:text-[#C5A880] mb-4 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-[#C5A880]" />
            <span>Back to Societies</span>
          </button>

          {society && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 text-[11px] font-extrabold bg-[#F6F3EC] text-[#0A1428] border border-[#C5A880]/30 rounded-full inline-block mb-2 uppercase tracking-wider">
                  Residential Society Marketplace
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0A1428] uppercase tracking-wide">
                  {society.society_name}
                </h1>
                <div className="flex items-center space-x-1.5 text-[#787F8C] text-xs mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{society.location}</span>
                </div>
              </div>

              {/* Vendor Search Input */}
              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A880]" />
                  <input
                    type="text"
                    placeholder="Search vendor or store..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/40 text-[#0A1428] text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-[#C5A880]/20 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && vendors.length === 0 && (
          <div className="text-center py-16 bg-white border border-[#C5A880]/20 rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
            <Store className="w-12 h-12 text-[#787F8C] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0A1428] mb-1">No Active Vendors Found</h3>
            <p className="text-[#787F8C] text-xs mb-6 font-medium">There are currently no active approved vendors registered in this society matching your search.</p>
            <button
              onClick={() => setRoute({ page: 'vendorRegister' })}
              className="px-5 py-2.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white font-bold text-xs shadow-md tracking-wider uppercase"
            >
              Register your Store Here
            </button>
          </div>
        )}

        {!loading && vendors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div
                key={vendor.vendor_id}
                onClick={() => setRoute({ page: 'vendorStorefront', societyId, vendorId: vendor.vendor_id })}
                className="group rounded-2xl bg-white border border-[#C5A880]/25 hover:border-[#C5A880] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={vendor.logo || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&auto=format&fit=crop&q=80'}
                      alt={vendor.store_name}
                      className="w-16 h-16 rounded-xl object-cover border border-[#C5A880]/30 bg-[#FAF9F6] shadow-sm group-hover:scale-105 transition-transform flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <div className="flex items-center space-x-1 text-[#2E7D32] text-[11px] font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified DigiLocal Vendor</span>
                        </div>
                        {/* Live Open / Closed Badge */}
                        {(() => {
                          const { isOpen, opensAt, closesAt, nextOpenIn } = getStoreStatus(vendor.opening_timing, vendor.closing_timing);
                          return (
                            <span
                              title={isOpen ? `Open until ${closesAt}` : `Opens at ${opensAt}${nextOpenIn ? ` (in ${nextOpenIn})` : ''}`}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                isOpen
                                  ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/25'
                                  : 'bg-rose-50 text-rose-600 border-rose-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[#2E7D32]' : 'bg-rose-500'}`} />
                              {isOpen ? 'Open' : 'Closed'}
                            </span>
                          );
                        })()}
                      </div>
                      <h3 className="text-lg font-bold text-[#0A1428] group-hover:text-[#C5A880] transition-colors truncate">
                        {vendor.store_name}
                      </h3>
                      <p className="text-xs text-[#787F8C] font-medium">By {vendor.vendor_name}</p>
                    </div>
                  </div>

                  <p className="text-[#787F8C] text-xs line-clamp-2 mb-4 leading-relaxed font-medium">
                    {vendor.description || 'Quality goods & daily essentials delivered within society via WhatsApp.'}
                  </p>

                  {/* PROMINENT GSTIN, CONTACT & TIMINGS */}
                  <div className="space-y-2 text-xs text-[#787F8C] pt-3 border-t border-[#C5A880]/15 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{vendor.phone_number || 'Available via WhatsApp'}</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{vendor.opening_timing || '08:00 AM'} – {vendor.closing_timing || '10:00 PM'}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#F6F3EC] border border-[#C5A880]/30 text-[#0A1428] font-bold text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-[#C5A880] flex-shrink-0" />
                      <span>GSTIN:</span>
                      <span className="font-mono text-[#0A1428] tracking-wide">{vendor.gst_number || '07AAACR12341Z5'}</span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const { isOpen, opensAt, nextOpenIn } = getStoreStatus(vendor.opening_timing, vendor.closing_timing);
                  return (
                    <div className={`p-3.5 border-t flex items-center justify-between text-xs font-bold ${
                      isOpen
                        ? 'bg-[#F6F3EC] border-[#C5A880]/20 text-[#0A1428] group-hover:text-[#C5A880]'
                        : 'bg-rose-50 border-rose-100 text-rose-600 cursor-not-allowed'
                    }`}>
                      <span className="flex items-center gap-2">
                        {isOpen
                          ? <ShoppingCart className="w-4 h-4 text-[#C5A880]" />
                          : <Clock className="w-4 h-4 text-rose-400" />
                        }
                        <span className="uppercase tracking-wider text-[11px]">
                          {isOpen ? 'Browse Catalog & Order' : `Closed • Opens at ${opensAt}${nextOpenIn ? ` (in ${nextOpenIn})` : ''}`}
                        </span>
                      </span>
                      {isOpen && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#C5A880]" />}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
