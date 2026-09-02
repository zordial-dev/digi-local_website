import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Building2, Check, X, Sparkles, Plus, Edit3 } from 'lucide-react';
import { api } from '../services/api';
import { useScrollLock } from '../hooks/useScrollLock';

export default function DeliveryAddressModal({ isOpen = true, onClose, onAddressSaved, addressToEdit = null }) {
  useScrollLock(isOpen);
  const [label, setLabel] = useState('Home');
  const [society, setSociety] = useState('');
  const [building, setBuilding] = useState('');
  const [flat, setFlat] = useState('');
  const [pincode, setPincode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (addressToEdit) {
      setLabel(addressToEdit.label || 'Home');
      setSociety(addressToEdit.society || addressToEdit.area || '');
      setBuilding(addressToEdit.building || '');
      setFlat(addressToEdit.flat || '');
      setPincode(addressToEdit.pincode || '');
    } else {
      setLabel('Home');
      setSociety('');
      setBuilding('');
      setFlat('');
      setPincode('');
    }
  }, [addressToEdit, isOpen]);

  // Strict Background Freeze (Locks background scroll cleanly while modal is open)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!society.trim()) {
      setErrorMsg('Please enter or select your Housing Society name.');
      return;
    }
    if (!flat.trim()) {
      setErrorMsg('Please enter your Flat / House number.');
      return;
    }

    const cleanSociety = society.trim();
    const cleanBuilding = building.trim();
    const cleanFlat = flat.trim();
    const cleanPincode = pincode.trim();
    const cleanLabel = label.trim() || 'Home';

    const fullAddrString = `${cleanFlat}${cleanBuilding ? ` (${cleanBuilding})` : ''}, ${cleanSociety}`;

    const targetId = addressToEdit?.id || Date.now();
    const newAddressObj = {
      id: targetId,
      label: cleanLabel,
      society: cleanSociety,
      building: cleanBuilding,
      flat: cleanFlat,
      pincode: cleanPincode,
      address: fullAddrString,
      isDefault: addressToEdit ? Boolean(addressToEdit.isDefault) : true
    };

    try {
      // 1. Check if user is actively logged in
      let userPhoneKey = null;
      try {
        const userSessionStr = localStorage.getItem('digilocal_user_session');
        if (userSessionStr) {
          const parsed = JSON.parse(userSessionStr);
          if (parsed && (parsed.user || parsed.name)) {
            const u = parsed.user || parsed;
            userPhoneKey = String(u.phone || u.mobile || u.user_id || u.id || '').replace(/\D/g, '');
            const updatedUser = { ...u, society_name: cleanSociety, flat: cleanFlat };
            localStorage.setItem('digilocal_user_session', JSON.stringify({ ...parsed, user: updatedUser }));
            localStorage.setItem('digilocal_resident_session', JSON.stringify(updatedUser));
          }
        }
      } catch (_) {}

      // 2. Read existing saved addresses (user-scoped if logged in)
      let existingList = [];
      const savedStr = userPhoneKey
        ? (localStorage.getItem(`digilocal_saved_addresses_${userPhoneKey}`) || localStorage.getItem('digilocal_saved_addresses'))
        : localStorage.getItem('digilocal_saved_addresses');

      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed)) {
          existingList = parsed;
        }
      }

      let updatedAddresses = [];
      if (addressToEdit) {
        updatedAddresses = existingList.map(item => String(item.id) === String(addressToEdit.id) ? newAddressObj : item);
      } else {
        const resetExisting = existingList.map(item => ({ ...item, isDefault: false }));
        updatedAddresses = [newAddressObj, ...resetExisting];
      }

      if (userPhoneKey) {
        localStorage.setItem(`digilocal_saved_addresses_${userPhoneKey}`, JSON.stringify(updatedAddresses));
      }
      localStorage.setItem('digilocal_saved_addresses', JSON.stringify(updatedAddresses));

      // 3. Persist address to backend database via PUT /api/users/profile or PUT /api/users/address
      api.saveUserAddress({
        user_id: userPhoneKey || 'usr_profile',
        flat: cleanFlat,
        area: cleanSociety,
        city: 'Jaipur',
        pincode: cleanPincode,
        address: fullAddrString
      }).catch(err => console.warn('Backend address save notice:', err));

      // 4. Update user active location in localStorage
      const activeLocObj = {
        area: cleanSociety,
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: cleanPincode,
        address: fullAddrString,
        society: cleanSociety,
        flat: cleanFlat,
        name: cleanSociety
      };
      localStorage.setItem('digilocal_user_location', JSON.stringify(activeLocObj));

      // 4. Dispatch custom window events so Navbar & open pages update instantly
      window.dispatchEvent(new CustomEvent('digilocal_saved_addresses_updated', { detail: updatedAddresses }));
      window.dispatchEvent(new CustomEvent('digilocal_location_changed', { detail: activeLocObj }));
    } catch (err) {
      console.error('Failed to save address:', err);
    }

    if (onAddressSaved) {
      onAddressSaved(newAddressObj);
    }
    if (onClose) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-all duration-300 ease-out"
      style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#211A19] text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/20 space-y-4 font-sans max-h-[88vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalPopupIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <style>{`
          @keyframes modalPopupIn {
            0% {
              opacity: 0;
              transform: scale(0.92) translateY(12px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#541D26] border border-[#C8A878]/30 flex items-center justify-center text-[#C8A878] shadow-sm shrink-0">
              {addressToEdit ? <Edit3 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#541D26] text-[#C8A878] text-[9px] font-black uppercase tracking-wider border border-[#C8A878]/20">
                {addressToEdit ? 'Update Residence Flat' : 'Delivery Location Required'}
              </span>
              <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                {addressToEdit ? 'Edit Delivery Address' : 'Enter Delivery Address'}
              </h3>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-[#D6B7A5] font-medium leading-relaxed">
          {addressToEdit 
            ? 'Modify your flat details or society location. Changes will update your active delivery address.'
            : 'Please specify where you would like your order delivered. This will be saved to your profile for future orders.'}
        </p>

        {errorMsg && (
          <div className="p-3 bg-rose-900/70 border border-rose-500/40 text-rose-200 text-xs font-bold rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Label Picker Buttons */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D6B7A5] mb-1.5">
              Address Label
            </label>
            <div className="flex items-center gap-2">
              {['Home', 'Office', 'Other'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLabel(item)}
                  className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition-all border cursor-pointer ${
                    label === item
                      ? 'bg-[#541D26] text-white border-[#C8A878] shadow-sm'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Housing Society */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D6B7A5] mb-1.5">
              Housing Society / Residential Complex *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A878]" />
              <input
                type="text"
                required
                list="delivery-societies-datalist-root"
                placeholder="e.g. Anupam Apartments / Bais Godam"
                value={society}
                onChange={(e) => setSociety(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8A878]"
              />
              <datalist id="delivery-societies-datalist-root">
                <option value="Anupam Apartments" />
                <option value="Bais Godam" />
                <option value="Sector 62" />
                <option value="Omaxe Greenwood Residency" />
                <option value="Palm Meadows Residency" />
              </datalist>
            </div>
          </div>

          {/* Tower & Flat */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D6B7A5] mb-1.5">
                Tower / Block <span className="text-white/40 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Tower A"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8A878]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D6B7A5] mb-1.5">
                Flat / House # *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 102"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8A878]"
              />
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D6B7A5] mb-1.5">
              Area Pincode <span className="text-white/40 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 302001"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8A878]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-full font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 border border-[#C8A878]/30"
          >
            <Check className="w-4 h-4 text-[#C8A878]" />
            <span>{addressToEdit ? 'Save Updated Address' : 'Save & Set Delivery Address'}</span>
          </button>
        </form>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
