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
    <div className="min-h-screen bg-background text-foreground pb-20 px-3 sm:px-6">
      
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto pt-4 pb-6">
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <button
            onClick={() => setRoute({ page: 'home' })}
            className="inline-flex items-center space-x-2 text-xs font-bold text-muted-foreground hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gold" />
            <span>Back to Societies</span>
          </button>

          {society && (
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
                    <span className="px-3.5 py-1 text-[11px] font-bold bg-secondary text-ink rounded-full inline-block border border-border">
                      Residential Society Marketplace
                    </span>
                    {society.society_id && (
                      <span className="px-3 py-1 text-[11px] font-extrabold bg-emerald-950 text-emerald-300 rounded-full inline-block border border-emerald-700/40">
                        {society.society_id}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                    {society.society_name}
                  </h1>
                  <div className="flex items-center space-x-1.5 text-muted-foreground text-xs mt-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-gold" />
                    <span>{society.location}</span>
                  </div>
                </div>
              </div>

              {/* Vendor Search Input */}
              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="text"
                    placeholder="Search vendor or store..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-background border border-border text-ink text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vendors Bento Grid */}
      <div className="max-w-7xl mx-auto mt-4">
        
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-[2rem] bg-card border border-border animate-pulse" />
            ))}
          </div>
        )}

        {!loading && vendors.length === 0 && (
          <div className="text-center py-16 bg-card border border-border rounded-[2.5rem] p-8 max-w-lg mx-auto shadow-sm">
            <Store className="w-12 h-12 text-gold mx-auto mb-3" />
            <h3 className="text-base font-bold text-ink mb-1">No Active Vendors Found</h3>
            <p className="text-muted-foreground text-xs mb-6 font-medium">There are currently no active approved vendors registered in this society matching your search.</p>
            <button
              onClick={() => setRoute({ page: 'vendorRegister' })}
              className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md tracking-wider uppercase"
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
                className="group rounded-[2rem] bg-card border border-border hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden flex flex-col justify-between bento-card"
              >
                <div className="p-6">
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
                        {/* Live Open / Closed Badge */}
                        {(() => {
                          const { isOpen, opensAt, closesAt, nextOpenIn } = getStoreStatus(vendor.opening_timing, vendor.closing_timing);
                          return (
                            <span
                              title={isOpen ? `Open until ${closesAt}` : `Opens at ${opensAt}${nextOpenIn ? ` (in ${nextOpenIn})` : ''}`}
                              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                isOpen
                                  ? 'bg-primary/10 text-primary border-primary/20'
                                  : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-primary' : 'bg-rose-500'}`} />
                              {isOpen ? 'Open' : 'Closed'}
                            </span>
                          );
                        })()}
                      </div>
                      <h3 className="text-lg font-serif font-black text-ink group-hover:text-primary transition-colors truncate">
                        {vendor.store_name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">By {vendor.vendor_name}</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-xs line-clamp-2 mb-4 leading-relaxed font-medium">
                    {vendor.description || 'Quality goods & daily essentials delivered within society via WhatsApp.'}
                  </p>

                  {/* GSTIN, CONTACT & TIMINGS */}
                  <div className="space-y-2 text-xs text-muted-foreground pt-3 border-t border-border/60 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-gold" />
                        <span>{vendor.phone_number || 'Available via WhatsApp'}</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold" />
                        <span>{vendor.opening_timing || '08:00 AM'} – {vendor.closing_timing || '10:00 PM'}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-secondary border border-border text-ink font-bold text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      <span>GSTIN:</span>
                      <span className="font-mono text-ink tracking-wide">{vendor.gst_number || '07AAACR12341Z5'}</span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const { isOpen, opensAt, nextOpenIn } = getStoreStatus(vendor.opening_timing, vendor.closing_timing);
                  return (
                    <div className={`p-4 border-t flex items-center justify-between text-xs font-bold ${
                      isOpen
                        ? 'bg-secondary/60 border-border text-ink group-hover:text-primary'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-700 cursor-not-allowed'
                    }`}>
                      <span className="flex items-center gap-2">
                        {isOpen
                          ? <ShoppingCart className="w-4 h-4 text-gold" />
                          : <Clock className="w-4 h-4 text-rose-500" />
                        }
                        <span className="uppercase tracking-wider text-[11px]">
                          {isOpen ? 'Browse Catalog & Order' : `Closed • Opens at ${opensAt}${nextOpenIn ? ` (in ${nextOpenIn})` : ''}`}
                        </span>
                      </span>
                      {isOpen && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-gold" />}
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

