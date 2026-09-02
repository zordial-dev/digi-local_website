import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Loader2, Building2, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';
import { useScrollLock } from '../hooks/useScrollLock';

export const UserLocationPromptModal = ({ isOpen = true, onClose, onLocationSet }) => {
  useScrollLock(isOpen);
  const [areaInput, setAreaInput] = useState('');
  const [cityInput, setCityInput] = useState('Jaipur');
  const [stateInput, setStateInput] = useState('Rajasthan');
  const [pincodeInput, setPincodeInput] = useState('302022');

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentSavedLocation, setCurrentSavedLocation] = useState(null);

  const dropdownRef = useRef(null);

  // Check saved location when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('digilocal_user_location');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCurrentSavedLocation(parsed);
          if (parsed.area) setAreaInput(parsed.area);
          if (parsed.city) setCityInput(parsed.city);
          if (parsed.state) setStateInput(parsed.state);
          if (parsed.pincode) setPincodeInput(parsed.pincode);
        }
      } catch (_) {}
      fetchLocations('');
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLocations = async (searchQuery = '') => {
    try {
      setLoading(true);
      const data = await api.getLocations({ search: searchQuery, city: cityInput, state: stateInput });
      if (Array.isArray(data)) {
        setLocations(data);
      }
    } catch (err) {
      console.warn('Failed to fetch locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (e) => {
    const val = e.target.value;
    setAreaInput(val);
    if (!val || !val.trim()) {
      setCityInput('');
      setStateInput('');
      setPincodeInput('');
    }
    setIsDropdownOpen(true);
    fetchLocations(val);
  };

  const handleClearArea = () => {
    setAreaInput('');
    setCityInput('');
    setStateInput('');
    setPincodeInput('');
    setIsDropdownOpen(true);
    fetchLocations('');
  };

  // Select an area suggestion from dropdown -> AUTOFILL Area, City, State, Pincode
  const handleSelectSuggestion = (loc) => {
    setAreaInput(loc.area);
    if (loc.city) setCityInput(loc.city);
    if (loc.state) setStateInput(loc.state);
    if (loc.pincode) setPincodeInput(loc.pincode);
    setIsDropdownOpen(false);
  };

  const saveLocationObj = (locObj) => {
    const formattedAddress = locObj.address || `${locObj.area}${locObj.city ? `, ${locObj.city}` : ''}${locObj.state ? `, ${locObj.state}` : ''}`;
    const fullLocation = {
      area: locObj.area || areaInput.trim() || 'Pratap Nagar',
      city: locObj.city || cityInput.trim() || 'Jaipur',
      state: locObj.state || stateInput.trim() || 'Rajasthan',
      pincode: locObj.pincode || pincodeInput.trim() || '302033',
      address: formattedAddress,
      name: locObj.area || areaInput.trim() || 'Pratap Nagar'
    };

    try {
      localStorage.setItem('digilocal_user_location', JSON.stringify(fullLocation));
      localStorage.setItem('digilocal_delivery_location', JSON.stringify({ label: formattedAddress }));
      window.dispatchEvent(new CustomEvent('digilocal_location_changed', { detail: fullLocation }));
    } catch (_) {}

    if (onLocationSet) onLocationSet(fullLocation);
    if (onClose) onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!areaInput.trim()) return;
    saveLocationObj({
      area: areaInput.trim(),
      city: cityInput.trim(),
      state: stateInput.trim(),
      pincode: pincodeInput.trim()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-visible bg-white dark:bg-[#131C2E] shadow-2xl rounded-3xl border border-slate-200 dark:border-white/10 font-sans text-slate-900 dark:text-white">

        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white relative rounded-t-3xl overflow-hidden">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/20">
                Manual Area Search
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">Select Service Area</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Type your Area name manually (e.g. <span className="text-emerald-300 font-bold">Mansarovar</span>, <span className="text-emerald-300 font-bold">Pratap Nagar</span>) to find local vendors.
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">

          {/* Currently Saved Location */}
          {currentSavedLocation && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">Current Active Area</span>
                <p className="font-bold truncate">{currentSavedLocation.address || `${currentSavedLocation.area}, ${currentSavedLocation.city}`}</p>
              </div>
            </div>
          )}

          {/* Manual Area & City Search Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div className="space-y-1 relative" ref={dropdownRef}>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Area / Locality Name (Editable) *</span>
                <span className="text-[10px] text-emerald-600 font-extrabold">Auto-suggests City & State</span>
              </label>

              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-emerald-600 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={areaInput}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={handleAreaChange}
                  placeholder="Type Area (e.g. Mansarovar, Pratap Nagar, Sitapura)..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                />
                {areaInput ? (
                  <button
                    type="button"
                    onClick={handleClearArea}
                    className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Clear Area, City & State"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : loading ? (
                  <Loader2 className="absolute right-3.5 w-4 h-4 text-emerald-600 animate-spin" />
                ) : null}
              </div>

              {/* LIVE AUTOCOMPLETE DROPDOWN MENU */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#1A263D] border-2 border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 animate-in fade-in slide-in-from-top-2 duration-150">
                  {locations.length > 0 ? (
                    locations.map((loc, idx) => (
                      <button
                        key={loc.location_id || idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(loc)}
                        className="w-full text-left p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              {loc.area}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                              {loc.city}, {loc.state} {loc.pincode ? `• ${loc.pincode}` : ''}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs flex items-center gap-1">
                          <span>Autofill</span> →
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No pre-indexed areas match "{areaInput}". Type your area and click Apply Area Search.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* City & State Editable Inputs */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">City (Editable)</label>
                <input
                  type="text"
                  required
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="e.g. Jaipur"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">State (Editable)</label>
                <input
                  type="text"
                  required
                  value={stateInput}
                  onChange={(e) => setStateInput(e.target.value)}
                  placeholder="e.g. Rajasthan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>🔍 Apply Area Search</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default UserLocationPromptModal;

