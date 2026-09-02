import React, { useState, useEffect, useRef } from 'react';
import DeliveryAddressModal from '../components/DeliveryAddressModal';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  LogOut, 
  Edit3, 
  Check, 
  Clock, 
  PackageCheck, 
  Truck, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2,
  ChevronDown,
  Star, 
  Key, 
  Eye,
  EyeOff,
  Bell, 
  Store, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Download,
  Receipt
} from 'lucide-react';
import { api, getItemUnitLabel, formatItemQuantityBadge } from '../services/api';
import CountryCodePicker from '../components/CountryCodePicker';

function getInitials(nameStr) {
  if (!nameStr || typeof nameStr !== 'string') return 'U';
  const parts = nameStr.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserProfilePage({ activeUser, setActiveUser, setRoute, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses' | 'favorites' | 'settings'
  const hasCheckedStatusRef = useRef(null);

  // User Profile Form State
  const [savedProfile, setSavedProfile] = useState({
    name: '',
    email: '',
    phone: '',
    society: '',
    societyId: '',
    flat: '',
    avatar: ''
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phonePlaceholder, setPhonePlaceholder] = useState('e.g. 98765 43210');
  const [society, setSociety] = useState('');
  const [societyId, setSocietyId] = useState('');
  const [flat, setFlat] = useState('');
  const [avatar, setAvatar] = useState('');
  
  // UI Notifications & Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  
  // Orders & Favorites State
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [favorites, setFavorites] = useState([]);

  // Address List State (strictly empty by default unless user has saved addresses)
  const [addresses, setAddresses] = useState([]);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Settings State
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [notificationsWhatsApp, setNotificationsWhatsApp] = useState(true);
  const [notificationsSMS, setNotificationsSMS] = useState(true);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Delete User Account State & Handler
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteUserAccount = async () => {
    try {
      setIsDeletingAccount(true);
      const targetUserId = activeUser?.user_id || savedProfile.user_id || 'usr_guest';
      const userPhone = activeUser?.phone || activeUser?.mobile || savedProfile.phone || phone;
      await api.deleteUserAccount(targetUserId, { phone: userPhone });

      setShowDeleteAccountModal(false);
      if (typeof setActiveUser === 'function') setActiveUser(null);
      if (typeof onLogout === 'function') onLogout();
      setRoute({ page: 'home' });
    } catch (err) {
      console.error('Delete account error:', err);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Sync user profile & fetch REAL user orders from API / localStorage
  useEffect(() => {
    let userData = activeUser;
    if (!userData) {
      try {
        const savedSession = localStorage.getItem('digilocal_user_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          userData = parsed.user || parsed;
        } else {
          const savedRes = localStorage.getItem('digilocal_resident_session');
          if (savedRes) {
            userData = JSON.parse(savedRes);
          }
        }
      } catch (_) {}
    }

    if (userData) {
      const rawPhone = String(userData?.phone || userData?.mobile || userData?.user_phone || '').replace(/[^0-9]/g, '');
      const resolvedPhone = rawPhone ? (rawPhone.length === 10 ? `+91 ${rawPhone}` : rawPhone) : '';

      const resolvedName = userData?.name || userData?.userName || 'Resident User';
      const resolvedSociety = userData?.society_name || userData?.society || '';
      const resolvedFlat = userData?.flat || '';

      const initialProfile = {
        name: resolvedName,
        email: userData?.email || '',
        phone: resolvedPhone,
        society: resolvedSociety,
        societyId: userData?.society_id || '',
        flat: resolvedFlat,
        avatar: userData?.avatar || ''
      };

      setSavedProfile(initialProfile);
      setName(initialProfile.name);
      setEmail(initialProfile.email);
      setPhone(initialProfile.phone);
      setSociety(initialProfile.society);
      setSocietyId(initialProfile.societyId);
      setFlat(initialProfile.flat);
      setAvatar(initialProfile.avatar);

      // Fetch latest profile status LIVE from backend on every page load/visit
      const userId = userData?.user_id || userData?.id || userData?.phone;
      if (userId) {
        api.checkUserStatus(userId).then(statusRes => {
          if (statusRes) {
            const uData = statusRes.user || statusRes;
            const freshName = uData.name || statusRes.name;
            const freshPhone = uData.phone || statusRes.phone;
            const freshEmail = uData.email || statusRes.email;
            const freshSociety = uData.society_name || uData.society || uData.area || statusRes.society_name || statusRes.area || '';
            const freshFlat = uData.flat || statusRes.flat || '';
            const freshCity = uData.city || statusRes.city || '';
            const freshPincode = uData.pincode || statusRes.pincode || '';
            const freshAddress = uData.address || statusRes.address || '';

            setSavedProfile(prev => ({
              ...prev,
              ...(freshName ? { name: freshName } : {}),
              ...(freshPhone ? { phone: freshPhone } : {}),
              ...(freshEmail ? { email: freshEmail } : {}),
              ...(freshSociety ? { society: freshSociety } : {}),
              ...(freshFlat ? { flat: freshFlat } : {}),
              ...(freshCity ? { city: freshCity } : {}),
              ...(freshPincode ? { pincode: freshPincode } : {})
            }));

            if (freshName) setName(freshName);
            if (freshPhone) setPhone(freshPhone);
            if (freshEmail) setEmail(freshEmail);
            if (freshSociety) setSociety(freshSociety);
            if (freshFlat) setFlat(freshFlat);

            // Sync backend address card directly
            if (freshSociety || freshFlat || freshPincode || freshCity) {
              const liveBackendAddr = [{
                id: 'registered_profile_addr',
                label: 'Home',
                society: freshSociety,
                flat: freshFlat,
                city: freshCity,
                pincode: freshPincode,
                address: freshAddress || `${freshFlat}, ${freshSociety}`,
                isDefault: true
              }];
              setAddresses(liveBackendAddr);
              const userPhoneKey = String(freshPhone || userData?.phone || '').replace(/\D/g, '');
              if (userPhoneKey) {
                localStorage.setItem(`digilocal_saved_addresses_${userPhoneKey}`, JSON.stringify(liveBackendAddr));
              }
              localStorage.setItem('digilocal_saved_addresses', JSON.stringify(liveBackendAddr));
            }

            if (setActiveUser) {
              setActiveUser(prev => {
                const updated = {
                  ...(prev || {}),
                  ...(uData || {}),
                  ...(freshName ? { name: freshName } : {}),
                  ...(freshPhone ? { phone: freshPhone } : {}),
                  ...(freshEmail ? { email: freshEmail } : {}),
                  ...(freshFlat ? { flat: freshFlat } : {}),
                  ...(freshSociety ? { society_name: freshSociety, area: freshSociety } : {}),
                  ...(freshCity ? { city: freshCity } : {}),
                  ...(freshPincode ? { pincode: freshPincode } : {}),
                  ...(freshAddress ? { address: freshAddress } : {})
                };
                try {
                  const sessionStr = localStorage.getItem('digilocal_user_session');
                  if (sessionStr) {
                    const parsed = JSON.parse(sessionStr);
                    localStorage.setItem('digilocal_user_session', JSON.stringify({ ...parsed, user: updated }));
                  }
                  localStorage.setItem('digilocal_resident_session', JSON.stringify(updated));
                } catch (_) {}
                return updated;
              });
            }
          }
        }).catch(() => {});
      }
    }

    // Initialize saved addresses strictly scoped to THIS active logged-in user
    try {
      const userPhoneKey = String(userData?.phone || userData?.mobile || userData?.user_id || userData?.id || '').replace(/\D/g, '');
      const userScopedAddrs = userPhoneKey ? localStorage.getItem(`digilocal_saved_addresses_${userPhoneKey}`) : null;
      if (userScopedAddrs) {
        const parsed = JSON.parse(userScopedAddrs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
        } else {
          setAddresses([]);
        }
      } else {
        // Default to registered profile address if available
        if (initialProfile.society || initialProfile.flat || userData?.pincode || userData?.city) {
          const defaultRegisteredAddr = [{
            id: 'registered_profile_addr',
            label: 'Home',
            society: userData?.society_name || userData?.society || userData?.area || initialProfile.society || '',
            building: '',
            flat: userData?.flat || initialProfile.flat || '',
            city: userData?.city || '',
            pincode: userData?.pincode || '',
            address: userData?.address || '',
            isDefault: true
          }];
          setAddresses(defaultRegisteredAddr);
          if (userPhoneKey) {
            localStorage.setItem(`digilocal_saved_addresses_${userPhoneKey}`, JSON.stringify(defaultRegisteredAddr));
          }
          localStorage.setItem('digilocal_saved_addresses', JSON.stringify(defaultRegisteredAddr));
        } else {
          setAddresses([]);
        }
      }
    } catch (_) {
      setAddresses([]);
    }

    // Load REAL orders placed by the current user from backend database and local storage
    const loadRealOrders = async () => {
      let liveOrders = [];
      const activePhone = String(userData?.phone || userData?.mobile || '').replace(/[^0-9]/g, '');

      if (activePhone) {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
        try {
          const res = await fetch(`${apiBase}/orders?phone=${encodeURIComponent(activePhone)}`);
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.orders || data.data || []);
            if (Array.isArray(list) && list.length > 0) {
              liveOrders.push(...list.filter(Boolean));
            }
          }
        } catch (e) {
          console.warn("Backend orders query by phone note:", e);
        }
      }

      // Merge locally placed order receipts
      try {
        const activeOrderStr = localStorage.getItem('digilocal_active_order');
        if (activeOrderStr) {
          const parsedOrder = JSON.parse(activeOrderStr);
          if (parsedOrder && (parsedOrder.order_id || parsedOrder.id)) {
            const alreadyExists = liveOrders.some(o => String(o.order_id || o.id) === String(parsedOrder.order_id || parsedOrder.id));
            if (!alreadyExists) {
              liveOrders.unshift(parsedOrder);
            }
          }
        }
      } catch (_) {}

      try {
        const pastOrdersStr = localStorage.getItem('digilocal_past_orders');
        if (pastOrdersStr) {
          const pastList = JSON.parse(pastOrdersStr);
          if (Array.isArray(pastList)) {
            pastList.forEach(po => {
              if (po && (po.order_id || po.id)) {
                const alreadyExists = liveOrders.some(o => String(o.order_id || o.id) === String(po.order_id || po.id));
                if (!alreadyExists) liveOrders.push(po);
              }
            });
          }
        }
      } catch (_) {}

      setOrders(liveOrders);
    };

    loadRealOrders();

    // Load Favorite Stores
    try {
      const favStr = localStorage.getItem('digilocal_favorite_vendors');
      if (favStr) {
        const parsedFavs = JSON.parse(favStr);
        if (Array.isArray(parsedFavs)) setFavorites(parsedFavs);
      }
    } catch (_) {}
  }, [activeUser?.user_id || activeUser?.id || activeUser?.phone]);

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setName(savedProfile.name);
    setEmail(savedProfile.email);
    setPhone(savedProfile.phone);
    setSociety(savedProfile.society);
    setSocietyId(savedProfile.societyId);
    setFlat(savedProfile.flat);
    setAvatar(savedProfile.avatar);
    setIsEditing(false);
    setSaveErrorMsg('');
  };

  // Handle Save Profile Updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    if (!name.trim()) {
      setSaveErrorMsg('Please enter your full name.');
      return;
    }
    if (email.trim() && !email.includes('@')) {
      setSaveErrorMsg('Please enter a valid email address format.');
      return;
    }

    const cleanName = name.trim().replace(/\b\w/g, c => c.toUpperCase());
    const updatedUser = {
      ...(activeUser || {}),
      user_id: activeUser?.user_id || `usr_${Date.now()}`,
      name: cleanName,
      email: email.trim(),
      phone: phone.trim(),
      society_name: society,
      society_id: societyId,
      flat: flat.trim(),
      avatar: avatar,
      joined_date: activeUser?.joined_date || 'August 2026'
    };

    setSavedProfile({
      name: cleanName,
      email: email.trim(),
      phone: phone.trim(),
      society: society,
      societyId: societyId,
      flat: flat.trim(),
      avatar: avatar
    });

    try {
      await api.updateUserProfile(updatedUser.user_id, updatedUser);
    } catch (_) {}

    const sessionObj = {
      user: updatedUser,
      token: `user_token_${Date.now()}`,
      expiresAt: Date.now() + 86400000
    };

    localStorage.setItem('digilocal_user_session', JSON.stringify(sessionObj));
    localStorage.setItem('digilocal_resident_session', JSON.stringify(updatedUser));
    if (setActiveUser) setActiveUser(updatedUser);

    setIsEditing(false);
    setSaveSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Handle Remove Address
  const handleRemoveAddress = (idToRemove) => {
    const updated = addresses.filter(a => a.id !== idToRemove);
    setAddresses(updated);
    try {
      const userPhoneKey = String(phone || email || '').replace(/\D/g, '');
      if (userPhoneKey) {
        localStorage.setItem(`digilocal_saved_addresses_${userPhoneKey}`, JSON.stringify(updated));
      }
      localStorage.setItem('digilocal_saved_addresses', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('digilocal_saved_addresses_updated', { detail: updated }));
    } catch (_) {}
  };

  // Handle Set Default Address
  const handleSetDefaultAddress = (idToDefault) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === idToDefault }));
    setAddresses(updated);
    try {
      const userPhoneKey = String(phone || email || '').replace(/\D/g, '');
      if (userPhoneKey) {
        localStorage.setItem(`digilocal_saved_addresses_${userPhoneKey}`, JSON.stringify(updated));
      }
      localStorage.setItem('digilocal_saved_addresses', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('digilocal_saved_addresses_updated', { detail: updated }));
    } catch (_) {}
  };

  // Remove Favorite
  const handleRemoveFavorite = (vendorId) => {
    const updatedFavs = favorites.filter(f => f.vendor_id !== vendorId);
    setFavorites(updatedFavs);
    try {
      localStorage.setItem('digilocal_favorite_vendors', JSON.stringify(updatedFavs));
    } catch (_) {}
  };

  // Password Reset Handler
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setSettingsMsg('');
    if (!passwordCurrent) {
      setSettingsMsg('Please enter your current password.');
      return;
    }
    if (passwordNew.length < 4) {
      setSettingsMsg('New password must be at least 4 characters long.');
      return;
    }
    if (passwordNew !== passwordConfirm) {
      setSettingsMsg('New passwords do not match.');
      return;
    }
    if (passwordNew === passwordCurrent) {
      setSettingsMsg('New password should be different from previous password.');
      return;
    }
    setSettingsMsg('✓ Password updated successfully!');
    setPasswordCurrent('');
    setPasswordNew('');
    setPasswordConfirm('');
  };

  // Filtered Orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_id && String(order.order_id).toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.store_name && order.store_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.items && order.items.some(i => i.item_name && i.item_name.toLowerCase().includes(orderSearch.toLowerCase())));
    
    if (!matchesSearch) return false;
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'DELIVERED') return String(order.status || '').toUpperCase() === 'DELIVERED' || String(order.status || '').toUpperCase() === 'COMPLETED';
    if (orderFilter === 'IN_PROGRESS') return String(order.status || '').toUpperCase() !== 'DELIVERED' && String(order.status || '').toUpperCase() !== 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F6F0E8] pt-4 pb-16 px-3 sm:px-6 lg:px-8 font-sans text-[#211A19]">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* TOP HERO PROFILE HEADER CARD (Luxury Bento Grid #211A19)       */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#211A19] text-white rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden border border-white/10">
          
          {/* Subtle Decorative Nude & Gold Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A878]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#541D26]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Column: Avatar + Identity Info (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-5 sm:gap-6">
              
              {/* Profile Avatar Frame */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#C8A878] p-1 shadow-xl bg-gradient-to-br from-[#541D26] to-[#391218] flex items-center justify-center text-[#C8A878] font-serif text-2xl sm:text-3xl font-bold tracking-wider select-none">
                  {getInitials(savedProfile.name || name)}
                </div>
                <div className="absolute bottom-0 right-0 bg-[#C8A878] text-[#211A19] p-1.5 rounded-full shadow-md border border-[#211A19]">
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>

              {/* Text Meta Details */}
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                    {savedProfile.name || name}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-[#541D26] border border-[#C8A878]/30 text-[#C8A878] text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-[#C8A878]" /> Verified Resident
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-[#D6B7A5] font-medium">
                  {savedProfile.email && !savedProfile.email.includes('@digilocal.internal') && !savedProfile.email.includes('@test.com') ? (
                    <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-[#C8A878]" /> {savedProfile.email}
                    </span>
                  ) : null}
                  {savedProfile.phone ? (
                    <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[11px] font-mono text-white">
                      <Phone className="w-3.5 h-3.5 text-[#C8A878]" /> 
                      {savedProfile.phone.startsWith('+91') ? savedProfile.phone : `+91 ${savedProfile.phone.replace(/[^0-9]/g, '').slice(-10)}`}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right Column: 2 Luxury Bento Stat Cards (lg:col-span-5) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Stat 1: Orders */}
              <button
                onClick={() => setActiveTab('orders')}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-[#C8A878]/60 p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group shadow-sm text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#541D26] border border-[#C8A878]/30 flex items-center justify-center text-[#C8A878] shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-extrabold font-sans text-white group-hover:text-[#C8A878] transition-colors leading-tight">
                    {orders.length}
                  </div>
                  <div className="text-[10px] text-[#D6B7A5] font-black uppercase tracking-wider truncate">
                    Orders
                  </div>
                </div>
              </button>

              {/* Stat 2: Saved Flats */}
              <button
                onClick={() => setActiveTab('addresses')}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-[#C8A878]/60 p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group shadow-sm text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#541D26] border border-[#C8A878]/30 flex items-center justify-center text-[#C8A878] shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  <Building2 className="w-4 h-4 text-[#C8A878]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-extrabold font-sans text-white group-hover:text-[#C8A878] transition-colors leading-tight">
                    {addresses.length}
                  </div>
                  <div className="text-[10px] text-[#D6B7A5] font-black uppercase tracking-wider truncate">
                    Flats
                  </div>
                </div>
              </button>

            </div>

          </div>

        </div>


        {/* ------------------------------------------------------------- */}
        {/* NAVIGATION TABS BAR (Oxblood #541D26 Active Pill)             */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl sm:rounded-full p-1.5 shadow-md border border-[#E5DAD0] flex flex-wrap sm:flex-nowrap items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#541D26] text-white shadow-md'
                : 'text-[#211A19]/70 hover:text-[#541D26] hover:bg-[#EEE5DA]'
            }`}
          >
            <ShoppingBag className={`w-4 h-4 ${activeTab === 'orders' ? 'text-[#C8A878]' : ''}`} />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#541D26] text-white shadow-md'
                : 'text-[#211A19]/70 hover:text-[#541D26] hover:bg-[#EEE5DA]'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#C8A878]' : ''}`} />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-[#541D26] text-white shadow-md'
                : 'text-[#211A19]/70 hover:text-[#541D26] hover:bg-[#EEE5DA]'
            }`}
          >
            <MapPin className={`w-4 h-4 ${activeTab === 'addresses' ? 'text-[#C8A878]' : ''}`} />
            <span>Saved Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#541D26] text-white shadow-md'
                : 'text-[#211A19]/70 hover:text-[#541D26] hover:bg-[#EEE5DA]'
            }`}
          >
            <Key className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#C8A878]' : ''}`} />
            <span>Security & Settings</span>
          </button>
        </div>


        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT 1: MY ORDERS HISTORY                              */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Search & Filter Header */}
            <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#E5DAD0] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#541D26]" />
                <input
                  type="text"
                  placeholder="Search order ID, store, or item..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5DAD0] rounded-full text-xs font-semibold text-[#211A19] focus:outline-none focus:border-[#541D26]"
                />
              </div>
            </div>

            {/* Orders Cards Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E5DAD0] space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#EEE5DA] text-[#541D26] flex items-center justify-center mx-auto border border-[#E5DAD0]">
                  <ShoppingBag className="w-8 h-8 text-[#541D26]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#211A19]">No Orders Found</h3>
                <p className="text-xs text-[#211A19]/70 max-w-md mx-auto font-medium">
                  You haven't placed any orders yet. Visit local stores in your society to place your first order!
                </p>
                <button
                  onClick={() => setRoute({ page: 'societyVendors', societyId: societyId || 'all' })}
                  className="px-6 py-3 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-full text-xs font-extrabold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Store className="w-4 h-4 text-[#C8A878]" />
                  <span>Browse Stores & Place First Order</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.order_id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5DAD0] hover:border-[#541D26]/40 hover:shadow-md transition-all duration-200 space-y-3"
                  >
                    {/* Top Row: Logo + Store Name + Date + Total Price + Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <img 
                          src={order.store_logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80'} 
                          alt={order.store_name} 
                          className="w-10 h-10 rounded-xl object-cover border border-[#E5DAD0] shadow-2xs shrink-0 bg-[#EEE5DA]"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif font-bold text-sm text-[#211A19] truncate">
                              {order.store_name}
                            </h3>
                            {(() => {
                              const st = String(order.status || order.order_status || '').toUpperCase();

                              if (st === 'CANCELLED' || st === 'CANCELED' || st === 'REJECTED' || st === 'DECLINED' || st === 'FAILED') {
                                return (
                                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                                    <AlertCircle className="w-3 h-3 text-rose-700" />
                                    <span>Cancelled</span>
                                  </span>
                                );
                              }

                              if (st === 'COMPLETED' || st === 'DELIVERED' || st === 'SERVED') {
                                return (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                    <span>Delivered</span>
                                  </span>
                                );
                              }

                              if (st === 'ACCEPTED' || st === 'PREPARING' || st === 'OUT_FOR_DELIVERY' || st === 'IN_TRANSIT') {
                                return (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                                    <Truck className="w-3 h-3 text-amber-800" />
                                    <span>{st === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : 'Preparing'}</span>
                                  </span>
                                );
                              }

                              return (
                                <span className="px-2.5 py-0.5 rounded-full bg-[#541D26]/10 text-[#541D26] border border-[#541D26]/20 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                                  <Clock className="w-3 h-3 text-[#541D26]" />
                                  <span>Order Placed</span>
                                </span>
                              );
                            })()}
                            <button
                              onClick={() => setRoute({ page: 'vendorStorefront', societyId: '1', vendorId: String(order.vendor_id || 1) })}
                              className="text-[11px] text-[#541D26] hover:underline font-bold inline-flex items-center gap-0.5 shrink-0 ml-auto sm:ml-0"
                            >
                              <span>Shop</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-[#211A19]/60 font-medium mt-0.5">
                            <span className="font-mono text-[#211A19] font-bold">#{order.order_id || order.id}</span> • {order.created_at_readable || new Date(order.created_at_ist || order.created_at || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Right: Total & Action Buttons */}
                      <div className="flex items-center space-x-3 ml-auto sm:ml-0">
                        <div className="text-right">
                          <div className="text-[10px] text-[#211A19]/60 font-semibold uppercase tracking-wider">Total</div>
                          <div className="text-sm font-serif font-bold text-[#541D26]">₹{Number(order.total_amount || 0).toFixed(2)}</div>
                        </div>

                        <div className="flex items-center space-x-1.5 border-l border-[#E5DAD0] pl-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 rounded-lg border border-[#E5DAD0] hover:bg-[#EEE5DA] text-[#211A19] text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Receipt className="w-3 h-3 text-[#541D26]" />
                            <span>Receipt</span>
                          </button>

                          <button
                            onClick={() => setRoute({ page: 'vendorStorefront', societyId: '1', vendorId: String(order.vendor_id || 1) })}
                            className="px-3.5 py-1.5 rounded-lg bg-[#541D26] hover:bg-[#6B2732] text-white text-xs font-bold transition-all flex items-center space-x-1 shadow-2xs cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3 text-[#C8A878]" />
                            <span>Re-Order</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Minimal Inline Items List */}
                    <div className="pt-2 border-t border-[#E5DAD0] flex items-center justify-between text-xs text-[#211A19]/80">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-semibold text-[#211A19]">Items:</span>
                        <span className="truncate text-[#211A19]/70 font-medium">
                          {(order.items || []).map(i => {
                            const unit = getItemUnitLabel(i);
                            const unitStr = unit ? ` [${unit}]` : '';
                            return `${i.item_name || i.name}${unitStr} (×${i.quantity || 1})`;
                          }).join(', ') || '1x Daily Essentials'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#541D26] font-semibold bg-[#541D26]/10 px-2 py-0.5 rounded-md border border-[#541D26]/20 shrink-0 ml-2">
                        {order.payment_method || 'COD / WhatsApp'}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT 2: PROFILE DETAILS EDIT FORM                      */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-[#E5DAD0] space-y-6 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-[#E5DAD0] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#211A19]">
                  Personal Account Details
                </h2>
                <p className="text-xs text-[#211A19]/70 mt-1 font-medium">
                  Update your contact details, gated society residence, and flat address.
                </p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C8A878]" /> Edit Details
                </button>
              )}
            </div>

            {/* Success & Error Banners */}
            {saveSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {saveErrorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{saveErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#541D26]" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                        isEditing 
                          ? 'bg-white border-[#541D26] focus:ring-2 focus:ring-[#541D26]/20 text-[#211A19] shadow-xs' 
                          : 'bg-[#EEE5DA]/40 border-[#E5DAD0] text-[#211A19]/70 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1.5">
                    Email Address <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#541D26]" />
                    <input
                      type="email"
                      disabled={!isEditing}
                      placeholder="e.g. resident@example.com (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                        isEditing 
                          ? 'bg-white border-[#541D26] focus:ring-2 focus:ring-[#541D26]/20 text-[#211A19] shadow-xs' 
                          : 'bg-[#EEE5DA]/40 border-[#E5DAD0] text-[#211A19]/70 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* Mobile Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1.5">
                    Mobile Phone Number *
                  </label>
                  <div className="flex items-center gap-2">
                    <CountryCodePicker
                      disabled={!isEditing}
                      value={countryCode}
                      onChange={(val, countryObj) => {
                        setCountryCode(val);
                        setPhonePlaceholder(countryObj?.placeholder || 'e.g. 98765 43210');
                      }}
                    />
                    <div className="relative flex-1">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#541D26]" />
                      <input
                        type="tel"
                        disabled={!isEditing}
                        required
                        placeholder={phonePlaceholder}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                          isEditing 
                            ? 'bg-white border-[#541D26] focus:ring-2 focus:ring-[#541D26]/20 text-[#211A19] shadow-xs' 
                            : 'bg-[#EEE5DA]/40 border-[#E5DAD0] text-[#211A19]/70 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1.5">
                    Avatar Picture URL
                  </label>
                  <input
                    type="url"
                    disabled={!isEditing}
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className={`w-full px-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                      isEditing 
                        ? 'bg-white border-[#541D26] focus:ring-2 focus:ring-[#541D26]/20 text-[#211A19] shadow-xs' 
                        : 'bg-[#EEE5DA]/40 border-[#E5DAD0] text-[#211A19]/70 cursor-not-allowed'
                    }`}
                  />
                </div>

              </div>

              {/* Action Buttons when Editing */}
              {isEditing && (
                <div className="flex items-center gap-3 pt-4 border-t border-[#E5DAD0] justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 rounded-full bg-[#EEE5DA] text-[#211A19] font-bold text-xs hover:bg-[#D6B7A5] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#C8A878]" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT 3: SAVED ADDRESSES                                */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'addresses' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl shadow-xs border border-[#E5DAD0] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#211A19]">Saved Delivery Addresses</h2>
                <p className="text-xs text-[#211A19]/70 mt-0.5 font-medium">Manage your home, parent, and office flats for fast checkout.</p>
              </div>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddAddressModal(true);
                }}
                className="px-4 py-2.5 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C8A878]" /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E5DAD0] space-y-3 shadow-xs">
                <p className="text-xs text-[#211A19]/70 font-medium">No saved delivery addresses yet.</p>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddAddressModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-full text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  Add Your Residence Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    className={`bg-white rounded-3xl p-6 shadow-sm border relative space-y-3 ${
                      addr.isDefault ? 'border-[#541D26] ring-2 ring-[#541D26]/20' : 'border-[#E5DAD0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#211A19] flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#541D26]" /> {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2.5 py-0.5 bg-[#541D26]/10 text-[#541D26] text-[10px] font-black uppercase rounded-full border border-[#541D26]/20">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#211A19]/80 space-y-1">
                      <p className="font-semibold text-[#211A19]">{addr.flat}</p>
                      <p>{[addr.society, addr.city].filter(Boolean).join(', ')}{addr.pincode ? `, Pincode: ${addr.pincode}` : ''}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E5DAD0] flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditingAddress(addr);
                            setShowAddAddressModal(true);
                          }}
                          className="text-[#541D26] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#541D26]" /> Edit Address
                        </button>
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[#541D26]/70 hover:text-[#541D26] hover:underline font-semibold"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveAddress(addr.id)}
                        className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT 4: SECURITY & SETTINGS                            */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            
            {/* Change Password Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#E5DAD0] space-y-4">
              <div className="flex items-center gap-2 text-[#211A19]">
                <Key className="w-5 h-5 text-[#541D26]" />
                <h3 className="text-lg font-serif font-bold">Change Password</h3>
              </div>

              {settingsMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                  {settingsMsg}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswordCurrent ? "text" : "password"}
                      required
                      value={passwordCurrent}
                      onChange={(e) => setPasswordCurrent(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-10 bg-white border border-[#E5DAD0] rounded-xl text-xs font-semibold text-[#211A19] focus:outline-none focus:border-[#541D26]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-ink transition-colors p-1 cursor-pointer"
                    >
                      {showPasswordCurrent ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswordNew ? "text" : "password"}
                      required
                      value={passwordNew}
                      onChange={(e) => setPasswordNew(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-10 bg-white border border-[#E5DAD0] rounded-xl text-xs font-semibold text-[#211A19] focus:outline-none focus:border-[#541D26]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordNew(!showPasswordNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-ink transition-colors p-1 cursor-pointer"
                    >
                      {showPasswordNew ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211A19] mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      required
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-10 bg-white border border-[#E5DAD0] rounded-xl text-xs font-semibold text-[#211A19] focus:outline-none focus:border-[#541D26]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-ink transition-colors p-1 cursor-pointer"
                    >
                      {showPasswordConfirm ? <EyeOff className="w-4 h-4 text-[#541D26]" /> : <Eye className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-full text-xs font-extrabold uppercase tracking-wider transition-all shadow-md mt-2 cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Account Actions & Session Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#E5DAD0] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#211A19]">
                    <ShieldCheck className="w-5 h-5 text-[#541D26]" />
                    <h3 className="text-lg font-serif font-bold">Account Session</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ACTIVE SESSION
                  </span>
                </div>

                <p className="text-xs text-[#211A19]/70 font-medium leading-relaxed">
                  Manage your active resident session or permanently remove your profile from DigiLocal.
                </p>

                {/* Session & Profile Summary Info */}
                <div className="space-y-2.5 pt-1">
                  <div className="p-3 bg-[#EEE5DA]/30 rounded-2xl border border-[#E5DAD0] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26] shrink-0">
                        <User className="w-4 h-4 text-[#541D26]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#211A19]">Logged in User</p>
                        <p className="text-[11px] text-[#211A19]/70 font-medium truncate">{savedProfile.name || name || 'Resident User'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#541D26] bg-white px-2.5 py-1 rounded-full border border-[#E5DAD0] shrink-0">
                      {savedProfile.phone || phone ? `+91 ${String(savedProfile.phone || phone).slice(-10)}` : 'Verified'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#EEE5DA]/30 rounded-2xl border border-[#E5DAD0] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26] shrink-0">
                        <Clock className="w-4 h-4 text-[#541D26]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#211A19]">Session Encryption</p>
                        <p className="text-[11px] text-[#211A19]/70 font-medium">Secured with TLS 1.3 Encryption</p>
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#E5DAD0]">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-3 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border border-[#C8A878]/30"
                >
                  <LogOut className="w-4 h-4 text-white" />
                  <span>Log Out of Account</span>
                </button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-full hover:bg-rose-50 border border-transparent hover:border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Resident Account</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>


      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: RECEIPT MODAL                                         */}
      {/* ------------------------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5DAD0] space-y-4 text-[#211A19]">
            <div className="flex items-center justify-between border-b border-[#E5DAD0] pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#211A19]">Order Receipt</h3>
                <p className="text-[11px] text-muted-foreground font-mono">{selectedOrder.order_id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-ink font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Store:</span>
                <span className="font-bold">{selectedOrder.store_name}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Date:</span>
                <span>{new Date(selectedOrder.date || Date.now()).toLocaleString()}</span>
              </div>
              {selectedOrder.delivery_address && (
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Delivery Address:</span>
                  <span>{selectedOrder.delivery_address}</span>
                </div>
              )}

              <div className="border-t border-b border-[#E5DAD0] py-3 space-y-2">
                <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Items:</span>
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-semibold">
                    <span>{it.item_name} (x{it.quantity})</span>
                    <span>₹{((it.unit_price || 0) * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm font-bold text-[#541D26] pt-1">
                <span>Total Amount Paid:</span>
                <span>₹{Number(selectedOrder.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: DELETE ACCOUNT CONFIRMATION MODAL                     */}
      {/* ------------------------------------------------------------- */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200 text-ink space-y-5">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-serif font-bold text-rose-950">Delete Account Permanently?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete your resident account <strong className="text-ink">{savedProfile.name || name || 'User'}</strong>? Your saved addresses, favorites, and profile data will be permanently removed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="w-full sm:w-1/2 py-3 bg-secondary/80 hover:bg-secondary text-ink rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={handleDeleteUserAccount}
                className="w-full sm:w-1/2 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeletingAccount ? 'Deleting Account...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Address Modal (Supports Add New & Edit Address) */}
      <DeliveryAddressModal
        isOpen={showAddAddressModal}
        onClose={() => {
          setShowAddAddressModal(false);
          setEditingAddress(null);
        }}
        addressToEdit={editingAddress}
        onAddressSaved={() => {
          loadAddresses();
          setEditingAddress(null);
        }}
      />

    </div>
  );
}
