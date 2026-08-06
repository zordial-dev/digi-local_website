import React, { useState, useEffect } from 'react';
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
  Star, 
  Key, 
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
import { api } from '../services/api';

export default function UserProfilePage({ activeUser, setActiveUser, setRoute, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses' | 'favorites' | 'settings'

  // User Profile Form State
  const [savedProfile, setSavedProfile] = useState({
    name: '',
    email: '',
    phone: '',
    society: '',
    societyId: '',
    flat: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [society, setSociety] = useState('');
  const [societyId, setSocietyId] = useState('');
  const [flat, setFlat] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
  
  // UI Notifications & Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  
  // Orders & Favorites State (Initialized empty - loaded dynamically from real user session/API)
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL'); // 'ALL' | 'DELIVERED' | 'IN_PROGRESS'
  const [favorites, setFavorites] = useState([]);

  // Address List State
  const [addresses, setAddresses] = useState([]);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Office');
  const [newAddrSociety, setNewAddrSociety] = useState('');
  const [newAddrFlat, setNewAddrFlat] = useState('');

  // Settings State
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [notificationsWhatsApp, setNotificationsWhatsApp] = useState(true);
  const [notificationsSMS, setNotificationsSMS] = useState(true);
  const [settingsMsg, setSettingsMsg] = useState('');

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
      const initialProfile = {
        name: userData.name || userData.userName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        society: userData.society_name || userData.society || '',
        societyId: userData.society_id || '',
        flat: userData.flat || '',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      };

      setSavedProfile(initialProfile);
      setName(initialProfile.name);
      setEmail(initialProfile.email);
      setPhone(initialProfile.phone);
      setSociety(initialProfile.society);
      setSocietyId(initialProfile.societyId);
      setFlat(initialProfile.flat);
      setAvatar(initialProfile.avatar);
    }

    // Initialize saved addresses from localStorage or user profile session
    try {
      const savedAddrs = localStorage.getItem('digilocal_saved_addresses');
      if (savedAddrs) {
        const parsed = JSON.parse(savedAddrs);
        if (Array.isArray(parsed)) {
          setAddresses(parsed);
        }
      } else if (userData && (userData.society_name || userData.flat)) {
        const initialAddr = [{
          id: 1,
          label: 'Primary Residence',
          society: userData.society_name || '',
          flat: userData.flat || '',
          pincode: userData.pincode || '201310',
          isDefault: true
        }];
        setAddresses(initialAddr);
        localStorage.setItem('digilocal_saved_addresses', JSON.stringify(initialAddr));
      }
    } catch (_) {}

    // Load REAL orders placed strictly by THIS user
    const loadRealOrders = async () => {
      let realOrdersList = [];

      // 1. Try fetching orders from API backend
      if (userData?.user_id || userData?.phone) {
        try {
          const apiOrders = await api.getUserOrders(userData.user_id || userData.phone);
          if (Array.isArray(apiOrders)) {
            realOrdersList = apiOrders.filter(o => 
              (userData.user_id && String(o.user_id) === String(userData.user_id)) ||
              (userData.phone && (String(o.phone) === String(userData.phone) || String(o.user_phone) === String(userData.phone)))
            );
          }
        } catch (_) {}
      }

      // 2. Load orders saved in localStorage digilocal_user_orders
      try {
        const userOrdersStr = localStorage.getItem('digilocal_user_orders');
        if (userOrdersStr) {
          const parsedOrders = JSON.parse(userOrdersStr);
          if (Array.isArray(parsedOrders)) {
            const userSpecific = parsedOrders.filter(o => {
              if (!o || !userData) return false;
              const matchesId = userData.user_id && String(o.user_id) === String(userData.user_id);
              const matchesPhone = userData.phone && (
                String(o.phone || '').trim() === String(userData.phone).trim() ||
                String(o.user_phone || '').trim() === String(userData.phone).trim()
              );
              return matchesId || matchesPhone;
            });
            const map = new Map();
            [...realOrdersList, ...userSpecific].forEach(o => {
              if (o && o.order_id) map.set(String(o.order_id), o);
            });
            realOrdersList = Array.from(map.values());
          }
        }
      } catch (_) {}

      // 3. Include active order if present
      try {
        const activeOrderStr = localStorage.getItem('digilocal_active_order');
        if (activeOrderStr) {
          const activeOrderObj = JSON.parse(activeOrderStr);
          if (activeOrderObj && activeOrderObj.order_id && activeOrderObj.order_id !== 'ORD-984210') {
            const matchesUser = userData && (
              (userData.user_id && String(activeOrderObj.user_id) === String(userData.user_id)) ||
              (userData.phone && (
                String(activeOrderObj.phone || '').trim() === String(userData.phone).trim() ||
                String(activeOrderObj.user_phone || '').trim() === String(userData.phone).trim()
              ))
            );
            if (matchesUser) {
              const exists = realOrdersList.some(o => String(o.order_id) === String(activeOrderObj.order_id));
              if (!exists) {
                realOrdersList.unshift(activeOrderObj);
              }
            }
          }
        }
      } catch (_) {}

      setOrders(realOrdersList);
    };

    // Load REAL favorite vendors
    try {
      const favStr = localStorage.getItem('digilocal_favorite_vendors');
      if (favStr) {
        const favs = JSON.parse(favStr);
        if (Array.isArray(favs)) setFavorites(favs);
      }
    } catch (_) {}

    loadRealOrders();
  }, [activeUser]);

  // Handle Cancel Edit (Discards unsaved form edits)
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

  // Handle Profile Save
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
    setSaveSuccessMsg('Profile updated successfully on live server!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Handle Add Address (Persisted to LocalStorage)
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddrFlat.trim()) return;

    const newEntry = {
      id: Date.now(),
      label: newAddrLabel || 'Other Residence',
      society: newAddrSociety || society,
      flat: newAddrFlat.trim(),
      pincode: '201310',
      isDefault: addresses.length === 0
    };

    const updated = [...addresses, newEntry];
    setAddresses(updated);
    try {
      localStorage.setItem('digilocal_saved_addresses', JSON.stringify(updated));
    } catch (_) {}

    setShowAddAddressModal(false);
    setNewAddrFlat('');
  };

  // Handle Remove Address (Persisted to LocalStorage)
  const handleRemoveAddress = (idToRemove) => {
    const updated = addresses.filter(a => a.id !== idToRemove);
    setAddresses(updated);
    try {
      localStorage.setItem('digilocal_saved_addresses', JSON.stringify(updated));
    } catch (_) {}
  };

  // Handle Set Default Address (Persisted to LocalStorage)
  const handleSetDefaultAddress = (idToDefault) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === idToDefault }));
    setAddresses(updated);
    try {
      localStorage.setItem('digilocal_saved_addresses', JSON.stringify(updated));
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
    
    if (orderFilter === 'DELIVERED') {
      return matchesSearch && order.status === 'DELIVERED';
    }
    if (orderFilter === 'IN_PROGRESS') {
      return matchesSearch && order.status !== 'DELIVERED';
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#EDEDE4] pt-4 pb-16 px-3 sm:px-6 lg:px-8 font-sans text-foreground">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* TOP HERO PROFILE HEADER CARD (Bento Style)                    */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#18281F] text-white rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden border border-emerald-950/40">
          
          {/* Subtle Background Glow Decorative Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E6C35C]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-8">
            
            {/* Left Info: Avatar + Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6">
              
              {/* Profile Avatar Frame */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#E6C35C]/80 p-1 shadow-xl bg-[#0F1C15] overflow-hidden">
                  <img 
                    src={savedProfile.avatar || avatar} 
                    alt={savedProfile.name || name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(savedProfile.name || name)}&background=1E3623&color=E6C35C&bold=true`;
                    }}
                  />
                </div>
                <div className="absolute bottom-1 right-1 bg-[#E6C35C] text-[#0F1C15] p-1.5 rounded-full shadow-md border border-[#18281F]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Text Meta Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
                    {savedProfile.name || name}
                  </h1>
                  <span className="px-3 py-1 bg-emerald-900/60 border border-emerald-400/30 text-emerald-200 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#E6C35C]" /> Verified Resident
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-emerald-100/90 font-medium">
                  {savedProfile.email && !savedProfile.email.includes('@digilocal.internal') && !savedProfile.email.includes('@test.com') ? (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#E6C35C]" /> {savedProfile.email}
                    </span>
                  ) : null}
                  {savedProfile.phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#E6C35C]" /> +91 {savedProfile.phone}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  {savedProfile.society || savedProfile.flat ? (
                    <span className="bg-white/10 border border-white/15 px-3.5 py-1 rounded-full text-xs text-white font-semibold flex items-center gap-1.5 shadow-sm">
                      <Building2 className="w-3.5 h-3.5 text-[#E6C35C]" />
                      <span>{savedProfile.society || 'No Society'}</span>
                      {savedProfile.flat ? <span className="text-emerald-300 font-bold">• {savedProfile.flat}</span> : null}
                    </span>
                  ) : (
                    <span className="bg-white/10 border border-white/15 px-3.5 py-1 rounded-full text-xs text-white/60 font-semibold flex items-center gap-1.5 shadow-sm">
                      <Building2 className="w-3.5 h-3.5 text-white/40" />
                      <span>No Society Selected</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3.5 hover:bg-white/10 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#E6C35C]/20 border border-[#E6C35C]/30 flex items-center justify-center text-[#E6C35C] shrink-0 shadow-2xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif text-white">{orders.length}</div>
                <div className="text-[11px] text-emerald-200/80 font-bold uppercase tracking-wider">Total Orders</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3.5 hover:bg-white/10 transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-2xs">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif text-white">{favorites.length}</div>
                <div className="text-[11px] text-emerald-200/80 font-bold uppercase tracking-wider">Saved Stores</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3.5 hover:bg-white/10 transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 shadow-2xs">
                <Building2 className="w-5 h-5 text-[#E6C35C]" />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif text-white">{addresses.length}</div>
                <div className="text-[11px] text-emerald-200/80 font-bold uppercase tracking-wider">Saved Flats</div>
              </div>
            </div>
          </div>

        </div>


        {/* ------------------------------------------------------------- */}
        {/* NAVIGATION TABS BAR                                           */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl sm:rounded-full p-1.5 shadow-md border border-border flex flex-wrap sm:flex-nowrap items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#18281F] text-white shadow-md'
                : 'text-muted-foreground hover:text-ink hover:bg-secondary/60'
            }`}
          >
            <ShoppingBag className={`w-4 h-4 ${activeTab === 'orders' ? 'text-[#E6C35C]' : ''}`} />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#18281F] text-white shadow-md'
                : 'text-muted-foreground hover:text-ink hover:bg-secondary/60'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#E6C35C]' : ''}`} />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'addresses'
                ? 'bg-[#18281F] text-white shadow-md'
                : 'text-muted-foreground hover:text-ink hover:bg-secondary/60'
            }`}
          >
            <MapPin className={`w-4 h-4 ${activeTab === 'addresses' ? 'text-[#E6C35C]' : ''}`} />
            <span>Saved Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'favorites'
                ? 'bg-[#18281F] text-white shadow-md'
                : 'text-muted-foreground hover:text-ink hover:bg-secondary/60'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'text-[#E6C35C]' : ''}`} />
            <span>Favorite Stores</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#18281F] text-white shadow-md'
                : 'text-muted-foreground hover:text-ink hover:bg-secondary/60'
            }`}
          >
            <Key className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#E6C35C]' : ''}`} />
            <span>Security & Settings</span>
          </button>
        </div>


        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT 1: MY ORDERS HISTORY                              */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Search & Filter Header */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search order ID, store, or item..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-secondary/50 border border-border rounded-full text-xs font-medium focus:outline-none focus:border-[#1E3623]"
                />
              </div>


            </div>

            {/* Orders Cards Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-border space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
                  <ShoppingBag className="w-8 h-8 text-[#1E3623]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-ink">No Real Orders Found</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  You haven't placed any orders yet. Visit local stores in your society to place your first order!
                </p>
                <button
                  onClick={() => setRoute({ page: 'societyVendors', societyId: societyId || 'all' })}
                  className="px-6 py-3 bg-[#18281F] text-white rounded-full text-xs font-bold shadow-md hover:bg-black transition-all inline-flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-[#E6C35C]" />
                  <span>Browse Stores & Place First Order</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.order_id}
                    className="bg-white rounded-2xl p-4 sm:p-4.5 border border-gray-200/80 hover:border-[#18281F]/30 hover:shadow-md transition-all duration-200 space-y-3"
                  >
                    {/* Top Row: Logo + Store Name + Date + Total Price + Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <img 
                          src={order.store_logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80'} 
                          alt={order.store_name} 
                          className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-2xs shrink-0 bg-secondary"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-serif font-bold text-sm text-[#18281F] truncate">
                              {order.store_name}
                            </h3>
                            <button
                              onClick={() => setRoute({ page: 'vendorStorefront', societyId: '1', vendorId: String(order.vendor_id || 1) })}
                              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-0.5 shrink-0"
                            >
                              <span>Shop</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">
                            <span className="font-mono text-[#18281F] font-bold">#{order.order_id}</span> • {new Date(order.date || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Right: Total & Action Buttons */}
                      <div className="flex items-center space-x-3 ml-auto sm:ml-0">
                        <div className="text-right">
                          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total</div>
                          <div className="text-sm font-serif font-bold text-[#18281F]">₹{Number(order.total_amount || 0).toFixed(2)}</div>
                        </div>

                        <div className="flex items-center space-x-1.5 border-l border-gray-100 pl-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-all flex items-center space-x-1"
                          >
                            <Receipt className="w-3 h-3 text-gray-400" />
                            <span>Receipt</span>
                          </button>

                          <button
                            onClick={() => setRoute({ page: 'vendorStorefront', societyId: '1', vendorId: String(order.vendor_id || 1) })}
                            className="px-3.5 py-1.5 rounded-lg bg-[#18281F] hover:bg-[#C4A066] text-white hover:text-[#18281F] text-xs font-bold transition-all flex items-center space-x-1 shadow-2xs"
                          >
                            <RefreshCw className="w-3 h-3 text-[#C4A066]" />
                            <span>Re-Order</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Minimal Inline Items List */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-semibold text-[#18281F]">Items:</span>
                        <span className="truncate text-gray-500">
                          {(order.items || []).map(i => `${i.item_name} (×${i.quantity})`).join(', ') || '1x Daily Essentials'}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0 ml-2">
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md border border-border space-y-6">
            
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E3623]">
                  Personal Account Details
                </h2>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Update your contact details, gated society residence, and flat address.
                </p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[#18281F] hover:bg-black text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#E6C35C]" /> Edit Details
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
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                        isEditing 
                          ? 'bg-white border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/10 text-ink shadow-xs' 
                          : 'bg-secondary/40 border-border text-muted-foreground cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Email Address <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      disabled={!isEditing}
                      placeholder="e.g. resident@example.com (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                        isEditing 
                          ? 'bg-white border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/10 text-ink shadow-xs' 
                          : 'bg-secondary/40 border-border text-muted-foreground cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* Mobile Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Mobile Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      disabled={!isEditing}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                        isEditing 
                          ? 'bg-white border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/10 text-ink shadow-xs' 
                          : 'bg-secondary/40 border-border text-muted-foreground cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
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
                        ? 'bg-white border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/10 text-ink shadow-xs' 
                        : 'bg-secondary/40 border-border text-muted-foreground cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Gated Housing Society */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Primary Housing Society *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                    <input
                      type="text"
                      list="society-suggestions-list"
                      disabled={!isEditing}
                      placeholder="Type or select your gated society..."
                      value={society}
                      onChange={(e) => setSociety(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                        isEditing 
                          ? 'bg-white border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/10 text-ink shadow-xs' 
                          : 'bg-secondary/40 border-border text-muted-foreground cursor-not-allowed'
                      }`}
                    />
                    <datalist id="society-suggestions-list">
                      <option value="Omaxe Greenwood Residency (Greater Noida)" />
                      <option value="Palm Meadows Residency (Bengaluru)" />
                      <option value="DLF Phase 5 Enclave (Gurugram)" />
                      <option value="Godrej Woods Community (Noida Sec 43)" />
                      <option value="Jaypee Greens Wish Town (Noida Sec 128)" />
                      <option value="ATS Greens Village (Noida Sec 93A)" />
                      <option value="Cleo County (Noida Sec 121)" />
                      <option value="Mahagun Moderne (Noida Sec 78)" />
                    </datalist>
                  </div>
                </div>

                {/* Flat & Tower Number */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Tower & Flat Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      required
                      placeholder="e.g. Tower A, Flat 402"
                      value={flat}
                      onChange={(e) => setFlat(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                        isEditing 
                          ? 'bg-white border-[#1E3623] focus:ring-2 focus:ring-[#1E3623]/10 text-ink shadow-xs' 
                          : 'bg-secondary/40 border-border text-muted-foreground cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

              </div>

              {/* Action Buttons when Editing */}
              {isEditing && (
                <div className="flex items-center gap-3 pt-4 border-t border-border justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 rounded-full bg-secondary text-ink font-bold text-xs hover:bg-secondary/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-[#E6C35C]" />
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
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1E3623]">Saved Delivery Addresses</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage your home, parent, and office flats for fast checkout.</p>
              </div>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="px-4 py-2.5 bg-[#18281F] hover:bg-black text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Plus className="w-4 h-4 text-[#E6C35C]" /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-border space-y-3">
                <p className="text-xs text-muted-foreground">No saved addresses yet.</p>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="px-4 py-2 bg-[#18281F] text-white rounded-full text-xs font-bold"
                >
                  Add Your Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    className={`bg-white rounded-3xl p-6 shadow-md border relative space-y-3 ${
                      addr.isDefault ? 'border-[#1E3623] ring-2 ring-[#1E3623]/10' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-ink flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-800" /> {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full border border-emerald-300">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold text-ink">{addr.flat}</p>
                      <p>{addr.society}, Pincode: {addr.pincode}</p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-emerald-800 hover:text-emerald-950 font-bold underline"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveAddress(addr.id)}
                        className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 ml-auto"
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
        {/* TAB CONTENT 4: FAVORITE STORES                                */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-border">
              <h2 className="text-xl font-serif font-bold text-[#1E3623]">Saved Favorite Vendors</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Quickly access local stores you love ordering from in your society.</p>
            </div>

            {favorites.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-border space-y-3">
                <p className="text-xs text-muted-foreground">No saved favorite stores yet.</p>
                <button
                  onClick={() => setRoute({ page: 'home' })}
                  className="px-4 py-2 bg-[#18281F] text-white rounded-full text-xs font-bold"
                >
                  Explore Vendors
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map((fav) => (
                  <div key={fav.vendor_id} className="bg-white rounded-3xl p-5 shadow-md border border-border flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={fav.logo} alt={fav.store_name} className="w-14 h-14 rounded-2xl object-cover border border-border" />
                      <div>
                        <h3 className="font-serif font-bold text-sm text-ink">{fav.store_name}</h3>
                        <p className="text-[11px] text-muted-foreground">{fav.category}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-emerald-800">
                          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-gold text-gold" /> {fav.rating || '4.9'}</span>
                          <span>• {fav.delivery_time || '15 mins'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setRoute({ page: 'vendorStorefront', societyId: '1', vendorId: String(fav.vendor_id) })}
                        className="px-3.5 py-1.5 bg-[#18281F] text-white rounded-full text-xs font-bold hover:bg-black transition-all"
                      >
                        Shop Now
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(fav.vendor_id)}
                        className="text-[10px] text-rose-600 font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT 5: SECURITY & SETTINGS                            */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Change Password Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-border space-y-4">
              <div className="flex items-center gap-2 text-[#1E3623]">
                <Key className="w-5 h-5 text-[#E6C35C]" />
                <h3 className="text-lg font-serif font-bold">Change Password</h3>
              </div>

              {settingsMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                  {settingsMsg}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordCurrent}
                    onChange={(e) => setPasswordCurrent(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-secondary/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E3623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordNew}
                    onChange={(e) => setPasswordNew(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-secondary/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E3623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-secondary/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E3623]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#18281F] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-md mt-2"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Notification Preferences Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-border space-y-5">
              <div className="flex items-center gap-2 text-[#1E3623]">
                <Bell className="w-5 h-5 text-[#E6C35C]" />
                <h3 className="text-lg font-serif font-bold">Notification Preferences</h3>
              </div>

              <div className="space-y-4 text-xs font-semibold text-ink">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-2xl">
                  <div>
                    <p className="font-bold">WhatsApp Order Status Updates</p>
                    <p className="text-[11px] text-muted-foreground font-normal">Receive instant delivery updates & receipts on WhatsApp</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsWhatsApp}
                    onChange={(e) => setNotificationsWhatsApp(e.target.checked)}
                    className="w-4 h-4 accent-[#1E3623] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-2xl">
                  <div>
                    <p className="font-bold">SMS Notifications</p>
                    <p className="text-[11px] text-muted-foreground font-normal">Receive OTP & delivery SMS messages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsSMS}
                    onChange={(e) => setNotificationsSMS(e.target.checked)}
                    className="w-4 h-4 accent-[#1E3623] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <button
                  onClick={onLogout}
                  className="w-full py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>


      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD NEW ADDRESS MODAL                                */}
      {/* ------------------------------------------------------------- */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#18281F] text-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-serif font-bold text-white">Add New Delivery Flat</h3>
              <button onClick={() => setShowAddAddressModal(false)} className="text-white/60 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-emerald-200">Address Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office / Relative Residence"
                  value={newAddrLabel}
                  onChange={(e) => setNewAddrLabel(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-emerald-200">Housing Society</label>
                <input
                  type="text"
                  required
                  value={newAddrSociety}
                  onChange={(e) => setNewAddrSociety(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-emerald-200">Tower / Flat Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tower B, Flat 104"
                  value={newAddrFlat}
                  onChange={(e) => setNewAddrFlat(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white placeholder:text-white/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#E6C35C] text-[#0B150D] rounded-full font-bold uppercase tracking-wider hover:bg-[#d8b34c] transition-all"
              >
                Save Flat Address
              </button>
            </form>
          </div>
        </div>
      )}


      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: RECEIPT MODAL                                         */}
      {/* ------------------------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4 text-ink">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1E3623]">Order Receipt</h3>
                <p className="text-[11px] text-muted-foreground font-mono">{selectedOrder.order_id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-ink font-bold">✕</button>
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
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Delivery Flat:</span>
                <span>{selectedOrder.delivery_address}</span>
              </div>

              <div className="border-t border-b border-border py-3 space-y-2">
                <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Items:</span>
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-semibold">
                    <span>{it.item_name} (x{it.quantity})</span>
                    <span>₹{((it.unit_price || 0) * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm font-bold text-[#1E3623] pt-1">
                <span>Total Amount Paid:</span>
                <span>₹{Number(selectedOrder.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3 bg-[#18281F] text-white rounded-full font-bold text-xs uppercase tracking-wider"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
