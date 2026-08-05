import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, PlusCircle, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HeroSearchComponent({ societies = [], onSelectSociety, onRequestUnlistedSociety }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSocieties, setFilteredSocieties] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredSocieties(societies.slice(0, 5)); // Default top 5
    } else {
      const q = query.toLowerCase().trim();
      const matches = societies.filter(s => 
        s.society_name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        (s.pincode && s.pincode.toString().includes(q))
      );
      setFilteredSocieties(matches);
    }
  }, [query, societies]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto relative" ref={dropdownRef}>
      <div className="relative shadow-sm rounded-2xl bg-white border border-[#C5A880]/30 focus-within:border-[#C5A880] focus-within:ring-4 focus-within:ring-[#C5A880]/15 transition-all">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C5A880]" />
        
        <input
          type="text"
          placeholder="Search by Society Name or Pincode (e.g. Greenwood, 201301, Noida)..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-transparent text-[#0A1428] placeholder-[#787F8C] text-sm font-medium focus:outline-none"
        />

        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#C5A880]/30 z-50 overflow-hidden max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {filteredSocieties.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[11px] font-extrabold text-[#787F8C] uppercase tracking-wider bg-[#FAF9F6]">
                Registered Residential Societies
              </div>

              {filteredSocieties.map((society) => (
                <div
                  key={society.society_id}
                  onClick={() => {
                    onSelectSociety(society);
                    setIsOpen(false);
                  }}
                  className="px-4 py-3 hover:bg-[#F6F3EC] cursor-pointer transition-colors border-b border-gray-100 last:border-none flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#C5A880]/30 shrink-0 bg-[#FAF9F6]">
                      <img 
                        src={society.image_url || society.banner_image || 'https://static.squareyards.com/resources/images/noida/project-image/omaxe-greenwood-project-project-large-image1-2275.jpg'} 
                        alt={society.society_name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-sm font-bold text-[#0A1428] group-hover:text-[#C5A880] transition-colors">
                          {society.society_name}
                        </h4>
                        {society.society_id && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-[#18281F] text-[#C4A066] rounded-md uppercase">
                            {society.society_id}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#787F8C] flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#C5A880]" />
                        <span>{society.location}</span>
                        {society.pincode && <span className="font-semibold text-gray-500">• {society.pincode}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{society.active_vendors_count || 12} Verified Vendors</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#C5A880] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Unlisted Society Fallback CTA */
            <div className="p-6 text-center bg-[#FAF9F6]">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#0A1428]">Society Not Registered Yet?</h4>
              <p className="text-xs text-[#787F8C] mt-1 mb-4 max-w-sm mx-auto">
                No matching registered society found for "{query}". You can request onboarding for your gated community now!
              </p>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onRequestUnlistedSociety) onRequestUnlistedSociety(query);
                }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white font-bold text-xs shadow-md transition-all uppercase tracking-wider"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Onboard Unlisted Society</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
