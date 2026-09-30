import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, PlusCircle, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSocietyImage } from '../../services/api';

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
      <div className="relative shadow-sm rounded-2xl bg-white border border-[#E5DAD0] focus-within:border-[#541D26] focus-within:ring-4 focus-within:ring-[#541D26]/10 transition-all">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C8A878]" />
        
        <input
          type="text"
          placeholder="Search by Society Name or Pincode (e.g. Greenwood, 201301, Noida)..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-11 pr-11 py-3.5 sm:py-4 rounded-2xl bg-transparent text-[#211A19] placeholder-[#211A19]/50 text-base sm:text-sm font-medium focus:outline-none"
        />

        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#211A19]/50 hover:text-[#211A19] bg-[#EEE5DA] rounded-full w-7 h-7 flex items-center justify-center cursor-pointer tap-target"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#E5DAD0] z-50 overflow-hidden max-h-80 sm:max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {filteredSocieties.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[11px] font-extrabold text-[#211A19]/60 uppercase tracking-wider bg-[#FAF8F5]">
                Registered Residential Societies
              </div>

              {filteredSocieties.map((society) => (
                <div
                  key={society.society_id}
                  onClick={() => {
                    onSelectSociety(society);
                    setIsOpen(false);
                  }}
                  className="px-3.5 sm:px-4 py-3 hover:bg-[#FAF8F5] cursor-pointer transition-colors border-b border-[#E5DAD0]/50 last:border-none flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-[#E5DAD0] shrink-0 bg-[#FAF8F5]">
                      <img 
                        src={getSocietyImage(society)} 
                        alt={society.society_name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-[#211A19] group-hover:text-[#541D26] transition-colors truncate">
                          {society.society_name}
                        </h4>
                        {society.society_id && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-[#541D26] text-[#C8A878] rounded-md uppercase shrink-0">
                            {society.society_id}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#211A19]/60 flex items-center space-x-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-[#C8A878] shrink-0" />
                        <span className="truncate">{society.location}</span>
                        {society.pincode && <span className="font-semibold text-[#211A19]/50 shrink-0">• {society.pincode}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-2 pl-13 sm:pl-0">
                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#541D26]/10 text-[#541D26] border border-[#541D26]/20 flex items-center space-x-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{society.active_vendors_count || 12} Verified Vendors</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#211A19]/40 group-hover:text-[#541D26] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Unlisted Society Fallback CTA */
            <div className="p-6 text-center bg-[#FAF8F5]">
              <AlertCircle className="w-10 h-10 text-[#C8A878] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#211A19]">Society Not Registered Yet?</h4>
              <p className="text-xs text-[#211A19]/60 mt-1 mb-4 max-w-sm mx-auto">
                No matching registered society found for "{query}". You can request onboarding for your gated community now!
              </p>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onRequestUnlistedSociety) onRequestUnlistedSociety(query);
                }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs shadow-md transition-all uppercase tracking-wider cursor-pointer"
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
