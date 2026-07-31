import React, { useState } from 'react';
import { MapPin, Search, Check, X, Building2, Navigation, Sparkles } from 'lucide-react';

const POPULAR_LOCATIONS = [
  { society_id: 'SOC-101', name: 'Omaxe Greenwood Residency', city: 'Greater Noida', pincode: '201310' },
  { society_id: 'SOC-102', name: 'Palm Meadows Residency', city: 'Bengaluru', pincode: '560066' },
  { society_id: 'SOC-103', name: 'DLF Phase 5 Enclave', city: 'Gurugram', pincode: '122002' },
  { society_id: 'SOC-104', name: 'Godrej Woods Community', city: 'Noida', pincode: '201303' },
  { society_id: 'SOC-105', name: 'Jaypee Greens Wish Town', city: 'Noida', pincode: '201304' },
  { society_id: 'SOC-106', name: 'ATS Village Gated Complex', city: 'Noida', pincode: '201304' },
];

export default function DeliveryLocationModal({ isOpen, onClose, selectedLocation, onSelectLocation, setRoute }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [customAddress, setCustomAddress] = useState('');

  if (!isOpen) return null;

  const filteredLocations = POPULAR_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.pincode.includes(searchQuery)
  );

  const handleSelect = (loc) => {
    const formatted = `${loc.name}, ${loc.city}`;
    onSelectLocation({
      label: formatted,
      name: loc.name,
      city: loc.city,
      pincode: loc.pincode,
      society_id: loc.society_id
    });
    try {
      localStorage.setItem('digilocal_delivery_location', JSON.stringify({
        label: formatted,
        society_id: loc.society_id
      }));
    } catch (_) {}
    onClose();
    if (setRoute) {
      setRoute({ page: 'societyVendors', societyId: loc.society_id });
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customAddress.trim()) return;
    const labelText = flatNumber ? `Flat ${flatNumber}, ${customAddress}` : customAddress;
    onSelectLocation({
      label: labelText,
      name: customAddress,
      city: 'Local'
    });
    try {
      localStorage.setItem('digilocal_delivery_location', JSON.stringify({ label: labelText }));
    } catch (_) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden relative text-foreground">
        
        {/* Header */}
        <div className="bg-[#18281F] text-[#F7F4EE] px-6 py-5 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-2 flex items-center justify-center border border-white/15">
              <MapPin className="w-5 h-5 text-[#C4A066]" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-black uppercase tracking-wider text-white">
                Select Delivery Location
              </h3>
              <p className="text-[11px] text-emerald-200/80 font-medium">Choose your residential society or enter address</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">

          {/* Location Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input
              type="text"
              placeholder="Search society, city or pincode (e.g. Greenwood, Noida, 201310)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink placeholder:text-muted-foreground"
            />
          </div>

          {/* Popular Residential Complexes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-gold" /> Gated Societies Nearby
              </span>
              <span>10-15 Min Delivery</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.name === loc.name;
                return (
                  <div
                    key={loc.society_id}
                    onClick={() => handleSelect(loc)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-secondary/40 hover:bg-secondary border-border/60 text-ink'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xs font-serif font-bold group-hover:text-primary transition-colors">
                          {loc.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          📍 {loc.city} • Pincode: {loc.pincode}
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Select →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Address Input Form */}
          <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-border space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
              Or Enter Flat & Building Address
            </span>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Flat No (e.g. 402)"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                className="col-span-1 px-3 py-2.5 rounded-xl bg-background border border-border text-xs font-medium focus:outline-none focus:border-primary text-ink"
              />
              <input
                type="text"
                placeholder="Building / Tower / Society Name"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                className="col-span-2 px-3 py-2.5 rounded-xl bg-background border border-border text-xs font-medium focus:outline-none focus:border-primary text-ink"
              />
            </div>

            <button
              type="submit"
              disabled={!customAddress.trim()}
              className="w-full py-3 rounded-full bg-primary disabled:opacity-50 text-primary-foreground font-black text-xs uppercase tracking-wider shadow-md hover:bg-gold hover:text-ink transition-all"
            >
              Set Custom Delivery Location
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
