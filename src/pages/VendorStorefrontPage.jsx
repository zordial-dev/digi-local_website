import React, { useState, useEffect } from 'react';
import { api, getNormalizedImageUrl, getStoreTimeStatus } from '../services/api';
import { ArrowLeft, ShoppingBag, Plus, Minus, X, Check, Search, ShieldCheck, Phone, AlertTriangle, FileText, MessageSquare, HelpCircle, Send, Home, MapPin, Edit3, CreditCard, Lock, User, Building2, LogIn, Clock } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import DummyPaymentModal from '../components/DummyPaymentModal';
import LiveOrderTrackerToast from '../components/LiveOrderTrackerToast';
import LoginModal from '../components/LoginModal';
import { ProductCardSkeleton } from '../components/Skeletons';

export default function VendorStorefrontPage({ societyId, vendorId, setRoute, onOpenLoginModal }) {
  const [vendorData, setVendorData] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Flat & Tower Location Entry State (Always re-asks on entering any cafe)
  const [flatNumber, setFlatNumber] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [tempFlatInput, setTempFlatInput] = useState('');
  const [tempBuildingInput, setTempBuildingInput] = useState('');
  const [locationError, setLocationError] = useState('');

  // Cart State
  const [cart, setCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [orderRemark, setOrderRemark] = useState('');
  
  // Modals & Tracking
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Auth Guard Helper: Check if user is logged in
  const checkResidentAuth = () => {
    try {
      const resSession = localStorage.getItem('digilocal_resident_session');
      const venSession = localStorage.getItem('digilocal_vendor_session');
      if (resSession || venSession) {
        return true;
      }
    } catch (_) {}
    return false;
  };

  const handleCheckoutOnline = () => {
    if (!checkResidentAuth()) {
      setModalConfig({
        isOpen: true,
        title: '🔒 Login Required to Place Order',
        message: 'You cannot place an order without signing in or registering your mobile number. Please log in to proceed.',
        type: 'warning'
      });
      setIsLoginModalOpen(true);
      return;
    }
    setShowPaymentModal(true);
  };

  useEffect(() => {
    loadStorefront();
    
    // Always reset flat/building number & prompt location entry modal on entering cafe
    setFlatNumber('');
    setBuildingNumber('');
    setTempFlatInput('');
    setTempBuildingInput('');
    setShowLocationModal(true);
  }, [vendorId]);

  const loadStorefront = async () => {
    try {
      setLoading(true);
      const data = await api.getVendorStorefront(vendorId);
      setVendorData(data.vendor);
      setItems(data.items || []);
      setCategories(['All', ...(data.categories || [])]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    setLocationError('');
    const cleanFlat = tempFlatInput.trim();

    if (!cleanFlat) {
      setLocationError('Please enter your flat / room number for this store.');
      return;
    }

    setFlatNumber(cleanFlat);
    setShowLocationModal(false);
  };

  const handleOpenChangeLocation = () => {
    setTempFlatInput(flatNumber);
    setShowLocationModal(true);
  };

  const addToCart = (item) => {
    if (item.is_available === false) return;
    if (!flatNumber) {
      handleOpenChangeLocation();
      return;
    }
    setCart((prev) => {
      const existing = prev.find(i => i.item_id === item.item_id);
      if (existing) {
        return prev.map(i => i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, specialInstructions: '' }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) => {
      return prev.map(i => {
        if (i.item_id === itemId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const updateInstructions = (itemId, text) => {
    setCart((prev) => prev.map(i => i.item_id === itemId ? { ...i, specialInstructions: text } : i));
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = items.filter(item => {
    if (!item) return false;
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const itemName = String(item.item_name || item.name || '');
    const itemDesc = String(item.description || '');
    const q = (search || '').toLowerCase().trim();
    const matchesSearch = !q || itemName.toLowerCase().includes(q) || itemDesc.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  }).reduce((acc, current) => {
    if (!current) return acc;
    const nameKey = String(current.item_name || current.name || '').trim().toLowerCase();
    const idKey = String(current.item_id || current.id || '');
    const isDuplicate = acc.some(item => 
      (nameKey && String(item.item_name || item.name || '').trim().toLowerCase() === nameKey) ||
      (idKey && String(item.item_id || item.id || '') === idKey)
    );
    if (!isDuplicate) acc.push(current);
    return acc;
  }, []);

  // Save Order Helper for User Profile Order History & Vendor Dashboard
  const saveOrderToUserProfile = (orderId, totalAmount, itemsList, isWhatsApp = false, txnDetails = null) => {
    let currentUser = null;
    try {
      const keys = ['digilocal_user_session', 'digilocal_resident_session', 'user_profile', 'resident_profile', 'digilocal_user', 'digilocal_resident'];
      for (const k of keys) {
        const uStr = localStorage.getItem(k);
        if (uStr) {
          const parsed = JSON.parse(uStr);
          const u = parsed.user || parsed.resident || parsed;
          if (u && (u.name || u.phone || u.mobile || u.full_name)) {
            currentUser = u;
            break;
          }
        }
      }
    } catch (_) {}

    const storeNameStr = vendorData?.store_name || 'Community Store';
    const societyNameStr = vendorData?.society_name || vendorData?.location || currentUser?.society_name || currentUser?.society || 'Anupam Apartment';
    const targetVendorId = vendorData?.vendor_id || vendorId || 1;

    const resName = currentUser?.name || currentUser?.full_name || currentUser?.owner_name || (flatNumber ? `Resident (Flat ${flatNumber})` : 'Resident Customer');
    const resPhone = currentUser?.phone || currentUser?.mobile || currentUser?.phone_number || currentUser?.user_phone || '+919784319840';

    const orderRecord = {
      order_id: orderId || `ORD-${Date.now().toString().slice(-6)}`,
      user_id: currentUser?.user_id || currentUser?.id || `usr_${resPhone.replace(/[^0-9]/g, '')}`,
      customer_name: resName,
      user_name: resName,
      name: resName,
      phone: resPhone,
      user_phone: resPhone,
      phone_number: resPhone,
      vendor_id: targetVendorId,
      store_name: storeNameStr,
      store_logo: vendorData?.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80',
      society_name: societyNameStr,
      date: new Date().toISOString(),
      order_timestamp: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: 'PLACED',
      status_label: isWhatsApp ? 'WhatsApp Order Placed' : 'Order Paid & Out for Delivery',
      payment_status: isWhatsApp ? 'PENDING_COD' : 'PAID',
      payment_method: txnDetails?.paymentMethod || (isWhatsApp ? 'COD / WhatsApp' : 'UPI Payment'),
      total_amount: totalAmount,
      address: `Flat ${flatNumber} (${buildingNumber || 'Block A'}), ${societyNameStr}`,
      delivery_address: `Flat ${flatNumber} (${buildingNumber || 'Block A'}), ${societyNameStr}`,
      items: itemsList.map(c => ({
        item_id: c.item_id || c.id,
        item_name: c.item_name || c.name,
        name: c.item_name || c.name,
        quantity: c.quantity || 1,
        unit_price: parseFloat(c.price || 0),
        price: parseFloat(c.price || 0),
        item_total: parseFloat(c.price || 0) * (c.quantity || 1)
      }))
    };

    try {
      localStorage.setItem('digilocal_active_order', JSON.stringify(orderRecord));
      const userOrdersStr = localStorage.getItem('digilocal_user_orders');
      let userOrdersList = userOrdersStr ? JSON.parse(userOrdersStr) : [];
      if (!Array.isArray(userOrdersList)) userOrdersList = [];
      userOrdersList = [orderRecord, ...userOrdersList.filter(o => o && String(o.order_id) !== String(orderRecord.order_id))];
      localStorage.setItem('digilocal_user_orders', JSON.stringify(userOrdersList));

      // Save to vendor specific orders list (both numeric and string keys)
      const vKey1 = `digilocal_vendor_orders_${targetVendorId}`;
      const vKey2 = `digilocal_vendor_orders_${String(targetVendorId)}`;
      [vKey1, vKey2].forEach(vk => {
        try {
          const vOrdersStr = localStorage.getItem(vk);
          let vOrdersList = vOrdersStr ? JSON.parse(vOrdersStr) : [];
          if (!Array.isArray(vOrdersList)) vOrdersList = [];
          vOrdersList = [orderRecord, ...vOrdersList.filter(o => o && String(o.order_id) !== String(orderRecord.order_id))];
          localStorage.setItem(vk, JSON.stringify(vOrdersList));
        } catch (_) {}
      });

      // Global vendor orders list fallback
      const globalOrdersKey = 'digilocal_all_vendor_orders';
      const gOrdersStr = localStorage.getItem(globalOrdersKey);
      let gOrdersList = gOrdersStr ? JSON.parse(gOrdersStr) : [];
      if (!Array.isArray(gOrdersList)) gOrdersList = [];
      gOrdersList = [orderRecord, ...gOrdersList.filter(o => o && String(o.order_id) !== String(orderRecord.order_id))];
      localStorage.setItem(globalOrdersKey, JSON.stringify(gOrdersList));

      // Auto-decrement item stock in vendor catalog
      api.decrementVendorItemStock(targetVendorId, itemsList);
    } catch (err) {
      console.warn('Failed to save order to localStorage:', err);
    }

    setActiveOrder(orderRecord);
    return orderRecord;
  };

  // WHATSAPP ORDERING TRIGGER
  const handlePlaceOrderWhatsApp = async () => {
    if (!checkResidentAuth()) {
      setModalConfig({
        isOpen: true,
        title: '🔒 Login Required to Place Order',
        message: 'You cannot place an order without signing in or registering your mobile number. Please log in to proceed.',
        type: 'warning'
      });
      setIsLoginModalOpen(true);
      return;
    }

    if (!flatNumber) {
      handleOpenChangeLocation();
      return;
    }
    if (cart.length === 0) return;

    try {
      setPlacingOrder(true);
      const targetPhone = vendorData?.phone_number || '8005625999';
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : (cleanPhone || '918005625999');

      const storeName = vendorData?.store_name || 'DigiLocal Store';
      const societyName = vendorData?.society_name || vendorData?.location || currentUser?.society_name || currentUser?.society || 'Anupam Apartment';
      const gstNumber = vendorData?.gst_number || '';

      let msg = `🛎️ *New Order from Flat ${flatNumber}* - ${storeName}\n`;
      msg += `--------------------------------------\n`;
      msg += `📍 *Society:* ${societyName}\n`;
      msg += `🏢 *Flat/Room:* Flat ${flatNumber}\n`;
      msg += `⏰ *Time:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
      msg += `--------------------------------------\n\n`;
      msg += `📋 *Items Ordered:*\n`;

      cart.forEach((item) => {
        msg += `* ${item.quantity}x ${item.item_name} (₹${parseFloat(item.price).toFixed(2)} each)\n`;
        if (item.specialInstructions && item.specialInstructions.trim()) {
          msg += `  ↳ _Note: ${item.specialInstructions.trim()}_\n`;
        }
      });

      if (orderRemark && orderRemark.trim()) {
        msg += `\n📝 *Order Remark:* ${orderRemark.trim()}\n`;
      }

      msg += `\n--------------------------------------\n`;
      msg += `💵 *Total Bill Amount:* ₹${subtotal.toFixed(2)}\n`;
      if (gstNumber) {
        msg += `📄 *Vendor GSTIN:* ${gstNumber}\n`;
      }
      msg += `--------------------------------------\n\n`;
      msg += `Please confirm preparation and delivery to my flat. Thank you!`;

      let currentUser = null;
      try {
        const uStr = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session') || localStorage.getItem('user_profile');
        if (uStr) {
          const parsed = JSON.parse(uStr);
          currentUser = parsed.user || parsed.resident || parsed;
        }
      } catch (_) {}

      const resName = currentUser?.name || currentUser?.full_name || currentUser?.owner_name || `Flat ${flatNumber}`;
      const resPhone = currentUser?.phone || currentUser?.mobile || currentUser?.phone_number || '+919784319840';

      const backendPayload = {
        vendor_id: vendorId,
        customer_name: resName,
        phone_number: resPhone,
        address: `Flat ${flatNumber} (${buildingNumber || 'Block A'}), ${societyName}`,
        items: cart.map(i => ({
          item_id: i.item_id,
          quantity: i.quantity,
          unit_price: i.price
        }))
      };

      const backendRes = await api.placeOrder(backendPayload);
      const savedOrder = saveOrderToUserProfile(backendRes?.order_id, subtotal, cart, true);
      setLastPlacedOrder({ order_id: savedOrder.order_id, total: subtotal });

      const encodedMsg = encodeURIComponent(msg);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');

      setShowCartDrawer(false);
      setShowConfirmModal(true);
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Order Launch Error',
        message: err.message || 'Could not place WhatsApp order. Please check your connection.',
        type: 'error'
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleConfirmOrderSentYes = () => {
    setShowConfirmModal(false);
    setCart([]);
    setOrderRemark('');
  };

  const handleConfirmOrderSentNo = () => {
    setShowConfirmModal(false);
    setShowCartDrawer(true);
  };

  if (!checkResidentAuth()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white rounded-[2.2rem] p-7 sm:p-8 shadow-2xl border border-[#E8E2D5] text-center space-y-5 animate-in zoom-in-95 duration-200">
          
          {/* Top Right Close Button */}
          <button
            onClick={() => setRoute({ page: 'societyVendors', societyId: societyId || 'all' })}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFE6] text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5 text-gray-500" />
          </button>

          {/* Center Gold Building Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#FFFBF0] border border-[#F5E6C4] flex items-center justify-center mx-auto text-[#C4A066] shadow-xs">
            <Building2 className="w-8 h-8 text-[#C4A066]" />
          </div>

          {/* Pill Badge & Title */}
          <div className="space-y-2">
            <span className="inline-block px-4 py-1 rounded-full bg-[#FFF5E5] text-[#C47D14] border border-[#FFE3B5] text-[11px] font-extrabold uppercase tracking-widest">
              LOGIN REQUIRED
            </span>

            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#18281F] leading-tight">
              Explore {vendorData?.store_name || 'Community Store'}
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed max-w-xs mx-auto pt-1">
              Please log in to your account to view approved local stores, products, and daily essentials for {vendorData?.store_name || 'this storefront'}.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setRoute({
                page: 'login',
                accountType: 'resident',
                redirectVendorId: vendorId,
                redirectSocietyId: societyId
              })}
              className="w-full sm:w-1/2 py-3.5 px-5 rounded-full bg-[#18281F] hover:bg-[#233A2E] text-white font-extrabold text-xs shadow-md tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#C4A066]" />
              <span>LOG IN NOW</span>
            </button>

            <button
              onClick={() => setRoute({ page: 'register' })}
              className="w-full sm:w-1/2 py-3.5 px-5 rounded-full bg-[#F5EFE0] hover:bg-[#EBE2CC] text-[#18281F] font-extrabold text-xs border border-[#E3D9C3] tracking-wider uppercase transition-all flex items-center justify-center cursor-pointer"
            >
              <span>REGISTER</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 px-3 sm:px-6">
      
      {/* Store Header Banner */}
      <div className="max-w-7xl mx-auto pt-4 pb-6">
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <button
              onClick={() => setRoute({ page: 'societyVendors', societyId })}
              className="inline-flex items-center space-x-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gold" />
              <span>Back to Society Vendors</span>
            </button>

            {/* Flat Delivery Badge (Per Cafe Visit) */}
            {flatNumber ? (
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-secondary border border-border shadow-sm self-start sm:self-auto">
                <Home className="w-4 h-4 text-gold" />
                <span className="text-xs font-bold text-ink">
                  Delivering to: <strong className="text-primary font-bold">Flat {flatNumber} ({buildingNumber || 'Tower A'})</strong>
                </span>
                <button
                  onClick={handleOpenChangeLocation}
                  className="text-[11px] font-bold text-ink underline hover:text-primary ml-2"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={handleOpenChangeLocation}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm flex items-center space-x-2 uppercase tracking-wider"
              >
                <Home className="w-4 h-4 text-gold" />
                <span>Enter Flat & Tower Number</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="h-28 rounded-2xl bg-secondary/40 animate-pulse" />
          ) : vendorData && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-5">
                <img
                  src={getNormalizedImageUrl(vendorData.logo || vendorData.image_url) || 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&auto=format&fit=crop&q=80'}
                  alt={vendorData.store_name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&auto=format&fit=crop&q=80';
                  }}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-border bg-secondary shadow-sm"
                />
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-primary mb-1 flex-wrap gap-2">
                    <div className="flex items-center space-x-1">
                      <ShieldCheck className="w-4 h-4 text-gold" />
                      <span>Verified Store • {vendorData.society_name}</span>
                    </div>
                    {(() => {
                      const timeStatus = getStoreTimeStatus(vendorData);
                      return (
                        <span className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold flex items-center space-x-1 border shadow-2xs ${
                          timeStatus.badgeType === 'closed'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : timeStatus.badgeType === 'closing_soon'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}>
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{timeStatus.statusText}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <h1 className="text-3xl font-serif font-black text-ink uppercase tracking-wide">
                    {vendorData.store_name}
                  </h1>
                  {vendorData.description && vendorData.description.trim() && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl font-medium">
                      {vendorData.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-3 font-medium">
                    {checkResidentAuth() ? (
                      <>
                        <span className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-gold" />
                          <span>{vendorData.phone_number || 'Contact Available'}</span>
                        </span>
                        {vendorData.gst_number && vendorData.gst_number.trim() && (
                          <span className="px-3 py-1 rounded-full bg-secondary border border-border text-ink font-bold flex items-center space-x-1.5 shadow-sm text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-gold" />
                            <span>GSTIN:</span>
                            <span className="font-mono">{vendorData.gst_number}</span>
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
                        <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Contact details & GSTIN hidden • Sign in to view vendor details</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {cartItemCount > 0 && (
                <button
                  onClick={() => setShowCartDrawer(true)}
                  className="px-6 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold shadow-md flex items-center justify-center space-x-3 transition-all tracking-wider uppercase text-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-gold" />
                  <span>View Cart ({cartItemCount}) • ₹{subtotal.toFixed(2)}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Navigation Pills & Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-card border border-border p-4 rounded-[2rem] shadow-sm">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-muted-foreground hover:text-ink border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <ProductCardSkeleton count={6} />
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-[2.5rem] border border-border p-8 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gold mx-auto mb-3" />
          <h3 className="text-base font-bold text-ink mb-1">No items found</h3>
          <p className="text-muted-foreground text-xs font-medium">Try selecting a different category or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const timeStatus = getStoreTimeStatus(vendorData);
            const isStoreClosed = !timeStatus.isOpen;
            const inCart = cart.find(c => c.item_id === item.item_id);
            const isAvailable = isStoreClosed ? false : (item.is_available !== undefined ? Boolean(item.is_available) : true);

            return (
              <div
                key={item.item_id}
                className={`rounded-[2rem] overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-sm bento-card ${
                  isStoreClosed
                    ? 'border border-rose-200/80 bg-rose-50/20 opacity-80'
                    : !isAvailable
                    ? 'border border-amber-200/80 bg-amber-50/20 opacity-80'
                    : 'border border-emerald-200/70 hover:border-emerald-500/60 hover:shadow-md bg-white'
                }`}
              >
                <div className="p-5">
                  <div className="relative mb-4 rounded-2xl overflow-hidden bg-secondary h-44">
                    <img
                      src={getNormalizedImageUrl(item)}
                      alt={item.item_name}
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute top-3 left-3">
                      {isAvailable ? (
                        <span className="px-3 py-1 text-[10px] font-extrabold bg-emerald-600 text-white rounded-full shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3 text-white" />
                          In Stock ({item.unit})
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-[10px] font-extrabold bg-amber-600 text-white rounded-full shadow-sm flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 text-[10px] font-bold bg-card/90 text-ink border border-border rounded-full shadow-sm">
                        {item.category || 'General'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-serif font-extrabold text-ink mb-1">{item.item_name}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-2 mb-3 leading-relaxed font-medium">
                    {item.description || 'Fresh quality item.'}
                  </p>
                </div>

                <div className="p-4 bg-secondary/50 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-emerald-800">₹{parseFloat(item.price).toFixed(2)}</span>
                    <span className="text-[11px] text-muted-foreground ml-1 font-medium">/ {item.unit}</span>
                  </div>

                  {isStoreClosed ? (
                    <span className="text-[11px] font-bold text-rose-700 px-3.5 py-1.5 rounded-full bg-rose-100 border border-rose-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-rose-600" />
                      Store Closed
                    </span>
                  ) : !isAvailable ? (
                    <span className="text-[11px] font-bold text-amber-800 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300">
                      Out of Stock
                    </span>
                  ) : inCart ? (
                    <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-300 rounded-full p-1 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.item_id, -1)}
                        className="w-7 h-7 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-950 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-extrabold text-emerald-950 px-2">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.item_id, 1)}
                        className="w-7 h-7 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="px-5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all uppercase tracking-wider text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && !showCartDrawer && (
        <div className="fixed bottom-6 inset-x-4 max-w-lg mx-auto z-40">
          <div className="bg-primary text-primary-foreground p-4 rounded-[2rem] border border-primary/40 shadow-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-gold text-ink flex items-center justify-center font-extrabold text-xs">
                {cartItemCount}
              </div>
              <div>
                <p className="text-[10px] text-gold font-extrabold uppercase tracking-wider">Total Bill</p>
                <p className="text-lg font-extrabold text-primary-foreground">₹{subtotal.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              className="px-5 py-3 rounded-full bg-gold hover:bg-gold/90 text-ink font-extrabold text-xs shadow-md flex items-center space-x-2 uppercase tracking-wider"
            >
              <span>Review & Order via WhatsApp</span>
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* LOCATION ENTRY MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            
            {/* Top Right Close / Cross (X) Button - Navigates back to previous page */}
            <button
              type="button"
              onClick={() => {
                setShowLocationModal(false);
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  setRoute({ page: 'societyVendors', societyId: societyId || 'all' });
                }
              }}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-secondary hover:bg-border text-muted-foreground hover:text-ink flex items-center justify-center border border-border transition-colors cursor-pointer"
              title="Cancel and go back"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4 mt-2">
              <Home className="w-7 h-7 text-gold" />
            </div>

            <h2 className="text-2xl font-serif font-extrabold text-ink uppercase tracking-wide mb-1">
              Enter Room / Flat Number
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium">
              Welcome to <strong className="text-ink">{vendorData?.store_name || 'this Store'}</strong>! Please enter your room/flat number to order from this store.
            </p>

            {locationError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold mb-4">
                {locationError}
              </div>
            )}

            <form onSubmit={handleLocationSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-ink uppercase mb-1.5">Flat / Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 402, 101, 503"
                  value={tempFlatInput}
                  onChange={(e) => setTempFlatInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-ink text-sm font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md uppercase tracking-wider transition-all mt-2 cursor-pointer"
              >
                Confirm Location & Order
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Slide-out Shopping Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col justify-between shadow-2xl">
            {/* Header */}
            <div className="p-6 bg-secondary/50 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h3 className="text-base font-serif font-extrabold text-ink uppercase tracking-wider">Your Order Cart</h3>
              </div>
              <button onClick={() => setShowCartDrawer(false)} className="w-8 h-8 rounded-full bg-card text-muted-foreground hover:text-ink flex items-center justify-center border border-border">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {cart.map((item) => (
                <div key={item.item_id} className="p-4 rounded-2xl bg-background border border-border space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-ink text-xs">{item.item_name}</h4>
                      <p className="text-[11px] text-primary font-extrabold">₹{parseFloat(item.price).toFixed(2)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-1 bg-card border border-border rounded-full p-1">
                      <button onClick={() => updateQuantity(item.item_id, -1)} className="w-6 h-6 rounded-full bg-secondary text-ink font-bold flex items-center justify-center">-</button>
                      <span className="text-xs font-bold text-ink px-1.5">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.item_id, 1)} className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-secondary px-3 py-2 rounded-xl border border-border/60">
                    <MessageSquare className="w-3.5 h-3.5 text-gold" />
                    <input
                      type="text"
                      placeholder="Special instruction (e.g. deliver fresh, pack separately)"
                      value={item.specialInstructions || ''}
                      onChange={(e) => updateInstructions(item.item_id, e.target.value)}
                      className="w-full text-[11px] bg-transparent text-ink placeholder-muted-foreground focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              {/* Delivery Location Summary in Cart */}
              <div className="p-4 bg-background border border-border rounded-2xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center border-b border-border/60 pb-2">
                  <h4 className="text-xs font-serif font-bold text-ink uppercase tracking-wider">Delivery Location</h4>
                  <button
                    onClick={() => { setShowCartDrawer(false); handleOpenChangeLocation(); }}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Change Location
                  </button>
                </div>
                <p className="text-xs font-bold text-ink">Flat {flatNumber} ({buildingNumber || 'Tower A'})</p>
                <p className="text-[11px] text-muted-foreground">{vendorData?.society_name}</p>
              </div>

              {/* Order Remarks */}
              <div className="p-4 bg-background border border-border rounded-2xl space-y-1.5 shadow-sm">
                <label className="block text-[10px] font-bold text-ink uppercase">Order Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Deliver after 5 PM, leave with security if unavailable..."
                  value={orderRemark}
                  onChange={(e) => setOrderRemark(e.target.value)}
                  className="w-full p-3 rounded-xl bg-card border border-border text-xs text-ink focus:outline-none resize-none"
                />
              </div>

              {/* Bill Breakdown */}
              <div className="p-4 bg-background border border-border rounded-2xl space-y-2 text-xs text-muted-foreground font-medium shadow-sm">
                <h4 className="text-[11px] font-serif font-bold text-ink uppercase border-b border-border/60 pb-2 mb-2">Bill Summary</h4>
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Society Delivery</span><span className="text-primary font-bold">FREE</span></div>
                <div className="flex justify-between text-sm font-extrabold text-ink pt-2 border-t border-dashed border-border">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Order & Payment Buttons */}
            <div className="p-6 bg-secondary/50 border-t border-border space-y-2.5">
              <button
                onClick={handleCheckoutOnline}
                disabled={placingOrder}
                className="w-full py-3.5 rounded-full bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs shadow-md uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer border border-primary/20"
              >
                <CreditCard className="w-4 h-4 text-gold" />
                <span>Pay ₹{subtotal.toFixed(2)} Online (Dummy Sandbox)</span>
              </button>

              <button
                onClick={handlePlaceOrderWhatsApp}
                disabled={placingOrder}
                className="w-full py-3 rounded-full bg-background hover:bg-secondary text-ink border border-border font-bold text-xs shadow-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-gold" />
                <span>{placingOrder ? 'Preparing Order...' : 'Place Order via WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dummy Payment Modal */}
      <DummyPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={subtotal}
        title="DigiLocal Dummy Payment"
        description={`Order from ${vendorData?.store_name || 'Local Store'} (${vendorData?.society_name || 'Society'})`}
        onSuccess={async (txn) => {
          setShowPaymentModal(false);
          setShowCartDrawer(false);
          try {
            setPlacingOrder(true);
            let currentUser = null;
            try {
              const uStr = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session') || localStorage.getItem('user_profile');
              if (uStr) {
                const parsed = JSON.parse(uStr);
                currentUser = parsed.user || parsed.resident || parsed;
              }
            } catch (_) {}

            const resName = currentUser?.name || currentUser?.full_name || currentUser?.owner_name || `Flat ${flatNumber}`;
            const resPhone = currentUser?.phone || currentUser?.mobile || currentUser?.phone_number || '+919784319840';

            const payload = {
              vendor_id: vendorId,
              buyer_name: resName,
              customer_name: resName,
              buyer_phone: resPhone,
              phone_number: resPhone,
              flat_number: flatNumber,
              building_number: buildingNumber,
              order_remark: orderRemark,
              payment_method: txn.paymentMethod,
              transaction_id: txn.transactionId,
              items: cart.map(c => ({
                item_id: c.item_id,
                quantity: c.quantity,
                specialInstructions: c.specialInstructions || ''
              }))
            };

            const res = await api.placeOrder(payload);
            saveOrderToUserProfile(res?.order_id, subtotal, cart, false, txn);

            setCart([]);
            setOrderRemark('');
            setModalConfig({
              isOpen: true,
              title: 'Order Paid & Confirmed!',
              message: `Your payment of ₹${subtotal.toFixed(2)} (${txn.paymentMethod}) was processed successfully in test mode. Transaction Ref: ${txn.transactionId}. Your order is now live!`,
              type: 'success'
            });
          } catch (err) {
            setModalConfig({
              isOpen: true,
              title: 'Order Placement Error',
              message: err.message || 'Payment processed, but order logging failed.',
              type: 'error'
            });
          } finally {
            setPlacingOrder(false);
          }
        }}
      />

      {/* Order Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mb-3">
              <HelpCircle className="w-6 h-6 text-gold" />
            </div>

            <h3 className="text-base font-serif font-extrabold text-ink mb-1">Order Sent via WhatsApp?</h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed font-medium">
              Did you successfully send the generated order message in the WhatsApp chat to vendor staff?
            </p>

            <div className="w-full space-y-2">
              <button
                onClick={handleConfirmOrderSentYes}
                className="w-full py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                Yes, Order Sent on WhatsApp
              </button>
              <button
                onClick={handleConfirmOrderSentNo}
                className="w-full py-2.5 rounded-full bg-transparent border border-border text-muted-foreground hover:text-ink font-bold text-xs uppercase tracking-wider transition-colors"
              >
                No, Modify Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Website Notification Modal */}
      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

      {/* Login Portal Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        setRoute={setRoute}
      />

      {/* Live Order Tracker Widget */}
      <LiveOrderTrackerToast
        activeOrder={activeOrder}
        onClose={() => setActiveOrder(null)}
      />

    </div>
  );
}

