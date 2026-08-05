import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Store, Phone, ShieldCheck, ShoppingCart, ChevronRight, FileText, Clock, MapPin, Building2 } from 'lucide-react';
import { getStoreStatus } from '../utils/storeHours';
import { VendorCardSkeleton } from '../components/Skeletons';

export default function SocietyVendorsPage({ societyId: initialSocietyId, setRoute }) {
  const [currentSocietyId, setCurrentSocietyId] = useState(initialSocietyId || 'all');
  const [society, setSociety] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Sync props when initialSocietyId changes
  useEffect(() => {
    if (initialSocietyId) {
      setCurrentSocietyId(initialSocietyId);
    } else {
      setCurrentSocietyId('all');
    }
  }, [initialSocietyId]);

  // Load Active Society Details & Vendors
  useEffect(() => {
    loadData();
  }, [currentSocietyId, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (currentSocietyId && currentSocietyId !== 'all') {
        const socData = await api.getSociety(currentSocietyId);
        setSociety(socData);
        const venData = await api.getSocietyVendors(currentSocietyId, search);
        setVendors(venData);
      } else {
        setSociety(null);
        const venData = await api.getSocietyVendors('all', search);
        setVendors(venData);
      }
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 px-3 sm:px-6 font-sans">
      
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto pt-4 pb-6">
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          {currentSocietyId !== 'all' && society ? (
            /* 1. SPECIFIC SOCIETY HEADER WITH REAL SOCIETY NAME & LOCATION */
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {(society.image_url || society.banner_image) && (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-border shadow-sm shrink-0">
                    <img 
                      src={society.image_url || society.banner_image} 
                      alt={society.society_name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
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
                    {society.society_name} Vendors
                  </h1>
                  <div className="flex items-center space-x-1.5 text-muted-foreground text-xs mt-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-gold shrink-0" />
                    <span>{society.location || 'Gated Residential Community'}</span>
                  </div>
                </div>
              </div>

              {/* Vendor Search Input for this specific society */}
              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="text"
                    placeholder={`Search stores in ${society.society_name}...`}
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

      {/* Vendors Bento Grid */}
      <div className="max-w-7xl mx-auto mt-2">
        
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
            {vendors.map((vendor) => (
              <div
                key={vendor.vendor_id}
                onClick={() => setRoute({ page: 'vendorStorefront', societyId: vendor.society_id || currentSocietyId || 1, vendorId: vendor.vendor_id })}
                className="group rounded-[2rem] bg-card border border-border hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden flex flex-col justify-between bento-card"
              >
                <div className="p-6">
                  {currentSocietyId === 'all' && (
                    <div className="mb-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF9F6] border border-border text-[10px] font-extrabold text-[#18281F]">
                      <Building2 className="w-3 h-3 text-[#C4A066]" />
                      <span>{vendor.society_name || 'Gated Society'}</span>
                    </div>
                  )}

                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={vendor.logo || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&auto=format&fit=crop&q=80'}
                      alt={vendor.store_name}
                      className="w-16 h-16 rounded-2xl object-cover border border-border bg-secondary shadow-sm group-hover:scale-105 transition-transform flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <div className="flex items-center space-x-1 text-primary text-[11px] font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                          <span>Verified Vendor</span>
                        </div>
                        {(() => {
                          const status = getStoreStatus(vendor.opening_time, vendor.closing_time);
                          return (
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                              status.isOpen 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {status.isOpen ? '• OPEN' : '• CLOSED'}
                            </span>
                          );
                        })()}
                      </div>
                      <h3 className="font-serif font-bold text-lg text-ink group-hover:text-primary transition-colors truncate">
                        {vendor.store_name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">By {vendor.vendor_name}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 font-normal">
                    {vendor.description || 'Quality goods & daily essentials delivered within society via WhatsApp.'}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-gold" />
                        <span>{vendor.phone_number}</span>
                      </span>
                      {vendor.opening_time && (
                        <span className="flex items-center space-x-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-gold" />
                          <span>{vendor.opening_time} – {vendor.closing_time}</span>
                        </span>
                      )}
                    </div>
                    {vendor.gst_number && (
                      <div className="flex items-center space-x-1.5 text-[11px] pt-1">
                        <FileText className="w-3.5 h-3.5 text-gold" />
                        <span className="font-mono bg-secondary px-2 py-0.5 rounded-md border border-border">GSTIN: {vendor.gst_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(() => {
                  const status = getStoreStatus(vendor.opening_time, vendor.closing_time);
                  if (!status.isOpen && status.nextOpenText) {
                    return (
                      <div className="px-6 py-3 bg-rose-50 border-t border-rose-100 text-rose-700 text-xs font-bold flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <span>CLOSED • OPENS AT {vendor.opening_time} ({status.nextOpenText})</span>
                      </div>
                    );
                  }
                  return (
                    <div className="px-6 py-3.5 bg-secondary/50 border-t border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center justify-between text-xs font-bold text-ink">
                      <span className="flex items-center space-x-2">
                        <ShoppingCart className="w-4 h-4 text-gold group-hover:text-primary-foreground" />
                        <span>BROWSE CATALOG & ORDER</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-gold group-hover:text-primary-foreground group-hover:translate-x-1 transition-transform" />
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
